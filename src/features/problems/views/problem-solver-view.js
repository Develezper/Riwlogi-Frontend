import { scorePanel } from "../components/score-panel.js";
import { renderSolverLayout } from "../components/solver-layout.js";
import { api } from "../../../shared/services/api/index.js";
import { EditorTracker } from "../services/editor-tracker.js";
import { escapeHtml, renderMarkdown, showToast, spinner } from "../../../shared/utils/ui-helpers.js";
import { clearEditorBindings, getCurrentCode, mountEditor, replaceEditorCode } from "../services/code-editor.js";
import { clearDraft, loadDraft, saveDraft } from "../services/draft-storage.js";
import { activateAntiCheat } from "../services/anti-cheat.js";
import {
  collectExampleTests,
  getStarterCode,
  getStatementMarkdown,
  languageLabel,
  localizeStatementMarkdown,
  renderConstraintsSection,
  renderExamples,
  splitStatementAndConstraints,
} from "../services/statement-helpers.js";

export async function problemSolverView(container, { slug }) {
  const state = {
    problem: null,
    stages: [],
    stageResults: {},
    lastAction: null,
    lastSecurityCheck: null,
    lastSubmitResult: null,
    language: "python",
    submissionId: null,
    tracker: null,
    editorView: null,
    editorCleanupFns: [],
    draftSaveTimer: null,
    isRunning: false,
    activePanel: "results",
    statementParts: { body: "", constraints: "" },
    examples: [],
    cleanupFns: [],
  };

  let disposed = false;

  container.innerHTML = spinner("lg");

  const cleanup = () => {
    disposed = true;

    state.cleanupFns.forEach((fn) => {
      try {
        fn();
      } catch {
        // Ignore cleanup errors.
      }
    });

    state.cleanupFns = [];

    clearEditorBindings(state);

    if (state.draftSaveTimer) {
      window.clearTimeout(state.draftSaveTimer);
      state.draftSaveTimer = null;
    }

    if (state.tracker) {
      state.tracker.destroy();
      state.tracker = null;
    }

    if (state.editorView?.destroy) {
      state.editorView.destroy();
      state.editorView = null;
    }
  };

  try {
    const problem = await api.problems.get(slug);
    if (disposed) return cleanup;

    state.problem = problem;
    state.stages = Array.isArray(problem.stages) ? problem.stages : [];
    state.language = Object.keys(problem.starter_code || problem.starterCode || { python: "" })[0] || "python";
    const localizedStatement = localizeStatementMarkdown(problem.statement_md || "");
    state.statementParts = splitStatementAndConstraints(localizedStatement);
    state.examples = collectExampleTests(state.stages, 3);

    renderSolverLayout(container, state);

    await startSubmission(state);
    if (disposed) return cleanup;

    await mountEditor(container, state, getInitialCodeForLanguage(state.problem, state.language));
    if (disposed) return cleanup;

    bindEvents(container, state);
    state.cleanupFns.push(activateAntiCheat(container, state.tracker));
    updatePanelVisibility(container, state);
    updateStageContent(container, state);
    updateCasesPanel(container, state);
    updateResultsPanel(container, state);
  } catch (error) {
    if (!disposed) {
      container.innerHTML = `
        <div class="flex items-center justify-center h-[60vh] px-4">
          <div class="text-center text-zinc-500">
            <p class="text-lg mb-2">Error al cargar problema</p>
            <p class="text-sm">${error.message}</p>
          </div>
        </div>
      `;
    }
  }

  return cleanup;
}

// --- Event binding ---

function bindEvents(container, state) {
  const runButton = container.querySelector("#btn-run");
  const submitButton = container.querySelector("#btn-submit");
  const resetButton = container.querySelector("#btn-reset");
  const clearConsoleButton = container.querySelector("#btn-clear-console");
  const languageSelect = container.querySelector("#lang-select");
  const tabResults = container.querySelector("#tab-results");
  const tabCases = container.querySelector("#tab-cases");

  const onRun = async () => {
    if (state.isRunning) return;
    const activeStage = getActiveStage(state);
    if (!activeStage) return;

    state.isRunning = true;
    state.lastAction = "run";
    setButtonsDisabled(container, true, "run");
    updateResultsPanel(container, state, { mode: "run" }, true);
    state.tracker?.onRun("run");

    try {
      const code = getCurrentCode(container, state);
      saveDraft(state.problem.id, state.language, code);
      state.tracker?.setStage(activeStage.id);
      const result = await runStage(state, activeStage.id, code);

      const output = extractConsoleOutput(result);
      state.stageResults[activeStage.id] = buildStageResult(result, output, activeStage);
      if (result.classification) {
        state.lastSecurityCheck = result.classification;
      }

      updateResultsPanel(
        container,
        state,
        {
          mode: "run",
          output,
          passed: Boolean(result.passed),
          stage_score: Number(result.stage_score || 0),
          runtime_ms: Number(result.runtime_ms || 0),
          stage_index: result.stage_index || activeStage.stage_index,
          visible_results: result.visible_results || [],
        },
        false,
      );
    } catch (error) {
      showToast(error.message, "error");
      updateResultsPanel(container, state, { mode: "run" }, false);
    } finally {
      state.isRunning = false;
      setButtonsDisabled(container, false);
    }
  };

  const onSubmit = async () => {
    if (state.isRunning) return;

    state.isRunning = true;
    state.lastAction = "submit";
    setButtonsDisabled(container, true, "submit");
    updateResultsPanel(container, state, { mode: "submit" }, true);
    state.tracker?.onRun("submit");

    try {
      const code = getCurrentCode(container, state);
      saveDraft(state.problem.id, state.language, code);
      const activeStage = getActiveStage(state);
      let security = state.lastSecurityCheck;

      if (activeStage) {
        state.tracker?.setStage(activeStage.id);
        const runResult = await runStage(state, activeStage.id, code);
        const output = extractConsoleOutput(runResult);
        state.stageResults[activeStage.id] = buildStageResult(runResult, output, activeStage);
        if (runResult.classification) {
          security = runResult.classification;
        }
      }

      const submitResult = await api.submissions.submit(state.submissionId);

      state.lastSecurityCheck = submitResult.classification || security;
      state.lastSubmitResult = submitResult;
      updateResultsPanel(
        container,
        state,
        {
          mode: "submit",
          verdict: submitResult.verdict,
          final_score: submitResult.final_score,
          security: submitResult.classification || security,
        },
        false,
      );

      if (submitResult.verdict === "accepted") {
        showToast("¡Problema resuelto correctamente!", "success", 5000);
      } else {
        showToast("Envío registrado. Revisa los resultados.", "info", 5000);
      }
    } catch (error) {
      showToast(error.message, "error");
      updateResultsPanel(container, state, { mode: "submit", security: state.lastSecurityCheck }, false);
    } finally {
      state.isRunning = false;
      setButtonsDisabled(container, false);
    }
  };

  const onClearConsole = () => {
    if (state.isRunning) return;

    const activeStage = getActiveStage(state);
    if (activeStage && state.stageResults[activeStage.id]) {
      delete state.stageResults[activeStage.id];
    }

    state.lastAction = "run";
    updateResultsPanel(container, state);
    showToast("Consola limpiada", "info");
  };

  const onReset = () => {
    const starter = getStarterCode(state.problem, state.language);
    clearDraft(state.problem.id, state.language);
    replaceEditorCode(container, state, starter);
    showToast("Código reiniciado", "info");
  };

  const onLanguageChange = async (event) => {
    if (state.isRunning) return;

    const currentCode = getCurrentCode(container, state);
    saveDraft(state.problem.id, state.language, currentCode);

    state.language = event.target.value;
    state.stageResults = {};
    state.lastAction = null;
    state.lastSecurityCheck = null;

    try {
      await startSubmission(state);
      await mountEditor(
        container,
        state,
        getInitialCodeForLanguage(state.problem, state.language),
      );
      updateResultsPanel(container, state);
      showToast(`Lenguaje cambiado a ${languageLabel(state.language)}`, "info");
    } catch (error) {
      showToast(error.message, "error");
    }
  };

  const onTabClick = (event) => {
    const panel = event.currentTarget.dataset.panel;
    state.activePanel = panel;
    updatePanelVisibility(container, state);
  };

  runButton?.addEventListener("click", onRun);
  submitButton?.addEventListener("click", onSubmit);
  clearConsoleButton?.addEventListener("click", onClearConsole);
  resetButton?.addEventListener("click", onReset);
  languageSelect?.addEventListener("change", onLanguageChange);
  tabResults?.addEventListener("click", onTabClick);
  tabCases?.addEventListener("click", onTabClick);

  state.cleanupFns.push(() => runButton?.removeEventListener("click", onRun));
  state.cleanupFns.push(() => submitButton?.removeEventListener("click", onSubmit));
  state.cleanupFns.push(() => clearConsoleButton?.removeEventListener("click", onClearConsole));
  state.cleanupFns.push(() => resetButton?.removeEventListener("click", onReset));
  state.cleanupFns.push(() => languageSelect?.removeEventListener("change", onLanguageChange));
  state.cleanupFns.push(() => tabResults?.removeEventListener("click", onTabClick));
  state.cleanupFns.push(() => tabCases?.removeEventListener("click", onTabClick));
}

// --- Submission & execution ---

async function startSubmission(state) {
  const response = await api.submissions.start(state.problem.id, state.language);
  state.submissionId = response.submission_id;

  const activeStage = getActiveStage(state);

  if (!state.tracker) {
    state.tracker = new EditorTracker(state.submissionId, activeStage?.id);
    state.tracker.onFlush(async (events) => {
      await api.submissions.sendEvents(state.submissionId, events);
    });
    return;
  }

  state.tracker.setSubmission(state.submissionId);
  state.tracker.setStage(activeStage?.id);
}

async function runStage(state, stageId, code) {
  const events = state.tracker ? state.tracker.flush() : [];

  return api.submissions.run({
    submission_id: state.submissionId,
    stage_id: stageId,
    code,
    events,
  });
}

function buildStageResult(result, output, stage) {
  return {
    output,
    passed: Boolean(result.passed),
    stage_score: Number(result.stage_score || 0),
    runtime_ms: Number(result.runtime_ms || 0),
    stage_index: result.stage_index || stage.stage_index,
    visible_results: result.visible_results || [],
    classification: result.classification || null,
  };
}

function extractConsoleOutput(result) {
  if (!result || typeof result !== "object") return "";

  const pickText = (value) => {
    if (typeof value === "string") return value;
    if (Array.isArray(value)) {
      return value.filter((item) => typeof item === "string").join("\n");
    }
    return "";
  };

  const stdout = pickText(result.stdout);
  const stderr = pickText(result.stderr);
  if (stdout || stderr) {
    return [stdout, stderr].filter(Boolean).join(stdout && stderr ? "\n" : "");
  }

  return (
    pickText(result.output) ||
    pickText(result.output_text) ||
    pickText(result.outputText) ||
    pickText(result.console_output) ||
    pickText(result.console_text) ||
    pickText(result.consoleText) ||
    pickText(result.console)
  );
}

// --- Panel updates ---

function updateStageContent(container, state) {
  const statement = container.querySelector("#problem-statement");
  const examples = container.querySelector("#problem-examples");
  const constraints = container.querySelector("#problem-constraints");

  if (statement) {
    statement.innerHTML = renderMarkdown(getStatementMarkdown(state));
  }

  if (examples) {
    examples.innerHTML = renderExamples(state.examples);
  }

  if (constraints) {
    constraints.innerHTML = renderConstraintsSection(state.statementParts?.constraints);
  }
}

function updateResultsPanel(container, state, explicitView = null, isRunning = false) {
  const panel = container.querySelector("#results-panel");
  if (!panel) return;

  let view = explicitView;

  if (!view) {
    if (state.lastAction === "submit") {
      view = buildSubmitView(state);
    } else {
      view = buildRunView(state, getActiveStage(state));
    }
  }

  panel.innerHTML = scorePanel(view, isRunning);
}

function updateCasesPanel(container, state) {
  const panel = container.querySelector("#cases-panel");
  if (!panel) return;

  const stage = getActiveStage(state);
  const tests = stage?.visible_tests || [];

  if (!tests.length) {
    panel.innerHTML = `<p class="text-sm text-zinc-500">No hay casos de prueba visibles para este ejercicio.</p>`;
    return;
  }

  panel.innerHTML = tests
    .map(
      (test, index) => `
      <div class="mb-3 rounded-md border border-zinc-800 bg-zinc-900/50 p-3 text-xs font-mono">
        <p class="text-zinc-400">Entrada: <span class="text-zinc-200">${escapeHtml(test.input_text)}</span></p>
        <p class="text-zinc-400">Esperado: <span class="text-green-400">${escapeHtml(test.expected_text)}</span></p>
        <p class="text-zinc-500 mt-1">Caso ${index + 1}</p>
      </div>
    `,
    )
    .join("");
}

function updatePanelVisibility(container, state) {
  const resultsPanel = container.querySelector("#results-panel");
  const casesPanel = container.querySelector("#cases-panel");
  const resultsTab = container.querySelector("#tab-results");
  const casesTab = container.querySelector("#tab-cases");

  if (!resultsPanel || !casesPanel || !resultsTab || !casesTab) return;

  const showResults = state.activePanel === "results";

  resultsPanel.classList.toggle("hidden", !showResults);
  casesPanel.classList.toggle("hidden", showResults);

  resultsTab.className = showResults
    ? "px-3 py-1.5 text-xs rounded-t-md bg-zinc-800 text-zinc-200"
    : "px-3 py-1.5 text-xs rounded-t-md text-zinc-500 hover:text-zinc-300";
  casesTab.className = !showResults
    ? "px-3 py-1.5 text-xs rounded-t-md bg-zinc-800 text-zinc-200"
    : "px-3 py-1.5 text-xs rounded-t-md text-zinc-500 hover:text-zinc-300";

  resultsTab.setAttribute("aria-selected", showResults ? "true" : "false");
  casesTab.setAttribute("aria-selected", !showResults ? "true" : "false");
}

function setButtonsDisabled(container, disabled, mode = "run") {
  const runButton = container.querySelector("#btn-run");
  const submitButton = container.querySelector("#btn-submit");
  const clearConsoleButton = container.querySelector("#btn-clear-console");

  if (runButton) {
    runButton.disabled = disabled;
    runButton.textContent = disabled && mode === "run" ? "Ejecutando..." : "Ejecutar";
  }

  if (submitButton) {
    submitButton.disabled = disabled;
    submitButton.textContent = disabled && mode === "submit" ? "Enviando..." : "Enviar";
  }

  if (clearConsoleButton) {
    clearConsoleButton.disabled = disabled;
  }
}

// --- Helpers ---

function getActiveStage(state) {
  return state.stages[0] || null;
}

function getInitialCodeForLanguage(problem, language) {
  const draft = loadDraft(problem.id, language);
  if (draft !== null && draft.trim().length > 0) return draft;
  return getStarterCode(problem, language);
}

function buildRunView(state, stage) {
  if (!stage) return null;
  const stored = state.stageResults[stage.id];
  if (!stored) return null;

  return {
    mode: "run",
    output: stored.output,
    passed: stored.passed,
    stage_score: stored.stage_score,
    runtime_ms: stored.runtime_ms,
    stage_index: stored.stage_index || stage.stage_index,
    visible_results: stored.visible_results || [],
  };
}

function buildSubmitView(state) {
  const result = state.lastSubmitResult;
  return {
    mode: "submit",
    verdict: result?.verdict || null,
    final_score: result?.final_score ?? null,
    security: result?.classification || state.lastSecurityCheck || null,
  };
}
