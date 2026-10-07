# Render trial deployment

The root `render.yaml` provisions two Free web services and a Free PostgreSQL database in Singapore, all from the feature branch. No local personal database is uploaded. Hosted data begins with the fictional seed.

1. Connect a Render account and authorize this GitHub repository.
2. Create a Blueprint from `PURIPATPROMKEAW/Concierge-Career`, branch `feature/ai-career-concierge-demo`, path `render.yaml`.
3. Review that all three resources use **Free** plans before applying.
4. Wait for the API and frontend to become healthy. Share the frontend's returned HTTPS URL.

The frontend proxies `/api` to the API service. Render's backend hostname is referenced automatically in the build configuration; no browser request targets localhost. The database connection is injected from the managed PostgreSQL resource and normalized to the psycopg driver.

Hosted mode enables `REQUIRE_PROFILE_OWNERSHIP=true` and `COOKIE_SECURE=true`. Each browser has a random HttpOnly, Secure, SameSite=Lax session cookie. Only a hash is stored against newly created profiles. Knowing another profile ID does not grant access. Clearing browser cookies loses access to existing anonymous profiles; create a new profile in that case. Account-based cross-device access is not included.

Local mode keeps ownership optional for existing demo data. Do not disable ownership on public services. The seed template is inaccessible through profile endpoints in hosted mode.

Free web services sleep after inactivity, causing cold-start delays. Free PostgreSQL expires after 30 days. This deployment is for short-term testing; choose a paid database before storing data you need to keep. Confirm these limits in [Render's current documentation](https://render.com/docs/free).

Validation before sharing: create profiles in two separate browser sessions, confirm neither can access the other, run the complete Alex score-improvement journey, and refresh to confirm persistence. Never use a local development database as a deployment fixture.
