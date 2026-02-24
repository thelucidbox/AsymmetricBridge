import { expect, test } from "@playwright/test";
import { seedThesisNoTour, seedThesis } from "./helpers.js";

test.describe("Guided Tour", () => {
  test("shows tour on first dashboard visit with thesis", async ({ page }) => {
    await seedThesisNoTour(page);
    await page.goto("/");
    await page.waitForTimeout(500);
    const tourCard = page.locator('text="Guided Tour"');
    await expect(tourCard).toBeVisible();
  });

  test("does NOT show tour when no thesis (should redirect to onboarding)", async ({
    page,
  }) => {
    await page.addInitScript(() => {
      window.localStorage.clear();
    });
    await page.goto("/");
    await expect(page).toHaveURL(/\/onboarding/);
  });

  test("does NOT show tour after completion", async ({ page }) => {
    await seedThesis(page);
    await page.goto("/");
    await page.waitForTimeout(500);
    const tourCard = page.locator('[role="dialog"][aria-label="Guided tour"]');
    await expect(tourCard).not.toBeVisible();
  });

  test("tour has dialog role and aria-modal", async ({ page }) => {
    await seedThesisNoTour(page);
    await page.goto("/");
    await page.waitForTimeout(500);
    const dialog = page.locator('[role="dialog"][aria-modal="true"]');
    await expect(dialog).toBeVisible();
  });

  test("shows dynamic step count", async ({ page }) => {
    await seedThesisNoTour(page);
    await page.goto("/");
    await page.waitForTimeout(500);
    // Should show "Step 1 of N"
    const stepText = page.locator("text=/Step 1 of \\d/");
    await expect(stepText).toBeVisible();
  });

  test("Escape closes tour", async ({ page }) => {
    await seedThesisNoTour(page);
    await page.goto("/");
    await page.waitForTimeout(500);
    const dialog = page.locator('[role="dialog"]');
    await expect(dialog).toBeVisible();

    await page.keyboard.press("Escape");
    await page.waitForTimeout(300);
    await expect(dialog).not.toBeVisible();
  });

  test("Skip button closes tour", async ({ page }) => {
    await seedThesisNoTour(page);
    await page.goto("/");
    await page.waitForTimeout(500);

    await page.locator("button", { hasText: "Skip" }).click({ force: true });
    await page.waitForTimeout(300);
    const dialog = page.locator('[role="dialog"]');
    await expect(dialog).not.toBeVisible();
  });

  test("can navigate through tour steps and finish", async ({ page }) => {
    test.setTimeout(15000);
    await seedThesisNoTour(page);
    await page.goto("/");
    await page.waitForTimeout(500);

    const dialog = page.locator('[role="dialog"]');
    await expect(dialog).toBeVisible();

    // Walk through steps using Next button
    let steps = 0;
    while (steps < 10) {
      const finishBtn = page.locator("button", { hasText: "Finish" });
      const nextBtn = page.locator("button", { hasText: "Next" });

      if (await finishBtn.isVisible()) {
        // Use JS click to bypass viewport check — tour card uses fixed positioning
        await finishBtn.evaluate((el) => el.click());
        await page.waitForTimeout(500);
        break;
      }

      if (await nextBtn.isVisible()) {
        await nextBtn.scrollIntoViewIfNeeded();
        await nextBtn.click();
        await page.waitForTimeout(500);
        steps++;
      } else {
        break;
      }
    }

    await expect(dialog).not.toBeVisible();
    expect(steps).toBeGreaterThan(0);
  });

  test("focus trap keeps Tab within tour card", async ({ page }) => {
    await seedThesisNoTour(page);
    await page.goto("/");
    await page.waitForTimeout(500);

    const dialog = page.locator('[role="dialog"]');
    await expect(dialog).toBeVisible();

    // Tab several times — focus should stay within the card buttons
    for (let i = 0; i < 6; i++) {
      await page.keyboard.press("Tab");
    }

    // Active element should still be within the dialog
    const activeInDialog = await page.evaluate(() => {
      const dialog = document.querySelector('[role="dialog"]');
      return dialog ? dialog.contains(document.activeElement) : false;
    });
    expect(activeInDialog).toBe(true);
  });
});
