//  Home View (lista de problemas)

import { problemCard } from "../components/problem-card.js";
import { spinner, showToast } from "../utils/helpers.js";

export async function homeView(container) {
  container.innerHTML = `
    <div class="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      <!-- Hero -->
      <div class="text-center mb-10">
        <h1 class="text-3xl sm:text-4xl font-bold mb-3">
          <span class="text-brand">Riw</span>low
        </h1>
        <p class="text-zinc-400 text-lg max-w-xl mx-auto">
          No gana el que responde bien. Gana el que <strong class="text-white">demuestra cómo piensa</strong>.
        </p>
      </div>

      <!-- Filtros -->
      <div class="flex flex-wrap gap-2 mb-6">
        <button data-filter="all" class="filter-btn active px-3 py-1.5 rounded-lg text-sm bg-zinc-800 text-zinc-300 hover:bg-zinc-700 transition">
          Todos
        </button>
        <button data-filter="1" class="filter-btn px-3 py-1.5 rounded-lg text-sm bg-zinc-800 text-zinc-300 hover:bg-zinc-700 transition">
          🟢 Easy
        </button>
        <button data-filter="2" class="filter-btn px-3 py-1.5 rounded-lg text-sm bg-zinc-800 text-zinc-300 hover:bg-zinc-700 transition">
          🟡 Medium
        </button>
        <button data-filter="3" class="filter-btn px-3 py-1.5 rounded-lg text-sm bg-zinc-800 text-zinc-300 hover:bg-zinc-700 transition">
          🔴 Hard
        </button>
      </div>

      <!-- Lista -->
      <div id="problem-list" class="grid gap-3">
        ${spinner()}
      </div>
    </div>
  `;

  // Cargar problemas
  await loadProblems(container);

  // Filtros
  container.querySelectorAll(".filter-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      container.querySelectorAll(".filter-btn").forEach((b) => b.classList.remove("bg-brand", "text-white"));
      btn.classList.add("bg-brand", "text-white");
      const filter = btn.dataset.filter;
      loadProblems(container, filter === "all" ? null : parseInt(filter));
    });
  });
}

async function loadProblems(container, difficulty = null) {
  const list = container.querySelector("#problem-list");

  try {
    const params = {};
    if (difficulty) params.difficulty = difficulty;
    const problems = await api.problems.list(params);

    if (!problems.length) {
      list.innerHTML = `
        <div class="text-center py-12 text-zinc-500">
          <p class="text-lg mb-2">No hay problemas disponibles</p>
          <p class="text-sm">Vuelve pronto, estamos agregando más retos</p>
        </div>
      `;
      return;
    }

    list.innerHTML = problems.map((p) => problemCard(p)).join("");
  } catch (err) {
    list.innerHTML = `
      <div class="text-center py-12 text-zinc-500">
        <p class="text-lg mb-2">Error al cargar problemas</p>
        <p class="text-sm">${err.message}</p>
      </div>
    `;
  }
}
