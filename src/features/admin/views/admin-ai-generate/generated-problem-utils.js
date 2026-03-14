import { normalizeComparableText } from "./text-utils.js";

const PLACEHOLDER_TOKENS = [
	"example input",
	"example output",
	"write your solution here",
	"implementa la solucion completa",
];

const TITLE_STOP_WORDS = new Set([
	"crea",
	"crear",
	"genera",
	"genera",
	"generar",
	"quiero",
	"necesito",
	"ejercicio",
	"ejercicios",
	"problema",
	"problemas",
	"reto",
	"retos",
	"de",
	"del",
	"la",
	"el",
	"los",
	"las",
	"y",
	"con",
	"para",
]);

function isNumericToken(token) {
	return /^\d+$/.test(String(token || ""));
}

function toTitleCase(text) {
	return String(text || "")
		.split(" ")
		.filter(Boolean)
		.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
		.join(" ")
		.trim();
}

function buildFallbackTitle(basePrompt, batchIndex = 0) {
	const normalized = normalizeComparableText(basePrompt);
	const tokens = normalized
		.split(" ")
		.filter(
			(token) =>
				token &&
				!TITLE_STOP_WORDS.has(token) &&
				!token.startsWith("eje") &&
				!isNumericToken(token),
		);

	const topic = tokens.slice(0, 4).join(" ").trim();
	const safeTopic = topic ? toTitleCase(topic) : "Algoritmia";
	return `${safeTopic} ${Number(batchIndex) + 1}`;
}

function stripInternalGuidanceLeak(text) {
	const raw = String(text || "");
	const markerRegex = /instrucciones\s+internas\s+para\s+esta\s+generaci/i;
	const match = markerRegex.exec(raw);
	if (!match) return raw;
	return raw.slice(0, match.index).trimEnd();
}

export function normalizeGeneratedProblemCandidate(problem, context = {}) {
	if (!problem || typeof problem !== "object") return problem;

	const basePrompt = String(context.basePrompt || "").trim();
	const plannedDifficulty = Number(context.difficulty || 0);
	const batchIndex = Number(context.batchIndex || 0);

	const next = {
		...problem,
		statement_md: stripInternalGuidanceLeak(problem.statement_md),
	};

	if ([1, 2, 3].includes(plannedDifficulty)) {
		next.difficulty = plannedDifficulty;
	}

	const normalizedPrompt = normalizeComparableText(basePrompt);
	const normalizedTitle = normalizeComparableText(next?.title);
	if (
		normalizedPrompt &&
		normalizedTitle &&
		normalizedPrompt === normalizedTitle
	) {
		next.title = buildFallbackTitle(basePrompt, batchIndex);
	}

	return next;
}

function textContainsPlaceholder(text) {
	const normalized = normalizeComparableText(text);
	if (!normalized) return false;

	return PLACEHOLDER_TOKENS.some((token) => normalized.includes(token));
}

function hasPlaceholderVisibleTests(problem) {
	const stages = Array.isArray(problem?.stages) ? problem.stages : [];
	for (const stage of stages) {
		const visibleTests = Array.isArray(stage?.visible_tests)
			? stage.visible_tests
			: [];
		for (const test of visibleTests) {
			if (
				textContainsPlaceholder(test?.input_text) ||
				textContainsPlaceholder(test?.expected_text)
			) {
				return true;
			}
		}
	}
	return false;
}

export function detectGeneratedProblemIssue(problem) {
	if (!problem || typeof problem !== "object") return "respuesta invalida";

	const normalizedStatement = normalizeComparableText(problem?.statement_md);

	if (normalizedStatement && textContainsPlaceholder(problem?.statement_md)) {
		return "enunciado de plantilla";
	}

	if (hasPlaceholderVisibleTests(problem)) {
		return "tests de plantilla";
	}

	return null;
}
