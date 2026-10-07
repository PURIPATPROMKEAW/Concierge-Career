import os
import subprocess
import sys
from sqlalchemy import create_engine, inspect, text


def test_upgrade_preserves_original_scaffold_profile(tmp_path):
    url = "sqlite:///" + str(tmp_path / "upgrade.db")
    env = {**os.environ, "DATABASE_URL": url}
    subprocess.run(
        [sys.executable, "-m", "alembic", "upgrade", "0001"],
        env=env,
        check=True,
        capture_output=True,
    )
    engine = create_engine(url)
    with engine.begin() as connection:
        connection.execute(
            text(
                "INSERT INTO career_profiles (id,name,goal,skills) VALUES ('legacy','Original Alex','Frontend','[]')"
            )
        )
    subprocess.run(
        [sys.executable, "-m", "alembic", "upgrade", "head"],
        env=env,
        check=True,
        capture_output=True,
    )
    with engine.connect() as connection:
        assert (
            connection.execute(
                text("SELECT name FROM legacy_career_profiles WHERE id='legacy'")
            ).scalar()
            == "Original Alex"
        )
        assert "revision" in {c["name"] for c in inspect(connection).get_columns("career_profiles")}
        assert "job_skills" in inspect(connection).get_table_names()
    engine.dispose()


def test_catalog_refresh_is_reversible_and_preserves_profiles(tmp_path):
    from sqlalchemy.orm import Session
    from backend.app.repositories import seed, seed_data, save_profile, profile_dict
    from backend.app.models import Progress, SavedJob, Profile

    url = "sqlite:///" + str(tmp_path / "catalog.db")
    env = {**os.environ, "DATABASE_URL": url}

    def migrate(*args):
        subprocess.run(
            [sys.executable, "-m", "alembic", *args], env=env, check=True, capture_output=True
        )

    migrate("upgrade", "0004")
    engine = create_engine(url)
    with Session(engine) as db:
        seed(db)
        profile = save_profile(db, seed_data()["alex"])
        uid = profile.id
        db.add(SavedJob(profile_id=uid, job_id="frontend-01"))
        db.add(
            Progress(
                profile_id=uid,
                resource_id="learn-typescript",
                completed_at="2026-10-07T00:00:00+00:00",
                summary={"before_readiness": 78},
            )
        )
        db.commit()
        snapshot = profile_dict(profile)
    with engine.begin() as c:
        c.execute(text("UPDATE careers SET description='old description' WHERE id='frontend'"))
        c.execute(
            text(
                "UPDATE job_skills SET minimum_proficiency=3 WHERE job_id='frontend-01' AND skill_id='javascript'"
            )
        )
    migrate("upgrade", "head")
    with engine.connect() as c:
        assert (
            c.execute(text("SELECT description FROM careers WHERE id='frontend'")).scalar()
            != "old description"
        )
        assert c.execute(text("SELECT COUNT(*) FROM demo_v2_backup")).scalar() > 0
    with Session(engine) as db:
        assert profile_dict(db.get(Profile, uid)) == snapshot
        assert db.get(SavedJob, (uid, "frontend-01"))
        assert db.get(Progress, (uid, "learn-typescript")).summary == {"before_readiness": 78}
    migrate("downgrade", "0004")
    with engine.connect() as c:
        assert (
            c.execute(text("SELECT description FROM careers WHERE id='frontend'")).scalar()
            == "old description"
        )
        assert (
            c.execute(
                text(
                    "SELECT minimum_proficiency FROM job_skills WHERE job_id='frontend-01' AND skill_id='javascript'"
                )
            ).scalar()
            == 3
        )
    engine.dispose()
