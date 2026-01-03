<script setup lang="ts">
import Card from "primevue/card";

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
  </div>
</template>
