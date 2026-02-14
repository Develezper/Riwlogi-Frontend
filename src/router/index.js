/**
 * Router (Observer pattern).
 * Hash-based routing para máxima compatibilidad.
 */

import { homeView } from "../views/home.js";
import { problemView } from "../views/problem.js";
import { leaderboardView } from "../views/leaderboard.js";
import { profileView } from "../views/profile.js";
import { loginView } from "../views/login.js";
import { registerView } from "../views/register.js";


const routes = [
  { path: "",              view: homeView },
  { path: "problems",      view: homeView },
  { path: "problem/:slug", view: problemView, auth: true },
  { path: "leaderboard",   view: leaderboardView },
  { path: "profile",       view: profileView, auth: true },
  { path: "login",         view: loginView },
  { path: "register",      view: registerView },
];

export const router = {

  // Inicializa el router

  init() {
    window.addEventListener("hashchange", () => this._resolve());
    this._resolve();
  },


  //  Navega a una ruta.
  navigate(path) {
    window.location.hash = `#/${path}`;
  },


  //  Re-renderiza la vista actual

  refresh() {
    this._resolve();
  },

  // Resuelve la ruta actual y renderiza la vista

  _resolve() {
    const hash = window.location.hash.slice(2) || ""; // quita #/
    const main = document.getElementById("main");

    // Buscar ruta que coincida
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
      main.innerHTML = `
        <div class="flex items-center justify-center h-[60vh]">
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

    // Check auth
    if (matchedRoute.auth) {
      // Import dinámico para evitar dependencia circular
      import("../store/state.js").then(({ store }) => {
        if (!store.isAuthenticated()) {
          this.navigate("login");
          return;
        }
        this._render(main, matchedRoute, params);
      });
      return;
    }

    // Renderizar
    this._render(main, matchedRoute, params);
  },

  // Renderiza una vista en el contenedor

  _render(main, route, params) {
    main.innerHTML = "";
    main.classList.add("animate-fade-in");
    route.view(main, params);

    // Limpiar animación
    setTimeout(() => main.classList.remove("animate-fade-in"), 300);
  },


  //  Compara un patrón de ruta con el hash actual

  _match(pattern, hash) {
    const patternParts = pattern.split("/").filter(Boolean);
    const hashParts = hash.split("/").filter(Boolean);

    if (patternParts.length !== hashParts.length) return null;

    const params = {};
    for (let i = 0; i < patternParts.length; i++) {
      if (patternParts[i].startsWith(":")) {
        params[patternParts[i].slice(1)] = hashParts[i];
      } else if (patternParts[i] !== hashParts[i]) {
        return null;
      }
    }

    return params;
  },
};
