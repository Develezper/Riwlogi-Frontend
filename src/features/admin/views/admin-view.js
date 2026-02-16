import { api } from "../../../shared/services/api/index.js";
import { escapeHtml, showToast, spinner } from "../../../shared/utils/ui-helpers.js";

const statusConfig = {
  published: {
    label: "Publicado",
    className: "text-green-300 bg-green-500/10 border-green-500/30",
  },
  draft: {
    label: "Borrador",
    className: "text-amber-300 bg-amber-500/10 border-amber-500/30",
  },
  archived: {
    label: "Archivado",
    className: "text-zinc-400 bg-zinc-600/10 border-zinc-600/30",
  },
};

const sourceConfig = {
  base: {
    label: "Base",
    className: "text-zinc-300 bg-zinc-700/30 border-zinc-600/40",
  },
  custom: {
    label: "Custom",
    className: "text-sky-300 bg-sky-500/10 border-sky-500/30",
  },
  ai: {
    label: "IA",
    className: "text-purple-300 bg-purple-500/10 border-purple-500/30",
  },
};

function difficultyLabel(level) {
  const map = {
    1: "Easy",
    2: "Medium",
    3: "Hard",
  };
  return map[Number(level)] || "Easy";
}

function formatDateTime(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleString("es-CO", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function parseCsv(value) {
  return [...new Set(String(value || "").split(",").map((item) => item.trim()).filter(Boolean))];
}

function formatList(values = []) {
  if (!Array.isArray(values)) return "";
  return values.join(", ");
}

function stageEditorJson(problem) {
  const stages = Array.isArray(problem?.stages) ? problem.stages : [];
  const payload = stages.map((stage) => ({
    stage_index: Number(stage.stage_index || 1),
    prompt_md: String(stage.prompt_md || ""),
    hidden_count: Number(stage.hidden_count || 0),
    visible_tests: Array.isArray(stage.visible_tests)
      ? stage.visible_tests.map((test) => ({
          input_text: String(test.input_text || ""),
          expected_text: String(test.expected_text || ""),
        }))
      : [],
  }));

  return JSON.stringify(payload, null, 2);
}

function statusBadge(status) {
  const config = statusConfig[status] || statusConfig.draft;
  return `<span class="inline-flex px-2 py-1 rounded-full text-xs border ${config.className}">${config.label}</span>`;
}

function sourceBadge(source) {
  const config = sourceConfig[source] || sourceConfig.custom;
  return `<span class="inline-flex px-2 py-1 rounded-full text-xs border ${config.className}">${config.label}</span>`;
}

function kpiCard(title, value, subtitle) {
  return `
    <div class="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4">
      <p class="text-xs uppercase tracking-wide text-zinc-500">${escapeHtml(title)}</p>
      <p class="mt-2 text-2xl font-bold text-zinc-100">${escapeHtml(String(value))}</p>
      <p class="mt-1 text-xs text-zinc-500">${escapeHtml(subtitle)}</p>
    </div>
  `;
}

function renderDashboard(container, state) {
  if (state.loading) {
    container.innerHTML = spinner("lg");
    return;
  }

  if (state.error && !state.overview) {
    container.innerHTML = `
      <section class="max-w-4xl mx-auto px-4 py-12 text-center">
        <h1 class="text-2xl font-semibold text-zinc-100">Panel admin no disponible</h1>
        <p class="mt-3 text-zinc-400">${escapeHtml(state.error)}</p>
        <button data-action="refresh-admin" class="mt-6 px-4 py-2 rounded-lg bg-brand text-white hover:bg-brand-dark transition">Reintentar</button>
      </section>
    `;
    return;
  }

  const overview = state.overview || {
    kpis: {},
    top_tags: [],
    recent_activity: [],
    updated_at: null,
  };

  const kpis = overview.kpis || {};
  const problems = Array.isArray(state.problems) ? state.problems : [];
  const users = Array.isArray(state.users) ? state.users : [];

  const selectedProblem =
    problems.find((problem) => problem.id === state.selectedProblemId || problem.slug === state.selectedProblemId) ||
    problems[0] ||
    null;

  const editValues = selectedProblem
    ? {
        title: selectedProblem.title,
        slug: selectedProblem.slug,
        difficulty: String(selectedProblem.difficulty || 1),
        tags: formatList(selectedProblem.tags),
        status: selectedProblem.status || "draft",
        statement_md: selectedProblem.statement_md || "",
        starter_python: selectedProblem.starter_code?.python || "",
        starter_javascript: selectedProblem.starter_code?.javascript || "",
        stages_json: stageEditorJson(selectedProblem),
      }
    : null;

  container.innerHTML = `
    <section class="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      <div class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 class="text-3xl font-bold text-zinc-100">Admin Console</h1>
          <p class="text-zinc-400 mt-1">Gestión integral de usuarios, métricas y ejercicios IA.</p>
          <p class="text-xs text-zinc-500 mt-1">Última actualización: ${escapeHtml(formatDateTime(overview.updated_at))}</p>
        </div>
        <button data-action="refresh-admin" class="px-4 py-2 rounded-lg border border-zinc-700 text-zinc-200 hover:bg-zinc-800 transition">
          Refrescar datos
        </button>
      </div>

      ${
        state.error
          ? `<div class="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">${escapeHtml(state.error)}</div>`
          : ""
      }

      <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        ${kpiCard("Usuarios", kpis.total_users || 0, `${kpis.active_users_7d || 0} activos en 7 días`)}
        ${kpiCard("Problemas", kpis.total_problems || 0, `${kpis.published_problems || 0} publicados`)}
        ${kpiCard("Submissions", kpis.total_submissions || 0, `${kpis.accepted_submissions || 0} accepted`)}
        ${kpiCard("Aceptación", `${Number(kpis.acceptance_rate || 0).toFixed(1)}%`, `${kpis.ai_generated_problems || 0} generados por IA`)}
      </div>

      <div class="grid grid-cols-1 xl:grid-cols-[2fr_1fr] gap-6">
        <div class="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-lg font-semibold text-zinc-100">Generación de ejercicios con IA</h2>
            <span class="text-xs text-zinc-500">Front listo para integrar motor IA en backend</span>
          </div>

          <form id="generate-ai-form" class="grid grid-cols-1 md:grid-cols-2 gap-4" novalidate>
            <div>
              <label for="ai-title" class="block text-xs text-zinc-400 mb-1">Título / tema</label>
              <input id="ai-title" name="title_hint" required placeholder="Ej: Matching de inventario en tiempo real"
                class="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-sm text-zinc-100 focus:outline-none focus:border-brand transition" />
            </div>

            <div>
              <label for="ai-tags" class="block text-xs text-zinc-400 mb-1">Tags (coma)</label>
              <input id="ai-tags" name="tags" placeholder="arrays, hashing, backend"
                class="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-sm text-zinc-100 focus:outline-none focus:border-brand transition" />
            </div>

            <div>
              <label for="ai-difficulty" class="block text-xs text-zinc-400 mb-1">Dificultad</label>
              <select id="ai-difficulty" name="difficulty"
                class="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-sm text-zinc-100 focus:outline-none focus:border-brand transition">
                <option value="1">Easy</option>
                <option value="2" selected>Medium</option>
                <option value="3">Hard</option>
              </select>
            </div>

            <div>
              <label for="ai-langs" class="block text-xs text-zinc-400 mb-1">Lenguajes target</label>
              <input id="ai-langs" name="target_languages" value="python,javascript"
                class="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-sm text-zinc-100 focus:outline-none focus:border-brand transition" />
            </div>

            <div>
              <label for="ai-stage-count" class="block text-xs text-zinc-400 mb-1">Etapas</label>
              <input id="ai-stage-count" name="stage_count" type="number" min="1" max="5" value="2"
                class="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-sm text-zinc-100 focus:outline-none focus:border-brand transition" />
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div>
                <label for="ai-visible-tests" class="block text-xs text-zinc-400 mb-1">Tests visibles</label>
                <input id="ai-visible-tests" name="visible_tests_per_stage" type="number" min="1" max="6" value="2"
                  class="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-sm text-zinc-100 focus:outline-none focus:border-brand transition" />
              </div>
              <div>
                <label for="ai-hidden-tests" class="block text-xs text-zinc-400 mb-1">Tests ocultos</label>
                <input id="ai-hidden-tests" name="hidden_tests_per_stage" type="number" min="1" max="10" value="2"
                  class="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-sm text-zinc-100 focus:outline-none focus:border-brand transition" />
              </div>
            </div>

            <div class="md:col-span-2">
              <label for="ai-prompt" class="block text-xs text-zinc-400 mb-1">Prompt maestro para IA</label>
              <textarea id="ai-prompt" name="prompt" rows="4" required
                placeholder="Define objetivo, enfoque, output esperado y estilo pedagógico del ejercicio..."
                class="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-sm text-zinc-100 focus:outline-none focus:border-brand transition"></textarea>
            </div>

            <div class="md:col-span-2">
              <label for="ai-context" class="block text-xs text-zinc-400 mb-1">Contexto de negocio / producto</label>
              <textarea id="ai-context" name="business_context" rows="2"
                placeholder="Contexto funcional que debe usar la IA para construir la narrativa del ejercicio"
                class="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-sm text-zinc-100 focus:outline-none focus:border-brand transition"></textarea>
            </div>

            <div>
              <label for="ai-constraints" class="block text-xs text-zinc-400 mb-1">Restricciones</label>
              <textarea id="ai-constraints" name="constraints" rows="2"
                placeholder="Complejidad, memoria, límites, edge cases"
                class="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-sm text-zinc-100 focus:outline-none focus:border-brand transition"></textarea>
            </div>

            <div>
              <label for="ai-examples" class="block text-xs text-zinc-400 mb-1">Ejemplos de entrada/salida</label>
              <textarea id="ai-examples" name="examples" rows="2"
                placeholder="Input: ... Output: ..."
                class="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-sm text-zinc-100 focus:outline-none focus:border-brand transition"></textarea>
            </div>

            <div class="md:col-span-2">
              <label for="ai-rubric" class="block text-xs text-zinc-400 mb-1">Rubrica de evaluación</label>
              <textarea id="ai-rubric" name="evaluation_rubric" rows="2"
                placeholder="Qué debe evaluar cada etapa y cómo puntuar"
                class="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-sm text-zinc-100 focus:outline-none focus:border-brand transition"></textarea>
            </div>

            <div class="md:col-span-2 flex items-center justify-between gap-4 pt-1">
              <label class="inline-flex items-center gap-2 text-sm text-zinc-300">
                <input type="checkbox" name="publish" class="rounded border-zinc-700 bg-zinc-900 text-brand" />
                Publicar inmediatamente
              </label>
              <button type="submit" class="px-4 py-2 rounded-lg bg-brand text-white hover:bg-brand-dark transition">
                Generar ejercicio IA
              </button>
            </div>
          </form>
        </div>

        <div class="space-y-6">
          <div class="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5">
            <h2 class="text-lg font-semibold text-zinc-100 mb-4">Top tags</h2>
            <div class="space-y-2">
              ${
                overview.top_tags?.length
                  ? overview.top_tags
                      .map(
                        (row) => `
                      <div class="flex items-center justify-between rounded-lg border border-zinc-800 px-3 py-2 text-sm">
                        <span class="text-zinc-200">${escapeHtml(row.tag)}</span>
                        <span class="text-zinc-500">${escapeHtml(String(row.count || 0))}</span>
                      </div>
                    `,
                      )
                      .join("")
                  : `<p class="text-sm text-zinc-500">Sin tags suficientes aún.</p>`
              }
            </div>
          </div>

          <div class="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5">
            <h2 class="text-lg font-semibold text-zinc-100 mb-4">Actividad reciente</h2>
            <div class="space-y-3">
              ${
                overview.recent_activity?.length
                  ? overview.recent_activity
                      .map(
                        (item) => `
                      <div class="rounded-lg border border-zinc-800 px-3 py-2">
                        <p class="text-sm text-zinc-100">${escapeHtml(item.label)}</p>
                        <p class="text-xs text-zinc-500 mt-1">${escapeHtml(item.type)} · ${escapeHtml(
                          formatDateTime(item.created_at),
                        )}</p>
                      </div>
                    `,
                      )
                      .join("")
                  : `<p class="text-sm text-zinc-500">No hay actividad reciente.</p>`
              }
            </div>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 xl:grid-cols-[1.3fr_1fr] gap-6">
        <div class="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-lg font-semibold text-zinc-100">Catálogo de ejercicios</h2>
            <p class="text-xs text-zinc-500">${escapeHtml(String(problems.length))} items</p>
          </div>

          <div class="overflow-x-auto">
            <table class="w-full min-w-[720px] text-sm">
              <thead>
                <tr class="text-left text-zinc-500 border-b border-zinc-800">
                  <th class="py-2 pr-3">Título</th>
                  <th class="py-2 pr-3">Tipo</th>
                  <th class="py-2 pr-3">Estado</th>
                  <th class="py-2 pr-3">Dificultad</th>
                  <th class="py-2 pr-3">Actualizado</th>
                  <th class="py-2">Acciones</th>
                </tr>
              </thead>
              <tbody>
                ${
                  problems.length
                    ? problems
                        .map(
                          (problem) => `
                        <tr class="border-b border-zinc-800/80">
                          <td class="py-3 pr-3">
                            <p class="text-zinc-100 font-medium">${escapeHtml(problem.title)}</p>
                            <p class="text-xs text-zinc-500">${escapeHtml(problem.slug)}</p>
                          </td>
                          <td class="py-3 pr-3">${sourceBadge(problem.source)}</td>
                          <td class="py-3 pr-3">${statusBadge(problem.status)}</td>
                          <td class="py-3 pr-3 text-zinc-300">${escapeHtml(difficultyLabel(problem.difficulty))}</td>
                          <td class="py-3 pr-3 text-zinc-500">${escapeHtml(formatDateTime(problem.updated_at))}</td>
                          <td class="py-3">
                            <div class="flex items-center gap-2">
                              <button data-action="select-problem" data-problem-id="${escapeHtml(problem.id)}" class="px-2 py-1 rounded border border-zinc-700 text-zinc-300 hover:bg-zinc-800 transition">Editar</button>
                              <button data-action="archive-problem" data-problem-id="${escapeHtml(problem.id)}" class="px-2 py-1 rounded border border-red-500/30 text-red-300 hover:bg-red-500/10 transition">Archivar</button>
                            </div>
                          </td>
                        </tr>
                      `,
                        )
                        .join("")
                    : `<tr><td colspan="6" class="py-6 text-center text-zinc-500">No hay ejercicios aún.</td></tr>`
                }
              </tbody>
            </table>
          </div>
        </div>

        <div class="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5">
          <h2 class="text-lg font-semibold text-zinc-100 mb-4">Editar ejercicio</h2>

          ${
            editValues
              ? `
                <form id="edit-problem-form" class="space-y-3" novalidate>
                  <div>
                    <label for="edit-problem-id" class="block text-xs text-zinc-400 mb-1">Selecciona ejercicio</label>
                    <select id="edit-problem-id" name="problem_id"
                      class="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-sm text-zinc-100 focus:outline-none focus:border-brand transition">
                      ${problems
                        .map(
                          (problem) => `
                          <option value="${escapeHtml(problem.id)}" ${
                            problem.id === selectedProblem?.id ? "selected" : ""
                          }>${escapeHtml(problem.title)} (${escapeHtml(problem.slug)})</option>
                        `,
                        )
                        .join("")}
                    </select>
                  </div>

                  <div>
                    <label for="edit-title" class="block text-xs text-zinc-400 mb-1">Título</label>
                    <input id="edit-title" name="title" required value="${escapeHtml(editValues.title)}"
                      class="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-sm text-zinc-100 focus:outline-none focus:border-brand transition" />
                  </div>

                  <div>
                    <label for="edit-slug" class="block text-xs text-zinc-400 mb-1">Slug</label>
                    <input id="edit-slug" name="slug" value="${escapeHtml(editValues.slug)}"
                      class="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-sm text-zinc-100 focus:outline-none focus:border-brand transition" />
                  </div>

                  <div class="grid grid-cols-2 gap-3">
                    <div>
                      <label for="edit-difficulty" class="block text-xs text-zinc-400 mb-1">Dificultad</label>
                      <select id="edit-difficulty" name="difficulty"
                        class="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-sm text-zinc-100 focus:outline-none focus:border-brand transition">
                        <option value="1" ${editValues.difficulty === "1" ? "selected" : ""}>Easy</option>
                        <option value="2" ${editValues.difficulty === "2" ? "selected" : ""}>Medium</option>
                        <option value="3" ${editValues.difficulty === "3" ? "selected" : ""}>Hard</option>
                      </select>
                    </div>

                    <div>
                      <label for="edit-status" class="block text-xs text-zinc-400 mb-1">Estado</label>
                      <select id="edit-status" name="status"
                        class="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-sm text-zinc-100 focus:outline-none focus:border-brand transition">
                        <option value="draft" ${editValues.status === "draft" ? "selected" : ""}>Borrador</option>
                        <option value="published" ${editValues.status === "published" ? "selected" : ""}>Publicado</option>
                        <option value="archived" ${editValues.status === "archived" ? "selected" : ""}>Archivado</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label for="edit-tags" class="block text-xs text-zinc-400 mb-1">Tags (coma)</label>
                    <input id="edit-tags" name="tags" value="${escapeHtml(editValues.tags)}"
                      class="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-sm text-zinc-100 focus:outline-none focus:border-brand transition" />
                  </div>

                  <div>
                    <label for="edit-statement" class="block text-xs text-zinc-400 mb-1">Statement (Markdown)</label>
                    <textarea id="edit-statement" name="statement_md" rows="5"
                      class="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-sm text-zinc-100 focus:outline-none focus:border-brand transition">${escapeHtml(
                        editValues.statement_md,
                      )}</textarea>
                  </div>

                  <div>
                    <label for="edit-python" class="block text-xs text-zinc-400 mb-1">Starter code Python</label>
                    <textarea id="edit-python" name="starter_python" rows="4"
                      class="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-xs font-mono text-zinc-100 focus:outline-none focus:border-brand transition">${escapeHtml(
                        editValues.starter_python,
                      )}</textarea>
                  </div>

                  <div>
                    <label for="edit-js" class="block text-xs text-zinc-400 mb-1">Starter code JavaScript</label>
                    <textarea id="edit-js" name="starter_javascript" rows="4"
                      class="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-xs font-mono text-zinc-100 focus:outline-none focus:border-brand transition">${escapeHtml(
                        editValues.starter_javascript,
                      )}</textarea>
                  </div>

                  <div>
                    <label for="edit-stages" class="block text-xs text-zinc-400 mb-1">Stages JSON</label>
                    <textarea id="edit-stages" name="stages_json" rows="8"
                      class="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-xs font-mono text-zinc-100 focus:outline-none focus:border-brand transition">${escapeHtml(
                        editValues.stages_json,
                      )}</textarea>
                    <p class="text-[11px] text-zinc-500 mt-1">Cada stage debe incluir: stage_index, prompt_md, hidden_count, visible_tests.</p>
                  </div>

                  <button type="submit" class="w-full px-4 py-2 rounded-lg bg-brand text-white hover:bg-brand-dark transition">
                    Guardar cambios
                  </button>
                </form>
              `
              : `<p class="text-sm text-zinc-500">Selecciona un ejercicio para editarlo.</p>`
          }
        </div>
      </div>

      <div class="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-lg font-semibold text-zinc-100">Usuarios</h2>
          <p class="text-xs text-zinc-500">${escapeHtml(String(users.length))} registros</p>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full min-w-[720px] text-sm">
            <thead>
              <tr class="text-left text-zinc-500 border-b border-zinc-800">
                <th class="py-2 pr-3">Usuario</th>
                <th class="py-2 pr-3">Rol</th>
                <th class="py-2 pr-3">Submissions</th>
                <th class="py-2 pr-3">Resueltos</th>
                <th class="py-2 pr-3">Última actividad</th>
                <th class="py-2">Acciones</th>
              </tr>
            </thead>
            <tbody>
              ${
                users.length
                  ? users
                      .map(
                        (user) => `
                      <tr class="border-b border-zinc-800/80">
                        <td class="py-3 pr-3">
                          <p class="text-zinc-100 font-medium">${escapeHtml(user.display_name || user.username)}</p>
                          <p class="text-xs text-zinc-500">${escapeHtml(user.email)}</p>
                        </td>
                        <td class="py-3 pr-3">
                          <span class="inline-flex px-2 py-1 rounded-full text-xs border ${
                            user.is_admin
                              ? "text-brand bg-brand/10 border-brand/30"
                              : "text-zinc-300 bg-zinc-700/30 border-zinc-600/40"
                          }">${escapeHtml(user.role || (user.is_admin ? "admin" : "user"))}</span>
                        </td>
                        <td class="py-3 pr-3 text-zinc-300">${escapeHtml(String(user.submissions_count || 0))}</td>
                        <td class="py-3 pr-3 text-zinc-300">${escapeHtml(String(user.solved_count || 0))}</td>
                        <td class="py-3 pr-3 text-zinc-500">${escapeHtml(formatDateTime(user.last_active_at))}</td>
                        <td class="py-3">
                          ${
                            user.is_admin
                              ? `<span class="text-xs text-zinc-500">Protegido</span>`
                              : `<button data-action="delete-user" data-user-id="${escapeHtml(
                                  user.id,
                                )}" class="px-2 py-1 rounded border border-red-500/30 text-red-300 hover:bg-red-500/10 transition">Eliminar</button>`
                          }
                        </td>
                      </tr>
                    `,
                      )
                      .join("")
                  : `<tr><td colspan="6" class="py-6 text-center text-zinc-500">No hay usuarios para mostrar.</td></tr>`
              }
            </tbody>
          </table>
        </div>
      </div>
    </section>
  `;
}

function formButton(form) {
  return form.querySelector('button[type="submit"]');
}

function setLoadingButton(button, loadingText) {
  if (!button) return () => {};
  const previous = button.textContent;
  button.disabled = true;
  button.textContent = loadingText;

  return () => {
    button.disabled = false;
    button.textContent = previous;
  };
}

export async function adminView(container) {
  const state = {
    loading: true,
    error: null,
    overview: null,
    users: [],
    problems: [],
    selectedProblemId: null,
  };

  let isMounted = true;

  async function loadData({ keepSelection = true } = {}) {
    if (!isMounted) return;

    if (!state.overview) {
      state.loading = true;
      renderDashboard(container, state);
    }

    try {
      const [overview, users, problems] = await Promise.all([
        api.admin.overview(),
        api.admin.users(),
        api.admin.problems(),
      ]);

      if (!isMounted) return;

      state.overview = overview;
      state.users = users;
      state.problems = problems;
      state.error = null;

      if (!keepSelection || !state.selectedProblemId) {
        state.selectedProblemId = problems[0]?.id || null;
      } else {
        const selectedStillExists = problems.some(
          (problem) => problem.id === state.selectedProblemId || problem.slug === state.selectedProblemId,
        );
        if (!selectedStillExists) {
          state.selectedProblemId = problems[0]?.id || null;
        }
      }
    } catch (error) {
      if (!isMounted) return;
      state.error = error?.message || "No se pudo cargar el panel admin.";
      if (state.overview) {
        showToast(state.error, "error");
      }
    } finally {
      if (!isMounted) return;
      state.loading = false;
      renderDashboard(container, state);
    }
  }

  container.innerHTML = spinner("lg");

  const onClick = async (event) => {
    const trigger = event.target.closest("[data-action]");
    if (!trigger || !container.contains(trigger)) return;

    const action = trigger.dataset.action;

    if (action === "refresh-admin") {
      await loadData();
      return;
    }

    if (action === "select-problem") {
      const selectedProblemId = String(trigger.dataset.problemId || "").trim();
      if (!selectedProblemId) return;
      state.selectedProblemId = selectedProblemId;
      renderDashboard(container, state);
      return;
    }

    if (action === "archive-problem") {
      const problemId = String(trigger.dataset.problemId || "").trim();
      if (!problemId) return;

      const confirmed = window.confirm("¿Archivar este ejercicio? Dejará de estar visible para usuarios.");
      if (!confirmed) return;

      try {
        await api.admin.deleteProblem(problemId);
        showToast("Ejercicio archivado.", "success");
        await loadData({ keepSelection: false });
      } catch (error) {
        showToast(error?.message || "No se pudo archivar el ejercicio.", "error");
      }
      return;
    }

    if (action === "delete-user") {
      const userId = String(trigger.dataset.userId || "").trim();
      if (!userId) return;

      const confirmed = window.confirm("¿Eliminar este usuario y sus submissions?");
      if (!confirmed) return;

      try {
        await api.admin.deleteUser(userId);
        showToast("Usuario eliminado.", "success");
        await loadData();
      } catch (error) {
        showToast(error?.message || "No se pudo eliminar el usuario.", "error");
      }
    }
  };

  const onSubmit = async (event) => {
    const form = event.target;
    if (!form || form.tagName !== "FORM") return;

    if (form.id === "generate-ai-form") {
      event.preventDefault();
      const releaseButton = setLoadingButton(formButton(form), "Generando...");
      const formData = new FormData(form);

      try {
        const payload = {
          title_hint: formData.get("title_hint"),
          tags: parseCsv(formData.get("tags")),
          difficulty: Number(formData.get("difficulty") || 1),
          target_languages: parseCsv(formData.get("target_languages")),
          stage_count: Number(formData.get("stage_count") || 2),
          visible_tests_per_stage: Number(formData.get("visible_tests_per_stage") || 2),
          hidden_tests_per_stage: Number(formData.get("hidden_tests_per_stage") || 2),
          prompt: formData.get("prompt"),
          business_context: formData.get("business_context"),
          constraints: formData.get("constraints"),
          examples: formData.get("examples"),
          evaluation_rubric: formData.get("evaluation_rubric"),
          publish: formData.get("publish") === "on",
        };

        const created = await api.admin.generateProblem(payload);
        showToast("Ejercicio generado y guardado.", "success");

        form.reset();
        const selectedDifficulty = form.querySelector('select[name="difficulty"]');
        if (selectedDifficulty) selectedDifficulty.value = "2";

        state.selectedProblemId = created.id;
        await loadData();
      } catch (error) {
        showToast(error?.message || "No se pudo generar el ejercicio.", "error");
      } finally {
        releaseButton();
      }
      return;
    }

    if (form.id === "edit-problem-form") {
      event.preventDefault();
      const releaseButton = setLoadingButton(formButton(form), "Guardando...");
      const formData = new FormData(form);

      try {
        const problemId = String(formData.get("problem_id") || "").trim();
        if (!problemId) throw new Error("Debes seleccionar un problema.");

        const payload = {
          title: formData.get("title"),
          slug: formData.get("slug"),
          difficulty: Number(formData.get("difficulty") || 1),
          tags: parseCsv(formData.get("tags")),
          status: formData.get("status"),
          statement_md: formData.get("statement_md"),
          starter_code: {
            python: String(formData.get("starter_python") || "").trimEnd(),
            javascript: String(formData.get("starter_javascript") || "").trimEnd(),
          },
          stages_json: formData.get("stages_json"),
        };

        const updated = await api.admin.updateProblem(problemId, payload);
        state.selectedProblemId = updated.id;
        showToast("Ejercicio actualizado.", "success");
        await loadData();
      } catch (error) {
        showToast(error?.message || "No se pudo actualizar el ejercicio.", "error");
      } finally {
        releaseButton();
      }
    }
  };

  const onChange = (event) => {
    const target = event.target;
    if (!target || target.tagName !== "SELECT") return;

    if (target.name === "problem_id") {
      const selectedProblemId = String(target.value || "").trim();
      if (!selectedProblemId) return;
      state.selectedProblemId = selectedProblemId;
      renderDashboard(container, state);
    }
  };

  container.addEventListener("click", onClick);
  container.addEventListener("submit", onSubmit);
  container.addEventListener("change", onChange);

  await loadData({ keepSelection: false });

  return () => {
    isMounted = false;
    container.removeEventListener("click", onClick);
    container.removeEventListener("submit", onSubmit);
    container.removeEventListener("change", onChange);
  };
}
