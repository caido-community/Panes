<script setup lang="ts">
import { css } from "@codemirror/lang-css";
import { html } from "@codemirror/lang-html";
import { javascript } from "@codemirror/lang-javascript";
import { json } from "@codemirror/lang-json";
import { markdown } from "@codemirror/lang-markdown";
import { python } from "@codemirror/lang-python";
import { sql } from "@codemirror/lang-sql";
import { xml } from "@codemirror/lang-xml";
import { yaml } from "@codemirror/lang-yaml";
import { EditorState } from "@codemirror/state";
import { oneDark } from "@codemirror/theme-one-dark";
import { EditorView } from "@codemirror/view";
import { onMounted, onUnmounted, ref, watch } from "vue";

const props = defineProps<{
  content: string;
  language: string;
}>();

const container = ref<HTMLElement | undefined>(undefined);
let view: EditorView | undefined = undefined;

function getLanguageSupport(lang: string) {
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
      return markdown();
    case "bash":
    case "shell":
    case "sh":
      return javascript();
    default:
      return null;
  }
}

function createEditor() {
  if (container.value === undefined) return;

  const languageSupport = getLanguageSupport(props.language);
  const extensions = [
    EditorState.readOnly.of(true),
    EditorView.theme({
      "&": {
        height: "100%",
        fontSize: "13px",
        backgroundColor: "transparent",
      },
      ".cm-content": {
        padding: "16px",
        minHeight: "100%",
        backgroundColor: "transparent",
      },
      ".cm-scroller": {
        overflow: "auto",
        backgroundColor: "transparent",
      },
      ".cm-editor": {
        height: "100%",
        backgroundColor: "transparent",
      },
      ".cm-editor .cm-scroller": {
        height: "100%",
        backgroundColor: "transparent",
      },
      ".cm-focused": {
        outline: "none",
      },
    }),
  ];

  if (languageSupport !== null) {
    extensions.push(languageSupport);
  }

  const isDark = document.documentElement.getAttribute("data-mode") === "dark";
  if (isDark) {
    extensions.push(oneDark);
  }

  const state = EditorState.create({
    doc: props.content,
    extensions,
  });

  view = new EditorView({
    state,
    parent: container.value,
  });
}

function updateContent() {
  if (view === undefined) return;
  view.dispatch({
    changes: {
      from: 0,
      to: view.state.doc.length,
      insert: props.content,
    },
  });
}

function updateLanguage() {
  if (view === undefined || container.value === undefined) return;
  view.destroy();
  createEditor();
}

onMounted(() => {
  createEditor();
});

onUnmounted(() => {
  if (view !== undefined) {
    view.destroy();
  }
});

watch(() => props.content, updateContent);
watch(() => props.language, updateLanguage);
</script>

<template>
  <div ref="container" class="h-full w-full" />
</template>
