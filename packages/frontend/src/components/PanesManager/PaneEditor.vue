<script setup lang="ts">
import Button from "primevue/button";
import Checkbox from "primevue/checkbox";
import InputNumber from "primevue/inputnumber";
import InputText from "primevue/inputtext";
import Select from "primevue/select";
import SelectButton from "primevue/selectbutton";
import Textarea from "primevue/textarea";
import ToggleSwitch from "primevue/toggleswitch";
import type {
  PaneFormData,
  PaneInput,
  PaneLocation,
  PaneScope,
  TransformationType,
} from "shared";

const form = defineModel<PaneFormData>({ required: true });

defineProps<{
  isCreating: boolean;
  canSave: boolean;
  inputOptions: { label: string; value: PaneInput }[];
  locationOptions: { label: string; value: PaneLocation }[];
  transformationOptions: { label: string; value: TransformationType }[];
  scopeOptions: { label: string; value: PaneScope }[];
  workflowOptions: { label: string; value: string }[];
  workflowsLoading: boolean;
}>();

const emit = defineEmits<{
  save: [];
  cancel: [];
  delete: [];
}>();

const updateField = <K extends keyof PaneFormData>(
  key: K,
  value: PaneFormData[K],
) => {
  form.value = { ...form.value, [key]: value };
};

const toggleLocation = (location: PaneLocation) => {
  const locations = [...form.value.locations];
  const index = locations.indexOf(location);
  if (index === -1) {
    locations.push(location);
  } else {
    locations.splice(index, 1);
  }
  updateField("locations", locations);
};

const isLocationSelected = (location: PaneLocation) => {
  return form.value.locations.includes(location);
};

const languageOptions = [
  { label: "JSON", value: "json" },
  { label: "JavaScript", value: "javascript" },
  { label: "TypeScript", value: "typescript" },
  { label: "HTML", value: "html" },
  { label: "XML", value: "xml" },
  { label: "CSS", value: "css" },
  { label: "Python", value: "python" },
  { label: "Bash", value: "bash" },
  { label: "SQL", value: "sql" },
  { label: "YAML", value: "yaml" },
  { label: "Markdown", value: "markdown" },
  { label: "Plain Text", value: "text" },
];
</script>

<template>
  <div class="h-full flex flex-col p-4 gap-4 overflow-auto">
    <div class="flex items-center justify-between">
      <h3 class="text-lg font-semibold">
        {{ isCreating ? "Create New Pane" : "Edit Pane" }}
      </h3>
      <div class="flex items-center gap-2">
        <label class="text-sm text-surface-300">Enabled</label>
        <ToggleSwitch
          :model-value="form.enabled"
          @update:model-value="updateField('enabled', $event)"
        />
      </div>
    </div>

    <div class="grid grid-cols-2 gap-4">
      <div class="space-y-2">
        <label class="text-sm font-medium">Name *</label>
        <InputText
          :model-value="form.name"
          placeholder="e.g., JQ JSON Viewer"
          class="w-full"
          @update:model-value="updateField('name', $event)"
        />
      </div>

      <div class="space-y-2">
        <label class="text-sm font-medium">Tab Name *</label>
        <InputText
          :model-value="form.tabName"
          placeholder="e.g., JQ"
          class="w-full"
          maxlength="15"
          @update:model-value="updateField('tabName', $event)"
        />
        <p class="text-xs text-surface-400">
          Short name shown in view mode tab
        </p>
      </div>
    </div>

    <div class="space-y-2">
      <label class="text-sm font-medium">Description</label>
      <InputText
        :model-value="form.description"
        placeholder="Optional description"
        class="w-full"
        @update:model-value="updateField('description', $event)"
      />
    </div>

    <div class="space-y-2">
      <label class="text-sm font-medium">Scope *</label>
      <SelectButton
        :model-value="form.scope"
        :options="scopeOptions"
        option-label="label"
        option-value="value"
        class="w-full"
        @update:model-value="updateField('scope', $event)"
      />
      <p class="text-xs text-surface-400">
        Global panes are available across all projects. Project panes are only
        available in the current project.
      </p>
    </div>

    <div class="space-y-2">
      <label class="text-sm font-medium">Input Source *</label>
      <Select
        :model-value="form.input"
        :options="inputOptions"
        option-label="label"
        option-value="value"
        class="w-full"
        placeholder="Select input source"
        @update:model-value="updateField('input', $event)"
      />
    </div>

    <div class="space-y-2">
      <label class="text-sm font-medium">HTTPQL Filter</label>
      <InputText
        :model-value="form.httpql"
        placeholder='e.g., resp.raw.cont:"application/json"'
        class="w-full font-mono text-sm"
        @update:model-value="updateField('httpql', $event)"
      />
      <p class="text-xs text-surface-400">
        Only apply this pane when request matches the filter
      </p>
    </div>

    <div class="space-y-2">
      <label class="text-sm font-medium">Locations *</label>
      <div class="flex flex-wrap gap-2">
        <div
          v-for="option in locationOptions"
          :key="option.value"
          class="flex items-center gap-2"
        >
          <Checkbox
            :model-value="isLocationSelected(option.value)"
            binary
            @update:model-value="toggleLocation(option.value)"
          />
          <label
            class="text-sm cursor-pointer"
            @click="toggleLocation(option.value)"
          >
            {{ option.label }}
          </label>
        </div>
      </div>
    </div>

    <div class="space-y-3 border border-surface-700 rounded p-4">
      <label class="text-sm font-medium">Transformation *</label>
      <SelectButton
        :model-value="form.transformationType"
        :options="transformationOptions"
        option-label="label"
        option-value="value"
        class="w-full"
        @update:model-value="updateField('transformationType', $event)"
      />

      <div v-if="form.transformationType === 'command'" class="space-y-3">
        <div class="space-y-2">
          <label class="text-sm">Command *</label>
          <Textarea
            :model-value="form.command"
            placeholder='echo "{{input}}" | jq .'
            class="w-full font-mono text-sm"
            rows="3"
            @update:model-value="updateField('command', $event)"
          />
          <details class="text-xs">
            <summary
              class="text-surface-400 cursor-pointer hover:text-surface-300 mb-1"
            >
              Available variables
            </summary>
            <div class="mt-2 p-2 bg-surface-800 rounded space-y-1">
              <div class="font-mono text-xs">
                <div>
                  <code v-pre class="text-primary-400">{{ input }}</code> - The
                  extracted input data
                </div>
                <div>
                  <code v-pre class="text-primary-400">{{ requestId }}</code> -
                  Request ID
                </div>
                <div>
                  <code v-pre class="text-primary-400">{{ host }}</code> -
                  Request host
                </div>
                <div>
                  <code v-pre class="text-primary-400">{{ port }}</code> -
                  Request port
                </div>
                <div>
                  <code v-pre class="text-primary-400">{{ path }}</code> -
                  Request path
                </div>
                <div>
                  <code v-pre class="text-primary-400">{{ method }}</code> -
                  HTTP method
                </div>
                <div>
                  <code v-pre class="text-primary-400">{{ url }}</code> - Full
                  request URL
                </div>
                <div>
                  <code v-pre class="text-primary-400">{{ scheme }}</code> - URL
                  scheme (http/https)
                </div>
                <div>
                  <code v-pre class="text-primary-400">{{ query }}</code> -
                  Query string
                </div>
                <div>
                  <code v-pre class="text-primary-400">{{ responseCode }}</code>
                  - Response status code (if available)
                </div>
                <div>
                  <code v-pre class="text-primary-400">{{
                    responseLength
                  }}</code>
                  - Response body length (if available)
                </div>
              </div>
            </div>
          </details>
        </div>

        <div class="space-y-2">
          <label class="text-sm">Timeout (seconds)</label>
          <InputNumber
            :model-value="form.timeout"
            :min="1"
            :max="120"
            class="w-32"
            @update:model-value="updateField('timeout', $event ?? 30)"
          />
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div class="space-y-2">
            <label class="text-sm">Shell Path</label>
            <InputText
              :model-value="form.shell"
              placeholder="/bin/bash"
              class="w-full font-mono text-sm"
              @update:model-value="updateField('shell', $event)"
            />
          </div>

          <div class="space-y-2">
            <label class="text-sm">Shell Config</label>
            <InputText
              :model-value="form.shellConfig"
              placeholder="~/.bashrc"
              class="w-full font-mono text-sm"
              @update:model-value="updateField('shellConfig', $event)"
            />
          </div>
        </div>
        <p class="text-xs text-surface-400">
          Shell to execute commands. Unix: /bin/bash, /bin/zsh. Windows:
          cmd.exe, powershell.exe
        </p>
      </div>

      <div v-else class="space-y-2">
        <label class="text-sm">Convert Workflow *</label>
        <Select
          :model-value="form.workflowId"
          :options="workflowOptions"
          option-label="label"
          option-value="value"
          class="w-full"
          placeholder="Select a workflow"
          :loading="workflowsLoading"
          :disabled="workflowsLoading"
          @update:model-value="updateField('workflowId', $event)"
        />
        <p
          v-if="workflowOptions.length === 0 && !workflowsLoading"
          class="text-xs text-amber-400"
        >
          No Convert workflows found. Create one in Caido first.
        </p>
        <p v-else class="text-xs text-surface-400">
          Select a Convert workflow to transform the input
        </p>
      </div>
    </div>

    <div class="space-y-3 border border-surface-700 rounded p-4">
      <div class="flex items-center gap-2">
        <Checkbox
          :model-value="form.codeBlock"
          binary
          @update:model-value="updateField('codeBlock', $event)"
        />
        <label class="text-sm font-medium cursor-pointer">Code Block</label>
      </div>
      <p class="text-xs text-surface-400">
        Enable syntax highlighting for the output
      </p>

      <div v-if="form.codeBlock" class="space-y-2">
        <label class="text-sm font-medium">Language *</label>
        <Select
          :model-value="form.language"
          :options="languageOptions"
          option-label="label"
          option-value="value"
          class="w-full"
          placeholder="Select language"
          @update:model-value="updateField('language', $event)"
        />
      </div>
    </div>

    <div class="flex-1" />

    <div
      class="flex items-center justify-between pt-4 border-t border-surface-700"
    >
      <Button
        v-if="!isCreating"
        label="Delete"
        icon="fas fa-trash"
        severity="danger"
        outlined
        size="small"
        @click="emit('delete')"
      />
      <div v-else />

      <div class="flex gap-2">
        <Button
          label="Cancel"
          severity="secondary"
          outlined
          size="small"
          @click="emit('cancel')"
        />
        <Button
          :label="isCreating ? 'Create' : 'Save'"
          icon="fas fa-save"
          severity="success"
          size="small"
          :disabled="!canSave"
          @click="emit('save')"
        />
      </div>
    </div>
  </div>
</template>
