import "../shared/styles/main.css";
import { router } from "./router.js";
import { renderNavbar } from "../shared/ui/navbar.js";
import { store } from "../shared/state/session-store.js";
import { api } from "../shared/services/api/index.js";

async function init() {
  try {
    await api.bootstrap();
  } catch (error) {
    const main = document.getElementById("main");
    if (main) {
      main.innerHTML = `
        <section class="max-w-2xl mx-auto px-4 py-16 text-center">
          <h1 class="text-2xl font-semibold text-zinc-100 mb-3">Error de Inicialización</h1>
          <p class="text-zinc-400 mb-2">No se pudo conectar con el backend.</p>
          <p class="text-sm text-zinc-500">${error?.message || "Error desconocido"}</p>
        </section>
      `;
    }
    return;
  }

  store.loadSession();

  renderNavbar();
  router.init();

  store.on("auth-change", () => {
    renderNavbar();
    router.refresh();
  });

  window.addEventListener("hashchange", () => {
    renderNavbar();
  });
}

document.addEventListener("DOMContentLoaded", () => {
  void init();
});
