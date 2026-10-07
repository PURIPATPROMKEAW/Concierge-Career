"""Anonymous browser sessions own profiles without requiring a login."""

import hashlib
import os
import secrets
from contextvars import ContextVar

visitor_hash = ContextVar("visitor_hash", default=None)
COOKIE_NAME = "concierge_session"


def ownership_required():
    return os.getenv("REQUIRE_PROFILE_OWNERSHIP", "false").lower() == "true"


def hash_session(value):
    return hashlib.sha256(value.encode()).hexdigest()


async def session_middleware(request, call_next):
    session = request.cookies.get(COOKIE_NAME)
    fresh = not session or len(session) != 64
    if fresh:
        session = secrets.token_hex(32)
    context = visitor_hash.set(hash_session(session))
    try:
        response = await call_next(request)
        if (
            fresh
            and request.method == "POST"
            and request.url.path in {"/api/profile", "/api/demo/profile"}
            and response.status_code < 400
        ):
            response.set_cookie(
                COOKIE_NAME,
                session,
                httponly=True,
                secure=os.getenv("COOKIE_SECURE", "false").lower() == "true",
                samesite="lax",
                max_age=60 * 60 * 24 * 30,
                path="/",
            )
        return response
    finally:
        visitor_hash.reset(context)
