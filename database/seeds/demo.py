from sqlalchemy import create_engine
from sqlalchemy.orm import Session

from backend.app.core.config import get_settings
from backend.app.models.career import CareerProfile
from backend.app.repositories.career import DemoCareerRepository


def seed():
    with Session(create_engine(get_settings().database_url)) as session:
        if session.get(CareerProfile, "demo-alex") is None:
            session.add(CareerProfile(id="demo-alex", **DemoCareerRepository().get_demo_profile()))
            session.commit()


if __name__ == "__main__":
    seed()
