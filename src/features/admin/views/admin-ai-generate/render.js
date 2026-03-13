import { escapeHtml } from "../../../../shared/utils/ui-helpers.js";
import { adminNav } from "../../components/admin-nav.js";
import { difficultyLabel, formatList } from "../../utils/admin-utils.js";
import { buildStageEditorHtml } from "../../utils/stage-editor.js";
import { DEFAULT_BATCH_COUNT, MAX_BATCH_COUNT } from "./constants.js";

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

function buildEditFormHtml(problem) {
  const title = escapeHtml(problem.title || "");
  const slug = escapeHtml(problem.slug || "");
  const difficulty = String(problem.difficulty || 1);
  const status = String(problem.status || "draft");
  const tags = escapeHtml(formatList(problem.tags || []));
  const statement = escapeHtml(problem.statement_md || "");
  const python = escapeHtml(problem.starter_code?.python || "");
  const js = escapeHtml(problem.starter_code?.javascript || "");
  const stagesEditor = buildStageEditorHtml(problem.stages);

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
        <label class="block text-xs text-zinc-400 mb-2">Etapas y tests</label>
        ${stagesEditor}
        <p class="text-[11px] text-zinc-500 mt-2">
          Cada etapa se guarda con: <code class="text-zinc-400">stage_index</code>, <code class="text-zinc-400">prompt_md</code>, <code class="text-zinc-400">hidden_count</code> y <code class="text-zinc-400">visible_tests</code>.
        </p>
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

function buildGenerationLoadingHtml(state) {
  if (!state.isGenerating) return "";

  const total = Math.max(1, Number(state.generationTotal || 0));
  const current = Math.max(0, Number(state.generationCurrent || 0));
  const percent = Math.max(0, Math.min(100, Math.round((current / total) * 100)));
  const message = state.generationMessage || "Preparando generación…";

  return `
    <div class="rounded-xl border border-brand/40 bg-brand/10 p-4 animate-fade-in">
      <div class="flex items-center justify-between gap-3">
        <div class="flex items-center gap-3">
          <div class="w-6 h-6 border-2 border-brand/40 border-t-brand rounded-full animate-spin"></div>
          <div>
            <p class="text-sm font-semibold text-zinc-100">Creando ejercicios con IA…</p>
            <p class="text-xs text-zinc-300 mt-0.5">${escapeHtml(message)}</p>
          </div>
        </div>
        <span class="text-xs text-brand font-semibold">${current}/${total}</span>
      </div>

      <div class="mt-3 h-2 rounded-full bg-zinc-800 overflow-hidden">
        <div class="h-full rounded-full bg-brand ai-gen-progress-fill" style="width:${percent}%"></div>
      </div>

      <div class="mt-3 flex items-center gap-1.5 text-zinc-300 text-xs">
        <span class="ai-dot w-1.5 h-1.5 rounded-full bg-brand"></span>
        <span class="ai-dot w-1.5 h-1.5 rounded-full bg-brand"></span>
        <span class="ai-dot w-1.5 h-1.5 rounded-full bg-brand"></span>
        <span class="ml-1">Esto puede tardar unos segundos por ejercicio.</span>
      </div>
    </div>
  `;
}

export function renderPromptPhase(container, state) {
  const disabledAttr = state.isGenerating ? "disabled" : "";

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
      ${buildGenerationLoadingHtml(state)}

      <div class="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
        <form id="generate-ai-form" novalidate>
          <label for="ai-prompt" class="block text-sm font-medium text-zinc-200 mb-2">Prompt base</label>
          <textarea
            id="ai-prompt"
            name="prompt"
            rows="8"
            required
            minlength="10"
            ${disabledAttr}
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
                ${disabledAttr}
                value="${escapeHtml(String(state.batchCount || DEFAULT_BATCH_COUNT))}"
                class="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-sm text-zinc-100 focus:outline-none focus:border-brand transition" />
              <p class="text-[11px] text-zinc-500 mt-1">Default: 3 (fácil, intermedio, difícil).</p>
            </div>

            <div>
              <label class="block text-xs text-zinc-400 mb-1">Etapas por ejercicio</label>
              <select
                name="stages_mode"
                ${disabledAttr}
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
                ${disabledAttr}
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
              ${disabledAttr}
              class="px-6 py-2 rounded-lg bg-brand text-white hover:bg-brand-dark transition text-sm font-medium">
              ${state.isGenerating ? "Generando…" : "Generar con IA"}
            </button>
          </div>
        </form>
      </div>
    </section>
  `;
}

export function renderEditPhase(container, state) {
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
