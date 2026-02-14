// Problem View (editor + solver)

import { stageBar } from "../components/stage-bar.js";
import { scorePanel } from "../components/score-panel.js";
import { spinner, showToast, difficultyBadge, renderMarkdown } from "../utils/helpers.js";

let editorView = null;
let tracker = null;
let submissionId = null;

export async function problemView(container, { slug }) {
  container.innerHTML = spinner("lg");

  try {
    const problem = await api.problems.get(slug);
    renderProblem(container, problem);
  } catch (err) {
    container.innerHTML = `
      <div class="flex items-center justify-center h-[60vh]">
        <div class="text-center text-zinc-500">
          <p class="text-lg mb-2">Error al cargar problema</p>
          <p class="text-sm">${err.message}</p>
        </div>
      </div>
    `;
  }
}

function renderProblem(container, problem) {
  const badge = difficultyBadge(problem.difficulty);
  const stages = problem.stages || [];
  const currentStage = stages[0] || null;

  // State
  let activeStageIdx = 0;
  let stageResults = {};
  let lastResult = null;
  let isRunning = false;

  const statementHtml = renderMarkdown(problem.statement_md || "");

  container.innerHTML = /* html */`
    <div class="h-[calc(100vh-3.5rem)] flex flex-col">
      <!-- Header -->
      <div class="flex items-center justify-between px-4 py-2 border-b border-zinc-800 bg-zinc-900/50">
        <div class="flex items-center gap-3">
          <a href="#/problems" class="text-zinc-500 hover:text-white transition">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/></svg>
          </a>
          <h1 class="font-semibold text-white">${problem.title}</h1>
          <span class="px-2 py-0.5 rounded-full text-xs font-medium ${badge.class}">${badge.label}</span>
        </div>
        <div id="stage-bar-container"></div>
      </div>

      <!-- Main Layout -->
      <div class="flex-1 flex overflow-hidden">
        <!-- Left: Statement -->
        <div class="w-[40%] border-r border-zinc-800 overflow-y-auto">
          <div class="p-6">
            <!-- Problem Statement -->
            <div class="prose-content mb-6">
              ${statementHtml}
            </div>

            <!-- Stage Prompt -->
            <div id="stage-prompt" class="p-4 bg-zinc-800/50 rounded-lg border border-zinc-700 mb-4">
              <h4 class="text-sm font-semibold text-brand mb-2">Stage ${currentStage?.stage_index || 1}</h4>
              <div class="prose-content text-sm">
                ${currentStage ? renderMarkdown(currentStage.prompt_md) : ""}
              </div>
            </div>

            <!-- Visible Tests -->
            <div id="visible-tests">
              ${renderVisibleTests(currentStage)}
            </div>
          </div>
        </div>

        <!-- Right: Editor + Results -->
        <div class="flex-1 flex flex-col">
          <!-- Editor Header -->
          <div class="flex items-center justify-between px-4 py-2 border-b border-zinc-800 bg-zinc-900/50">
            <div class="flex items-center gap-2">
              <select id="lang-select" class="bg-zinc-800 text-zinc-300 text-sm px-2 py-1 rounded border border-zinc-700">
                <option value="python" selected>Python</option>
                <option value="javascript">JavaScript</option>
              </select>
            </div>
            <div class="flex items-center gap-2">
              <button id="btn-reset" class="px-3 py-1.5 rounded-md text-sm text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
                      title="Reiniciar código">
                ↻ Reset
              </button>
              <button id="btn-run" class="px-4 py-1.5 rounded-md text-sm bg-zinc-700 text-white hover:bg-zinc-600 transition font-medium">
                ▶ Run
              </button>
              <button id="btn-submit" class="px-4 py-1.5 rounded-md text-sm bg-brand text-white hover:bg-brand-dark transition font-medium">
                ✓ Submit
              </button>
            </div>
          </div>

          <!-- Code Editor -->
          <div id="code-editor" class="flex-1 overflow-hidden bg-zinc-950"></div>

          <!-- Results Panel -->
          <div id="results-panel" class="h-[35%] overflow-y-auto border-t border-zinc-800 p-3">
            ${scorePanel()}
          </div>
        </div>
      </div>
    </div>
  `;

  // Inicializar editor
  initEditor(container, problem, stages, activeStageIdx);

  // Stage bar
  updateStageBar(container, stages, activeStageIdx + 1, stageResults);

  //  Event Handlers 

  // Run
  container.querySelector("#btn-run").addEventListener("click", async () => {
    if (isRunning) return;
    isRunning = true;
    updateResults(container, null, true);
    tracker.onRun("run");

    try {
      const code = editorView.state.doc.toString();
      const stage = stages[activeStageIdx];
      const events = tracker.flush();

      const result = await api.submissions.run({
        submission_id: submissionId,
        stage_id: stage.id,
        code,
        events,
      });

      lastResult = result;
      stageResults[stage.id] = { passed: result.passed };
      updateStageBar(container, stages, activeStageIdx + 1, stageResults);
      updateResults(container, result, false);

      if (result.passed) {
        showToast(`Stage ${stage.stage_index} passed! Score: ${result.stage_score}`, "success");
      }
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      isRunning = false;
    }
  });

  // Submit
  container.querySelector("#btn-submit").addEventListener("click", async () => {
    if (isRunning) return;

    // Ejecutar todas las etapas
    isRunning = true;
    updateResults(container, null, true);
    tracker.onRun("submit");

    try {
      // Ejecutar stage actual primero
      const code = editorView.state.doc.toString();
      const stage = stages[activeStageIdx];
      const events = tracker.flush();

      const result = await api.submissions.run({
        submission_id: submissionId,
        stage_id: stage.id,
        code,
        events,
      });

      stageResults[stage.id] = { passed: result.passed };

      // Finalizar submission
      const final = await api.submissions.submit(submissionId);

      updateStageBar(container, stages, activeStageIdx + 1, stageResults);
      updateResults(container, result, false);

      showToast(
        `${final.verdict === "accepted" ? "✅ Accepted" : "❌ " + final.verdict} — Score: ${final.final_score}`,
        final.verdict === "accepted" ? "success" : "error",
        5000
      );
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      isRunning = false;
    }
  });

  // Reset
  container.querySelector("#btn-reset").addEventListener("click", () => {
    if (editorView) {
      editorView.dispatch({
        changes: {
          from: 0,
          to: editorView.state.doc.length,
          insert: getStarterCode("python"),
        },
      });
    }
  });

  // Stage click navigation
  container.addEventListener("click", (e) => {
    const dot = e.target.closest("[data-stage-index]");
    if (!dot) return;
    const idx = parseInt(dot.dataset.stageIndex) - 1;
    if (idx >= 0 && idx < stages.length) {
      activeStageIdx = idx;
      updateStageView(container, stages, activeStageIdx, stageResults);
      tracker.setStage(stages[activeStageIdx].id);
    }
  });
}


// Inicializa CodeMirror y el tracker
async function initEditor(container, problem, stages, stageIdx) {
  const editorEl = container.querySelector("#code-editor");

  // Iniciar submission
  try {
    const sub = await api.submissions.start(problem.id, "python");
    submissionId = sub.submission_id;
  } catch {
    submissionId = Date.now(); // fallback local
  }

  // Tracker
  tracker = new EditorTracker(submissionId, stages[stageIdx]?.id);
  tracker.onFlush(async (events) => {
    try {
      await api.submissions.sendEvents(submissionId, events);
    } catch {
    // silently fail 
    }
  });

  // CodeMirror
  try {
    const { EditorView, basicSetup } = await import("codemirror");
    const { python } = await import("@codemirror/lang-python");
    const { oneDark } = await import("@codemirror/theme-one-dark");
    const { EditorState } = await import("@codemirror/state");
    const { ViewPlugin } = await import("@codemirror/view");

    // Plugin para tracking
    const trackPlugin = ViewPlugin.define((view) => ({
      update(update) {
        if (!update.docChanged) return;
        for (const tr of update.transactions) {
          tr.changes.iterChanges((fromA, toA, fromB, toB, inserted) => {
            const deletedLen = toA - fromA;
            const insertedLen = inserted.length;

            if (deletedLen > 0 && insertedLen > 0) {
              // Replace — check if paste
              if (insertedLen > 10) {
                tracker.onPaste(insertedLen);
              } else {
                tracker.onKey(insertedLen);
              }
              if (deletedLen > 5) tracker.onDelete(deletedLen);
            } else if (deletedLen > 0) {
              tracker.onDelete(deletedLen);
            } else if (insertedLen > 0) {
              if (insertedLen > 10) {
                tracker.onPaste(insertedLen);
              } else {
                tracker.onKey(insertedLen);
              }
            }
          });
        }
      },
    }));

    const state = EditorState.create({
      doc: getStarterCode("python"),
      extensions: [basicSetup, python(), oneDark, trackPlugin],
    });

    editorView = new EditorView({ state, parent: editorEl });

    // Focus tracking
    editorEl.addEventListener("focusin", () => tracker.onFocusChange(true));
    editorEl.addEventListener("focusout", () => tracker.onFocusChange(false));
  } catch (err) {
    // Fallback: textarea si CodeMirror falla
    editorEl.innerHTML = `
      <textarea id="code-textarea"
        class="w-full h-full bg-zinc-950 text-zinc-100 font-mono text-sm p-4 resize-none outline-none border-none"
        spellcheck="false">${getStarterCode("python")}</textarea>
    `;
    console.warn("CodeMirror no disponible, usando textarea:", err);
  }
}

function getStarterCode(lang) {
  if (lang === "python") {
    return `# Escribe tu solución aquí
def solution():
    pass

solution()
`;
  }
  return `// Escribe tu solución aquí
function solution() {

}

solution();
`;
}

function renderVisibleTests(stage) {
  if (!stage || !stage.visible_tests?.length) return "";

  return stage.visible_tests
    .map(
      (tc, i) => `
    <div class="mb-3 p-3 bg-zinc-800/50 rounded-lg border border-zinc-700">
      <p class="text-xs font-semibold text-zinc-400 mb-1">Test ${i + 1}</p>
      <div class="text-xs font-mono">
        <p class="text-zinc-500">Input: <span class="text-zinc-300">${tc.input_text}</span></p>
        <p class="text-zinc-500">Expected: <span class="text-green-400">${tc.expected_text}</span></p>
      </div>
    </div>
  `
    )
    .join("");
}

function updateStageBar(container, stages, current, results) {
  const barContainer = container.querySelector("#stage-bar-container");
  if (barContainer) {
    barContainer.innerHTML = stageBar(stages, current, results);
  }
}

function updateResults(container, result, isRunning) {
  const panel = container.querySelector("#results-panel");
  if (panel) {
    panel.innerHTML = scorePanel(result, isRunning);
  }
}

function updateStageView(container, stages, idx, results) {
  const stage = stages[idx];
  if (!stage) return;

  updateStageBar(container, stages, idx + 1, results);

  const prompt = container.querySelector("#stage-prompt");
  if (prompt) {
    prompt.innerHTML = `
      <h4 class="text-sm font-semibold text-brand mb-2">Stage ${stage.stage_index}</h4>
      <div class="prose-content text-sm">${renderMarkdown(stage.prompt_md)}</div>
    `;
  }

  const tests = container.querySelector("#visible-tests");
  if (tests) {
    tests.innerHTML = renderVisibleTests(stage);
  }
}
