function isCombiningMark(code) {
  return code >= 0x0300 && code <= 0x036f;
}

function isAsciiDigit(code) {
  return code >= 48 && code <= 57;
}

function isAsciiLowerLetter(code) {
  return code >= 97 && code <= 122;
}

function isAsciiLetterOrDigit(code) {
  return isAsciiLowerLetter(code) || isAsciiDigit(code);
}

export function normalizeComparableText(value) {
  const text = String(value || "").toLowerCase().normalize("NFD");
  let output = "";
  let justWroteSpace = true;

  for (const char of text) {
    const code = char.codePointAt(0);
    if (!Number.isFinite(code)) continue;
    if (isCombiningMark(code)) continue;

    if (isAsciiLetterOrDigit(code)) {
      output += char;
      justWroteSpace = false;
      continue;
    }

    if (!justWroteSpace) {
      output += " ";
      justWroteSpace = true;
    }
  }

  if (output.endsWith(" ")) {
    output = output.slice(0, -1);
  }

  return output;
}

export function tokenizeComparableText(value) {
  const normalized = normalizeComparableText(value);
  if (!normalized) return [];
  return normalized.split(" ");
}

export function isDigitToken(value, maxLength = 2) {
  const text = String(value || "").trim();
  if (!text || text.length > maxLength) return false;

  for (const char of text) {
    const code = char.codePointAt(0);
    if (!Number.isFinite(code) || !isAsciiDigit(code)) return false;
  }

  return true;
}

export function startsWithTokenPrefix(token, prefix) {
  const safeToken = String(token || "");
  const safePrefix = String(prefix || "");
  if (!safePrefix) return true;
  return safeToken.startsWith(safePrefix);
}
