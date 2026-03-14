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

function renderResultHeader(view) {
	const passed = view.passed;
	const score = view.stage_score ?? 0;
	const runtimeMs = view.runtime_ms;

	const statusIcon = passed
		? `<svg class="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>`
		: `<svg class="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>`;

	const statusText = passed ? "Todos los tests pasaron" : "Algunos tests fallaron";
	const statusColor = passed ? "text-green-400" : "text-red-400";
	const borderColor = passed ? "border-green-500/30" : "border-red-500/30";
	const bgColor = passed ? "bg-green-500/5" : "bg-red-500/5";

	const scoreColor =
		score === 100 ? "text-green-400" : score > 0 ? "text-yellow-400" : "text-red-400";

	const metaItems = [];
	if (Number.isFinite(runtimeMs)) metaItems.push(`<span class="text-zinc-500">&#9201; ${runtimeMs}ms</span>`);
	metaItems.push(`<span class="${scoreColor} font-semibold">${score}/100</span>`);

	return `
    <div class="flex items-center justify-between p-3 rounded-lg border ${borderColor} ${bgColor}">
      <div class="flex items-center gap-2">
        ${statusIcon}
        <span class="text-sm font-semibold ${statusColor}">${statusText}</span>
      </div>
      <div class="flex items-center gap-3 text-xs">
        ${metaItems.join("")}
      </div>
    </div>
  `;
}

function renderTestResult(test, index) {
	const passed = test.passed;
	const icon = passed
		? `<svg class="w-3.5 h-3.5 text-green-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>`
		: `<svg class="w-3.5 h-3.5 text-red-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>`;

	const borderColor = passed ? "border-green-500/20" : "border-red-500/20";
	const labelColor = passed ? "text-green-400" : "text-red-400";

	const outputRow = test.output_text != null
		? `<div class="flex gap-2">
        <span class="text-zinc-500 shrink-0 w-16">Obtenido:</span>
        <span class="${passed ? "text-zinc-200" : "text-red-300"}">${escapeHtml(String(test.output_text))}</span>
      </div>`
		: "";

	const errorRow = test.error
		? `<div class="mt-1 text-red-400/80 text-[11px]">${escapeHtml(String(test.error))}</div>`
		: "";

	return `
    <div class="rounded-md border ${borderColor} bg-zinc-950/40 p-2.5 text-xs font-mono">
      <div class="flex items-center gap-1.5 mb-1.5">
        ${icon}
        <span class="${labelColor} text-[11px] font-semibold font-sans">Test ${index + 1}</span>
      </div>
      <div class="space-y-0.5 pl-5">
        <div class="flex gap-2">
          <span class="text-zinc-500 shrink-0 w-16">Entrada:</span>
          <span class="text-zinc-300">${escapeHtml(String(test.input_text || ""))}</span>
        </div>
        <div class="flex gap-2">
          <span class="text-zinc-500 shrink-0 w-16">Esperado:</span>
          <span class="text-green-400/80">${escapeHtml(String(test.expected_text || ""))}</span>
        </div>
        ${outputRow}
        ${errorRow}
      </div>
    </div>
  `;
}

function renderVisibleResults(results) {
	if (!results || !results.length) return "";

	return `
    <div class="space-y-2">
      <span class="text-xs font-semibold text-zinc-400 uppercase tracking-wide">Resultados de tests</span>
      <div class="space-y-1.5">
        ${results.map((test, i) => renderTestResult(test, i)).join("")}
      </div>
    </div>
  `;
}

function renderVerdictBanner(verdict, finalScore) {
	if (!verdict) {
		return `<p class="text-sm text-zinc-500">Procesando resultado...</p>`;
	}

	const isAccepted = verdict === "accepted";
	const icon = isAccepted
		? `<svg class="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>`
		: `<svg class="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>`;

	const title = isAccepted ? "Problema resuelto" : "No aceptado";
	const titleColor = isAccepted ? "text-green-400" : "text-red-400";
	const borderColor = isAccepted ? "border-green-500/30" : "border-red-500/30";
	const bgColor = isAccepted ? "bg-green-500/5" : "bg-red-500/5";

	const scoreDisplay = finalScore !== null
		? `<span class="text-2xl font-bold ${isAccepted ? "text-green-400" : "text-red-400"}">${finalScore}</span><span class="text-sm text-zinc-500 ml-0.5">pts</span>`
		: "";

	return `
    <div class="flex items-center justify-between p-4 rounded-lg border ${borderColor} ${bgColor}">
      <div class="flex items-center gap-3">
        ${icon}
        <div>
          <div class="text-base font-bold ${titleColor}">${title}</div>
          <div class="text-xs text-zinc-500">${isAccepted ? "Tu solución pasó todas las validaciones" : "Revisa tu solución e intenta de nuevo"}</div>
        </div>
      </div>
      ${scoreDisplay ? `<div class="flex items-baseline">${scoreDisplay}</div>` : ""}
    </div>
  `;
}

function renderConsoleOutput(output) {
	const text = String(output || "").trim();
	if (!text) return "";

	return `
    <div class="space-y-1.5">
      <span class="text-xs font-semibold text-zinc-400 uppercase tracking-wide">Salida por consola</span>
      <pre class="text-xs font-mono whitespace-pre-wrap text-zinc-100 bg-zinc-950/60 border border-zinc-800 rounded-md p-3">${escapeHtml(text)}</pre>
    </div>
  `;
}

export function scorePanel(view = null, isRunning = false) {
	const mode = view?.mode || "run";

	if (isRunning) {
		const message =
			mode === "submit" ? "Enviando solución..." : "Ejecutando código...";
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
		const verdict = view?.verdict || null;
		const finalScore = view?.final_score ?? null;

		return `
      <div class="p-4 bg-zinc-900 rounded-lg border border-zinc-800 space-y-4">
        ${renderVerdictBanner(verdict, finalScore)}
        ${renderSecurityBadge(security)}
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

	const hasTestData = typeof view.passed === "boolean";
	const visibleResults = view.visible_results || [];

	return `
    <div class="p-4 bg-zinc-900 rounded-lg border border-zinc-800 space-y-3">
      ${hasTestData ? renderResultHeader(view) : ""}
      ${renderVisibleResults(visibleResults)}
      ${renderConsoleOutput(view.output)}
    </div>
  `;
}
