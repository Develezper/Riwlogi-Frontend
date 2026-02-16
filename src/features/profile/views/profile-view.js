import { api } from "../../../shared/services/api/index.js";
import { spinner } from "../../../shared/utils/ui-helpers.js";

const verdictConfig = {
  accepted: { label: "Accepted", color: "text-green-400 bg-green-500/10" },
  wrong_answer: { label: "Wrong Answer", color: "text-red-400 bg-red-500/10" },
  pending: { label: "Pending", color: "text-yellow-400 bg-yellow-500/10" },
};

function formatDate(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString("es-CO", { month: "short", day: "numeric", year: "numeric" });
}

export async function profileView(container) {
  container.innerHTML = spinner("lg");

  try {
    const [profile, submissions] = await Promise.all([api.profile.me(), api.profile.submissions()]);
    renderProfile(container, profile, submissions);
  } catch (error) {
    container.innerHTML = `
      <div class="flex items-center justify-center h-[60vh] text-zinc-500 px-4">
        <div class="text-center">
          <p class="text-lg mb-2">No se pudo cargar el perfil</p>
          <p class="text-sm">${error.message}</p>
        </div>
      </div>
    `;
  }
}

function renderProfile(container, profile, submissions) {
  const user = profile.user;
  const stats = profile.stats;
  const totalProblems = 150;
  const solvedPercent = Math.min(100, Math.round((stats.solved / totalProblems) * 100));

  container.innerHTML = `
    <div class="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      <div class="mb-8 flex flex-col items-start gap-5 sm:flex-row sm:items-center">
        <div class="w-20 h-20 rounded-full bg-brand/20 border border-brand/30 flex items-center justify-center text-2xl font-bold text-brand">
          ${(user.username || "?")[0].toUpperCase()}
        </div>
        <div class="flex-1">
          <h1 class="text-2xl font-bold text-zinc-100">${user.display_name || user.username}</h1>
          <div class="mt-2 flex flex-wrap gap-4 text-sm text-zinc-400">
            <span>${user.email}</span>
            <span>Joined ${formatDate(user.created_at)}</span>
            <span>Rank #${profile.rank || "-"}</span>
            <span>${profile.streak || 0}d streak</span>
          </div>
        </div>
        <div class="flex items-center gap-2">
          <span class="text-2xl font-bold tabular-nums text-zinc-100">${stats.total_score.toLocaleString()}</span>
          <span class="text-sm text-zinc-500">pts</span>
        </div>
      </div>

      <div class="mb-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div class="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4">
          <p class="text-sm text-zinc-500">Problemas resueltos</p>
          <p class="mt-1 text-3xl font-bold text-zinc-100">${stats.solved}</p>
          <p class="text-xs text-zinc-500">de ${totalProblems}</p>
          <div class="mt-3 h-2 bg-zinc-800 rounded-full overflow-hidden">
            <div class="h-full bg-brand" style="width:${solvedPercent}%"></div>
          </div>
        </div>

        <div class="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4">
          <p class="text-sm text-zinc-500">Por dificultad</p>
          <div class="mt-2 space-y-2 text-sm">
            <div class="flex items-center justify-between"><span class="text-green-400">Easy</span><span class="text-zinc-200">${stats.by_difficulty.easy}</span></div>
            <div class="flex items-center justify-between"><span class="text-yellow-400">Medium</span><span class="text-zinc-200">${stats.by_difficulty.medium}</span></div>
            <div class="flex items-center justify-between"><span class="text-red-400">Hard</span><span class="text-zinc-200">${stats.by_difficulty.hard}</span></div>
          </div>
        </div>

        <div class="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4">
          <p class="text-sm text-zinc-500">Actividad</p>
          <p class="mt-1 text-3xl font-bold text-zinc-100">${submissions.length}</p>
          <p class="text-xs text-zinc-500">submissions registradas</p>
          <p class="mt-3 text-sm text-zinc-400">Racha actual: <span class="text-brand">${profile.streak || 0} días</span></p>
        </div>
      </div>

      <div class="mb-8">
        <h2 class="text-lg font-semibold text-zinc-100 mb-4">Badges</h2>
        <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          ${(profile.badges || [])
            .map(
              (badge) => `
            <div class="rounded-lg border border-zinc-800 bg-zinc-900/50 p-4 text-center hover:border-zinc-700 transition">
              <p class="text-sm font-semibold text-zinc-100">${badge.name}</p>
              <p class="text-[11px] text-zinc-500 mt-1">${badge.description}</p>
            </div>
          `,
            )
            .join("")}
        </div>
      </div>

      <div>
        <h2 class="text-lg font-semibold text-zinc-100 mb-4">Recent Submissions</h2>
        <div class="overflow-hidden rounded-lg border border-zinc-800 bg-zinc-900/50">
          <div class="hidden sm:grid grid-cols-[1fr_130px_95px_90px_100px] items-center gap-4 border-b border-zinc-800 bg-zinc-900 px-4 py-3 text-xs font-medium uppercase tracking-wide text-zinc-500">
            <span>Problem</span>
            <span>Status</span>
            <span class="text-right">Lenguaje</span>
            <span class="text-right">Score</span>
            <span class="text-right">Fecha</span>
          </div>

          ${
            submissions.length
              ? submissions
                  .map((submission, index) => {
                    const config = verdictConfig[submission.verdict] || verdictConfig.pending;
                    return `
                    <div class="flex flex-col gap-2 sm:grid sm:grid-cols-[1fr_130px_95px_90px_100px] sm:items-center sm:gap-4 px-4 py-3 border-b border-zinc-800 ${
                      index === submissions.length - 1 ? "border-b-0" : ""
                    }">
                      <a href="#/problem/${submission.problem_id}" class="text-sm font-medium text-zinc-100 hover:text-brand transition">
                        ${submission.problem_title || submission.problem_id}
                      </a>
                      <div>
                        <span class="inline-flex px-2 py-1 rounded-full text-xs ${config.color}">${config.label}</span>
                      </div>
                      <span class="sm:text-right text-xs text-zinc-400 uppercase">${submission.language}</span>
                      <span class="sm:text-right text-sm font-semibold text-zinc-200">${submission.final_score}</span>
                      <span class="sm:text-right text-xs text-zinc-500">${formatDate(submission.submitted_at)}</span>
                    </div>
                  `;
                  })
                  .join("")
              : `<p class="text-center text-zinc-500 py-8">Aún no tienes submissions</p>`
          }
        </div>
      </div>
    </div>
  `;
}
