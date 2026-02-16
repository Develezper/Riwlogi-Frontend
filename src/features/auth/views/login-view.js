import { store } from "../../../shared/state/session-store.js";
import { router } from "../../../app/router.js";
import { showToast } from "../../../shared/utils/ui-helpers.js";
import { api } from "../../../shared/services/api/index.js";

export function loginView(container) {
  if (store.isAuthenticated()) {
    router.navigate("problems");
    return;
  }

  container.innerHTML = `
    <div class="flex items-center justify-center min-h-[calc(100vh-3.5rem)] px-4">
      <div class="w-full max-w-sm p-8 bg-zinc-900/60 border border-zinc-800 rounded-2xl">
        <div class="text-center mb-8">
          <h1 class="text-2xl font-bold text-white mb-2">Iniciar sesión</h1>
          <p class="text-zinc-400 text-sm">Usa tu cuenta para continuar resolviendo etapas.</p>
        </div>

        <form id="login-form" class="space-y-4" novalidate>
          <div>
            <label for="login-email" class="block text-sm text-zinc-400 mb-1">Email o username</label>
            <input id="login-email" type="text" name="email" required
              autocomplete="username"
              class="w-full px-3 py-2.5 bg-zinc-900 border border-zinc-700 rounded-lg text-white text-sm focus:outline-none focus:border-brand transition"
              placeholder="demo@riwlog.dev" />
          </div>
          <div>
            <label for="login-password" class="block text-sm text-zinc-400 mb-1">Contraseña</label>
            <input id="login-password" type="password" name="password" required
              autocomplete="current-password"
              class="w-full px-3 py-2.5 bg-zinc-900 border border-zinc-700 rounded-lg text-white text-sm focus:outline-none focus:border-brand transition"
              placeholder="123456" />
          </div>

          <button type="submit" id="btn-login"
            class="w-full py-2.5 bg-brand text-white rounded-lg font-medium hover:bg-brand-dark transition text-sm">
            Entrar
          </button>

          <p class="text-center text-sm text-zinc-500">
            ¿No tienes cuenta?
            <a href="#/register" class="text-brand hover:underline">Regístrate</a>
          </p>

          <p class="text-center text-xs text-zinc-600">
            Demo rápido: <span class="text-zinc-400">demo@riwlog.dev / 123456</span> ·
            <span class="text-zinc-400">admin@riwlog.dev / 123456</span>
          </p>
        </form>
      </div>
    </div>
  `;

  const form = container.querySelector("#login-form");
  const button = container.querySelector("#btn-login");

  const onSubmit = async (event) => {
    event.preventDefault();
    button.disabled = true;
    button.textContent = "Entrando...";

    const formData = new FormData(form);

    try {
      const response = await api.auth.login({
        email: formData.get("email"),
        password: formData.get("password"),
      });

      store.setAuth(response.access_token, response.user);
      showToast("Sesión iniciada.", "success");
      router.navigate("problems");
    } catch (error) {
      showToast(error.message, "error");
      button.disabled = false;
      button.textContent = "Entrar";
    }
  };

  form.addEventListener("submit", onSubmit);

  return () => {
    form.removeEventListener("submit", onSubmit);
  };
}
