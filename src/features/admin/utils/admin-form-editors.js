import { renderMarkdown } from "../../../shared/utils/ui-helpers.js";

/**
 * Mounts CodeMirror editors for all [data-code-editor] containers in the
 * given root element, and activates the Markdown toggle for [data-md-editor].
 *
 * Returns a cleanup function that destroys all mounted editors and listeners.
 */
export async function mountAdminFormEditors(root) {
  const cleanupFns = [];

  mountMarkdownToggle(root, cleanupFns);
  await mountCodeEditors(root, cleanupFns);

  return function cleanup() {
    for (const fn of cleanupFns) {
      try {
        fn();
      } catch {
        // ignore
      }
    }
  };
}

// ---------------------------------------------------------------------------
// Markdown toggle
// ---------------------------------------------------------------------------

function mountMarkdownToggle(root, cleanupFns) {
  const wrapper = root.querySelector("[data-md-editor]");
  if (!wrapper) return;

  const textarea = wrapper.querySelector("textarea[name='statement_md']");
  const preview = wrapper.querySelector("[data-md-preview]");
  const toggleBtn = wrapper.querySelector("[data-md-toggle]");
  if (!textarea || !preview || !toggleBtn) return;

  let showingPreview = false;

  function syncPreview() {
    preview.innerHTML = renderMarkdown(textarea.value) || "<p class=\"text-zinc-500 text-sm\">Sin contenido.</p>";
  }

  function onToggle() {
    showingPreview = !showingPreview;
    if (showingPreview) {
      syncPreview();
      textarea.classList.add("hidden");
      preview.classList.remove("hidden");
      toggleBtn.textContent = "Editar";
    } else {
      textarea.classList.remove("hidden");
      preview.classList.add("hidden");
      toggleBtn.textContent = "Preview";
    }
  }

  toggleBtn.addEventListener("click", onToggle);
  cleanupFns.push(() => toggleBtn.removeEventListener("click", onToggle));
}

// ---------------------------------------------------------------------------
// CodeMirror editors
// ---------------------------------------------------------------------------

async function mountCodeEditors(root, cleanupFns) {
  const containers = Array.from(root.querySelectorAll("[data-code-editor]"));
  if (!containers.length) return;

  let mods;
  try {
    mods = await Promise.all([
      import("codemirror"),
      import("@codemirror/state"),
      import("@codemirror/theme-one-dark"),
      import("@codemirror/lang-python"),
      import("@codemirror/lang-javascript"),
    ]);
  } catch {
    // CodeMirror failed to load — fall back to bare textareas
    return;
  }

  const [{ EditorView, basicSetup }, { EditorState }, { oneDark }, pythonMod, jsMod] = mods;

  const langExtension = {
    python: () => pythonMod.python(),
    javascript: () => jsMod.javascript({ jsx: true }),
    typescript: () => jsMod.javascript({ typescript: true }),
  };

  for (const container of containers) {
    const lang = container.dataset.codeEditor;
    const hiddenInput = container.querySelector("textarea[data-hidden-input]");
    const editorMount = container.querySelector("[data-cm-mount]");
    if (!hiddenInput || !editorMount) continue;

    const getLang = langExtension[lang] || langExtension.javascript;

    const view = new EditorView({
      state: EditorState.create({
        doc: hiddenInput.value,
        extensions: [
          basicSetup,
          oneDark,
          getLang(),
          EditorView.updateListener.of((update) => {
            if (update.docChanged) {
              hiddenInput.value = update.state.doc.toString();
            }
          }),
        ],
      }),
      parent: editorMount,
    });

    cleanupFns.push(() => view.destroy());
  }
}
