import { describe, expect, it } from "vitest";

import { getCodeBlockLanguage } from "./support";

const getMarkdownNodeNameAt = (doc: string, text: string): string => {
  const markdown = getCodeBlockLanguage("markdown");
  if (markdown === undefined) throw new Error("Markdown language is missing");

  return markdown.parser.parse(doc).resolveInner(doc.indexOf(text), 1).name;
};

describe("getCodeBlockLanguage", () => {
  it("resolves a language by its fence name", () => {
    expect(getCodeBlockLanguage("html")?.name).toBe("html");
  });

  it("resolves aliases case-insensitively", () => {
    expect(getCodeBlockLanguage("JS")?.name).toBe("javascript");
  });

  it("ignores attributes after the fence name", () => {
    expect(getCodeBlockLanguage("json title=data")?.name).toBe("json");
  });

  it("resolves legacy modes", () => {
    expect(getCodeBlockLanguage("bash")?.name).toBe("shell");
  });

  it("returns undefined for unknown languages", () => {
    expect(getCodeBlockLanguage("not-a-language")).toBeUndefined();
  });
});

describe("markdown code blocks", () => {
  it("parses a fenced html block as html", () => {
    const doc =
      "# Title\n\n```html\n<!DOCTYPE html>\n<section>hi</section>\n```\n";
    expect(getMarkdownNodeNameAt(doc, "section")).toBe("TagName");
  });

  it("parses a fenced json block as json", () => {
    const doc = '```json\n{ "id": 1 }\n```\n';
    expect(getMarkdownNodeNameAt(doc, '"id"')).toBe("PropertyName");
  });

  it("leaves a fenced block without a language as plain code", () => {
    const doc = "```\n<section>hi</section>\n```\n";
    expect(getMarkdownNodeNameAt(doc, "section")).toBe("CodeText");
  });
});
