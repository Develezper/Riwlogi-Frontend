// Login View.

import { store } from "../store/state.js";
import { router } from "../router/index.js";
import { showToast } from "../utils/helpers.js";

export function loginView(container) {
  if (store.isAuthenticated()) {
    router.navigate("problems");
    return;
  }

  container.innerHTML = /* html */`
    <div class="flex items-center justify-center min-h-[calc(100vh-3.5rem)]">
      <div class="w-full max-w-sm p-8">
        <div class="text-center mb-8">
          <h1 class="text-2xl font-bold text-white mb-2">Iniciar Sesión</h1>
          <p class="text-zinc-400 text-sm">Entra a tu cuenta Riwlog</p>
        </div>

        <form id="login-form" class="space-y-4">
          <div>
            <label class="block text-sm text-zinc-400 mb-1">Email</label>
            <input type="email" name="email" required
              class="w-full px-3 py-2.5 bg-zinc-900 border border-zinc-700 rounded-lg text-white text-sm
                     focus:outline-none focus:border-brand transition"
              placeholder="tu@email.com" />
          </div>
          <div>
            <label class="block text-sm text-zinc-400 mb-1">Contraseña</label>
            <input type="password" name="password" required
              class="w-full px-3 py-2.5 bg-zinc-900 border border-zinc-700 rounded-lg text-white text-sm
                     focus:outline-none focus:border-brand transition"
              placeholder="••••••••" />
          </div>

          <button type="submit" id="btn-login"
            class="w-full py-2.5 bg-brand text-white rounded-lg font-medium hover:bg-brand-dark transition text-sm">
            Entrar
          </button>

          <p class="text-center text-sm text-zinc-500">
            ¿No tienes cuenta?
            <a href="#/register" class="text-brand hover:underline">Regístrate</a>
          </p>
        </form>
      </div>
    </div>
  `;

  container.querySelector("#login-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const btn = container.querySelector("#btn-login");
    btn.disabled = true;
    btn.textContent = "Entrando...";

    const formData = new FormData(e.target);

    try {
      const res = await api.auth.login({
        email: formData.get("email"),
        password: formData.get("password"),
      });
      store.setAuth(res.access_token, res.user);
      showToast("¡Bienvenido!", "success");
      router.navigate("problems");
    } catch (err) {
      showToast(err.message, "error");
      btn.disabled = false;
      btn.textContent = "Entrar";
    }
  });
}
