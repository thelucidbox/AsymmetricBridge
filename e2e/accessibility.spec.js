import { expect, test } from "@playwright/test";
import { seedThesis } from "./helpers.js";

test.describe("Skip-to-content link", () => {
  test.beforeEach(async ({ page }) => {
    await seedThesis(page);
  });

  test("skip link exists and targets main-content", async ({ page }) => {
    await page.goto("/");
    const skipLink = page.locator("a.ab-skip-link");
    await expect(skipLink).toHaveAttribute("href", "#main-content");
  });

  test("skip link becomes visible on focus", async ({ page }) => {
    await page.goto("/");
    await page.keyboard.press("Tab");
    const skipLink = page.locator("a.ab-skip-link");
    await expect(skipLink).toBeVisible();
  });

  test("main-content landmark exists", async ({ page }) => {
    await page.goto("/");
    const main = page.locator("main#main-content");
    await expect(main).toBeAttached();
  });
});

test.describe("Semantic headings", () => {
  test.beforeEach(async ({ page }) => {
    await seedThesis(page);
  });

  test("Performance Lab page loads", async ({ page }) => {
    await page.goto("/performance");
    // h1 only appears after uploading portfolio data; verify page loads with CSV ingest
    await expect(page.locator("text=Portfolio CSV Ingest")).toBeAttached();
  });

  test("Conviction page has h1", async ({ page }) => {
    await page.goto("/conviction");
    const heading = page.locator("h1");
    await expect(heading).toBeAttached();
    await expect(heading).toContainText("Conviction Ledger");
  });

  test("Digests page has h1", async ({ page }) => {
    await page.goto("/digests");
    const heading = page.locator("h1");
    await expect(heading).toBeAttached();
    await expect(heading).toContainText("Signal Digest Engine");
  });

  test("domino sections use heading role", async ({ page }) => {
    await page.goto("/");
    // DominoSections render within the Signals > Tracker tab (default view)
    // Wait for at least one heading to be attached before counting
    const headings = page.locator('[role="heading"][aria-level="2"]');
    await expect(headings.first()).toBeAttached({ timeout: 10000 });
    const count = await headings.count();
    expect(count).toBeGreaterThan(0);
  });
});

test.describe("aria-live regions", () => {
  test.beforeEach(async ({ page }) => {
    await seedThesis(page);
  });

  test("CommandCenter has polite aria-live for signal summary", async ({
    page,
  }) => {
    await page.goto("/");
    const liveRegion = page.locator('[aria-live="polite"]');
    await expect(liveRegion.first()).toBeAttached();
  });

  test("ConvictionScorecard has assertive aria-live for form errors", async ({
    page,
  }) => {
    await page.goto("/conviction");
    // aria-live is inside the prediction form — open it first
    await page.locator("button", { hasText: "New Prediction" }).click();
    await page.waitForTimeout(300);
    const liveRegion = page.locator('[aria-live="assertive"]');
    await expect(liveRegion).toBeAttached();
  });

  test("DigestView has assertive aria-live for feedback", async ({ page }) => {
    await page.goto("/digests");
    const liveRegion = page.locator('[aria-live="assertive"]');
    await expect(liveRegion).toBeAttached();
  });
});

test.describe("Focus-visible styling", () => {
  test.beforeEach(async ({ page }) => {
    await seedThesis(page);
  });

  test("focus-visible CSS rule exists", async ({ page }) => {
    await page.goto("/");
    const hasFocusVisible = await page.evaluate(() => {
      const sheets = [...document.styleSheets];
      for (const sheet of sheets) {
        try {
          for (const rule of sheet.cssRules) {
            if (
              rule.selectorText &&
              rule.selectorText.includes(":focus-visible")
            ) {
              return true;
            }
          }
        } catch {
          // Cross-origin sheets
        }
      }
      return false;
    });
    expect(hasFocusVisible).toBe(true);
  });
});
