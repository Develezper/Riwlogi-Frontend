export function scorePanel(result = null, isRunning = false) {
  if (isRunning) {
    return `
      <div class="p-4 bg-zinc-900 rounded-lg border border-zinc-800">
        <div class="flex items-center gap-3">
          <div class="w-5 h-5 border-2 border-zinc-600 border-t-brand rounded-full animate-spin"></div>
          <span class="text-sm text-zinc-400">Ejecutando tests...</span>
        </div>
      </div>
    `;
  }

  if (!result) {
    return `
      <div class="p-4 bg-zinc-900 rounded-lg border border-zinc-800">
        <p class="text-sm text-zinc-500 text-center">
          Ejecuta tu código para ver resultados de la etapa actual.
        </p>
      </div>
    `;
  }

  const statusColor = result.passed ? "text-green-400" : "text-red-400";
  const statusTitle = result.passed ? "Stage Passed" : "Stage Failed";

  const testsHtml = (result.visible_results || [])
    .map(
      (test, index) => `
      <div class="flex items-center justify-between py-1.5 px-2 rounded ${
        test.passed ? "bg-green-500/5" : "bg-red-500/5"
      }">
        <span class="text-xs ${test.passed ? "text-green-400" : "text-red-400"}">
          Test ${index + 1}: ${test.passed ? "Passed" : "Failed"}
        </span>
        ${!test.passed && test.error ? `<span class="text-xs text-zinc-500">${test.error}</span>` : ""}
      </div>
    `,
    )
    .join("");

  const classificationLabel =
    result.classification?.label === "human"
      ? "Human"
      : result.classification?.label === "assisted"
      ? "Assisted"
      : result.classification?.label === "ai_generated"
      ? "AI Generated"
      : null;

  const classification = classificationLabel
    ? `
      <div class="mt-3 pt-3 border-t border-zinc-800">
        <div class="flex items-center justify-between text-xs">
          <span class="text-zinc-500">Proceso detectado:</span>
          <span class="px-2 py-0.5 rounded-full ${
            result.classification.label === "human"
              ? "bg-green-500/10 text-green-400"
              : result.classification.label === "assisted"
              ? "bg-yellow-500/10 text-yellow-400"
              : "bg-red-500/10 text-red-400"
          }">
            ${classificationLabel} (${Math.round((result.classification.confidence || 0) * 100)}%)
          </span>
        </div>
      </div>
    `
    : "";

  return `
    <div class="p-4 bg-zinc-900 rounded-lg border border-zinc-800 space-y-3">
      <div class="flex items-center justify-between">
        <div class="${statusColor}">
          <span class="font-semibold text-sm">${statusTitle}</span>
        </div>
        <div class="text-right">
          <div class="text-lg font-bold text-brand">${Number(result.stage_score || 0).toFixed(1)}</div>
          <div class="text-[10px] text-zinc-500">Score</div>
        </div>
      </div>

      <div class="flex items-center gap-4 text-xs text-zinc-400">
        <span>⏱ ${result.runtime_ms || 0}ms</span>
        <span>Stage ${result.stage_index || "-"}</span>
      </div>

      <div class="space-y-1">${testsHtml || `<p class="text-xs text-zinc-500">Sin tests visibles para esta etapa.</p>`}</div>

      ${classification}
    </div>
  `;
}
