//  Riwlog — Utilidades de UI

//  Mapea dificultad numérica a label y clase CSS
export function difficultyBadge(difficulty) {
  const map = {
    1: { label: "Easy", class: "badge-easy" },
    2: { label: "Medium", class: "badge-medium" },
    3: { label: "Hard", class: "badge-hard" },
  };
  return map[difficulty] || map[1];
}

//Muestra un toast de notificación
export function showToast(message, type = "info", duration = 3000) {
  const container = document.getElementById("toast-container");
  const colors = {
    success: "bg-green-600",
    error: "bg-red-600",
    info: "bg-zinc-700",
  };

  const toast = document.createElement("div");
  toast.className = `${colors[type]} text-white px-4 py-3 rounded-lg shadow-lg animate-slide-in text-sm max-w-sm`;
  toast.textContent = message;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transition = "opacity 0.3s";
    setTimeout(() => toast.remove(), 300);
  }, duration);
}


//  Crea un spinner de carga
export function spinner(size = "md") {
  const sizes = { sm: "w-4 h-4", md: "w-6 h-6", lg: "w-10 h-10" };
  return `
    <div class="flex items-center justify-center p-8">
      <div class="${sizes[size]} border-2 border-zinc-600 border-t-brand rounded-full animate-spin"></div>
    </div>
  `;
}


//  Escapa HTML para prevenir XSS
export function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

//  Renderer Markdown básico (sin dependencias externas
export function renderMarkdown(md = "") {
  if (!md) return "";

  const blocks = md.replace(/\r\n/g, "\n").split("\n\n");

  return blocks
    .map((block) => {
      const lines = block.split("\n");

      if (lines.every((line) => /^\s*[-*]\s+/.test(line))) {
        const items = lines
          .map((line) => line.replace(/^\s*[-*]\s+/, "").trim())
          .filter(Boolean)
          .map((item) => `<li>${renderInline(item)}</li>`)
          .join("");
        return `<ul>${items}</ul>`;
      }

      const heading = lines[0].match(/^(#{1,6})\s+(.+)$/);
      if (heading) {
        const level = heading[1].length;
        return `<h${level}>${renderInline(heading[2].trim())}</h${level}>`;
      }

      const codeFence = block.match(/^```[\w-]*\n([\s\S]*?)\n```$/);
      if (codeFence) {
        return `<pre><code>${escapeHtml(codeFence[1])}</code></pre>`;
      }

      return `<p>${renderInline(lines.join("\n"))}</p>`;
    })
    .join("");
}

function renderInline(text) {
  let html = escapeHtml(text);
  html = html.replace(/`([^`]+)`/g, "<code>$1</code>");
  html = html.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  html = html.replace(/\*([^*]+)\*/g, "<em>$1</em>");
  html = html.replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
  html = html.replace(/\n/g, "<br>");
  return html;
}
