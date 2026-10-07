"""Preserve scaffold profiles and add the full normalized demo schema."""

from alembic import op
from sqlalchemy import inspect
from backend.app.models import Base

revision = "0002"
down_revision = "0001"
branch_labels = None
depends_on = None


def upgrade():
    connection = op.get_bind()
    tables = inspect(connection).get_table_names()
    if "career_profiles" in tables and "goal" in {
        c["name"] for c in inspect(connection).get_columns("career_profiles")
    }:
        op.rename_table("career_profiles", "legacy_career_profiles")
    Base.metadata.create_all(connection)


def downgrade():
    connection = op.get_bind()
    Base.metadata.drop_all(connection)
    if "legacy_career_profiles" in inspect(connection).get_table_names():
        op.rename_table("legacy_career_profiles", "career_profiles")
