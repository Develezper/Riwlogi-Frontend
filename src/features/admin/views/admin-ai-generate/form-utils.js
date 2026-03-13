import { parseCsv, stageEditorJson } from "../../utils/admin-utils.js";

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

export function buildProblemDraftFromForm(form, baseProblem) {
  const formData = new FormData(form);
  const stages = parseStagesJsonValue(formData.get("stages_json"));

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
    },
    stages,
    stages_count: stages.length,
    source: "ai",
  };
}

export function buildUpdatePayloadFromProblem(problem, options = {}) {
  const status = String(options.status || problem.status || "draft");
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
    },
    stages_json: stageEditorJson(problem),
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
