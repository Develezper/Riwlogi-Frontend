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

function normalizeHiddenTests(rawTests) {
  const tests = Array.isArray(rawTests) ? rawTests : [];
  return tests
    .map((test) => ({
      input_text: String(test?.input_text || "").trim(),
      expected_text: String(test?.expected_text || "").trim(),
    }))
    .filter((test) => test.input_text && test.expected_text);
}

function normalizeSingleStage(rawStages) {
  const stages = Array.isArray(rawStages) ? rawStages : [];
  const stage = stages[0] || {};
  const tests = normalizeVisibleTests(stage.visible_tests);
  const hiddenTests = normalizeHiddenTests(stage.hidden_tests);

  return {
    stage_index: 1,
    prompt_md: String(stage.prompt_md || ""),
    hidden_count: Math.max(toNonNegativeInt(stage.hidden_count, 0), hiddenTests.length),
    visible_tests: tests.length ? tests : [{ input_text: "", expected_text: "" }],
    hidden_tests: hiddenTests,
  };
}

function emptyTest() {
  return { input_text: "", expected_text: "" };
}

function buildTestRowHtml(test, testNumber, options = {}) {
  const type = String(options.type || "visible");
  const title = type === "hidden" ? "Test oculto" : "Test visible";
  const inputText = escapeHtml(String(test?.input_text || ""));
  const expectedText = escapeHtml(String(test?.expected_text || ""));

  return `
    <div data-stage-test data-test-type="${type}" class="rounded-lg border border-zinc-800 bg-zinc-950/50 p-3 space-y-2">
      <div class="flex items-center justify-between gap-2">
        <span class="text-[11px] text-zinc-500">${title} <span data-test-number>${testNumber}</span></span>
        <button
          type="button"
          data-stage-action="remove-test"
          data-remove-type="${type}"
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
  const hiddenTests = normalizeHiddenTests(stage?.hidden_tests);
  const hiddenCount = Math.max(toNonNegativeInt(stage?.hidden_count, 0), hiddenTests.length);
  const visibleTests = normalizeVisibleTests(stage?.visible_tests);
  const safeVisibleTests = visibleTests.length ? visibleTests : [emptyTest()];
  const safeHiddenTests = hiddenTests;

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
            data-add-type="visible"
            class="px-3 py-1.5 rounded-lg border border-zinc-700 text-zinc-300 hover:bg-zinc-800 transition text-xs">
            + Agregar test visible
          </button>
        </div>
        <div data-stage-tests="visible" class="space-y-2">
          ${safeVisibleTests
            .map((test, testIndex) => buildTestRowHtml(test, testIndex + 1, { type: "visible" }))
            .join("")}
        </div>
      </div>

      <div class="space-y-2">
        <div class="flex items-center justify-between gap-2">
          <p class="text-xs text-zinc-400">Tests ocultos (solo admin)</p>
          <button
            type="button"
            data-stage-action="add-test"
            data-add-type="hidden"
            class="px-3 py-1.5 rounded-lg border border-zinc-700 text-zinc-300 hover:bg-zinc-800 transition text-xs">
            + Agregar test oculto
          </button>
        </div>
        <div data-stage-tests="hidden" class="space-y-2">
          ${safeHiddenTests
            .map((test, testIndex) => buildTestRowHtml(test, testIndex + 1, { type: "hidden" }))
            .join("")}
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

  const jsonField = editorRoot.querySelector("[data-stage-json]");
  let preservedHiddenTests = [];
  try {
    const parsed = JSON.parse(String(jsonField?.value || "[]"));
    preservedHiddenTests = normalizeHiddenTests(parsed?.[0]?.hidden_tests);
  } catch {
    preservedHiddenTests = [];
  }

  const promptField = stageCard.querySelector('[data-stage-field="prompt_md"]');
  const hiddenField = stageCard.querySelector('[data-stage-field="hidden_count"]');
  const visibleTests = Array.from(
    stageCard.querySelectorAll('[data-stage-test][data-test-type="visible"]'),
  )
    .map((testCard) => {
      const inputField = testCard.querySelector('[data-test-field="input_text"]');
      const expectedField = testCard.querySelector('[data-test-field="expected_text"]');
      return {
        input_text: String(inputField?.value || "").trim(),
        expected_text: String(expectedField?.value || "").trim(),
      };
    })
    .filter((test) => test.input_text && test.expected_text);

  const hiddenTestsFromEditor = Array.from(
    stageCard.querySelectorAll('[data-stage-test][data-test-type="hidden"]'),
  )
    .map((testCard) => {
      const inputField = testCard.querySelector('[data-test-field="input_text"]');
      const expectedField = testCard.querySelector('[data-test-field="expected_text"]');
      return {
        input_text: String(inputField?.value || "").trim(),
        expected_text: String(expectedField?.value || "").trim(),
      };
    })
    .filter((test) => test.input_text && test.expected_text);

  const hiddenTests = hiddenTestsFromEditor.length ? hiddenTestsFromEditor : preservedHiddenTests;

  return {
    stage_index: 1,
    prompt_md: String(promptField?.value || "").trim(),
    hidden_count: Math.max(toNonNegativeInt(hiddenField?.value, 0), hiddenTests.length),
    visible_tests: visibleTests,
    hidden_tests: hiddenTests,
  };
}

function refreshTestNumbers(editorRoot) {
  const tests = Array.from(
    editorRoot.querySelectorAll('[data-stage-test][data-test-type="visible"]'),
  );
  tests.forEach((testCard, testIndex) => {
    const testNumber = testCard.querySelector("[data-test-number]");
    if (testNumber) testNumber.textContent = String(testIndex + 1);
  });

  const hiddenTests = Array.from(
    editorRoot.querySelectorAll('[data-stage-test][data-test-type="hidden"]'),
  );
  hiddenTests.forEach((testCard, testIndex) => {
    const testNumber = testCard.querySelector("[data-test-number]");
    if (testNumber) testNumber.textContent = String(testIndex + 1);
  });
}

function syncHiddenCountFromRows(editorRoot) {
  const hiddenField = editorRoot.querySelector('[data-stage-field="hidden_count"]');
  if (!hiddenField) return;
  const hiddenTests = Array.from(
    editorRoot.querySelectorAll('[data-stage-test][data-test-type="hidden"]'),
  );
  hiddenField.value = String(hiddenTests.length);
}

function appendStageTest(stageCard, test = emptyTest(), type = "visible") {
  const testsContainer = stageCard?.querySelector(`[data-stage-tests="${type}"]`);
  if (!testsContainer) return;
  const testNumber = testsContainer.querySelectorAll("[data-stage-test]").length + 1;
  testsContainer.insertAdjacentHTML("beforeend", buildTestRowHtml(test, testNumber, { type }));
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
    const addType = String(trigger.dataset.addType || "visible");
    if (stageCard)
      appendStageTest(stageCard, emptyTest(), addType === "hidden" ? "hidden" : "visible");
  } else if (action === "remove-test") {
    const removeType = String(trigger.dataset.removeType || "visible");
    const testCard = trigger.closest("[data-stage-test]");
    if (testCard) {
      const testsContainer = testCard.parentElement;
      if (removeType === "visible") {
        const siblings =
          testsContainer?.querySelectorAll('[data-stage-test][data-test-type="visible"]') || [];
        if (siblings.length <= 1) {
          return true;
        }
      }
      testCard.remove();
    }
  } else {
    return false;
  }

  refreshTestNumbers(editorRoot);
  syncHiddenCountFromRows(editorRoot);
  const form = editorRoot.closest("form");
  syncStageEditorJsonField(form);
  return true;
}
