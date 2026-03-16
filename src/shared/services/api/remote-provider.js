import {
  API_CONTRACT,
  parseAdminDeleteResponse,
  parseAdminOverviewResponse,
  parseAdminProblemMutationResponse,
  parseAdminProblemsResponse,
  parseAdminUsersResponse,
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

function normalizeApiBase(value) {
  const raw = String(value || "").trim();
  if (!raw) return "";
  return raw.endsWith("/") ? raw.slice(0, -1) : raw;
}

function resolveApiBase() {
  const fromEnv = normalizeApiBase(import.meta.env.VITE_API_BASE);
  if (fromEnv) return fromEnv;

  return "/api";
}

const API_BASE = resolveApiBase();
const TOKEN_KEY = "Riwlog_token";
const USER_KEY = "Riwlog_user";
const EXPIRES_KEY = "Riwlog_expires_at";

function clearStoredSession() {
  try {
    window.localStorage.removeItem(TOKEN_KEY);
    window.localStorage.removeItem(USER_KEY);
    window.localStorage.removeItem(EXPIRES_KEY);
  } catch {
    return;
  }

  if (typeof window !== "undefined" && window.location.hash !== "#/auth/login") {
    window.location.hash = "#/auth/login";
  }
}

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

function remoteTimeoutError() {
  const error = new Error("Tiempo de espera agotado al contactar el servidor.");
  error.code = "remote_timeout";
  return error;
}

function remoteUnreachableError() {
  const error = new Error("No se pudo conectar con el servidor.");
  error.code = "remote_unreachable";
  return error;
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
      window.setTimeout(() => reject(remoteTimeoutError()), timeoutMs);
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
    if (
      error instanceof Error &&
      (error.code === "remote_timeout" || error.message === "remote_timeout")
    ) {
      throw error;
    }
    throw remoteUnreachableError();
  }

  const contentType = response.headers.get("content-type") || "";
  const isJson = contentType.includes("application/json");
  const payload = isJson ? await response.json().catch(() => null) : await response.text().catch(() => null);

  if (!response.ok) {
    if (requireAuth && response.status === 401) {
      clearStoredSession();
    }

    const message =
      (payload && typeof payload === "object" && (payload.message || payload.detail || payload.error)) ||
      response.statusText ||
      "La solicitud falló.";

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
  if (value === null) return "nulo";
  if (Array.isArray(value)) return "arreglo";
  if (typeof value === "string") return "cadena";
  if (typeof value === "number") return "número";
  if (typeof value === "boolean") return "booleano";
  if (typeof value === "undefined") return "indefinido";
  return typeof value;
}

function formatHealthDiagnostic({ url, status, contentType, reason }) {
  const resolvedUrl = url || `${API_BASE}${API_CONTRACT.health.path}`;
  const resolvedStatus = typeof status === "number" ? String(status) : "n/d";
  const resolvedType = contentType || "desconocido";
  return `Falló la verificación de salud. url=${resolvedUrl} estado=${resolvedStatus} tipo-contenido=${resolvedType} motivo=${reason}`;
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
          reason: `se esperaba un objeto JSON pero se recibió ${payloadType(payload)}`,
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
        body: { identifier: email, password },
      });
      return parseAuthResponse(payload);
    },

    async register({ username, email, password }) {
      const { payload } = await request(API_CONTRACT.authRegister, {
        body: { username, email, password },
      });
      return parseAuthResponse(payload);
    },

    async logout() {
      await request(API_CONTRACT.authLogout, { requireAuth: true });
      return { ok: true };
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

  admin: {
    async overview() {
      const { payload } = await request(API_CONTRACT.adminOverview, {
        requireAuth: true,
      });
      return parseAdminOverviewResponse(payload);
    },

    async users() {
      const { payload } = await request(API_CONTRACT.adminUsers, {
        requireAuth: true,
      });
      return parseAdminUsersResponse(payload);
    },

    async deleteUser(userId) {
      const { payload } = await request(API_CONTRACT.adminDeleteUser, {
        requireAuth: true,
        params: { id: userId },
      });
      return parseAdminDeleteResponse(payload);
    },

    async problems(params = {}) {
      const hasExplicitPage = Object.prototype.hasOwnProperty.call(params, "page");
      if (hasExplicitPage) {
        const { payload } = await request(API_CONTRACT.adminProblems, {
          requireAuth: true,
          query: params,
        });
        return parseAdminProblemsResponse(payload);
      }

      const baseQuery = { ...params };
      const limit = Number(baseQuery.limit);
      baseQuery.limit = Number.isFinite(limit) && limit > 0 ? limit : 100;

      let page = 1;
      const allItems = [];

      while (true) {
        const { payload } = await request(API_CONTRACT.adminProblems, {
          requireAuth: true,
          query: {
            ...baseQuery,
            page,
          },
        });

        allItems.push(...parseAdminProblemsResponse(payload));

        const hasNext =
          payload &&
          typeof payload === "object" &&
          !Array.isArray(payload) &&
          payload.has_next === true;

        if (!hasNext) break;
        page += 1;
      }

      return allItems;
    },

    async generateProblem(data) {
      const { payload } = await request(API_CONTRACT.adminGenerateProblem, {
        requireAuth: true,
        body: data,
        timeoutMs: 45_000,
      });
      return parseAdminProblemMutationResponse(payload);
    },

    async updateProblem(problemId, data) {
      const { payload } = await request(API_CONTRACT.adminUpdateProblem, {
        requireAuth: true,
        params: { id: problemId },
        body: data,
      });
      return parseAdminProblemMutationResponse(payload);
    },

    async deleteProblem(problemId) {
      const { payload } = await request(API_CONTRACT.adminDeleteProblem, {
        requireAuth: true,
        params: { id: problemId },
      });
      return parseAdminDeleteResponse(payload);
    },
  },
};
