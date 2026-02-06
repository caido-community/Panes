import type { DefineAPI } from "caido:plugin";

import {
  createPane,
  deletePane,
  exportPanes,
  getPane,
  getPanes,
  getTemplates,
  importPanes,
  installTemplate,
  togglePane,
  updatePane,
} from "./api/panes";
import { getPlatform, getShellDefaults } from "./api/system";
import { getActivePanesForLocation, getPaneInputData } from "./api/transform";
import {
  getConvertWorkflows,
  getWorkflows,
  runCommand,
  runWorkflow,
  validateWorkflows,
} from "./api/workflows";
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
  exportPanes: typeof exportPanes;
  importPanes: typeof importPanes;
  getPaneInputData: typeof getPaneInputData;
  getActivePanesForLocation: typeof getActivePanesForLocation;
  getWorkflows: typeof getWorkflows;
  getConvertWorkflows: typeof getConvertWorkflows;
  runWorkflow: typeof runWorkflow;
  runCommand: typeof runCommand;
  validateWorkflows: typeof validateWorkflows;
  getTemplates: typeof getTemplates;
  installTemplate: typeof installTemplate;
  getPlatform: typeof getPlatform;
  getShellDefaults: typeof getShellDefaults;
}>;

export async function init(sdk: BackendSDK) {
  setSDK(sdk);

  await panesStore.initialize();
  await panesStore.ensureTemplatesInstalled();

  sdk.api.register("getPanes", getPanes);
  sdk.api.register("getPane", getPane);
  sdk.api.register("createPane", createPane);
  sdk.api.register("updatePane", updatePane);
  sdk.api.register("deletePane", deletePane);
  sdk.api.register("togglePane", togglePane);
  sdk.api.register("exportPanes", exportPanes);
  sdk.api.register("importPanes", importPanes);
  sdk.api.register("getPaneInputData", getPaneInputData);
  sdk.api.register("getActivePanesForLocation", getActivePanesForLocation);
  sdk.api.register("getWorkflows", getWorkflows);
  sdk.api.register("getConvertWorkflows", getConvertWorkflows);
  sdk.api.register("runWorkflow", runWorkflow);
  sdk.api.register("runCommand", runCommand);
  sdk.api.register("validateWorkflows", validateWorkflows);
  sdk.api.register("getTemplates", getTemplates);
  sdk.api.register("installTemplate", installTemplate);
  sdk.api.register("getPlatform", getPlatform);
  sdk.api.register("getShellDefaults", getShellDefaults);

  sdk.events.onProjectChange(async (_, project) => {
    const projectId = project?.getId();
    await panesStore.switchProject(projectId);
    sdk.api.send("project:changed", projectId);
  });
}
