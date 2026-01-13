<script setup lang="ts">
import Card from "primevue/card";
import IconField from "primevue/iconfield";
import InputIcon from "primevue/inputicon";
import InputText from "primevue/inputtext";
import { computed } from "vue";

import PanesTable from "./PanesTable.vue";
import { useTable } from "./useTable";

import { EmptyState } from "@/components/common";
import { usePanesStore } from "@/stores/panes";

const store = usePanesStore();
const { search, panes } = useTable();

const hasPanes = computed(() => panes.value.length > 0);
const enabledCount = computed(() => store.enabledPanes.length);
const totalCount = computed(() => panes.value.length);
</script>

<template>
  <div class="h-full flex flex-col gap-1">
    <Card
      class="h-fit"
      pt:body:class="h-fit p-0 flex flex-col"
      pt:content:class="h-fit flex flex-col"
    >
      <template #content>
        <div class="flex justify-between items-center p-4 gap-4">
          <div class="flex-1">
            <h3 class="text-lg font-semibold">Panes Dashboard</h3>
            <p class="text-sm text-surface-300">
              {{ enabledCount }} of {{ totalCount }} panes enabled
            </p>
          </div>

          <IconField v-if="hasPanes">
            <InputIcon class="fas fa-magnifying-glass" />
            <InputText
              v-model="search"
              placeholder="Search panes..."
              class="w-64"
            />
          </IconField>
        </div>
      </template>
    </Card>

    <Card
      class="flex-1 min-h-0"
      pt:body:class="h-full p-0 flex flex-col"
      pt:content:class="h-full flex flex-col"
    >
      <template #content>
        <PanesTable v-if="hasPanes" :search="search" />
        <EmptyState
          v-else
          title="No panes created yet"
          icon="fas fa-window-restore"
          message="Go to the Panes tab to create your first custom view mode"
        />
      </template>
    </Card>
  </div>
</template>
