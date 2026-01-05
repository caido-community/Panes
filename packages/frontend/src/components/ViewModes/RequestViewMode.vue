<script setup lang="ts">
import type { API, RequestFull } from "@caido/sdk-frontend";
import ProgressSpinner from "primevue/progressspinner";

import { useViewMode } from "./useViewMode";

import type { FrontendSDK } from "@/types";

const props = defineProps<{
  paneId?: string;
  sdk: API;
  request: RequestFull;
}>();

const { state } = useViewMode(
  props.paneId ?? "",
  props.sdk as unknown as FrontendSDK,
  props.request,
);
</script>

<template>
  <div class="h-full w-full flex flex-col bg-surface-800 text-surface-100">
    <div v-if="state.loading" class="h-full flex items-center justify-center">
      <ProgressSpinner style="width: 40px; height: 40px" stroke-width="4" />
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
