/**
 * Anti-cheat protections for the problem solver view.
 *
 * - Blocks copy/cut/context-menu on the problem statement section
 * - Shows a black overlay when the tab/window loses visibility
 * - Blocks print and save keyboard shortcuts
 * - Reports all attempts to the EditorTracker for backend analysis
 */

const OVERLAY_ID = "anti-cheat-overlay";

export function activateAntiCheat(container, tracker) {
  const cleanups = [];

  setupCopyProtection(container, tracker, cleanups);
  setupVisibilityOverlay(container, tracker, cleanups);
  setupKeyboardBlocking(container, tracker, cleanups);
  injectPrintBlockStyles(cleanups);

  return () => {
    cleanups.forEach((fn) => {
      try {
        fn();
      } catch {
        // Ignore cleanup errors.
      }
    });
  };
}

// --- Copy / cut / context-menu protection on statement area ---

function getStatementSection(container) {
  return container.querySelector("section:first-of-type");
}

function setupCopyProtection(container, tracker, cleanups) {
  const section = getStatementSection(container);
  if (!section) return;

  const block = (event) => {
    event.preventDefault();
    tracker?.onCopyAttempt();
  };

  const blockContext = (event) => {
    event.preventDefault();
  };

  section.addEventListener("copy", block);
  section.addEventListener("cut", block);
  section.addEventListener("contextmenu", blockContext);

  cleanups.push(() => section.removeEventListener("copy", block));
  cleanups.push(() => section.removeEventListener("cut", block));
  cleanups.push(() => section.removeEventListener("contextmenu", blockContext));
}

// --- Visibility overlay ---

function createOverlay() {
  const overlay = document.createElement("div");
  overlay.id = OVERLAY_ID;
  Object.assign(overlay.style, {
    position: "fixed",
    inset: "0",
    zIndex: "9999",
    background: "#000",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "column",
    gap: "1rem",
  });

  overlay.innerHTML = `
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#71717a" stroke-width="1.5">
      <path stroke-linecap="round" stroke-linejoin="round"
        d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12c1.292 4.338 5.31 7.5 10.066 7.5.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
    </svg>
    <p style="color:#a1a1aa; font-size:1rem; font-family:system-ui,sans-serif; text-align:center; max-width:20rem;">
      Vuelve a la ventana para continuar trabajando
    </p>
  `;

  return overlay;
}

function showOverlay() {
  if (document.getElementById(OVERLAY_ID)) return;
  document.body.appendChild(createOverlay());
}

function hideOverlay() {
  document.getElementById(OVERLAY_ID)?.remove();
}

function setupVisibilityOverlay(_container, tracker, cleanups) {
  let lastVisible = true;

  const reportVisibility = (visible) => {
    if (visible === lastVisible) return;
    lastVisible = visible;

    if (visible) {
      hideOverlay();
    } else {
      showOverlay();
    }
    tracker?.onVisibilityChange(visible);
  };

  const onVisibilityChange = () => {
    reportVisibility(!document.hidden);
  };

  const onBlur = () => {
    reportVisibility(false);
  };

  const onFocus = () => {
    if (!document.hidden) {
      reportVisibility(true);
    }
  };

  document.addEventListener("visibilitychange", onVisibilityChange);
  window.addEventListener("blur", onBlur);
  window.addEventListener("focus", onFocus);

  cleanups.push(() => {
    document.removeEventListener("visibilitychange", onVisibilityChange);
    window.removeEventListener("blur", onBlur);
    window.removeEventListener("focus", onFocus);
    hideOverlay();
  });
}

// --- Keyboard shortcut blocking ---

function isInsideCodeEditor(event) {
  const el = event.target;
  return (
    el.closest("#code-editor") !== null ||
    el.closest(".cm-editor") !== null ||
    el.tagName === "TEXTAREA"
  );
}

function setupKeyboardBlocking(container, tracker, cleanups) {
  const onKeyDown = (event) => {
    const ctrl = event.ctrlKey || event.metaKey;

    // Ctrl+P / Cmd+P — print
    if (ctrl && event.key === "p") {
      event.preventDefault();
      tracker?.onPrintAttempt();
      return;
    }

    // Ctrl+S / Cmd+S — save page
    if (ctrl && event.key === "s") {
      event.preventDefault();
      return;
    }

    // Ctrl+C / Cmd+C outside code editor — copy statement text
    if (ctrl && event.key === "c" && !isInsideCodeEditor(event)) {
      event.preventDefault();
      tracker?.onCopyAttempt();
      return;
    }
  };

  document.addEventListener("keydown", onKeyDown, true);
  cleanups.push(() => document.removeEventListener("keydown", onKeyDown, true));
}

// --- Print media block ---

function injectPrintBlockStyles(cleanups) {
  const style = document.createElement("style");
  style.textContent = `
    @media print {
      .exercise-scope {
        display: none !important;
      }
      body::after {
        content: "Contenido protegido — no se permite imprimir.";
        display: flex;
        align-items: center;
        justify-content: center;
        height: 100vh;
        font-size: 1.25rem;
        color: #71717a;
        font-family: system-ui, sans-serif;
      }
    }
  `;
  document.head.appendChild(style);

  cleanups.push(() => style.remove());
}
