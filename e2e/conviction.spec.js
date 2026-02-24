import { expect, test } from "@playwright/test";
import { seedThesis } from "./helpers.js";

test.describe("Conviction Scorecard", () => {
  test.beforeEach(async ({ page }) => {
    await seedThesis(page);
  });

  test("loads conviction page", async ({ page }) => {
    await page.goto("/conviction");
    await expect(page.locator("h1")).toContainText("Conviction Ledger");
  });

  test("shows batting average ring", async ({ page }) => {
    await page.goto("/conviction");
    await expect(page.locator("text=batting avg")).toBeVisible();
  });

  test("shows New Prediction button", async ({ page }) => {
    await page.goto("/conviction");
    await expect(
      page.locator("button", { hasText: "New Prediction" }),
    ).toBeVisible();
  });

  test("opens prediction form on button click", async ({ page }) => {
    await page.goto("/conviction");
    await page.locator("button", { hasText: "New Prediction" }).click();
    await page.waitForTimeout(500);

    // Form should now be visible with labels (rendered uppercase via CSS)
    await expect(page.locator("text=Template").first()).toBeAttached();
    await expect(page.locator("text=Target Date")).toBeAttached();
    await expect(page.locator("text=Signal").first()).toBeAttached();
  });

  test("prevents submission without signal selection", async ({ page }) => {
    await page.goto("/conviction");
    await page.locator("button", { hasText: "New Prediction" }).click();
    await page.waitForTimeout(500);

    // The signal select should default to "Choose a signal" placeholder
    const signalSelect = page.locator("select").nth(1);
    await expect(signalSelect).toBeVisible();

    // Attempt to submit — browser validation or JS validation should block
    await page.locator("button", { hasText: "Save Prediction" }).click();
    await page.waitForTimeout(500);

    // Verify no prediction was created (still shows "No predictions yet")
    await expect(page.locator("text=No predictions yet")).toBeAttached();
  });

  test("shows Active and Scored sections", async ({ page }) => {
    await page.goto("/conviction");
    // Active and Scored sections are always rendered (below the form area)
    await expect(page.locator("text=Active (0)")).toBeAttached();
    await expect(page.locator("text=Scored (0)")).toBeAttached();
  });
});
