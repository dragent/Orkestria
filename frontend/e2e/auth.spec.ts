import { test, expect } from "@playwright/test";

test.describe("Authentication", () => {
  test("home page is accessible", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/Orkestria/i);
  });

  test("login page renders correctly", async ({ page }) => {
    await page.goto("/login");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(page.getByLabel(/e-mail|email/i)).toBeVisible();
    await expect(page.getByLabel(/mot de passe|password/i)).toBeVisible();
  });

  test("register page renders correctly", async ({ page }) => {
    await page.goto("/register");
    await expect(page.getByLabel(/prénom|first name/i)).toBeVisible();
    await expect(page.getByLabel(/nom|last name/i)).toBeVisible();
  });

  test("unauthenticated user is redirected from /admin to /login", async ({ page }) => {
    await page.goto("/admin");
    await expect(page).toHaveURL(/\/login/);
  });

  test("unauthenticated user is redirected from /client to /login", async ({ page }) => {
    await page.goto("/client");
    await expect(page).toHaveURL(/\/login/);
  });

  test("unauthenticated user is redirected from /subcontractor to /login", async ({ page }) => {
    await page.goto("/subcontractor");
    await expect(page).toHaveURL(/\/login/);
  });

  test("unauthenticated user is redirected from /dev to /login", async ({ page }) => {
    await page.goto("/dev");
    await expect(page).toHaveURL(/\/login/);
  });

  test("forgot password page is accessible", async ({ page }) => {
    await page.goto("/forgot-password");
    await expect(page.getByLabel(/e-mail|email/i)).toBeVisible();
  });
});
