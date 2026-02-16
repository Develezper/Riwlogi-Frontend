import { stageBar } from "../components/stage-bar.js";
import { scorePanel } from "../components/score-panel.js";
import { api } from "../../../shared/services/api/index.js";
import { EditorTracker } from "../services/editor-tracker.js";
import { difficultyBadge, renderMarkdown, showToast, spinner } from "../../../shared/utils/ui-helpers.js";

export async function problemSolverView(container, { slug }) {
  const state = {
    problem: null,
    stages: [],
    activeStageIndex: 0,
    stageResults: {},
    language: "python",
    submissionId: null,
    tracker: null,
    editorView: null,
    editorCleanupFns: [],
    draftSaveTimer: null,
    isRunning: false,
    activePanel: "results",
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

    renderLayout(container, state);

    await startSubmission(state);
    if (disposed) return cleanup;

    await mountEditor(container, state, getInitialCodeForLanguage(state.problem, state.language));
    if (disposed) return cleanup;

    bindEvents(container, state);
    updatePanelVisibility(container, state);
    updateStageContent(container, state);
    updateStageBar(container, state);
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
  const statementHtml = renderMarkdown(state.problem.statement_md || "");
  const languageOptions = Object.keys(state.problem.starter_code || state.problem.starterCode || {});

  container.innerHTML = `
    <div class="h-[calc(100vh-3.5rem)] flex flex-col">
      <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 px-4 py-2 border-b border-zinc-800 bg-zinc-900/50">
        <div class="flex items-center gap-3">
          <a href="#/problems" class="text-zinc-500 hover:text-white transition" aria-label="Volver a problemas">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/></svg>
          </a>
          <h1 class="font-semibold text-white">${state.problem.title}</h1>
          <span class="px-2 py-0.5 rounded-full text-xs font-medium ${badge.class}">${badge.label}</span>
        </div>
        <div id="stage-bar-container" class="max-w-full"></div>
      </div>

      <div class="flex-1 flex flex-col lg:flex-row overflow-hidden">
        <section class="w-full lg:w-[42%] lg:border-r border-zinc-800 overflow-y-auto max-h-[38vh] lg:max-h-none">
          <div class="p-6">
            <div class="prose-content mb-6">${statementHtml}</div>

            <div id="stage-prompt" class="p-4 bg-zinc-800/50 rounded-lg border border-zinc-700 mb-4"></div>
            <div id="visible-tests"></div>
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
              <button id="btn-reset" class="px-3 py-1.5 rounded-md text-sm text-zinc-400 hover:text-white hover:bg-zinc-800 transition" title="Reiniciar código">
                Reset
              </button>
            </div>
            <div class="flex items-center gap-2">
              <button id="btn-run" class="px-4 py-1.5 rounded-md text-sm bg-zinc-700 text-white hover:bg-zinc-600 transition font-medium">
                Run
              </button>
              <button id="btn-submit" class="px-4 py-1.5 rounded-md text-sm bg-brand text-white hover:bg-brand-dark transition font-medium">
                Submit
              </button>
            </div>
          </div>

          <div id="code-editor" class="flex-1 overflow-hidden bg-zinc-950"></div>

          <div class="h-[38%] border-t border-zinc-800 flex flex-col min-h-[200px]">
            <div class="px-3 pt-2 border-b border-zinc-800 bg-zinc-900/60 flex items-center gap-2" role="tablist" aria-label="Panel de resultados y casos de prueba">
              <button id="tab-results" role="tab" aria-selected="true" aria-controls="results-panel" data-panel="results" class="px-3 py-1.5 text-xs rounded-t-md bg-zinc-800 text-zinc-200">Resultados</button>
              <button id="tab-cases" role="tab" aria-selected="false" aria-controls="cases-panel" data-panel="cases" class="px-3 py-1.5 text-xs rounded-t-md text-zinc-500 hover:text-zinc-300">Test Cases</button>
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
  const languageSelect = container.querySelector("#lang-select");
  const stageBarContainer = container.querySelector("#stage-bar-container");
  const tabResults = container.querySelector("#tab-results");
  const tabCases = container.querySelector("#tab-cases");

  const onRun = async () => {
    if (state.isRunning) return;
    const activeStage = getActiveStage(state);
    if (!activeStage) return;

    state.isRunning = true;
    setButtonsDisabled(container, true, "run");
    updateResultsPanel(container, state, null, true);
    state.tracker?.onRun("run");

    try {
      const code = getCurrentCode(container, state);
      saveDraft(state.problem.id, state.language, code);
      const result = await runStage(state, activeStage.id, code);

      state.stageResults[activeStage.id] = {
        passed: result.passed,
        result,
      };

      updateStageBar(container, state);
      updateResultsPanel(container, state, result, false);

      if (result.passed) {
        showToast(`Stage ${activeStage.stage_index} passed`, "success");
      } else {
        showToast(`Stage ${activeStage.stage_index} failed`, "error");
      }
    } catch (error) {
      showToast(error.message, "error");
      updateResultsPanel(container, state, null, false);
    } finally {
      state.isRunning = false;
      setButtonsDisabled(container, false);
    }
  };

  const onSubmit = async () => {
    if (state.isRunning) return;

    state.isRunning = true;
    setButtonsDisabled(container, true, "submit");
    updateResultsPanel(container, state, null, true);
    state.tracker?.onRun("submit");

    const selectedStage = state.activeStageIndex;

    try {
      const code = getCurrentCode(container, state);
      saveDraft(state.problem.id, state.language, code);
      let latestResult = null;

      for (let index = 0; index < state.stages.length; index += 1) {
        const stage = state.stages[index];
        state.tracker?.setStage(stage.id);
        latestResult = await runStage(state, stage.id, code);

        state.stageResults[stage.id] = {
          passed: latestResult.passed,
          result: latestResult,
        };

        updateStageBar(container, state);

        if (!latestResult.passed) break;
      }

      const final = await api.submissions.submit(state.submissionId);

      state.activeStageIndex = selectedStage;
      state.tracker?.setStage(getActiveStage(state)?.id);
      updateStageContent(container, state);
      updateResultsPanel(container, state, latestResult, false);

      if (final.verdict === "accepted") {
        clearDraft(state.problem.id, state.language);
        showToast(`Accepted. Score final: ${final.final_score}`, "success", 5000);
      } else {
        showToast(`Submission incompleta. Score final: ${final.final_score}`, "error", 5000);
      }
    } catch (error) {
      showToast(error.message, "error");
      updateResultsPanel(container, state, null, false);
    } finally {
      state.isRunning = false;
      setButtonsDisabled(container, false);
    }
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

    try {
      await startSubmission(state);
      await mountEditor(
        container,
        state,
        getInitialCodeForLanguage(state.problem, state.language),
      );
      updateStageBar(container, state);
      updateResultsPanel(container, state, null, false);
      showToast(`Lenguaje cambiado a ${languageLabel(state.language)}`, "info");
    } catch (error) {
      showToast(error.message, "error");
    }
  };

  const onStageClick = (event) => {
    const stageButton = event.target.closest("[data-stage-index]");
    if (!stageButton) return;

    const stageIndex = Number(stageButton.dataset.stageIndex) - 1;
    if (stageIndex < 0 || stageIndex >= state.stages.length) return;

    state.activeStageIndex = stageIndex;
    const stage = getActiveStage(state);
    state.tracker?.setStage(stage?.id);

    updateStageBar(container, state);
    updateStageContent(container, state);
    updateResultsPanel(container, state);
  };

  const onTabClick = (event) => {
    const panel = event.currentTarget.dataset.panel;
    state.activePanel = panel;
    updatePanelVisibility(container, state);
  };

  runButton?.addEventListener("click", onRun);
  submitButton?.addEventListener("click", onSubmit);
  resetButton?.addEventListener("click", onReset);
  languageSelect?.addEventListener("change", onLanguageChange);
  stageBarContainer?.addEventListener("click", onStageClick);
  tabResults?.addEventListener("click", onTabClick);
  tabCases?.addEventListener("click", onTabClick);

  state.cleanupFns.push(() => runButton?.removeEventListener("click", onRun));
  state.cleanupFns.push(() => submitButton?.removeEventListener("click", onSubmit));
  state.cleanupFns.push(() => resetButton?.removeEventListener("click", onReset));
  state.cleanupFns.push(() => languageSelect?.removeEventListener("change", onLanguageChange));
  state.cleanupFns.push(() => stageBarContainer?.removeEventListener("click", onStageClick));
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

function updateStageBar(container, state) {
  const stageContainer = container.querySelector("#stage-bar-container");
  if (!stageContainer) return;
  stageContainer.innerHTML = stageBar(state.stages, state.activeStageIndex + 1, state.stageResults);
}

function updateStageContent(container, state) {
  const stage = getActiveStage(state);
  if (!stage) return;

  const prompt = container.querySelector("#stage-prompt");
  const tests = container.querySelector("#visible-tests");

  if (prompt) {
    prompt.innerHTML = `
      <h4 class="text-sm font-semibold text-brand mb-2">Stage ${stage.stage_index}</h4>
      <div class="prose-content text-sm">${renderMarkdown(stage.prompt_md || "")}</div>
    `;
  }

  if (tests) {
    tests.innerHTML = renderVisibleTests(stage);
  }
}

function updateResultsPanel(container, state, explicitResult = null, isRunning = false) {
  const panel = container.querySelector("#results-panel");
  if (!panel) return;

  if (isRunning) {
    panel.innerHTML = scorePanel(null, true);
    return;
  }

  const stage = getActiveStage(state);
  const stageResult = stage ? state.stageResults[stage.id]?.result : null;
  panel.innerHTML = scorePanel(explicitResult || stageResult || null, false);
}

function updateCasesPanel(container, state) {
  const panel = container.querySelector("#cases-panel");
  if (!panel) return;

  panel.innerHTML = state.stages
    .map(
      (stage) => `
      <div class="mb-4 p-3 rounded-lg border border-zinc-800 bg-zinc-900/50">
        <h4 class="text-sm font-semibold text-zinc-200 mb-2">Stage ${stage.stage_index}</h4>

        ${(stage.visible_tests || [])
          .map(
            (test, index) => `
          <div class="mb-2 rounded-md border border-zinc-700 bg-zinc-800/40 p-3 text-xs font-mono">
            <p class="text-zinc-400">Input: <span class="text-zinc-200">${test.input_text}</span></p>
            <p class="text-zinc-400">Expected: <span class="text-green-400">${test.expected_text}</span></p>
            <p class="text-zinc-500 mt-1">Test visible ${index + 1}</p>
          </div>
        `,
          )
          .join("")}

        <p class="text-xs text-zinc-500">+ ${stage.hidden_count || 0} hidden tests</p>
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

  if (runButton) {
    runButton.disabled = disabled;
    runButton.textContent = disabled && mode === "run" ? "Running..." : "Run";
  }

  if (submitButton) {
    submitButton.disabled = disabled;
    submitButton.textContent = disabled && mode === "submit" ? "Submitting..." : "Submit";
  }
}

function getActiveStage(state) {
  return state.stages[state.activeStageIndex] || null;
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

function renderVisibleTests(stage) {
  if (!stage || !stage.visible_tests?.length) {
    return `<p class="text-sm text-zinc-500">No hay tests visibles para esta etapa.</p>`;
  }

  return `
    <h4 class="text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-2">Visible tests</h4>
    ${stage.visible_tests
      .map(
        (test, index) => `
      <div class="mb-3 p-3 bg-zinc-800/50 rounded-lg border border-zinc-700">
        <p class="text-xs font-semibold text-zinc-400 mb-1">Test ${index + 1}</p>
        <div class="text-xs font-mono">
          <p class="text-zinc-500">Input: <span class="text-zinc-300">${test.input_text}</span></p>
          <p class="text-zinc-500">Expected: <span class="text-green-400">${test.expected_text}</span></p>
        </div>
      </div>
    `,
      )
      .join("")}
    <p class="text-xs text-zinc-500">+ ${stage.hidden_count || 0} hidden tests</p>
  `;
}
