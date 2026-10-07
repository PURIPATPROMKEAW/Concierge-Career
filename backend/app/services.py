from fastapi import HTTPException
from datetime import datetime, timezone
from sqlalchemy import select
from . import repositories as repo
from .matching import analyze
from .models import Profile, ProfileAccess, Career, LearningResource, Progress, UserSkill
from .access import ownership_required, visitor_hash
from ai.providers import MockAIProvider

provider = MockAIProvider()


def require_profile(db, user_id):
    if ownership_required():
        owner = db.get(ProfileAccess, user_id)
        if not owner or owner.session_hash != visitor_hash.get():
            raise HTTPException(404, "Profile not found in this browser session.")
    p = db.get(Profile, user_id)
    if not p:
        raise HTTPException(404, "Profile not found. Create or load a demo profile first.")
    return p


def require_career(db, career_id):
    career = db.get(Career, career_id)
    if not career:
        raise HTTPException(404, "Career not found.")
    return career


def analysis(db, user_id, career_id):
    profile = repo.profile_dict(require_profile(db, user_id))
    career = require_career(db, career_id)
    result = analyze(profile, repo.all_jobs(db, career_id), repo.skill_catalog(db))
    return {
        **result,
        "career": repo.columns(career),
        "profile_revision": profile["revision"],
        "dataset_version": repo.seed_data()["version"],
        "insight": provider.explain(result, profile["name"]),
    }


def alternatives(db, user_id, career_id):
    profile = repo.profile_dict(require_profile(db, user_id))
    skills = repo.skill_catalog(db)
    rows = []
    for career in db.scalars(select(Career)).all():
        if career.id == career_id:
            continue
        result = analyze(profile, repo.all_jobs(db, career.id), skills)
        rows.append(
            {
                "career": repo.columns(career),
                "readiness": result["readiness"],
                "matched_skills": result["jobs"][0]["matched_skills"] if result["jobs"] else [],
                "jobs_analyzed": result["jobs_analyzed"],
            }
        )
    return sorted(rows, key=lambda c: (-c["readiness"], c["career"]["id"]))[:4]


def learning(db, user_id, career_id):
    result = analysis(db, user_id, career_id)
    done = {
        p.resource_id: p
        for p in db.scalars(select(Progress).where(Progress.profile_id == user_id)).all()
    }
    resources = {r.skill_id: r for r in db.scalars(select(LearningResource)).all()}
    recommended = [
        {
            **repo.columns(resources[g["skill_id"]]),
            "gap": g,
            "completed": False,
        }
        for g in result["gaps"]
        if g["skill_id"] in resources and resources[g["skill_id"]].id not in done
    ]
    completed = [
        {
            **repo.columns(r),
            "gap": None,
            "completed": True,
            "completed_at": done[r.id].completed_at,
            "summary": done[r.id].summary,
        }
        for r in resources.values()
        if r.id in done
    ]
    return recommended + sorted(completed, key=lambda r: r["completed_at"] or "", reverse=True)


def complete(db, payload):
    p = require_profile(db, payload.user_id)
    db.refresh(p, with_for_update=True)
    db.expire(p, ["skills"])
    resource = db.get(LearningResource, payload.resource_id)
    if not resource:
        raise HTTPException(404, "Learning resource not found.")
    before = analysis(db, payload.user_id, payload.career_id)
    already = db.get(Progress, (p.id, resource.id))
    if not already:
        skill = next((s for s in p.skills if s.skill_id == resource.skill_id), None)
        previous_level = skill.proficiency if skill else 0
        if skill:
            skill.proficiency = max(skill.proficiency, resource.outcome_level)
        else:
            p.skills.append(
                UserSkill(
                    skill_id=resource.skill_id,
                    proficiency=resource.outcome_level,
                    source="demo_learning",
                )
            )
        record = Progress(
            profile_id=p.id,
            resource_id=resource.id,
            completed_at=datetime.now(timezone.utc).isoformat(),
        )
        db.add(record)
        p.revision += 1
        db.flush()
        after = analysis(db, payload.user_id, payload.career_id)
        record.summary = {
            "career_id": payload.career_id,
            "career_name": before["career"]["name"],
            "before_readiness": before["readiness"],
            "after_readiness": after["readiness"],
            "before_best": before["jobs"][0]["score"] if before["jobs"] else 0,
            "after_best": after["jobs"][0]["score"] if after["jobs"] else 0,
            "previous_level": previous_level,
            "outcome_level": max(previous_level, resource.outcome_level),
        }
        db.commit()
    after = analysis(db, payload.user_id, payload.career_id)
    return {
        "before": before,
        "after": after,
        "profile": repo.profile_dict(p),
        "already_completed": bool(already),
    }
