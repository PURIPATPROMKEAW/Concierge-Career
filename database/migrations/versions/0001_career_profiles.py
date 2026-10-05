import sqlalchemy as sa
from alembic import op

revision = "0001"
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        "career_profiles",
        sa.Column("id", sa.String(64), primary_key=True),
        sa.Column("name", sa.String(100), nullable=False),
        sa.Column("goal", sa.String(200), nullable=False),
        sa.Column("skills", sa.JSON(), nullable=False),
    )


def downgrade():
    op.drop_table("career_profiles")
