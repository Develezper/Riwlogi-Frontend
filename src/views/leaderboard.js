// Leaderboard View

import { spinner } from "../utils/helpers.js";

export async function leaderboardView(container) {
  container.innerHTML = `
    <div class="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <div class="text-center mb-8">
        <h1 class="text-2xl font-bold mb-2">🏆 Top Thinkers</h1>
        <p class="text-zinc-400 text-sm">Ranking basado en proceso de pensamiento, no solo respuestas correctas</p>
      </div>

      <div id="leaderboard-table">
        ${spinner()}
      </div>
    </div>
  `;

  try {
    const entries = await api.leaderboard.get();
    renderTable(container, entries);
  } catch (err) {
    container.querySelector("#leaderboard-table").innerHTML = `
      <div class="text-center py-12 text-zinc-500">
        <p>${err.message}</p>
      </div>
    `;
  }
}

function renderTable(container, entries) {
  const table = container.querySelector("#leaderboard-table");

  if (!entries.length) {
    table.innerHTML = `
      <div class="text-center py-12 text-zinc-500">
        <p class="text-lg mb-2">Aún no hay rankings</p>
        <p class="text-sm">Sé el primero en resolver un problema</p>
      </div>
    `;
    return;
  }

  const rows = entries
    .map(
      (entry) => `
    <div class="flex items-center gap-4 p-4 rounded-lg ${
      entry.rank <= 3 ? "bg-zinc-800/80 border border-zinc-700" : "hover:bg-zinc-800/50"
    } transition">
      <!-- Rank -->
      <div class="w-10 text-center font-bold ${
        entry.rank === 1
          ? "text-yellow-400 text-xl"
          : entry.rank === 2
          ? "text-zinc-300 text-lg"
          : entry.rank === 3
          ? "text-amber-600 text-lg"
          : "text-zinc-500"
      }">
        ${entry.rank <= 3 ? ["🥇", "🥈", "🥉"][entry.rank - 1] : entry.rank}
      </div>

      <!-- Avatar + Username -->
      <div class="flex items-center gap-3 flex-1">
        <div class="w-9 h-9 rounded-full bg-brand/20 flex items-center justify-center text-brand font-bold text-sm">
          ${(entry.username || "?")[0].toUpperCase()}
        </div>
        <div>
          <p class="font-semibold text-sm text-zinc-100">${entry.username}</p>
          <p class="text-xs text-zinc-500">${entry.solved} problemas resueltos</p>
        </div>
      </div>

      <!-- Score -->
      <div class="text-right">
        <p class="font-bold text-brand">${entry.total_score}</p>
        <p class="text-[10px] text-zinc-500">Score total</p>
      </div>
    </div>
  `
    )
    .join("");

  table.innerHTML = `<div class="space-y-2">${rows}</div>`;
}
