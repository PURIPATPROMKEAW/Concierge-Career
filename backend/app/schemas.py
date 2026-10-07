from typing import Literal
from pydantic import BaseModel, Field


class SkillInput(BaseModel):
    skill_id: str
    proficiency: int = Field(ge=1, le=3)
    source: Literal["manual", "resume", "project", "experience", "certificate", "demo_learning"] = (
        "manual"
    )


class EducationInput(BaseModel):
    institution: str = ""
    degree: str = "Bachelor"
    field: str = ""
    start_year: int = Field(default=2023, ge=1950, le=2100)
    end_year: int = Field(default=2027, ge=1950, le=2100)
    enrolled: bool = True


class ExperienceInput(BaseModel):
    organization: str = ""
    role: str = ""
    start: str = Field(default="2025-06", pattern=r"^\d{4}-(0[1-9]|1[0-2])$")
    end: str = Field(default="2025-08", pattern=r"^\d{4}-(0[1-9]|1[0-2])$")
    description: str = ""
    skills: list[str] = []


class ProjectInput(BaseModel):
    name: str = ""
    description: str = ""
    stack: list[str] = []
    project_type: str = "Personal"


class CertificationInput(BaseModel):
    name: str = ""
    issuer: str = ""
    year: int = Field(default=2026, ge=1950, le=2100)


class ProfileInput(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    university: str = Field(default="", max_length=200)
    field: str = Field(default="", max_length=200)
    degree: str = Field(default="Bachelor", max_length=100)
    graduation_year: int = Field(default=2027, ge=1950, le=2100)
    skills: list[SkillInput] = Field(default_factory=list, max_length=100)
    education: list[EducationInput] = Field(default_factory=list, max_length=20)
    experiences: list[ExperienceInput] = Field(default_factory=list, max_length=30)
    projects: list[ProjectInput] = Field(default_factory=list, max_length=50)
    certifications: list[CertificationInput] = Field(default_factory=list, max_length=30)


class AnalysisInput(BaseModel):
    user_id: str
    career_id: str


class CompletionInput(AnalysisInput):
    resource_id: str


class ChatInput(AnalysisInput):
    message: str = Field(min_length=1, max_length=2000)
    job_id: str | None = None


class ProfileOutput(ProfileInput):
    id: str
    revision: int


class SkillOutput(BaseModel):
    id: str
    name: str
    category: str
    competency: str
    normalized_name: str
    esco_id: str | None
    aliases: list[str]


class CareerOutput(BaseModel):
    id: str
    name: str
    group: str
    description: str


class RequirementOutput(BaseModel):
    skill_id: str
    name: str
    requirement_type: str
    importance: str
    minimum_proficiency: int
    current: int
    satisfaction: float
    status: str


class JobMatchOutput(BaseModel):
    id: str
    career_id: str
    company: str
    title: str
    location: str
    employment_type: str
    experience_level: str
    description: str
    source_type: str
    score: int
    raw_score: float
    recommendation: str
    breakdown: dict[str, float]
    weights: dict[str, float]
    comparisons: list[RequirementOutput]
    matched_skills: list[str]
    partial_skills: list[str]
    missing_skills: list[str]
    critical_missing: list[str]


class GapOutput(BaseModel):
    skill_id: str
    name: str
    current: int
    target: int
    demand: int
    job_count: int
    required_count: int
    priority: str
    priority_value: float
    unlocks: int


class DemandOutput(BaseModel):
    skill_id: str
    name: str
    count: int
    percent: int


class AnalysisOutput(BaseModel):
    career: CareerOutput
    readiness: int
    jobs_analyzed: int
    ready_count: int
    strong_count: int
    jobs: list[JobMatchOutput]
    gaps: list[GapOutput]
    demand: list[DemandOutput]
    insight: str
    profile_revision: int
    dataset_version: str


class LearningOutput(BaseModel):
    id: str
    skill_id: str
    title: str
    resource_type: str
    duration: str
    description: str
    outcome_level: int
    steps: list[str]
    gap: GapOutput | None
    completed: bool
    completed_at: str | None = None
    summary: dict | None = None


class AlternativeOutput(BaseModel):
    career: CareerOutput
    readiness: int
    matched_skills: list[str]
    jobs_analyzed: int


class ProgressOutput(BaseModel):
    before: AnalysisOutput
    after: AnalysisOutput
    profile: ProfileOutput
    already_completed: bool
