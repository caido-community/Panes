<script setup lang="ts">
import Button from "primevue/button";
import IconField from "primevue/iconfield";
import InputIcon from "primevue/inputicon";
import InputText from "primevue/inputtext";
import type { Pane } from "shared";
import { computed, ref } from "vue";

const props = defineProps<{
  panes: Pane[];
  selectedId: string | undefined;
  isCreating: boolean;
}>();

const emit = defineEmits<{
  select: [id: string];
  create: [];
}>();

const search = ref("");

const filteredPanes = computed(() => {
  if (search.value.trim() === "") return props.panes;
  const query = search.value.toLowerCase();
  return props.panes.filter(
    (p) =>
      p.name.toLowerCase().includes(query) ||
      p.tabName.toLowerCase().includes(query),
  );
});

const isSelected = (id: string) => props.selectedId === id && !props.isCreating;
</script>

<template>
  <div class="h-full flex flex-col gap-3 p-3">
    <Button
      label="New Pane"
      icon="fas fa-plus"
      severity="success"
      size="small"
      class="w-full"
      @click="emit('create')"
    />

    <IconField>
      <InputIcon class="fas fa-magnifying-glass" />
      <InputText
        v-model="search"
        placeholder="Search..."
        class="w-full"
        size="small"
      />
    </IconField>

    <div class="flex-1 overflow-auto space-y-1">
      <div
        v-if="isCreating"
        class="p-2 rounded text-sm bg-primary/20 border border-primary/40 text-white font-medium"
      >
        <i class="fas fa-plus mr-2" />
        New Pane
      </div>

      <div
        v-for="pane in filteredPanes"
        :key="pane.id"
        class="p-2 rounded text-sm cursor-pointer transition-colors"
        :class="
          isSelected(pane.id)
            ? 'bg-surface-600 text-white font-medium'
            : 'text-surface-300 hover:bg-surface-700 hover:text-white'
        "
        @click="emit('select', pane.id)"
      >
        <div class="flex items-center gap-2">
          <i
            class="fas fa-circle text-[8px]"
            :class="pane.enabled ? 'text-green-500' : 'text-surface-500'"
          />
          <span class="truncate">{{ pane.name }}</span>
        </div>
        <div class="text-xs text-surface-400 ml-4 truncate">
          {{ pane.tabName }}
        </div>
      </div>

      <div
        v-if="filteredPanes.length === 0 && !isCreating"
        class="text-center text-surface-400 text-sm py-4"
      >
        No panes found
      </div>
    </div>
  </div>
</template>
