import { store } from "../state/session-store.js";
import { router } from "../../app/router.js";
import { api } from "../services/api/index.js";
import { withViewTransition } from "../utils/ui-helpers.js";

const publicLinks = [
  { path: "problems", label: "Problemas" },
  { path: "leaderboard", label: "Clasificación" },
];

const THEME_KEY = "Riwlog_theme";
const FOCUS_KEY = "Riwlog_focus";
const themes = [
  { value: "dark-modern", label: "Modo oscuro" },
  { value: "light-sky", label: "Modo claro" },
  { value: "competition", label: "Modo competencia" },
];

let detachListeners = null;
let detachFocusFab = null;

function getStoredTheme() {
  const stored = window.localStorage.getItem(THEME_KEY);
  if (themes.some((theme) => theme.value === stored)) return stored;
  return "dark-modern";
}

function applyTheme(themeValue) {
  const resolved = themes.some((theme) => theme.value === themeValue) ? themeValue : "dark-modern";
  withViewTransition(() => {
    document.body.dataset.theme = resolved;
  });
  window.localStorage.setItem(THEME_KEY, resolved);
  return resolved;
}

function getStoredFocus() {
  return window.localStorage.getItem(FOCUS_KEY) === "on";
}

function applyFocus(enabled) {
  const value = enabled ? "on" : "off";
  document.body.dataset.focus = value;
  window.localStorage.setItem(FOCUS_KEY, value);
  return value;
}

function focusButtonLabel(isOn) {
  return isOn ? "Salir Focus" : "Modo Focus";
}

function renderFocusFab(currentTheme, focusOn) {
  const fab = document.getElementById("focus-fab");
  if (!fab) return;

  if (detachFocusFab) {
    detachFocusFab();
    detachFocusFab = null;
  }

  if (!focusOn) {
    fab.className = "hidden";
    fab.innerHTML = "";
    return;
  }

  fab.className = "focus-fab";
  fab.innerHTML = `
    <div class="focus-fab-panel">
      <button id="focus-fab-toggle" class="focus-fab-toggle" aria-haspopup="true" aria-expanded="false">
        Focus
      </button>
      <div id="focus-fab-menu" class="focus-fab-menu" role="menu" aria-label="Menú de Focus">
        <div class="focus-fab-title">Temas</div>
        ${themes
          .map(
            (theme) => `
          <button type="button" class="focus-fab-item" data-theme="${theme.value}" role="menuitem">
            ${theme.label}
          </button>
        `,
          )
          .join("")}
        <div class="focus-fab-divider"></div>
        <button type="button" class="focus-fab-item focus-fab-exit" data-exit="true" role="menuitem">
          Salir Focus
        </button>
      </div>
    </div>
  `;

  const toggle = fab.querySelector("#focus-fab-toggle");
  const menu = fab.querySelector("#focus-fab-menu");
  const setMenuOpen = (open) => {
    if (!menu || !toggle) return;
    menu.classList.toggle("open", open);
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
  };

  toggle?.addEventListener("click", () => {
    const isOpen = menu?.classList.contains("open");
    setMenuOpen(!isOpen);
  });

  menu?.addEventListener("click", (event) => {
    const target = event.target?.closest("button");
    if (!target) return;
    if (target.dataset.exit === "true") {
      applyFocus(false);
      renderFocusFab(currentTheme, false);
      return;
    }
    const nextTheme = target.dataset.theme;
    if (nextTheme) {
      applyTheme(nextTheme);
      renderFocusFab(nextTheme, true);
    }
  });

  const onOutsideClick = (event) => {
    if (!fab.contains(event.target)) setMenuOpen(false);
  };
  window.addEventListener("click", onOutsideClick, { capture: true });

  const onEscape = (event) => {
    if (event.key === "Escape") setMenuOpen(false);
  };
  window.addEventListener("keydown", onEscape);

  detachFocusFab = () => {
    window.removeEventListener("click", onOutsideClick, { capture: true });
    window.removeEventListener("keydown", onEscape);
  };

  // Ensure highlight by setting current theme on re-render.
  const activeItem = fab.querySelector(`[data-theme="${currentTheme}"]`);
  if (activeItem) activeItem.classList.add("active");
}

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

function avatarLinkClass(active) {
  return active
    ? "ml-2 w-9 h-9 rounded-full border border-brand/60 bg-zinc-900/60 shadow-md overflow-hidden flex items-center justify-center"
    : "ml-2 w-9 h-9 rounded-full border border-zinc-700 bg-zinc-900/60 hover:border-brand/60 transition overflow-hidden flex items-center justify-center";
}

function escapeHtml(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function avatarSvgDataUrl(label) {
  const safeLabel = escapeHtml(label || "U");
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64">
      <defs>
        <linearGradient id="g" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stop-color="#7c3aed"/>
          <stop offset="100%" stop-color="#a78bfa"/>
        </linearGradient>
      </defs>
      <rect width="64" height="64" rx="32" fill="url(#g)"/>
      <text x="32" y="40" text-anchor="middle" font-size="28" font-weight="700" fill="white" font-family="ui-sans-serif, system-ui">${safeLabel}</text>
    </svg>
  `;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
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
  const isAdmin = isAuth && user?.role === "admin";
  const links = isAdmin ? [...publicLinks, { path: "admin", label: "Administración" }] : publicLinks;
  const activePath = currentPath();
  const showProfileLink = isAuth && !isAdmin;
  const displayName = user?.display_name || user?.username || "Usuario";
  const avatarInitial = String(displayName).trim()[0]?.toUpperCase() || "U";
  const avatarSrc = avatarSvgDataUrl(avatarInitial);

  nav.className = "sticky top-0 z-40 border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-md";
  const currentTheme = applyTheme(getStoredTheme());
  const focusState = applyFocus(getStoredFocus());
  const focusOn = focusState === "on";

  nav.innerHTML = `
    <div class="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
      <a href="#/" class="flex items-center gap-2 font-bold text-lg text-white hover:text-brand transition">
        <svg class="w-7 h-7" viewBox="0 0 32 32" fill="none" aria-hidden="true">
          <rect width="32" height="32" rx="8" fill="#7c3aed"/>
          <text x="16" y="22" text-anchor="middle" font-size="16" font-weight="700" fill="white" font-family="ui-sans-serif">R</text>
        </svg>
        <span>Riwlogic</span>
      </a>

      <button id="btn-menu" class="md:hidden p-2 rounded-md text-zinc-300 hover:bg-zinc-800" aria-label="Abrir menú" aria-expanded="false" aria-controls="mobile-menu">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/></svg>
      </button>

      <div class="hidden md:flex items-center gap-1">
        ${links
          .map(
            (link) => `
          <a href="#/${link.path}" class="${linkClass(isActive(link.path, activePath))}">
            ${link.label}
          </a>
        `,
          )
          .join("")}

        <div class="ml-2">
          <label class="sr-only" for="theme-select">Tema</label>
          <select
            id="theme-select"
            class="theme-select px-2 py-1.5 rounded-md text-sm bg-zinc-900 border border-zinc-700 text-zinc-200 focus:outline-none focus:border-brand transition"
            aria-label="Seleccionar tema"
          >
            ${themes
              .map((theme) => `<option value="${theme.value}">${theme.label}</option>`)
              .join("")}
          </select>
        </div>

        <button
          id="btn-focus"
          class="ml-2 px-3 py-1.5 rounded-md text-sm border border-zinc-700 text-zinc-300 hover:text-white hover:bg-zinc-800 transition"
          aria-pressed="${focusOn ? "true" : "false"}"
        >
          ${focusButtonLabel(focusOn)}
        </button>

        ${
          isAuth
            ? `
          ${
            showProfileLink
              ? `
          <a
            href="#/profile"
            class="${avatarLinkClass(isActive("profile", activePath))}"
            aria-label="Ir al perfil"
            title="${escapeHtml(displayName)}"
          >
            <img src="${avatarSrc}" alt="Avatar de ${escapeHtml(displayName)}" class="w-full h-full object-cover" />
          </a>
        `
              : ""
          }
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
        ${links
          .map(
            (link) => `
          <a href="#/${link.path}" class="${linkClass(isActive(link.path, activePath))}">
            ${link.label}
          </a>
        `,
          )
          .join("")}

        <div class="pt-2">
          <label class="block text-xs text-zinc-500 mb-1" for="theme-select-mobile">Tema</label>
          <select
            id="theme-select-mobile"
            class="theme-select w-full px-3 py-2 rounded-md text-sm bg-zinc-900 border border-zinc-700 text-zinc-200 focus:outline-none focus:border-brand transition"
            aria-label="Seleccionar tema"
          >
            ${themes
              .map((theme) => `<option value="${theme.value}">${theme.label}</option>`)
              .join("")}
          </select>
        </div>

        <button
          id="btn-focus-mobile"
          class="mt-2 px-3 py-2 rounded-md text-sm border border-zinc-700 text-zinc-300 hover:text-white hover:bg-zinc-800 transition text-left"
          aria-pressed="${focusOn ? "true" : "false"}"
        >
          ${focusButtonLabel(focusOn)}
        </button>

        ${
          isAuth
            ? `
          ${
            showProfileLink
              ? `
          <a
            href="#/profile"
            class="${avatarLinkClass(isActive("profile", activePath))}"
            aria-label="Ir al perfil"
            title="${escapeHtml(displayName)}"
          >
            <img src="${avatarSrc}" alt="Avatar de ${escapeHtml(displayName)}" class="w-full h-full object-cover" />
          </a>
        `
              : ""
          }
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

  const themeSelects = [...nav.querySelectorAll(".theme-select")];
  themeSelects.forEach((select) => {
    select.value = currentTheme;
    select.addEventListener("change", (event) => {
      const nextTheme = applyTheme(event.target.value);
      themeSelects.forEach((other) => {
        if (other !== event.target) other.value = nextTheme;
      });
    });
  });

  const focusButtons = [
    nav.querySelector("#btn-focus"),
    nav.querySelector("#btn-focus-mobile"),
  ].filter(Boolean);
  focusButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const next = applyFocus(document.body.dataset.focus !== "on");
      const isOn = next === "on";
      renderFocusFab(currentTheme, isOn);
      focusButtons.forEach((btn) => {
        btn.textContent = focusButtonLabel(isOn);
        btn.setAttribute("aria-pressed", isOn ? "true" : "false");
      });
    });
  });

  renderFocusFab(currentTheme, focusOn);

  const logoutBtn = nav.querySelector("#btn-logout");
  const logoutBtnMobile = nav.querySelector("#btn-logout-mobile");
  [logoutBtn, logoutBtnMobile].forEach((button) => {
    if (!button) return;
    button.addEventListener("click", async () => {
      try {
        await api.auth.logout();
      } catch {
        /* ignore logout errors */
      }
      store.logout();
      router.navigate("");
    });
  });
}
