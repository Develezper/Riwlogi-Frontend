import { problemsHomeView } from "../features/problems/views/problems-home-view.js";
import { problemSolverView } from "../features/problems/views/problem-solver-view.js";
import { leaderboardView } from "../features/leaderboard/views/leaderboard-view.js";
import { profileView } from "../features/profile/views/profile-view.js";
import { loginView } from "../features/auth/views/login-view.js";
import { registerView } from "../features/auth/views/register-view.js";
import { adminView } from "../features/admin/views/admin-view.js";
import { store } from "../shared/state/session-store.js";

const routes = [
  { path: "", view: problemsHomeView },
  { path: "problems", view: problemsHomeView },
  { path: "problem/:slug", view: problemSolverView, auth: true },
  { path: "leaderboard", view: leaderboardView },
  { path: "profile", view: profileView, auth: true },
  { path: "admin", view: adminView, auth: true },
  { path: "login", view: loginView },
  { path: "register", view: registerView },
];

let activeCleanup = null;
let renderToken = 0;

function cleanupView() {
  if (typeof activeCleanup === "function") {
    try {
      activeCleanup();
    } catch {
      // Ignore cleanup errors from previous view.
    }
  }

  activeCleanup = null;
}

export const router = {
  init() {
    window.addEventListener("hashchange", () => this._resolve());
    this._resolve();
  },

  navigate(path) {
    window.location.hash = `#/${path}`;
  },

  refresh() {
    this._resolve();
  },

  _resolve() {
    const hash = window.location.hash.slice(2) || "";
    const main = document.getElementById("main");

    let matchedRoute = null;
    let params = {};

    for (const route of routes) {
      const result = this._match(route.path, hash);
      if (result) {
        matchedRoute = route;
        params = result;
        break;
      }
    }

    if (!matchedRoute) {
      cleanupView();
      main.innerHTML = `
        <div class="flex items-center justify-center h-[60vh] px-4">
          <div class="text-center">
            <h1 class="text-6xl font-bold text-zinc-700 mb-4">404</h1>
            <p class="text-zinc-400 mb-6">Página no encontrada</p>
            <a href="#/" class="px-4 py-2 bg-brand rounded-lg text-white hover:bg-brand-dark transition">
              Volver al inicio
            </a>
          </div>
        </div>
      `;
      return;
    }

    if (matchedRoute.auth && !store.isAuthenticated()) {
      this.navigate("login");
      return;
    }

    this._render(main, matchedRoute, params);
  },

  _render(main, route, params) {
    const currentToken = ++renderToken;
    cleanupView();

    main.innerHTML = "";
    main.classList.add("animate-fade-in");

    Promise.resolve(route.view(main, params))
      .then((cleanup) => {
        if (currentToken !== renderToken) {
          if (typeof cleanup === "function") cleanup();
          return;
        }

        activeCleanup = typeof cleanup === "function" ? cleanup : null;
        if (typeof main.focus === "function") {
          main.focus();
        }
      })
      .catch((error) => {
        main.innerHTML = `
          <div class="flex items-center justify-center h-[60vh] px-4">
            <div class="text-center text-zinc-500">
              <p class="text-lg mb-2">Error al renderizar la vista</p>
              <p class="text-sm">${error?.message || "Error desconocido"}</p>
            </div>
          </div>
        `;
      })
      .finally(() => {
        window.setTimeout(() => {
          main.classList.remove("animate-fade-in");
        }, 300);
      });
  },

  _match(pattern, hash) {
    const patternParts = pattern.split("/").filter(Boolean);
    const hashParts = hash.split("/").filter(Boolean);

    if (patternParts.length !== hashParts.length) return null;

    const params = {};
    for (let i = 0; i < patternParts.length; i += 1) {
      if (patternParts[i].startsWith(":")) {
        params[patternParts[i].slice(1)] = decodeURIComponent(hashParts[i]);
      } else if (patternParts[i] !== hashParts[i]) {
        return null;
      }
    }

    return params;
  },
};
