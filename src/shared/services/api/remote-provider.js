import {
  API_CONTRACT,
  parseAuthResponse,
  parseHealthResponse,
  parseLeaderboardResponse,
  parseProblemResponse,
  parseProblemsListResponse,
  parseProfileResponse,
  parseProfileSubmissionsResponse,
  parseSubmissionEventsResponse,
  parseSubmissionRunResponse,
  parseSubmissionStartResponse,
  parseSubmissionSubmitResponse,
  parseTagsResponse,
} from "./contract.js";

const API_BASE = import.meta.env.VITE_API_BASE || "/api";
const TOKEN_KEY = "Riwlog_token";

export class ApiHttpError extends Error {
  constructor(status, message, payload = null, diagnostics = null) {
    super(message || `HTTP ${status}`);
    this.name = "ApiHttpError";
    this.status = status;
    this.payload = payload;
    this.url = diagnostics?.url || null;
    this.contentType = diagnostics?.contentType || null;
  }
}

function endpointPath(endpoint, params = {}) {
  let path = endpoint.path;

  Object.entries(params).forEach(([key, value]) => {
    path = path.replace(`:${key}`, encodeURIComponent(String(value)));
  });

  return `${API_BASE}${path}`;
}

function withTimeout(promise, timeoutMs = 4500) {
  return Promise.race([
    promise,
    new Promise((_, reject) => {
      window.setTimeout(() => reject(new Error("remote_timeout")), timeoutMs);
    }),
  ]);
}

function buildUrl(endpoint, { params, query } = {}) {
  const url = endpointPath(endpoint, params);
  if (!query || !Object.keys(query).length) return url;

  const searchParams = new URLSearchParams();
  Object.entries(query).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return;
    searchParams.set(key, String(value));
  });

  const queryString = searchParams.toString();
  return queryString ? `${url}?${queryString}` : url;
}

function authHeader() {
  const token = window.localStorage.getItem(TOKEN_KEY);
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request(endpoint, { body, query, params, requireAuth = false, timeoutMs } = {}) {
  const method = endpoint.method || "GET";
  const url = buildUrl(endpoint, { params, query });

  let response;
  try {
    response = await withTimeout(
      window.fetch(url, {
        method,
        mode: "cors",
        headers: {
          ...(body ? { "Content-Type": "application/json" } : {}),
          ...(requireAuth ? authHeader() : {}),
        },
        body: body ? JSON.stringify(body) : undefined,
      }),
      timeoutMs,
    );
  } catch (error) {
    if (error instanceof Error && error.message === "remote_timeout") {
      throw error;
    }
    throw new Error("remote_unreachable");
  }

  const contentType = response.headers.get("content-type") || "";
  const isJson = contentType.includes("application/json");
  const payload = isJson ? await response.json().catch(() => null) : await response.text().catch(() => null);

  if (!response.ok) {
    const message =
      (payload && typeof payload === "object" && (payload.message || payload.detail || payload.error)) ||
      response.statusText ||
      "Request failed";

    throw new ApiHttpError(response.status, String(message), payload, {
      url: response.url || url,
      contentType,
    });
  }

  return {
    payload,
    meta: {
      url: response.url || url,
      status: response.status,
      contentType,
    },
  };
}

function payloadType(value) {
  if (value === null) return "null";
  if (Array.isArray(value)) return "array";
  return typeof value;
}

function formatHealthDiagnostic({ url, status, contentType, reason }) {
  const resolvedUrl = url || `${API_BASE}${API_CONTRACT.health.path}`;
  const resolvedStatus = typeof status === "number" ? String(status) : "n/a";
  const resolvedType = contentType || "unknown";
  return `Health check failed. url=${resolvedUrl} status=${resolvedStatus} content-type=${resolvedType} reason=${reason}`;
}

export const remoteApi = {
  async healthCheck() {
    const healthUrl = buildUrl(API_CONTRACT.health);

    let result;
    try {
      result = await request(API_CONTRACT.health, {
        timeoutMs: 1000,
      });
    } catch (error) {
      if (error instanceof ApiHttpError) {
        throw new Error(
          formatHealthDiagnostic({
            url: error.url || healthUrl,
            status: error.status,
            contentType: error.contentType,
            reason: error.message,
          }),
        );
      }

      const reason = error instanceof Error ? error.message : String(error);
      throw new Error(
        formatHealthDiagnostic({
          url: healthUrl,
          status: null,
          contentType: null,
          reason,
        }),
      );
    }

    const { payload, meta } = result;
    const isObject = payload && typeof payload === "object" && !Array.isArray(payload);
    if (!isObject) {
      throw new Error(
        formatHealthDiagnostic({
          url: meta.url,
          status: meta.status,
          contentType: meta.contentType,
          reason: `expected JSON object but received ${payloadType(payload)}`,
        }),
      );
    }

    try {
      return parseHealthResponse(payload);
    } catch (error) {
      const reason = error instanceof Error ? error.message : String(error);
      throw new Error(
        formatHealthDiagnostic({
          url: meta.url,
          status: meta.status,
          contentType: meta.contentType,
          reason,
        }),
      );
    }
  },

  auth: {
    async login({ email, password }) {
      const { payload } = await request(API_CONTRACT.authLogin, {
        body: { email, password },
      });
      return parseAuthResponse(payload);
    },

    async register({ username, email, password }) {
      const { payload } = await request(API_CONTRACT.authRegister, {
        body: { username, email, password },
      });
      return parseAuthResponse(payload);
    },
  },

  problems: {
    async list(params = {}) {
      const { payload } = await request(API_CONTRACT.problemsList, {
        query: params,
      });
      return parseProblemsListResponse(payload);
    },

    async get(slug) {
      const { payload } = await request(API_CONTRACT.problemBySlug, {
        params: { slug },
      });
      return parseProblemResponse(payload);
    },

    async tags() {
      const { payload } = await request(API_CONTRACT.problemTags);
      return parseTagsResponse(payload);
    },
  },

  submissions: {
    async start(problemId, language = "python") {
      const { payload } = await request(API_CONTRACT.submissionStart, {
        requireAuth: true,
        body: { problem_id: problemId, language },
      });

      return parseSubmissionStartResponse(payload);
    },

    async run(data) {
      const { payload } = await request(API_CONTRACT.submissionRun, {
        requireAuth: true,
        body: data,
      });

      return parseSubmissionRunResponse(payload);
    },

    async submit(submissionId) {
      const { payload } = await request(API_CONTRACT.submissionSubmit, {
        requireAuth: true,
        params: { id: submissionId },
      });

      return parseSubmissionSubmitResponse(payload);
    },

    async sendEvents(submissionId, events = []) {
      const { payload } = await request(API_CONTRACT.submissionEvents, {
        requireAuth: true,
        params: { id: submissionId },
        body: { events },
      });

      return parseSubmissionEventsResponse(payload);
    },
  },

  leaderboard: {
    async get({ timeframe = "all" } = {}) {
      const { payload } = await request(API_CONTRACT.leaderboard, {
        query: { timeframe },
      });

      return parseLeaderboardResponse(payload);
    },
  },

  profile: {
    async me() {
      const { payload } = await request(API_CONTRACT.profile, {
        requireAuth: true,
      });
      return parseProfileResponse(payload);
    },

    async submissions() {
      const { payload } = await request(API_CONTRACT.profileSubmissions, {
        requireAuth: true,
      });

      return parseProfileSubmissionsResponse(payload);
    },
  },
};
