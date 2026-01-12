import type { DataTableFilterMeta } from "primevue/datatable";
import type { Pane, PaneInput, WorkflowValidationResult } from "shared";
import { computed, onMounted, ref } from "vue";

import { useSDK } from "@/plugins/sdk";
import { usePanesStore } from "@/stores/panes";

export const useTable = () => {
  const sdk = useSDK();
  const store = usePanesStore();
  const search = ref("");
  const workflowValidations = ref<WorkflowValidationResult[]>([]);
  const validationsLoading = ref(false);

  const filters = computed<DataTableFilterMeta>(() => ({
    global: { value: search.value, matchMode: "contains" },
  }));

  const panes = computed(() => store.panes);

  const fetchWorkflowValidations = async () => {
    validationsLoading.value = true;
    const result = await sdk.backend.validateWorkflows();
    if (result.kind === "Success") {
      workflowValidations.value = result.value;
    }
    validationsLoading.value = false;
  };

  store.$subscribe(() => {
    void fetchWorkflowValidations();
  });

  const getWorkflowStatus = (pane: Pane) => {
    if (pane.transformation.type !== "workflow") return undefined;
    return workflowValidations.value.find((v) => v.paneId === pane.id);
  };

  onMounted(() => {
    void fetchWorkflowValidations();
  });

  const getInputLabel = (input: PaneInput): string => {
    const labels: Record<PaneInput, string> = {
      "request.body": "Request Body",
      "request.headers": "Request Headers",
      "request.query": "Request Query",
      "request.raw": "Request Raw",
      "response.body": "Response Body",
      "response.headers": "Response Headers",
      "response.raw": "Response Raw",
    };
    return labels[input];
  };

  const togglePane = async (pane: Pane) => {
    await store.togglePane(pane.id, !pane.enabled);
  };

  return {
    search,
    filters,
    panes,
    getInputLabel,
    togglePane,
    getWorkflowStatus,
    validationsLoading,
    fetchWorkflowValidations,
  };
};
