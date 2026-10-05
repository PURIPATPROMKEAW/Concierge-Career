import json
from pathlib import Path

from backend.app.main import app

if __name__ == "__main__":
    target = Path(__file__).resolve().parents[2] / "shared/contracts/openapi.json"
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_text(json.dumps(app.openapi(), indent=2) + "\n", encoding="utf-8")
