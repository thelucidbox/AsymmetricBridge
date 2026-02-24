import { expect, test } from "@playwright/test";
import { seedThesis } from "./helpers.js";

test.describe("Navigation", () => {
  test.beforeEach(async ({ page }) => {
    await seedThesis(page);
  });

  test("dashboard loads at /", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveURL(/\/$/);
    await expect(page.locator("nav")).toBeVisible();
  });

  test("navigates to Performance Lab", async ({ page }) => {
    await page.goto("/performance");
    await expect(page).toHaveURL(/\/performance/);
  });

  test("navigates to Conviction", async ({ page }) => {
    await page.goto("/conviction");
    await expect(page).toHaveURL(/\/conviction/);
  });

  test("navigates to Digests", async ({ page }) => {
    await page.goto("/digests");
    await expect(page).toHaveURL(/\/digests/);
  });

  test("navigates to Glossary", async ({ page }) => {
    await page.goto("/glossary");
    await expect(page).toHaveURL(/\/glossary/);
  });

  test("nav buttons work for section switching", async ({ page }) => {
    await page.goto("/");

    const perfBtn = page
      .locator("button", { hasText: "Performance Lab" })
      .first();
    await perfBtn.click();
    await page.waitForTimeout(500);
    await expect(page).toHaveURL(/\/performance/);
  });

  test("shows version footer on dashboard", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("text=v3.2")).toBeVisible();
  });
});

test.describe("Theme toggle", () => {
  test.beforeEach(async ({ page }) => {
    await seedThesis(page);
  });

  test("terminal theme is applied by default", async ({ page }) => {
    await page.goto("/");
    const theme = await page.evaluate(() =>
      document.documentElement.getAttribute("data-ab-theme"),
    );
    expect(["terminal", null]).toContain(theme);
  });

  test("can switch to observatory theme", async ({ page }) => {
    await page.goto("/");
    const obsBtn = page.locator("button", { hasText: "Observatory" }).first();
    if (await obsBtn.isVisible()) {
      await obsBtn.click({ force: true });
      await page.waitForTimeout(500);
      const theme = await page.evaluate(() =>
        document.documentElement.getAttribute("data-ab-theme"),
      );
      expect(theme).toBe("observatory");
    }
  });
});

test.describe("Display mode toggle", () => {
  test.beforeEach(async ({ page }) => {
    await seedThesis(page);
  });

  test("simplified and full buttons exist", async ({ page }) => {
    await page.goto("/");
    await expect(
      page.locator("button", { hasText: "Simplified" }).first(),
    ).toBeVisible();
    await expect(
      page.locator("button", { hasText: "Full" }).first(),
    ).toBeVisible();
  });

  test("simplified button has aria-pressed", async ({ page }) => {
    await page.goto("/");
    const btn = page.locator("button", { hasText: "Simplified" }).first();
    const pressed = await btn.getAttribute("aria-pressed");
    expect(["true", "false"]).toContain(pressed);
  });
});
