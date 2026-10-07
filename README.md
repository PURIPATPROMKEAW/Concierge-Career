# Concierge-Career

**Find where your skills can take you.** An English-first career analysis prototype for university students and fresh graduates entering technology careers.

Create a career profile, compare it with structured job requirements, explore skill gaps, and see how profile updates change your matches. The interface uses a light navy, cobalt blue, and white design.

---

## Features

| Feature | Description |
| --- | --- |
| Career profile | Create and review skills, education, projects, experience, and certifications before choosing a career |
| Demo profile | Try **Puripatjudhai**, continue an existing session, or explicitly reset its progress |
| Resume upload | Upload a UTF-8 `.txt` file; known skill aliases are extracted and proficiency remains editable. Uploads are not retained |
| Career matching | Analyze **56 fictional jobs across 12 technology careers** using 32 canonical skills |
| Match details | View requirement comparisons, score components, skill demand, prioritized gaps, and alternative careers |
| Saved jobs | Keep a shortlist across careers, with scores recalculated from the current profile |
| Profile re-analysis | Save an edited profile and compare before/after results for the selected career |
| Learning | Follow skill-specific practice tasks; simulated completion updates proficiency and keeps dated Completed history |
| Career Concierge | Rule-based Mock AI explains scores, priorities, readiness, and comparisons between named gaps |
| Application preparation | A simulated checklist for fictional jobs; no application is sent |
| Resume your workspace | Restore the selected career and page after refresh, with freshly computed scores |
| Responsive interface | Desktop dashboard and mobile requirement cards |

Scores measure **profile alignment, never hiring probability**. Listings are fictional, learning activities are simulated, and the AI provider is a deterministic mock. No login, AI key, job API, OAuth, or real resume is necessary.

---

## Tech stack

| Layer | Technology |
| --- | --- |
| Frontend | Next.js 16 (App Router), React 19, TypeScript |
| Styling and icons | Tailwind CSS 4, shared CSS tokens, Lucide React |
| Backend | FastAPI, Pydantic, Uvicorn |
| Database | SQLAlchemy, Alembic; SQLite locally or PostgreSQL |
| Matching | Deterministic Python scoring and gap prioritization |
| AI | MockAIProvider with alias extraction and rule-based explanations |
| Testing | pytest, Playwright, ESLint, TypeScript, Ruff |
| Hosting configuration | Render web services and PostgreSQL; Docker Compose for a local PostgreSQL stack |

---

## Getting started in VS Code

### Prerequisites

- Git
- Node.js **24** and **pnpm 11.19.0** (the version pinned by this repository)
- Python **3.12** with `venv` and `pip`
- Visual Studio Code

The following commands use **Windows PowerShell** in VS Code's integrated terminal (**Terminal → New Terminal**). Run project commands from the repository root, where `package.json` and `Start Demo.cmd` are located.

If pnpm is not installed, install it after installing Node.js:

```powershell
npm install --global pnpm@11.19.0
```

### 1. Clone and open the repository

The current full demo is on **`feature/ai-career-concierge-demo`**:

```powershell
git clone --branch feature/ai-career-concierge-demo https://github.com/PURIPATPROMKEAW/Concierge-Career.git
cd Concierge-Career
code .
```

If the repository is already on your computer, open that folder in VS Code and use its terminal. You do not need to clone it again.

### 2. Install dependencies

Run once on a new machine, and again when dependency files change:

```powershell
python -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r backend/requirements.txt
pnpm install --frozen-lockfile
```

These commands use the virtual environment's Python directly, so activating the environment is not required.

### 3. Database and environment setup

**No environment file, API key, or cloud database is required for the default local demo.** The backend automatically applies migrations and seeds the fictional catalog when it starts. SQLite saves local profiles, saved jobs, and learning history in `concierge.db` in the repository root; this file is excluded from Git.

Optional configurations are described in [`.env.example`](.env.example). The backend reads process environment variables and does **not** automatically load a `.env` file. See [Optional configuration](#optional-configuration) for PostgreSQL or a separate backend address.

### 4. Run the demo

In the VS Code PowerShell terminal:

```powershell
& ".\Start Demo.cmd"
```

**Keep the quotes and `&`: the filename contains a space.** Typing `.\Start Demo.cmd` without quotes makes PowerShell interpret `.\Start` as the command.

The launcher builds the production frontend when it needs to start it, starts both services in background processes, checks that they are ready, and opens the browser. You can also double-click **Start Demo.cmd** in File Explorer.

Open [http://127.0.0.1:3000](http://127.0.0.1:3000). API documentation is available at [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs).

### Running it next time

Open the same repository folder in VS Code and run:

```powershell
& ".\Start Demo.cmd"
```

You do not need to reinstall dependencies for each session. The launcher reuses healthy services that are already running. After restarting Windows or stopping those processes, run it again. Closing the browser does not stop its background services; a browser bookmark cannot start them.

Localhost is accessible on your own computer while the services are running. To share the website online, see [Render deployment](docs/deployment.md).

### Development mode: edit and see changes

Use this instead of the background launcher when developing. Keep **two VS Code terminals** open in the repository root, and keep both services running. Stop any launcher-started services on ports 3000 and 8000 before switching to this mode.

**Terminal 1 — backend:**

```powershell
.\.venv\Scripts\python.exe -m uvicorn backend.app.main:app --reload --host 127.0.0.1 --port 8000
```

**Terminal 2 — frontend:**

```powershell
pnpm dev
```

Open [http://127.0.0.1:3000](http://127.0.0.1:3000). Changes reload during development. Press **Ctrl+C in each terminal** to stop the corresponding service.

On macOS/Linux, use `python3 -m venv .venv` and `.venv/bin/python` in place of the Windows Python commands. Run the two development services above with those paths; the `.cmd` launcher is Windows-only.

### Troubleshooting

| Problem | What to check |
| --- | --- |
| `'.\Start' is not recognized` | Use exactly `& ".\Start Demo.cmd"` from the repository root |
| `python`, `node`, or `pnpm` is not recognized | Install the prerequisites, then reopen the VS Code terminal |
| Python environment or frontend dependencies are missing | Complete step 2 before starting |
| Port 3000 or 8000 is occupied | Stop the existing service using that port before starting another; the launcher does not stop unrelated processes |
| The UI appears stale after updating code | Refresh with **Ctrl+Shift+R**; running production services must also be restarted and the frontend rebuilt to use new code |
| Career service is unavailable | Make sure both services are running; check `.runtime/` startup logs or the backend terminal |

For launcher diagnostics without opening a browser:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File scripts/start-demo.ps1 -NoBrowser
```

---

## Optional configuration

SQLite needs no configuration. To use an existing PostgreSQL database, set this in the backend terminal **before** starting the backend, replacing the example credentials:

```powershell
$env:DATABASE_URL='postgresql+psycopg://concierge:localdemo@localhost:5432/concierge'
```

To use a backend elsewhere, set `BACKEND_URL=https://your-backend-host` in `frontend/.env.local`; Next.js proxies `/api` to that service. Restart the development server or rebuild production after changing it. Never commit real environment files or credentials.

### Local PostgreSQL with Docker Compose

With Docker and Compose installed, run from the repository root:

```sh
docker compose up --build
```

Compose launches PostgreSQL 17, FastAPI, and the production frontend on localhost. `localdemo` is a demonstration password. Use this as an alternative to the launcher or development terminals, since they use the same ports. A configured database failure is surfaced, never silently redirected to another database.

---

## Competition demo

1. **Try demo profile** loads Puripatjudhai when no session exists. Use **Continue demo** to keep existing progress or **Start fresh demo** to reset it after confirmation.
2. Review seven skills, three projects, education, and a web internship.
3. **Choose Career Interest → Frontend Developer**.
4. Show eight analyzed jobs and readiness **78**.
5. Open NovaTech's top match (**87**), compare requirements, and inspect score components.
6. Open Skill gaps, then My learning.
7. Complete **TypeScript Fundamentals**: explicitly simulated Intermediate proficiency.
8. Observe **78 → 85**, **87 → 92**, more ready-to-apply roles, and Testing as the next priority.
9. **Reset demo** asks for confirmation, then restores the current session's Puripatjudhai profile and clears its saved jobs/progress.

See [the 4–5 minute presentation script](docs/demo-flow.md).

## Project structure

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
| Shortlist | `GET /api/users/{user_id}/saved-jobs`, `/saved-job-matches`, `PUT/DELETE .../{job_id}` |
| Concierge | `POST /api/concierge/chat` |

The scaffold's `/health` and `/api/v1/overview` remain deprecated compatibility endpoints. The old overview is the original fixture; the new interface does not use it.

## Verification

For Python linting, first install Ruff into the virtual environment:

```powershell
.\.venv\Scripts\python.exe -m pip install ruff==0.11.10
```

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

CI includes SQLite/PostgreSQL API tests, production build, and browser tests. Regenerate contracts after schema changes:

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

## Theme

Colors are defined in [`frontend/app/globals.css`](frontend/app/globals.css). Typography uses **Segoe UI**, with Arial and sans-serif fallbacks; icons use **Lucide React**.

| Token | Hex | Used for |
| --- | --- | --- |
| `--bg` / `--surface` | `#ffffff` | Page background and cards |
| `--surface2` | `#f6f8fc` | Secondary surfaces |
| `--text` | `#13233e` | Navy text |
| `--blue` | `#2463eb` | Primary actions and score graphics |
| `--border` | `#e1e8f2` | Borders |
| `--muted` | `#5d6b82` | Secondary text |
| `--green` | `#087e69` | Positive status |
| `--amber` | `#946117` | Gaps and preparation status |

See [the review-fix report](docs/review-fixes.md) for the latest usability changes, test evidence, dataset changes, and remaining demo limitations.
