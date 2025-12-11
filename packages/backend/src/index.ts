import type { DefineAPI, SDK } from "caido:plugin";

// Placeholder functions for Phase 2
const getPanes = async (sdk: SDK) => {
  sdk.console.log("getPanes called - will be implemented in Phase 2");
  return { kind: "Success" as const, value: [] };
};

export type API = DefineAPI<{
  getPanes: typeof getPanes;
}>;

export type BackendEvents = {
  "pane:created": (paneId: string) => void;
  "pane:updated": (paneId: string) => void;
  "pane:deleted": (paneId: string) => void;
};

export function init(sdk: SDK<API, BackendEvents>) {
  sdk.console.log("Panes plugin backend initialized");
  
  // Register API endpoints
  sdk.api.register("getPanes", getPanes);
  
  // TODO Phase 2: Initialize storage and stores
}
