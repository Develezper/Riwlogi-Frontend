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
  adminOverview: { method: "GET", path: "/admin/overview" },
  adminUsers: { method: "GET", path: "/admin/users" },
  adminDeleteUser: { method: "DELETE", path: "/admin/users/:id" },
  adminProblems: { method: "GET", path: "/admin/problems" },
  adminGenerateProblem: { method: "POST", path: "/admin/problems/generate" },
  adminUpdateProblem: { method: "PATCH", path: "/admin/problems/:id" },
  adminDeleteProblem: { method: "DELETE", path: "/admin/problems/:id" },
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

function assertBoolean(value, context) {
  assert(typeof value === "boolean", `${context} must be boolean`, value);
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
    role: value.role === "admin" ? "admin" : "user",
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

function validateAdminOverview(raw) {
  const value = assertObject(raw, "admin.overview");
  const kpis = assertObject(value.kpis || {}, "admin.overview.kpis");
  const topTags = assertArray(value.top_tags || [], "admin.overview.top_tags");
  const recentActivity = assertArray(value.recent_activity || [], "admin.overview.recent_activity");

  return {
    kpis: {
      total_users: Number(kpis.total_users || 0),
      active_users_7d: Number(kpis.active_users_7d || 0),
      total_problems: Number(kpis.total_problems || 0),
      published_problems: Number(kpis.published_problems || 0),
      draft_problems: Number(kpis.draft_problems || 0),
      total_submissions: Number(kpis.total_submissions || 0),
      accepted_submissions: Number(kpis.accepted_submissions || 0),
      acceptance_rate: Number(kpis.acceptance_rate || 0),
      ai_generated_problems: Number(kpis.ai_generated_problems || 0),
    },
    top_tags: topTags.map((row, index) => {
      const item = assertObject(row, `admin.overview.top_tags[${index}]`);
      return {
        tag: assertString(item.tag, `admin.overview.top_tags[${index}].tag`),
        count: Number(item.count || 0),
      };
    }),
    recent_activity: recentActivity.map((row, index) => {
      const item = assertObject(row, `admin.overview.recent_activity[${index}]`);
      return {
        id: assertString(item.id || `activity_${index + 1}`, `admin.overview.recent_activity[${index}].id`),
        type: assertString(item.type || "system", `admin.overview.recent_activity[${index}].type`),
        label: assertString(item.label || "-", `admin.overview.recent_activity[${index}].label`),
        created_at: assertString(
          item.created_at || new Date().toISOString(),
          `admin.overview.recent_activity[${index}].created_at`,
        ),
      };
    }),
    updated_at: assertString(value.updated_at || new Date().toISOString(), "admin.overview.updated_at"),
  };
}

function validateAdminUser(raw, index) {
  const value = assertObject(raw, `admin.users.items[${index}]`);
  const baseUser = validateUser(value, `admin.users.items[${index}]`);
  const role = String(value.role || "user");

  return {
    ...baseUser,
    role,
    is_admin: typeof value.is_admin === "boolean" ? value.is_admin : role === "admin",
    submissions_count: Number(value.submissions_count || 0),
    solved_count: Number(value.solved_count || 0),
    last_active_at: value.last_active_at ? String(value.last_active_at) : null,
  };
}

function validateAdminProblem(raw, index) {
  const value = assertObject(raw, `admin.problems.items[${index}]`);
  const problem = validateProblem(value);
  const status = String(value.status || "draft");
  const source = String(value.source || "custom");

  return {
    ...problem,
    status,
    source,
    ai_generated: typeof value.ai_generated === "boolean" ? value.ai_generated : source === "ai",
    created_at: assertString(
      value.created_at || new Date().toISOString(),
      `admin.problems.items[${index}].created_at`,
    ),
    updated_at: assertString(
      value.updated_at || value.created_at || new Date().toISOString(),
      `admin.problems.items[${index}].updated_at`,
    ),
    last_generated_prompt: value.last_generated_prompt ? String(value.last_generated_prompt) : "",
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

export function parseAdminOverviewResponse(payload) {
  const value = assertObject(payload, "admin overview response");
  const item = value.item && typeof value.item === "object" ? value.item : value;
  return validateAdminOverview(item);
}

export function parseAdminUsersResponse(payload) {
  if (Array.isArray(payload)) {
    return payload.map((user, index) => validateAdminUser(user, index));
  }

  const value = assertObject(payload, "admin users response");
  const items = assertArray(value.items, "admin users response.items");
  return items.map((user, index) => validateAdminUser(user, index));
}

export function parseAdminProblemsResponse(payload) {
  if (Array.isArray(payload)) {
    return payload.map((problem, index) => validateAdminProblem(problem, index));
  }

  const value = assertObject(payload, "admin problems response");
  const items = assertArray(value.items, "admin problems response.items");
  return items.map((problem, index) => validateAdminProblem(problem, index));
}

export function parseAdminProblemMutationResponse(payload) {
  const value = assertObject(payload, "admin problem mutation response");
  const item = value.item && typeof value.item === "object" ? value.item : value;
  return validateAdminProblem(item, 0);
}

export function parseAdminDeleteResponse(payload) {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    return { ok: true, message: "" };
  }

  const value = assertObject(payload, "admin delete response");
  return {
    ok: value.ok === undefined ? true : assertBoolean(value.ok, "admin.delete.ok"),
    message: value.message ? String(value.message) : "",
  };
}
