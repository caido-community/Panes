<script setup lang="ts">
import { autocompletion } from "@codemirror/autocomplete";
import {
  defaultKeymap,
  history,
  historyKeymap,
  indentWithTab,
} from "@codemirror/commands";
import { javascript } from "@codemirror/lang-javascript";
import {
  defaultHighlightStyle,
  syntaxHighlighting,
} from "@codemirror/language";
import { EditorState, type Extension } from "@codemirror/state";
import { oneDark } from "@codemirror/theme-one-dark";
import { EditorView, keymap, lineNumbers } from "@codemirror/view";
import { onMounted, onUnmounted, ref, watch } from "vue";

const props = defineProps<{ modelValue: string }>();
const emit = defineEmits<{ "update:modelValue": [value: string] }>();

const container = ref<HTMLElement | undefined>(undefined);
let view: EditorView | undefined = undefined;

function createEditor() {
  if (container.value === undefined) return;

  const isDark = document.documentElement.getAttribute("data-mode") === "dark";
  const extensions: Extension[] = [
    lineNumbers(),
    history(),
    javascript(),
    autocompletion(),
    EditorView.lineWrapping,
    keymap.of([...defaultKeymap, ...historyKeymap, indentWithTab]),
    EditorView.updateListener.of((update) => {
      if (update.docChanged) {
        emit("update:modelValue", update.state.doc.toString());
      }
    }),
    EditorView.theme({
      "&": {
        fontSize: "13px",
        backgroundColor: "transparent",
        maxHeight: "320px",
      },
      "&.cm-editor.cm-focused": { outline: "none" },
      ".cm-scroller": { overflow: "auto" },
      ".cm-content": {
        fontFamily: "ui-monospace, monospace",
        minHeight: "160px",
      },
      ".cm-gutters": { backgroundColor: "transparent", border: "none" },
    }),
  ];
  if (isDark) extensions.push(oneDark);
  if (!isDark) extensions.push(syntaxHighlighting(defaultHighlightStyle));

  view = new EditorView({
    state: EditorState.create({ doc: props.modelValue, extensions }),
    parent: container.value,
  });
}

onMounted(createEditor);

onUnmounted(() => {
  if (view !== undefined) view.destroy();
});

watch(
  () => props.modelValue,
  (value) => {
    if (view === undefined) return;
    if (value === view.state.doc.toString()) return;
    view.dispatch({
      changes: { from: 0, to: view.state.doc.length, insert: value },
    });
  },
);
</script>

<template>
  <div
    ref="container"
    class="border border-surface-700 rounded overflow-hidden"
  />
</template>
