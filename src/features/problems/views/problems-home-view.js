import { problemCard } from "../components/problem-card.js";
import { api } from "../../../shared/services/api/index.js";
import { spinner } from "../../../shared/utils/ui-helpers.js";

export async function problemsHomeView(container) {
  const state = {
    problems: [],
    tags: [],
    search: "",
    difficulty: "all",
    tag: "all",
  };

  container.innerHTML = `
    <div class="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      <div class="text-center mb-8">
        <h1 class="text-3xl sm:text-4xl font-bold mb-3">
          <span class="text-brand">Riw</span>log Challenges
        </h1>
        <p class="text-zinc-400 text-lg max-w-2xl mx-auto">
          Resuelve problemas por etapas y demuestra tu proceso, no solo el resultado final.
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
          <option value="1">Easy</option>
          <option value="2">Medium</option>
          <option value="3">Hard</option>
        </select>

        <label for="tag-select" class="sr-only">Filtrar por tag</label>
        <select id="tag-select" aria-label="Filtrar por tag" class="px-3 py-2.5 bg-zinc-900 border border-zinc-700 rounded-lg text-zinc-200 text-sm focus:outline-none focus:border-brand transition">
          <option value="all">Todos los tags</option>
        </select>
      </div>

      <div class="flex items-center justify-between mb-4">
        <p id="results-label" class="text-sm text-zinc-500" aria-live="polite"></p>
        <a href="#/leaderboard" class="text-sm text-brand hover:text-brand-dark transition">Ver ranking global</a>
      </div>

      <div id="problem-list" class="grid gap-3">
        ${spinner()}
      </div>
    </div>
  `;

  const listEl = container.querySelector("#problem-list");
  const labelEl = container.querySelector("#results-label");
  const searchInput = container.querySelector("#search-input");
  const difficultySelect = container.querySelector("#difficulty-select");
  const tagSelect = container.querySelector("#tag-select");

  try {
    const [problems, tags] = await Promise.all([api.problems.list(), api.problems.tags()]);
    state.problems = problems;
    state.tags = tags;

    tagSelect.innerHTML = [
      '<option value="all">Todos los tags</option>',
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
    renderList();
  };

  const onDifficulty = (event) => {
    state.difficulty = event.target.value;
    renderList();
  };

  const onTag = (event) => {
    state.tag = event.target.value;
    renderList();
  };

  searchInput.addEventListener("input", onSearch);
  difficultySelect.addEventListener("change", onDifficulty);
  tagSelect.addEventListener("change", onTag);

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
          <p class="text-sm">Prueba con otra dificultad, tag o término de búsqueda.</p>
        </div>
      `;
      return;
    }

    listEl.innerHTML = filtered.map((problem) => problemCard(problem)).join("");
  }

  return () => {
    searchInput.removeEventListener("input", onSearch);
    difficultySelect.removeEventListener("change", onDifficulty);
    tagSelect.removeEventListener("change", onTag);
  };
}
