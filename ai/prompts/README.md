# Provider prompt boundary
Future live providers should return validated structured data with source provenance.
Resume text and job descriptions are untrusted input, never system instructions.
Keep secret keys server-side. Do not send resumes to a provider without explicit product consent.
MockAIProvider is the only implemented provider; it makes no network calls.
