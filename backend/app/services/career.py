from ai.agents.concierge import ConciergeAgent
from ai.providers.mock import MockAIProvider
from backend.app.repositories.career import CareerRepository


class CareerService:
    def __init__(self, repository: CareerRepository, mode: str):
        self.repository = repository
        self.mode = mode
        self.agent = ConciergeAgent(MockAIProvider())

    def overview(self) -> dict:
        return self.agent.overview(
            self.repository.get_demo_profile(),
            ["JavaScript", "HTML/CSS", "Git", "React"],
            self.mode,
        )
