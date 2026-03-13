import { escapeHtml } from "../../../shared/utils/ui-helpers.js";

export const statusConfig = {
  published: {
    label: "Publicado",
    className: "text-green-300 bg-green-500/10 border-green-500/30",
  },
  draft: {
    label: "Borrador",
    className: "text-amber-300 bg-amber-500/10 border-amber-500/30",
  },
  archived: {
    label: "Archivado",
    className: "text-zinc-400 bg-zinc-600/10 border-zinc-600/30",
  },
};

export const sourceConfig = {
  base: {
    label: "Base",
    className: "text-zinc-300 bg-zinc-700/30 border-zinc-600/40",
  },
  custom: {
    label: "Personalizado",
    className: "text-sky-300 bg-sky-500/10 border-sky-500/30",
  },
  ai: {
    label: "IA",
    className: "text-purple-300 bg-purple-500/10 border-purple-500/30",
  },
};

export function difficultyLabel(level) {
  const map = { 1: "Fácil", 2: "Intermedio", 3: "Difícil" };
  return map[Number(level)] || "Fácil";
}

export function formatDateTime(value) {
  if (value === null || value === undefined || value === "") return "-";
  const date = new Date(value);
  const timestamp = date.getTime();
  if (Number.isNaN(timestamp) || timestamp <= 0) return "-";
  return date.toLocaleString("es-CO", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatLastActive(value) {
  const formatted = formatDateTime(value);
  return formatted === "-" ? "Sin actividad" : formatted;
}

export function activityTypeLabel(value) {
  const raw = String(value || "").trim();
  if (!raw) return "Actividad";
  const map = {
    submission: "Envío",
    submission_accepted: "Envío aceptado",
    system: "Sistema",
    user: "Usuario",
  };
  if (map[raw]) return map[raw];
  return raw.replace(/_/g, " ").replace(/\b\w/g, (m) => m.toUpperCase());
}

export function parseCsv(value) {
  return [
    ...new Set(
      String(value || "")
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
    ),
  ];
}

export function formatList(values = []) {
  if (!Array.isArray(values)) return "";
  return values.join(", ");
}

export function roleLabel(role, isAdmin) {
  const normalized = String(role || (isAdmin ? "admin" : "user"))
    .trim()
    .toLowerCase();
  if (normalized === "admin") return "Administrador";
  if (normalized === "user") return "Usuario";
  return normalized ? normalized.charAt(0).toUpperCase() + normalized.slice(1) : "Usuario";
}

export function stageEditorJson(problem) {
  const stages = Array.isArray(problem?.stages) ? problem.stages : [];
  const firstStage = stages[0] || {};
  const payload = [
    {
      stage_index: 1,
      prompt_md: String(firstStage.prompt_md || ""),
      hidden_count: Number(firstStage.hidden_count || 0),
      visible_tests: Array.isArray(firstStage.visible_tests)
        ? firstStage.visible_tests.map((test) => ({
            input_text: String(test.input_text || ""),
            expected_text: String(test.expected_text || ""),
          }))
        : [],
    },
  ];
  return JSON.stringify(payload, null, 2);
}

export function statusBadge(status) {
  const config = statusConfig[status] || statusConfig.draft;
  return `<span class="inline-flex px-2 py-1 rounded-full text-xs border ${config.className}">${config.label}</span>`;
}

export function sourceBadge(source) {
  const config = sourceConfig[source] || sourceConfig.custom;
  return `<span class="inline-flex px-2 py-1 rounded-full text-xs border ${config.className}">${config.label}</span>`;
}

export function kpiCard(title, value, subtitle) {
  return `
    <div class="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4">
      <p class="text-xs uppercase tracking-wide text-zinc-500">${escapeHtml(title)}</p>
      <p class="mt-2 text-2xl font-bold text-zinc-100">${escapeHtml(String(value))}</p>
      <p class="mt-1 text-xs text-zinc-500">${escapeHtml(subtitle)}</p>
    </div>
  `;
}

export function formButton(form) {
  return form.querySelector('button[type="submit"]');
}

export function setLoadingButton(button, loadingText) {
  if (!button) return () => {};
  const previous = button.textContent;
  button.disabled = true;
  button.textContent = loadingText;
  return () => {
    button.disabled = false;
    button.textContent = previous;
  };
}
