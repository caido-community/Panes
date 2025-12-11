<script setup lang="ts">
import Card from "primevue/card";
</script>

<template>
  <div class="h-full flex flex-col gap-1">
    <Card
      class="h-fit"
      pt:body:class="h-fit p-0 flex flex-col"
      pt:content:class="h-fit flex flex-col"
    >
      <template #header>
        <div class="p-4">
          <h2 class="text-lg font-semibold">Panes Manager</h2>
          <p class="text-sm text-gray-400">
            Create and edit custom view modes for requests and responses
          </p>
        </div>
      </template>
    </Card>

    <Card
      class="flex-1 min-h-0"
      pt:body:class="h-full p-0 flex flex-col"
      pt:content:class="h-full flex flex-col p-4"
    >
      <template #content>
        <div class="flex items-center justify-center h-full text-gray-400">
          <div class="text-center">
            <i class="fas fa-plus-circle text-4xl mb-4" />
            <p class="text-lg">Panes Manager</p>
            <p class="text-sm mt-2">Coming in Phase 4</p>
          </div>
        </div>
      </template>
    </Card>
  </div>
</template>
