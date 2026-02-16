export const API_CONTRACT = Object.freeze({
  health: { method: "GET", path: "/health" },
  authLogin: { method: "POST", path: "/auth/login" },
  authRegister: { method: "POST", path: "/auth/register" },
  problemsList: { method: "GET", path: "/problems" },
  problemBySlug: { method: "GET", path: "/problems/:slug" },
  problemTags: { method: "GET", path: "/problems/tags" },
  submissionStart: { method: "POST", path: "/submissions/start" },
  submissionRun: { method: "POST", path: "/submissions/run" },
  submissionSubmit: { method: "POST", path: "/submissions/:id/submit" },
  submissionEvents: { method: "POST", path: "/submissions/:id/events" },
  leaderboard: { method: "GET", path: "/leaderboard" },
  profile: { method: "GET", path: "/profile/me" },
  profileSubmissions: { method: "GET", path: "/profile/submissions" },
});

export class ApiContractError extends Error {
  constructor(message, payload = null) {
    super(message);
    this.name = "ApiContractError";
    this.payload = payload;
  }
}

function assert(condition, message, payload = null) {
  if (!condition) {
    throw new ApiContractError(message, payload);
  }
}

function assertObject(value, context) {
  assert(value && typeof value === "object" && !Array.isArray(value), `${context} must be an object`, value);
  return value;
}

function assertString(value, context) {
  assert(typeof value === "string" && value.trim().length > 0, `${context} must be a non-empty string`, value);
  return value;
}

function assertNumber(value, context) {
  assert(typeof value === "number" && Number.isFinite(value), `${context} must be a finite number`, value);
  return value;
}

function assertArray(value, context) {
  assert(Array.isArray(value), `${context} must be an array`, value);
  return value;
}

function validateDifficulty(value, context) {
  const difficulty = assertNumber(value, context);
  assert([1, 2, 3].includes(difficulty), `${context} must be 1, 2 or 3`, value);
  return difficulty;
}

function validateUser(raw, context = "user") {
  const value = assertObject(raw, context);

  return {
    id: assertString(value.id, `${context}.id`),
    username: assertString(value.username, `${context}.username`),
    email: assertString(value.email, `${context}.email`),
    display_name: assertString(value.display_name || value.username, `${context}.display_name`),
    created_at: assertString(value.created_at || new Date().toISOString(), `${context}.created_at`),
  };
}

function validateProblemSummary(raw, index = 0) {
  const value = assertObject(raw, `problems.items[${index}]`);

  return {
    id: assertString(value.id, `problems.items[${index}].id`),
    slug: assertString(value.slug || value.id, `problems.items[${index}].slug`),
    title: assertString(value.title, `problems.items[${index}].title`),
    difficulty: validateDifficulty(value.difficulty, `problems.items[${index}].difficulty`),
    tags: assertArray(value.tags || [], `problems.items[${index}].tags`).map((tag, tagIndex) =>
      assertString(tag, `problems.items[${index}].tags[${tagIndex}]`),
    ),
    acceptance: Number(value.acceptance || 0),
    submissions: Number(value.submissions || 0),
    stages_count: Number(value.stages_count || 0),
  };
}

function validateVisibleTest(raw, context) {
  const value = assertObject(raw, context);
  return {
    input_text: assertString(value.input_text, `${context}.input_text`),
    expected_text: assertString(value.expected_text, `${context}.expected_text`),
  };
}

function validateStage(raw, index) {
  const value = assertObject(raw, `problem.stages[${index}]`);

  return {
    id: assertString(value.id, `problem.stages[${index}].id`),
    stage_index: assertNumber(value.stage_index, `problem.stages[${index}].stage_index`),
    prompt_md: assertString(value.prompt_md || `Stage ${index + 1}`, `problem.stages[${index}].prompt_md`),
    hidden_count: Number(value.hidden_count || 0),
    visible_tests: assertArray(value.visible_tests || [], `problem.stages[${index}].visible_tests`).map(
      (test, testIndex) =>
        validateVisibleTest(test, `problem.stages[${index}].visible_tests[${testIndex}]`),
    ),
  };
}

function validateStarterCode(raw) {
  const value = assertObject(raw, "problem.starter_code");
  const entries = Object.entries(value).filter(([, code]) => typeof code === "string" && code.trim().length > 0);
  assert(entries.length > 0, "problem.starter_code must contain at least one non-empty language", raw);
  return Object.fromEntries(entries.map(([language, code]) => [language, code]));
}

function validateProblem(raw) {
  const value = assertObject(raw, "problem");

  return {
    ...validateProblemSummary(value, 0),
    statement_md: assertString(value.statement_md || "", "problem.statement_md"),
    starter_code: validateStarterCode(value.starter_code || value.starterCode || {}),
    stages: assertArray(value.stages || [], "problem.stages").map((stage, index) =>
      validateStage(stage, index),
    ),
  };
}

function validateRunResult(raw) {
  const value = assertObject(raw, "submissions.run.result");

  return {
    passed: Boolean(value.passed),
    stage_index: Number(value.stage_index || 1),
    stage_score: Number(value.stage_score || 0),
    runtime_ms: Number(value.runtime_ms || 0),
    visible_results: assertArray(value.visible_results || [], "submissions.run.result.visible_results").map(
      (item, index) => {
        const test = assertObject(item, `submissions.run.result.visible_results[${index}]`);
        return {
          input_text: String(test.input_text || ""),
          expected_text: String(test.expected_text || ""),
          passed: Boolean(test.passed),
          error: test.error ? String(test.error) : null,
        };
      },
    ),
    classification: value.classification
      ? {
          label: assertString(value.classification.label, "submissions.run.result.classification.label"),
          confidence: Number(value.classification.confidence || 0),
        }
      : null,
  };
}

function validateLeaderboardEntry(raw, index) {
  const value = assertObject(raw, `leaderboard.items[${index}]`);

  return {
    rank: Number(value.rank || index + 1),
    username: assertString(value.username, `leaderboard.items[${index}].username`),
    avatar: String(value.avatar || value.username[0].toUpperCase()),
    score: Number(value.score ?? value.total_score ?? 0),
    total_score: Number(value.total_score ?? value.score ?? 0),
    solved: Number(value.solved || 0),
    streak: Number(value.streak || 0),
  };
}

function validateProfile(raw) {
  const value = assertObject(raw, "profile");
  const stats = assertObject(value.stats, "profile.stats");
  const byDifficulty = assertObject(stats.by_difficulty || {}, "profile.stats.by_difficulty");

  return {
    user: validateUser(value.user, "profile.user"),
    stats: {
      total_score: Number(stats.total_score || 0),
      solved: Number(stats.solved || 0),
      by_difficulty: {
        easy: Number(byDifficulty.easy || 0),
        medium: Number(byDifficulty.medium || 0),
        hard: Number(byDifficulty.hard || 0),
      },
    },
    streak: Number(value.streak || 0),
    rank: Number(value.rank || 0),
    badges: assertArray(value.badges || [], "profile.badges").map((badge, index) => {
      const item = assertObject(badge, `profile.badges[${index}]`);
      return {
        name: assertString(item.name, `profile.badges[${index}].name`),
        description: assertString(item.description, `profile.badges[${index}].description`),
        icon: item.icon ? String(item.icon) : "award",
      };
    }),
  };
}

function validateProfileSubmission(raw, index) {
  const value = assertObject(raw, `profile.submissions.items[${index}]`);

  return {
    id: assertString(value.id, `profile.submissions.items[${index}].id`),
    problem_id: assertString(value.problem_id, `profile.submissions.items[${index}].problem_id`),
    problem_title: assertString(
      value.problem_title || value.problem_id,
      `profile.submissions.items[${index}].problem_title`,
    ),
    verdict: assertString(value.verdict || "pending", `profile.submissions.items[${index}].verdict`),
    language: assertString(value.language || "python", `profile.submissions.items[${index}].language`),
    final_score: Number(value.final_score || 0),
    runtime_ms: Number(value.runtime_ms || 0),
    submitted_at: assertString(value.submitted_at || new Date().toISOString(), `profile.submissions.items[${index}].submitted_at`),
    stage_results: value.stage_results && typeof value.stage_results === "object" ? value.stage_results : {},
  };
}

export function parseHealthResponse(payload) {
  const value = assertObject(payload, "health");
  assert(value.ok === true || value.status === "ok", "health response must contain ok=true or status='ok'", payload);
  return { ok: true };
}

export function parseAuthResponse(payload) {
  const value = assertObject(payload, "auth response");
  return {
    access_token: assertString(value.access_token, "auth.access_token"),
    user: validateUser(value.user, "auth.user"),
  };
}

export function parseProblemsListResponse(payload) {
  const value = assertObject(payload, "problems list response");
  const items = assertArray(value.items, "problems list response.items");
  return items.map((problem, index) => validateProblemSummary(problem, index));
}

export function parseProblemResponse(payload) {
  const value = assertObject(payload, "problem response");
  return validateProblem(value.item);
}

export function parseTagsResponse(payload) {
  const value = assertObject(payload, "tags response");
  return assertArray(value.items, "tags response.items").map((tag, index) =>
    assertString(tag, `tags response.items[${index}]`),
  );
}

export function parseSubmissionStartResponse(payload) {
  const value = assertObject(payload, "submission start response");
  return {
    submission_id: assertString(value.submission_id, "submission_start.submission_id"),
  };
}

export function parseSubmissionRunResponse(payload) {
  const value = assertObject(payload, "submission run response");
  return validateRunResult(value.result);
}

export function parseSubmissionSubmitResponse(payload) {
  const value = assertObject(payload, "submission submit response");
  return {
    verdict: assertString(value.verdict || "pending", "submission_submit.verdict"),
    final_score: Number(value.final_score || 0),
  };
}

export function parseSubmissionEventsResponse(payload) {
  const value = assertObject(payload, "submission events response");
  return {
    ok: Boolean(value.ok),
  };
}

export function parseLeaderboardResponse(payload) {
  const value = assertObject(payload, "leaderboard response");
  const items = assertArray(value.items, "leaderboard response.items");
  return items.map((entry, index) => validateLeaderboardEntry(entry, index));
}

export function parseProfileResponse(payload) {
  return validateProfile(payload);
}

export function parseProfileSubmissionsResponse(payload) {
  const value = assertObject(payload, "profile submissions response");
  const items = assertArray(value.items, "profile submissions response.items");
  return items.map((submission, index) => validateProfileSubmission(submission, index));
}
