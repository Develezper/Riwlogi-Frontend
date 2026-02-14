/**
 * Estado global (Observer pattern + Singleton).
 * Maneja auth, user data, y notificaciones.
 */

const listeners = new Map();

export const store = {
  _auth: null,
  //  Auth 
  // Guarda sesión en memoria y localStorage
  setAuth(token, user) {
    this._auth = { token, user };
    localStorage.setItem("Riwlog_token", token);
    localStorage.setItem("Riwlog_user", JSON.stringify(user));
    this.emit("auth-change");
  },

  
  //  Cierra sesión
  logout() {
    this._auth = null;
    localStorage.removeItem("Riwlog_token");
    localStorage.removeItem("Riwlog_user");
    this.emit("auth-change");
  },

  // Restaura sesión de localStorage
  loadSession() {
    const token = localStorage.getItem("Riwlog_token");
    const userJson = localStorage.getItem("Riwlog_user");
    if (token && userJson) {
      try {
        this._auth = { token, user: JSON.parse(userJson) };
      } catch {
        this.logout();
      }
    }
  },

  isAuthenticated() {
    return this._auth !== null && !!this._auth.token;
  },

  getToken() {
    return this._auth?.token || null;
  },

  getUser() {
    return this._auth?.user || null;
  },

  // Event Emitter (Observer pattern) 
  on(event, callback) {
    if (!listeners.has(event)) listeners.set(event, []);
    listeners.get(event).push(callback);
  },

  off(event, callback) {
    const cbs = listeners.get(event);
    if (cbs) {
      listeners.set(event, cbs.filter((cb) => cb !== callback));
    }
  },

  emit(event, data) {
    const cbs = listeners.get(event);
    if (cbs) cbs.forEach((cb) => cb(data));
  },
};
