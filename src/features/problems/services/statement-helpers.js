import { escapeHtml, renderMarkdown } from "../../../shared/utils/ui-helpers.js";

export function localizeStatementMarkdown(md) {
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

export function splitStatementAndConstraints(md) {
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

export function collectExampleTests(stages, limit = 3) {
  const firstStage = Array.isArray(stages) ? stages[0] : null;
  const tests = Array.isArray(firstStage?.visible_tests) ? firstStage.visible_tests : [];
  return tests.slice(0, limit);
}

export function getStatementMarkdown(state) {
  const statementBody = state.statementParts?.body?.trim?.() || "";
  if (statementBody) return statementBody;
  const activeStage = state.stages[0] || null;
  const stagePrompt = activeStage?.prompt_md || "";
  return localizeStatementMarkdown(stagePrompt);
}

export function renderTags(tags) {
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

export function renderExamples(examples) {
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

export function renderConstraintsSection(constraintsMd) {
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

export function languageLabel(language) {
  if (language === "python") return "Python";
  if (language === "javascript") return "JavaScript";
  if (language === "typescript") return "TypeScript";
  return language.charAt(0).toUpperCase() + language.slice(1);
}

export function getStarterCode(problem, language) {
  const source = problem.starter_code || problem.starterCode || {};
  return (
    source[language] ||
    source.python ||
    source.javascript ||
    "# Escribe tu solución aquí\n"
  );
}
