import { describe, expect, it } from "vitest";

import { renderMarkdown } from "../../src/shared/utils/ui-helpers.js";

describe("renderMarkdown", () => {
  it("sanitizes scripts and event handlers", () => {
    const html = renderMarkdown("# Hola\n\n<script>alert('xss')</script>\n\n<a href=\"javascript:alert(1)\" onclick=\"alert(1)\">link</a>");

    expect(html).not.toContain("<script");
    expect(html).not.toContain("onclick=");
    expect(html).toContain('href="#"');
  });

  it("keeps safe markdown formatting", () => {
    const html = renderMarkdown("**bold**\n\n- one\n- two\n\n`code`");

    expect(html).toContain("<strong>bold</strong>");
    expect(html).toContain("<ul>");
    expect(html).toContain("<code>code</code>");
  });
});
