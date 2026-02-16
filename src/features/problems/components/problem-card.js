import { difficultyBadge } from "../../../shared/utils/ui-helpers.js";

export function problemCard(problem) {
  const badge = difficultyBadge(problem.difficulty);

  const tags = (problem.tags || [])
    .slice(0, 3)
    .map((tag) => `<span class="px-2 py-0.5 rounded text-xs bg-zinc-800 text-zinc-400">${tag}</span>`)
    .join("");

  return `
    <a href="#/problem/${problem.slug}"
       class="block p-4 rounded-xl border border-zinc-800 bg-zinc-900/60 hover:border-zinc-700 hover:bg-zinc-900 transition group">
      <div class="flex items-start justify-between gap-3 mb-2">
        <div>
          <h3 class="font-semibold text-zinc-100 group-hover:text-brand transition">
            ${problem.title}
          </h3>
          <p class="text-xs text-zinc-500 mt-1">
            ${problem.submissions?.toLocaleString?.() || problem.submissions || 0} submissions
          </p>
        </div>
        <span class="px-2 py-0.5 rounded-full text-xs font-medium ${badge.class}">
          ${badge.label}
        </span>
      </div>

      <div class="flex items-center gap-2 flex-wrap mb-2">
        ${tags}
      </div>

      <div class="flex items-center justify-between text-xs text-zinc-500">
        <span>${Number(problem.acceptance || 0).toFixed(1)}% acceptance</span>
        <span>${problem.stages_count} etapas</span>
      </div>
    </a>
  `;
}
