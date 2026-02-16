export function stageBar(stages, currentStage = 0, stageResults = {}) {
  const dots = stages
    .map((stage, index) => {
      const result = stageResults[stage.id];
      let stateClass = "bg-zinc-700";
      let icon = String(stage.stage_index);

      if (result) {
        stateClass = result.passed ? "passed" : "failed";
        icon = result.passed ? "✓" : "✕";
      }

      const isActive = stage.stage_index === currentStage ? "active" : "";
      const connectorClass =
        index < stages.length - 1 && result?.passed ? "bg-green-500/60" : "bg-zinc-700";

      return `
        <div class="flex items-center gap-1.5">
          <button class="stage-dot ${stateClass} ${isActive} w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 border-zinc-600 text-white cursor-pointer"
                  data-stage-index="${stage.stage_index}"
                  data-stage-id="${stage.id}"
                  aria-label="Ir a etapa ${stage.stage_index}"
                  aria-current="${isActive ? "step" : "false"}"
                  title="Stage ${stage.stage_index}">
            ${icon}
          </button>
          ${
            index < stages.length - 1
              ? `<div class="w-6 h-0.5 rounded-full ${connectorClass}"></div>`
              : ""
          }
        </div>
      `;
    })
    .join("");

  return `
    <div class="flex items-center gap-1 p-3 bg-zinc-900 rounded-lg border border-zinc-800 overflow-x-auto" role="group" aria-label="Progreso por etapas">
      ${dots}
    </div>
  `;
}
