const base = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api";
export async function api<T>(
  path: string,
  method = "GET",
  body?: unknown,
): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 20000);
  try {
    const response = await fetch(base + path, {
      method,
      headers:
        body instanceof FormData ? {} : { "Content-Type": "application/json" },
      body:
        body instanceof FormData
          ? body
          : body === undefined
            ? undefined
            : JSON.stringify(body),
      signal: controller.signal,
    });
    const data = await response.json();
    if (!response.ok)
      throw new Error(
        typeof data.detail === "string"
          ? data.detail
          : "Please review the form fields and try again.",
      );
    return data as T;
  } catch (error) {
    if (
      error instanceof TypeError ||
      (error instanceof Error && error.name === "AbortError")
    )
      throw new Error(
        "Cannot reach the career service. Check that the backend is running, then retry.",
      );
    throw error;
  } finally {
    clearTimeout(timer);
  }
}
