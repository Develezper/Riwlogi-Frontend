// Profile View.

import { store } from "../store/state.js";
import { spinner, difficultyBadge } from "../utils/helpers.js";

export async function profileView(container) {
  container.innerHTML = spinner("lg");

  try {
    const [profile, submissions] = await Promise.all([
      api.profile.me(),
      api.profile.submissions(),
    ]);

    renderProfile(container, profile, submissions);
  } catch (err) {
    container.innerHTML = `
      <div class="flex items-center justify-center h-[60vh] text-zinc-500">
        <p>${err.message}</p>
      </div>
    `;
  }
}

function renderProfile(container, profile, submissions) {
  const user = profile.user;
  const stats = profile.stats;

  container.innerHTML = /* html */`
    <div class="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <!-- User Header -->
      <div class="flex items-center gap-6 mb-8 p-6 bg-zinc-900 rounded-xl border border-zinc-800">
        <div class="w-16 h-16 rounded-full bg-brand/20 flex items-center justify-center text-brand font-bold text-2xl">
          ${(user.username || "?")[0].toUpperCase()}
        </div>
        <div class="flex-1">
          <h1 class="text-xl font-bold text-white">${user.display_name || user.username}</h1>
          <p class="text-sm text-zinc-400">${user.email}</p>
        </div>
        <div class="text-right">
          <p class="text-2xl font-bold text-brand">${stats.total_score}</p>
          <p class="text-xs text-zinc-500">Score total</p>
        </div>
      </div>

      <!-- Stats Grid -->
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <div class="p-4 bg-zinc-900 rounded-lg border border-zinc-800 text-center">
          <p class="text-2xl font-bold text-white">${stats.solved}</p>
          <p class="text-xs text-zinc-500">Problemas resueltos</p>
        </div>
        <div class="p-4 bg-zinc-900 rounded-lg border border-zinc-800 text-center">
          <p class="text-2xl font-bold text-green-400">${stats.by_difficulty.easy}</p>
          <p class="text-xs text-zinc-500">Easy</p>
        </div>
        <div class="p-4 bg-zinc-900 rounded-lg border border-zinc-800 text-center">
          <p class="text-2xl font-bold text-yellow-400">${stats.by_difficulty.medium}</p>
          <p class="text-xs text-zinc-500">Medium</p>
        </div>
        <div class="p-4 bg-zinc-900 rounded-lg border border-zinc-800 text-center">
          <p class="text-2xl font-bold text-red-400">${stats.by_difficulty.hard}</p>
          <p class="text-xs text-zinc-500">Hard</p>
        </div>
      </div>

      <!-- Submissions History -->
      <div>
        <h2 class="text-lg font-semibold mb-4 text-zinc-200">Historial de Submissions</h2>
        <div class="space-y-2">
          ${
            submissions.length
              ? submissions
                  .map(
                    (s) => /* html */`
              <div class="flex items-center justify-between p-4 bg-zinc-900 rounded-lg border border-zinc-800 hover:border-zinc-700 transition">
                <div class="flex items-center gap-3">
                  <span class="w-2 h-2 rounded-full ${
                    s.verdict === "accepted" ? "bg-green-400" : "bg-red-400"
                  }"></span>
                  <div>
                    <p class="text-sm font-medium text-zinc-200">Problem #${s.problem_id}</p>
                    <p class="text-xs text-zinc-500">${s.language} · ${s.submitted_at || "en progreso"}</p>
                  </div>
                </div>
                <div class="text-right">
                  <p class="text-sm font-bold ${
                    s.verdict === "accepted" ? "text-green-400" : "text-red-400"
                  }">${s.verdict}</p>
                  <p class="text-xs text-zinc-500">Score: ${s.final_score}</p>
                </div>
              </div>
            `
                  )
                  .join("")
              : `<p class="text-center text-zinc-500 py-8">Aún no tienes submissions</p>`
          }
        </div>
      </div>
    </div>
  `;
}
