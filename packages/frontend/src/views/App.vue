<script setup lang="ts">
import Button from "primevue/button";
import MenuBar from "primevue/menubar";
import { computed, onMounted, ref } from "vue";

import { usePanesStore } from "@/stores/panes";
import Dashboard from "@/views/Dashboard.vue";
import PanesManager from "@/views/PanesManager.vue";
import Usage from "@/views/Usage.vue";

type Page = "Dashboard" | "Panes" | "Usage";

const page = ref<Page>("Dashboard");
const panesStore = usePanesStore();

onMounted(() => {
  panesStore.initialize();
});

const items = [
  {
    label: "Dashboard",
    isActive: () => page.value === "Dashboard",
    command: () => {
      page.value = "Dashboard";
    },
  },
  {
    label: "Panes",
    isActive: () => page.value === "Panes",
    command: () => {
      page.value = "Panes";
    },
  },
  {
    label: "Usage",
    isActive: () => page.value === "Usage",
    command: () => {
      page.value = "Usage";
    },
  },
];

const component = computed(() => {
  switch (page.value) {
    case "Dashboard":
      return Dashboard;
    case "Panes":
      return PanesManager;
    case "Usage":
      return Usage;
    default:
      return Dashboard;
  }
});
</script>

<template>
  <div class="h-full flex flex-col gap-1">
    <MenuBar :model="items" class="h-12 gap-2">
      <template #start>
        <div class="px-2 font-bold text-gray-300">Panes</div>
      </template>

      <template #item="{ item }">
        <Button
          :severity="item.isActive?.() ? 'secondary' : 'contrast'"
          :outlined="item.isActive?.()"
          size="small"
          :text="!item.isActive?.()"
          :label="item.label"
          @mousedown="item.command?.()"
        />
      </template>
    </MenuBar>
    <div class="flex-1 min-h-0">
      <component :is="component" />
    </div>
  </div>
</template>
