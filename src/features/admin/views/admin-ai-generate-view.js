import { api } from "../../../shared/services/api/index.js";
import { escapeHtml, showToast } from "../../../shared/utils/ui-helpers.js";
import { adminNav } from "../components/admin-nav.js";
import {
  difficultyLabel,
  formatList,
  stageEditorJson,
  parseCsv,
  formButton,
  setLoadingButton,
} from "../utils/admin-utils.js";

const DEFAULT_BATCH_COUNT = 3;
const MAX_BATCH_COUNT = 12;

function clampInt(value, fallback, min, max) {
  const parsed = Number.parseInt(String(value ?? "").trim(), 10);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.max(min, Math.min(max, parsed));
}

function normalizeStagesMode(value) {
  const mode = String(value || "auto").trim().toLowerCase();
  if (["auto", "custom"].includes(mode)) return mode;
  return "auto";
}

function normalizePromptText(value) {
  return String(value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function detectPromptExerciseCount(prompt) {
  const text = normalizePromptText(prompt);
  if (!text) return null;

  const patterns = [
    /\b(?:crear|crea|genera|generar|haz|hacer|necesito|quiero|dame|con)\s*(\d{1,2})\s*(?:ejercicios|problemas|retos|challenges?)\b/i,
    /\b(\d{1,2})\s*(?:ejercicios|problemas|retos|challenges?)\b/i,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (!match?.[1]) continue;
    return clampInt(match[1], DEFAULT_BATCH_COUNT, 1, MAX_BATCH_COUNT);
  }

  return null;
}

function detectPromptStageCount(prompt) {
  const text = normalizePromptText(prompt);
  if (!text) return null;

  const patterns = [
    /\b(?:con|de)?\s*(\d{1,2})\s*(?:etapas|stages?)\b/i,
    /\b(?:etapas|stages?)\s*[:=]?\s*(\d{1,2})\b/i,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (!match?.[1]) continue;
    return clampInt(match[1], 3, 1, 20);
  }

  return null;
}

function detectPromptDifficultySignals(prompt) {
  const text = normalizePromptText(prompt);
  if (!text) {
    return {
      forcedLevel: null,
      hasDifficultyHint: false,
    };
  }

  const hasEasy = /\b(facil(?:es)?|easy)\b/i.test(text);
  const hasMedium = /\b(intermedio(?:s)?|medio(?:s)?|medium)\b/i.test(text);
  const hasHard = /\b(dificil(?:es)?|hard)\b/i.test(text);
  const hasDifficultyHint = hasEasy || hasMedium || hasHard;

  if (hasHard && !hasEasy && !hasMedium) {
    return { forcedLevel: 3, hasDifficultyHint: true };
  }

  if (hasEasy && !hasHard && !hasMedium) {
    return { forcedLevel: 1, hasDifficultyHint: true };
  }

  if (hasMedium && !hasHard && !hasEasy) {
    return { forcedLevel: 2, hasDifficultyHint: true };
  }

  return {
    forcedLevel: null,
    hasDifficultyHint,
  };
}

function buildDifficultyPlan(total, forcedLevel = null) {
  const count = clampInt(total, DEFAULT_BATCH_COUNT, 1, MAX_BATCH_COUNT);

  if ([1, 2, 3].includes(Number(forcedLevel))) {
    return Array.from({ length: count }, () => Number(forcedLevel));
  }

  if (count === 1) return [2];
  if (count === 2) return [1, 3];

  const plan = [];
  for (let index = 0; index < count; index += 1) {
    const level = 1 + Math.round((2 * index) / (count - 1));
    plan.push(level);
  }
  return plan;
}

function difficultyPromptLabel(level) {
  if (Number(level) === 1) return "Fácil";
  if (Number(level) === 3) return "Difícil";
  return "Intermedio";
}

function buildStageInstruction(stagesMode, customStageCount) {
  if (stagesMode === "custom") {
    return `Debes crear exactamente ${customStageCount} etapas.`;
  }
  return "Si no se especifican etapas, decide entre 2 o 3; en caso de duda usa 3.";
}

function resolveStageInstruction(prompt, stagesMode, customStageCount) {
  const promptStageCount = detectPromptStageCount(prompt);
  if (promptStageCount !== null) {
    return "Respeta la cantidad de etapas indicada en el prompt base.";
  }

  return buildStageInstruction(stagesMode, customStageCount);
}

function buildGenerationPrompt({
  basePrompt,
  batchIndex,
  batchCount,
  difficulty,
  difficultyFromPrompt = false,
  stageInstruction,
}) {
  const difficultyInstruction = difficulty
    ? `- Dificultad objetivo: ${difficultyPromptLabel(difficulty)} (${difficulty}).`
    : difficultyFromPrompt
      ? "- Respeta la dificultad indicada en el prompt base."
      : "- Dificultad objetivo: Intermedio (2).";

  return `${basePrompt}\n\n` +
    `Instrucciones internas para esta generación:\n` +
    `- Genera un solo ejercicio (no una lista).\n` +
    `- Este es el ejercicio ${batchIndex + 1} de ${batchCount}.\n` +
    `${difficultyInstruction}\n` +
    `- ${stageInstruction}\n` +
    `- Las etapas deben ser consecutivas y cada una con stage_index, prompt_md, hidden_count y visible_tests.`;
}

function buildBatchSelectorHtml(state) {
  const generatedBatch = Array.isArray(state.generatedBatch) ? state.generatedBatch : [];
  if (generatedBatch.length <= 1) return "";

  return `
    <div class="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
      <div class="flex items-center justify-between gap-3">
        <h2 class="text-sm font-semibold text-zinc-100">Lote generado</h2>
        <span class="text-[11px] text-zinc-500">${generatedBatch.length} ejercicios</span>
      </div>
      <p class="text-xs text-zinc-500 mt-1">Selecciona cuál quieres revisar o ajustar en este formulario.</p>
      <div class="flex flex-wrap gap-2 mt-3">
        ${generatedBatch
          .map((problem, index) => {
            const active = problem.id === state.generatedProblem?.id;
            const className = active
              ? "border-brand bg-brand/10 text-brand"
              : "border-zinc-700 bg-zinc-900 text-zinc-300 hover:bg-zinc-800";

            return `<button
              type="button"
              data-action="select-generated"
              data-problem-id="${escapeHtml(problem.id || "")}" 
              class="px-3 py-1.5 rounded-lg border text-xs transition ${className}">
              ${index + 1}. ${escapeHtml(problem.title || `Ejercicio ${index + 1}`)} · ${escapeHtml(
              difficultyLabel(problem.difficulty),
            )}
            </button>`;
          })
          .join("")}
      </div>
    </div>
  `;
}

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

function buildProblemDraftFromForm(form, baseProblem) {
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

function buildUpdatePayloadFromProblem(problem, options = {}) {
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

function upsertProblemInBatch(batch, updatedProblem) {
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

function syncCurrentFormIntoState(state, container) {
  if (!state.generatedProblem) return;
  const form = container.querySelector("#edit-problem-form");
  if (!form) return;

  const draft = buildProblemDraftFromForm(form, state.generatedProblem);
  state.generatedProblem = draft;
  state.generatedBatch = upsertProblemInBatch(state.generatedBatch, draft);
}

function buildEditFormHtml(problem) {
  const title = escapeHtml(problem.title || "");
  const slug = escapeHtml(problem.slug || "");
  const difficulty = String(problem.difficulty || 1);
  const status = String(problem.status || "draft");
  const tags = escapeHtml(formatList(problem.tags || []));
  const statement = escapeHtml(problem.statement_md || "");
  const python = escapeHtml(problem.starter_code?.python || "");
  const js = escapeHtml(problem.starter_code?.javascript || "");
  const stages = escapeHtml(stageEditorJson(problem));

  return `
    <form id="edit-problem-form" class="space-y-4" novalidate>
      <input type="hidden" name="problem_id" value="${escapeHtml(problem.id || "")}" />
      <input type="hidden" name="slug" value="${slug}" />

      <div class="grid grid-cols-1 gap-4">
        <div>
          <label class="block text-xs text-zinc-400 mb-1">Título</label>
          <input name="title" required value="${title}"
            class="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-sm text-zinc-100 focus:outline-none focus:border-brand transition" />
        </div>
      </div>

      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="block text-xs text-zinc-400 mb-1">Dificultad</label>
          <select name="difficulty"
            class="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-sm text-zinc-100 focus:outline-none focus:border-brand transition">
            <option value="1" ${difficulty === "1" ? "selected" : ""}>Fácil</option>
            <option value="2" ${difficulty === "2" ? "selected" : ""}>Intermedio</option>
            <option value="3" ${difficulty === "3" ? "selected" : ""}>Difícil</option>
          </select>
        </div>
        <div>
          <label class="block text-xs text-zinc-400 mb-1">Estado</label>
          <select name="status"
            class="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-sm text-zinc-100 focus:outline-none focus:border-brand transition">
            <option value="draft" ${status === "draft" ? "selected" : ""}>Borrador</option>
            <option value="published" ${status === "published" ? "selected" : ""}>Publicado</option>
            <option value="archived" ${status === "archived" ? "selected" : ""}>Archivado</option>
          </select>
        </div>
      </div>

      <div>
        <label class="block text-xs text-zinc-400 mb-1">Etiquetas (separadas por coma)</label>
        <input name="tags" value="${tags}"
          class="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-sm text-zinc-100 focus:outline-none focus:border-brand transition" />
      </div>

      <div>
        <label class="block text-xs text-zinc-400 mb-1">Enunciado (Markdown)</label>
        <textarea name="statement_md" rows="7"
          class="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-sm text-zinc-100 focus:outline-none focus:border-brand transition resize-none">${statement}</textarea>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label class="block text-xs text-zinc-400 mb-1">Código inicial Python</label>
          <textarea name="starter_python" rows="6"
            class="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-xs font-mono text-zinc-100 focus:outline-none focus:border-brand transition resize-none">${python}</textarea>
        </div>
        <div>
          <label class="block text-xs text-zinc-400 mb-1">Código inicial JavaScript</label>
          <textarea name="starter_javascript" rows="6"
            class="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-xs font-mono text-zinc-100 focus:outline-none focus:border-brand transition resize-none">${js}</textarea>
        </div>
      </div>

      <div>
        <label class="block text-xs text-zinc-400 mb-1">JSON de etapas</label>
        <textarea name="stages_json" rows="12"
          class="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-xs font-mono text-zinc-100 focus:outline-none focus:border-brand transition resize-none">${stages}</textarea>
        <p class="text-[11px] text-zinc-500 mt-1">Cada etapa debe incluir: <code class="text-zinc-400">stage_index</code>, <code class="text-zinc-400">prompt_md</code>, <code class="text-zinc-400">hidden_count</code>, <code class="text-zinc-400">visible_tests</code>.</p>
      </div>

      <div class="flex items-center justify-between pt-2 border-t border-zinc-800">
        <button type="button" data-action="back-to-prompt"
          class="px-4 py-2 rounded-lg border border-zinc-700 text-zinc-300 hover:bg-zinc-800 transition text-sm">
          ← Nuevo prompt
        </button>
        <button type="submit"
          class="px-6 py-2 rounded-lg bg-brand text-white hover:bg-brand-dark transition text-sm font-medium">
          Guardar ejercicio
        </button>
      </div>
    </form>
  `;
}

function renderPromptPhase(container, state) {
  container.innerHTML = `
    ${adminNav("generate")}
    <section class="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      <div>
        <h1 class="text-2xl font-bold text-zinc-100">Generación de ejercicios con IA</h1>
        <p class="text-zinc-400 text-sm mt-1">
          El prompt tiene prioridad. Si no define cantidad, dificultad o etapas, se usan los valores configurados abajo.
        </p>
      </div>

      ${state.error ? `<div class="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">${escapeHtml(state.error)}</div>` : ""}

      <div class="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
        <form id="generate-ai-form" novalidate>
          <label for="ai-prompt" class="block text-sm font-medium text-zinc-200 mb-2">Prompt base</label>
          <textarea
            id="ai-prompt"
            name="prompt"
            rows="8"
            required
            minlength="10"
            class="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-sm text-zinc-100 focus:outline-none focus:border-brand transition resize-none"
            placeholder="Ejemplo: Crea ejercicios sobre arrays y two pointers para práctica técnica en entrevistas."
          >${escapeHtml(state.lastPrompt || "")}</textarea>

          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
            <div>
              <label class="block text-xs text-zinc-400 mb-1">Cantidad de ejercicios</label>
              <input
                type="number"
                name="batch_count"
                min="1"
                max="${MAX_BATCH_COUNT}"
                value="${escapeHtml(String(state.batchCount || DEFAULT_BATCH_COUNT))}"
                class="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-sm text-zinc-100 focus:outline-none focus:border-brand transition" />
              <p class="text-[11px] text-zinc-500 mt-1">Default: 3 (fácil, intermedio, difícil).</p>
            </div>

            <div>
              <label class="block text-xs text-zinc-400 mb-1">Etapas por ejercicio</label>
              <select
                name="stages_mode"
                class="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-sm text-zinc-100 focus:outline-none focus:border-brand transition">
                <option value="auto" ${state.stagesMode === "auto" ? "selected" : ""}>Auto IA (decide 2 o 3)</option>
                <option value="custom" ${state.stagesMode === "custom" ? "selected" : ""}>Personalizado</option>
              </select>
            </div>

            <div>
              <label class="block text-xs text-zinc-400 mb-1">Etapas personalizadas</label>
              <input
                type="number"
                name="custom_stage_count"
                min="1"
                max="20"
                value="${escapeHtml(String(state.customStageCount || 3))}"
                class="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-sm text-zinc-100 focus:outline-none focus:border-brand transition" />
              <p class="text-[11px] text-zinc-500 mt-1">Solo se usa con modo "Personalizado".</p>
            </div>
          </div>

          <p class="mt-3 text-xs text-zinc-500">
            El sistema genera título, dificultad, etiquetas, enunciado, starter code y etapas con tests visibles.
          </p>

          <div class="flex justify-end mt-4">
            <button type="submit"
              class="px-6 py-2 rounded-lg bg-brand text-white hover:bg-brand-dark transition text-sm font-medium">
              Generar con IA
            </button>
          </div>
        </form>
      </div>
    </section>
  `;
}

function renderEditPhase(container, state) {
  container.innerHTML = `
    ${adminNav("generate")}
    <section class="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      <div class="flex items-start gap-4">
        <div class="flex-1">
          <h1 class="text-2xl font-bold text-zinc-100">Revisar y guardar ejercicio</h1>
          <p class="text-zinc-400 text-sm mt-1">
            Revisa y ajusta cada ejercicio antes de publicarlo.
          </p>
        </div>
        <span class="shrink-0 inline-flex px-3 py-1 rounded-full text-xs border text-purple-300 bg-purple-500/10 border-purple-500/30">
          Generado por IA
        </span>
      </div>

      ${
        state.savedProblemId
          ? `<div class="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
              Ejercicio guardado. Puedes seguir editando o
              <a href="#/admin/problems/edit/${escapeHtml(state.savedProblemId)}" class="underline text-emerald-100 hover:text-white">abrirlo en el catálogo</a>.
            </div>`
          : ""
      }

      ${state.error ? `<div class="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">${escapeHtml(state.error)}</div>` : ""}

      ${
        (state.generatedBatch || []).length > 1
          ? `<div class="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
              <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <h2 class="text-sm font-semibold text-zinc-100">Guardar lote completo</h2>
                  <p class="text-xs text-zinc-500 mt-1">Aplica borrador o publicación a todos los ejercicios del lote.</p>
                </div>
                <div class="flex items-center gap-2">
                  <button type="button" data-action="save-all-draft" class="px-3 py-2 rounded-lg border border-zinc-700 text-zinc-200 hover:bg-zinc-800 transition text-xs">
                    Guardar todos como borrador
                  </button>
                  <button type="button" data-action="save-all-published" class="px-3 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-500 transition text-xs">
                    Guardar todos y publicar
                  </button>
                </div>
              </div>
            </div>`
          : ""
      }

      ${buildBatchSelectorHtml(state)}

      <div class="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
        ${buildEditFormHtml(state.generatedProblem)}
      </div>
    </section>
  `;
}

export async function adminAiGenerateView(container) {
  const state = {
    phase: "prompt",
    error: null,
    lastPrompt: "",
    batchCount: DEFAULT_BATCH_COUNT,
    stagesMode: "auto",
    customStageCount: 3,
    generatedProblem: null,
    generatedBatch: [],
    savedProblemId: null,
  };

  let isMounted = true;

  function render() {
    if (state.phase === "edit" && state.generatedProblem) {
      renderEditPhase(container, state);
    } else {
      renderPromptPhase(container, state);
    }
  }

  render();

  const onSubmit = async (event) => {
    const form = event.target;
    if (!form || form.tagName !== "FORM") return;

    if (form.id === "generate-ai-form") {
      event.preventDefault();
      const submitButton = formButton(form);
      const releaseButton = setLoadingButton(submitButton, "Generando…");
      state.error = null;
      const createdProblems = [];

      try {
        const formData = new FormData(form);
        const prompt = String(formData.get("prompt") || "").trim();
        if (prompt.length < 10) throw new Error("El prompt debe tener al menos 10 caracteres.");

        const adminBatchCount = clampInt(formData.get("batch_count"), DEFAULT_BATCH_COUNT, 1, MAX_BATCH_COUNT);
        const stagesMode = normalizeStagesMode(formData.get("stages_mode"));
        const customStageCount = clampInt(formData.get("custom_stage_count"), 3, 1, 20);
        const promptBatchCount = detectPromptExerciseCount(prompt);
        const batchCount = promptBatchCount ?? adminBatchCount;
        const { forcedLevel, hasDifficultyHint } = detectPromptDifficultySignals(prompt);
        const difficultyPlan =
          forcedLevel !== null
            ? buildDifficultyPlan(batchCount, forcedLevel)
            : hasDifficultyHint
              ? null
              : buildDifficultyPlan(batchCount);
        const stageInstruction = resolveStageInstruction(prompt, stagesMode, customStageCount);

        state.lastPrompt = prompt;
        state.batchCount = batchCount;
        state.stagesMode = stagesMode;
        state.customStageCount = customStageCount;

        for (let index = 0; index < batchCount; index += 1) {
          const difficulty = Array.isArray(difficultyPlan) ? difficultyPlan[index] || 2 : null;
          const composedPrompt = buildGenerationPrompt({
            basePrompt: prompt,
            batchIndex: index,
            batchCount,
            difficulty,
            difficultyFromPrompt: hasDifficultyHint,
            stageInstruction,
          });

          if (submitButton) {
            submitButton.textContent = `Generando ${index + 1}/${batchCount}…`;
          }

          const created = await api.admin.generateProblem({ prompt: composedPrompt });
          createdProblems.push(created);
        }

        if (!isMounted) return;
        if (!createdProblems.length) {
          throw new Error("No se pudo generar ningún ejercicio.");
        }

        state.generatedBatch = createdProblems;
        state.generatedProblem = createdProblems[0];
        state.phase = "edit";
        state.savedProblemId = null;
        render();

        if (batchCount > 1) {
          showToast(`${batchCount} ejercicios generados. Selecciona uno para editar.`, "success");
        } else {
          showToast("Ejercicio generado. Revisa los datos y guarda.", "success");
        }
      } catch (error) {
        if (!isMounted) return;

        if (createdProblems.length > 0) {
          state.generatedBatch = createdProblems;
          state.generatedProblem = createdProblems[0];
          state.phase = "edit";
          state.savedProblemId = null;
          state.error = `${error?.message || "Hubo un error durante la generación."} Se generaron ${createdProblems.length} ejercicio(s).`;
          render();
          showToast("Generación parcial completada. Revisa los ejercicios creados.", "error");
        } else {
          state.error = error?.message || "No se pudo generar el ejercicio.";
          render();
        }
      } finally {
        releaseButton();
      }
      return;
    }

    if (form.id === "edit-problem-form") {
      event.preventDefault();
      const releaseButton = setLoadingButton(formButton(form), "Guardando…");
      state.error = null;
      try {
        const draft = buildProblemDraftFromForm(form, state.generatedProblem);
        const problemId = String(draft.id || "").trim();
        if (!problemId) throw new Error("ID de problema no encontrado.");

        const lastPrompt = state.lastPrompt || state.generatedProblem?.last_generated_prompt || "";
        const payload = buildUpdatePayloadFromProblem(draft, { lastPrompt });

        const updated = await api.admin.updateProblem(problemId, payload);
        if (!isMounted) return;

        state.generatedProblem = updated;
        state.generatedBatch = upsertProblemInBatch(state.generatedBatch, updated);
        state.savedProblemId = updated?.id || problemId;

        showToast("Ejercicio guardado. Puedes seguir editando.", "success");
        state.phase = "edit";
        render();
      } catch (error) {
        if (!isMounted) return;
        state.error = error?.message || "No se pudo guardar el ejercicio.";
        render();
      } finally {
        releaseButton();
      }
    }
  };

  const onClick = async (event) => {
    const trigger = event.target.closest("[data-action]");
    if (!trigger || !container.contains(trigger)) return;

    const action = trigger.dataset.action;

    if (action === "back-to-prompt") {
      state.phase = "prompt";
      state.error = null;
      state.generatedProblem = null;
      state.generatedBatch = [];
      state.savedProblemId = null;
      render();
      return;
    }

    if (action === "save-all-draft" || action === "save-all-published") {
      const targetStatus = action === "save-all-published" ? "published" : "draft";
      const loadingLabel =
        targetStatus === "published" ? "Publicando lote…" : "Guardando lote…";
      const releaseButton = setLoadingButton(trigger, loadingLabel);
      state.error = null;

      try {
        syncCurrentFormIntoState(state, container);

        const batch = Array.isArray(state.generatedBatch) ? state.generatedBatch : [];
        if (!batch.length) {
          throw new Error("No hay ejercicios generados para guardar.");
        }

        const updatedBatch = [];
        let failedCount = 0;
        let firstError = "";

        for (const problem of batch) {
          try {
            const payload = buildUpdatePayloadFromProblem(problem, {
              status: targetStatus,
              lastPrompt: state.lastPrompt || problem.last_generated_prompt || "",
            });
            const updated = await api.admin.updateProblem(problem.id, payload);
            updatedBatch.push(updated);
          } catch (error) {
            failedCount += 1;
            if (!firstError) {
              firstError = error?.message || "Error desconocido al guardar.";
            }
            updatedBatch.push(problem);
          }
        }

        if (!isMounted) return;

        state.generatedBatch = updatedBatch;
        const activeId = state.generatedProblem?.id;
        state.generatedProblem =
          updatedBatch.find((problem) => problem.id === activeId) || updatedBatch[0] || null;
        state.savedProblemId = state.generatedProblem?.id || null;

        const successCount = updatedBatch.length - failedCount;
        if (failedCount === 0) {
          showToast(
            targetStatus === "published"
              ? `Se publicaron ${successCount} ejercicios.`
              : `Se guardaron ${successCount} ejercicios como borrador.`,
            "success",
          );
        } else {
          state.error = `Guardado parcial: ${successCount} exitosos, ${failedCount} con error. ${firstError}`;
          showToast("Guardado parcial del lote. Revisa los errores.", "error");
        }

        render();
      } catch (error) {
        if (!isMounted) return;
        state.error = error?.message || "No se pudo guardar el lote.";
        render();
      } finally {
        releaseButton();
      }
      return;
    }

    if (action === "select-generated") {
      const problemId = String(trigger.dataset.problemId || "").trim();
      if (!problemId) return;
      try {
        syncCurrentFormIntoState(state, container);
      } catch (error) {
        state.error = error?.message || "Corrige el formulario actual antes de cambiar.";
        render();
        return;
      }
      const selected = (state.generatedBatch || []).find((problem) => problem.id === problemId);
      if (!selected) return;

      state.generatedProblem = selected;
      state.savedProblemId = null;
      state.error = null;
      state.phase = "edit";
      render();
    }
  };

  container.addEventListener("submit", onSubmit);
  container.addEventListener("click", onClick);

  return () => {
    isMounted = false;
    container.removeEventListener("submit", onSubmit);
    container.removeEventListener("click", onClick);
  };
}
