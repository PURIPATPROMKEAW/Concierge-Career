from functools import lru_cache
from typing import Literal

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    data_mode: Literal["demo", "database"] = "demo"
    ai_provider: Literal["mock"] = "mock"
    database_url: str = "postgresql+psycopg://concierge:local@localhost:5432/concierge"
    cors_origins: list[str] = ["http://localhost:3000"]
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")


@lru_cache
def get_settings() -> Settings:
    return Settings()
