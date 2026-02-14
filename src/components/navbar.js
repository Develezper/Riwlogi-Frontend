// Navbar Component 
import { store } from "../store/state.js";
import { router } from "../router/index.js";

export function renderNavbar() {
  const nav = document.getElementById("navbar");
  const user = store.getUser();
  const isAuth = store.isAuthenticated();

  nav.className =
    "sticky top-0 z-40 border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-md";

  nav.innerHTML = /* html */ `
    <div class="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
      <!-- Logo -->
      <a href="#/" class="flex items-center gap-2 font-bold text-lg text-white hover:text-brand transition">
        <svg class="w-7 h-7" viewBox="0 0 32 32" fill="none">
          <rect width="32" height="32" rx="6" fill="#7c3aed"/>
          <text x="16" y="22" text-anchor="middle" font-size="18" font-weight="bold" fill="white" font-family="system-ui">T</text>
        </svg>
        <span>Riwlogk</span>
      </a>

      <!-- Nav Links -->
      <div class="flex items-center gap-1">
        <a href="#/problems" class="nav-link px-3 py-1.5 rounded-md text-sm text-zinc-400 hover:text-white hover:bg-zinc-800 transition">
          Problemas
        </a>
        <a href="#/leaderboard" class="nav-link px-3 py-1.5 rounded-md text-sm text-zinc-400 hover:text-white hover:bg-zinc-800 transition">
          Leaderboard
        </a>

        ${
          isAuth
            ? /* html */`
          <a href="#/profile" class="nav-link px-3 py-1.5 rounded-md text-sm text-zinc-400 hover:text-white hover:bg-zinc-800 transition">
            ${user?.username || "Perfil"}
          </a>
          <button id="btn-logout" class="ml-2 px-3 py-1.5 rounded-md text-sm text-zinc-500 hover:text-red-400 hover:bg-zinc-800 transition">
            Salir
          </button>
        `
            : /* html */`
          <a href="#/login" class="ml-2 px-3 py-1.5 rounded-md text-sm text-zinc-400 hover:text-white hover:bg-zinc-800 transition">
            Entrar
          </a>
          <a href="#/register" class="ml-1 px-4 py-1.5 rounded-md text-sm bg-brand text-white hover:bg-brand-dark transition font-medium">
            Registrarse
          </a>
        `
        }
      </div>
    </div>
  `;

  // Logout handler 
  const logoutBtn = document.getElementById("btn-logout");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      store.logout();
      router.navigate("");
    });
  }
}
