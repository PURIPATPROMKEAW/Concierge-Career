# Concierge Career

**Know me. Guide me. Grow with me.** An English-first AI Career Concierge prototype foundation.

## Included now
- Original black/blue/white editorial landing page and responsive demo workspace.
- Next.js App Router, React, TypeScript, Tailwind CSS.
- FastAPI routes → services → repositories; SQLAlchemy + PostgreSQL + Alembic.
- Separate provider-agnostic AI package with deterministic mock recommendations.
- Shared OpenAPI contract and generated TypeScript types, matching demo fixture.
- Docker Compose, CI checks, tests, and implementation backlog.

This is a scaffold, not the complete seven-screen prototype. Sidebar future features are labels, not non-working links. All profile and role data is fictional. No API key, login, or real resume is needed.

## Quick start: frontend only
Requires Node 22 and pnpm 11.19.0 (`corepack enable`).
```sh
pnpm install --frozen-lockfile
pnpm dev
```
Open http://localhost:3000. Demo mode is the default and works without backend or PostgreSQL.

## Backend development
Requires Python 3.11+ (3.12 recommended). Run from repository root.
```sh
python -m venv .venv
# Windows: .venv\Scripts\Activate.ps1
# macOS/Linux: source .venv/bin/activate
pip install -r requirements-dev.lock
pip install --no-deps -e .
uvicorn backend.app.main:app --reload
```
API docs: http://localhost:8000/docs. Health: `/health`. Overview: `/api/v1/overview`.
To connect the frontend, copy `frontend/.env.example` to `frontend/.env.local`, set `NEXT_PUBLIC_DATA_MODE=api`, and restart Next.js.
API mode reports errors rather than silently substituting fake responses.

## Entire stack with PostgreSQL
Install Docker with Compose. Copy `.env.example` to `.env`, choose a local database password (URL-safe characters), then:
```sh
docker compose up --build
```
Compose uses database mode, runs migrations and idempotent seeding, and exposes services on localhost only.
For a native backend connected to PostgreSQL, set `DATA_MODE=database` and the matching `DATABASE_URL`, then run `alembic upgrade head` and `python -m database.seeds.demo`.
Frontend public environment values are build-time settings; rebuild after changes.

## Quality checks
```sh
pnpm lint
pnpm typecheck
pnpm build
ruff check .
pytest
python -m backend.scripts.export_openapi
pnpm --filter frontend generate:api
```
Commit regenerated contracts whenever API schemas change. Python dependency snapshots were generated on Windows/Python 3.12; CI uses Linux/Python 3.12.

## Structure
```text
frontend/    UI, app routes, components, feature modules, API client
backend/     HTTP API, configuration, schemas, services, repositories, models
ai/          agent orchestration, matching, providers, future prompts
database/    migrations and repeatable sample seed
shared/      generated contracts and demo fixtures
docs/        architecture, design direction, prototype backlog and walkthrough
```
See [Architecture](docs/architecture.md), [Prototype scope](docs/prototype-plan.md), [Design](docs/design.md), and [Demo walkthrough](docs/demo-flow.md).
Use feature branches for further implementation, e.g. `feature/ai-career-concierge-demo`.
No license is granted yet; choose one before open-source distribution.
