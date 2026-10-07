"""Preserve learning completion evidence, including scores at completion time."""

from alembic import op
import sqlalchemy as sa

revision = "0004"
down_revision = "0003"
branch_labels = None
depends_on = None


def upgrade():
    bind = op.get_bind()
    columns = {c["name"] for c in sa.inspect(bind).get_columns("learning_progress")}
    for name, typ in [("completed_at", sa.String()), ("summary", sa.JSON())]:
        if name not in columns:
            op.add_column("learning_progress", sa.Column(name, typ, nullable=True))


def downgrade():
    with op.batch_alter_table("learning_progress") as batch:
        batch.drop_column("summary")
        batch.drop_column("completed_at")
