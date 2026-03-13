import { normalizeComparableText, tokenizeComparableText } from "./text-utils.js";

const SIGNATURE_STOP_WORDS = new Set([
  "example",
  "ejemplo",
  "input",
  "output",
  "entrada",
  "salida",
]);

function normalizeStatementSignature(statement) {
  const tokens = tokenizeComparableText(statement).filter((token) => !SIGNATURE_STOP_WORDS.has(token));
  return tokens.join(" ").slice(0, 280).trim();
}

function splitTitleSuffix(title) {
  const text = String(title || "").trim();
  if (!text) {
    return { baseTitle: "", numericSuffix: null };
  }

  const match = text.match(/^(.*)\((\d+)\)\s*$/);
  if (!match) {
    return { baseTitle: text, numericSuffix: null };
  }

  const baseTitle = String(match[1] || "").trim();
  const parsed = Number.parseInt(match[2], 10);
  return {
    baseTitle: baseTitle || text,
    numericSuffix: Number.isFinite(parsed) ? parsed : null,
  };
}

export function ensureUniqueProblemTitle(problem, existingProblems) {
  const list = Array.isArray(existingProblems) ? existingProblems : [];
  if (!problem || typeof problem !== "object") return problem;

  const originalTitle = String(problem.title || "").trim();
  if (!originalTitle) return problem;

  const { baseTitle } = splitTitleSuffix(originalTitle);
  const normalizedBase = normalizeComparableText(baseTitle);
  if (!normalizedBase) return problem;

  let maxSuffix = 1;
  let hasConflict = false;

  for (const existing of list) {
    const existingTitle = String(existing?.title || "").trim();
    if (!existingTitle) continue;

    const split = splitTitleSuffix(existingTitle);
    const normalizedExistingBase = normalizeComparableText(split.baseTitle);
    if (!normalizedExistingBase || normalizedExistingBase !== normalizedBase) continue;

    hasConflict = true;
    const detectedSuffix = split.numericSuffix && split.numericSuffix > 1 ? split.numericSuffix : 1;
    if (detectedSuffix > maxSuffix) {
      maxSuffix = detectedSuffix;
    }
  }

  if (!hasConflict) return problem;

  return {
    ...problem,
    title: `${baseTitle} (${maxSuffix + 1})`,
  };
}

export function detectDuplicateReason(problem, existingProblems) {
  const list = Array.isArray(existingProblems) ? existingProblems : [];
  if (!list.length) return null;

  const candidateTitle = normalizeComparableText(problem?.title);
  const candidateStatement = normalizeStatementSignature(problem?.statement_md);

  for (const existing of list) {
    const existingTitle = normalizeComparableText(existing?.title);
    const existingStatement = normalizeStatementSignature(existing?.statement_md);

    if (candidateTitle && existingTitle && candidateTitle === existingTitle) {
      return "titulo";
    }

    if (
      candidateStatement &&
      existingStatement &&
      candidateStatement.length >= 80 &&
      existingStatement.length >= 80 &&
      candidateStatement === existingStatement
    ) {
      return "enunciado";
    }
  }

  return null;
}
