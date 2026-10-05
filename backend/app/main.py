from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.app.api.routes import router
from backend.app.core.config import get_settings

app = FastAPI(title="Concierge Career API", version="0.1.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=get_settings().cors_origins,
    allow_methods=["GET"],
    allow_headers=["Content-Type"],
)
app.include_router(router)


@app.get("/health")
def health():
    return {"status": "ok", "data_mode": get_settings().data_mode, "ai_provider": "mock"}
