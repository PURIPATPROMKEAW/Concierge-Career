"""Reversible refresh of fictional catalogs; preserve all profiles and history."""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.orm import Session
from backend.app.models import Career, Job, JobSkill, LearningResource
from backend.app.repositories import seed_data

revision = "0005"
down_revision = "0004"
branch_labels = None
depends_on = None


def backup_table():
    return sa.Table(
        "demo_v2_backup",
        sa.MetaData(),
        sa.Column("key", sa.String(), primary_key=True),
        sa.Column("data", sa.JSON(), nullable=False),
    )


def apply(db, kind, data):
    if kind == "career":
        row = db.get(Career, data["id"])
        if row:
            row.description = data["description"]
    elif kind == "job":
        row = db.get(Job, data["id"])
        if row and row.source_type == "fictional_demo":
            row.description = data["description"]
            row.requirements = [JobSkill(**r) for r in data["requirements"]]
    else:
        row = db.get(LearningResource, data["id"])
        if row:
            row.description = data["description"]
            row.steps = data["steps"]


def upgrade():
    bind = op.get_bind()
    backup = backup_table()
    backup.create(bind, checkfirst=True)
    with Session(bind=bind) as db:
        data = seed_data()
        for kind, items, model in [
            ("career", data["careers"], Career),
            ("job", data["jobs"], Job),
            ("resource", data["resources"], LearningResource),
        ]:
            for item in items:
                row = db.get(model, item["id"])
                if not row or (kind == "job" and row.source_type != "fictional_demo"):
                    continue
                previous = {"id": row.id, "description": row.description}
                if kind == "job":
                    previous["requirements"] = [
                        {
                            "skill_id": r.skill_id,
                            "requirement_type": r.requirement_type,
                            "importance": r.importance,
                            "minimum_proficiency": r.minimum_proficiency,
                        }
                        for r in row.requirements
                    ]
                if kind == "resource":
                    previous["steps"] = row.steps
                bind.execute(backup.insert().values(key=f"{kind}:{row.id}", data=previous))
                apply(db, kind, item)
        db.flush()


def downgrade():
    bind = op.get_bind()
    backup = backup_table()
    with Session(bind=bind) as db:
        for key, data in bind.execute(sa.select(backup.c.key, backup.c.data)):
            apply(db, key.split(":", 1)[0], data)
        db.flush()
    backup.drop(bind)
