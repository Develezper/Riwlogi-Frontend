import { api } from "../../../shared/services/api/index.js";
import { escapeHtml, showToast } from "../../../shared/utils/ui-helpers.js";
import { adminNav } from "../components/admin-nav.js";
import {
  formatList,
  stageEditorJson,
  parseCsv,
  formButton,
  setLoadingButton,
} from "../utils/admin-utils.js";

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

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label class="block text-xs text-zinc-400 mb-1">Título</label>
          <input name="title" required value="${title}"
            class="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-sm text-zinc-100 focus:outline-none focus:border-brand transition" />
        </div>
        <div>
          <label class="block text-xs text-zinc-400 mb-1">Slug</label>
          <input name="slug" value="${slug}"
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
        <label class="block text-xs text-zinc-400 mb-1">Etiquetas (separadas por coma — generadas automáticamente por la IA)</label>
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
          Describe el ejercicio con un solo prompt. La IA genera título, etiquetas, dificultad, enunciado, código inicial, etapas y pruebas automáticamente.
        </p>
      </div>

      ${state.error ? `<div class="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">${escapeHtml(state.error)}</div>` : ""}

      <div class="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
        <form id="generate-ai-form" novalidate>
          <label for="ai-prompt" class="block text-sm font-medium text-zinc-200 mb-2">Prompt del ejercicio</label>
          <textarea
            id="ai-prompt"
            name="prompt"
            rows="9"
            required
            minlength="10"
            class="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-sm text-zinc-100 focus:outline-none focus:border-brand transition resize-none"
            placeholder="Ejemplo: Crea un ejercicio de dificultad media sobre búsqueda binaria en un arreglo ordenado. La función recibe un arreglo de enteros y un target, y devuelve el índice si existe o -1 si no. Incluye 3 etapas progresivas con casos de prueba variados."
          >${escapeHtml(state.lastPrompt || "")}</textarea>
          <p class="mt-2 text-xs text-zinc-500">
            La IA genera todos los campos: título, slug, dificultad, etiquetas, enunciado (Markdown), código inicial en Python y JavaScript, etapas y pruebas.
          </p>
          <div class="flex justify-end mt-4">
            <button type="submit"
              class="px-6 py-2 rounded-lg bg-brand text-white hover:bg-brand-dark transition text-sm font-medium">
              Generar ejercicio con IA
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
            La IA completó todos los campos. Revisa y modifica lo que necesites antes de guardar.
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
    generatedProblem: null,
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
      const releaseButton = setLoadingButton(formButton(form), "Generando con IA…");
      state.error = null;
      try {
        const formData = new FormData(form);
        const prompt = String(formData.get("prompt") || "").trim();
        if (prompt.length < 10) throw new Error("El prompt debe tener al menos 10 caracteres.");
        state.lastPrompt = prompt;

        const created = await api.admin.generateProblem({ prompt });
        if (!isMounted) return;
        state.generatedProblem = created;
        state.phase = "edit";
        state.savedProblemId = null;
        render();
        showToast("Ejercicio generado. Revisa los datos y guarda.", "success");
      } catch (error) {
        if (!isMounted) return;
        state.error = error?.message || "No se pudo generar el ejercicio.";
        render();
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
        const formData = new FormData(form);
        const problemId = String(formData.get("problem_id") || "").trim();
        if (!problemId) throw new Error("ID de problema no encontrado.");

        const payload = {
          title: String(formData.get("title") || "").trim(),
          slug: String(formData.get("slug") || "").trim(),
          difficulty: Number(formData.get("difficulty") || 1),
          tags: parseCsv(formData.get("tags")),
          status: formData.get("status"),
          statement_md: String(formData.get("statement_md") || ""),
          starter_code: {
            python: String(formData.get("starter_python") || "").trimEnd(),
            javascript: String(formData.get("starter_javascript") || "").trimEnd(),
          },
          stages_json: formData.get("stages_json"),
          source: "ai",
        };

        const lastPrompt = state.lastPrompt || state.generatedProblem?.last_generated_prompt || "";
        if (lastPrompt) payload.last_generated_prompt = lastPrompt;

        const updated = await api.admin.updateProblem(problemId, payload);
        if (!isMounted) return;
        state.generatedProblem = updated;
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

  const onClick = (event) => {
    const trigger = event.target.closest("[data-action]");
    if (!trigger || !container.contains(trigger)) return;
    if (trigger.dataset.action === "back-to-prompt") {
      state.phase = "prompt";
      state.error = null;
      state.generatedProblem = null;
      state.savedProblemId = null;
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
