const STORAGE_KEY = "riwlogi_ai_generate_draft";

export function saveDraft(state) {
  try {
    const data = {
      lastPrompt: state.lastPrompt || "",
      generatedBatch: state.generatedBatch || [],
      activeProblemId: state.generatedProblem?.id || null,
      savedAt: Date.now(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // localStorage lleno o no disponible — no bloquear el flujo
  }
}

export function loadDraft() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;

    const data = JSON.parse(raw);
    if (
      !data ||
      typeof data !== "object" ||
      !Array.isArray(data.generatedBatch) ||
      data.generatedBatch.length === 0
    ) {
      clearDraft();
      return null;
    }

    return data;
  } catch {
    clearDraft();
    return null;
  }
}

export function clearDraft() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignorar
  }
}
