# Database

SQLAlchemy models support SQLite and PostgreSQL. SQLite persists to `concierge.db` without Docker. Set `DATABASE_URL` explicitly for PostgreSQL. Alembic runs before seed initialization.

| Table | Purpose |
| --- | --- |
| careers / occupations | Career selection and nullable ESCO occupation references |
| skills | Canonical names, aliases, categories, competency groups, optional ESCO ID |
| jobs | Fictional company, occupation, career, location, employment, experience/education requirements |
| job_skills | Unique job/skill; status, importance, minimum proficiency |
| career_profiles | UUID, revision, basic context |
| user_skills | Unique profile/skill, proficiency, evidence source |
| profile_records | Typed education, experience, projects, certifications in validated JSON records |
| learning_resources | Canonical skill, activity steps, estimated duration, simulated outcome |
| learning_progress | Unique profile/resource completion |
| saved_jobs | Unique profile/job shortlist |

Skills and requirements are fully normalized. Profile records use typed JSON inside a relational parent relationship to keep the prototype compact. Company labels live on jobs; employer management is out of scope.

56 jobs: Frontend 8, Backend 6, Full-stack 4, Software Engineer 5, Data Analyst 6, Data Scientist 4, Data Engineer 4, AI Engineer 4, ML Engineer 4, DevOps 3, Cloud 3, Cybersecurity 5. The seed includes skills, careers, learning resources and Alex. Initialization skips a database already containing careers; it never overwrites profiles.

`demo-template` is the seeded template. Starting a demo clones it into a new UUID; the browser remembers only that ID. Reset restores that UUID and clears its progress/shortlist.

## Existing scaffold migration

Revision `0001` is retained. `0002` renames the old unstructured profile table to `legacy_career_profiles`, preserving its data, then creates the normalized schema. Legacy records are not silently interpreted as proficiency evidence. The original overview fixture remains at the deprecated API route.

```powershell
.\.venv\Scripts\python.exe -m alembic upgrade head
.\.venv\Scripts\python.exe -m database.seed
```

Local startup performs migrations automatically. Downgrading 0002 removes the new schema and restores the legacy table, so back up first. CI uses a dedicated PostgreSQL test database; local tests use in-memory SQLite. Never use production data as `TEST_DATABASE_URL`.
