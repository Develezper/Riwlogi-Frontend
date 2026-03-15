import { api } from "../../../shared/services/api/index.js";
import { spinner, withViewTransition } from "../../../shared/utils/ui-helpers.js";

const FILTERS = [
  { id: "today", label: "Hoy" },
  { id: "week", label: "Semana" },
  { id: "all", label: "Todo el tiempo" },
];

const PAGE_SIZE_OPTIONS = [10, 20, 40];

function filterButtonClass(active) {
  return active
    ? "px-3 py-1.5 rounded-md text-xs bg-brand text-white"
    : "px-3 py-1.5 rounded-md text-xs text-zinc-400 bg-zinc-800 hover:text-white";
}

export async function leaderboardView(container) {
  const state = {
    timeframe: "all",
    entries: [],
    page: 1,
    pageSize: PAGE_SIZE_OPTIONS[0],
  };

  container.innerHTML = `
    <div class="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      <div class="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 class="text-3xl font-bold tracking-tight text-white">Top participantes</h1>
          <p class="mt-1 text-zinc-400">Clasificación por puntaje acumulado y constancia.</p>
        </div>
        <div id="filter-buttons" class="flex items-center gap-2" role="tablist" aria-label="Filtro de tiempo"></div>
      </div>

      <div id="leaderboard-content">${spinner("lg")}</div>
    </div>
  `;

  const filtersEl = container.querySelector("#filter-buttons");
  const contentEl = container.querySelector("#leaderboard-content");

  let isDisposed = false;

  const renderFilters = () => {
    filtersEl.innerHTML = FILTERS.map((filter) => {
      const active = filter.id === state.timeframe;
      return `<button data-filter="${filter.id}" role="tab" aria-selected="${active ? "true" : "false"}" aria-pressed="${active ? "true" : "false"}" class="${filterButtonClass(active)}">${filter.label}</button>`;
    }).join("");
  };

  const renderContent = () => {
    if (!state.entries.length) {
      contentEl.innerHTML = `
        <div class="text-center py-12 text-zinc-500 border border-zinc-800 rounded-xl bg-zinc-900/50">
          <p class="text-lg mb-2">Sin actividad en este rango</p>
          <p class="text-sm">Vuelve a intentar con otro filtro.</p>
        </div>
      `;
      return;
    }

    const top3 = state.entries.slice(0, 3);
    const rest = state.entries.slice(3);
    const totalPages = Math.max(1, Math.ceil(rest.length / state.pageSize));
    state.page = Math.min(Math.max(1, state.page), totalPages);
    const start = (state.page - 1) * state.pageSize;
    const pagedRest = rest.slice(start, start + state.pageSize);

    const podiumHtml = `
      <div class="mb-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
        ${top3
          .map((entry, index) => {
            const order = index === 0 ? "sm:order-2" : index === 1 ? "sm:order-1" : "sm:order-3";
            const color =
              index === 0
                ? "from-yellow-500/20 to-yellow-500/5 border-yellow-500/30"
                : index === 1
                ? "from-zinc-400/20 to-zinc-400/5 border-zinc-400/30"
                : "from-amber-700/20 to-amber-700/5 border-amber-700/30";

            return `
              <div class="${order} relative overflow-hidden rounded-xl border bg-gradient-to-b ${color} p-6" style="view-transition-name: lb-${entry.username}">
                <div class="flex flex-col items-center text-center">
                  <div class="w-16 h-16 rounded-full bg-zinc-900/70 border border-zinc-700 flex items-center justify-center text-xl font-bold text-white mb-3">
                    ${entry.avatar || entry.username[0].toUpperCase()}
                  </div>
                  <h3 class="text-sm font-semibold text-zinc-100">${entry.username}</h3>
                  <p class="text-2xl font-bold tabular-nums mt-2 text-white">${entry.score.toLocaleString()}</p>
                  <div class="mt-2 flex items-center gap-3 text-xs text-zinc-300">
                    <span>${entry.solved} resueltos</span>
                    <span>${entry.streak} días de racha</span>
                  </div>
                </div>
              </div>
            `;
          })
          .join("")}
      </div>
    `;

    const restHtml = `
      <div class="overflow-hidden rounded-lg border border-zinc-800 bg-zinc-900/50">
        <div class="hidden sm:grid grid-cols-[56px_1fr_120px_90px_90px] items-center gap-4 border-b border-zinc-800 bg-zinc-900 px-4 py-3 text-xs font-medium uppercase tracking-wide text-zinc-500">
          <span class="text-center">Posición</span>
          <span>Usuario</span>
          <span class="text-right">Puntaje</span>
          <span class="text-right">Resueltos</span>
          <span class="text-right">Racha</span>
        </div>
        ${pagedRest
          .map(
            (entry, index) => `
          <div class="flex items-center gap-3 border-b border-zinc-800 px-4 py-3 sm:grid sm:grid-cols-[56px_1fr_120px_90px_90px] sm:gap-4 ${
            index === pagedRest.length - 1 ? "border-b-0" : ""
          }" style="view-transition-name: lb-${entry.username}">
            <span class="w-8 h-8 rounded-full bg-zinc-800 text-zinc-300 text-xs font-semibold flex items-center justify-center sm:mx-auto">${
              entry.rank
            }</span>
            <div class="flex items-center gap-2">
              <div class="w-8 h-8 rounded-full bg-brand/20 text-brand text-xs font-bold flex items-center justify-center">${
                entry.avatar || entry.username[0].toUpperCase()
              }</div>
              <span class="text-sm text-zinc-100">${entry.username}</span>
            </div>
            <span class="ml-auto sm:ml-0 text-right text-sm font-semibold tabular-nums text-zinc-100">${entry.score.toLocaleString()}</span>
            <span class="hidden sm:block text-right text-sm text-zinc-400">${entry.solved}</span>
            <span class="hidden sm:block text-right text-sm text-zinc-400">${entry.streak} días</span>
          </div>
        `,
          )
          .join("")}
      </div>
      <div class="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p class="text-sm text-zinc-500">Mostrando ${rest.length ? start + 1 : 0}-${rest.length ? Math.min(start + state.pageSize, rest.length) : 0} de ${rest.length} (sin contar podio)</p>
        <div class="flex flex-wrap items-center gap-2">
          <label for="leaderboard-page-size" class="text-xs text-zinc-500">Por página</label>
          <select id="leaderboard-page-size" data-action="page-size" class="px-2 py-1 rounded-md border border-zinc-700 bg-zinc-900 text-zinc-200 text-xs">
            ${PAGE_SIZE_OPTIONS.map((size) => `<option value="${size}" ${size === state.pageSize ? "selected" : ""}>${size}</option>`).join("")}
          </select>
          <button data-action="page-prev" class="px-3 py-1 rounded-md border border-zinc-700 text-zinc-200 text-xs disabled:opacity-40" ${state.page <= 1 ? "disabled" : ""}>Anterior</button>
          <span class="text-xs text-zinc-400">Página ${state.page} de ${totalPages}</span>
          <button data-action="page-next" class="px-3 py-1 rounded-md border border-zinc-700 text-zinc-200 text-xs disabled:opacity-40" ${state.page >= totalPages ? "disabled" : ""}>Siguiente</button>
        </div>
      </div>
    `;

    contentEl.innerHTML = `${podiumHtml}${restHtml}`;
  };

  const loadEntries = async () => {
    contentEl.innerHTML = spinner("lg");
    try {
      const entries = await api.leaderboard.get({ timeframe: state.timeframe });
      if (isDisposed) return;
      state.entries = entries;
      state.page = 1;
      withViewTransition(() => renderContent());
    } catch (error) {
      if (isDisposed) return;
      contentEl.innerHTML = `
        <div class="text-center py-12 text-zinc-500 border border-zinc-800 rounded-xl bg-zinc-900/50">
          <p class="text-lg mb-2">Error al cargar la clasificación</p>
          <p class="text-sm">${error.message}</p>
        </div>
      `;
    }
  };

  const onFilterClick = (event) => {
    const button = event.target.closest("[data-filter]");
    if (!button) return;

    state.timeframe = button.dataset.filter;
    state.page = 1;
    renderFilters();
    void loadEntries();
  };

  const onContentClick = (event) => {
    const trigger = event.target.closest("[data-action]");
    if (!trigger || !contentEl.contains(trigger)) return;

    if (trigger.dataset.action === "page-prev") {
      state.page = Math.max(1, state.page - 1);
      withViewTransition(() => renderContent());
      return;
    }

    if (trigger.dataset.action === "page-next") {
      state.page += 1;
      withViewTransition(() => renderContent());
    }
  };

  const onContentChange = (event) => {
    const trigger = event.target.closest("[data-action='page-size']");
    if (!trigger || !contentEl.contains(trigger)) return;
    const nextSize = Number(trigger.value);
    state.pageSize = PAGE_SIZE_OPTIONS.includes(nextSize) ? nextSize : PAGE_SIZE_OPTIONS[0];
    state.page = 1;
    withViewTransition(() => renderContent());
  };

  filtersEl.addEventListener("click", onFilterClick);
  contentEl.addEventListener("click", onContentClick);
  contentEl.addEventListener("change", onContentChange);

  renderFilters();
  await loadEntries();

  return () => {
    isDisposed = true;
    filtersEl.removeEventListener("click", onFilterClick);
    contentEl.removeEventListener("click", onContentClick);
    contentEl.removeEventListener("change", onContentChange);
  };
}
