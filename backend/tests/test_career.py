import json
from importlib.resources import files

from fastapi.testclient import TestClient

from ai.matching.skills import match_skills
from backend.app.api.routes import get_career_service
from backend.app.main import app
from backend.app.repositories.career import DemoCareerRepository
from backend.app.services.career import CareerService


def test_demo_contract_matches_frontend_fixture():
    app.dependency_overrides[get_career_service] = lambda: CareerService(
        DemoCareerRepository(), "demo"
    )
    try:
        response = TestClient(app).get("/api/v1/overview")
        assert response.status_code == 200
        assert response.json() == json.loads(
            files("shared").joinpath("fixtures/overview.json").read_text()
        )
    finally:
        app.dependency_overrides.clear()


def test_matching_normalizes_and_deduplicates():
    result = match_skills([" react ", "React"], ["React", "react", "Git"])
    assert result["score"] == 50
    assert result["missing"] == ["Git"]


def test_no_requirements_is_not_a_perfect_match():
    assert match_skills(["React"], [])["score"] == 0


def test_missing_database_profile_is_service_unavailable():
    class MissingRepository:
        def get_demo_profile(self):
            raise LookupError("missing")

    app.dependency_overrides[get_career_service] = lambda: CareerService(
        MissingRepository(), "database"
    )
    try:
        assert TestClient(app).get("/api/v1/overview").status_code == 503
    finally:
        app.dependency_overrides.clear()
