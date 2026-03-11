import { remoteApi } from "./remote-provider.js";

const runtime = {
  backendAvailable: false,
  bootstrappedAt: null,
  lastError: null,
};

export const api = {
  async bootstrap() {
    try {
      await remoteApi.healthCheck();
      runtime.backendAvailable = true;
      runtime.lastError = null;
    } catch (error) {
      runtime.lastError = error instanceof Error ? error.message : String(error);
      runtime.backendAvailable = false;
      throw error;
    } finally {
      runtime.bootstrappedAt = new Date().toISOString();
    }
  },

  getRuntime() {
    return { ...runtime };
  },

  auth: {
    login: (payload) => remoteApi.auth.login(payload),
    register: (payload) => remoteApi.auth.register(payload),
    logout: () => remoteApi.auth.logout(),
  },

  problems: {
    list: (params = {}) => remoteApi.problems.list(params),
    get: (slug) => remoteApi.problems.get(slug),
    tags: () => remoteApi.problems.tags(),
  },

  submissions: {
    start: (problemId, language = "python") => remoteApi.submissions.start(problemId, language),
    run: (payload) => remoteApi.submissions.run(payload),
    submit: (submissionId) => remoteApi.submissions.submit(submissionId),
    sendEvents: (submissionId, events = []) =>
      remoteApi.submissions.sendEvents(submissionId, events),
  },

  leaderboard: {
    get: (params = {}) => remoteApi.leaderboard.get(params),
  },

  profile: {
    me: () => remoteApi.profile.me(),
    submissions: () => remoteApi.profile.submissions(),
  },

  admin: {
    overview: () => remoteApi.admin.overview(),
    users: () => remoteApi.admin.users(),
    deleteUser: (userId) => remoteApi.admin.deleteUser(userId),
    problems: (params = {}) => remoteApi.admin.problems(params),
    generateProblem: (payload) => remoteApi.admin.generateProblem(payload),
    updateProblem: (problemId, payload) => remoteApi.admin.updateProblem(problemId, payload),
    deleteProblem: (problemId) => remoteApi.admin.deleteProblem(problemId),
  },
};
