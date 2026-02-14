/**
 * Score Panel Component.
 * Muestra resultados de ejecución y score desglosado 
 */

// Renderiza el panel de resultados 
export function scorePanel(result = null, isRunning = false) {
  if (isRunning) {
    return /* html */`
      <div class="p-4 bg-zinc-900 rounded-lg border border-zinc-800">
        <div class="flex items-center gap-3">
          <div class="w-5 h-5 border-2 border-zinc-600 border-t-brand rounded-full animate-spin"></div>
          <span class="text-sm text-zinc-400">Ejecutando tests...</span>
        </div>
      </div>
    `;
  }

  if (!result) {
    return /* html */`
      <div class="p-4 bg-zinc-900 rounded-lg border border-zinc-800">
        <p class="text-sm text-zinc-500 text-center">
          Ejecuta tu código para ver los resultados
        </p>
      </div>
    `;
  }

  const statusColor = result.passed ? "text-green-400" : "text-red-400";
  const statusIcon = result.passed
    ? /* html */`<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>`
    : /* html */`<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>`;

  const testsHtml = (result.visible_results || [])
    .map(
      (t, i) => /* html */`
      <div class="flex items-center justify-between py-1.5 px-2 rounded ${t.passed ? "bg-green-500/5" : "bg-red-500/5"}">
        <span class="text-xs ${t.passed ? "text-green-400" : "text-red-400"}">
          Test ${i + 1}: ${t.passed ? "✓ Passed" : "✗ Failed"}
        </span>
        ${!t.passed && t.error ? `<span class="text-xs text-zinc-500">${t.error}</span>` : ""}
      </div>
    `
    )
    .join("");

  const classification = result.classification
    ? /* html */`
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
            ${result.classification.label} (${Math.round(result.classification.confidence * 100)}%)
          </span>
        </div>
      </div>
    `
    : "";

  return /* html */`
    <div class="p-4 bg-zinc-900 rounded-lg border border-zinc-800 space-y-3">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2 ${statusColor}">
          ${statusIcon}
          <span class="font-semibold text-sm">${result.passed ? "All Tests Passed" : "Tests Failed"}</span>
        </div>
        <div class="text-right">
          <div class="text-lg font-bold text-brand">${result.stage_score?.toFixed(1) || 0}</div>
          <div class="text-[10px] text-zinc-500">Score</div>
        </div>
      </div>

      <!-- Runtime -->
      <div class="flex items-center gap-4 text-xs text-zinc-400">
        <span>⏱ ${result.runtime_ms}ms</span>
        <span>Stage ${result.stage_index}</span>
      </div>

      <!-- Test Results -->
      <div class="space-y-1">${testsHtml}</div>

      <!-- AI Classification -->
      ${classification}
    </div>
  `;
}
