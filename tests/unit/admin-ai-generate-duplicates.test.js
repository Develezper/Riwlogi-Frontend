import { describe, expect, it } from "bun:test";

import {
  detectDuplicateReason,
  ensureUniqueProblemTitle,
} from "../../src/features/admin/views/admin-ai-generate/duplicate-utils.js";

describe("duplicate-utils", () => {
  it("detects duplicate title in batch", () => {
    const existing = [{ title: "Suma de pares", statement_md: "Lee n y suma pares hasta n." }];
    const candidate = { title: "Suma de pares", statement_md: "Otro enunciado distinto." };

    expect(detectDuplicateReason(candidate, existing)).toBe("titulo");
  });

  it("renames duplicate title with numeric suffix", () => {
    const existing = [{ title: "Suma de pares" }, { title: "Suma de pares (2)" }];
    const candidate = { title: "Suma de pares", statement_md: "Enunciado" };

    const uniqueCandidate = ensureUniqueProblemTitle(candidate, existing);

    expect(uniqueCandidate).not.toBeNull();
    expect(uniqueCandidate.title).toBe("Suma de pares (3)");
  });

  it("keeps original title when there is no conflict", () => {
    const existing = [{ title: "Contar vocales" }];
    const candidate = { title: "Invertir cadena" };

    const uniqueCandidate = ensureUniqueProblemTitle(candidate, existing);

    expect(uniqueCandidate).not.toBeNull();
    expect(uniqueCandidate.title).toBe("Invertir cadena");
  });
});
