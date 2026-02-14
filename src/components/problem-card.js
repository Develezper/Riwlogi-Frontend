// Problem Card Component
import { difficultyBadge } from "../utils/helpers.js";

export function problemCard(problem) {
  const badge = difficultyBadge(problem.difficulty);

  const tags = (problem.tags || [])
    .map(
      (t) =>
        `<span class="px-2 py-0.5 rounded text-xs bg-zinc-800 text-zinc-400">${t}</span>`
    )
    .join("");

  return /* html */`
    <a href="#/problem/${problem.slug}"
       class="block p-4 rounded-xl border border-zinc-800 bg-zinc-900/50 hover:border-zinc-700 hover:bg-zinc-900 transition group">
      <div class="flex items-start justify-between mb-2">
        <h3 class="font-semibold text-zinc-100 group-hover:text-brand transition">
          ${problem.title}
        </h3>
        <span class="px-2 py-0.5 rounded-full text-xs font-medium ${badge.class}">
          ${badge.label}
        </span>
      </div>
      <div class="flex items-center gap-2 flex-wrap">
        ${tags}
        <span class="ml-auto text-xs text-zinc-500">
          ${problem.stages_count} etapas
        </span>
      </div>
    </a>
  `;
}
