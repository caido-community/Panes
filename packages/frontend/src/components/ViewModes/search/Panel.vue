<script setup lang="ts">
import Button from "primevue/button";
import InputGroup from "primevue/inputgroup";
import InputGroupAddon from "primevue/inputgroupaddon";
import InputText from "primevue/inputtext";
import { inject } from "vue";

import type { SearchPanelContext } from "./constants";
import { SearchPanelSymbol } from "./constants";
import { useForm } from "./useForm";

const { view, query } = inject(SearchPanelSymbol) as SearchPanelContext;

const {
  search,
  asRegex,
  matchCase,
  byWord,
  count,
  onUpdateSearch,
  onToggleRegex,
  onToggleMatchCase,
  onToggleByWord,
  onPrevClick,
  onNextClick,
  onCloseClick,
  onKeyDown,
} = useForm(view, query);
</script>

<template>
  <div class="p-1 bg-surface-900 flex flex-col gap-1">
    <div class="flex gap-1 items-center">
      <div class="flex-1 flex flex-col gap-1">
        <InputGroup>
          <InputText
            class="self-center"
            data-main-field="true"
            placeholder="Search"
            size="small"
            :model-value="search"
            aria-label="Search"
            fluid
            @update:model-value="onUpdateSearch"
            @keydown="onKeyDown"
          />
          <InputGroupAddon class="!p-0 w-20 border-l-0 !text-surface-300">
            <div v-if="count === 0" class="text-xs">No matches</div>
            <div v-else-if="count !== 1" class="text-xs">
              {{ count }} matches
            </div>
            <div v-else class="text-xs">1 match</div>
          </InputGroupAddon>
        </InputGroup>
      </div>
      <div class="flex flex-col gap-1">
        <div class="flex gap-1 items-center">
          <Button
            severity="contrast"
            outlined
            size="small"
            icon="fas fa-arrow-left"
            title="Previous (Shift+Enter)"
            @click="onPrevClick"
          />

          <Button
            severity="contrast"
            outlined
            size="small"
            icon="fas fa-arrow-right"
            title="Next (Enter)"
            @click="onNextClick"
          />

          <Button
            :severity="asRegex ? 'info' : 'contrast'"
            :outlined="!asRegex"
            size="small"
            label="as regex"
            @click="onToggleRegex"
          />

          <Button
            :severity="matchCase ? 'info' : 'contrast'"
            :outlined="!matchCase"
            size="small"
            label="match case"
            @click="onToggleMatchCase"
          />

          <Button
            :severity="byWord ? 'info' : 'contrast'"
            :outlined="!byWord"
            size="small"
            label="by word"
            @click="onToggleByWord"
          />

          <Button
            severity="contrast"
            outlined
            size="small"
            icon="fas fa-close"
            title="Close"
            @click="onCloseClick"
          />
        </div>
      </div>
    </div>
  </div>
</template>
