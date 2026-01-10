<script setup lang="ts">
import Column from "primevue/column";
import DataTable from "primevue/datatable";
import InputSwitch from "primevue/inputswitch";
import Tag from "primevue/tag";
import type { Pane, PaneLocation } from "shared";

import { useTable } from "./useTable";

const { filters, panes, getInputLabel, togglePane, getWorkflowStatus } =
  useTable();

defineProps<{
  search: string;
}>();

const emit = defineEmits<{
  edit: [pane: Pane];
}>();

const onRowClick = (event: { data: Pane }) => {
  emit("edit", event.data);
};

const locationLabels: Record<PaneLocation, string> = {
  "http-history": "History",
  sitemap: "Sitemap",
  replay: "Replay",
  automate: "Automate",
  intercept: "Intercept",
};

const getShortLocationLabel = (location: PaneLocation): string => {
  return locationLabels[location];
};
</script>

<template>
  <DataTable
    :value="panes"
    :filters="filters"
    :global-filter-fields="['name', 'tabName', 'description']"
    scrollable
    scroll-height="flex"
    striped-rows
    size="small"
    class="flex-1 overflow-auto"
    removable-sort
    selection-mode="single"
    @row-click="onRowClick"
  >
    <template #empty>
      <div class="flex justify-center items-center h-32">
        <span class="text-surface-400">No panes found</span>
      </div>
    </template>

    <Column field="enabled" header="" class="w-16">
      <template #body="{ data }">
        <div class="flex justify-center" @click.stop>
          <InputSwitch
            :model-value="data.enabled"
            @update:model-value="togglePane(data)"
          />
        </div>
      </template>
    </Column>

    <Column field="name" header="Name" sortable class="min-w-48">
      <template #body="{ data }">
        <div class="py-1">
          <div class="font-medium text-surface-100">{{ data.name }}</div>
          <div
            v-if="data.description"
            class="text-xs text-surface-400 truncate max-w-sm mt-0.5"
          >
            {{ data.description }}
          </div>
        </div>
      </template>
    </Column>

    <Column field="tabName" header="Tab Name" sortable class="w-32">
      <template #body="{ data }">
        <Tag :value="data.tabName" severity="secondary" class="font-medium" />
      </template>
    </Column>

    <Column field="input" header="Input Source" sortable class="w-44">
      <template #body="{ data }">
        <div class="flex items-center gap-2">
          <i
            :class="[
              'fas text-surface-400 text-xs',
              data.input.startsWith('request')
                ? 'fa-arrow-up'
                : 'fa-arrow-down',
            ]"
          />
          <span class="text-sm text-surface-200">
            {{ getInputLabel(data.input) }}
          </span>
        </div>
      </template>
    </Column>

    <Column field="locations" header="Locations" class="w-56">
      <template #body="{ data }">
        <div class="flex flex-wrap gap-1">
          <span
            v-for="loc in data.locations.slice(0, 3)"
            :key="loc"
            class="px-2 py-0.5 text-xs rounded bg-surface-600 text-surface-200"
          >
            {{ getShortLocationLabel(loc) }}
          </span>
          <span
            v-if="data.locations.length > 3"
            class="px-2 py-0.5 text-xs rounded bg-surface-700 text-surface-400"
          >
            +{{ data.locations.length - 3 }}
          </span>
        </div>
      </template>
    </Column>

    <Column header="Workflow" class="min-w-40">
      <template #body="{ data }">
        <div
          v-if="data.transformation.type === 'workflow'"
          class="flex items-center gap-2"
        >
          <i
            v-if="getWorkflowStatus(data)?.status === 'missing'"
            class="fas fa-exclamation-triangle text-amber-500 text-xs"
            :title="`Workflow not found: ${getWorkflowStatus(data)?.workflowId}`"
          />
          <i v-else class="fas fa-diagram-project text-surface-500 text-xs" />
          <span class="text-sm text-surface-300 truncate max-w-32">
            {{ getWorkflowStatus(data)?.workflowName ?? "Loading..." }}
          </span>
        </div>
        <span v-else class="text-sm text-surface-500">—</span>
      </template>
    </Column>

    <Column field="httpql" header="Filter" class="min-w-36">
      <template #body="{ data }">
        <code
          v-if="data.httpql"
          class="text-xs font-mono text-surface-400 bg-surface-700 px-2 py-0.5 rounded truncate block max-w-48"
        >
          {{ data.httpql }}
        </code>
        <span v-else class="text-sm text-surface-600">No filter</span>
      </template>
    </Column>
  </DataTable>
</template>
