const base = process.env.NEXT_PUBLIC_API_URL || "/api";
export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}
export async function api<T>(
  path: string,
  method = "GET",
  body?: unknown,
): Promise<T> {
  // Reads are safe to retry; a timed-out write may already have succeeded.
  const deadline = Date.now() + (method === "GET" ? 180000 : 95000);
  while (true) {
    const controller = new AbortController();
    const timer = setTimeout(
      () => controller.abort(),
      Math.min(95000, Math.max(1, deadline - Date.now())),
    );
    try {
      const response = await fetch(base + path, {
        method,
        credentials: "include",
        cache: "no-store",
        headers:
          body instanceof FormData
            ? {}
            : { "Content-Type": "application/json" },
        body:
          body instanceof FormData
            ? body
            : body === undefined
              ? undefined
              : JSON.stringify(body),
        signal: controller.signal,
      });
      if ([502, 503, 504].includes(response.status))
        throw new TypeError("Service unavailable");
      const data = await response.json();
      if (!response.ok)
        throw new ApiError(
          typeof data.detail === "string"
            ? data.detail
            : "Please review the form fields and try again.",
          response.status,
        );
      return data as T;
    } catch (error) {
      if (
        error instanceof TypeError ||
        error instanceof SyntaxError ||
        (error instanceof Error && error.name === "AbortError")
      ) {
        if (method === "GET" && Date.now() + 5000 < deadline) {
          clearTimeout(timer);
          await new Promise((resolve) => setTimeout(resolve, 5000));
          continue;
        }
        throw new Error(
          "The career service could not connect after waiting for it to start. Please retry. If this continues, the service or database may be unavailable.",
        );
      }
      throw error;
    } finally {
      clearTimeout(timer);
    }
  }
}
