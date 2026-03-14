import { scorePanel } from "../components/score-panel.js";
import { api } from "../../../shared/services/api/index.js";
import { EditorTracker } from "../services/editor-tracker.js";
import { difficultyBadge, escapeHtml, renderMarkdown, showToast, spinner } from "../../../shared/utils/ui-helpers.js";

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

    renderLayout(container, state);

    await startSubmission(state);
    if (disposed) return cleanup;

    await mountEditor(container, state, getInitialCodeForLanguage(state.problem, state.language));
    if (disposed) return cleanup;

    bindEvents(container, state);
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

function renderLayout(container, state) {
  const badge = difficultyBadge(state.problem.difficulty);
  const statementHtml = renderMarkdown(getStatementMarkdown(state));
  const tagsHtml = renderTags(state.problem.tags || []);
  const examplesHtml = renderExamples(state.examples);
  const constraintsHtml = renderConstraintsSection(state.statementParts?.constraints);
  const languageOptions = Object.keys(state.problem.starter_code || state.problem.starterCode || {});

  container.innerHTML = `
    <div class="h-[calc(100vh-3.5rem)] flex flex-col">
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
        <section class="w-full lg:w-[42%] lg:border-r border-zinc-800 overflow-y-auto max-h-[38vh] lg:max-h-none">
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

          <div class="h-[38%] border-t border-zinc-800 flex flex-col min-h-[200px]">
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
      state.stageResults[activeStage.id] = {
        output,
        passed: Boolean(result.passed),
        stage_score: Number(result.stage_score || 0),
        runtime_ms: Number(result.runtime_ms || 0),
        stage_index: result.stage_index || activeStage.stage_index,
        visible_results: result.visible_results || [],
        classification: result.classification || null,
      };
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
        state.stageResults[activeStage.id] = {
          output,
          passed: Boolean(runResult.passed),
          stage_score: Number(runResult.stage_score || 0),
          runtime_ms: Number(runResult.runtime_ms || 0),
          stage_index: runResult.stage_index || activeStage.stage_index,
          visible_results: runResult.visible_results || [],
          classification: runResult.classification || null,
        };
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

async function mountEditor(container, state, initialCode) {
  const editorElement = container.querySelector("#code-editor");
  if (!editorElement) return;

  clearEditorBindings(state);

  if (state.editorView?.destroy) {
    state.editorView.destroy();
    state.editorView = null;
  }

  editorElement.innerHTML = "";

  try {
    const [{ EditorView, basicSetup }, { EditorState }, { oneDark }, { ViewPlugin }, pythonMod, jsMod] =
      await Promise.all([
        import("codemirror"),
        import("@codemirror/state"),
        import("@codemirror/theme-one-dark"),
        import("@codemirror/view"),
        import("@codemirror/lang-python"),
        import("@codemirror/lang-javascript"),
      ]);

    const langExtension = state.language === "python" ? pythonMod.python() : jsMod.javascript();

    const trackingPlugin = ViewPlugin.define(() => ({
      update(update) {
        if (!update.docChanged) return;

        const currentCode = update.state.doc.toString();
        scheduleDraftSave(state, currentCode);

        if (!state.tracker) return;

        for (const transaction of update.transactions) {
          transaction.changes.iterChanges((fromA, toA, _fromB, _toB, inserted) => {
            const deletedLen = toA - fromA;
            const insertedLen = inserted.toString().length;

            if (deletedLen > 0 && insertedLen > 0) {
              if (insertedLen > 10) state.tracker.onPaste(insertedLen);
              else state.tracker.onKey(insertedLen);
              if (deletedLen > 5) state.tracker.onDelete(deletedLen);
              return;
            }

            if (deletedLen > 0) {
              state.tracker.onDelete(deletedLen);
              return;
            }

            if (insertedLen > 0) {
              if (insertedLen > 10) state.tracker.onPaste(insertedLen);
              else state.tracker.onKey(insertedLen);
            }
          });
        }
      },
    }));

    const editorState = EditorState.create({
      doc: initialCode,
      extensions: [basicSetup, oneDark, langExtension, trackingPlugin],
    });

    state.editorView = new EditorView({
      state: editorState,
      parent: editorElement,
    });

    const onFocus = () => state.tracker?.onFocusChange(true);
    const onBlur = () => state.tracker?.onFocusChange(false);

    editorElement.addEventListener("focusin", onFocus);
    editorElement.addEventListener("focusout", onBlur);

    state.editorCleanupFns.push(() => editorElement.removeEventListener("focusin", onFocus));
    state.editorCleanupFns.push(() => editorElement.removeEventListener("focusout", onBlur));
  } catch {
    editorElement.innerHTML = `
      <textarea id="code-textarea"
        class="w-full h-full bg-zinc-950 text-zinc-100 font-mono text-sm p-4 resize-none outline-none border-none"
        spellcheck="false">${initialCode}</textarea>
    `;

    const textArea = editorElement.querySelector("#code-textarea");
    const onInput = (event) => {
      scheduleDraftSave(state, event.target.value);
    };

    textArea?.addEventListener("input", onInput);
    state.editorCleanupFns.push(() => textArea?.removeEventListener("input", onInput));
  }
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

function getCurrentCode(container, state) {
  if (state.editorView) {
    return state.editorView.state.doc.toString();
  }

  return container.querySelector("#code-textarea")?.value || "";
}

function replaceEditorCode(container, state, code) {
  if (state.editorView) {
    state.editorView.dispatch({
      changes: {
        from: 0,
        to: state.editorView.state.doc.length,
        insert: code,
      },
    });
    saveDraft(state.problem.id, state.language, code);
    return;
  }

  const textarea = container.querySelector("#code-textarea");
  if (textarea) {
    textarea.value = code;
    saveDraft(state.problem.id, state.language, code);
  }
}

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

function getActiveStage(state) {
  return state.stages[0] || null;
}

function clearEditorBindings(state) {
  state.editorCleanupFns.forEach((fn) => {
    try {
      fn();
    } catch {
      // Ignore editor scoped cleanup errors.
    }
  });

  state.editorCleanupFns = [];
}

function draftKey(problemId, language) {
  return `Riwlog_draft_${problemId}_${language}`;
}

function saveDraft(problemId, language, code) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(draftKey(problemId, language), String(code || ""));
}

function loadDraft(problemId, language) {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(draftKey(problemId, language));
}

function clearDraft(problemId, language) {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(draftKey(problemId, language));
}

function scheduleDraftSave(state, code) {
  if (state.draftSaveTimer) {
    window.clearTimeout(state.draftSaveTimer);
  }

  state.draftSaveTimer = window.setTimeout(() => {
    saveDraft(state.problem.id, state.language, code);
  }, 300);
}

function getInitialCodeForLanguage(problem, language) {
  const draft = loadDraft(problem.id, language);
  if (draft !== null && draft.trim().length > 0) return draft;
  return getStarterCode(problem, language);
}

function getStarterCode(problem, language) {
  const source = problem.starter_code || problem.starterCode || {};
  return (
    source[language] ||
    source.python ||
    source.javascript ||
    "# Escribe tu solución aquí\n"
  );
}

function languageLabel(language) {
  if (language === "python") return "Python";
  if (language === "javascript") return "JavaScript";
  if (language === "typescript") return "TypeScript";
  return language.charAt(0).toUpperCase() + language.slice(1);
}

function renderTags(tags) {
  if (!Array.isArray(tags) || !tags.length) return "";
  return tags
    .map(
      (tag) => `
      <span class="px-2 py-0.5 rounded-full text-xs bg-zinc-800 text-zinc-300 border border-zinc-700">
        ${escapeHtml(tag)}
      </span>
    `,
    )
    .join("");
}

function collectExampleTests(stages, limit = 3) {
  const firstStage = Array.isArray(stages) ? stages[0] : null;
  const tests = Array.isArray(firstStage?.visible_tests) ? firstStage.visible_tests : [];
  return tests.slice(0, limit);
}

function renderExamples(examples) {
  if (!examples?.length) {
    return `<p class="text-sm text-zinc-500">No hay ejemplos disponibles todavía.</p>`;
  }

  return examples
    .map(
      (example, index) => `
      <div class="rounded-lg border border-zinc-800 bg-zinc-900/50 p-4">
        <p class="text-xs font-semibold text-zinc-400 mb-2">Ejemplo ${index + 1}</p>
        <div class="text-xs font-mono space-y-1">
          <p class="text-zinc-400">Entrada: <span class="text-zinc-200">${escapeHtml(example.input_text)}</span></p>
          <p class="text-zinc-400">Salida: <span class="text-green-400">${escapeHtml(example.expected_text)}</span></p>
        </div>
      </div>
    `,
    )
    .join("");
}

function getStatementMarkdown(state) {
  const statementBody = state.statementParts?.body?.trim?.() || "";
  if (statementBody) return statementBody;
  const stagePrompt = getActiveStage(state)?.prompt_md || "";
  return localizeStatementMarkdown(stagePrompt);
}

function splitStatementAndConstraints(md) {
  const text = String(md || "").replace(/\r\n/g, "\n").trim();
  if (!text) return { body: "", constraints: "" };

  const lines = text.split("\n");
  const headingRegex = /^(#{2,3})\s*(Restricciones|Constraints)\b[:\-]*\s*(.*)$/i;
  let startIndex = -1;
  let level = 0;
  let inline = "";

  for (let i = 0; i < lines.length; i += 1) {
    const match = lines[i].match(headingRegex);
    if (match) {
      startIndex = i;
      level = match[1].length;
      inline = match[3] || "";
      break;
    }
  }

  if (startIndex === -1) {
    return { body: text, constraints: "" };
  }

  let endIndex = lines.length;
  for (let j = startIndex + 1; j < lines.length; j += 1) {
    const headingMatch = lines[j].match(/^(#{1,6})\s+/);
    if (headingMatch && headingMatch[1].length <= level) {
      endIndex = j;
      break;
    }
  }

  const constraintLines = [];
  if (inline.trim()) constraintLines.push(inline.trim());
  constraintLines.push(...lines.slice(startIndex + 1, endIndex));

  const constraints = constraintLines.join("\n").trim();
  const bodyLines = [...lines.slice(0, startIndex), ...lines.slice(endIndex)];
  const body = bodyLines.join("\n").trim();

  return { body, constraints };
}

function renderConstraintsSection(constraintsMd) {
  if (!constraintsMd) return "";
  const constraintsHtml = renderMarkdown(localizeStatementMarkdown(constraintsMd));
  if (!constraintsHtml) return "";
  return `
    <div>
      <h2 class="text-xs font-semibold text-zinc-400 uppercase tracking-wide mb-2">Restricciones</h2>
      <div class="prose-content text-sm">${constraintsHtml}</div>
    </div>
  `;
}

function localizeStatementMarkdown(md) {
  if (!md) return "";
  let text = String(md || "");

  text = text.replace(/^(#{1,6})\s*Description\b[:\-]*/gim, "$1 Descripción");
  text = text.replace(/^(#{1,6})\s*Examples?\b[:\-]*/gim, "$1 Ejemplos");
  text = text.replace(/^(#{1,6})\s*Constraints?\b[:\-]*/gim, "$1 Restricciones");

  text = text.replace(
    /Given a string containing only brackets, determine whether it is valid\./gi,
    "Dada una cadena que contiene solo corchetes, determina si es válida.",
  );

  return text;
}
