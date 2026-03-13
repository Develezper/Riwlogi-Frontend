import {
  DEFAULT_BATCH_COUNT,
  MAX_BATCH_COUNT,
  MAX_UNIQUE_ATTEMPTS,
  MAX_UNIQUE_TITLE_REFERENCES,
  NUMBER_WORDS,
  clampInt,
} from "./constants.js";
import {
  isDigitToken,
  normalizeComparableText,
  startsWithTokenPrefix,
  tokenizeComparableText,
} from "./text-utils.js";

const CONNECTOR_TOKENS = new Set(["con", "de"]);
const EXERCISE_NOUNS = new Set([
  "ejercicio",
  "ejercicios",
  "ejercios",
  "ejercicos",
  "problema",
  "problemas",
  "reto",
  "retos",
  "challenge",
  "challenges",
]);
const STAGE_NOUNS = new Set(["etapa", "etapas", "etpas", "stage", "stages"]);
const EASY_TOKENS = new Set(["facil", "faciles", "easy"]);
const MEDIUM_TOKENS = new Set(["intermedio", "intermedios", "medio", "medios", "medium"]);
const ALL_TOKENS = new Set(["todo", "todos", "toda", "todas"]);

function parsePromptCountToken(token, fallback, min, max) {
  const clean = normalizeComparableText(token);
  if (!clean) return null;

  if (isDigitToken(clean, 2)) {
    return clampInt(clean, fallback, min, max);
  }

  const fromWords = NUMBER_WORDS[clean];
  if (!fromWords) return null;
  return clampInt(fromWords, fallback, min, max);
}

function parseCountFromIndex(tokens, index, fallback, min, max) {
  if (index < 0 || index >= tokens.length) return null;
  return parsePromptCountToken(tokens[index], fallback, min, max);
}

function detectCountBeforeNouns(tokens, nouns, fallback, min, max) {
  for (let index = 0; index < tokens.length; index += 1) {
    if (!nouns.has(tokens[index])) continue;

    const direct = parseCountFromIndex(tokens, index - 1, fallback, min, max);
    if (direct !== null) return direct;

    if (CONNECTOR_TOKENS.has(tokens[index - 1])) {
      const throughConnector = parseCountFromIndex(tokens, index - 2, fallback, min, max);
      if (throughConnector !== null) return throughConnector;
    }
  }

  return null;
}

export function detectPromptExerciseCount(prompt) {
  const tokens = tokenizeComparableText(prompt);
  if (!tokens.length) return null;

  return detectCountBeforeNouns(tokens, EXERCISE_NOUNS, DEFAULT_BATCH_COUNT, 1, MAX_BATCH_COUNT);
}

export function detectPromptStageCount(prompt) {
  const tokens = tokenizeComparableText(prompt);
  if (!tokens.length) return null;

  const fromBefore = detectCountBeforeNouns(tokens, STAGE_NOUNS, 3, 1, 20);
  if (fromBefore !== null) return fromBefore;

  for (let index = 0; index < tokens.length; index += 1) {
    if (!STAGE_NOUNS.has(tokens[index])) continue;

    const direct = parseCountFromIndex(tokens, index + 1, 3, 1, 20);
    if (direct !== null) return direct;

    if (CONNECTOR_TOKENS.has(tokens[index + 1])) {
      const throughConnector = parseCountFromIndex(tokens, index + 2, 3, 1, 20);
      if (throughConnector !== null) return throughConnector;
    }
  }

  return null;
}

function isHardToken(token) {
  return token === "hard" || startsWithTokenPrefix(token, "dific");
}

function detectDifficultyQuotaCount(tokens, difficultyMatchFn) {
  let total = 0;
  let hasAny = false;

  for (let index = 0; index < tokens.length; index += 1) {
    if (!difficultyMatchFn(tokens[index])) continue;

    let backward = parseCountFromIndex(tokens, index - 1, 1, 1, MAX_BATCH_COUNT);
    if (backward === null && CONNECTOR_TOKENS.has(tokens[index - 1])) {
      backward = parseCountFromIndex(tokens, index - 2, 1, 1, MAX_BATCH_COUNT);
    }

    if (backward !== null) {
      total += backward;
      hasAny = true;
    }

    let forward = parseCountFromIndex(tokens, index + 1, 1, 1, MAX_BATCH_COUNT);
    if (forward === null && CONNECTOR_TOKENS.has(tokens[index + 1])) {
      forward = parseCountFromIndex(tokens, index + 2, 1, 1, MAX_BATCH_COUNT);
    }

    if (forward !== null) {
      total += forward;
      hasAny = true;
    }
  }

  if (!hasAny) return null;
  return total;
}

function hasPairWithinDistance(tokens, leftMatcher, rightMatcher, maxDistance) {
  for (let index = 0; index < tokens.length; index += 1) {
    if (!leftMatcher(tokens[index])) continue;

    const start = Math.max(0, index - maxDistance);
    const end = Math.min(tokens.length - 1, index + maxDistance);
    for (let pointer = start; pointer <= end; pointer += 1) {
      if (rightMatcher(tokens[pointer])) return true;
    }
  }

  return false;
}

export function detectPromptDifficultySignals(prompt) {
  const tokens = tokenizeComparableText(prompt);
  if (!tokens.length) {
    return {
      forcedLevel: null,
      hasDifficultyHint: false,
      quotas: null,
    };
  }

  const hasEasy = tokens.some((token) => EASY_TOKENS.has(token));
  const hasMedium = tokens.some((token) => MEDIUM_TOKENS.has(token));
  const hasHard = tokens.some((token) => isHardToken(token));
  const hasDifficultyHint = hasEasy || hasMedium || hasHard;

  const easyQuota = detectDifficultyQuotaCount(tokens, (token) => EASY_TOKENS.has(token));
  const mediumQuota = detectDifficultyQuotaCount(tokens, (token) => MEDIUM_TOKENS.has(token));
  const hardQuota = detectDifficultyQuotaCount(tokens, (token) => isHardToken(token));

  const quotaEntries = [
    [1, easyQuota],
    [2, mediumQuota],
    [3, hardQuota],
  ].filter(([, value]) => Number.isFinite(value) && Number(value) > 0);

  if (quotaEntries.length > 0) {
    return {
      forcedLevel: null,
      hasDifficultyHint: true,
      quotas: Object.fromEntries(quotaEntries),
    };
  }

  const maxAllDistance = 4;
  const asksAllHard = hasPairWithinDistance(
    tokens,
    (token) => ALL_TOKENS.has(token),
    (token) => isHardToken(token),
    maxAllDistance,
  );
  const asksAllEasy = hasPairWithinDistance(
    tokens,
    (token) => ALL_TOKENS.has(token),
    (token) => EASY_TOKENS.has(token),
    maxAllDistance,
  );
  const asksAllMedium = hasPairWithinDistance(
    tokens,
    (token) => ALL_TOKENS.has(token),
    (token) => MEDIUM_TOKENS.has(token),
    maxAllDistance,
  );

  if (asksAllHard && !asksAllEasy && !asksAllMedium) {
    return { forcedLevel: 3, hasDifficultyHint: true, quotas: null };
  }

  if (asksAllEasy && !asksAllHard && !asksAllMedium) {
    return { forcedLevel: 1, hasDifficultyHint: true, quotas: null };
  }

  if (asksAllMedium && !asksAllHard && !asksAllEasy) {
    return { forcedLevel: 2, hasDifficultyHint: true, quotas: null };
  }

  if (hasHard && !hasEasy && !hasMedium) {
    return { forcedLevel: 3, hasDifficultyHint: true, quotas: null };
  }

  if (hasEasy && !hasHard && !hasMedium) {
    return { forcedLevel: 1, hasDifficultyHint: true, quotas: null };
  }

  if (hasMedium && !hasHard && !hasEasy) {
    return { forcedLevel: 2, hasDifficultyHint: true, quotas: null };
  }

  return {
    forcedLevel: null,
    hasDifficultyHint,
    quotas: null,
  };
}

function difficultyPromptLabel(level) {
  if (Number(level) === 1) return "Fácil";
  if (Number(level) === 3) return "Difícil";
  return "Intermedio";
}

function buildStageInstruction(stagesMode, customStageCount) {
  if (stagesMode === "custom") {
    return `Debes crear exactamente ${customStageCount} etapas.`;
  }
  return "Si no se especifican etapas, decide entre 2 o 3; en caso de duda usa 3.";
}

export function resolveStageInstruction(prompt, stagesMode, customStageCount) {
  const promptStageCount = detectPromptStageCount(prompt);
  if (promptStageCount !== null) {
    return "Respeta la cantidad de etapas indicada en el prompt base.";
  }

  return buildStageInstruction(stagesMode, customStageCount);
}

function buildUniquenessInstruction(existingProblems, attempt = 1) {
  const list = Array.isArray(existingProblems) ? existingProblems : [];
  const titles = list
    .map((problem) => String(problem?.title || "").trim())
    .filter(Boolean)
    .slice(-MAX_UNIQUE_TITLE_REFERENCES);

  const strongRetryInstruction =
    attempt > 1
      ? `\n- Reintento por duplicado (${attempt}/${MAX_UNIQUE_ATTEMPTS}): cambia enfoque, contexto y título para que sea claramente distinto.`
      : "";

  const titleGuard = titles.length
    ? `\n- No repitas ni variantes de estos títulos ya generados: ${titles.join(" | ")}.`
    : "";

  return (
    `\n- Debe ser único frente al lote en título, enunciado y enfoque de solución.` +
    `\n- Si el tema es el mismo, usa una mecánica distinta (objetivo, restricciones o estructura de datos).` +
    titleGuard +
    strongRetryInstruction
  );
}

export function buildGenerationPrompt({
  basePrompt,
  batchIndex,
  batchCount,
  difficulty,
  difficultyFromPrompt = false,
  stageInstruction,
  existingProblems = [],
  attempt = 1,
}) {
  const difficultyInstruction = difficulty
    ? `- Dificultad objetivo: ${difficultyPromptLabel(difficulty)} (${difficulty}).`
    : difficultyFromPrompt
      ? "- Respeta la dificultad indicada en el prompt base."
      : "- Dificultad objetivo: Intermedio (2).";
  const uniquenessInstruction = buildUniquenessInstruction(existingProblems, attempt);

  return `${basePrompt}\n\n` +
    `Instrucciones internas para esta generación:\n` +
    `- Genera un solo ejercicio (no una lista).\n` +
    `- Este es el ejercicio ${batchIndex + 1} de ${batchCount}.\n` +
    `${difficultyInstruction}\n` +
    `- ${stageInstruction}\n` +
    `${uniquenessInstruction}\n` +
    `- Las etapas deben ser consecutivas y cada una con stage_index, prompt_md, hidden_count y visible_tests.`;
}
