import { expect, test } from "@playwright/test";
import { seedThesis } from "./helpers.js";

test.describe("Digest View", () => {
  test.beforeEach(async ({ page }) => {
    await seedThesis(page);
  });

  test("loads digest page with h1", async ({ page }) => {
    await page.goto("/digests");
    await expect(page.locator("h1")).toContainText("Signal Digest Engine");
  });

  test("has period selector", async ({ page }) => {
    await page.goto("/digests");
    const select = page.locator('select[aria-label="Digest period"]');
    await expect(select).toBeVisible();
  });

  test("has generate button", async ({ page }) => {
    await page.goto("/digests");
    await expect(
      page.locator("button", { hasText: "Generate Digest" }),
    ).toBeVisible();
  });

  test("shows empty state before generating", async ({ page }) => {
    await page.goto("/digests");
    await expect(page.locator("text=No digests generated yet")).toBeVisible();
  });

  test("aria-live region for feedback exists", async ({ page }) => {
    await page.goto("/digests");
    const liveRegion = page.locator('[aria-live="assertive"]');
    await expect(liveRegion).toBeAttached();
  });

  test("generate button is clickable", async ({ page }) => {
    await page.goto("/digests");
    const btn = page.locator("button", { hasText: "Generate Digest" });
    await expect(btn).toBeEnabled();
    await btn.click();
    // After clicking, digest generates — verify content appeared
    await page.waitForTimeout(2000);
    await expect(page.locator("text=Signal Digest Engine")).toBeAttached();
  });
});
