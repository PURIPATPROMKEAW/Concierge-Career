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
        if analysis["readiness"] < 50:
            text += "Build foundations first; explore higher-alignment alternatives alongside a specific practice task. "
        if gap:
            text += f"Focus on {gap['name']} next: it appears in {gap['job_count']} of {analysis['jobs_analyzed']} jobs. "
        else:
            text += "You meet the skill requirements across this selection. "
        return (
            text
            + "These scores describe your current profile, not your probability of receiving an offer."
        )

    def chat(self, message, analysis, name, job=None):
        text = message.lower()
        gaps = analysis["gaps"]
        levels = ["not yet added", "Beginner", "Intermediate", "Advanced"]

        def detail(g):
            return f"{g['name']}: weighted deficit {g['priority_value']:.4f}, demand {g['job_count']}/{analysis['jobs_analyzed']}, {g['required_count']} unmet required occurrences, current {levels[g['current']]}, target {levels[g['target']]}, {g['unlocks']} roles reaching 85 if this skill alone reaches target."

        mentioned = [
            g
            for g in gaps
            if re.search(r"(?<![\w])" + re.escape(g["name"]) + r"(?![\w])", message, re.I)
        ]
        if any(w in text for w in ["compare", "ranked", "above", "difference", "versus", " vs "]):
            if len(mentioned) >= 2:
                first, second = mentioned[:2]
                return (
                    detail(first)
                    + " "
                    + detail(second)
                    + " Ranking uses weighted deficit first: (1 − current/required level) × importance × required/preferred factor, averaged over all jobs with satisfied requirements contributing zero. Importance is low=1, medium=2, high=3, critical=4; the factor is required=1 or preferred=0.5. Ready-role gains break ties; they are not the main objective. The higher weighted deficit ranks first. These are counterfactual alignments, not hiring predictions."
                )
            return (
                "Please name two current skill gaps to compare, such as "
                + (" and ".join(g["name"] for g in gaps[:2]) or "skills in your current gap list")
                + "."
            )
        if any(w in text for w in ["improve", "priority", "focus", "gap"]):
            return (
                detail(gaps[0])
                + " It ranks first by weighted deficit, not by the largest number of ready jobs. Start with the matching practice task in My learning."
                if gaps
                else "No skill gaps remain in this selection. Strengthen project evidence and experience next."
            )
        if any(w in text for w in ["ready", "readiness", "apply"]):
            return (
                f"{name}, readiness is {analysis['readiness']}/100 across {analysis['jobs_analyzed']} fictional jobs; {analysis['ready_count']} meet the 85-point ready-to-apply threshold. "
                + (
                    "Build foundations before applying to this selection. Explore the higher-alignment alternative careers and your first learning task."
                    if analysis["readiness"] < 50
                    else "Review each role's requirements before preparing an application. Alignment is not hiring probability."
                )
            )
        if not any(w in text for w in ["score", "calculate", "match", "explain"]):
            return "This rule-based demo supports explaining scores, identifying the first priority gap, comparing two named gaps, and explaining readiness. Try one of the suggested questions; open-ended career advice is not supported."
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
