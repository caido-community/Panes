import type { DataTableFilterMeta } from "primevue/datatable";
import type { Pane, PaneInput, PaneLocation } from "shared";
import { computed, ref } from "vue";

import { usePanesStore } from "@/stores/panes";

export const useTable = () => {
  const store = usePanesStore();
  const search = ref("");

  const filters = computed<DataTableFilterMeta>(() => ({
    global: { value: search.value, matchMode: "contains" },
  }));

  const panes = computed(() => store.panes);

  const getInputLabel = (input: PaneInput): string => {
    const labels: Record<PaneInput, string> = {
      "request.body": "Request Body",
      "request.headers": "Request Headers",
      "request.query": "Request Query",
      "request.raw": "Request Raw",
      "response.body": "Response Body",
      "response.headers": "Response Headers",
      "response.raw": "Response Raw",
      "request-response": "Both",
    };
    return labels[input];
  };

  const getLocationLabel = (location: PaneLocation): string => {
    const labels: Record<PaneLocation, string> = {
      "http-history": "HTTP History",
      sitemap: "Sitemap",
      replay: "Replay",
      automate: "Automate",
      intercept: "Intercept",
    };
    return labels[location];
  };

  const getLocationsText = (locations: PaneLocation[]): string => {
    if (locations.length === 0) return "None";
    if (locations.length <= 2) {
      return locations.map(getLocationLabel).join(", ");
    }
    return `${locations.length} locations`;
  };

  const getTransformationLabel = (pane: Pane): string => {
    if (pane.transformation.type === "workflow") {
      return "Workflow";
    }
    return "Command";
  };

  const togglePane = async (pane: Pane) => {
    await store.togglePane(pane.id, !pane.enabled);
  };

  return {
    search,
    filters,
    panes,
    getInputLabel,
    getLocationLabel,
    getLocationsText,
    getTransformationLabel,
    togglePane,
  };
};
