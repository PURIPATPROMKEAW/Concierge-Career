import json
from importlib.resources import files
from typing import Protocol

from sqlalchemy import create_engine
from sqlalchemy.orm import Session

from backend.app.models.career import CareerProfile


class CareerRepository(Protocol):
    def get_demo_profile(self) -> dict: ...


class DemoCareerRepository:
    def get_demo_profile(self) -> dict:
        data = json.loads(files("shared").joinpath("fixtures/overview.json").read_text())
        return {key: data[key] for key in ("name", "goal", "skills")}


class SQLCareerRepository:
    def __init__(self, url: str):
        self.engine = create_engine(url, pool_pre_ping=True)

    def get_demo_profile(self) -> dict:
        with Session(self.engine) as session:
            profile = session.get(CareerProfile, "demo-alex")
            if profile is None:
                raise LookupError("Demo profile missing. Run database seed.")
            return {"name": profile.name, "goal": profile.goal, "skills": profile.skills}
