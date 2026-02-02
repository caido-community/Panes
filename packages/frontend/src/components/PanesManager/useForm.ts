import type {
  CreatePaneInput,
  PaneFormData,
  PaneInput,
  PaneLocation,
  PaneScope,
  TransformationType,
  WorkflowInfo,
} from "shared";
import { computed, onMounted, ref, watch } from "vue";

import { useSDK } from "@/plugins/sdk";
import { usePanesStore } from "@/stores/panes";

const getDefaultFormData = (): PaneFormData => ({
  name: "",
  tabName: "",
  description: "",
  enabled: true,
  scope: "project",
  input: "response.body",
  httpql: "",
  locations: ["http-history", "replay"],
  transformationType: "workflow",
  workflowId: "",
  command: "",
  timeout: 30,
  shell: "/bin/bash",
  shellConfig: "~/.bashrc",
  codeBlock: false,
  language: "json",
});

export const useForm = () => {
  const sdk = useSDK();
  const store = usePanesStore();

  const selectedPaneId = ref<string | undefined>(undefined);
  const isCreating = ref(false);
  const formData = ref<PaneFormData>(getDefaultFormData());
  const workflows = ref<WorkflowInfo[]>([]);
  const workflowsLoading = ref(false);
  const workflowsError = ref<string | undefined>(undefined);

  const fetchWorkflows = async () => {
    workflowsLoading.value = true;
    workflowsError.value = undefined;

    const result = await sdk.backend.getConvertWorkflows();
    if (result.kind === "Success") {
      workflows.value = result.value;
    } else {
      workflowsError.value = result.error;
      workflows.value = [];
    }

    workflowsLoading.value = false;
  };

  onMounted(() => {
    fetchWorkflows();
  });

  const selectedPane = computed(() => {
    if (selectedPaneId.value === undefined) return undefined;
    return store.getPaneById(selectedPaneId.value);
  });

  const hasSelection = computed(
    () => selectedPaneId.value !== undefined || isCreating.value,
  );

  watch(selectedPaneId, (id) => {
    if (id === undefined) {
      formData.value = getDefaultFormData();
      return;
    }
    const pane = store.getPaneById(id);
    if (pane === undefined) return;

    formData.value = {
      name: pane.name,
      tabName: pane.tabName,
      description: pane.description ?? "",
      enabled: pane.enabled,
      scope: pane.scope,
      input: pane.input,
      httpql: pane.httpql ?? "",
      locations: [...pane.locations],
      transformationType: pane.transformation.type,
      workflowId:
        pane.transformation.type === "workflow"
          ? pane.transformation.workflowId
          : "",
      command:
        pane.transformation.type === "command"
          ? pane.transformation.command
          : "",
      timeout:
        pane.transformation.type === "command"
          ? (pane.transformation.timeout ?? 30)
          : 30,
      shell:
        pane.transformation.type === "command"
          ? (pane.transformation.shell ?? "/bin/bash")
          : "/bin/bash",
      shellConfig:
        pane.transformation.type === "command"
          ? (pane.transformation.shellConfig ?? "~/.bashrc")
          : "~/.bashrc",
      codeBlock: pane.codeBlock ?? false,
      language: pane.language ?? "json",
    };
    isCreating.value = false;
  });

  const selectPane = (id: string) => {
    selectedPaneId.value = id;
    isCreating.value = false;
  };

  const startCreate = () => {
    selectedPaneId.value = undefined;
    formData.value = getDefaultFormData();
    isCreating.value = true;
  };

  const cancelEdit = () => {
    selectedPaneId.value = undefined;
    isCreating.value = false;
    formData.value = getDefaultFormData();
  };

  const canSave = computed(() => {
    const data = formData.value;
    if (data.name.trim() === "") return false;
    if (data.tabName.trim() === "") return false;
    if (data.locations.length === 0) return false;
    if (data.transformationType === "workflow" && data.workflowId === "")
      return false;
    if (data.transformationType === "command" && data.command.trim() === "")
      return false;
    return true;
  });

  const buildPaneData = (): CreatePaneInput => {
    const data = formData.value;
    return {
      name: data.name.trim(),
      tabName: data.tabName.trim(),
      description: data.description.trim() || undefined,
      enabled: data.enabled,
      scope: data.scope,
      input: data.input,
      httpql: data.httpql.trim() || undefined,
      locations: data.locations,
      transformation:
        data.transformationType === "workflow"
          ? { type: "workflow", workflowId: data.workflowId }
          : {
              type: "command",
              command: data.command,
              timeout: data.timeout,
              shell: data.shell.trim() || "/bin/bash",
              shellConfig: data.shellConfig.trim() || undefined,
            },
      codeBlock: data.codeBlock || undefined,
      language: data.codeBlock ? data.language : undefined,
    };
  };

  const savePane = async () => {
    if (!canSave.value) return;

    const paneData = buildPaneData();

    if (isCreating.value) {
      const created = await store.createPane(paneData);
      if (created !== undefined) {
        selectedPaneId.value = created.id;
        isCreating.value = false;
      }
    } else if (selectedPaneId.value !== undefined) {
      await store.updatePane(selectedPaneId.value, paneData);
    }
  };

  const deletePane = async () => {
    if (selectedPaneId.value === undefined) return;
    const success = await store.deletePane(selectedPaneId.value);
    if (success) {
      selectedPaneId.value = undefined;
      isCreating.value = false;
    }
  };

  const inputOptions: { label: string; value: PaneInput }[] = [
    { label: "Request Body", value: "request.body" },
    { label: "Request Headers", value: "request.headers" },
    { label: "Request Query", value: "request.query" },
    { label: "Request Raw", value: "request.raw" },
    { label: "Response Body", value: "response.body" },
    { label: "Response Headers", value: "response.headers" },
    { label: "Response Raw", value: "response.raw" },
  ];

  const locationOptions: { label: string; value: PaneLocation }[] = [
    { label: "HTTP History", value: "http-history" },
    { label: "Sitemap", value: "sitemap" },
    { label: "Replay", value: "replay" },
    { label: "Automate", value: "automate" },
    { label: "Intercept", value: "intercept" },
  ];

  const transformationOptions: { label: string; value: TransformationType }[] =
    [
      { label: "Workflow", value: "workflow" },
      { label: "Shell Command", value: "command" },
    ];

  const scopeOptions: { label: string; value: PaneScope }[] = [
    { label: "Global", value: "global" },
    { label: "Project", value: "project" },
  ];

  const workflowOptions = computed(() =>
    workflows.value.map((w) => ({
      label: w.name,
      value: w.id,
    })),
  );

  return {
    panes: computed(() => store.panes),
    selectedPaneId,
    selectedPane,
    isCreating,
    hasSelection,
    formData,
    canSave,
    inputOptions,
    locationOptions,
    transformationOptions,
    scopeOptions,
    workflowOptions,
    workflowsLoading,
    workflowsError,
    fetchWorkflows,
    selectPane,
    startCreate,
    cancelEdit,
    savePane,
    deletePane,
  };
};
