<script setup lang="ts">
import Button from "primevue/button";
import Checkbox from "primevue/checkbox";
import Dialog from "primevue/dialog";
import FileUpload from "primevue/fileupload";
import type { FileUploadSelectEvent } from "primevue/fileupload";
import Tag from "primevue/tag";
import type { Pane, PanesExport } from "shared";
import { computed, ref } from "vue";

import { useSDK } from "@/plugins/sdk";
import { usePanesStore } from "@/stores/panes";

const props = defineProps<{
  visible: boolean;
  mode: "export" | "import";
}>();

const emit = defineEmits<{
  "update:visible": [value: boolean];
}>();

const sdk = useSDK();
const store = usePanesStore();

const selectedPaneIds = ref<string[]>([]);
const importData = ref<PanesExport | undefined>(undefined);
const importFileName = ref<string>("");
const overwriteExisting = ref(false);
const importing = ref(false);
const exporting = ref(false);

const dialogVisible = computed({
  get: () => props.visible,
  set: (value) => emit("update:visible", value),
});

const title = computed(() =>
  props.mode === "export" ? "Export Panes" : "Import Panes",
);

const allSelected = computed(
  () => selectedPaneIds.value.length === store.panes.length,
);

const toggleSelectAll = () => {
  if (allSelected.value) {
    selectedPaneIds.value = [];
  } else {
    selectedPaneIds.value = store.panes.map((p) => p.id);
  }
};

const togglePane = (pane: Pane) => {
  const index = selectedPaneIds.value.indexOf(pane.id);
  if (index === -1) {
    selectedPaneIds.value.push(pane.id);
  } else {
    selectedPaneIds.value.splice(index, 1);
  }
};

const isPaneSelected = (pane: Pane) => selectedPaneIds.value.includes(pane.id);

const handleExport = async () => {
  exporting.value = true;

  const paneIds =
    selectedPaneIds.value.length > 0 ? selectedPaneIds.value : undefined;
  const result = await sdk.backend.exportPanes(paneIds);

  if (result.kind === "Success") {
    const blob = new Blob([JSON.stringify(result.value, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `panes-export-${Date.now()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    sdk.window.showToast(`Exported ${result.value.panes.length} pane(s)`, {
      variant: "success",
    });
    dialogVisible.value = false;
  } else {
    sdk.window.showToast(`Export failed: ${result.error}`, {
      variant: "error",
    });
  }

  exporting.value = false;
};

const handleFileSelect = async (event: FileUploadSelectEvent) => {
  const file = event.files[0];
  if (file === undefined) return;

  importFileName.value = file.name;
  const content = await file.text();

  try {
    importData.value = JSON.parse(content) as PanesExport;
  } catch {
    sdk.window.showToast("Invalid JSON file", { variant: "error" });
    importData.value = undefined;
    importFileName.value = "";
  }
};

const handleImport = async () => {
  if (importData.value === undefined) return;

  importing.value = true;

  const result = await sdk.backend.importPanes(
    importData.value,
    overwriteExisting.value,
  );

  if (result.kind === "Success") {
    const { created, skipped } = result.value;
    sdk.window.showToast(`Imported ${created} pane(s), skipped ${skipped}`, {
      variant: "success",
    });
    await store.fetch();
    dialogVisible.value = false;
    store.promptReload();
  } else {
    sdk.window.showToast(`Import failed: ${result.error}`, {
      variant: "error",
    });
  }

  importing.value = false;
};

const resetImport = () => {
  importData.value = undefined;
  importFileName.value = "";
  overwriteExisting.value = false;
};

const closeDialog = () => {
  dialogVisible.value = false;
  selectedPaneIds.value = [];
  resetImport();
};
</script>

<template>
  <Dialog
    v-model:visible="dialogVisible"
    :header="title"
    modal
    class="w-[500px]"
    @hide="closeDialog"
  >
    <div v-if="mode === 'export'" class="space-y-4">
      <p class="text-sm text-surface-300">
        Select panes to export. Leave all unchecked to export all panes.
      </p>

      <div class="space-y-2">
        <div class="flex items-center gap-2 pb-2 border-b border-surface-700">
          <Checkbox
            :model-value="allSelected"
            binary
            @update:model-value="toggleSelectAll"
          />
          <label
            class="text-sm font-medium cursor-pointer"
            @click="toggleSelectAll"
          >
            Select All ({{ store.panes.length }})
          </label>
        </div>

        <div class="max-h-64 overflow-auto space-y-1">
          <div
            v-for="pane in store.panes"
            :key="pane.id"
            class="flex items-center gap-2 p-2 rounded hover:bg-surface-700"
          >
            <Checkbox
              :model-value="isPaneSelected(pane)"
              binary
              @update:model-value="togglePane(pane)"
            />
            <div class="flex-1">
              <div class="flex items-center gap-2">
                <div class="text-sm">{{ pane.name }}</div>
                <Tag
                  :value="pane.scope === 'global' ? 'Global' : 'Project'"
                  :severity="pane.scope === 'global' ? 'info' : 'secondary'"
                  class="text-xs"
                />
              </div>
              <div class="text-xs text-surface-400">{{ pane.tabName }}</div>
            </div>
            <i
              class="fas fa-circle text-[8px]"
              :class="pane.enabled ? 'text-green-500' : 'text-surface-500'"
            />
          </div>
        </div>
      </div>

      <div class="flex justify-end gap-2 pt-4 border-t border-surface-700">
        <Button
          label="Cancel"
          severity="secondary"
          outlined
          size="small"
          @click="closeDialog"
        />
        <Button
          label="Export"
          icon="fas fa-download"
          severity="success"
          size="small"
          :loading="exporting"
          @click="handleExport"
        />
      </div>
    </div>

    <div v-else class="space-y-4">
      <p class="text-sm text-surface-300">
        Select a JSON file to import panes from.
      </p>

      <FileUpload
        mode="basic"
        accept=".json"
        :auto="true"
        choose-label="Select File"
        class="w-full"
        @select="handleFileSelect"
      />

      <div v-if="importData !== undefined" class="space-y-3">
        <div class="p-3 bg-surface-700 rounded">
          <div class="text-sm font-medium">{{ importFileName }}</div>
          <div class="text-xs text-surface-400">
            {{ importData.panes.length }} pane(s) found
          </div>
        </div>

        <div class="max-h-48 overflow-auto space-y-1">
          <div
            v-for="(pane, index) in importData.panes"
            :key="index"
            class="flex items-center gap-2 p-2 rounded bg-surface-800"
          >
            <i class="fas fa-window-restore text-surface-400" />
            <div class="flex-1">
              <div class="flex items-center gap-2">
                <div class="text-sm">{{ pane.name }}</div>
                <Tag
                  :value="pane.scope === 'global' ? 'Global' : 'Project'"
                  :severity="pane.scope === 'global' ? 'info' : 'secondary'"
                  class="text-xs"
                />
              </div>
              <div class="text-xs text-surface-400">{{ pane.tabName }}</div>
            </div>
          </div>
        </div>

        <div class="flex items-center gap-2">
          <Checkbox v-model="overwriteExisting" binary />
          <label class="text-sm text-surface-300">
            Overwrite existing panes with same name
          </label>
        </div>
      </div>

      <div class="flex justify-end gap-2 pt-4 border-t border-surface-700">
        <Button
          label="Cancel"
          severity="secondary"
          outlined
          size="small"
          @click="closeDialog"
        />
        <Button
          label="Import"
          icon="fas fa-upload"
          severity="success"
          size="small"
          :loading="importing"
          :disabled="importData === undefined"
          @click="handleImport"
        />
      </div>
    </div>
  </Dialog>
</template>
