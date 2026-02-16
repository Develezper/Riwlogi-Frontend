const TOKEN_KEY = "Riwlog_token";
const USER_KEY = "Riwlog_user";
const EXPIRES_KEY = "Riwlog_expires_at";
const DEFAULT_TTL_MS = 12 * 60 * 60 * 1000;

const listeners = new Map();

function isLikelyToken(token) {
  if (typeof token !== "string") return false;
  const value = token.trim();
  if (value.length < 16) return false;
  if (/\s/.test(value)) return false;
  return true;
}

function sanitizeUser(rawUser) {
  if (!rawUser || typeof rawUser !== "object") return null;

  const id = typeof rawUser.id === "string" ? rawUser.id : null;
  const username = typeof rawUser.username === "string" ? rawUser.username : null;
  const email = typeof rawUser.email === "string" ? rawUser.email : null;

  if (!id || !username || !email) return null;

  return {
    id,
    username,
    email,
    role: rawUser.role === "admin" ? "admin" : "user",
    display_name:
      typeof rawUser.display_name === "string" && rawUser.display_name.trim().length > 0
        ? rawUser.display_name
        : username,
    created_at:
      typeof rawUser.created_at === "string" && rawUser.created_at.trim().length > 0
        ? rawUser.created_at
        : new Date().toISOString(),
  };
}

function parseExpiry(value) {
  if (typeof value !== "string" || !value.trim()) return null;
  const timestamp = new Date(value).getTime();
  if (Number.isNaN(timestamp)) return null;
  return new Date(timestamp).toISOString();
}

export const store = {
  _auth: null,

  setAuth(token, user, options = {}) {
    const ttlMs = Number(options.ttlMs || DEFAULT_TTL_MS);
    const safeUser = sanitizeUser(user);

    if (!isLikelyToken(token)) {
      throw new Error("Token de sesión inválido.");
    }

    if (!safeUser) {
      throw new Error("Datos de usuario inválidos.");
    }

    const expiresAt = new Date(Date.now() + Math.max(60_000, ttlMs)).toISOString();

    this._auth = {
      token: token.trim(),
      user: safeUser,
      expires_at: expiresAt,
    };

    localStorage.setItem(TOKEN_KEY, this._auth.token);
    localStorage.setItem(USER_KEY, JSON.stringify(safeUser));
    localStorage.setItem(EXPIRES_KEY, expiresAt);

    this.emit("auth-change", this.getSessionMeta());
  },

  logout(options = {}) {
    this._auth = null;
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(EXPIRES_KEY);

    if (!options.silent) {
      this.emit("auth-change", null);
    }
  },

  loadSession() {
    const token = localStorage.getItem(TOKEN_KEY);
    const userJson = localStorage.getItem(USER_KEY);
    const expiresRaw = localStorage.getItem(EXPIRES_KEY);

    if (!token || !userJson || !expiresRaw) {
      this.logout({ silent: true });
      return;
    }

    const expiresAt = parseExpiry(expiresRaw);
    if (!expiresAt || new Date(expiresAt).getTime() <= Date.now()) {
      this.logout({ silent: true });
      return;
    }

    let parsedUser = null;
    try {
      parsedUser = JSON.parse(userJson);
    } catch {
      this.logout({ silent: true });
      return;
    }

    const safeUser = sanitizeUser(parsedUser);
    if (!safeUser || !isLikelyToken(token)) {
      this.logout({ silent: true });
      return;
    }

    this._auth = {
      token,
      user: safeUser,
      expires_at: expiresAt,
    };
  },

  extendSession(ttlMs = DEFAULT_TTL_MS) {
    if (!this._auth) return;

    const expiresAt = new Date(Date.now() + Math.max(60_000, Number(ttlMs || DEFAULT_TTL_MS))).toISOString();
    this._auth.expires_at = expiresAt;
    localStorage.setItem(EXPIRES_KEY, expiresAt);
  },

  isAuthenticated() {
    if (!this._auth) return false;
    if (!this._auth.expires_at) return false;

    const expiresAt = new Date(this._auth.expires_at).getTime();
    if (Number.isNaN(expiresAt) || expiresAt <= Date.now()) {
      this.logout();
      return false;
    }

    return isLikelyToken(this._auth.token);
  },

  getToken() {
    return this.isAuthenticated() ? this._auth.token : null;
  },

  getUser() {
    return this.isAuthenticated() ? this._auth.user : null;
  },

  getSessionMeta() {
    if (!this._auth) return null;
    return {
      expires_at: this._auth.expires_at,
      user_id: this._auth.user?.id || null,
    };
  },

  on(event, callback) {
    if (!listeners.has(event)) listeners.set(event, []);
    listeners.get(event).push(callback);
  },

  off(event, callback) {
    const callbacks = listeners.get(event);
    if (!callbacks) return;

    listeners.set(
      event,
      callbacks.filter((registered) => registered !== callback),
    );
  },

  emit(event, data) {
    const callbacks = listeners.get(event);
    if (!callbacks) return;
    callbacks.forEach((callback) => callback(data));
  },
};
