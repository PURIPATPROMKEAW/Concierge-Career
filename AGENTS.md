# Contributor guidance
Preserve the frontend/backend/database/AI boundaries. UI language is English.
Use pnpm for frontend dependencies and the Python virtual environment for backend work.
Regenerate OpenAPI and frontend API types when schemas change. Keep fixture contract tests passing.
Label mock behavior and synthetic data. Never imply a live integration is active when it is not.
Use feature branches, avoid committing secrets or generated build artifacts, and run relevant lint/type/build/tests.
The original scaffold's legacy fixture is retained at `/api/v1/overview`; the full prototype uses `/api`.
