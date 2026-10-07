from fastapi.testclient import TestClient
from backend.app.main import app


def test_anonymous_sessions_cannot_read_or_change_other_profiles(client, monkeypatch):
    monkeypatch.setenv("REQUIRE_PROFILE_OWNERSHIP", "true")
    profile = client.post("/api/demo/profile").json()
    uid = profile["id"]
    assert client.get("/api/profile/" + uid).status_code == 200
    with TestClient(app) as other:
        assert other.get("/api/profile/" + uid).status_code == 404
        assert other.post("/api/demo/reset/" + uid).status_code == 404
        assert (
            other.post(
                "/api/analysis/career", json={"user_id": uid, "career_id": "frontend"}
            ).status_code
            == 404
        )
        assert other.get("/api/users/" + uid + "/saved-jobs").status_code == 404
        assert other.put("/api/users/" + uid + "/saved-jobs/frontend-01").status_code == 404
        assert (
            other.post(
                "/api/progress/complete",
                json={"user_id": uid, "career_id": "frontend", "resource_id": "learn-typescript"},
            ).status_code
            == 404
        )
        assert other.get("/api/profile/demo-template").status_code == 404
        own = other.post("/api/demo/profile").json()
        assert own["id"] != uid
        assert other.get("/api/profile/" + own["id"]).status_code == 200
    assert client.get("/api/profile/" + uid).status_code == 200


def test_session_cookie_and_manual_creation(client, monkeypatch):
    monkeypatch.setenv("REQUIRE_PROFILE_OWNERSHIP", "true")
    response = client.post("/api/profile", json={"name": "Sam"})
    assert response.status_code == 200
    assert "HttpOnly" in response.headers["set-cookie"]
    assert "SameSite=lax" in response.headers["set-cookie"]
    uid = response.json()["id"]
    assert client.get("/api/profile/" + uid).status_code == 200
    client.cookies.clear()
    assert client.get("/api/profile/" + uid).status_code == 404
