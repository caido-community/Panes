import { css } from "@codemirror/lang-css";
import { html } from "@codemirror/lang-html";
import { javascript } from "@codemirror/lang-javascript";
import { json } from "@codemirror/lang-json";
import { xml } from "@codemirror/lang-xml";
import {
  defaultHighlightStyle,
  foldNodeProp,
  foldService,
  type LanguageSupport,
} from "@codemirror/language";
import { type Extension, RangeSetBuilder, StateField } from "@codemirror/state";
import { oneDarkHighlightStyle } from "@codemirror/theme-one-dark";
import { Decoration, type DecorationSet, EditorView } from "@codemirror/view";
import { type Tree } from "@lezer/common";
import { type Highlighter, highlightTree } from "@lezer/highlight";

export function bodyStart(doc: string): number | undefined {
  const crlf = doc.indexOf("\r\n\r\n");
  if (crlf !== -1) return crlf + 4;

  const lf = doc.indexOf("\n\n");
  if (lf !== -1) return lf + 2;

  return undefined;
}

function languageForContentType(
  contentType: string,
): LanguageSupport | undefined {
  const ct = contentType.toLowerCase();
  if (ct.includes("json")) return json();
  if (ct.includes("html")) return html();
  if (ct.includes("xml")) return xml();
  if (ct.includes("javascript")) return javascript();
  if (ct.includes("css")) return css();
  return undefined;
}

type BodyParse = { start: number; tree: Tree };

export function parseBody(doc: string): BodyParse | undefined {
  const start = bodyStart(doc);
  if (start === undefined) return undefined;

  const text = doc.slice(start);
  if (text.trim() === "") return undefined;

  const match = /^content-type:[ \t]*([^\r\n;]+)/im.exec(doc.slice(0, start));
  if (match === null || match[1] === undefined) return undefined;

  const support = languageForContentType(match[1].trim());
  if (support === undefined) return undefined;

  return { start, tree: support.language.parser.parse(text) };
}

const bodyParseField = StateField.define<BodyParse | undefined>({
  create: (state) => parseBody(state.doc.toString()),
  update: (value, tr) =>
    tr.docChanged ? parseBody(tr.state.doc.toString()) : value,
});

function buildDecorations(
  parse: BodyParse | undefined,
  highlighter: Highlighter,
): DecorationSet {
  if (parse === undefined) return Decoration.none;

  const builder = new RangeSetBuilder<Decoration>();
  highlightTree(parse.tree, highlighter, (from, to, classes) => {
    builder.add(
      parse.start + from,
      parse.start + to,
      Decoration.mark({ class: classes }),
    );
  });
  return builder.finish();
}

export function httpBodyHighlight(isDark: boolean): Extension {
  const highlighter = isDark ? oneDarkHighlightStyle : defaultHighlightStyle;
  return [
    bodyParseField,
    EditorView.decorations.compute([bodyParseField], (state) =>
      buildDecorations(state.field(bodyParseField), highlighter),
    ),
  ];
}

export function httpBodyFold(): Extension {
  return [
    bodyParseField,
    foldService.of((state, lineStart, lineEnd) => {
      const parse = state.field(bodyParseField);
      if (parse === undefined || lineEnd < parse.start) return null;

      const relStart = lineStart - parse.start;
      const relEnd = Math.min(lineEnd - parse.start, parse.tree.length);

      let cur: ReturnType<Tree["resolveInner"]> | undefined =
        parse.tree.resolveInner(relEnd, 1);
      while (cur !== undefined) {
        if (cur.to > relEnd && cur.from <= relEnd) {
          const prop = cur.type.prop(foldNodeProp);
          const range = prop === undefined ? undefined : prop(cur, state);
          if (
            range !== null &&
            range !== undefined &&
            range.from >= relStart &&
            range.from <= relEnd &&
            range.to > relEnd
          ) {
            return {
              from: parse.start + range.from,
              to: parse.start + range.to,
            };
          }
        }
        cur = cur.parent ?? undefined;
      }
      return null;
    }),
  ];
}
