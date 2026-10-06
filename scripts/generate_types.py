"""Generate TS wire types directly from Pydantic's exported OpenAPI schemas."""

import json
from pathlib import Path

schemas = json.loads(Path("shared/contracts/openapi.json").read_text())["components"]["schemas"]


def convert(schema):
    if "$ref" in schema:
        return schema["$ref"].rsplit("/", 1)[-1]
    if "anyOf" in schema:
        return " | ".join(convert(s) for s in schema["anyOf"])
    if "enum" in schema:
        return " | ".join(json.dumps(s) for s in schema["enum"])
    kind = schema.get("type")
    if kind == "array":
        return "(" + convert(schema["items"]) + ")[]"
    if kind == "object":
        if "additionalProperties" in schema:
            value = schema["additionalProperties"]
            return (
                "Record<string, " + (convert(value) if isinstance(value, dict) else "unknown") + ">"
            )
        required = list(schema.get("properties", {}))
        return (
            "{ "
            + "; ".join(
                json.dumps(k) + ("" if k in required else "?") + ": " + convert(v)
                for k, v in schema.get("properties", {}).items()
            )
            + " }"
        )
    return {
        "integer": "number",
        "number": "number",
        "boolean": "boolean",
        "null": "null",
        "string": "string",
    }.get(kind, "unknown")


lines = ["// Generated from shared/contracts/openapi.json. Do not edit."]
for name, schema in schemas.items():
    lines.append("export type " + name + " = " + convert(schema) + ";")
Path("frontend/lib/api.generated.ts").write_text("\n".join(lines) + "\n", encoding="utf-8")
print("Generated TypeScript API types.")
