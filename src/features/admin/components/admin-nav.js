import { escapeHtml } from "../../../shared/utils/ui-helpers.js";
import { store } from "../../../shared/state/session-store.js";

export function adminNav(active) {
  const user = store.getUser();
  const links = [
    { href: "#/admin", label: "Panel", key: "dashboard" },
    { href: "#/admin/problems", label: "Ejercicios", key: "problems" },
    { href: "#/admin/users", label: "Usuarios", key: "users" },
    { href: "#/admin/generate", label: "Generar con IA", key: "generate" },
  ];

  return `
    <div class="border-b border-zinc-800 bg-zinc-950 sticky top-0 z-20">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-12 gap-4">
        <nav class="flex items-center gap-1 overflow-x-auto">
          ${links
            .map(
              (link) => `
            <a href="${link.href}" class="whitespace-nowrap px-3 py-1.5 rounded-md text-sm transition ${
              link.key === active
                ? "bg-brand text-white"
                : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800"
            }">${escapeHtml(link.label)}</a>
          `,
            )
            .join("")}
        </nav>
        <span class="text-xs text-zinc-500 shrink-0">${escapeHtml(user?.display_name || "Administrador")}</span>
      </div>
    </div>
  `;
}
