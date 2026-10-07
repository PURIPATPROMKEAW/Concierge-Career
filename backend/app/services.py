from fastapi import HTTPException
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
        "dataset_version": "2026.10-demo-v1",
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
    done = set(db.scalars(select(Progress.resource_id).where(Progress.profile_id == user_id)).all())
    resources = {r.skill_id: r for r in db.scalars(select(LearningResource)).all()}
    return [
        {
            **repo.columns(resources[g["skill_id"]]),
            "gap": g,
            "completed": resources[g["skill_id"]].id in done,
        }
        for g in result["gaps"]
        if g["skill_id"] in resources
    ]


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
        db.add(Progress(profile_id=p.id, resource_id=resource.id))
        p.revision += 1
        db.commit()
    after = analysis(db, payload.user_id, payload.career_id)
    return {
        "before": before,
        "after": after,
        "profile": repo.profile_dict(p),
        "already_completed": bool(already),
    }
