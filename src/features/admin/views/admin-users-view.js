import { api } from "../../../shared/services/api/index.js";
import { escapeHtml, showToast, spinner } from "../../../shared/utils/ui-helpers.js";
import { adminNav } from "../components/admin-nav.js";
import { roleLabel, formatLastActive, kpiCard } from "../utils/admin-utils.js";

function renderView(container, state) {
  if (state.loading) {
    container.innerHTML = `${adminNav("users")}<div class="p-8">${spinner("lg")}</div>`;
    return;
  }

  const users = Array.isArray(state.users) ? state.users : [];
  const totalAdmins = users.filter((u) => u.is_admin || u.role === "admin").length;
  const activeRecently = users.filter((u) => {
    if (!u.last_active_at) return false;
    const d = new Date(u.last_active_at).getTime();
    return !Number.isNaN(d) && d > Date.now() - 7 * 24 * 60 * 60 * 1000;
  }).length;

  container.innerHTML = `
    ${adminNav("users")}
    <section class="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      <div class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 class="text-2xl font-bold text-zinc-100">Control de usuarios</h1>
          <p class="text-zinc-400 text-sm mt-1">${escapeHtml(String(users.length))} usuarios registrados</p>
        </div>
        <button data-action="refresh" class="px-4 py-2 rounded-lg border border-zinc-700 text-zinc-200 hover:bg-zinc-800 transition text-sm self-start">
          Refrescar
        </button>
      </div>

      ${state.error ? `<div class="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">${escapeHtml(state.error)}</div>` : ""}

      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
        ${kpiCard("Total usuarios", users.length, `${totalAdmins} administradores`)}
        ${kpiCard("Activos (7 días)", activeRecently, "con actividad reciente")}
        ${kpiCard("Usuarios estándar", users.length - totalAdmins, "sin rol administrador")}
      </div>

      <div class="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5 overflow-x-auto">
        <table class="w-full min-w-[700px] text-sm">
          <thead>
            <tr class="text-left text-zinc-500 border-b border-zinc-800">
              <th class="py-2 pr-3 font-medium">Usuario</th>
              <th class="py-2 pr-3 font-medium">Rol</th>
              <th class="py-2 pr-3 font-medium">Envíos</th>
              <th class="py-2 pr-3 font-medium">Resueltos</th>
              <th class="py-2 pr-3 font-medium">Última actividad</th>
              <th class="py-2 font-medium">Acciones</th>
            </tr>
          </thead>
          <tbody>
            ${
              users.length
                ? users
                    .map(
                      (user) => `
                    <tr class="border-b border-zinc-800/60">
                      <td class="py-3 pr-3">
                        <p class="text-zinc-100 font-medium">${escapeHtml(user.display_name || user.username)}</p>
                        <p class="text-xs text-zinc-500">${escapeHtml(user.email)}</p>
                      </td>
                      <td class="py-3 pr-3">
                        <span class="inline-flex px-2 py-1 rounded-full text-xs border ${
                          user.is_admin || user.role === "admin"
                            ? "text-brand bg-brand/10 border-brand/30"
                            : "text-zinc-300 bg-zinc-700/30 border-zinc-600/40"
                        }">${escapeHtml(roleLabel(user.role, user.is_admin))}</span>
                      </td>
                      <td class="py-3 pr-3 text-zinc-300">${escapeHtml(String(user.submissions_count || 0))}</td>
                      <td class="py-3 pr-3 text-zinc-300">${escapeHtml(String(user.solved_count || 0))}</td>
                      <td class="py-3 pr-3 text-zinc-500 text-xs">${escapeHtml(formatLastActive(user.last_active_at))}</td>
                      <td class="py-3">
                        ${
                          user.is_admin || user.role === "admin"
                            ? `<span class="text-xs text-zinc-500">Protegido</span>`
                            : `<button data-action="delete-user" data-user-id="${escapeHtml(user.id)}" class="px-2 py-1 rounded border border-red-500/30 text-red-300 hover:bg-red-500/10 transition text-xs">Eliminar</button>`
                        }
                      </td>
                    </tr>
                  `,
                    )
                    .join("")
                : `<tr><td colspan="6" class="py-8 text-center text-zinc-500 text-sm">No hay usuarios para mostrar.</td></tr>`
            }
          </tbody>
        </table>
      </div>
    </section>
  `;
}

export async function adminUsersView(container) {
  const state = { loading: true, error: null, users: [] };
  let isMounted = true;

  async function loadData() {
    if (!isMounted) return;
    if (!state.users.length) {
      state.loading = true;
      renderView(container, state);
    }
    try {
      state.users = await api.admin.users();
      state.error = null;
    } catch (error) {
      state.error = error?.message || "No se pudo cargar la lista de usuarios.";
      if (state.users.length) showToast(state.error, "error");
    } finally {
      if (!isMounted) return;
      state.loading = false;
      renderView(container, state);
    }
  }

  container.innerHTML = `${adminNav("users")}<div class="p-8">${spinner("lg")}</div>`;

  const onClick = async (event) => {
    const trigger = event.target.closest("[data-action]");
    if (!trigger || !container.contains(trigger)) return;

    const action = trigger.dataset.action;

    if (action === "refresh") {
      await loadData();
      return;
    }

    if (action === "delete-user") {
      const userId = String(trigger.dataset.userId || "").trim();
      if (!userId) return;
      if (
        !window.confirm(
          "¿Eliminar este usuario y todos sus datos? Esta acción no se puede deshacer.",
        )
      )
        return;
      try {
        await api.admin.deleteUser(userId);
        showToast("Usuario eliminado.", "success");
        await loadData();
      } catch (error) {
        showToast(error?.message || "No se pudo eliminar el usuario.", "error");
      }
    }
  };

  container.addEventListener("click", onClick);
  await loadData();

  return () => {
    isMounted = false;
    container.removeEventListener("click", onClick);
  };
}
