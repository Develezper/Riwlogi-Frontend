import { describe, expect, it } from "vitest";

import {
  parseAuthResponse,
  parseProblemResponse,
  parseProblemsListResponse,
  parseSubmissionRunResponse,
} from "../../src/shared/services/api/contract.js";

describe("api contract parsers", () => {
  it("parses valid auth response", () => {
    const parsed = parseAuthResponse({
      access_token: "token_1234567890abcd",
      user: {
        id: "user_1",
        username: "demo",
        email: "demo@riwlog.dev",
        display_name: "Demo",
        created_at: "2026-01-01T00:00:00.000Z",
      },
    });

    expect(parsed.user.username).toBe("demo");
  });

  it("fails on invalid problem list shape", () => {
    expect(() => parseProblemsListResponse([{ id: "x" }])).toThrow();
  });

  it("normalizes status in problem list items", () => {
    const parsed = parseProblemsListResponse({
      items: [
        {
          id: "sum-two",
          slug: "sum-two",
          title: "Suma dos",
          difficulty: 1,
          tags: ["arrays"],
          status: "pendiente",
        },
        {
          id: "two-sum",
          slug: "two-sum",
          title: "Two Sum",
          difficulty: 1,
          tags: ["arrays"],
          status: "published",
        },
      ],
    });

    expect(parsed[0].status).toBe("pending");
    expect(parsed[1].status).toBe("published");
  });

  it("parses strict problem response", () => {
    const parsed = parseProblemResponse({
      item: {
        id: "two-sum",
        slug: "two-sum",
        title: "Two Sum",
        difficulty: 1,
        tags: ["Arrays"],
        acceptance: 49,
        submissions: 100,
        stages_count: 3,
        statement_md: "Test",
        starter_code: { python: "print('ok')" },
        stages: [
          {
            id: "stage-1",
            stage_index: 1,
            prompt_md: "Solve",
            hidden_count: 1,
            visible_tests: [{ input_text: "1", expected_text: "2" }],
          },
          {
            id: "stage-2",
            stage_index: 2,
            prompt_md: "Second stage",
            hidden_count: 2,
            visible_tests: [{ input_text: "2", expected_text: "3" }],
          },
        ],
      },
    });

    expect(parsed.stages_count).toBe(1);
    expect(parsed.stages.length).toBe(1);
    expect(parsed.stages[0].stage_index).toBe(1);
  });

  it("parses run result", () => {
    const parsed = parseSubmissionRunResponse({
      result: {
        passed: true,
        stage_index: 1,
        stage_score: 90,
        runtime_ms: 20,
        visible_results: [],
      },
    });

    expect(parsed.passed).toBe(true);
    expect(parsed.stage_score).toBe(90);
  });
});
