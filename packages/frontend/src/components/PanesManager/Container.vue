<script setup lang="ts">
import Button from "primevue/button";
import Card from "primevue/card";
import { ref } from "vue";

import ExportImportDialog from "./ExportImportDialog.vue";
import PaneEditor from "./PaneEditor.vue";
import PanesList from "./PanesList.vue";
import { useForm } from "./useForm";

import { EmptyState } from "@/components/common";

const {
  panes,
  selectedPaneId,
  isCreating,
  hasSelection,
  formData,
  canSave,
  inputOptions,
  locationOptions,
  transformationOptions,
  workflowOptions,
  workflowsLoading,
  selectPane,
  startCreate,
  cancelEdit,
  savePane,
  deletePane,
} = useForm();

const showExportDialog = ref(false);
const showImportDialog = ref(false);
</script>

<template>
  <div class="h-full flex gap-1">
    <Card
      class="w-64 flex-shrink-0"
      pt:body:class="h-full p-0 flex flex-col"
      pt:content:class="h-full flex flex-col"
    >
      <template #content>
        <PanesList
          :panes="panes"
          :selected-id="selectedPaneId"
          :is-creating="isCreating"
          @select="selectPane"
          @create="startCreate"
        />
        <div class="p-3 border-t border-surface-700 flex gap-2">
          <Button
            label="Export"
            icon="fas fa-download"
            severity="secondary"
            outlined
            size="small"
            class="flex-1"
            @click="showExportDialog = true"
          />
          <Button
            label="Import"
            icon="fas fa-upload"
            severity="secondary"
            outlined
            size="small"
            class="flex-1"
            @click="showImportDialog = true"
          />
        </div>
      </template>
    </Card>

    <Card
      class="flex-1"
      pt:body:class="h-full p-0 flex flex-col"
      pt:content:class="h-full flex flex-col"
    >
      <template #content>
        <PaneEditor
          v-if="hasSelection"
          v-model="formData"
          :is-creating="isCreating"
          :can-save="canSave"
          :input-options="inputOptions"
          :location-options="locationOptions"
          :transformation-options="transformationOptions"
          :workflow-options="workflowOptions"
          :workflows-loading="workflowsLoading"
          @save="savePane"
          @cancel="cancelEdit"
          @delete="deletePane"
        />
        <EmptyState
          v-else
          title="No pane selected"
          icon="fas fa-hand-pointer"
          message="Select a pane to edit or create a new one"
        />
      </template>
    </Card>

    <ExportImportDialog v-model:visible="showExportDialog" mode="export" />
    <ExportImportDialog v-model:visible="showImportDialog" mode="import" />
  </div>
</template>
