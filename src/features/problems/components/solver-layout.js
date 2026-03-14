import { difficultyBadge, renderMarkdown } from "../../../shared/utils/ui-helpers.js";
import {
  getStatementMarkdown,
  languageLabel,
  renderConstraintsSection,
  renderExamples,
  renderTags,
} from "../services/statement-helpers.js";

export function renderSolverLayout(container, state) {
  const badge = difficultyBadge(state.problem.difficulty);
  const statementHtml = renderMarkdown(getStatementMarkdown(state));
  const tagsHtml = renderTags(state.problem.tags || []);
  const examplesHtml = renderExamples(state.examples);
  const constraintsHtml = renderConstraintsSection(state.statementParts?.constraints);
  const languageOptions = Object.keys(state.problem.starter_code || state.problem.starterCode || {});

  container.innerHTML = `
    <div class="exercise-scope h-[calc(100vh-3.5rem)] flex flex-col">
      <div class="px-4 py-3 border-b border-zinc-800 bg-zinc-900/50">
        <div class="flex flex-wrap items-center justify-between gap-4">
          <div class="flex items-center gap-3">
          <a href="#/problems" class="text-zinc-500 hover:text-white transition" aria-label="Volver a problemas">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/></svg>
          </a>
          <h1 class="font-semibold text-white">${state.problem.title}</h1>
          <span class="px-2 py-0.5 rounded-full text-xs font-medium ${badge.class}">${badge.label}</span>
          </div>
          <span class="px-2 py-0.5 rounded-full text-xs font-medium text-sky-200 bg-sky-500/10 border border-sky-500/30">Etapa única</span>
        </div>
      </div>

      <div class="flex-1 flex flex-col lg:flex-row overflow-hidden">
        <section class="w-full lg:w-[42%] lg:border-r border-zinc-800 overflow-y-auto max-h-[38vh] lg:max-h-none select-none">
          <div class="p-6 space-y-6">
            ${tagsHtml ? `<div class="flex flex-wrap items-center gap-2">${tagsHtml}</div>` : ""}

            <div>
              <h2 class="text-xs font-semibold text-zinc-400 uppercase tracking-wide mb-2">Enunciado</h2>
              <div id="problem-statement" class="prose-content">${statementHtml}</div>
            </div>

            <div>
              <h2 class="text-xs font-semibold text-zinc-400 uppercase tracking-wide mb-2">Ejemplos</h2>
              <div id="problem-examples" class="space-y-3">${examplesHtml}</div>
            </div>

            <div id="problem-constraints">${constraintsHtml}</div>
          </div>
        </section>

        <section class="flex-1 flex flex-col min-w-0">
          <div class="flex items-center justify-between px-4 py-2 border-b border-zinc-800 bg-zinc-900/50">
            <div class="flex items-center gap-2">
              <select id="lang-select" class="bg-zinc-800 text-zinc-300 text-sm px-2 py-1 rounded border border-zinc-700">
                ${languageOptions
                  .map(
                    (language) =>
                      `<option value="${language}" ${language === state.language ? "selected" : ""}>${languageLabel(
                        language,
                      )}</option>`,
                  )
                  .join("")}
              </select>
              <button id="btn-reset" class="px-3 py-1.5 rounded-md text-sm text-zinc-400 hover:text-white hover:bg-zinc-800 transition inline-flex items-center gap-2" title="Reiniciar código">
                <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v6h6M20 20v-6h-6"/>
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 9a7 7 0 0 0-14-2M4 15a7 7 0 0 0 14 2"/>
                </svg>
                Reiniciar
              </button>
            </div>
          </div>

          <div id="code-editor" class="flex-1 overflow-hidden bg-zinc-950"></div>

          <div class="h-[38%] border-t border-zinc-800 flex flex-col min-h-50">
            <div class="px-3 pt-2 border-b border-zinc-800 bg-zinc-900/60 flex items-center justify-between gap-2">
              <div class="flex items-center gap-2" role="tablist" aria-label="Panel de consola y casos de prueba">
                <button id="tab-results" role="tab" aria-selected="true" aria-controls="results-panel" data-panel="results" class="px-3 py-1.5 text-xs rounded-t-md bg-zinc-800 text-zinc-200">Consola</button>
                <button id="tab-cases" role="tab" aria-selected="false" aria-controls="cases-panel" data-panel="cases" class="px-3 py-1.5 text-xs rounded-t-md text-zinc-500 hover:text-zinc-300">Casos de prueba</button>
              </div>
              <div class="flex items-center gap-2">
                <button id="btn-run" class="px-3 py-1.5 rounded-md text-xs bg-zinc-700 text-white hover:bg-zinc-600 transition font-medium">
                  Ejecutar
                </button>
                <button id="btn-clear-console" class="px-3 py-1.5 rounded-md text-xs text-zinc-300 border border-zinc-700 hover:bg-zinc-800 transition">
                  Limpiar consola
                </button>
                <button id="btn-submit" class="px-3 py-1.5 rounded-md text-xs bg-brand text-white hover:bg-brand-dark transition font-medium">
                  Enviar
                </button>
              </div>
            </div>

            <div id="results-panel" role="tabpanel" aria-live="polite" class="flex-1 overflow-y-auto p-3"></div>
            <div id="cases-panel" role="tabpanel" class="hidden flex-1 overflow-y-auto p-3"></div>
          </div>
        </section>
      </div>
    </div>
  `;
}
