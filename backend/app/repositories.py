import json
from pathlib import Path
from uuid import uuid4
from sqlalchemy import select
from .models import (
    Career,
    Occupation,
    Skill,
    Job,
    JobSkill,
    Profile,
    UserSkill,
    ProfileRecord,
    LearningResource,
)

SEED_PATH = Path(__file__).resolve().parents[2] / "database" / "seeds" / "demo.json"


def seed_data():
    return json.loads(SEED_PATH.read_text(encoding="utf-8"))


def seed(db):
    if db.scalar(select(Career.id).limit(1)):
        return
    data = seed_data()
    db.add_all([Career(**c) for c in data["careers"]])
    db.add_all([Skill(**s) for s in data["skills"]])
    db.flush()
    db.add_all(
        [
            Occupation(id="occ-" + c["id"], career_id=c["id"], name=c["name"], esco_id=None)
            for c in data["careers"]
        ]
    )
    db.flush()
    for raw in data["jobs"]:
        job = Job(**{k: v for k, v in raw.items() if k != "requirements"})
        job.requirements = [JobSkill(**r) for r in raw["requirements"]]
        db.add(job)
    db.add_all([LearningResource(**r) for r in data["resources"]])
    db.flush()
    save_profile(db, data["alex"], profile_id="demo-template")
    db.commit()


def columns(obj):
    return {c.name: getattr(obj, c.name) for c in obj.__table__.columns}


def job_dict(job):
    return {
        **columns(job),
        "requirements": [
            {k: v for k, v in columns(r).items() if k != "job_id"} for r in job.requirements
        ],
    }


def profile_dict(profile):
    value = columns(profile)
    value["skills"] = [
        {k: v for k, v in columns(s).items() if k != "profile_id"} for s in profile.skills
    ]
    for key in ["education", "experiences", "projects", "certifications"]:
        value[key] = [r.data for r in profile.records if r.kind == key]
    return value


def save_profile(db, data, profile_id=None):
    profile = db.get(Profile, profile_id) if profile_id else None
    if profile:
        profile.skills.clear()
        profile.records.clear()
        db.flush()
        profile.revision += 1
    else:
        profile = Profile(id=profile_id or str(uuid4()), revision=1)
        db.add(profile)
    for key in ["name", "university", "field", "degree", "graduation_year"]:
        setattr(profile, key, data[key])
    # Normalize duplicates to the strongest explicitly supplied level.
    merged = {}
    for s in data["skills"]:
        if s["skill_id"] not in merged or merged[s["skill_id"]]["proficiency"] < s["proficiency"]:
            merged[s["skill_id"]] = s
    profile.skills = [UserSkill(**s) for s in merged.values()]
    profile.records = [
        ProfileRecord(kind=key, data=r)
        for key in ["education", "experiences", "projects", "certifications"]
        for r in data[key]
    ]
    db.flush()
    return profile


def all_jobs(db, career_id=None):
    query = select(Job)
    if career_id:
        query = query.where(Job.career_id == career_id)
    return [job_dict(j) for j in db.scalars(query).all()]


def skill_catalog(db):
    return {s.id: columns(s) for s in db.scalars(select(Skill)).all()}
