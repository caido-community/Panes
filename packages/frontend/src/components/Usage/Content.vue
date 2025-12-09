<script setup lang="ts">
type Section = {
  id: string;
  title: string;
  body: string[];
};

const sections: Section[] = [
  {
    id: "what-is-panes",
    title: "What is Panes?",
    body: [
      "Panes lets you create custom view modes for HTTP requests and responses using workflows or shell commands.",
      "Use it to pretty-print JSON, decode JWTs, format XML, or run any custom transformation and view it inline in Caido.",
    ],
  },
  {
    id: "quick-start",
    title: "Quick Start",
    body: [
      "1) Open the Panes tab and create a pane with a name, tab label, and input source (request/response).",
      "2) Pick a transformation: select a Convert workflow or provide a shell command using {{input}}.",
      "3) Add an HTTPQL filter if you want to run only on matching requests.",
      "4) Enable the pane and view results in the registered locations.",
    ],
  },
  {
    id: "tips",
    title: "Tips",
    body: [
      "Use HTTPQL filters to avoid running on non-JSON or irrelevant responses.",
      "Prefer workflows for safer transforms; commands are powerful but should be used carefully.",
      "Keep tab names short so they fit nicely in the view mode bar.",
    ],
  },
];
</script>

<template>
  <div class="space-y-8">
    <section v-for="section in sections" :id="section.id" :key="section.id" class="space-y-3">
      <h2 class="text-2xl font-semibold">{{ section.title }}</h2>
      <div class="space-y-3 text-surface-300 leading-relaxed">
        <p v-for="(para, idx) in section.body" :key="idx">
          {{ para }}
        </p>
      </div>
    </section>
  </div>
</template>

