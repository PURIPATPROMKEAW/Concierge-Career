import { test, expect } from "@playwright/test";
test("Puripatjudhai: profile first, analysis, exact improvement, persistence and reset", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/");
  await expect(page.getByRole("heading", { name: /Find where/ })).toBeVisible();
  await page
    .getByRole("button", { name: "Try demo profile", exact: true })
    .click();
  await expect(
    page.getByRole("heading", {
      name: "This is your starting point, Puripatjudhai.",
    }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Choose Career Interest" }).click();
  await page
    .getByRole("button", { name: /Frontend Developer/ })
    .click();
  await expect(
    page.getByRole("heading", {
      name: "Your next chapter looks promising, Puripatjudhai.",
    }),
  ).toBeVisible();
  await expect(page.locator(".score-ring strong")).toHaveText("78");
  await page
    .locator(".job-list .job-card")
    .first()
    .getByRole("button", { name: "View match" })
    .click();
  await expect(page.locator(".score-ring strong")).toHaveText("87");
  await page.getByRole("button", { name: "Save job", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Saved", exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Prepare application" }).click();
  await expect(
    page.getByText(
      "This is a fictional position. No application will be sent.",
    ),
  ).toBeVisible();
  await page.getByRole("button", { name: "Done preparing" }).click();
  await page.getByRole("button", { name: "Ask Concierge" }).click();
  await page.getByRole("button", { name: "Why did I get this score?" }).click();
  await expect(page.locator(".chat-bubble.answer")).toContainText("87/100");
  await page.getByRole("button", { name: "Close concierge" }).click();
  await page.getByRole("button", { name: "View skill gaps" }).click();
  await expect(page.locator(".gap-card").first()).toContainText("TypeScript");
  await page.getByRole("button", { name: "My learning", exact: true }).click();
  await page
    .locator(".learning-card")
    .filter({ hasText: "TypeScript Fundamentals" })
    .getByRole("button", { name: "Complete demo learning" })
    .click();
  await expect(page.locator(".progress-banner")).toContainText("78 → 85");
  await expect(page.locator(".progress-banner")).toContainText("87 → 92");
  await expect(page.locator(".priority-row").first()).toContainText(
    "Frontend Testing",
  );
  await page.reload();
  await page.getByRole("button", { name: "My profile", exact: true }).click();
  await expect(
    page.locator(".profile-skill").filter({ hasText: "TypeScript" }),
  ).toContainText("Intermediate");
  await page.getByRole("button", { name: "Reset demo", exact: true }).click();
  await page.getByRole("button", { name: "Start fresh demo", exact: true }).click();
  await expect(
    page.locator(".profile-skill").filter({ hasText: "TypeScript" }),
  ).toHaveCount(0);
  expect(errors).toEqual([]);
});

test("manual profile and responsive layout", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await page.getByRole("button", { name: "Build my career profile" }).click();
  await page
    .getByRole("textbox", { name: "Your name", exact: true })
    .fill("Sam");
  await page
    .getByRole("button", { name: "Skills", exact: false })
    .filter({ hasText: "2Skills" })
    .click();
  await page.getByLabel("Add a skill").selectOption("javascript");
  await page.getByRole("button", { name: "Create My Career Profile" }).click();
  await expect(
    page.getByRole("heading", { name: "This is your starting point, Sam." }),
  ).toBeVisible();
  const width = await page.evaluate(() => ({
    body: document.documentElement.scrollWidth,
    viewport: innerWidth,
  }));
  expect(width.body).toBeLessThanOrEqual(width.viewport);
});
