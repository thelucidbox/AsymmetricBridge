import { expect, test } from "@playwright/test";

test.describe("Onboarding flow", () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.clear();
    });
  });

  test("redirects to /onboarding when no thesis stored", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveURL(/\/onboarding/);
  });

  test("shows Welcome step with Quick Start and Custom Setup", async ({
    page,
  }) => {
    await page.goto("/onboarding");
    await expect(
      page.locator("button", { hasText: "Quick Start" }),
    ).toBeVisible();
    await expect(
      page.locator("button", { hasText: "Custom Setup" }),
    ).toBeVisible();
  });

  test("Quick Start skips to Review step", async ({ page }) => {
    await page.goto("/onboarding");
    await page.locator("button", { hasText: "Quick Start" }).click();
    await page.waitForTimeout(500);

    // Quick Start should jump to the Review step (step 5)
    await expect(page.locator("text=Review Before Save")).toBeAttached();
  });
});
