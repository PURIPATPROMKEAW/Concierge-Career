# Contributor guidance
Preserve the frontend/backend/database/AI boundaries. UI language is English.
Use pnpm for frontend dependencies and the Python virtual environment for backend work.
Regenerate OpenAPI and frontend API types when schemas change. Keep the fixture contract test passing.
Label mock behavior and synthetic data. Never imply a live integration is active when it is not.
Use feature branches, avoid committing secrets or generated build artifacts, and run relevant lint/type/build/tests.
Reference docs/prototype-plan.md for future scope; do not treat planned endpoints as implemented.
