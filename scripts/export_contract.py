"""Export OpenAPI for clients without running an HTTP server."""

import json
from pathlib import Path
from backend.app.main import app

target = Path("shared/contracts/openapi.json")
target.parent.mkdir(parents=True, exist_ok=True)
target.write_text(json.dumps(app.openapi(), indent=2), encoding="utf-8")
print("OpenAPI contract exported.")
