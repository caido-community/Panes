import { defineStore } from "pinia";
import type { Pane } from "shared";
import { computed, ref } from "vue";

import { useSDK } from "../plugins/sdk";

export const usePanesStore = defineStore("panes", () => {
  const sdk = useSDK();

  const panes = ref<Pane[]>([]);
  const loading = ref(false);
  const error = ref<string | undefined>(undefined);

  const enabledPanes = computed(() => panes.value.filter((p) => p.enabled));
  const disabledPanes = computed(() => panes.value.filter((p) => !p.enabled));

  const getPaneById = (id: string) => panes.value.find((p) => p.id === id);

  async function initialize() {
    await fetch();

    sdk.backend.onEvent("project:changed", async () => {
      await fetch();
    });

    sdk.backend.onEvent("pane:created", (pane: Pane) => {
      panes.value.push(pane);
    });

    sdk.backend.onEvent("pane:updated", (pane: Pane) => {
      const index = panes.value.findIndex((p) => p.id === pane.id);
      if (index !== -1) {
        panes.value[index] = pane;
      }
    });

    sdk.backend.onEvent("pane:deleted", (paneId: string) => {
      panes.value = panes.value.filter((p) => p.id !== paneId);
    });
  }

  async function fetch() {
    loading.value = true;
    error.value = undefined;

    const result = await sdk.backend.getPanes();
    if (result.kind === "Success") {
      panes.value = result.value;
    } else {
      error.value = result.error;
      sdk.window.showToast(`Failed to load panes: ${result.error}`, {
        variant: "error",
      });
    }

    loading.value = false;
  }

  async function createPane(
    data: Omit<Pane, "id" | "createdAt" | "updatedAt">,
  ): Promise<Pane | undefined> {
    const result = await sdk.backend.createPane(data);
    if (result.kind === "Success") {
      sdk.window.showToast("Pane created", { variant: "success" });
      return result.value;
    }
    sdk.window.showToast(`Failed to create pane: ${result.error}`, {
      variant: "error",
    });
    return undefined;
  }

  async function updatePane(
    id: string,
    updates: Partial<Pane>,
  ): Promise<Pane | undefined> {
    const result = await sdk.backend.updatePane(id, updates);
    if (result.kind === "Success") {
      sdk.window.showToast("Pane updated", { variant: "success" });
      return result.value;
    }
    sdk.window.showToast(`Failed to update pane: ${result.error}`, {
      variant: "error",
    });
    return undefined;
  }

  async function deletePane(id: string): Promise<boolean> {
    const result = await sdk.backend.deletePane(id);
    if (result.kind === "Success") {
      sdk.window.showToast("Pane deleted", { variant: "success" });
      return true;
    }
    sdk.window.showToast(`Failed to delete pane: ${result.error}`, {
      variant: "error",
    });
    return false;
  }

  async function togglePane(id: string, enabled: boolean): Promise<boolean> {
    const result = await sdk.backend.togglePane(id, enabled);
    if (result.kind === "Success") {
      return true;
    }
    sdk.window.showToast(`Failed to toggle pane: ${result.error}`, {
      variant: "error",
    });
    return false;
  }

  return {
    panes,
    loading,
    error,
    enabledPanes,
    disabledPanes,
    getPaneById,
    initialize,
    fetch,
    createPane,
    updatePane,
    deletePane,
    togglePane,
  };
});
