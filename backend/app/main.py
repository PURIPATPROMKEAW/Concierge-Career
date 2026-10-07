import os
import json
from pathlib import Path
from alembic import command
from alembic.config import Config
from contextlib import asynccontextmanager
from fastapi import FastAPI, Depends, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import select, delete
from .core import engine, Session, get_db
from .models import Career, Job, SavedJob, Progress, ProfileAccess
from .access import session_middleware, visitor_hash
from .schemas import ProfileInput, SkillInput, AnalysisInput, CompletionInput, ChatInput
from .schemas import (
    ProfileOutput,
    SkillOutput,
    CareerOutput,
    JobMatchOutput,
    AnalysisOutput,
    GapOutput,
    LearningOutput,
    AlternativeOutput,
    ProgressOutput,
)
from . import repositories as repo, services
from .matching import match


@asynccontextmanager
async def lifespan(app):
    root = Path(__file__).resolve().parents[2]
    config = Config(str(root / "alembic.ini"))
    config.set_main_option("script_location", str(root / "database" / "migrations"))
    command.upgrade(config, "head")
    with Session() as db:
        repo.seed(db)
    yield


app = FastAPI(title="Concierge-Career API", version="1.0.0", lifespan=lifespan)
app.middleware("http")(session_middleware)
app.add_middleware(
    CORSMiddleware,
    allow_origins=os.getenv("CORS_ORIGINS", "http://127.0.0.1:3000,http://localhost:3000").split(
        ","
    ),
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["Content-Type"],
    allow_credentials=True,
)


@app.get("/api/health")
def health():
    return {
        "status": "ok",
        "database": engine.dialect.name,
        "ai_provider": "mock",
        "dataset_version": "2026.10-demo-v1",
    }


@app.get("/health", deprecated=True)
def legacy_health():
    return health()


@app.get("/api/v1/overview", deprecated=True)
def legacy_overview():
    """Retained scaffold fixture only. The full product uses profile-aware /api routes."""
    return json.loads(
        (Path(__file__).resolve().parents[2] / "shared" / "fixtures" / "overview.json").read_text()
    )


@app.get("/api/skills", response_model=list[SkillOutput])
def skills(db=Depends(get_db)):
    return list(repo.skill_catalog(db).values())


@app.get("/api/demo/template")
def template():
    return repo.seed_data()["alex"]


@app.post("/api/demo/profile", response_model=ProfileOutput)
def demo(db=Depends(get_db)):
    p = repo.save_profile(db, repo.seed_data()["alex"])
    db.add(ProfileAccess(profile_id=p.id, session_hash=visitor_hash.get()))
    db.commit()
    return repo.profile_dict(p)


def validate_skills(db, data):
    allowed = set(repo.skill_catalog(db))
    if any(s["skill_id"] not in allowed for s in data["skills"]):
        raise HTTPException(422, "Unknown skill. Select a canonical skill from the catalog.")
    for e in data["experiences"]:
        if e["end"] < e["start"]:
            raise HTTPException(422, "Experience end date must follow its start date.")
    for e in data["education"]:
        if e["end_year"] < e["start_year"]:
            raise HTTPException(422, "Education end year must follow its start year.")


@app.post("/api/profile", response_model=ProfileOutput)
def create_profile(payload: ProfileInput, db=Depends(get_db)):
    data = payload.model_dump()
    validate_skills(db, data)
    p = repo.save_profile(db, data)
    db.add(ProfileAccess(profile_id=p.id, session_hash=visitor_hash.get()))
    db.commit()
    return repo.profile_dict(p)


@app.get("/api/profile/{user_id}", response_model=ProfileOutput)
def get_profile(user_id: str, db=Depends(get_db)):
    return repo.profile_dict(services.require_profile(db, user_id))


@app.put("/api/profile/{user_id}", response_model=ProfileOutput)
def update_profile(user_id: str, payload: ProfileInput, db=Depends(get_db)):
    services.require_profile(db, user_id)
    data = payload.model_dump()
    validate_skills(db, data)
    p = repo.save_profile(db, data, user_id)
    db.commit()
    return repo.profile_dict(p)


@app.post("/api/profile/{user_id}/skills", response_model=ProfileOutput)
def add_skill(user_id: str, payload: SkillInput, db=Depends(get_db)):
    p = repo.profile_dict(services.require_profile(db, user_id))
    p["skills"] = [s for s in p["skills"] if s["skill_id"] != payload.skill_id] + [
        payload.model_dump()
    ]
    validate_skills(db, p)
    updated = repo.save_profile(db, p, user_id)
    db.commit()
    return repo.profile_dict(updated)


@app.post("/api/demo/reset/{user_id}", response_model=ProfileOutput)
def reset(user_id: str, db=Depends(get_db)):
    services.require_profile(db, user_id)
    db.execute(delete(Progress).where(Progress.profile_id == user_id))
    db.execute(delete(SavedJob).where(SavedJob.profile_id == user_id))
    p = repo.save_profile(db, repo.seed_data()["alex"], user_id)
    db.commit()
    return repo.profile_dict(p)


@app.post("/api/resume/analyze")
async def resume(file: UploadFile = File(...), db=Depends(get_db)):
    if not (file.filename or "").lower().endswith(".txt"):
        raise HTTPException(
            415,
            "This prototype reads UTF-8 .txt resumes. Use Demo Resume or Continue Manually for PDF/DOCX.",
        )
    content = await file.read(1_000_001)
    if len(content) > 1_000_000:
        raise HTTPException(413, "Please upload a file smaller than 1 MB.")
    try:
        text = content.decode("utf-8-sig")
    except UnicodeDecodeError:
        raise HTTPException(422, "Please save the resume as UTF-8 text.")
    return {
        "skills": services.provider.extract_skills(text, list(repo.skill_catalog(db).values())),
        "provider": "mock",
        "notice": "Suggested skills only. Review proficiency and enter personal details; exact proficiency is not inferred. The upload is not retained.",
    }


@app.get("/api/careers", response_model=list[CareerOutput])
def careers(db=Depends(get_db)):
    return [repo.columns(c) for c in db.scalars(select(Career)).all()]


@app.post("/api/analysis/career", response_model=AnalysisOutput)
@app.post("/api/analysis/recalculate", response_model=AnalysisOutput)
def analyze(payload: AnalysisInput, db=Depends(get_db)):
    return services.analysis(db, payload.user_id, payload.career_id)


@app.get("/api/jobs")
def jobs(career_id: str | None = None, db=Depends(get_db)):
    return repo.all_jobs(db, career_id)


@app.get("/api/jobs/{job_id}")
def job(job_id: str, db=Depends(get_db)):
    j = db.get(Job, job_id)
    if not j:
        raise HTTPException(404, "Job not found.")
    return repo.job_dict(j)


@app.get("/api/jobs/{job_id}/match", response_model=JobMatchOutput)
def job_match(job_id: str, user_id: str, db=Depends(get_db)):
    return match(
        repo.profile_dict(services.require_profile(db, user_id)),
        job(job_id, db),
        repo.skill_catalog(db),
    )


@app.get("/api/users/{user_id}/skill-gaps", response_model=list[GapOutput])
def gaps(user_id: str, career_id: str, db=Depends(get_db)):
    return services.analysis(db, user_id, career_id)["gaps"]


@app.get("/api/users/{user_id}/career-readiness", response_model=AnalysisOutput)
def readiness(user_id: str, career_id: str, db=Depends(get_db)):
    return services.analysis(db, user_id, career_id)


@app.get("/api/users/{user_id}/alternative-careers", response_model=list[AlternativeOutput])
def alternatives(user_id: str, career_id: str, db=Depends(get_db)):
    return services.alternatives(db, user_id, career_id)


@app.get("/api/learning-recommendations", response_model=list[LearningOutput])
def learning(user_id: str, career_id: str, db=Depends(get_db)):
    return services.learning(db, user_id, career_id)


@app.post("/api/progress/complete", response_model=ProgressOutput)
def complete(payload: CompletionInput, db=Depends(get_db)):
    return services.complete(db, payload)


@app.get("/api/users/{user_id}/saved-jobs")
def saved(user_id: str, db=Depends(get_db)):
    services.require_profile(db, user_id)
    return list(db.scalars(select(SavedJob.job_id).where(SavedJob.profile_id == user_id)).all())


@app.put("/api/users/{user_id}/saved-jobs/{job_id}")
def save_job(user_id: str, job_id: str, db=Depends(get_db)):
    services.require_profile(db, user_id)
    job(job_id, db)
    if not db.get(SavedJob, (user_id, job_id)):
        db.add(SavedJob(profile_id=user_id, job_id=job_id))
        db.commit()
    return saved(user_id, db)


@app.delete("/api/users/{user_id}/saved-jobs/{job_id}")
def unsave_job(user_id: str, job_id: str, db=Depends(get_db)):
    services.require_profile(db, user_id)
    db.execute(delete(SavedJob).where(SavedJob.profile_id == user_id, SavedJob.job_id == job_id))
    db.commit()
    return saved(user_id, db)


@app.post("/api/concierge/chat")
def chat(payload: ChatInput, db=Depends(get_db)):
    result = services.analysis(db, payload.user_id, payload.career_id)
    selected = job_match(payload.job_id, payload.user_id, db) if payload.job_id else None
    return {
        "answer": services.provider.chat(
            payload.message, result, services.require_profile(db, payload.user_id).name, selected
        ),
        "provider": "mock",
    }
