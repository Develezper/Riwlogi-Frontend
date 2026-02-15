import { localApi } from "./local-provider.js";
import { ApiHttpError, remoteApi } from "./remote-provider.js";

const MODE_LOCAL = "local";
const MODE_REMOTE = "remote";
const MODE_HYBRID = "hybrid";
const VALID_MODES = new Set([MODE_LOCAL, MODE_REMOTE, MODE_HYBRID]);

const configuredMode = String(import.meta.env.VITE_API_MODE || MODE_HYBRID).toLowerCase();
const runtimeMode = VALID_MODES.has(configuredMode) ? configuredMode : MODE_HYBRID;

const runtime = {
  configuredMode: runtimeMode,
  activeProvider: MODE_LOCAL,
  backendAvailable: false,
  bootstrappedAt: null,
  lastError: null,
};

let provider = localApi;

async function selectProvider() {
  localApi.bootstrap();

  if (runtimeMode === MODE_LOCAL) {
    provider = localApi;
    runtime.activeProvider = MODE_LOCAL;
    runtime.backendAvailable = false;
    runtime.lastError = null;
    runtime.bootstrappedAt = new Date().toISOString();
    return;
  }

  try {
    await remoteApi.healthCheck();
    provider = remoteApi;
    runtime.activeProvider = MODE_REMOTE;
    runtime.backendAvailable = true;
    runtime.lastError = null;
    runtime.bootstrappedAt = new Date().toISOString();
  } catch (error) {
    const detail =
      error instanceof ApiHttpError
        ? `Backend respondió ${error.status}: ${error.message}`
        : error instanceof Error
        ? error.message
        : String(error);

    runtime.lastError = detail;
    runtime.bootstrappedAt = new Date().toISOString();

    if (runtimeMode === MODE_REMOTE) {
      throw new Error(`No se pudo inicializar la API remota. ${detail}`);
    }

    provider = localApi;
    runtime.activeProvider = MODE_LOCAL;
    runtime.backendAvailable = false;
  }
}

export const api = {
  async bootstrap() {
    await selectProvider();
  },

  getRuntime() {
    return {
      ...runtime,
      mode: runtime.activeProvider,
    };
  },

  auth: {
    async login(payload) {
      return provider.auth.login(payload);
    },

    async register(payload) {
      return provider.auth.register(payload);
    },
  },

  problems: {
    async list(params = {}) {
      return provider.problems.list(params);
    },

    async get(slug) {
      return provider.problems.get(slug);
    },

    async tags() {
      return provider.problems.tags();
    },
  },

  submissions: {
    async start(problemId, language = "python") {
      return provider.submissions.start(problemId, language);
    },

    async run(payload) {
      return provider.submissions.run(payload);
    },

    async submit(submissionId) {
      return provider.submissions.submit(submissionId);
    },

    async sendEvents(submissionId, events = []) {
      return provider.submissions.sendEvents(submissionId, events);
    },
  },

  leaderboard: {
    async get(params = {}) {
      return provider.leaderboard.get(params);
    },
  },

  profile: {
    async me() {
      return provider.profile.me();
    },

    async submissions() {
      return provider.profile.submissions();
    },
  },
};
