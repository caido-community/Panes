<script setup lang="ts">
interface Props {
  icon?: string;
  title: string;
  message?: string;
}

withDefaults(defineProps<Props>(), {
  icon: "fas fa-inbox",
});
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

