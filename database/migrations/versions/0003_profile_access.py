"""Anonymous browser ownership for hosted profiles."""

from alembic import op
from backend.app.models import ProfileAccess

revision = "0003"
down_revision = "0002"
branch_labels = None
depends_on = None


def upgrade():
    ProfileAccess.__table__.create(op.get_bind(), checkfirst=True)


def downgrade():
    ProfileAccess.__table__.drop(op.get_bind(), checkfirst=True)
