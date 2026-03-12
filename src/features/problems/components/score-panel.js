import { escapeHtml } from "../../../shared/utils/ui-helpers.js";

function renderSecurityBadge(security) {
  if (!security) return "";

  const classificationLabel =
    security.label === "human"
      ? "Humano"
      : security.label === "assisted"
      ? "Asistido"
      : security.label === "ai_generated"
      ? "Generado por IA"
      : null;

  if (!classificationLabel) return "";

  const percent = Math.round((security.confidence || 0) * 100);
  const badgeClass =
    security.label === "human"
      ? "bg-green-500/10 text-green-400"
      : security.label === "assisted"
      ? "bg-yellow-500/10 text-yellow-400"
      : "bg-red-500/10 text-red-400";

  return `
    <div class="flex items-center justify-between text-xs">
      <span class="text-zinc-500">Proceso detectado:</span>
      <span class="px-2 py-0.5 rounded-full ${badgeClass}">
        ${classificationLabel} (${percent}%)
      </span>
    </div>
  `;
}

function renderConsoleOutput(output, meta = []) {
  const text = String(output || "").trim();
  const hasOutput = text.length > 0;
  const content = hasOutput
    ? escapeHtml(text)
    : "Sin salida de consola. Asegúrate de imprimir o retornar valores.";

  const metaHtml = meta.length
    ? `<div class="text-xs text-zinc-500 flex items-center gap-3">${meta
        .map((item) => `<span>${escapeHtml(item)}</span>`)
        .join("")}</div>`
    : "";

  return `
    <div class="space-y-3">
      <div class="flex items-center justify-between">
        <span class="text-sm font-semibold text-zinc-200">Salida por consola</span>
        ${metaHtml}
      </div>
      <pre class="text-xs font-mono whitespace-pre-wrap text-zinc-100 bg-zinc-950/60 border border-zinc-800 rounded-md p-3">${content}</pre>
    </div>
  `;
}

export function scorePanel(view = null, isRunning = false) {
  const mode = view?.mode || "run";

  if (isRunning) {
    const message = mode === "submit" ? "Enviando solución..." : "Ejecutando código...";
    return `
      <div class="p-4 bg-zinc-900 rounded-lg border border-zinc-800">
        <div class="flex items-center gap-3">
          <div class="w-5 h-5 border-2 border-zinc-600 border-t-brand rounded-full animate-spin"></div>
          <span class="text-sm text-zinc-400">${message}</span>
        </div>
      </div>
    `;
  }

  if (mode === "submit") {
    const security = view?.security || null;
    const badge = renderSecurityBadge(security);

    return `
      <div class="p-4 bg-zinc-900 rounded-lg border border-zinc-800 space-y-3">
        <div class="text-sm font-semibold text-zinc-200">Validaciones de seguridad</div>
        ${badge || `<p class="text-sm text-zinc-500">Sin datos de seguridad todavía. Ejecuta tu código y vuelve a enviar.</p>`}
      </div>
    `;
  }

  if (!view) {
    return `
      <div class="p-4 bg-zinc-900 rounded-lg border border-zinc-800">
        <p class="text-sm text-zinc-500 text-center">
          Ejecuta tu código para ver la salida por consola.
        </p>
      </div>
    `;
  }

  const meta = [];
  if (Number.isFinite(view.runtime_ms)) meta.push(`⏱ ${view.runtime_ms}ms`);
  if (view.stage_index) meta.push(`Etapa ${view.stage_index}`);

  return `
    <div class="p-4 bg-zinc-900 rounded-lg border border-zinc-800 space-y-3">
      ${renderConsoleOutput(view.output, meta)}
    </div>
  `;
}
