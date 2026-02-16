import "./app/bootstrap.js";

const app = document.querySelector("#app");

if (app) {
  app.innerHTML = `
    <a href="#main" class="skip-link">Saltar al contenido principal</a>
    <div class="min-h-screen bg-zinc-950 text-zinc-100">
      <header id="navbar" aria-label="Navegacion principal"></header>
      <main id="main" tabindex="-1" class="pb-10"></main>
      <div
        id="toast-container"
        class="fixed bottom-4 right-4 z-50 flex flex-col gap-2"
        aria-live="polite"
        aria-atomic="true"
      ></div>
    </div>
  `;
}
