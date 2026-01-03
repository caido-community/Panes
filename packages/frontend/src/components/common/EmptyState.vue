<script setup lang="ts">
const { icon = "fas fa-inbox", message = "" } = defineProps<{
  title: string;
  icon?: string;
  message?: string;
}>();
</script>

<template>
  <div class="flex items-center justify-center h-full text-gray-400">
    <div class="text-center">
      <i :class="[icon, 'text-4xl mb-4']" />
      <p class="text-lg">{{ title }}</p>
      <p v-if="message" class="text-sm mt-2">{{ message }}</p>
    </div>
  </div>
</template>
