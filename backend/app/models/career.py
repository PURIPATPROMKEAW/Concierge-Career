from sqlalchemy import JSON, String
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column


class Base(DeclarativeBase):
    pass


class CareerProfile(Base):
    __tablename__ = "career_profiles"
    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    name: Mapped[str] = mapped_column(String(100))
    goal: Mapped[str] = mapped_column(String(200))
    skills: Mapped[list[str]] = mapped_column(JSON)
