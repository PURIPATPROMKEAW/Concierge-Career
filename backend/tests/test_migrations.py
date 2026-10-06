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
