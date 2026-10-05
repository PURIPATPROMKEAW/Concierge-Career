import fixture from "../../shared/fixtures/overview.json";
import type { components } from "./api.generated";
export type Overview = components["schemas"]["Overview"];
export async function getOverview(): Promise<Overview> {
  if ((process.env.NEXT_PUBLIC_DATA_MODE ?? "demo") === "demo")
    return fixture as Overview;
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000"}/api/v1/overview`,
    { signal: AbortSignal.timeout(10000) },
  );
  if (!response.ok)
    throw new Error("The career service is unavailable. Please try again.");
  return response.json();
}
