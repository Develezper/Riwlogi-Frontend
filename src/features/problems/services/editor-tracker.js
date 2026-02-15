export class EditorTracker {
  constructor(submissionId, stageId) {
    this.submissionId = submissionId;
    this.stageId = stageId;
    this.events = [];
    this.flushCallback = null;
    this.destroyed = false;

    this.autoFlushTimer = window.setInterval(() => {
      void this._autoFlush();
    }, 4000);
  }

  setSubmission(submissionId) {
    this.submissionId = submissionId;
  }

  setStage(stageId) {
    this.stageId = stageId;
  }

  onKey(charCount = 1) {
    this._push("key", { char_count: Math.max(1, Number(charCount) || 1) });
  }

  onPaste(charCount = 1) {
    this._push("paste", { char_count: Math.max(1, Number(charCount) || 1) });
  }

  onDelete(charCount = 1) {
    this._push("delete", { char_count: Math.max(1, Number(charCount) || 1) });
  }

  onRun(mode = "run") {
    this._push("run", { mode });
  }

  onFocusChange(isFocused) {
    this._push("focus", { focused: Boolean(isFocused) });
  }

  onFlush(callback) {
    this.flushCallback = callback;
  }

  flush() {
    if (!this.events.length) return [];

    const batched = this.events.map((event) => ({ ...event }));
    this.events = [];
    return batched;
  }

  destroy() {
    this.destroyed = true;
    window.clearInterval(this.autoFlushTimer);
    this.events = [];
    this.flushCallback = null;
  }

  _push(type, payload = {}) {
    if (this.destroyed) return;

    this.events.push({
      type,
      stage_id: this.stageId,
      submission_id: this.submissionId,
      timestamp: new Date().toISOString(),
      ...payload,
    });
  }

  async _autoFlush() {
    if (this.destroyed || !this.flushCallback || !this.events.length) return;

    const events = this.flush();
    try {
      await this.flushCallback(events);
    } catch {
      this.events.unshift(...events);
    }
  }
}
