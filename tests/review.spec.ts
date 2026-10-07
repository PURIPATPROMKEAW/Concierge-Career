import { test, expect, type Page } from "@playwright/test";

async function start(page: Page, career = "Frontend Developer") {
  await page.goto("/");
  await page
    .getByRole("button", { name: "Try demo profile", exact: true })
    .click();
  await expect(
    page.getByText("Ready for review", { exact: false }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Choose Career Interest" }).click();
  await page.getByRole("button", { name: new RegExp(career) }).click();
  await expect(page.locator(".score-ring strong")).toBeVisible();
}

test("saved jobs span careers, restore detail, and distinguish filtered empty results", async ({
  page,
}) => {
  await start(page);
  await page
    .locator(".job-list .job-card")
    .first()
    .getByRole("button", { name: "View match" })
    .click();
  await page.getByRole("button", { name: "Save job", exact: true }).click();
  await page.reload();
  await expect(page.locator(".requirements-table")).toBeVisible();
  await expect(page.locator(".score-ring strong")).toHaveText("87");
  await page
    .getByRole("button", { name: "Career analysis", exact: true })
    .click();
  await page.getByRole("button", { name: /Data Scientist/ }).click();
  await expect(
    page.getByRole("heading", { name: /Build your foundation first/ }),
  ).toBeVisible();
  await expect(page.locator(".foundation-plan")).toBeVisible();
  await page.getByRole("button", { name: /^Saved jobs/ }).click();
  await expect(page.locator(".job-list .job-card")).toHaveCount(1);
  await page.getByLabel("Search jobs").fill("no-such-company");
  await expect(
    page.getByText("No opportunities match this filter."),
  ).toBeVisible();
  await page.getByRole("button", { name: "Clear filters" }).click();
  await page
    .locator(".job-card")
    .getByRole("button", { name: "View match" })
    .click();
  await expect(page.locator(".score-ring strong")).toHaveText("87");
});

test("manual edit re-analyzes, learning history survives reload, and priority chat compares actual gaps", async ({
  page,
}) => {
  await start(page);
  await page.getByRole("button", { name: "Ask Concierge" }).click();
  await page.getByRole("button", { name: /Compare/ }).click();
  await expect(page.locator(".chat-bubble.answer")).toContainText(
    "weighted deficit",
  );
  await expect(page.locator(".chat-bubble.answer")).toContainText("break ties");
  await page.getByRole("button", { name: "Close concierge" }).click();
  await page.getByRole("button", { name: "Edit profile", exact: true }).click();
  await page.getByRole("button").filter({ hasText: "2Skills" }).click();
  await page.getByLabel("react proficiency", { exact: true }).selectOption("2");
  await page
    .getByRole("button", { name: "Save & re-analyze Frontend Developer" })
    .click();
  await expect(page.locator(".progress-banner")).toContainText(
    "Your saved profile was re-analyzed",
  );
  await page.getByRole("button", { name: "My learning", exact: true }).click();
  await page
    .locator(".learning-card")
    .filter({ hasText: "TypeScript Fundamentals" })
    .getByRole("button", { name: "Complete demo learning" })
    .click();
  await page.getByRole("button", { name: "My learning", exact: true }).click();
  await expect(page.locator(".completed-learning")).toContainText(
    "TypeScript Fundamentals",
  );
  await page.reload();
  await expect(page.locator(".completed-learning")).toContainText(
    "Recorded at completion time",
  );
  await expect(page.locator(".notice-toast")).toHaveCount(0);
  await page.locator(".brand-button").click();
  await page
    .getByRole("button", { name: "Continue demo", exact: true })
    .click();
  await page.getByRole("button", { name: "My learning", exact: true }).click();
  await expect(page.locator(".completed-learning")).toContainText(
    "TypeScript Fundamentals",
  );
  await page.locator(".brand-button").click();
  await page
    .getByRole("button", { name: /Start fresh demo — reset progress/ })
    .click();
  await page.getByRole("button", { name: "Keep my progress" }).click();
  await page
    .getByRole("button", { name: "Continue demo", exact: true })
    .click();
  await page.getByRole("button", { name: "My learning", exact: true }).click();
  await expect(page.locator(".completed-learning")).toContainText(
    "TypeScript Fundamentals",
  );
});

test("job details preserve every requirement on 320, 375, 390 and 430px screens", async ({
  page,
}) => {
  await start(page, "Data Scientist");
  await page
    .locator(".job-list .job-card")
    .first()
    .getByRole("button", { name: "View match" })
    .click();
  await expect(page.locator(".requirements-table")).toBeVisible();
  for (const width of [320, 375, 390, 430]) {
    await page.setViewportSize({ width, height: 844 });
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth),
    ).toBeLessThanOrEqual(width);
    const rows = page.locator(".table-row");
    expect(await rows.count()).toBeGreaterThan(0);
    for (const row of await rows.all()) {
      await expect(row.locator('[data-label="Expected"]')).toBeVisible();
      await expect(row.locator('[data-label="Your profile"]')).toBeVisible();
      await expect(row.locator('[data-label="Alignment"]')).toBeVisible();
    }
  }
});
