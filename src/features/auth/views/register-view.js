import { store } from "../../../shared/state/session-store.js";
import { router } from "../../../app/router.js";
import { showToast } from "../../../shared/utils/ui-helpers.js";
import { api } from "../../../shared/services/api/index.js";

export function registerView(container) {
  if (store.isAuthenticated()) {
    router.navigate("problems");
    return;
  }

  container.innerHTML = `
    <div class="flex items-center justify-center min-h-[calc(100vh-3.5rem)] px-4">
      <div class="w-full max-w-sm p-8 bg-zinc-900/60 border border-zinc-800 rounded-2xl">
        <div class="text-center mb-8">
          <h1 class="text-2xl font-bold text-white mb-2">Crear cuenta</h1>
          <p class="text-zinc-400 text-sm">Empieza a competir por etapas hoy.</p>
        </div>

        <form id="register-form" class="space-y-4" novalidate>
          <div>
            <label for="register-username" class="block text-sm text-zinc-400 mb-1">Username</label>
            <input id="register-username" type="text" name="username" required minlength="3" maxlength="50"
              autocomplete="username"
              class="w-full px-3 py-2.5 bg-zinc-900 border border-zinc-700 rounded-lg text-white text-sm focus:outline-none focus:border-brand transition"
              placeholder="tu_username" />
          </div>
          <div>
            <label for="register-email" class="block text-sm text-zinc-400 mb-1">Email</label>
            <input id="register-email" type="email" name="email" required
              autocomplete="email"
              class="w-full px-3 py-2.5 bg-zinc-900 border border-zinc-700 rounded-lg text-white text-sm focus:outline-none focus:border-brand transition"
              placeholder="tu@email.com" />
          </div>
          <div>
            <label for="register-password" class="block text-sm text-zinc-400 mb-1">Contraseña</label>
            <input id="register-password" type="password" name="password" required minlength="6"
              autocomplete="new-password"
              class="w-full px-3 py-2.5 bg-zinc-900 border border-zinc-700 rounded-lg text-white text-sm focus:outline-none focus:border-brand transition"
              placeholder="Mínimo 6 caracteres" />
          </div>

          <button type="submit" id="btn-register"
            class="w-full py-2.5 bg-brand text-white rounded-lg font-medium hover:bg-brand-dark transition text-sm">
            Registrarse
          </button>

          <p class="text-center text-sm text-zinc-500">
            ¿Ya tienes cuenta?
            <a href="#/login" class="text-brand hover:underline">Inicia sesión</a>
          </p>
        </form>
      </div>
    </div>
  `;

  const form = container.querySelector("#register-form");
  const button = container.querySelector("#btn-register");

  const onSubmit = async (event) => {
    event.preventDefault();
    button.disabled = true;
    button.textContent = "Creando cuenta...";

    const formData = new FormData(form);

    try {
      const response = await api.auth.register({
        username: formData.get("username"),
        email: formData.get("email"),
        password: formData.get("password"),
      });

      store.setAuth(response.access_token, response.user);
      showToast("Cuenta creada correctamente.", "success");
      router.navigate("problems");
    } catch (error) {
      showToast(error.message, "error");
      button.disabled = false;
      button.textContent = "Registrarse";
    }
  };

  form.addEventListener("submit", onSubmit);

  return () => {
    form.removeEventListener("submit", onSubmit);
  };
}
