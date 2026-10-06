"""Provider boundary: explanations never calculate or change match scores."""

import re
from typing import Protocol


class AIProvider(Protocol):
    def extract_skills(self, text: str, catalog: list[dict]) -> list[dict]: ...
    def explain(self, analysis: dict, name: str) -> str: ...


class SkillNormalizationService:
    def __init__(self, catalog):
        self.aliases = {
            alias.casefold().strip(): s["id"] for s in catalog for alias in s["aliases"]
        }

    def normalize(self, value):
        return self.aliases.get(value.casefold().strip())


class MockAIProvider:
    def extract_skills(self, text, catalog):
        found = []
        for s in catalog:
            if any(
                re.search(r"(?<![\w])" + re.escape(alias) + r"(?![\w])", text, re.I)
                for alias in s["aliases"]
            ):
                found.append({"skill_id": s["id"], "proficiency": 1, "source": "resume"})
        return found

    def explain(self, analysis, name):
        if not analysis["jobs"]:
            return "There are no jobs in this category yet. Explore another career."
        top = analysis["jobs"][0]
        gap = analysis["gaps"][0] if analysis["gaps"] else None
        text = f"{name}, your strongest opportunity in this selection is {top['title']} at {top['company']}, with {top['score']}/100 requirement alignment. "
        if gap:
            text += f"Focus on {gap['name']} next: it appears in {gap['job_count']} of {analysis['jobs_analyzed']} jobs. "
        else:
            text += "You meet the skill requirements across this selection. "
        return (
            text
            + "These scores describe your current profile, not your probability of receiving an offer."
        )

    def chat(self, message, analysis, name, job=None):
        if job:
            gaps = job["missing_skills"] + job["partial_skills"]
            return (
                f"For {job['title']} at {job['company']}, your match is {job['score']}/100 ({job['recommendation'].lower()}). Your matched skills include {', '.join(job['matched_skills'][:4]) or 'no fully satisfied skills yet'}. "
                + (
                    f"Prepare evidence of your work and prioritize {', '.join(gaps[:3])}."
                    if gaps
                    else "Prepare concrete project examples for each requirement."
                )
            )
        if any(w in message.lower() for w in ["why", "score", "calculate"]):
            return (
                "Scores combine required skills (50%), preferred skills (15%), experience (15%), education (10%), and competency coverage (10%). Missing critical required skills cap the score at 69. Career readiness averages all relevant job scores. "
                + self.explain(analysis, name)
            )
        return self.explain(analysis, name)


class OptionalLLMProvider:
    def __init__(self):
        raise NotImplementedError(
            "Future integration. Use MockAIProvider; no external API is called."
        )
