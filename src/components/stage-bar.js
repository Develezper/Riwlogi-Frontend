/**
 * Stage Bar Component.
 * Muestra progreso visual de las etapas.
 */

// Renderiza la barra de etapas
export function stageBar(stages, currentStage = 0, stageResults = {}) {
  const dots = stages
    .map((stage) => {
      const result = stageResults[stage.id];
      let stateClass = "bg-zinc-700";
      let icon = "";

      if (result) {
        stateClass = result.passed ? "passed" : "failed";
        icon = result.passed
          ? `<svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"/></svg>`
          : `<svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M6 18L18 6M6 6l12 12"/></svg>`;
      }

      const isActive = stage.stage_index === currentStage ? "active" : "";

      return /* html */`
        <div class="flex flex-col items-center gap-1">
          <div class="stage-dot ${stateClass} ${isActive} w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 border-zinc-600 text-white cursor-pointer"
               data-stage-index="${stage.stage_index}" data-stage-id="${stage.id}">
            ${icon || stage.stage_index}
          </div>
          <span class="text-[10px] text-zinc-500">Stage ${stage.stage_index}</span>
        </div>
      `;
    })
    .join(`<div class="w-8 h-0.5 bg-zinc-700 mt-3"></div>`);

  return `
    <div class="flex items-start gap-1 p-3 bg-zinc-900 rounded-lg border border-zinc-800">
      ${dots}
    </div>
  `;
}
