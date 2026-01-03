import type { DefineAPI } from "caido:plugin";

import {
  createPane,
  deletePane,
  getPane,
  getPanes,
  togglePane,
  updatePane,
} from "./api/panes";
import { getActivePanesForLocation, getPaneInputData } from "./api/transform";
import { setSDK } from "./sdk";
import { panesStore } from "./stores/panes";
import type { BackendSDK } from "./types";

export { type BackendEvents } from "./types";

export type API = DefineAPI<{
  getPanes: typeof getPanes;
  getPane: typeof getPane;
  createPane: typeof createPane;
  updatePane: typeof updatePane;
  deletePane: typeof deletePane;
  togglePane: typeof togglePane;
  getPaneInputData: typeof getPaneInputData;
  getActivePanesForLocation: typeof getActivePanesForLocation;
}>;

export function init(sdk: BackendSDK) {
  setSDK(sdk);

  panesStore.initialize();

  sdk.api.register("getPanes", getPanes);
  sdk.api.register("getPane", getPane);
  sdk.api.register("createPane", createPane);
  sdk.api.register("updatePane", updatePane);
  sdk.api.register("deletePane", deletePane);
  sdk.api.register("togglePane", togglePane);
  sdk.api.register("getPaneInputData", getPaneInputData);
  sdk.api.register("getActivePanesForLocation", getActivePanesForLocation);

  sdk.events.onProjectChange(async (_, project) => {
    const projectId = project?.getId();
    await panesStore.switchProject(projectId);
    sdk.api.send("project:changed", projectId);
  });
}
