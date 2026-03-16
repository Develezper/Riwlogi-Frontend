import { describe, expect, it } from "bun:test";

import { detectPromptExerciseCount } from "../../src/features/admin/views/admin-ai-generate/prompt-analysis.js";
import {
  detectGeneratedProblemIssue,
  normalizeGeneratedProblemCandidate,
} from "../../src/features/admin/views/admin-ai-generate/generated-problem-utils.js";

describe("admin-ai-generate prompt parsing", () => {
  it("detects count from common phrasing", () => {
    expect(detectPromptExerciseCount("Crea 5 ejercicios de bucles difíciles.")).toBe(5);
  });

  it("detects count even with typo in ejercicios", () => {
    expect(detectPromptExerciseCount("Quiero 5 ejeciios de bucles dificiles")).toBe(5);
  });
});

describe("normalizeGeneratedProblemCandidate", () => {
  it("removes leaked internal generation instructions from statement", () => {
    const candidate = {
      title: "Ejercicio de bucles",
      statement_md:
        "## Description\\n\\nBucle for\\n\\nInstrucciones internas para esta generación:\\n- Genera uno",
      difficulty: 2,
    };

    const normalized = normalizeGeneratedProblemCandidate(candidate, {
      basePrompt: "Crea un ejercicio de bucles",
      difficulty: 3,
      batchIndex: 0,
    });

    expect(normalized.statement_md).toContain("## Description");
    expect(normalized.statement_md).not.toContain("Instrucciones internas");
    expect(normalized.difficulty).toBe(3);
  });

  it("replaces title when backend echoes the original prompt", () => {
    const candidate = {
      title: "5 ejeciios de bucles dificiles",
      statement_md: "enunciado",
      difficulty: 2,
    };

    const normalized = normalizeGeneratedProblemCandidate(candidate, {
      basePrompt: "5 ejeciios de bucles dificiles",
      batchIndex: 1,
      difficulty: 3,
    });

    expect(normalized.title).not.toBe("5 ejeciios de bucles dificiles");
    expect(normalized.title).toBe("Bucles Dificiles 2");

    const issue = detectGeneratedProblemIssue(normalized, {
      basePrompt: "5 ejeciios de bucles dificiles",
    });
    expect(issue).toBeNull();
  });

  it("flags placeholder visible tests", () => {
    const candidate = {
      title: "Ejercicio de bucles",
      statement_md: "resuelve el problema",
      difficulty: 3,
      stages: [
        {
          stage_index: 1,
          visible_tests: [{ input_text: "example_input_stage_1", expected_text: "42" }],
        },
      ],
    };

    const issue = detectGeneratedProblemIssue(candidate, {
      basePrompt: "Crea 1 ejercicio difícil de bucles",
    });

    expect(issue).toBe("tests de plantilla");
  });
});
