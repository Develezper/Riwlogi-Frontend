import { saveDraft, scheduleDraftSave } from "./draft-storage.js";
import { pythonSnippets, javascriptSnippets } from "./editor-snippets.js";

export function clearEditorBindings(state) {
  state.editorCleanupFns.forEach((fn) => {
    try {
      fn();
    } catch {
      // Ignore editor scoped cleanup errors.
    }
  });

  state.editorCleanupFns = [];
}

export async function mountEditor(container, state, initialCode) {
  const editorElement = container.querySelector("#code-editor");
  if (!editorElement) return;

  clearEditorBindings(state);

  if (state.editorView?.destroy) {
    state.editorView.destroy();
    state.editorView = null;
  }

  editorElement.innerHTML = "";

  try {
    const [
      { EditorView, basicSetup },
      { EditorState },
      { oneDark },
      { ViewPlugin },
      { snippetCompletion, completeFromList },
      { indentUnit },
      pythonMod,
      jsMod,
    ] = await Promise.all([
      import("codemirror"),
      import("@codemirror/state"),
      import("@codemirror/theme-one-dark"),
      import("@codemirror/view"),
      import("@codemirror/autocomplete"),
      import("@codemirror/language"),
      import("@codemirror/lang-python"),
      import("@codemirror/lang-javascript"),
    ]);

    const snippetMap = {
      python: pythonSnippets,
      javascript: javascriptSnippets,
      typescript: javascriptSnippets,
    };

    const langMap = {
      python: () => pythonMod.python(),
      javascript: () => jsMod.javascript({ typescript: true, jsx: true }),
      typescript: () => jsMod.javascript({ typescript: true, jsx: true }),
    };

    const langExtension = (langMap[state.language] || langMap.python)();

    const snippets = snippetMap[state.language] || [];
    const snippetCompletions = snippets.map(({ label, detail, snippet }) =>
      snippetCompletion(snippet, { label, detail, type: "keyword", boost: 1 }),
    );
    const snippetSource = completeFromList(snippetCompletions);

    const trackingPlugin = ViewPlugin.define(() => ({
      update(update) {
        if (!update.docChanged) return;

        const currentCode = update.state.doc.toString();
        scheduleDraftSave(state, currentCode);

        if (!state.tracker) return;

        for (const transaction of update.transactions) {
          transaction.changes.iterChanges((fromA, toA, _fromB, _toB, inserted) => {
            const deletedLen = toA - fromA;
            const insertedLen = inserted.toString().length;

            if (deletedLen > 0 && insertedLen > 0) {
              if (insertedLen > 10) state.tracker.onPaste(insertedLen);
              else state.tracker.onKey(insertedLen);
              if (deletedLen > 5) state.tracker.onDelete(deletedLen);
              return;
            }

            if (deletedLen > 0) {
              state.tracker.onDelete(deletedLen);
              return;
            }

            if (insertedLen > 0) {
              if (insertedLen > 10) state.tracker.onPaste(insertedLen);
              else state.tracker.onKey(insertedLen);
            }
          });
        }
      },
    }));

    const editorState = EditorState.create({
      doc: initialCode,
      extensions: [
        basicSetup,
        oneDark,
        langExtension,
        indentUnit.of("    "),
        EditorState.languageData.of(() => [{ autocomplete: snippetSource }]),
        trackingPlugin,
      ],
    });

    state.editorView = new EditorView({
      state: editorState,
      parent: editorElement,
    });

    const onFocus = () => state.tracker?.onFocusChange(true);
    const onBlur = () => state.tracker?.onFocusChange(false);

    editorElement.addEventListener("focusin", onFocus);
    editorElement.addEventListener("focusout", onBlur);

    state.editorCleanupFns.push(() => editorElement.removeEventListener("focusin", onFocus));
    state.editorCleanupFns.push(() => editorElement.removeEventListener("focusout", onBlur));
  } catch (err) {
    console.error("[code-editor] Failed to mount CodeMirror:", err);
    editorElement.innerHTML = `
      <textarea id="code-textarea"
        class="w-full h-full bg-zinc-950 text-zinc-100 font-mono text-sm p-4 resize-none outline-none border-none"
        spellcheck="false">${initialCode}</textarea>
    `;

    const textArea = editorElement.querySelector("#code-textarea");
    const onInput = (event) => {
      scheduleDraftSave(state, event.target.value);
    };

    textArea?.addEventListener("input", onInput);
    state.editorCleanupFns.push(() => textArea?.removeEventListener("input", onInput));
  }
}

export function getCurrentCode(container, state) {
  if (state.editorView) {
    return state.editorView.state.doc.toString();
  }

  return container.querySelector("#code-textarea")?.value || "";
}

export function replaceEditorCode(container, state, code) {
  if (state.editorView) {
    state.editorView.dispatch({
      changes: {
        from: 0,
        to: state.editorView.state.doc.length,
        insert: code,
      },
    });
    saveDraft(state.problem.id, state.language, code);
    return;
  }

  const textarea = container.querySelector("#code-textarea");
  if (textarea) {
    textarea.value = code;
    saveDraft(state.problem.id, state.language, code);
  }
}
