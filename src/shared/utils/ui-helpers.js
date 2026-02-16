import { marked } from "marked";

const ALLOWED_TAGS = new Set([
  "p",
  "br",
  "strong",
  "em",
  "code",
  "pre",
  "ul",
  "ol",
  "li",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "a",
  "blockquote",
  "hr",
  "table",
  "thead",
  "tbody",
  "tr",
  "th",
  "td",
]);

const GLOBAL_ALLOWED_ATTRIBUTES = new Set(["class"]);
const TAG_ALLOWED_ATTRIBUTES = {
  a: new Set(["href", "title", "target", "rel"]),
  code: new Set(["class"]),
};

marked.setOptions({
  gfm: true,
  breaks: true,
  async: false,
});

export function difficultyBadge(difficulty) {
  const map = {
    1: { label: "Easy", class: "badge-easy" },
    2: { label: "Medium", class: "badge-medium" },
    3: { label: "Hard", class: "badge-hard" },
  };
  return map[difficulty] || map[1];
}

export function showToast(message, type = "info", duration = 3000) {
  const container = document.getElementById("toast-container");
  if (!container) return;

  const colors = {
    success: "bg-green-600",
    error: "bg-red-600",
    info: "bg-zinc-700",
  };

  const toast = document.createElement("div");
  toast.className = `${colors[type] || colors.info} text-white px-4 py-3 rounded-lg shadow-lg animate-slide-in text-sm max-w-sm`;
  toast.setAttribute("role", "status");
  toast.setAttribute("aria-live", "polite");
  toast.textContent = String(message || "");

  container.appendChild(toast);

  window.setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transition = "opacity 0.3s";
    window.setTimeout(() => toast.remove(), 300);
  }, duration);
}

export function spinner(size = "md") {
  const sizes = { sm: "w-4 h-4", md: "w-6 h-6", lg: "w-10 h-10" };
  return `
    <div class="flex items-center justify-center p-8" role="status" aria-live="polite" aria-label="Cargando contenido">
      <div class="${sizes[size] || sizes.md} border-2 border-zinc-600 border-t-brand rounded-full animate-spin"></div>
    </div>
  `;
}

export function escapeHtml(value) {
  const div = document.createElement("div");
  div.textContent = String(value || "");
  return div.innerHTML;
}

function sanitizeUrl(value) {
  const url = String(value || "").trim();
  if (!url) return "#";

  if (url.startsWith("#")) return url;

  try {
    const parsed = new URL(url, window.location.origin);
    const allowedProtocols = new Set(["http:", "https:", "mailto:"]);
    return allowedProtocols.has(parsed.protocol) ? parsed.toString() : "#";
  } catch {
    return "#";
  }
}

function sanitizeHtml(dirtyHtml) {
  if (typeof DOMParser === "undefined") {
    return escapeHtml(dirtyHtml);
  }

  const parser = new DOMParser();
  const doc = parser.parseFromString(`<div>${dirtyHtml}</div>`, "text/html");
  const root = doc.body.firstElementChild;

  if (!root) return "";

  const elements = [];
  const walker = doc.createTreeWalker(root, NodeFilter.SHOW_ELEMENT);
  while (walker.nextNode()) {
    elements.push(walker.currentNode);
  }

  elements.forEach((element) => {
    const tagName = element.tagName.toLowerCase();

    if (!ALLOWED_TAGS.has(tagName)) {
      const fragment = doc.createDocumentFragment();
      while (element.firstChild) {
        fragment.appendChild(element.firstChild);
      }
      element.replaceWith(fragment);
      return;
    }

    [...element.attributes].forEach((attribute) => {
      const name = attribute.name.toLowerCase();
      const isEventHandler = name.startsWith("on");
      const globallyAllowed = GLOBAL_ALLOWED_ATTRIBUTES.has(name);
      const tagAllowed = TAG_ALLOWED_ATTRIBUTES[tagName]?.has(name) || false;

      if (isEventHandler || (!globallyAllowed && !tagAllowed)) {
        element.removeAttribute(attribute.name);
      }
    });

    if (tagName === "a") {
      const href = sanitizeUrl(element.getAttribute("href"));
      element.setAttribute("href", href);

      const target = element.getAttribute("target");
      if (target === "_blank") {
        element.setAttribute("rel", "noopener noreferrer nofollow");
      } else {
        element.removeAttribute("target");
        element.removeAttribute("rel");
      }
    }
  });

  return root.innerHTML;
}

export function renderMarkdown(md = "") {
  if (!md) return "";

  const markdown = String(md || "").replace(/\r\n/g, "\n");

  const rawHtml = marked.parse(markdown, {
    mangle: false,
    headerIds: false,
  });

  return sanitizeHtml(rawHtml);
}
