import { beforeEach, describe, expect, it } from "vitest";

import { store } from "../../src/shared/state/session-store.js";

const validUser = {
  id: "user_1",
  username: "demo",
  email: "demo@riwlog.dev",
  display_name: "Demo",
  created_at: "2026-01-01T00:00:00.000Z",
};

describe("store auth session", () => {
  beforeEach(() => {
    store.logout({ silent: true });
  });

  it("persists and restores authenticated session", () => {
    store.setAuth("token_1234567890abcd", validUser);

    const freshStore = store;
    freshStore._auth = null;
    freshStore.loadSession();

    expect(freshStore.isAuthenticated()).toBe(true);
    expect(freshStore.getUser().username).toBe("demo");
  });

  it("invalidates expired sessions", () => {
    window.localStorage.setItem("Riwlog_token", "token_1234567890abcd");
    window.localStorage.setItem("Riwlog_user", JSON.stringify(validUser));
    window.localStorage.setItem("Riwlog_expires_at", "2020-01-01T00:00:00.000Z");

    store.loadSession();

    expect(store.isAuthenticated()).toBe(false);
    expect(window.localStorage.getItem("Riwlog_token")).toBeNull();
  });

  it("rejects malformed token", () => {
    expect(() => store.setAuth("short", validUser)).toThrow("Token de sesión inválido");
  });
});
