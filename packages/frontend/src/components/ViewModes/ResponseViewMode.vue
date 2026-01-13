<script setup lang="ts">
import type { API, ResponseFull } from "@caido/sdk-frontend";
import ProgressSpinner from "primevue/progressspinner";
import { computed } from "vue";

import CodeMirrorView from "./CodeMirrorView.vue";
import { useViewMode } from "./useViewMode";

import { usePanesStore } from "@/stores/panes";
import type { FrontendSDK } from "@/types";

const { paneId, sdk, response } = defineProps<{
  paneId?: string;
  sdk: API;
  response: ResponseFull;
}>();

const store = usePanesStore();
const { state } = useViewMode({
  paneId: () => paneId,
  sdk: () => sdk as unknown as FrontendSDK,
  response: () => response,
});

const pane = computed(() => {
  if (paneId === undefined) return undefined;
  return store.getPaneById(paneId);
});
</script>

<template>
  <div class="h-full w-full flex flex-col bg-surface-800 text-surface-100">
    <div
      v-if="state.type === 'Loading'"
      class="h-full flex items-center justify-center"
    >
      <ProgressSpinner class="w-10 h-10" stroke-width="4" />
    </div>

    <div
      v-else-if="state.type === 'Failed'"
      class="h-full flex flex-col items-center justify-center p-4 text-center"
    >
      <i class="fas fa-exclamation-triangle text-3xl text-amber-500 mb-3" />
      <p class="text-surface-300 text-sm max-w-md">{{ state.error }}</p>
    </div>

    <div v-else-if="state.type === 'Success'" class="h-full w-full">
      <CodeMirrorView
        v-if="pane?.codeBlock === true && pane.language"
        :content="state.output"
        :language="pane.language"
      />
      <div v-else class="h-full w-full overflow-auto p-4">
        <div
          class="text-sm font-mono whitespace-pre-wrap break-words break-all overflow-wrap-anywhere select-text"
          style="
            word-break: break-all;
            overflow-wrap: anywhere;
            user-select: text;
          "
        >
          {{ state.output }}
        </div>
      </div>
    </div>
  </div>
</template>
