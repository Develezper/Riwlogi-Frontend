import { store } from "../state/session-store.js";
import { router } from "../../app/router.js";
import { api } from "../services/api/index.js";

const links = [
  { path: "problems", label: "Problemas" },
  { path: "leaderboard", label: "Leaderboard" },
];

let detachListeners = null;

function currentPath() {
  const hash = window.location.hash.slice(2) || "";
  if (!hash || hash === "problems" || hash.startsWith("problem/")) return "problems";
  return hash;
}

function isActive(path, activePath) {
  if (path === "problems") return activePath === "problems";
  return activePath.startsWith(path);
}

function linkClass(active) {
  return active
    ? "px-3 py-1.5 rounded-md text-sm bg-brand/15 text-brand border border-brand/40"
    : "px-3 py-1.5 rounded-md text-sm text-zinc-400 hover:text-white hover:bg-zinc-800 transition";
}

function escapeHtml(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function setupMenuListeners(nav) {
  const menuBtn = nav.querySelector("#btn-menu");
  const mobileMenu = nav.querySelector("#mobile-menu");

  if (!menuBtn || !mobileMenu) {
    detachListeners = null;
    return;
  }

  const closeMenu = () => {
    mobileMenu.classList.add("hidden");
    menuBtn.setAttribute("aria-expanded", "false");
  };

  const toggleMenu = () => {
    const isHidden = mobileMenu.classList.contains("hidden");
    if (isHidden) {
      mobileMenu.classList.remove("hidden");
      menuBtn.setAttribute("aria-expanded", "true");
    } else {
      closeMenu();
    }
  };

  const onKeyDown = (event) => {
    if (event.key === "Escape") closeMenu();
  };

  menuBtn.addEventListener("click", toggleMenu);
  window.addEventListener("keydown", onKeyDown);

  const mobileLinks = [...mobileMenu.querySelectorAll("a")];
  mobileLinks.forEach((link) => link.addEventListener("click", closeMenu));

  detachListeners = () => {
    menuBtn.removeEventListener("click", toggleMenu);
    window.removeEventListener("keydown", onKeyDown);
    mobileLinks.forEach((link) => link.removeEventListener("click", closeMenu));
  };
}

export function renderNavbar() {
  const nav = document.getElementById("navbar");
  if (!nav) return;

  if (detachListeners) {
    detachListeners();
    detachListeners = null;
  }

  const user = store.getUser();
  const isAuth = store.isAuthenticated();
  const activePath = currentPath();
  const runtime = api.getRuntime();
  const modeLabel = runtime.activeProvider === "remote" ? "API conectada" : "Modo local";
  const modeClass =
    runtime.activeProvider === "remote"
      ? "text-green-400 bg-green-500/10 border-green-500/30"
      : "text-amber-300 bg-amber-500/10 border-amber-500/30";

  nav.className = "sticky top-0 z-40 border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-md";

  nav.innerHTML = `
    <div class="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
      <a href="#/" class="flex items-center gap-2 font-bold text-lg text-white hover:text-brand transition">
        <svg class="w-7 h-7" viewBox="0 0 32 32" fill="none" aria-hidden="true">
          <rect width="32" height="32" rx="8" fill="#7c3aed"/>
          <text x="16" y="22" text-anchor="middle" font-size="16" font-weight="700" fill="white" font-family="ui-sans-serif">R</text>
        </svg>
        <span>Riwlog</span>
      </a>

      <button id="btn-menu" class="md:hidden p-2 rounded-md text-zinc-300 hover:bg-zinc-800" aria-label="Abrir menú" aria-expanded="false" aria-controls="mobile-menu">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/></svg>
      </button>

      <div class="hidden md:flex items-center gap-1">
        <span class="mr-2 px-2 py-0.5 rounded-full text-[11px] border ${modeClass}">
          ${modeLabel}
        </span>
        ${links
          .map(
            (link) => `
          <a href="#/${link.path}" class="${linkClass(isActive(link.path, activePath))}">
            ${link.label}
          </a>
        `,
          )
          .join("")}

        ${
          isAuth
            ? `
          <a href="#/profile" class="${linkClass(isActive("profile", activePath))}">
            ${escapeHtml(user?.username || "Perfil")}
          </a>
          <button id="btn-logout" class="ml-2 px-3 py-1.5 rounded-md text-sm text-zinc-500 hover:text-red-400 hover:bg-zinc-800 transition">
            Salir
          </button>
        `
            : `
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

    <div id="mobile-menu" class="md:hidden hidden border-t border-zinc-800 px-4 py-3 bg-zinc-950">
      <div class="flex flex-col gap-2">
        <div class="px-3 py-1 rounded-md text-xs border ${modeClass}">
          ${modeLabel}
        </div>
        ${links
          .map(
            (link) => `
          <a href="#/${link.path}" class="${linkClass(isActive(link.path, activePath))}">
            ${link.label}
          </a>
        `,
          )
          .join("")}

        ${
          isAuth
            ? `
          <a href="#/profile" class="${linkClass(isActive("profile", activePath))}">
            ${escapeHtml(user?.username || "Perfil")}
          </a>
          <button id="btn-logout-mobile" class="px-3 py-1.5 rounded-md text-sm text-zinc-500 hover:text-red-400 hover:bg-zinc-800 transition text-left">
            Salir
          </button>
        `
            : `
          <a href="#/login" class="px-3 py-1.5 rounded-md text-sm text-zinc-400 hover:text-white hover:bg-zinc-800 transition">
            Entrar
          </a>
          <a href="#/register" class="px-3 py-1.5 rounded-md text-sm bg-brand text-white hover:bg-brand-dark transition font-medium text-center">
            Registrarse
          </a>
        `
        }
      </div>
    </div>
  `;

  setupMenuListeners(nav);

  const logoutBtn = nav.querySelector("#btn-logout");
  const logoutBtnMobile = nav.querySelector("#btn-logout-mobile");
  [logoutBtn, logoutBtnMobile].forEach((button) => {
    if (!button) return;
    button.addEventListener("click", () => {
      store.logout();
      router.navigate("");
    });
  });
}
