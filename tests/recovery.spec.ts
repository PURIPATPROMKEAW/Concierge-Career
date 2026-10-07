import { test, expect } from "@playwright/test";

test("cold API start recovers automatically from an HTML 503", async ({
  page,
}) => {
  let attempts = 0;
  await page.route("**/api/health", async (route) => {
    attempts += 1;
    if (attempts === 1) {
      await route.fulfill({
        status: 503,
        contentType: "text/html",
        body: "Waking up",
      });
    } else {
      await route.continue();
    }
  });
  await page.goto("/");
  await expect(
    page.getByRole("status").filter({ hasText: "Retrying automatically" }),
  ).toBeVisible();
  await expect(
    page.getByRole("status").filter({ hasText: "Retrying automatically" }),
  ).toHaveCount(0, { timeout: 15000 });
  expect(attempts).toBeGreaterThanOrEqual(2);
  await expect(page.locator(".error-toast")).toHaveCount(0);
  await page
    .getByRole("button", { name: "Try demo profile", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "This is your starting point, Alex." }),
  ).toBeVisible();
});

test("transient profile failure preserves the remembered profile", async ({
  page,
}) => {
  const response = await page.request.post("/api/demo/profile");
  const profile = await response.json();
  await page.addInitScript(
    (id) => localStorage.setItem("concierge-profile", id),
    profile.id,
  );
  let attempts = 0;
  await page.route(`**/api/profile/${profile.id}`, async (route) => {
    attempts += 1;
    if (attempts === 1)
      await route.fulfill({ status: 502, body: "Bad gateway" });
    else await route.continue();
  });
  await page.goto("/");
  await expect(
    page.getByRole("status").filter({ hasText: "Retrying automatically" }),
  ).toHaveCount(0, { timeout: 15000 });
  await expect.poll(() => attempts).toBeGreaterThanOrEqual(2);
  expect(
    await page.evaluate(() => localStorage.getItem("concierge-profile")),
  ).toBe(profile.id);
  await expect(page.locator(".error-toast")).toHaveCount(0);
});

test("failed profile creation is not automatically submitted again", async ({
  page,
}) => {
  let writes = 0;
  await page.route("**/api/demo/profile", async (route) => {
    writes += 1;
    await route.fulfill({ status: 503, body: "Unavailable" });
  });
  await page.goto("/");
  await expect(
    page.getByRole("status").filter({ hasText: "Retrying automatically" }),
  ).toHaveCount(0, { timeout: 15000 });
  await page
    .getByRole("button", { name: "Try demo profile", exact: true })
    .click();
  await expect(page.locator(".error-toast")).toContainText("could not connect");
  expect(writes).toBe(1);
});
