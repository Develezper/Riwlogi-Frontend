import { api } from "../../../shared/services/api/index.js";
import { showToast } from "../../../shared/utils/ui-helpers.js";
import { formButton, setLoadingButton } from "../utils/admin-utils.js";
import { handleStageEditorAction } from "../utils/stage-editor.js";
import {
  DEFAULT_BATCH_COUNT,
  MAX_BATCH_COUNT,
  MAX_UNIQUE_ATTEMPTS,
  clampInt,
} from "./admin-ai-generate/constants.js";
import { resolveDifficultyPlan } from "./admin-ai-generate/difficulty-plan.js";
import {
  detectDuplicateReason,
  ensureUniqueProblemTitle,
} from "./admin-ai-generate/duplicate-utils.js";
import {
  buildProblemDraftFromForm,
  buildUpdatePayloadFromProblem,
  goToProblemsCatalog,
  syncCurrentFormIntoState,
  upsertProblemInBatch,
} from "./admin-ai-generate/form-utils.js";
import {
  buildGenerationPrompt,
  detectPromptDifficultySignals,
  detectPromptExerciseCount,
  resolveStageInstruction,
} from "./admin-ai-generate/prompt-analysis.js";
import { renderEditPhase, renderPromptPhase } from "./admin-ai-generate/render.js";

function extractErrorText(error) {
  const message = String(error?.message || "").trim();
  const payload = error?.payload;
  if (!payload || typeof payload !== "object") return message;

  const payloadMessage = [payload.message, payload.detail, payload.error]
    .map((value) => String(value || "").trim())
    .filter(Boolean)
    .join(" ");

  return [message, payloadMessage].filter(Boolean).join(" ");
}

function isAiQuotaError(error) {
  const status = Number(error?.status || 0);
  if ([402, 429].includes(status)) return true;

  const text = extractErrorText(error).toLowerCase();
  if (!text) return false;

  return [
    "insufficient_quota",
    "quota",
    "rate limit",
    "too many requests",
    "credit",
    "billing",
    "api key",
    "key exhausted",
  ].some((hint) => text.includes(hint));
}

function resolveGenerationErrorMessage(error) {
  if (isAiQuotaError(error)) {
    return "La clave de IA se agotó o alcanzó su límite. Verifica cuota/facturación y vuelve a intentar.";
  }

  return String(error?.message || "").trim() || "Hubo un error durante la generación.";
}

function sanitizeGeneratedTitle(rawTitle, fallbackTitle) {
  const sourceTitle = String(rawTitle || fallbackTitle || "").trim();
  if (!sourceTitle) return String(fallbackTitle || "Ejercicio").trim();

  // Strip leading counters like "5 " leaked from "5 ejercicios" prompts.
  const cleaned = sourceTitle.replace(/^\d+\s+/, "").replace(/\s+/g, " ").trim();
  return cleaned || String(fallbackTitle || "Ejercicio").trim();
}

function sanitizeGeneratedStatement(rawStatement) {
  const statement = String(rawStatement || "");
  if (!statement.trim()) return statement;

  const marker = "Instrucciones internas para esta generación:";
  const markerIndex = statement.indexOf(marker);
  if (markerIndex < 0) return statement.trim();

  const beforeMarker = statement.slice(0, markerIndex).trim();
  const notesIndex = statement.indexOf("## Notes", markerIndex);
  const notesBlock = notesIndex >= 0 ? statement.slice(notesIndex).trim() : "";

  return [beforeMarker, notesBlock].filter(Boolean).join("\n\n").trim();
}

function normalizeGeneratedProblem(problem, options = {}) {
  const safeProblem = problem && typeof problem === "object" ? problem : {};
  const fallbackTitle = String(options.fallbackTitle || "Ejercicio").trim() || "Ejercicio";
  const targetDifficulty = Number(options.targetDifficulty || 0);

  const normalized = {
    ...safeProblem,
    title: sanitizeGeneratedTitle(safeProblem.title, fallbackTitle),
    statement_md: sanitizeGeneratedStatement(safeProblem.statement_md),
  };

  if ([1, 2, 3].includes(targetDifficulty)) {
    normalized.difficulty = targetDifficulty;
  }

  return normalized;
}

function hasPlaceholderVisibleTests(problem) {
  const firstStage = Array.isArray(problem?.stages) ? problem.stages[0] : null;
  const tests = Array.isArray(firstStage?.visible_tests) ? firstStage.visible_tests : [];
  if (!tests.length) return true;

  return tests.some((test) => {
    const inputText = String(test?.input_text || "").toLowerCase();
    const expectedText = String(test?.expected_text || "").toLowerCase();
    return (
      inputText.includes("example_input") ||
      expectedText.includes("example_output") ||
      (!inputText.trim() && !expectedText.trim())
    );
  });
}

function detectLowQualityReason(problem) {
  const title = String(problem?.title || "").trim();
  const statement = String(problem?.statement_md || "").trim();

  if (!title || title.length < 6) {
    return "titulo invalido";
  }

  if (!statement || statement.length < 120) {
    return "enunciado insuficiente";
  }

  const compactStatement = statement.toLowerCase();
  const compactTitle = title.toLowerCase();
  if (compactStatement === compactTitle || compactStatement.includes("## description\n\n" + compactTitle)) {
    return "enunciado generico";
  }

  if (hasPlaceholderVisibleTests(problem)) {
    return "tests de ejemplo";
  }

  return null;
}

export async function adminAiGenerateView(container) {
  const state = {
    phase: "prompt",
    error: null,
    lastPrompt: "",
    batchCount: DEFAULT_BATCH_COUNT,
    generatedProblem: null,
    generatedBatch: [],
    savedProblemId: null,
    isGenerating: false,
    generationCurrent: 0,
    generationTotal: 0,
    generationMessage: "",
  };

  let isMounted = true;

  function render() {
    if (state.phase === "edit" && state.generatedProblem) {
      renderEditPhase(container, state);
    } else {
      renderPromptPhase(container, state);
    }
  }

  render();

  const onSubmit = async (event) => {
    const form = event.target;
    if (!form || form.tagName !== "FORM") return;

    if (form.id === "generate-ai-form") {
      if (state.isGenerating) return;
      event.preventDefault();
      state.error = null;
      const createdProblems = [];

      try {
        const formData = new FormData(form);
        const prompt = String(formData.get("prompt") || "").trim();
        if (prompt.length < 10) throw new Error("El prompt debe tener al menos 10 caracteres.");

        const adminBatchCount = clampInt(formData.get("batch_count"), DEFAULT_BATCH_COUNT, 1, MAX_BATCH_COUNT);
        const promptBatchCount = detectPromptExerciseCount(prompt);
        const batchCount = promptBatchCount ?? adminBatchCount;
        const difficultySignals = detectPromptDifficultySignals(prompt);
        const difficultyPlan = resolveDifficultyPlan(batchCount, difficultySignals);
        const stageInstruction = resolveStageInstruction();

        state.lastPrompt = prompt;
        state.batchCount = batchCount;
        state.isGenerating = true;
        state.generationCurrent = 0;
        state.generationTotal = batchCount;
        state.generationMessage = "Analizando prompt y preparando generación…";
        render();

        for (let index = 0; index < batchCount; index += 1) {
          const difficulty = Array.isArray(difficultyPlan) ? difficultyPlan[index] || 2 : null;
          let created = null;
          let lastDuplicateReason = null;

          for (let attempt = 1; attempt <= MAX_UNIQUE_ATTEMPTS; attempt += 1) {
            const composedPrompt = buildGenerationPrompt({
              basePrompt: prompt,
              batchIndex: index,
              batchCount,
              difficulty,
              difficultyFromPrompt: difficultySignals.hasDifficultyHint,
              stageInstruction,
              existingProblems: createdProblems,
              attempt,
            });

            state.generationCurrent = index;
            state.generationMessage =
              attempt === 1
                ? `Generando ejercicio ${index + 1} de ${batchCount}…`
                : `Reintentando ejercicio ${index + 1} (intento ${attempt}/${MAX_UNIQUE_ATTEMPTS})…`;
            render();

            const candidate = await api.admin.generateProblem({ prompt: composedPrompt });
            const normalizedCandidate = normalizeGeneratedProblem(candidate, {
              fallbackTitle: `Ejercicio ${index + 1}`,
              targetDifficulty: difficulty,
            });

            const duplicateReason = detectDuplicateReason(normalizedCandidate, createdProblems);
            if (!duplicateReason) {
              const lowQualityReason = detectLowQualityReason(normalizedCandidate);
              if (lowQualityReason) {
                lastDuplicateReason = lowQualityReason;
                continue;
              }

              created = normalizedCandidate;
              break;
            }

            if (duplicateReason === "titulo") {
              const renamedCandidate = ensureUniqueProblemTitle(normalizedCandidate, createdProblems, {
                fallbackBaseTitle: `Ejercicio ${index + 1}`,
              });
              if (renamedCandidate) {
                created = renamedCandidate;
                break;
              }
            }

            lastDuplicateReason = duplicateReason;
          }

          if (!created) {
            const repeatedReasons = new Set(["titulo", "enunciado"]);
            const reasonText = lastDuplicateReason
              ? repeatedReasons.has(lastDuplicateReason)
                ? ` (${lastDuplicateReason} repetido)`
                : ` (${lastDuplicateReason})`
              : "";
            throw new Error(
              `No se pudo generar un ejercicio único para la posición ${index + 1}${reasonText}. Intenta ajustar el prompt.`,
            );
          }

          createdProblems.push(created);

          state.generationCurrent = index + 1;
          state.generationMessage = `Ejercicio ${index + 1} generado correctamente.`;
          render();
        }

        if (!isMounted) return;
        if (!createdProblems.length) {
          throw new Error("No se pudo generar ningún ejercicio.");
        }

        state.isGenerating = false;
        state.generationCurrent = 0;
        state.generationTotal = 0;
        state.generationMessage = "";
        state.generatedBatch = createdProblems;
        state.generatedProblem = createdProblems[0];
        state.phase = "edit";
        state.savedProblemId = null;
        render();

        if (batchCount > 1) {
          showToast(`${batchCount} ejercicios generados. Selecciona uno para editar.`, "success");
        } else {
          showToast("Ejercicio generado. Revisa los datos y guarda.", "success");
        }
      } catch (error) {
        if (!isMounted) return;

        const resolvedErrorMessage = resolveGenerationErrorMessage(error);

        state.isGenerating = false;
        state.generationCurrent = 0;
        state.generationTotal = 0;
        state.generationMessage = "";
        if (createdProblems.length > 0) {
          state.generatedBatch = createdProblems;
          state.generatedProblem = createdProblems[0];
          state.phase = "edit";
          state.savedProblemId = null;
          state.error = `${resolvedErrorMessage} Se generaron ${createdProblems.length} ejercicio(s).`;
          render();
          showToast("Generación parcial completada. Revisa los ejercicios creados.", "error");
        } else {
          state.error = resolvedErrorMessage;
          render();
        }
      }
      return;
    }

    if (form.id === "edit-problem-form") {
      event.preventDefault();
      const releaseButton = setLoadingButton(formButton(form), "Guardando…");
      state.error = null;
      try {
        const draft = buildProblemDraftFromForm(form, state.generatedProblem);
        const problemId = String(draft.id || "").trim();
        if (!problemId) throw new Error("ID de problema no encontrado.");

        const lastPrompt = state.lastPrompt || state.generatedProblem?.last_generated_prompt || "";
        const payload = buildUpdatePayloadFromProblem(draft, { lastPrompt });

        const updated = await api.admin.updateProblem(problemId, payload);
        if (!isMounted) return;

        state.generatedProblem = updated;
        state.generatedBatch = upsertProblemInBatch(state.generatedBatch, updated);
        state.savedProblemId = updated?.id || problemId;

        showToast("Ejercicio guardado. Redirigiendo al catálogo…", "success");
        goToProblemsCatalog();
      } catch (error) {
        if (!isMounted) return;
        state.error = error?.message || "No se pudo guardar el ejercicio.";
        render();
      } finally {
        releaseButton();
      }
    }
  };

  const onClick = async (event) => {
    if (handleStageEditorAction(event)) {
      state.error = null;
      return;
    }

    const trigger = event.target.closest("[data-action]");
    if (!trigger || !container.contains(trigger)) return;
    if (state.isGenerating) return;

    const action = trigger.dataset.action;

    if (action === "back-to-prompt") {
      state.phase = "prompt";
      state.error = null;
      state.generatedProblem = null;
      state.generatedBatch = [];
      state.savedProblemId = null;
      render();
      return;
    }

    if (action === "save-all-draft" || action === "save-all-published") {
      const targetStatus = action === "save-all-published" ? "published" : "draft";
      const loadingLabel =
        targetStatus === "published" ? "Publicando lote…" : "Guardando lote…";
      const releaseButton = setLoadingButton(trigger, loadingLabel);
      state.error = null;

      try {
        syncCurrentFormIntoState(state, container);

        const batch = Array.isArray(state.generatedBatch) ? state.generatedBatch : [];
        if (!batch.length) {
          throw new Error("No hay ejercicios generados para guardar.");
        }

        const updatedBatch = [];
        let failedCount = 0;
        let firstError = "";

        for (const problem of batch) {
          try {
            const payload = buildUpdatePayloadFromProblem(problem, {
              status: targetStatus,
              lastPrompt: state.lastPrompt || problem.last_generated_prompt || "",
            });
            const updated = await api.admin.updateProblem(problem.id, payload);
            updatedBatch.push(updated);
          } catch (error) {
            failedCount += 1;
            if (!firstError) {
              firstError = error?.message || "Error desconocido al guardar.";
            }
            updatedBatch.push(problem);
          }
        }

        if (!isMounted) return;

        state.generatedBatch = updatedBatch;
        const activeId = state.generatedProblem?.id;
        state.generatedProblem =
          updatedBatch.find((problem) => problem.id === activeId) || updatedBatch[0] || null;
        state.savedProblemId = state.generatedProblem?.id || null;

        const successCount = updatedBatch.length - failedCount;
        if (failedCount === 0) {
          showToast(
            targetStatus === "published"
              ? `Se publicaron ${successCount} ejercicios. Redirigiendo al catálogo…`
              : `Se guardaron ${successCount} ejercicios como borrador. Redirigiendo al catálogo…`,
            "success",
          );
          goToProblemsCatalog();
        } else {
          state.error = `Guardado parcial: ${successCount} exitosos, ${failedCount} con error. ${firstError}`;
          showToast("Guardado parcial del lote. Revisa los errores.", "error");
          render();
        }
      } catch (error) {
        if (!isMounted) return;
        state.error = error?.message || "No se pudo guardar el lote.";
        render();
      } finally {
        releaseButton();
      }
      return;
    }

    if (action === "select-generated") {
      const problemId = String(trigger.dataset.problemId || "").trim();
      if (!problemId) return;
      try {
        syncCurrentFormIntoState(state, container);
      } catch (error) {
        state.error = error?.message || "Corrige el formulario actual antes de cambiar.";
        render();
        return;
      }
      const selected = (state.generatedBatch || []).find((problem) => problem.id === problemId);
      if (!selected) return;

      state.generatedProblem = selected;
      state.savedProblemId = null;
      state.error = null;
      state.phase = "edit";
      render();
    }
  };

  container.addEventListener("submit", onSubmit);
  container.addEventListener("click", onClick);

  return () => {
    isMounted = false;
    container.removeEventListener("submit", onSubmit);
    container.removeEventListener("click", onClick);
  };
}
