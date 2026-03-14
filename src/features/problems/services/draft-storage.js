function draftKey(problemId, language) {
  return `Riwlog_draft_${problemId}_${language}`;
}

export function saveDraft(problemId, language, code) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(draftKey(problemId, language), String(code || ""));
}

export function loadDraft(problemId, language) {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(draftKey(problemId, language));
}

export function clearDraft(problemId, language) {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(draftKey(problemId, language));
}

export function scheduleDraftSave(state, code) {
  if (state.draftSaveTimer) {
    window.clearTimeout(state.draftSaveTimer);
  }

  state.draftSaveTimer = window.setTimeout(() => {
    saveDraft(state.problem.id, state.language, code);
  }, 300);
}
