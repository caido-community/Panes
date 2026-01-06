<script setup lang="ts">
import type { API } from "@caido/sdk-frontend";
import ProgressSpinner from "primevue/progressspinner";
import { useAttrs } from "vue";

import { useViewMode } from "./useViewMode";

import type { FrontendSDK } from "@/types";

const props = defineProps<{
  paneId?: string;
}>();

const attrs = useAttrs() as unknown as {
  sdk: API;
  response: unknown;
};

const { state } = useViewMode(
  props.paneId ?? "",
  attrs.sdk as unknown as FrontendSDK,
  undefined, 
  attrs.response,
);
</script>

<template>
  <div class="h-full w-full flex flex-col bg-surface-800 text-surface-100">
    <div
      v-if="state.loading"
      class="h-full flex items-center justify-center"
    >
      <ProgressSpinner class="w-10 h-10" stroke-width="4" />
    </div>

    <div
      v-else-if="state.error !== ''"
      class="h-full flex flex-col items-center justify-center p-4 text-center"
    >
      <i class="fas fa-exclamation-triangle text-3xl text-amber-500 mb-3" />
      <p class="text-surface-300 text-sm max-w-md">{{ state.error }}</p>
    </div>

    <div v-else class="h-full overflow-auto p-4">
      <pre class="text-sm font-mono whitespace-pre-wrap break-words">{{
        state.output
      }}</pre>
    </div>
  </div>
</template>

