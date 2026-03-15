import { describe, expect, it } from "bun:test";

import { buildUpdatePayloadFromProblem } from "../../src/features/admin/views/admin-ai-generate/form-utils.js";

describe("admin-ai-generate form-utils", () => {
  it("builds update payload with normalized stages for backend contract", () => {
    const payload = buildUpdatePayloadFromProblem({
      id: "p1",
      slug: "problema-demo",
      title: "Problema demo",
      difficulty: 2,
      tags: ["arrays"],
      status: "draft",
      statement_md: "Resuelve el problema",
      starter_code: {
        python: "def solve():\n    pass\n",
        javascript: "function solve() {}\n",
      },
      stages: [
        {
          stage_index: 3,
          prompt_md: "Etapa unica",
          hidden_count: 4,
          visible_tests: [{ input_text: "1 2", expected_text: "3" }],
        },
      ],
    });

    expect(payload).toMatchObject({
      slug: "problema-demo",
      title: "Problema demo",
      stages_count: 1,
      stages: [
        {
          stage_index: 1,
          prompt_md: "Etapa unica",
          hidden_count: 4,
          visible_tests: [{ input_text: "1 2", expected_text: "3" }],
        },
      ],
    });
    expect(payload).not.toHaveProperty("stages_json");
  });
});
