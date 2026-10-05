from ai.matching.skills import match_skills
from ai.providers.base import AIProvider


class ConciergeAgent:
    def __init__(self, provider: AIProvider):
        self.provider = provider

    def overview(self, profile: dict, requirements: list[str], mode: str) -> dict:
        match = match_skills(profile["skills"], requirements)
        return {
            **profile,
            "mode": mode,
            "match": match,
            "next_action": self.provider.recommend(match["missing"]),
        }
