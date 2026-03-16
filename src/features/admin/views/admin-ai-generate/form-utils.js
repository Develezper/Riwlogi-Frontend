import { parseCsv } from "../../utils/admin-utils.js";
import { syncStageEditorJsonField } from "../../utils/stage-editor.js";

function parseStagesJsonValue(rawValue) {
  const text = String(rawValue ?? "").trim();
  if (!text) {
    throw new Error("El JSON de etapas no puede estar vacío.");
  }

  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new Error("El JSON de etapas es inválido.");
  }

  if (!Array.isArray(parsed)) {
    throw new Error("El JSON de etapas debe ser un arreglo.");
  }

  return parsed;
}

function normalizeSingleStage(rawStages) {
  const stages = Array.isArray(rawStages) ? rawStages : [];
  const firstStage = stages[0] || {};
  return {
    stage_index: 1,
    prompt_md: String(firstStage.prompt_md || "").trim(),
    hidden_count: Math.max(0, Number.parseInt(String(firstStage.hidden_count ?? 0), 10) || 0),
    visible_tests: Array.isArray(firstStage.visible_tests)
      ? firstStage.visible_tests
          .map((test) => ({
            input_text: String(test?.input_text || "").trim(),
            expected_text: String(test?.expected_text || "").trim(),
          }))
          .filter((test) => test.input_text && test.expected_text)
      : [],
  };
}

export function buildProblemDraftFromForm(form, baseProblem) {
  syncStageEditorJsonField(form);
  const formData = new FormData(form);
  const stages = [normalizeSingleStage(parseStagesJsonValue(formData.get("stages_json")))];

  return {
    ...baseProblem,
    id: String(formData.get("problem_id") || baseProblem?.id || "").trim(),
    slug: String(formData.get("slug") || baseProblem?.slug || "").trim(),
    title: String(formData.get("title") || "").trim(),
    difficulty: Number(formData.get("difficulty") || 1),
    tags: parseCsv(formData.get("tags")),
    status: String(formData.get("status") || baseProblem?.status || "draft"),
    statement_md: String(formData.get("statement_md") || ""),
    starter_code: {
      python: String(formData.get("starter_python") || "").trimEnd(),
      javascript: String(formData.get("starter_javascript") || "").trimEnd(),
      typescript: String(formData.get("starter_typescript") || "").trimEnd(),
    },
    stages,
    stages_count: 1,
    source: "ai",
  };
}

export function buildUpdatePayloadFromProblem(problem, options = {}) {
  const status = String(options.status || problem.status || "draft");
  const stages = [normalizeSingleStage(problem.stages)];
  const payload = {
    title: String(problem.title || "").trim(),
    slug: String(problem.slug || "").trim(),
    difficulty: Number(problem.difficulty || 1),
    tags: Array.isArray(problem.tags) ? problem.tags : [],
    status,
    statement_md: String(problem.statement_md || ""),
    starter_code: {
      python: String(problem.starter_code?.python || "").trimEnd(),
      javascript: String(problem.starter_code?.javascript || "").trimEnd(),
      typescript: String(problem.starter_code?.typescript || "").trimEnd(),
    },
    stages,
    stages_count: 1,
    source: "ai",
  };

  const lastPrompt = String(options.lastPrompt || "").trim();
  if (lastPrompt) payload.last_generated_prompt = lastPrompt;
  return payload;
}

export function upsertProblemInBatch(batch, updatedProblem) {
  const list = Array.isArray(batch) ? batch : [];
  let found = false;
  const next = list.map((problem) => {
    if (problem.id !== updatedProblem.id) return problem;
    found = true;
    return updatedProblem;
  });

  if (!found) next.push(updatedProblem);
  return next;
}

export function syncCurrentFormIntoState(state, container) {
  if (!state.generatedProblem) return;
  const form = container.querySelector("#edit-problem-form");
  if (!form) return;

  const draft = buildProblemDraftFromForm(form, state.generatedProblem);
  state.generatedProblem = draft;
  state.generatedBatch = upsertProblemInBatch(state.generatedBatch, draft);
}

export function goToProblemsCatalog() {
  window.location.hash = "#/admin/problems";
}
