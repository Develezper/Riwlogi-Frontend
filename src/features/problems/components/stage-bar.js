export function stageBar(stages, currentStage = 0, stageResults = {}, minStages = 0) {
  const totalStages = Math.max(stages.length, minStages);

  const dots = Array.from({ length: totalStages }).map((_, index) => {
    const hasStage = index < stages.length;
    const stage = hasStage ? stages[index] : { stage_index: index + 1 };
    const result = hasStage ? stageResults[stage.id] : null;
    const stageIndex = stage.stage_index;

    let stateClass = "bg-zinc-700";
    let icon = String(stageIndex);
    let extraClass = "";

    if (!hasStage) {
      stateClass = "bg-zinc-800/60";
      extraClass = "opacity-50 cursor-not-allowed";
    }

    if (result && typeof result.passed === "boolean") {
      stateClass = result.passed ? "passed" : "failed";
      icon = result.passed ? "✓" : "✕";
    }

    const isActive = hasStage && stageIndex === currentStage ? "active" : "";
    const connectorClass =
      index < totalStages - 1 && result?.passed === true ? "bg-green-500/60" : "bg-zinc-700";

    return `
      <div class="flex items-center gap-1.5">
        <button class="stage-dot ${stateClass} ${isActive} ${extraClass} w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 border-zinc-600 text-white"
                data-stage-index="${stageIndex}"
                data-stage-active="${hasStage ? "true" : "false"}"
                data-stage-id="${hasStage ? stage.id : ""}"
                aria-label="${hasStage ? `Ir a etapa ${stageIndex}` : `Etapa ${stageIndex} bloqueada`}"
                aria-current="${isActive ? "step" : "false"}"
                aria-disabled="${hasStage ? "false" : "true"}"
                title="Etapa ${stageIndex}">
          ${icon}
        </button>
        ${
          index < totalStages - 1
            ? `<div class="w-6 h-0.5 rounded-full ${connectorClass}"></div>`
            : ""
        }
      </div>
    `;
  });

  return `
    <div class="flex items-center gap-1 p-3 bg-zinc-900 rounded-lg border border-zinc-800 overflow-x-auto" role="group" aria-label="Progreso por etapas">
      ${dots.join("")}
    </div>
  `;
}
