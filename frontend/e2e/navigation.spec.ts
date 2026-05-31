import { test, expect } from "@playwright/test";

test.describe("Navigation guards", () => {
  test("/dashboard redirects to /admin when unauthenticated", async ({ page }) => {
    await page.goto("/dashboard");
    // Should redirect through /admin which then redirects to /login
    await expect(page).toHaveURL(/\/login/);
  });

  test("public pages do not redirect", async ({ page }) => {
    for (const path of ["/", "/login", "/register", "/forgot-password"]) {
      await page.goto(path);
      await expect(page).not.toHaveURL(/\/login/);
    }
  });
});
