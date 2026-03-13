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

function collectNormalizedTitles(existingProblems) {
  const list = Array.isArray(existingProblems) ? existingProblems : [];
  const titles = new Set();

  for (const problem of list) {
    const title = normalizeComparableText(problem?.title);
    if (title) {
      titles.add(title);
    }
  }

  return titles;
}

export function ensureUniqueProblemTitle(problem, existingProblems, options = {}) {
  if (!problem || typeof problem !== "object") return null;

  const fallbackBaseTitle = String(options.fallbackBaseTitle || "Ejercicio").trim() || "Ejercicio";
  const originalTitle = String(problem.title || "").trim();
  const baseTitle = originalTitle || fallbackBaseTitle;
  const existingTitles = collectNormalizedTitles(existingProblems);
  const normalizedBaseTitle = normalizeComparableText(baseTitle);

  if (!normalizedBaseTitle || !existingTitles.has(normalizedBaseTitle)) {
    return {
      ...problem,
      title: baseTitle,
    };
  }

  for (let variant = 2; variant <= 30; variant += 1) {
    const candidateTitle = `${baseTitle} (${variant})`;
    const normalizedCandidate = normalizeComparableText(candidateTitle);
    if (!normalizedCandidate || existingTitles.has(normalizedCandidate)) continue;

    return {
      ...problem,
      title: candidateTitle,
    };
  }

  return null;
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
