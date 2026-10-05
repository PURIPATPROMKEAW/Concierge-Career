from typing import Protocol


class AIProvider(Protocol):
    def recommend(self, missing: list[str]) -> dict[str, str]: ...
