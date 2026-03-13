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
