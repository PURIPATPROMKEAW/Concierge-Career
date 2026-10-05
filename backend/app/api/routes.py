from functools import lru_cache
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.exc import SQLAlchemyError

from backend.app.core.config import get_settings
from backend.app.repositories.career import DemoCareerRepository, SQLCareerRepository
from backend.app.schemas.career import Overview
from backend.app.services.career import CareerService

router = APIRouter(prefix="/api/v1")


@lru_cache
def get_career_service() -> CareerService:
    settings = get_settings()
    repository = (
        DemoCareerRepository()
        if settings.data_mode == "demo"
        else SQLCareerRepository(settings.database_url)
    )
    return CareerService(repository, settings.data_mode)


@router.get("/overview", response_model=Overview)
def overview(service: Annotated[CareerService, Depends(get_career_service)]):
    try:
        return service.overview()
    except (SQLAlchemyError, LookupError) as error:
        raise HTTPException(
            503, "Career data unavailable. Check database migrations and seed."
        ) from error
