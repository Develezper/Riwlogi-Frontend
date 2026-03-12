import { api } from "../../../shared/services/api/index.js";
import { escapeHtml, showToast, spinner } from "../../../shared/utils/ui-helpers.js";
import { adminNav } from "../components/admin-nav.js";
import {
  difficultyLabel,
  formatDateTime,
  activityTypeLabel,
  statusBadge,
  sourceBadge,
} from "../utils/admin-utils.js";

const POLL_INTERVAL = 15_000;

function renderActivityFeed(problem, activity) {
  const slug = String(problem.slug || "").toLowerCase();
  const title = String(problem.title || "").toLowerCase();

  const filtered = activity.filter((item) => {
    const label = String(item.label || "").toLowerCase();
    return label.includes(slug) || label.includes(title);
  });

  if (!filtered.length) {
    return `<p class="text-xs text-zinc-500">Sin actividad reciente para este ejercicio.</p>`;
  }

  return filtered
    .slice(0, 8)
    .map(
      (item) => `
      <div class="rounded-lg border border-zinc-800 px-3 py-2">
        <p class="text-xs text-zinc-100">${escapeHtml(item.label)}</p>
        <p class="text-[11px] text-zinc-500 mt-0.5">${escapeHtml(activityTypeLabel(item.type))} · ${escapeHtml(formatDateTime(item.created_at))}</p>
      </div>
    `,
    )
    .join("");
}

function renderView(container, state) {
  if (state.loading) {
    container.innerHTML = `${adminNav("problems")}<div class="p-8">${spinner("lg")}</div>`;
    return;
  }

  const problems = Array.isArray(state.problems) ? state.problems : [];
  const activity = Array.isArray(state.activity) ? state.activity : [];
  const selected = problems.find((p) => p.id === state.selectedId) || problems[0] || null;

  container.innerHTML = `
    ${adminNav("problems")}
    <section class="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      <div class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 class="text-2xl font-bold text-zinc-100">Control de ejercicios</h1>
          <p class="text-zinc-400 text-sm mt-1">${escapeHtml(String(problems.length))} ejercicios registrados</p>
        </div>
        <div class="flex items-center gap-3 self-start">
          <a href="#/admin/generate" class="px-4 py-2 rounded-lg bg-brand text-white hover:bg-brand-dark transition text-sm">+ Generar con IA</a>
          <button data-action="refresh" class="px-4 py-2 rounded-lg border border-zinc-700 text-zinc-200 hover:bg-zinc-800 transition text-sm">Refrescar</button>
        </div>
      </div>

      ${state.error ? `<div class="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">${escapeHtml(state.error)}</div>` : ""}

      <div class="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-6">
        <div class="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5 overflow-x-auto">
          <table class="w-full min-w-[700px] text-sm">
            <thead>
              <tr class="text-left text-zinc-500 border-b border-zinc-800">
                <th class="py-2 pr-3 font-medium">Ejercicio</th>
                <th class="py-2 pr-3 font-medium">Origen</th>
                <th class="py-2 pr-3 font-medium">Estado</th>
                <th class="py-2 pr-3 font-medium">Dificultad</th>
                <th class="py-2 pr-3 font-medium">Envíos</th>
                <th class="py-2 pr-3 font-medium">Actualizado</th>
                <th class="py-2 font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody>
              ${
                problems.length
                  ? problems
                      .map(
                        (p) => `
                      <tr class="border-b border-zinc-800/60 cursor-pointer hover:bg-zinc-800/30 transition ${
                        p.id === selected?.id ? "bg-brand/5" : ""
                      }" data-action="select-problem" data-problem-id="${escapeHtml(p.id)}">
                        <td class="py-3 pr-3">
                          <p class="text-zinc-100 font-medium">${escapeHtml(p.title)}</p>
                        </td>
                        <td class="py-3 pr-3">${sourceBadge(p.source)}</td>
                        <td class="py-3 pr-3">${statusBadge(p.status)}</td>
                        <td class="py-3 pr-3 text-zinc-300">${escapeHtml(difficultyLabel(p.difficulty))}</td>
                        <td class="py-3 pr-3 text-zinc-300">${escapeHtml(String(p.submissions || 0))}</td>
                        <td class="py-3 pr-3 text-zinc-500 text-xs">${escapeHtml(formatDateTime(p.updated_at))}</td>
                        <td class="py-3" onclick="event.stopPropagation()">
                          <div class="flex items-center gap-2">
                            <a href="#/admin/problems/edit/${escapeHtml(p.id)}" class="px-2 py-1 rounded border border-zinc-700 text-zinc-300 hover:bg-zinc-800 transition text-xs">Editar</a>
                            <button data-action="archive-problem" data-problem-id="${escapeHtml(p.id)}" class="px-2 py-1 rounded border border-red-500/30 text-red-300 hover:bg-red-500/10 transition text-xs">Archivar</button>
                          </div>
                        </td>
                      </tr>
                    `,
                      )
                      .join("")
                  : `<tr><td colspan="7" class="py-8 text-center text-zinc-500 text-sm">No hay ejercicios aún.</td></tr>`
              }
            </tbody>
          </table>
        </div>

        <div class="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5">
          ${
            selected
              ? `
            <div class="mb-4">
              <div class="flex items-center justify-between">
                <h2 class="text-base font-semibold text-zinc-100">Actividad en tiempo real</h2>
                <span class="text-[10px] text-zinc-500 bg-zinc-800 px-2 py-0.5 rounded-full">cada 15 s</span>
              </div>
              <p class="text-xs text-zinc-500 mt-1 truncate">${escapeHtml(selected.title)}</p>
            </div>
            <div class="grid grid-cols-2 gap-2 mb-4">
              <div class="rounded-lg border border-zinc-800 p-3 text-center">
                <p class="text-xl font-bold text-zinc-100">${escapeHtml(String(selected.submissions || 0))}</p>
                <p class="text-[10px] text-zinc-500 mt-1">Envíos totales</p>
              </div>
              <div class="rounded-lg border border-zinc-800 p-3 text-center">
                <p class="text-xl font-bold text-zinc-100">${escapeHtml(`${Number(selected.acceptance || 0).toFixed(0)}%`)}</p>
                <p class="text-[10px] text-zinc-500 mt-1">Tasa acept.</p>
              </div>
            </div>
            <div class="space-y-2">
              ${renderActivityFeed(selected, activity)}
            </div>
          `
              : `<p class="text-sm text-zinc-500">Selecciona un ejercicio para ver su actividad en tiempo real.</p>`
          }
        </div>
      </div>
    </section>
  `;
}

export async function adminProblemsView(container) {
  const state = {
    loading: true,
    error: null,
    problems: [],
    activity: [],
    selectedId: null,
  };

  let isMounted = true;
  let pollTimer = null;

  async function loadData({ keepSelection = true } = {}) {
    if (!isMounted) return;
    if (!state.problems.length) {
      state.loading = true;
      renderView(container, state);
    }
    try {
      const [problems, overview] = await Promise.all([api.admin.problems(), api.admin.overview()]);
      if (!isMounted) return;
      state.problems = problems;
      state.activity = overview.recent_activity || [];
      state.error = null;
      if (!keepSelection || !state.selectedId) {
        state.selectedId = problems[0]?.id || null;
      } else {
        const stillExists = problems.some((p) => p.id === state.selectedId);
        if (!stillExists) state.selectedId = problems[0]?.id || null;
      }
    } catch (error) {
      if (!isMounted) return;
      state.error = error?.message || "No se pudo cargar los ejercicios.";
      if (state.problems.length) showToast(state.error, "error");
    } finally {
      if (!isMounted) return;
      state.loading = false;
      renderView(container, state);
    }
  }

  container.innerHTML = `${adminNav("problems")}<div class="p-8">${spinner("lg")}</div>`;

  const onClick = async (event) => {
    const trigger = event.target.closest("[data-action]");
    if (!trigger || !container.contains(trigger)) return;

    const action = trigger.dataset.action;

    if (action === "refresh") {
      await loadData({ keepSelection: true });
      return;
    }

    if (action === "select-problem") {
      state.selectedId = String(trigger.dataset.problemId || "").trim();
      renderView(container, state);
      return;
    }

    if (action === "archive-problem") {
      const problemId = String(trigger.dataset.problemId || "").trim();
      if (!problemId) return;
      if (!window.confirm("¿Archivar este ejercicio? Dejará de ser visible para los usuarios."))
        return;
      try {
        await api.admin.deleteProblem(problemId);
        showToast("Ejercicio archivado.", "success");
        await loadData({ keepSelection: false });
      } catch (error) {
        showToast(error?.message || "No se pudo archivar el ejercicio.", "error");
      }
    }
  };

  container.addEventListener("click", onClick);

  await loadData({ keepSelection: false });
  pollTimer = window.setInterval(() => loadData({ keepSelection: true }), POLL_INTERVAL);

  return () => {
    isMounted = false;
    window.clearInterval(pollTimer);
    container.removeEventListener("click", onClick);
  };
}
