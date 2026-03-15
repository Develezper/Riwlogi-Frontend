import { api } from "../../../shared/services/api/index.js";
import { escapeHtml, showToast, spinner } from "../../../shared/utils/ui-helpers.js";
import { adminNav } from "../components/admin-nav.js";
import { activityTypeLabel, formatDateTime, formatDuration, kpiCard } from "../utils/admin-utils.js";

const POLL_INTERVAL = 30_000;

function renderActivity(items = []) {
  if (!items.length) {
    return `<p class="text-sm text-zinc-500">Sin actividad reciente.</p>`;
  }

  return items
    .slice(0, 8)
    .map(
      (item) => `
      <div class="rounded-lg border border-zinc-800 px-3 py-2">
        <p class="text-sm text-zinc-100">${escapeHtml(item.label || "-")}</p>
        <p class="text-[11px] text-zinc-500 mt-0.5">
          ${escapeHtml(activityTypeLabel(item.type))} · ${escapeHtml(formatDateTime(item.created_at))}
        </p>
      </div>
    `,
    )
    .join("");
}

function renderDashboard(container, state) {
  if (state.loading) {
    container.innerHTML = `${adminNav("dashboard")}<div class="p-8">${spinner("lg")}</div>`;
    return;
  }

  if (state.error && !state.overview) {
    container.innerHTML = `
      ${adminNav("dashboard")}
      <section class="max-w-4xl mx-auto px-4 py-12 text-center">
        <h1 class="text-2xl font-semibold text-zinc-100">Panel de administración no disponible</h1>
        <p class="mt-3 text-zinc-400">${escapeHtml(state.error)}</p>
        <button data-action="refresh" class="mt-6 px-4 py-2 rounded-lg bg-brand text-white hover:bg-brand-dark transition">Reintentar</button>
      </section>
    `;
    return;
  }

  const overview = state.overview || { kpis: {}, recent_activity: [], updated_at: null };
  const kpis = overview.kpis || {};
  const activity = Array.isArray(overview.recent_activity) ? overview.recent_activity : [];

  container.innerHTML = `
    ${adminNav("dashboard")}
    <section class="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      <div class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 class="text-3xl font-bold text-zinc-100">Panel de administración</h1>
          <p class="text-zinc-400 mt-1">Visión general del sistema y accesos rápidos.</p>
          <p class="text-xs text-zinc-500 mt-1">Última actualización: ${escapeHtml(formatDateTime(overview.updated_at))}</p>
        </div>
        <button data-action="refresh" class="px-4 py-2 rounded-lg border border-zinc-700 text-zinc-200 hover:bg-zinc-800 transition">
          Refrescar datos
        </button>
      </div>

      ${
        state.error
          ? `<div class="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">${escapeHtml(state.error)}</div>`
          : ""
      }

      <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        ${kpiCard("Usuarios", kpis.total_users || 0, `${kpis.active_users_7d || 0} activos en 7 días`)}
        ${kpiCard("Problemas", kpis.total_problems || 0, `${kpis.published_problems || 0} publicados`)}
        ${kpiCard("Envíos", kpis.total_submissions || 0, `${kpis.accepted_submissions || 0} aceptados`)}
        ${kpiCard(
          "Aceptación",
          `${Number(kpis.acceptance_rate || 0).toFixed(1)}%`,
          `${kpis.ai_generated_problems || 0} generados por IA · ${formatDuration(kpis.avg_resolution_time_ms)} promedio`,
        )}
      </div>

      <div class="grid grid-cols-1 xl:grid-cols-[1fr_1fr] gap-6">
        <div class="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5">
          <h2 class="text-lg font-semibold text-zinc-100 mb-4">Accesos rápidos</h2>
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <a href="#/admin/problems" class="group rounded-xl border border-zinc-800 bg-zinc-900/40 p-4 hover:border-brand/40 hover:bg-zinc-900 transition">
              <p class="text-sm font-semibold text-zinc-100">Ejercicios</p>
              <p class="text-xs text-zinc-500 mt-1">Catálogo, estado y edición</p>
            </a>
            <a href="#/admin/users" class="group rounded-xl border border-zinc-800 bg-zinc-900/40 p-4 hover:border-brand/40 hover:bg-zinc-900 transition">
              <p class="text-sm font-semibold text-zinc-100">Usuarios</p>
              <p class="text-xs text-zinc-500 mt-1">Gestión y métricas</p>
            </a>
            <a href="#/admin/generate" class="group rounded-xl border border-zinc-800 bg-zinc-900/40 p-4 hover:border-brand/40 hover:bg-zinc-900 transition">
              <p class="text-sm font-semibold text-zinc-100">Generar con IA</p>
              <p class="text-xs text-zinc-500 mt-1">Crear ejercicios automáticos</p>
            </a>
          </div>
        </div>

        <div class="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5">
          <h2 class="text-lg font-semibold text-zinc-100 mb-4">Actividad reciente</h2>
          <div class="space-y-2">
            ${renderActivity(activity)}
          </div>
        </div>
      </div>
    </section>
  `;
}

export async function adminView(container) {
  const state = {
    loading: true,
    error: null,
    overview: null,
  };

  let isMounted = true;
  let pollId = null;

  async function loadData({ silent = false } = {}) {
    if (!isMounted) return;

    if (!silent && !state.overview) {
      state.loading = true;
      renderDashboard(container, state);
    }

    try {
      const overview = await api.admin.overview();
      if (!isMounted) return;
      state.overview = overview;
      state.error = null;
    } catch (error) {
      if (!isMounted) return;
      state.error = error?.message || "No se pudo cargar el panel de administración.";
      if (state.overview) {
        showToast(state.error, "error");
      }
    } finally {
      if (!isMounted) return;
      state.loading = false;
      renderDashboard(container, state);
    }
  }

  const onClick = async (event) => {
    const trigger = event.target.closest("[data-action]");
    if (!trigger || !container.contains(trigger)) return;

    if (trigger.dataset.action === "refresh") {
      await loadData();
    }
  };

  container.innerHTML = spinner("lg");
  container.addEventListener("click", onClick);

  await loadData();
  pollId = window.setInterval(() => loadData({ silent: true }), POLL_INTERVAL);

  return () => {
    isMounted = false;
    if (pollId) window.clearInterval(pollId);
    container.removeEventListener("click", onClick);
  };
}
