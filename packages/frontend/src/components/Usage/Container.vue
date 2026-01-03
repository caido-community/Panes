<script setup lang="ts">
import Card from "primevue/card";

import { useForm } from "./useForm";

const { sections, scrollToSection, isActive, contentRef } = useForm();
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
          <h2 class="text-lg font-semibold">Usage</h2>
          <p class="text-sm text-gray-400">
            Learn how to use Panes to create and view custom transformations
          </p>
        </div>
      </template>
    </Card>

    <div class="flex gap-1 h-full overflow-auto">
      <Card
        class="h-full w-[220px] flex-shrink-0"
        pt:body:class="h-full p-0 flex flex-col"
        pt:content:class="h-full flex flex-col"
      >
        <template #content>
          <div class="h-full overflow-auto p-3 space-y-1">
            <div
              v-for="section in sections"
              :key="section.id"
              class="cursor-pointer py-2 px-3 rounded text-sm transition-colors"
              :class="
                isActive(section.id)
                  ? 'bg-surface-700 text-white font-medium'
                  : 'text-surface-300 hover:bg-surface-800 hover:text-white'
              "
              @click="scrollToSection(section.id)"
            >
              {{ section.title }}
            </div>
          </div>
        </template>
      </Card>

      <Card
        class="h-full flex-1"
        pt:body:class="h-full p-0 flex flex-col"
        pt:content:class="h-full flex flex-col"
      >
        <template #content>
          <div ref="contentRef" class="h-full overflow-auto p-4">
            <div class="space-y-8">
              <section
                v-for="section in sections"
                :id="section.id"
                :key="section.id"
                class="space-y-3"
              >
                <h2 class="text-2xl font-semibold">{{ section.title }}</h2>
                <div class="space-y-3 text-surface-300 leading-relaxed">
                  <p v-for="(para, idx) in section.body" :key="idx">
                    {{ para }}
                  </p>
                </div>
              </section>
            </div>
          </div>
        </template>
      </Card>
    </div>
  </div>
</template>
