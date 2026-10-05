from typing import Literal

from pydantic import BaseModel, Field


class Match(BaseModel):
    score: int = Field(ge=0, le=100)
    matched: list[str]
    missing: list[str]
    explanation: str


class NextAction(BaseModel):
    title: str
    reason: str
    skill: str


class Overview(BaseModel):
    mode: Literal["demo", "database"]
    name: str
    goal: str
    skills: list[str]
    next_action: NextAction
    match: Match
