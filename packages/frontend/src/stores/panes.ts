import { defineStore } from "pinia";
import type { CreatePaneInput, Pane, UpdatePaneInput } from "shared";
import { computed, ref } from "vue";

import { useSDK } from "../plugins/sdk";

export const usePanesStore = defineStore("panes", () => {
  const sdk = useSDK();

  const panes = ref<Pane[]>([]);
  const loading = ref(false);
  const error = ref<string | undefined>(undefined);

  const enabledPanes = computed(() =>
    panes.value.filter((p) => p.enabled === true),
  );
  const disabledPanes = computed(() =>
    panes.value.filter((p) => p.enabled === false),
  );

  const getPaneById = (id: string) => panes.value.find((p) => p.id === id);

  async function initialize() {
    await fetch();

    sdk.backend.onEvent("project:changed", async () => {
      await fetch();
    });

    sdk.backend.onEvent("pane:created", (pane: Pane) => {
      const existingIndex = panes.value.findIndex((p) => p.id === pane.id);
      if (existingIndex === -1) {
        panes.value.push(pane);
      } else {
        panes.value[existingIndex] = pane;
      }
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

  function promptReload() {
    sdk.window.showToast("Reloading to apply view mode changes...", {
      variant: "info",
      duration: 1500,
    });
    localStorage.setItem("panes-restore-path", window.location.hash);
    setTimeout(() => {
      window.location.reload();
    }, 1500);
  }

  async function createPane(data: CreatePaneInput): Promise<Pane | undefined> {
    const result = await sdk.backend.createPane(data);
    if (result.kind === "Success") {
      sdk.window.showToast("Pane created", { variant: "success" });
      promptReload();
      return result.value;
    }
    sdk.window.showToast(`Failed to create pane: ${result.error}`, {
      variant: "error",
    });
    return undefined;
  }

  async function updatePane(
    id: string,
    updates: UpdatePaneInput,
  ): Promise<Pane | undefined> {
    const result = await sdk.backend.updatePane(id, updates);
    if (result.kind === "Success") {
      sdk.window.showToast("Pane updated", { variant: "success" });
      promptReload();
      return result.value;
    }
    sdk.window.showToast(`Failed to update pane: ${result.error}`, {
      variant: "error",
    });
    return undefined;
  }

  async function deletePane(id: string): Promise<boolean> {
    const existingPane = getPaneById(id);
    const wasEnabled = existingPane?.enabled ?? false;

    const result = await sdk.backend.deletePane(id);
    if (result.kind === "Success") {
      sdk.window.showToast("Pane deleted", { variant: "success" });
      if (wasEnabled) {
        promptReload();
      }
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
      promptReload();
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
    promptReload,
    createPane,
    updatePane,
    deletePane,
    togglePane,
  };
});
