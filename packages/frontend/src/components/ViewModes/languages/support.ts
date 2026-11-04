import { css } from "@codemirror/lang-css";
import { html } from "@codemirror/lang-html";
import { javascript } from "@codemirror/lang-javascript";
import { json } from "@codemirror/lang-json";
import { markdown } from "@codemirror/lang-markdown";
import { python } from "@codemirror/lang-python";
import { sql } from "@codemirror/lang-sql";
import { xml } from "@codemirror/lang-xml";
import { yaml } from "@codemirror/lang-yaml";
import {
  type Language,
  LanguageSupport,
  StreamLanguage,
} from "@codemirror/language";
import { http } from "@codemirror/legacy-modes/mode/http";
import { shell } from "@codemirror/legacy-modes/mode/shell";

export function getLanguageSupport(lang: string) {
  switch (lang) {
    case "json":
      return json();
    case "javascript":
    case "js":
      return javascript();
    case "typescript":
    case "ts":
      return javascript({ typescript: true });
    case "html":
      return html();
    case "xml":
      return xml();
    case "css":
      return css();
    case "python":
    case "py":
      return python();
    case "sql":
      return sql();
    case "yaml":
    case "yml":
      return yaml();
    case "markdown":
    case "md":
      return markdown({
        codeLanguages: (info) => getCodeBlockLanguage(info) ?? null,
      });
    case "http":
      return StreamLanguage.define(http);
    case "bash":
    case "shell":
    case "sh":
      return StreamLanguage.define(shell);
    default:
      return null;
  }
}

export function getCodeBlockLanguage(info: string): Language | undefined {
  const name = info.trim().split(/\s+/)[0]?.toLowerCase() ?? "";
  const support = getLanguageSupport(name);
  if (support === null) return undefined;
  return support instanceof LanguageSupport ? support.language : support;
}
