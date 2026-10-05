# Database
PostgreSQL 17 in Compose; SQLAlchemy models in backend/app/models.
From root: `alembic upgrade head`, then `python -m database.seeds.demo`.
Seed is idempotent and does not overwrite edits. `alembic revision --autogenerate -m "description"` creates a future migration; review it before applying.
Current table: career_profiles. Demo mode needs no database. See docs/architecture.md for planned entities.
