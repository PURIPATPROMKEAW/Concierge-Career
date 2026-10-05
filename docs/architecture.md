# Architecture

Browser → frontend service → FastAPI route → CareerService → repository / ConciergeAgent → PostgreSQL / AIProvider.

The frontend owns presentation and interaction state. It imports generated OpenAPI types, never backend or AI implementation code. Local demo mode reads a shared fixture; API mode uses HTTP with timeout and visible failure states.

The backend is the composition boundary. Routes validate output and translate infrastructure errors. Services orchestrate, repositories load data, and the AI layer handles matching/recommendations without depending on FastAPI or SQLAlchemy. Only MockAIProvider is implemented. Add a live provider behind AIProvider after agreeing on consent, costs, structured validation, timeouts, and evaluation.

PostgreSQL stores a minimal career profile today. Demo mode explicitly bypasses it. Database failures in database mode return 503, never quietly become demo mode. Alembic owns schema changes; seeding does not overwrite existing profiles.

Shared contract: Pydantic → exported OpenAPI → generated TypeScript. Test verifies the backend mock response matches the frontend fixture. Sample matching is normalized, deduplicated equal-weight required-skill coverage; it is not a readiness or employment prediction.

Planned schema expansion: users, goals, skills/user_skills, projects, experiences, jobs/job_skills, roadmaps/milestones/tasks, learning resources, saved jobs, applications, progress events, conversations/messages, and memory. Add migrations as features land, rather than creating unused tables now.

Local demo has no authentication or user isolation. Before public deployment add authentication, authorization, ownership checks, upload limits and validation, rate limits, logging/redaction, secrets management, and retention/deletion controls. Do not connect real candidate records to this scaffold.
