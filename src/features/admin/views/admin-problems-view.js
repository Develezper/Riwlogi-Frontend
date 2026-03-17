import { api } from "../../../shared/services/api/index.js";
import { escapeHtml, showToast, spinner } from "../../../shared/utils/ui-helpers.js";
import { adminNav } from "../components/admin-nav.js";
import {
  difficultyLabel,
  formatDateTime,
  formatDuration,
  activityTypeLabel,
  statusBadge,
  sourceBadge,
} from "../utils/admin-utils.js";

const POLL_INTERVAL = 15_000;
const STATUS_FILTER_OPTIONS = [
  { value: "all", label: "Todos" },
  { value: "published", label: "Publicados" },
  { value: "pending", label: "Pendientes" },
  { value: "draft", label: "Borradores" },
  { value: "archived", label: "Archivados" },
];

const PAGE_SIZE_OPTIONS = [10, 20, 40];

function normalizeStatus(value) {
  return String(value || "")
    .trim()
    .toLowerCase();
}

function toProblemSortTimestamp(problem) {
  const updatedAt = new Date(problem?.updated_at).getTime();
  if (Number.isFinite(updatedAt)) return updatedAt;

  const createdAt = new Date(problem?.created_at).getTime();
  return Number.isFinite(createdAt) ? createdAt : 0;
}

function sortProblemsByMostRecent(items) {
  return items.slice().sort((left, right) => {
    const byRecent = toProblemSortTimestamp(right) - toProblemSortTimestamp(left);
    if (byRecent !== 0) return byRecent;

    const byCreatedAt =
      (new Date(right?.created_at).getTime() || 0) - (new Date(left?.created_at).getTime() || 0);
    if (byCreatedAt !== 0) return byCreatedAt;

    return String(left?.id || "").localeCompare(String(right?.id || ""));
  });
}

function paginate(items, page, pageSize) {
  const safeSize = Number.isFinite(pageSize) && pageSize > 0 ? pageSize : PAGE_SIZE_OPTIONS[1];
  const totalItems = Array.isArray(items) ? items.length : 0;
  const totalPages = Math.max(1, Math.ceil(totalItems / safeSize));
  const safePage = Math.min(Math.max(1, Number(page) || 1), totalPages);
  const start = (safePage - 1) * safeSize;
  const end = start + safeSize;

  return {
    items: items.slice(start, end),
    page: safePage,
    pageSize: safeSize,
    totalItems,
    totalPages,
    rangeStart: totalItems ? start + 1 : 0,
    rangeEnd: totalItems ? Math.min(end, totalItems) : 0,
  };
}

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
  const statusFilter = normalizeStatus(state.statusFilter || "all");
  const filteredProblems =
    statusFilter === "all"
      ? problems
      : problems.filter((problem) => normalizeStatus(problem.status) === statusFilter);
  const pagination = paginate(filteredProblems, state.page, state.pageSize);
  state.page = pagination.page;
  state.pageSize = pagination.pageSize;
  const pageProblems = pagination.items;
  const activity = Array.isArray(state.activity) ? state.activity : [];
  const selected = pageProblems.find((p) => p.id === state.selectedId) || pageProblems[0] || null;

  container.innerHTML = `
    ${adminNav("problems")}
    <section class="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      <div class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 class="text-2xl font-bold text-zinc-100">Control de ejercicios</h1>
          <p class="text-zinc-400 text-sm mt-1">${escapeHtml(String(filteredProblems.length))} visibles de ${escapeHtml(String(problems.length))} ejercicios</p>
        </div>
        <div class="flex items-center gap-3 self-start">
          <a href="#/admin/generate" class="px-4 py-2 rounded-lg bg-brand text-white hover:bg-brand-dark transition text-sm">+ Generar con IA</a>
          <button data-action="refresh" class="px-4 py-2 rounded-lg border border-zinc-700 text-zinc-200 hover:bg-zinc-800 transition text-sm">Refrescar</button>
        </div>
      </div>

      ${state.error ? `<div class="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">${escapeHtml(state.error)}</div>` : ""}

      <div class="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-6">
        <div class="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5 overflow-x-auto">
          <div class="mb-4 flex items-center justify-between gap-3">
            <label class="text-xs text-zinc-400" for="admin-problems-status-filter">Filtrar por estado</label>
            <select id="admin-problems-status-filter" data-action="filter-status" class="px-3 py-1.5 rounded-lg border border-zinc-700 bg-zinc-900 text-zinc-200 text-xs focus:outline-none focus:border-brand transition">
              ${STATUS_FILTER_OPTIONS.map((option) => `<option value="${escapeHtml(option.value)}" ${option.value === statusFilter ? "selected" : ""}>${escapeHtml(option.label)}</option>`).join("")}
            </select>
          </div>
          <table class="w-full min-w-[700px] text-sm">
            <thead>
              <tr class="text-left text-zinc-500 border-b border-zinc-800">
                <th class="py-2 pr-3 font-medium">Ejercicio</th>
                <th class="py-2 pr-3 font-medium">Origen</th>
                <th class="py-2 pr-3 font-medium">Estado</th>
                <th class="py-2 pr-3 font-medium">Dificultad</th>
                <th class="py-2 pr-3 font-medium">Envíos</th>
                <th class="py-2 pr-3 font-medium">Aceptación</th>
                <th class="py-2 pr-3 font-medium">Tiempo prom.</th>
                <th class="py-2 pr-3 font-medium">Actualizado</th>
                <th class="py-2 font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody>
              ${
                pageProblems.length
                  ? pageProblems
                      .map((p) => {
                        const isArchived = normalizeStatus(p.status) === "archived";
                        const buttonLabel = isArchived ? "Desarchivar" : "Archivar";
                        const nextStatus = isArchived ? "draft" : "archived";
                        const buttonClass = isArchived
                          ? "border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/10"
                          : "border-red-500/30 text-red-300 hover:bg-red-500/10";

                        return `
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
                        <td class="py-3 pr-3 text-zinc-300">${escapeHtml(`${Number(p.acceptance || 0).toFixed(1)}%`)}</td>
                        <td class="py-3 pr-3 text-zinc-300">${escapeHtml(formatDuration(p.avg_solve_time_ms))}</td>
                        <td class="py-3 pr-3 text-zinc-500 text-xs">${escapeHtml(formatDateTime(p.updated_at))}</td>
                        <td class="py-3" data-actions-cell="true">
                          <div class="flex items-center gap-2">
                            <a data-action="edit-problem" href="#/admin/problems/edit/${escapeHtml(p.id)}" class="px-2 py-1 rounded border border-zinc-700 text-zinc-300 hover:bg-zinc-800 transition text-xs">Editar</a>
                            <button
                              data-action="toggle-archive-problem"
                              data-problem-id="${escapeHtml(p.id)}"
                              data-next-status="${escapeHtml(nextStatus)}"
                              class="px-2 py-1 rounded border transition text-xs ${buttonClass}"
                            >${buttonLabel}</button>
                          </div>
                        </td>
                      </tr>
                    `;
                      })
                      .join("")
                  : `<tr><td colspan="9" class="py-8 text-center text-zinc-500 text-sm">No hay ejercicios aún.</td></tr>`
              }
            </tbody>
          </table>
          <div class="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p class="text-xs text-zinc-500">
              Mostrando ${escapeHtml(String(pagination.rangeStart))}-${escapeHtml(String(pagination.rangeEnd))} de ${escapeHtml(String(pagination.totalItems))}
            </p>
            <div class="flex flex-wrap items-center gap-2">
              <label for="admin-problems-page-size" class="text-xs text-zinc-500">Filas</label>
              <select id="admin-problems-page-size" data-action="page-size" class="px-2 py-1 rounded-md border border-zinc-700 bg-zinc-900 text-zinc-200 text-xs">
                ${PAGE_SIZE_OPTIONS.map((size) => `<option value="${size}" ${size === state.pageSize ? "selected" : ""}>${size}</option>`).join("")}
              </select>
              <button data-action="page-prev" class="px-3 py-1 rounded-md border border-zinc-700 text-zinc-200 text-xs disabled:opacity-40" ${pagination.page <= 1 ? "disabled" : ""}>Anterior</button>
              <span class="text-xs text-zinc-400">Página ${escapeHtml(String(pagination.page))} de ${escapeHtml(String(pagination.totalPages))}</span>
              <button data-action="page-next" class="px-3 py-1 rounded-md border border-zinc-700 text-zinc-200 text-xs disabled:opacity-40" ${pagination.page >= pagination.totalPages ? "disabled" : ""}>Siguiente</button>
            </div>
          </div>
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
                <p class="text-xl font-bold text-zinc-100">${escapeHtml(`${Number(selected.acceptance || 0).toFixed(1)}%`)}</p>
                <p class="text-[10px] text-zinc-500 mt-1">Tasa de aceptación</p>
              </div>
              <div class="rounded-lg border border-zinc-800 p-3 text-center col-span-2">
                <p class="text-xl font-bold text-zinc-100">${escapeHtml(formatDuration(selected.avg_solve_time_ms))}</p>
                <p class="text-[10px] text-zinc-500 mt-1">Tiempo promedio de resolución</p>
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
    statusFilter: "all",
    page: 1,
    pageSize: PAGE_SIZE_OPTIONS[1],
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
      const [problems, overview] = await Promise.all([
        api.admin.problems(),
        api.admin.overview(),
      ]);
      if (!isMounted) return;
      state.problems = sortProblemsByMostRecent(Array.isArray(problems) ? problems : []);
      state.activity = overview.recent_activity || [];
      state.error = null;
      const statusFilter = normalizeStatus(state.statusFilter || "all");
      const visibleProblems =
        statusFilter === "all"
          ? state.problems
          : state.problems.filter((problem) => normalizeStatus(problem.status) === statusFilter);

      if (!keepSelection || !state.selectedId) {
        state.selectedId = visibleProblems[0]?.id || null;
      } else {
        const stillExists = state.problems.some((p) => p.id === state.selectedId);
        const stillVisible = visibleProblems.some((p) => p.id === state.selectedId);
        if (!stillExists || !stillVisible) state.selectedId = visibleProblems[0]?.id || null;
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

  const applyStatusFilter = () => {
    state.page = 1;
    const visibleProblems =
      state.statusFilter === "all"
        ? state.problems
        : state.problems.filter((problem) => normalizeStatus(problem.status) === state.statusFilter);

    if (!visibleProblems.some((problem) => problem.id === state.selectedId)) {
      state.selectedId = visibleProblems[0]?.id || null;
    }

    renderView(container, state);
  };

  const onChange = (event) => {
    const trigger = event.target.closest("[data-action]");
    if (!trigger || !container.contains(trigger)) return;

    const action = trigger.dataset.action;
    if (action !== "filter-status") return;

    const selectedValue = normalizeStatus(trigger.value || "all");
    state.statusFilter = selectedValue || "all";
    applyStatusFilter();
  };

  const onClick = async (event) => {
    const trigger = event.target.closest("[data-action]");
    if (!trigger || !container.contains(trigger)) return;

    const action = trigger.dataset.action;

    if (action === "refresh") {
      await loadData({ keepSelection: true });
      return;
    }

    if (action === "select-problem") {
      if (event.target.closest("[data-actions-cell='true']")) {
        return;
      }
      state.selectedId = String(trigger.dataset.problemId || "").trim();
      renderView(container, state);
      return;
    }

    if (action === "page-prev") {
      state.page = Math.max(1, state.page - 1);
      renderView(container, state);
      return;
    }

    if (action === "page-next") {
      state.page += 1;
      renderView(container, state);
      return;
    }

    if (action === "edit-problem") {
      event.stopPropagation();
      return;
    }

    if (action === "toggle-archive-problem") {
      event.preventDefault();
      event.stopPropagation();
      const problemId = String(trigger.dataset.problemId || "").trim();
      const nextStatus = normalizeStatus(trigger.dataset.nextStatus || "archived");
      const isArchiving = nextStatus === "archived";
      if (!problemId) return;
      if (
        !window.confirm(
          isArchiving
            ? "¿Archivar este ejercicio? Dejará de ser visible para los usuarios."
            : "¿Desarchivar este ejercicio? Volverá a la lista de borradores.",
        )
      )
        return;
      try {
        await api.admin.updateProblem(problemId, { status: nextStatus });
        showToast(isArchiving ? "Ejercicio archivado." : "Ejercicio desarchivado.", "success");
        await loadData({ keepSelection: false });
      } catch (error) {
        showToast(
          error?.message ||
            (isArchiving
              ? "No se pudo archivar el ejercicio."
              : "No se pudo desarchivar el ejercicio."),
          "error",
        );
      }
    }
  };

  const onPageSizeChange = (event) => {
    const trigger = event.target.closest("[data-action='page-size']");
    if (!trigger || !container.contains(trigger)) return;
    const nextSize = Number(trigger.value);
    state.pageSize = PAGE_SIZE_OPTIONS.includes(nextSize) ? nextSize : PAGE_SIZE_OPTIONS[1];
    state.page = 1;
    renderView(container, state);
  };

  container.addEventListener("change", onChange);
  container.addEventListener("change", onPageSizeChange);
  container.addEventListener("click", onClick);

  await loadData({ keepSelection: false });
  pollTimer = window.setInterval(() => loadData({ keepSelection: true }), POLL_INTERVAL);

  return () => {
    isMounted = false;
    window.clearInterval(pollTimer);
    container.removeEventListener("change", onChange);
    container.removeEventListener("change", onPageSizeChange);
    container.removeEventListener("click", onClick);
  };
}
