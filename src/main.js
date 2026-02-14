/**
 * Entry point del SPA.
 * Inicializa router, auth state, y renderiza la app.
 */
import "./styles/main.css";
import { router } from "./router/index.js";
import { renderNavbar } from "./components/navbar.js";
import { store } from "./store/state.js";

// Inicializar 
function init() {
  // Restaurar sesión
  store.loadSession();

  // Renderizar navbar
  renderNavbar();

  // Iniciar router
  router.init();

  // Escuchar cambios de auth
  store.on("auth-change", () => {
    renderNavbar();
    router.refresh();
  });
}

document.addEventListener("DOMContentLoaded", init);
