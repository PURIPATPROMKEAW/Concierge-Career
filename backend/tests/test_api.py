import os
import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
from fastapi.testclient import TestClient
from backend.app.main import app
from backend.app.core import get_db
from backend.app.models import Base
from backend.app.repositories import seed


@pytest.fixture
def client():
    url = os.getenv("TEST_DATABASE_URL", "sqlite://")
    engine = create_engine(
        url,
        **(
            {"connect_args": {"check_same_thread": False}, "poolclass": StaticPool}
            if url == "sqlite://"
            else {}
        ),
    )
    Base.metadata.create_all(engine)
    factory = sessionmaker(engine, expire_on_commit=False)
    with factory() as db:
        seed(db)

    def dependency():
        with factory() as db:
            yield db

    app.dependency_overrides[get_db] = dependency
    with TestClient(app) as c:
        yield c
    app.dependency_overrides.clear()
    engine.dispose()


def test_full_journey_and_idempotency(client):
    p = client.post("/api/demo/profile").json()
    uid = p["id"]
    args = {"user_id": uid, "career_id": "frontend"}
    initial = client.post("/api/analysis/career", json=args).json()
    assert initial["readiness"] == 78
    saved = client.put(f"/api/users/{uid}/saved-jobs/frontend-01").json()
    assert saved == ["frontend-01"]
    resources = client.get("/api/learning-recommendations", params=args).json()
    assert resources[0]["id"] == "learn-typescript"
    progress = client.post(
        "/api/progress/complete", json={**args, "resource_id": "learn-typescript"}
    ).json()
    assert progress["after"]["readiness"] == 85
    assert progress["after"]["jobs"][0]["score"] == 92
    again = client.post(
        "/api/progress/complete", json={**args, "resource_id": "learn-typescript"}
    ).json()
    assert again["already_completed"] and again["after"] == progress["after"]
    reloaded = client.get("/api/profile/" + uid).json()
    assert any(s["skill_id"] == "typescript" and s["proficiency"] == 2 for s in reloaded["skills"])
    assert (
        client.get(
            f"/api/users/{uid}/alternative-careers", params={"career_id": "frontend"}
        ).status_code
        == 200
    )
    reset = client.post("/api/demo/reset/" + uid).json()
    assert not any(s["skill_id"] == "typescript" for s in reset["skills"])
    assert client.get(f"/api/users/{uid}/saved-jobs").json() == []


def test_manual_profile_validation_and_upload(client):
    body = {"name": "Sam", "skills": [{"skill_id": "javascript", "proficiency": 2}]}
    p = client.post("/api/profile", json=body).json()
    assert (
        client.post(
            "/api/analysis/career", json={"user_id": p["id"], "career_id": "analyst"}
        ).status_code
        == 200
    )
    assert client.post("/api/profile", json={"name": ""}).status_code == 422
    assert (
        client.post(
            "/api/profile", json={"name": "Sam", "skills": [{"skill_id": "fake", "proficiency": 1}]}
        ).status_code
        == 422
    )
    assert client.post(
        "/api/resume/analyze", files={"file": ("resume.txt", b"JavaScript React Git", "text/plain")}
    ).json()["skills"]
    assert (
        client.post(
            "/api/resume/analyze", files={"file": ("resume.pdf", b"pdf", "application/pdf")}
        ).status_code
        == 415
    )
    assert client.get("/api/profile/unknown").status_code == 404
    assert (
        client.post(
            "/api/analysis/career", json={"user_id": p["id"], "career_id": "unknown"}
        ).status_code
        == 404
    )


def test_demo_sessions_are_isolated(client):
    a = client.post("/api/demo/profile").json()
    b = client.post("/api/demo/profile").json()
    assert a["id"] != b["id"]
    client.post(
        "/api/progress/complete",
        json={"user_id": a["id"], "career_id": "frontend", "resource_id": "learn-typescript"},
    )
    assert (
        client.post(
            "/api/analysis/career", json={"user_id": b["id"], "career_id": "frontend"}
        ).json()["readiness"]
        == 78
    )


def test_legacy_fixture_contract(client):
    import json
    from pathlib import Path

    fixture = json.loads(Path("shared/fixtures/overview.json").read_text())
    assert client.get("/api/v1/overview").json() == fixture


def test_generated_wire_contract_matches_outputs(client):
    from backend.app.schemas import ProfileOutput, AnalysisOutput

    p = client.post("/api/demo/profile").json()
    assert ProfileOutput.model_validate(p).id == p["id"]
    result = client.post(
        "/api/analysis/career", json={"user_id": p["id"], "career_id": "frontend"}
    ).json()
    assert AnalysisOutput.model_validate(result).readiness == 78
