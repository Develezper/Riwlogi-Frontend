import { problemCard } from "../components/problem-card.js";
import { api } from "../../../shared/services/api/index.js";
import { spinner, withViewTransition } from "../../../shared/utils/ui-helpers.js";

const PAGE_SIZE_OPTIONS = [6, 12, 24];

function normalizeProblemStatus(status) {
  return String(status || "")
    .trim()
    .toLowerCase();
}

function isUserVisibleProblem(problem) {
  const status = normalizeProblemStatus(problem?.status);
  return status === "published" || status === "publicado";
}

export async function problemsHomeView(container) {
  const state = {
    problems: [],
    tags: [],
    search: "",
    difficulty: "all",
    tag: "all",
    page: 1,
    pageSize: PAGE_SIZE_OPTIONS[1],
  };

  const paginate = (items) => {
    const safeSize = PAGE_SIZE_OPTIONS.includes(state.pageSize) ? state.pageSize : PAGE_SIZE_OPTIONS[1];
    const totalItems = items.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / safeSize));
    state.page = Math.min(Math.max(1, state.page), totalPages);
    const start = (state.page - 1) * safeSize;
    const end = start + safeSize;

    return {
      items: items.slice(start, end),
      totalItems,
      totalPages,
      rangeStart: totalItems ? start + 1 : 0,
      rangeEnd: totalItems ? Math.min(end, totalItems) : 0,
    };
  };

  container.innerHTML = `
    <div class="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      <div class="text-center mb-8">
        <h1 class="text-3xl sm:text-4xl font-bold mb-3">
          Desafíos <span class="text-brand">Riw</span>log
        </h1>
        <p class="text-zinc-400 text-lg max-w-2xl mx-auto">
          Resuelve problemas en una etapa única y demuestra tu proceso, no solo el resultado final.
        </p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-[1fr_auto_auto] gap-3 mb-5">
        <label for="search-input" class="sr-only">Buscar problemas</label>
        <input id="search-input" type="search"
               placeholder="Buscar problema..."
               aria-label="Buscar problemas por título"
               class="w-full px-3 py-2.5 bg-zinc-900 border border-zinc-700 rounded-lg text-white text-sm focus:outline-none focus:border-brand transition" />

        <label for="difficulty-select" class="sr-only">Filtrar por dificultad</label>
        <select id="difficulty-select" aria-label="Filtrar por dificultad" class="px-3 py-2.5 bg-zinc-900 border border-zinc-700 rounded-lg text-zinc-200 text-sm focus:outline-none focus:border-brand transition">
          <option value="all">Todas las dificultades</option>
          <option value="1">Fácil</option>
          <option value="2">Intermedio</option>
          <option value="3">Difícil</option>
        </select>

        <label for="tag-select" class="sr-only">Filtrar por etiqueta</label>
        <select id="tag-select" aria-label="Filtrar por etiqueta" class="px-3 py-2.5 bg-zinc-900 border border-zinc-700 rounded-lg text-zinc-200 text-sm focus:outline-none focus:border-brand transition">
          <option value="all">Todas las etiquetas</option>
        </select>
      </div>

      <div class="flex items-center justify-between mb-4">
        <p id="results-label" class="text-sm text-zinc-500" aria-live="polite"></p>
        <a href="#/leaderboard" class="text-sm text-brand hover:text-brand-dark transition">Ver clasificación global</a>
      </div>

      <div id="problem-list" class="grid gap-3">
        ${spinner()}
      </div>
      <div id="problem-pagination" class="mt-4"></div>
    </div>
  `;

  const listEl = container.querySelector("#problem-list");
  const labelEl = container.querySelector("#results-label");
  const searchInput = container.querySelector("#search-input");
  const difficultySelect = container.querySelector("#difficulty-select");
  const tagSelect = container.querySelector("#tag-select");
  const paginationEl = container.querySelector("#problem-pagination");

  try {
    const [problems, tags] = await Promise.all([
      api.problems.list({ status: "published" }),
      api.problems.tags(),
    ]);
    state.problems = problems.filter(isUserVisibleProblem);
    state.tags = tags;

    tagSelect.innerHTML = [
      '<option value="all">Todas las etiquetas</option>',
      ...tags.map((tag) => `<option value="${tag}">${tag}</option>`),
    ].join("");

    renderList();
  } catch (error) {
    listEl.innerHTML = `
      <div class="text-center py-12 text-zinc-500">
        <p class="text-lg mb-2">Error al cargar problemas</p>
        <p class="text-sm">${error.message}</p>
      </div>
    `;
    labelEl.textContent = "";
    return;
  }

  const onSearch = (event) => {
    state.search = event.target.value;
    state.page = 1;
    withViewTransition(() => renderList());
  };

  const onDifficulty = (event) => {
    state.difficulty = event.target.value;
    state.page = 1;
    withViewTransition(() => renderList());
  };

  const onTag = (event) => {
    state.tag = event.target.value;
    state.page = 1;
    withViewTransition(() => renderList());
  };

  const onPaginationClick = (event) => {
    const trigger = event.target.closest("[data-action]");
    if (!trigger || !paginationEl.contains(trigger)) return;

    const action = trigger.dataset.action;
    if (action === "page-prev") {
      state.page = Math.max(1, state.page - 1);
      withViewTransition(() => renderList());
      return;
    }

    if (action === "page-next") {
      state.page += 1;
      withViewTransition(() => renderList());
    }
  };

  const onPaginationChange = (event) => {
    const trigger = event.target.closest("[data-action='page-size']");
    if (!trigger || !paginationEl.contains(trigger)) return;
    const nextSize = Number(trigger.value);
    state.pageSize = PAGE_SIZE_OPTIONS.includes(nextSize) ? nextSize : PAGE_SIZE_OPTIONS[1];
    state.page = 1;
    withViewTransition(() => renderList());
  };

  searchInput.addEventListener("input", onSearch);
  difficultySelect.addEventListener("change", onDifficulty);
  tagSelect.addEventListener("change", onTag);
  paginationEl.addEventListener("click", onPaginationClick);
  paginationEl.addEventListener("change", onPaginationChange);

  function renderList() {
    const filtered = state.problems.filter((problem) => {
      const matchesDifficulty =
        state.difficulty === "all" || String(problem.difficulty) === String(state.difficulty);
      const matchesTag =
        state.tag === "all" || problem.tags.some((tag) => tag.toLowerCase() === state.tag.toLowerCase());
      const matchesSearch =
        !state.search || problem.title.toLowerCase().includes(state.search.trim().toLowerCase());

      return matchesDifficulty && matchesTag && matchesSearch;
    });

    labelEl.textContent = `Mostrando ${filtered.length} de ${state.problems.length} problemas`;

    if (!filtered.length) {
      listEl.innerHTML = `
        <div class="text-center py-12 text-zinc-500 border border-zinc-800 rounded-xl bg-zinc-900/40">
          <p class="text-lg mb-2">Sin resultados con los filtros actuales</p>
          <p class="text-sm">Prueba con otra dificultad, etiqueta o término de búsqueda.</p>
        </div>
      `;
      paginationEl.innerHTML = "";
      return;
    }

    const page = paginate(filtered);

    labelEl.textContent = `Mostrando ${page.rangeStart}-${page.rangeEnd} de ${page.totalItems} problemas (${state.problems.length} total)`;
    listEl.innerHTML = page.items.map((problem) => problemCard(problem)).join("");
    paginationEl.innerHTML = `
      <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p class="text-xs text-zinc-500">Página ${state.page} de ${page.totalPages}</p>
        <div class="flex flex-wrap items-center gap-2">
          <label for="problem-page-size" class="text-xs text-zinc-500">Por página</label>
          <select id="problem-page-size" data-action="page-size" class="px-2 py-1 rounded-md border border-zinc-700 bg-zinc-900 text-zinc-200 text-xs">
            ${PAGE_SIZE_OPTIONS.map((size) => `<option value="${size}" ${size === state.pageSize ? "selected" : ""}>${size}</option>`).join("")}
          </select>
          <button data-action="page-prev" class="px-3 py-1 rounded-md border border-zinc-700 text-zinc-200 text-xs disabled:opacity-40" ${state.page <= 1 ? "disabled" : ""}>Anterior</button>
          <button data-action="page-next" class="px-3 py-1 rounded-md border border-zinc-700 text-zinc-200 text-xs disabled:opacity-40" ${state.page >= page.totalPages ? "disabled" : ""}>Siguiente</button>
        </div>
      </div>
    `;
  }

  return () => {
    searchInput.removeEventListener("input", onSearch);
    difficultySelect.removeEventListener("change", onDifficulty);
    tagSelect.removeEventListener("change", onTag);
    paginationEl.removeEventListener("click", onPaginationClick);
    paginationEl.removeEventListener("change", onPaginationChange);
  };
}
