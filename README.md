# Concierge-Career

**Find where your skills can take you.** An English-first career analysis prototype for university students and fresh graduates entering technology careers.

Students often know which career interests them but cannot tell whether their projects, skills, education, and experience meet job requirements. Concierge-Career connects those inputs with structured job requirements, explains the gaps, and recalculates when a profile improves. This branch extends the original scaffold into a complete working demo.

## Included now

- Profile-first journey: create/review your profile **before** selecting a career.
- Puripatjudhai demo profile; manual editing of skills, education, projects, experience, and certifications.
- UTF-8 `.txt` resume upload, deterministic alias extraction, and editable proficiency. Uploads are not retained.
- 56 fictional jobs across 12 technology careers, canonical skills, occupations, and weighted requirements.
- Backend-calculated matching, readiness, demand, ranking, alternatives, and prioritized gaps.
- Requirement comparisons, score breakdowns, saved jobs, simulated application preparation, contextual Concierge.
- Gap-linked learning activities; repeat-safe completion, persistent profile updates, and reset.
- Exact demo: readiness **78 → 85**, best match **87 → 92**, next priority **Frontend Testing** after TypeScript Fundamentals.

Scores measure **profile alignment, never hiring probability**. Listings are fictional, learning activities are simulated, and the AI provider is a deterministic mock. No login, AI key, job API, OAuth, or real resume is necessary.

## Local setup

### Reopen the demo on Windows

After dependencies are installed, double-click **Start Demo.cmd** in the project folder. It builds the production frontend when needed, starts both services in hidden background processes, waits for health checks, and opens the website. Running it again reuses healthy services instead of creating duplicates. Logs are saved locally in `.runtime/` (excluded from Git).

The demo address is **localhost**, not an always-online deployment. It works only while this computer and both services are running. After restarting Windows or stopping the processes, run **Start Demo.cmd** again. A browser bookmark alone cannot start the servers.

For troubleshooting without opening a browser: `powershell -NoProfile -ExecutionPolicy Bypass -File scripts/start-demo.ps1 -NoBrowser`. Startup errors identify missing prerequisites, occupied ports, failed builds, or the relevant log file.

### First-time installation / development

Requirements: Node 24, pnpm 11.19.0, Python 3.12 with venv/pip. Run from repository root:

```powershell
python -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r backend/requirements.txt
pnpm install --frozen-lockfile
```

Start two terminals:

```powershell
# Terminal 1: backend, automatic migrations and seed, SQLite persistence
.\.venv\Scripts\python.exe -m uvicorn backend.app.main:app --host 127.0.0.1 --port 8000

# Terminal 2: frontend
pnpm dev
```

Open **http://127.0.0.1:3000**. API docs: **http://127.0.0.1:8000/docs**. Both processes must run. Convenience scripts: `scripts/setup.ps1`, `scripts/start-backend.ps1`, `scripts/start-frontend.ps1`. On macOS/Linux use `.venv/bin/python`.

Backend configuration uses process environment variables, documented in `.env.example`; the backend does not automatically load `.env`. SQLite needs no configuration. Set `DATABASE_URL` before starting to use PostgreSQL. Set `NEXT_PUBLIC_API_URL` in `frontend/.env.local` only if the API runs elsewhere; restart/rebuild after changes. Never commit real environment files.

```powershell
$env:DATABASE_URL='postgresql+psycopg://concierge:localdemo@localhost:5432/concierge'
```

### Full stack with PostgreSQL

```sh
docker compose up --build
```

Compose launches PostgreSQL 17, FastAPI, and the production frontend on localhost. `localdemo` is a demonstration password. SQLite and PostgreSQL share SQLAlchemy models/repositories. A configured database failure is surfaced, never silently redirected to another database.

## Competition demo

1. **Try demo profile** loads a fresh Puripatjudhai session.
2. Review seven skills, three projects, education, and a web internship.
3. **Choose Career Interest → Frontend Developer**.
4. Show eight analyzed jobs and readiness **78**.
5. Open NovaTech's top match (**87**), compare requirements, and inspect score components.
6. Open Skill gaps, then My learning.
7. Complete **TypeScript Fundamentals**: explicitly simulated Intermediate proficiency.
8. Observe **78 → 85**, **87 → 92**, more ready-to-apply roles, and Testing as the next priority.
9. **Reset demo** restores the current session's Puripatjudhai profile and clears its saved jobs/progress.

See [the 4–5 minute presentation script](docs/demo-flow.md).

## Architecture and tech stack

Next.js / React / TypeScript / Tailwind → FastAPI / Pydantic → application services → SQLAlchemy repositories, deterministic Python matching, and mock AI → PostgreSQL or SQLite.

```text
frontend/          Views, profile editor, API client and generated types
backend/app/       Routes, schemas, services, repositories, models, matching
ai/                Provider abstraction, interpretation, normalization
database/          Alembic migrations and committed demo data
shared/            OpenAPI contract and legacy scaffold fixture
scripts/           Setup, startup, contract/type generation
tests/             Playwright browser journeys
docs/              Architecture, database, scoring and demo guide
```

UI components do not calculate scores. The Concierge explains computed results throughout the app rather than acting as the main product. Pydantic output models generate frontend response types.

## AI architecture and ESCO mapping

`AIProvider` defines the provider boundary. `MockAIProvider` detects known aliases and explains results. `SkillNormalizationService` maps JS / Java Script to JavaScript. Unknown aliases stay unmapped. Canonical skills include competency groups and nullable `esco_id` fields: **ESCO-style structure, not live or verified ESCO integration**.

`OptionalLLMProvider` is an intentionally unimplemented extension point. Future LLMs may improve extraction/explanation, never assign numeric scores. Jobs are pre-normalized in the seed, not ingested from a live feed.

## Scoring and readiness

| Component | Weight |
| --- | ---: |
| Required skills | 50% |
| Preferred skills | 15% |
| Relevant experience | 15% |
| Education | 10% |
| Competency coverage | 10% |

Beginner/Intermediate/Advanced = 1/2/3. Satisfaction is `min(current / expected, 1)`, weighted by importance. Inapplicable component weights redistribute proportionally. An absent critical requirement caps the score at 69. Career readiness averages all unrounded scores in the category; demand counts distinct jobs.

Gaps combine demand, importance, required/preferred status, and proficiency deficit. Ties favor skills that unlock more ready-to-apply roles. Learning follows gap order. The fictional seed was calibrated to the requested presentation numbers; runtime has **no persona-specific score overrides**. See [the formulas](docs/matching-engine.md).

## API overview

| Workflow | Endpoint |
| --- | --- |
| Health / catalogs | `GET /api/health`, `/api/skills`, `/api/careers` |
| Demo / reset | `POST /api/demo/profile`, `/api/demo/reset/{user_id}` |
| Profile | `POST /api/profile`, `GET/PUT /api/profile/{user_id}` |
| Skill | `POST /api/profile/{user_id}/skills` |
| Resume | `POST /api/resume/analyze` (multipart .txt) |
| Analysis | `POST /api/analysis/career`, `/api/analysis/recalculate` |
| Jobs | `GET /api/jobs`, `/api/jobs/{job_id}`, `/api/jobs/{job_id}/match` |
| Insights | `GET /api/users/{user_id}/career-readiness`, `/skill-gaps`, `/alternative-careers` |
| Learning | `GET /api/learning-recommendations`, `POST /api/progress/complete` |
| Shortlist | `GET /api/users/{user_id}/saved-jobs`, `PUT/DELETE .../{job_id}` |
| Concierge | `POST /api/concierge/chat` |

The scaffold's `/health` and `/api/v1/overview` remain deprecated compatibility endpoints. The old overview is the original fixture; the new interface does not use it.

## Verification

```powershell
.\.venv\Scripts\python.exe -m pytest backend/tests -q
.\.venv\Scripts\python.exe -m ruff check backend ai database scripts
pnpm lint
pnpm typecheck
pnpm build
pnpm exec playwright install chromium
# With frontend and backend running:
pnpm test:e2e
```

Install `ruff==0.11.10` for Python linting. CI includes SQLite/PostgreSQL API tests, production build, and browser tests. Regenerate contracts after schema changes:

```powershell
.\.venv\Scripts\python.exe -m scripts.export_contract
.\.venv\Scripts\python.exe -m scripts.generate_types
```

## Implemented, simulated, future

| Implemented | Simulated | Future integration |
| --- | --- | --- |
| Persistent profiles and requirement matching | Fictional employers/openings | Sourced live job data |
| Text resume extraction and manual records | Mock interpretation | PDF/DOCX/OCR and LLM extraction |
| Alias and competency mapping | ESCO-compatible fields | Verified ESCO concepts |
| Learning-to-profile feedback | Intermediate skill gain; application checklist | Assessments and application integrations |

Hosted deployment uses anonymous browser sessions with profile ownership checks. Browser local storage remembers a profile ID; an HttpOnly session cookie grants access to that browser's profiles. Clearing cookies loses anonymous access. Local mode keeps ownership optional for compatibility. Account-based cross-device access is not included. See [Render deployment](docs/deployment.md).

The user chose the existing public repository and feature-branch development. Sites is not used or deployed for this implementation.
