import type { DefineEvents, SDK } from "caido:plugin";
import type { Pane } from "shared";

import type { API } from ".";

export type BackendSDK = SDK<API, BackendEvents>;

export type BackendEvents = DefineEvents<{
  "pane:created": (pane: Pane) => void;
  "pane:updated": (pane: Pane) => void;
  "pane:deleted": (paneId: string) => void;
  "pane:toggled": (paneId: string, enabled: boolean) => void;
  "project:changed": (projectId: string | undefined) => void;
}>;
