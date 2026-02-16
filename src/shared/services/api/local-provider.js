import { getAllProblems, getAllTags, getProblemBySlug } from "../problem-repository.js";

const DB_KEY = "Riwlog_local_db_v2";
const TOKEN_KEY = "Riwlog_token";
const USER_KEY = "Riwlog_user";
const EXPIRES_KEY = "Riwlog_expires_at";
const isBrowser = typeof window !== "undefined";

const LEADERBOARD_SEED = [
  { username: "algorithmist", score: 4850, solved: 87, streak: 32 },
  { username: "code_ninja", score: 4720, solved: 82, streak: 28 },
  { username: "byte_master", score: 4580, solved: 79, streak: 21 },
  { username: "devSara", score: 4320, solved: 74, streak: 18 },
  { username: "logic_lord", score: 4100, solved: 71, streak: 15 },
  { username: "func_wizard", score: 3920, solved: 68, streak: 14 },
  { username: "recursion_queen", score: 3780, solved: 65, streak: 12 },
  { username: "stack_overflow", score: 3650, solved: 62, streak: 11 },
  { username: "dp_guru", score: 3500, solved: 59, streak: 9 },
  { username: "hash_hero", score: 3350, solved: 56, streak: 7 },
];

const DEFAULT_USERS = [
  {
    id: "user_demo",
    username: "demo",
    email: "demo@riwlog.dev",
    password: "123456",
    display_name: "Demo User",
    created_at: "2026-01-03T10:00:00.000Z",
  },
  {
    id: "user_code_ninja",
    username: "code_ninja",
    email: "code@riwlog.dev",
    password: "123456",
    display_name: "Code Ninja",
    created_at: "2025-11-22T10:00:00.000Z",
  },
];

let cachedDb = null;

function deepClone(value) {
  return JSON.parse(JSON.stringify(value));
}

function nowIso() {
  return new Date().toISOString();
}

function uid(prefix) {
  return `${prefix}_${Math.random().toString(36).slice(2, 8)}_${Date.now().toString(36)}`;
}

function hashString(value) {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function readStorageItem(key) {
  if (!isBrowser) return null;
  return window.localStorage.getItem(key);
}

function writeStorageItem(key, value) {
  if (!isBrowser) return;
  window.localStorage.setItem(key, value);
}

function loadDb() {
  if (!isBrowser) {
    return {
      users: deepClone(DEFAULT_USERS),
      sessions: {},
      submissions: [],
    };
  }

  const raw = window.localStorage.getItem(DB_KEY);
  if (!raw) {
    return {
      users: deepClone(DEFAULT_USERS),
      sessions: {},
      submissions: [],
    };
  }

  try {
    const parsed = JSON.parse(raw);
    return {
      users: Array.isArray(parsed.users) ? parsed.users : deepClone(DEFAULT_USERS),
      sessions: parsed.sessions && typeof parsed.sessions === "object" ? parsed.sessions : {},
      submissions: Array.isArray(parsed.submissions) ? parsed.submissions : [],
    };
  } catch {
    return {
      users: deepClone(DEFAULT_USERS),
      sessions: {},
      submissions: [],
    };
  }
}

function ensureDb() {
  if (!cachedDb) {
    cachedDb = loadDb();
  }
  return cachedDb;
}

function saveDb() {
  if (!isBrowser || !cachedDb) return;
  writeStorageItem(DB_KEY, JSON.stringify(cachedDb));
}

function normalizePublicUser(user) {
  return {
    id: user.id,
    username: user.username,
    email: user.email,
    display_name: user.display_name || user.username,
    created_at: user.created_at,
  };
}

function createSession(userId) {
  const db = ensureDb();
  const token = uid("token");
  db.sessions[token] = { user_id: userId, created_at: nowIso() };
  saveDb();
  return token;
}

function findUserByIdentifier(identifier) {
  const db = ensureDb();
  const normalized = String(identifier || "").trim().toLowerCase();
  return (
    db.users.find((user) => user.email.toLowerCase() === normalized) ||
    db.users.find((user) => user.username.toLowerCase() === normalized) ||
    null
  );
}

function findUserById(userId) {
  if (!userId) return null;
  const db = ensureDb();
  return db.users.find((user) => user.id === userId) || null;
}

function resolveCurrentUser() {
  const db = ensureDb();
  const expiresAt = readStorageItem(EXPIRES_KEY);
  if (expiresAt) {
    const expiryTime = new Date(expiresAt).getTime();
    if (Number.isNaN(expiryTime) || expiryTime <= Date.now()) {
      return null;
    }
  }

  const token = readStorageItem(TOKEN_KEY);
  if (token && db.sessions[token]) {
    return findUserById(db.sessions[token].user_id);
  }

  const rawUser = readStorageItem(USER_KEY);
  if (!rawUser) return null;

  try {
    const parsed = JSON.parse(rawUser);
    return findUserById(parsed.id) || findUserByIdentifier(parsed.email || parsed.username);
  } catch {
    return null;
  }
}

function getCurrentUserOrThrow() {
  const user = resolveCurrentUser();
  if (!user) throw new Error("Debes iniciar sesión para continuar.");
  return user;
}

function findStage(problem, stageId) {
  return problem.stages.find((stage) => stage.id === stageId) || null;
}

function classifyFromEvents(events = []) {
  const summary = events.reduce(
    (acc, event) => {
      if (event.type === "key") acc.key += Number(event.char_count || 0);
      if (event.type === "paste") acc.paste += Number(event.char_count || 0);
      if (event.type === "delete") acc.delete += Number(event.char_count || 0);
      if (event.type === "run") acc.run += 1;
      return acc;
    },
    { key: 0, paste: 0, delete: 0, run: 0 },
  );

  const totalInput = summary.key + summary.paste;
  const pasteRatio = totalInput > 0 ? summary.paste / totalInput : 0;

  let label = "human";
  if (pasteRatio >= 0.7) label = "ai_generated";
  else if (pasteRatio >= 0.35) label = "assisted";

  let confidence = 0.55 + pasteRatio * 0.4;
  if (summary.run >= 3 && pasteRatio < 0.2) confidence -= 0.08;

  return {
    label,
    confidence: Number(Math.max(0.5, Math.min(0.98, confidence)).toFixed(2)),
  };
}

function evaluateStage(code, stage) {
  const normalizedCode = String(code || "").trim();
  const signature = hashString(`${stage.id}|${normalizedCode}`);
  const tooShort = normalizedCode.length < 24;
  const placeholder = /\b(pass|todo|write your solution here)\b/i.test(normalizedCode);
  const passed = !tooShort && !placeholder && signature % 100 >= 28;

  const visibleTests = Array.isArray(stage.visible_tests) ? stage.visible_tests : [];
  const failingIndex = visibleTests.length ? signature % visibleTests.length : -1;

  const visibleResults = visibleTests.map((test, index) => {
    const testPassed = passed ? true : index !== failingIndex;
    return {
      input_text: test.input_text,
      expected_text: test.expected_text,
      passed: testPassed,
      error: testPassed ? null : "Output mismatch",
    };
  });

  return {
    passed,
    runtime_ms: 12 + (signature % 180),
    stage_score: passed ? Math.max(55, 100 - (signature % 22)) : Math.max(8, 30 - (signature % 15)),
    visible_results: visibleResults,
  };
}

function getUserSubmissions(userId) {
  const db = ensureDb();
  return db.submissions.filter((submission) => submission.user_id === userId);
}

function timeframeMatch(dateLike, timeframe) {
  if (timeframe === "all") return true;

  const value = new Date(dateLike);
  if (Number.isNaN(value.getTime())) return false;

  const now = new Date();
  if (timeframe === "today") {
    return value.toDateString() === now.toDateString();
  }

  if (timeframe === "week") {
    const diffMs = now.getTime() - value.getTime();
    return diffMs <= 7 * 24 * 60 * 60 * 1000;
  }

  return true;
}

function buildLeaderboard(timeframe = "all") {
  const db = ensureDb();
  const map = new Map();

  if (timeframe === "all") {
    LEADERBOARD_SEED.forEach((entry) => {
      map.set(entry.username.toLowerCase(), {
        username: entry.username,
        avatar: entry.username[0].toUpperCase(),
        score: entry.score,
        solved: entry.solved,
        streak: entry.streak,
      });
    });
  }

  const solvedByUser = new Map();

  db.submissions
    .filter((submission) => timeframeMatch(submission.submitted_at || submission.created_at, timeframe))
    .forEach((submission) => {
      const user = findUserById(submission.user_id);
      if (!user) return;

      const key = user.username.toLowerCase();
      const current =
        map.get(key) ||
        {
          username: user.username,
          avatar: user.username[0].toUpperCase(),
          score: 0,
          solved: 0,
          streak: 0,
        };

      current.score += Number(submission.final_score || 0);

      if (!solvedByUser.has(key)) solvedByUser.set(key, new Set());
      if (submission.verdict === "accepted") {
        solvedByUser.get(key).add(submission.problem_id);
      }

      current.solved = Math.max(current.solved, solvedByUser.get(key).size);
      current.streak = Math.max(current.streak, 1 + (hashString(key) % 14));
      map.set(key, current);
    });

  const rows = [...map.values()]
    .sort((a, b) => b.score - a.score || b.solved - a.solved || a.username.localeCompare(b.username))
    .slice(0, 100)
    .map((entry, index) => ({
      rank: index + 1,
      username: entry.username,
      avatar: entry.avatar,
      score: Math.round(entry.score),
      total_score: Math.round(entry.score),
      solved: entry.solved,
      streak: entry.streak,
    }));

  return rows;
}

function calculateStreak(submissions) {
  if (!submissions.length) return 0;

  const days = new Set(
    submissions.map((submission) => {
      const date = new Date(submission.submitted_at || submission.created_at);
      return date.toISOString().slice(0, 10);
    }),
  );

  let streak = 0;
  const cursor = new Date();

  for (let i = 0; i < 60; i += 1) {
    const key = cursor.toISOString().slice(0, 10);
    if (!days.has(key)) break;
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  return streak || 1;
}

function computeDifficultyStats(problemIds) {
  const counts = { easy: 0, medium: 0, hard: 0 };

  problemIds.forEach((problemId) => {
    const problem = getProblemBySlug(problemId);
    if (!problem) return;
    if (problem.difficulty === 1) counts.easy += 1;
    if (problem.difficulty === 2) counts.medium += 1;
    if (problem.difficulty === 3) counts.hard += 1;
  });

  return counts;
}

function buildBadges({ solved, hardSolved, streak, totalScore }) {
  const badges = [];

  if (solved >= 1) {
    badges.push({ name: "First Solve", description: "Resolved your first challenge", icon: "check-circle" });
  }
  if (solved >= 5) {
    badges.push({ name: "Consistency", description: "Solved 5+ different problems", icon: "award" });
  }
  if (hardSolved >= 3) {
    badges.push({ name: "Hard Crusher", description: "Solved 3 hard challenges", icon: "trophy" });
  }
  if (streak >= 7) {
    badges.push({ name: "Streak Master", description: "Maintained a 7-day streak", icon: "flame" });
  }
  if (totalScore >= 1000) {
    badges.push({ name: "Speed Demon", description: "Reached 1000+ total points", icon: "zap" });
  }

  if (!badges.length) {
    badges.push({ name: "Getting Started", description: "Complete your first submission", icon: "award" });
  }

  return badges;
}

function formatSubmission(submission) {
  return {
    id: submission.id,
    problem_id: submission.problem_id,
    problem_title: submission.problem_title,
    verdict: submission.verdict,
    language: submission.language,
    final_score: Number(submission.final_score || 0),
    runtime_ms: Number(submission.runtime_ms || 0),
    submitted_at: submission.submitted_at || submission.created_at,
    stage_results: submission.stage_results,
  };
}

export const localApi = {
  bootstrap() {
    ensureDb();
  },

  auth: {
    async login({ email, password }) {
      const identifier = String(email || "").trim();
      const pass = String(password || "").trim();

      if (!identifier || !pass) throw new Error("Debes enviar email y contraseña.");

      const user = findUserByIdentifier(identifier);
      if (!user || user.password !== pass) {
        throw new Error("Credenciales inválidas.");
      }

      const token = createSession(user.id);
      return {
        access_token: token,
        user: normalizePublicUser(user),
      };
    },

    async register({ username, email, password }) {
      const db = ensureDb();
      const cleanUsername = String(username || "").trim();
      const cleanEmail = String(email || "").trim().toLowerCase();
      const cleanPassword = String(password || "").trim();

      if (!cleanUsername || !cleanEmail || !cleanPassword) {
        throw new Error("Todos los campos son obligatorios.");
      }
      if (cleanPassword.length < 6) {
        throw new Error("La contraseña debe tener al menos 6 caracteres.");
      }
      if (db.users.some((user) => user.username.toLowerCase() === cleanUsername.toLowerCase())) {
        throw new Error("Ese username ya está en uso.");
      }
      if (db.users.some((user) => user.email.toLowerCase() === cleanEmail)) {
        throw new Error("Ese email ya está registrado.");
      }

      const user = {
        id: uid("user"),
        username: cleanUsername,
        email: cleanEmail,
        password: cleanPassword,
        display_name: cleanUsername,
        created_at: nowIso(),
      };

      db.users.push(user);
      saveDb();

      const token = createSession(user.id);
      return {
        access_token: token,
        user: normalizePublicUser(user),
      };
    },
  },

  problems: {
    async list(params = {}) {
      const difficulty = params.difficulty ? Number(params.difficulty) : null;
      const search = String(params.search || "").trim().toLowerCase();
      const tag = String(params.tag || "").trim().toLowerCase();

      return getAllProblems().filter((problem) => {
        const difficultyMatches = !difficulty || problem.difficulty === difficulty;
        const searchMatches = !search || problem.title.toLowerCase().includes(search);
        const tagMatches = !tag || problem.tags.some((item) => item.toLowerCase() === tag);

        return difficultyMatches && searchMatches && tagMatches;
      });
    },

    async get(slug) {
      const problem = getProblemBySlug(String(slug || "").trim());
      if (!problem) throw new Error("Problema no encontrado.");
      return problem;
    },

    async tags() {
      return getAllTags();
    },
  },

  submissions: {
    async start(problemId, language = "python") {
      const user = getCurrentUserOrThrow();
      const problem = getProblemBySlug(problemId);
      if (!problem) throw new Error("Problema inválido.");

      const db = ensureDb();
      const submission = {
        id: uid("sub"),
        user_id: user.id,
        problem_id: problem.id,
        problem_title: problem.title,
        language,
        code: "",
        stage_results: {},
        runtime_ms: 0,
        final_score: 0,
        verdict: "pending",
        events: [],
        created_at: nowIso(),
        submitted_at: null,
      };

      db.submissions.push(submission);
      saveDb();

      return {
        submission_id: submission.id,
      };
    },

    async run({ submission_id, stage_id, code, events = [] }) {
      const user = getCurrentUserOrThrow();
      const db = ensureDb();
      const submission = db.submissions.find(
        (item) => item.id === submission_id && item.user_id === user.id,
      );

      if (!submission) throw new Error("No se encontró la submission activa.");

      const problem = getProblemBySlug(submission.problem_id);
      if (!problem) throw new Error("No se encontró el problema de la submission.");

      const stage = findStage(problem, stage_id);
      if (!stage) throw new Error("Stage inválido.");

      const result = evaluateStage(code, stage);
      const classification = classifyFromEvents(events);

      submission.code = String(code || "");
      submission.runtime_ms = result.runtime_ms;
      submission.stage_results[stage.id] = {
        stage_id: stage.id,
        stage_index: stage.stage_index,
        passed: result.passed,
        stage_score: result.stage_score,
        runtime_ms: result.runtime_ms,
      };
      submission.events.push(...events);

      saveDb();

      return {
        passed: result.passed,
        stage_index: stage.stage_index,
        stage_score: result.stage_score,
        runtime_ms: result.runtime_ms,
        visible_results: result.visible_results,
        classification,
      };
    },

    async submit(submissionId) {
      const user = getCurrentUserOrThrow();
      const db = ensureDb();
      const submission = db.submissions.find(
        (item) => item.id === submissionId && item.user_id === user.id,
      );
      if (!submission) throw new Error("Submission no encontrada.");

      const problem = getProblemBySlug(submission.problem_id);
      if (!problem) throw new Error("Problema no encontrado.");

      const stageResults = problem.stages
        .map((stage) => submission.stage_results[stage.id])
        .filter(Boolean);

      if (!stageResults.length) {
        throw new Error("Primero ejecuta al menos una etapa.");
      }

      const allStagesExecuted = stageResults.length === problem.stages.length;
      const allPassed = allStagesExecuted && stageResults.every((stage) => stage.passed);

      const averageScore =
        stageResults.reduce((acc, stage) => acc + Number(stage.stage_score || 0), 0) /
        stageResults.length;

      const completionFactor = stageResults.length / Math.max(1, problem.stages.length);
      const finalScore = Math.round(averageScore * completionFactor);

      submission.final_score = finalScore;
      submission.verdict = allPassed ? "accepted" : "wrong_answer";
      submission.submitted_at = nowIso();

      saveDb();

      return {
        verdict: submission.verdict,
        final_score: finalScore,
      };
    },

    async sendEvents(submissionId, events = []) {
      const user = getCurrentUserOrThrow();
      const db = ensureDb();
      const submission = db.submissions.find(
        (item) => item.id === submissionId && item.user_id === user.id,
      );

      if (!submission) return { ok: false };

      submission.events.push(...events);
      saveDb();
      return { ok: true };
    },
  },

  leaderboard: {
    async get({ timeframe = "all" } = {}) {
      return deepClone(buildLeaderboard(timeframe));
    },
  },

  profile: {
    async me() {
      const user = getCurrentUserOrThrow();
      const submissions = getUserSubmissions(user.id);

      const acceptedProblemIds = new Set(
        submissions
          .filter((submission) => submission.verdict === "accepted")
          .map((submission) => submission.problem_id),
      );

      const difficultyStats = computeDifficultyStats(acceptedProblemIds);
      const totalScore = submissions.reduce((acc, submission) => acc + Number(submission.final_score || 0), 0);
      const solved = acceptedProblemIds.size;
      const streak = calculateStreak(submissions);
      const leaderboard = buildLeaderboard("all");
      const rank =
        leaderboard.find((entry) => entry.username.toLowerCase() === user.username.toLowerCase())?.rank ||
        leaderboard.length + 1;

      const badges = buildBadges({
        solved,
        hardSolved: difficultyStats.hard,
        streak,
        totalScore,
      });

      return {
        user: normalizePublicUser(user),
        stats: {
          total_score: totalScore,
          solved,
          by_difficulty: difficultyStats,
        },
        streak,
        rank,
        badges,
      };
    },

    async submissions() {
      const user = getCurrentUserOrThrow();
      return getUserSubmissions(user.id)
        .slice()
        .sort(
          (a, b) =>
            new Date(b.submitted_at || b.created_at).getTime() -
            new Date(a.submitted_at || a.created_at).getTime(),
        )
        .map(formatSubmission);
    },
  },
};
