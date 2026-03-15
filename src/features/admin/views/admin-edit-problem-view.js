import { api } from "../../../shared/services/api/index.js";
import { escapeHtml, showToast, spinner } from "../../../shared/utils/ui-helpers.js";
import { adminNav } from "../components/admin-nav.js";
import { buildStageEditorHtml, handleStageEditorAction, syncStageEditorJsonField } from "../utils/stage-editor.js";
import {
  formatList,
  parseCsv,
  formButton,
  setLoadingButton,
} from "../utils/admin-utils.js";
import { mountAdminFormEditors } from "../utils/admin-form-editors.js";

function parseStagesJson(rawValue) {
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

  const firstStage = parsed[0] || {};
  return [
    {
      stage_index: 1,
      prompt_md: String(firstStage.prompt_md || "").trim(),
      hidden_count: Math.max(0, Number.parseInt(String(firstStage.hidden_count ?? 0), 10) || 0),
      visible_tests: Array.isArray(firstStage.visible_tests)
        ? firstStage.visible_tests
            .map((test) => ({
              input_text: String(test?.input_text || "").trim(),
              expected_text: String(test?.expected_text || "").trim(),
            }))
            .filter((test) => test.input_text || test.expected_text)
        : [],
    },
  ];
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
  const ts = escapeHtml(problem.starter_code?.typescript || "");
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
            <option value="pending" ${status === "pending" ? "selected" : ""}>Pendiente</option>
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

      <div data-md-editor>
        <div class="flex items-center justify-between mb-1">
          <label class="block text-xs text-zinc-400">Enunciado (Markdown)</label>
          <button type="button" data-md-toggle
            class="text-[11px] text-zinc-500 hover:text-zinc-300 transition px-2 py-0.5 rounded border border-zinc-700 hover:border-zinc-500">
            Preview
          </button>
        </div>
        <textarea name="statement_md" rows="7"
          class="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-sm text-zinc-100 focus:outline-none focus:border-brand transition resize-none">${statement}</textarea>
        <div data-md-preview
          class="hidden w-full min-h-40 px-4 py-3 bg-zinc-900 border border-zinc-700 rounded-lg text-sm overflow-auto prose-content">
        </div>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label class="block text-xs text-zinc-400 mb-1">Código inicial Python</label>
          <div data-code-editor="python" class="rounded-lg overflow-hidden border border-zinc-700">
            <textarea name="starter_python" data-hidden-input class="hidden">${python}</textarea>
            <div data-cm-mount></div>
          </div>
        </div>
        <div>
          <label class="block text-xs text-zinc-400 mb-1">Código inicial JavaScript</label>
          <div data-code-editor="javascript" class="rounded-lg overflow-hidden border border-zinc-700">
            <textarea name="starter_javascript" data-hidden-input class="hidden">${js}</textarea>
            <div data-cm-mount></div>
          </div>
        </div>
        <div>
          <label class="block text-xs text-zinc-400 mb-1">Código inicial TypeScript</label>
          <div data-code-editor="typescript" class="rounded-lg overflow-hidden border border-zinc-700">
            <textarea name="starter_typescript" data-hidden-input class="hidden">${ts}</textarea>
            <div data-cm-mount></div>
          </div>
        </div>
      </div>

      <div>
        <label class="block text-xs text-zinc-400 mb-2">Etapa única y tests</label>
        ${stagesEditor}
      </div>

      <div class="flex items-center justify-between pt-2 border-t border-zinc-800">
        <a href="#/admin/problems"
          class="px-4 py-2 rounded-lg border border-zinc-700 text-zinc-300 hover:bg-zinc-800 transition text-sm">
          ← Volver al catálogo
        </a>
        <button type="submit"
          class="px-6 py-2 rounded-lg bg-brand text-white hover:bg-brand-dark transition text-sm font-medium">
          Guardar cambios
        </button>
      </div>
    </form>
  `;
}

function renderViewHtml(container, state) {
  if (state.loading) {
    container.innerHTML = `${adminNav("problems")}<div class="p-8">${spinner("lg")}</div>`;
    return;
  }

  if (state.loadError && !state.problem) {
    container.innerHTML = `
      ${adminNav("problems")}
      <section class="max-w-3xl mx-auto px-4 py-12 text-center space-y-4">
        <p class="text-zinc-400">${escapeHtml(state.loadError)}</p>
        <a href="#/admin/problems"
          class="inline-block px-4 py-2 rounded-lg border border-zinc-700 text-zinc-200 hover:bg-zinc-800 transition text-sm">
          ← Volver al catálogo
        </a>
      </section>
    `;
    return;
  }

  const isAi = state.problem?.source === "ai" || state.problem?.ai_generated;
  const sourceBadgeHtml = isAi
    ? `<span class="inline-flex px-3 py-1 rounded-full text-xs border text-purple-300 bg-purple-500/10 border-purple-500/30">Generado por IA</span>`
    : "";

  container.innerHTML = `
    ${adminNav("problems")}
    <section class="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      <div class="flex items-start gap-4">
        <div class="flex-1">
          <h1 class="text-2xl font-bold text-zinc-100">Editar ejercicio</h1>
          <p class="text-zinc-400 text-sm mt-1">${escapeHtml(state.problem?.title || "")}</p>
        </div>
        ${sourceBadgeHtml}
      </div>

      ${state.error ? `<div class="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">${escapeHtml(state.error)}</div>` : ""}

      <div class="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
        ${state.problem ? buildEditFormHtml(state.problem) : ""}
      </div>
    </section>
  `;
}

export async function adminEditProblemView(container, params = {}) {
  const problemId = String(params.id || "").trim();
  const state = {
    loading: true,
    loadError: null,
    error: null,
    problem: null,
  };

  let isMounted = true;
  let editorCleanup = null;

  async function renderView(st) {
    if (editorCleanup) {
      editorCleanup();
      editorCleanup = null;
    }
    renderViewHtml(container, st);
    if (st.problem && !st.loading) {
      editorCleanup = await mountAdminFormEditors(container);
    }
  }

  async function loadProblem() {
    if (!problemId) {
      state.loading = false;
      state.loadError = "ID de ejercicio no especificado.";
      await renderView(state);
      return;
    }

    state.loading = true;
    await renderView(state);

    try {
      const problems = await api.admin.problems();
      const found = problems.find((p) => p.id === problemId);
      if (!found) throw new Error("Ejercicio no encontrado en el catálogo.");
      state.problem = found;
      state.loadError = null;
    } catch (error) {
      state.loadError = error?.message || "No se pudo cargar el ejercicio.";
    } finally {
      if (!isMounted) return;
      state.loading = false;
      await renderView(state);
    }
  }

  const onSubmit = async (event) => {
    const form = event.target;
    if (!form || form.id !== "edit-problem-form") return;
    event.preventDefault();

    const releaseButton = setLoadingButton(formButton(form), "Guardando…");
    state.error = null;

    try {
      syncStageEditorJsonField(form);
      const formData = new FormData(form);
      const pid = String(formData.get("problem_id") || "").trim();
      if (!pid) throw new Error("ID de problema no encontrado.");

      const payload = {
        title: String(formData.get("title") || "").trim(),
        slug: state.problem?.slug || String(formData.get("slug") || "").trim(),
        difficulty: Number(formData.get("difficulty") || 1),
        tags: parseCsv(formData.get("tags")),
        status: formData.get("status"),
        statement_md: String(formData.get("statement_md") || ""),
        starter_code: {
          python: String(formData.get("starter_python") || "").trimEnd(),
          javascript: String(formData.get("starter_javascript") || "").trimEnd(),
          typescript: String(formData.get("starter_typescript") || "").trimEnd(),
        },
        stages: parseStagesJson(formData.get("stages_json")),
        stages_count: 1,
      };

      if (state.problem?.source === "ai" || state.problem?.ai_generated) {
        payload.source = "ai";
        if (state.problem?.last_generated_prompt) {
          payload.last_generated_prompt = state.problem.last_generated_prompt;
        }
      }

      const updated = await api.admin.updateProblem(pid, payload);
      if (!isMounted) return;
      state.problem = updated;
      state.error = null;
      showToast("Ejercicio actualizado correctamente.", "success");
      await renderView(state);
    } catch (error) {
      if (!isMounted) return;
      state.error = error?.message || "No se pudo actualizar el ejercicio.";
      await renderView(state);
    } finally {
      releaseButton();
    }
  };

  const onClick = (event) => {
    handleStageEditorAction(event);
  };

  container.addEventListener("click", onClick);
  container.addEventListener("submit", onSubmit);
  await loadProblem();

  return () => {
    isMounted = false;
    if (editorCleanup) editorCleanup();
    container.removeEventListener("click", onClick);
    container.removeEventListener("submit", onSubmit);
  };
}
