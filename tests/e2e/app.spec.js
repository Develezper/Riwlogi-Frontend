import { expect, test } from "@playwright/test";

async function login(page) {
  await page.goto("/#/login");
  await page.locator('input[name="email"]').fill("demo@riwlog.dev");
  await page.locator('input[name="password"]').fill("123456");
  await page.getByRole("button", { name: "Entrar" }).click();
  await expect(page).toHaveURL(/#\/problems/);
}

test("home renders and allows navigation", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { name: /Riwlog Challenges/i })).toBeVisible();
  await page.getByRole("link", { name: /Leaderboard/i }).first().click();
  await expect(page).toHaveURL(/#\/leaderboard/);
  await expect(page.getByRole("heading", { name: /Top Thinkers/i })).toBeVisible();
});

test("auth flow unlocks protected profile route", async ({ page }) => {
  await login(page);

  await page.goto("/#/profile");
  await expect(page.getByRole("heading", { name: /Demo/i })).toBeVisible();
  await expect(page.getByText(/Recent Submissions/i)).toBeVisible();
});

test("solver can run and submit stages", async ({ page }) => {
  await login(page);

  await page.goto("/#/problem/two-sum");
  await expect(page.getByText(/Visible tests/i)).toBeVisible();

  await page.getByRole("button", { name: "Run" }).click();
  await expect(page.locator("#results-panel")).toContainText(/Stage|Passed|Failed/i);

  await page.getByRole("button", { name: "Submit" }).click();
  await expect(page.locator("#toast-container")).toContainText(/Score final/i);
});
