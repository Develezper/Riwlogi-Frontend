import { escapeHtml } from "../../../shared/utils/ui-helpers.js";
import { stageEditorJson } from "./admin-utils.js";

function toNonNegativeInt(value, fallback = 0) {
  const parsed = Number.parseInt(String(value ?? ""), 10);
  if (!Number.isFinite(parsed) || parsed < 0) return fallback;
  return parsed;
}

function normalizeVisibleTests(rawTests) {
  const tests = Array.isArray(rawTests) ? rawTests : [];
  return tests.map((test) => ({
    input_text: String(test?.input_text || ""),
    expected_text: String(test?.expected_text || ""),
  }));
}

function normalizeSingleStage(rawStages) {
  const stages = Array.isArray(rawStages) ? rawStages : [];
  const stage = stages[0] || {};
  const tests = normalizeVisibleTests(stage.visible_tests);

  return {
    stage_index: 1,
    prompt_md: String(stage.prompt_md || ""),
    hidden_count: toNonNegativeInt(stage.hidden_count, 0),
    visible_tests: tests.length ? tests : [{ input_text: "", expected_text: "" }],
  };
}

function emptyTest() {
  return { input_text: "", expected_text: "" };
}

function buildTestRowHtml(test, testNumber) {
  const inputText = escapeHtml(String(test?.input_text || ""));
  const expectedText = escapeHtml(String(test?.expected_text || ""));

  return `
    <div data-stage-test class="rounded-lg border border-zinc-800 bg-zinc-950/50 p-3 space-y-2">
      <div class="flex items-center justify-between gap-2">
        <span class="text-[11px] text-zinc-500">Test visible <span data-test-number>${testNumber}</span></span>
        <button
          type="button"
          data-stage-action="remove-test"
          class="px-2 py-1 rounded border border-zinc-700 text-zinc-300 hover:bg-zinc-800 transition text-[11px]">
          Quitar
        </button>
      </div>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <div>
          <label class="block text-[11px] text-zinc-500 mb-1">Entrada</label>
          <input
            type="text"
            data-test-field="input_text"
            value="${inputText}"
            class="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-xs text-zinc-100 focus:outline-none focus:border-brand transition" />
        </div>
        <div>
          <label class="block text-[11px] text-zinc-500 mb-1">Salida esperada</label>
          <input
            type="text"
            data-test-field="expected_text"
            value="${expectedText}"
            class="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-xs text-zinc-100 focus:outline-none focus:border-brand transition" />
        </div>
      </div>
    </div>
  `;
}

function buildStageCardHtml(stage) {
  const prompt = escapeHtml(String(stage?.prompt_md || ""));
  const hiddenCount = toNonNegativeInt(stage?.hidden_count, 0);
  const tests = normalizeVisibleTests(stage?.visible_tests);
  const safeTests = tests.length ? tests : [emptyTest()];

  return `
    <article data-stage-card class="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 space-y-3">
      <div class="flex items-center justify-between gap-3">
        <h3 class="text-sm font-semibold text-zinc-100">Etapa única</h3>
        <span class="text-[11px] text-zinc-500">stage_index: 1</span>
      </div>

      <div>
        <label class="block text-xs text-zinc-400 mb-1">Instrucción de la etapa</label>
        <textarea
          rows="4"
          data-stage-field="prompt_md"
          class="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-sm text-zinc-100 focus:outline-none focus:border-brand transition resize-y">${prompt}</textarea>
      </div>

      <div class="w-full sm:w-52">
        <label class="block text-xs text-zinc-400 mb-1">Cantidad de tests ocultos</label>
        <input
          type="number"
          min="0"
          data-stage-field="hidden_count"
          value="${hiddenCount}"
          class="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-sm text-zinc-100 focus:outline-none focus:border-brand transition" />
      </div>

      <div class="space-y-2">
        <div class="flex items-center justify-between gap-2">
          <p class="text-xs text-zinc-400">Tests visibles</p>
          <button
            type="button"
            data-stage-action="add-test"
            class="px-3 py-1.5 rounded-lg border border-zinc-700 text-zinc-300 hover:bg-zinc-800 transition text-xs">
            + Agregar test visible
          </button>
        </div>
        <div data-stage-tests class="space-y-2">
          ${safeTests.map((test, testIndex) => buildTestRowHtml(test, testIndex + 1)).join("")}
        </div>
      </div>
    </article>
  `;
}

function getEditorRoot(form) {
  if (!form || typeof form.querySelector !== "function") return null;
  return form.querySelector("[data-stage-editor]");
}

function getJsonField(form) {
  if (!form || typeof form.querySelector !== "function") return null;
  return form.querySelector("[data-stage-json]");
}

function readStageFromEditor(editorRoot) {
  if (!editorRoot) return normalizeSingleStage([]);
  const stageCard = editorRoot.querySelector("[data-stage-card]");
  if (!stageCard) return normalizeSingleStage([]);

  const promptField = stageCard.querySelector('[data-stage-field="prompt_md"]');
  const hiddenField = stageCard.querySelector('[data-stage-field="hidden_count"]');
  const tests = Array.from(stageCard.querySelectorAll("[data-stage-test]"))
    .map((testCard) => {
      const inputField = testCard.querySelector('[data-test-field="input_text"]');
      const expectedField = testCard.querySelector('[data-test-field="expected_text"]');
      return {
        input_text: String(inputField?.value || "").trim(),
        expected_text: String(expectedField?.value || "").trim(),
      };
    })
    .filter((test) => test.input_text && test.expected_text);

  return {
    stage_index: 1,
    prompt_md: String(promptField?.value || "").trim(),
    hidden_count: toNonNegativeInt(hiddenField?.value, 0),
    visible_tests: tests,
  };
}

function refreshTestNumbers(editorRoot) {
  const tests = Array.from(editorRoot.querySelectorAll("[data-stage-test]"));
  tests.forEach((testCard, testIndex) => {
    const testNumber = testCard.querySelector("[data-test-number]");
    if (testNumber) testNumber.textContent = String(testIndex + 1);
  });
}

function appendVisibleTest(stageCard, test = emptyTest()) {
  const testsContainer = stageCard?.querySelector("[data-stage-tests]");
  if (!testsContainer) return;
  const testNumber = testsContainer.querySelectorAll("[data-stage-test]").length + 1;
  testsContainer.insertAdjacentHTML("beforeend", buildTestRowHtml(test, testNumber));
}

export function buildStageEditorHtml(rawStages) {
  const stage = normalizeSingleStage(rawStages);
  const hiddenJson = escapeHtml(stageEditorJson({ stages: [stage] }));

  return `
    <div data-stage-editor class="space-y-3">
      <textarea name="stages_json" data-stage-json hidden>${hiddenJson}</textarea>
      ${buildStageCardHtml(stage)}
    </div>
  `;
}

export function syncStageEditorJsonField(form) {
  const editorRoot = getEditorRoot(form);
  const jsonField = getJsonField(form);
  if (!editorRoot || !jsonField) return;

  const stage = readStageFromEditor(editorRoot);
  jsonField.value = JSON.stringify([stage], null, 2);
}

export function handleStageEditorAction(event) {
  const trigger = event.target.closest("[data-stage-action]");
  if (!trigger) return false;

  const editorRoot = trigger.closest("[data-stage-editor]");
  if (!editorRoot) return false;

  const action = String(trigger.dataset.stageAction || "");
  if (!action) return false;

  event.preventDefault();

  if (action === "add-test") {
    const stageCard = editorRoot.querySelector("[data-stage-card]");
    if (stageCard) appendVisibleTest(stageCard, emptyTest());
  } else if (action === "remove-test") {
    const testCard = trigger.closest("[data-stage-test]");
    if (testCard) testCard.remove();
  } else {
    return false;
  }

  refreshTestNumbers(editorRoot);
  const form = editorRoot.closest("form");
  syncStageEditorJsonField(form);
  return true;
}
