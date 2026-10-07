from sqlalchemy import String, ForeignKey, JSON
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship


class Base(DeclarativeBase):
    pass


class Career(Base):
    __tablename__ = "careers"
    id: Mapped[str] = mapped_column(String, primary_key=True)
    name: Mapped[str]
    group: Mapped[str]
    description: Mapped[str]


class Occupation(Base):
    __tablename__ = "occupations"
    id: Mapped[str] = mapped_column(String, primary_key=True)
    career_id: Mapped[str] = mapped_column(ForeignKey("careers.id"))
    name: Mapped[str]
    esco_id: Mapped[str | None]


class Skill(Base):
    __tablename__ = "skills"
    id: Mapped[str] = mapped_column(String, primary_key=True)
    name: Mapped[str]
    category: Mapped[str]
    competency: Mapped[str]
    normalized_name: Mapped[str]
    esco_id: Mapped[str | None]
    aliases: Mapped[list] = mapped_column(JSON)


class Job(Base):
    __tablename__ = "jobs"
    id: Mapped[str] = mapped_column(String, primary_key=True)
    career_id: Mapped[str] = mapped_column(ForeignKey("careers.id"))
    occupation_id: Mapped[str] = mapped_column(ForeignKey("occupations.id"))
    company: Mapped[str]
    title: Mapped[str]
    location: Mapped[str]
    employment_type: Mapped[str]
    experience_level: Mapped[str]
    experience_months: Mapped[int]
    education_level: Mapped[str]
    education_fields: Mapped[list] = mapped_column(JSON)
    accepts_enrolled: Mapped[bool]
    description: Mapped[str]
    source_type: Mapped[str] = mapped_column(default="fictional_demo")
    requirements: Mapped[list["JobSkill"]] = relationship(
        cascade="all, delete-orphan", lazy="selectin"
    )


class JobSkill(Base):
    __tablename__ = "job_skills"
    job_id: Mapped[str] = mapped_column(ForeignKey("jobs.id"), primary_key=True)
    skill_id: Mapped[str] = mapped_column(ForeignKey("skills.id"), primary_key=True)
    requirement_type: Mapped[str]
    importance: Mapped[str]
    minimum_proficiency: Mapped[int]


class Profile(Base):
    __tablename__ = "career_profiles"
    id: Mapped[str] = mapped_column(String, primary_key=True)
    revision: Mapped[int] = mapped_column(default=1)
    name: Mapped[str]
    university: Mapped[str]
    field: Mapped[str]
    degree: Mapped[str]
    graduation_year: Mapped[int]
    skills: Mapped[list["UserSkill"]] = relationship(cascade="all, delete-orphan", lazy="selectin")
    records: Mapped[list["ProfileRecord"]] = relationship(
        cascade="all, delete-orphan", lazy="selectin"
    )


class ProfileAccess(Base):
    __tablename__ = "profile_access"
    profile_id: Mapped[str] = mapped_column(ForeignKey("career_profiles.id"), primary_key=True)
    session_hash: Mapped[str] = mapped_column(String(64))


class UserSkill(Base):
    __tablename__ = "user_skills"
    profile_id: Mapped[str] = mapped_column(ForeignKey("career_profiles.id"), primary_key=True)
    skill_id: Mapped[str] = mapped_column(ForeignKey("skills.id"), primary_key=True)
    proficiency: Mapped[int]
    source: Mapped[str]


class ProfileRecord(Base):
    __tablename__ = "profile_records"
    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    profile_id: Mapped[str] = mapped_column(ForeignKey("career_profiles.id"))
    kind: Mapped[str]
    data: Mapped[dict] = mapped_column(JSON)


class LearningResource(Base):
    __tablename__ = "learning_resources"
    id: Mapped[str] = mapped_column(String, primary_key=True)
    skill_id: Mapped[str] = mapped_column(ForeignKey("skills.id"))
    title: Mapped[str]
    resource_type: Mapped[str]
    duration: Mapped[str]
    description: Mapped[str]
    outcome_level: Mapped[int]
    steps: Mapped[list] = mapped_column(JSON)


class Progress(Base):
    __tablename__ = "learning_progress"
    profile_id: Mapped[str] = mapped_column(ForeignKey("career_profiles.id"), primary_key=True)
    resource_id: Mapped[str] = mapped_column(ForeignKey("learning_resources.id"), primary_key=True)
    completed_at: Mapped[str | None]
    summary: Mapped[dict | None] = mapped_column(JSON)


class SavedJob(Base):
    __tablename__ = "saved_jobs"
    profile_id: Mapped[str] = mapped_column(ForeignKey("career_profiles.id"), primary_key=True)
    job_id: Mapped[str] = mapped_column(ForeignKey("jobs.id"), primary_key=True)
