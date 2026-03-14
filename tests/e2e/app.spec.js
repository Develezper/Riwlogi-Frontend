import { expect, test } from "@playwright/test";

function mockApi(page) {
  return page.route(/:\d+\/api\//, (route) => {
    const url = new URL(route.request().url());
    const path = url.pathname;
    const method = route.request().method();

    if (path === "/api/health") {
      return route.fulfill({ json: { ok: true } });
    }

    if (path === "/api/auth/login" && method === "POST") {
      return route.fulfill({
        json: {
          access_token: "fake-token-0123456789abcdef",
          user: {
            id: "u1",
            username: "Demo",
            email: "demo@riwlog.dev",
            role: "user",
            display_name: "Demo",
            created_at: "2025-01-01T00:00:00Z",
          },
        },
      });
    }

    if (path === "/api/problems/tags" && method === "GET") {
      return route.fulfill({ json: { items: ["arrays", "strings", "dp"] } });
    }

    if (path === "/api/problems" && method === "GET") {
      return route.fulfill({
        json: {
          items: [
            {
              id: "p1",
              slug: "two-sum",
              title: "Two Sum",
              difficulty: 1,
              tags: ["arrays"],
              acceptance: 80,
              submissions: 100,
            },
          ],
        },
      });
    }

    if (path === "/api/problems/two-sum" && method === "GET") {
      return route.fulfill({
        json: {
          item: {
            id: "p1",
            slug: "two-sum",
            title: "Two Sum",
            difficulty: 1,
            tags: ["arrays"],
            acceptance: 80,
            submissions: 100,
            statement_md: "Dado un arreglo de enteros...",
            starter_code: { python: "def two_sum(nums, target):\n    pass" },
            stages: [
              {
                id: "s1",
                stage_index: 1,
                prompt_md: "Implementa la solución completa.",
                hidden_count: 2,
                visible_tests: [
                  { input_text: "[2,7,11,15], 9", expected_text: "[0,1]" },
                ],
              },
            ],
          },
        },
      });
    }

    if (path === "/api/submissions/start" && method === "POST") {
      return route.fulfill({ json: { submission_id: "sub-1" } });
    }

    if (path === "/api/submissions/run" && method === "POST") {
      return route.fulfill({
        json: {
          result: {
            passed: true,
            stage_index: 1,
            stage_score: 100,
            runtime_ms: 42,
            stdout: "ok",
            console_output: "debug output",
            visible_results: [
              { input_text: "[2,7,11,15], 9", expected_text: "[0,1]", passed: true, error: null },
            ],
          },
        },
      });
    }

    if (path.match(/\/api\/submissions\/[^/]+\/submit$/) && method === "POST") {
      return route.fulfill({
        json: {
          verdict: "accepted",
          final_score: 100,
          classification: { label: "human", confidence: 0.95 },
        },
      });
    }

    if (path === "/api/leaderboard" && method === "GET") {
      return route.fulfill({
        json: {
          items: [
            { rank: 1, username: "Alice", avatar: "A", score: 500, total_score: 500, solved: 10, streak: 5 },
            { rank: 2, username: "Bob", avatar: "B", score: 400, total_score: 400, solved: 8, streak: 3 },
            { rank: 3, username: "Carlos", avatar: "C", score: 300, total_score: 300, solved: 6, streak: 2 },
          ],
        },
      });
    }

    if (path === "/api/profile/me" && method === "GET") {
      return route.fulfill({
        json: {
          user: {
            id: "u1",
            username: "Demo",
            email: "demo@riwlog.dev",
            role: "user",
            display_name: "Demo",
            created_at: "2025-01-01T00:00:00Z",
          },
          stats: {
            total_score: 200,
            solved: 5,
            by_difficulty: { easy: 3, medium: 2, hard: 0 },
          },
          streak: 2,
          rank: 10,
          badges: [],
        },
      });
    }

    if (path === "/api/profile/submissions" && method === "GET") {
      return route.fulfill({
        json: {
          items: [
            {
              id: "sub-1",
              problem_id: "p1",
              problem_title: "Two Sum",
              verdict: "accepted",
              language: "python",
              final_score: 100,
              runtime_ms: 42,
              submitted_at: "2025-06-01T12:00:00Z",
              stage_results: {},
            },
          ],
        },
      });
    }

    return route.fulfill({ status: 404, json: { error: "not found" } });
  });
}

async function login(page) {
  await page.goto("/#/login");
  await page.locator('input[name="email"]').fill("demo@riwlog.dev");
  await page.locator('input[name="password"]').fill("123456");
  await page.getByRole("button", { name: "Entrar" }).click();
  await expect(page).toHaveURL(/#\/problems/);
}

test("home renders and allows navigation", async ({ page }) => {
  await mockApi(page);
  await page.goto("/");

  await expect(page.getByRole("heading", { name: /Desafíos.*Riwlog/i })).toBeVisible();
  await page.getByRole("link", { name: /Clasificación/i }).first().click();
  await expect(page).toHaveURL(/#\/leaderboard/);
  await expect(page.getByRole("heading", { name: /Top participantes/i })).toBeVisible();
});

test("auth flow unlocks protected profile route", async ({ page }) => {
  await mockApi(page);
  await login(page);

  await page.goto("/#/profile");
  await expect(page.getByRole("heading", { name: /Demo/i })).toBeVisible();
  await expect(page.getByText(/Envíos recientes/i)).toBeVisible();
});

test("solver can run and submit in single-stage mode", async ({ page }) => {
  await mockApi(page);
  await login(page);

  await page.goto("/#/problem/two-sum");
  await expect(page.getByText(/Casos de prueba/i)).toBeVisible();

  await page.getByRole("button", { name: "Ejecutar" }).click();
  await expect(page.locator("#results-panel")).toContainText(/Salida por consola/i);

  await page.getByRole("button", { name: "Enviar" }).click();
  await expect(page.locator("#results-panel")).toContainText(/Problema resuelto/i);
});
