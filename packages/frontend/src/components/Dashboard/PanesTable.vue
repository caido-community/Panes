<script setup lang="ts">
import Column from "primevue/column";
import DataTable from "primevue/datatable";
import InputSwitch from "primevue/inputswitch";
import Tag from "primevue/tag";
import type { Pane } from "shared";

import { useTable } from "./useTable";

const {
  filters,
  panes,
  getInputLabel,
  getLocationsText,
  getTransformationLabel,
  togglePane,
} = useTable();

defineProps<{
  search: string;
}>();

const emit = defineEmits<{
  edit: [pane: Pane];
}>();

const onRowClick = (event: { data: Pane }) => {
  emit("edit", event.data);
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

    <Column field="enabled" header="Enabled" class="w-24">
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
        <div>
          <div class="font-medium">{{ data.name }}</div>
          <div
            v-if="data.description"
            class="text-xs text-surface-400 truncate max-w-xs"
          >
            {{ data.description }}
          </div>
        </div>
      </template>
    </Column>

    <Column field="tabName" header="Tab" sortable class="w-24">
      <template #body="{ data }">
        <Tag :value="data.tabName" severity="secondary" />
      </template>
    </Column>

    <Column field="input" header="Input" sortable class="w-40">
      <template #body="{ data }">
        <span class="text-sm">{{ getInputLabel(data.input) }}</span>
      </template>
    </Column>

    <Column field="locations" header="Locations" class="w-40">
      <template #body="{ data }">
        <span class="text-sm text-surface-300">
          {{ getLocationsText(data.locations) }}
        </span>
      </template>
    </Column>

    <Column header="Transform" class="w-28">
      <template #body="{ data }">
        <Tag
          :value="getTransformationLabel(data)"
          :severity="data.transformation.type === 'workflow' ? 'info' : 'warn'"
        />
      </template>
    </Column>

    <Column field="httpql" header="Filter" class="min-w-32">
      <template #body="{ data }">
        <span
          v-if="data.httpql"
          class="text-xs font-mono text-surface-400 truncate block max-w-xs"
        >
          {{ data.httpql }}
        </span>
        <span v-else class="text-xs text-surface-500">—</span>
      </template>
    </Column>
  </DataTable>
</template>
