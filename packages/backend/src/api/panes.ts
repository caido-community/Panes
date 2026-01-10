import type {
  ImportResult,
  Pane,
  PanesExport,
  PaneTemplate,
  Result,
} from "shared";
import { error, getAllTemplates, ok } from "shared";

import { panesStore } from "../stores/panes";
import type { BackendSDK } from "../types";

const EXPORT_VERSION = 1;

export function getPanes(_sdk: BackendSDK): Result<Pane[]> {
  return ok(panesStore.getPanes());
}

export function getPane(_sdk: BackendSDK, id: string): Result<Pane> {
  const pane = panesStore.getPane(id);
  if (pane === undefined) {
    return error("Pane not found");
  }
  return ok(pane);
}

export function createPane(
  _sdk: BackendSDK,
  data: Omit<Pane, "id" | "createdAt" | "updatedAt">,
): Result<Pane> {
  const pane = panesStore.createPane(data);
  return ok(pane);
}

export function updatePane(
  _sdk: BackendSDK,
  id: string,
  updates: Partial<Pane>,
): Result<Pane> {
  const pane = panesStore.updatePane(id, updates);
  if (pane === undefined) {
    return error("Pane not found");
  }
  return ok(pane);
}

export function deletePane(_sdk: BackendSDK, id: string): Result<void> {
  const deleted = panesStore.deletePane(id);
  if (deleted === false) {
    return error("Pane not found");
  }
  return ok(undefined);
}

export function togglePane(
  _sdk: BackendSDK,
  id: string,
  enabled: boolean,
): Result<Pane> {
  const pane = panesStore.togglePane(id, enabled);
  if (pane === undefined) {
    return error("Pane not found");
  }
  return ok(pane);
}

export function exportPanes(
  _sdk: BackendSDK,
  paneIds?: string[],
): Result<PanesExport> {
  const allPanes = panesStore.getPanes();
  const panesToExport =
    paneIds !== undefined && paneIds.length > 0
      ? allPanes.filter((p) => paneIds.includes(p.id))
      : allPanes;

  const exportData: PanesExport = {
    version: EXPORT_VERSION,
    exportDate: Date.now(),
    panes: panesToExport.map((p) => ({
      name: p.name,
      tabName: p.tabName,
      description: p.description,
      enabled: p.enabled,
      input: p.input,
      httpql: p.httpql,
      locations: p.locations,
      transformation: p.transformation,
      codeBlock: p.codeBlock,
      language: p.language,
      templateId: p.templateId,
    })),
  };

  return ok(exportData);
}

export function importPanes(
  _sdk: BackendSDK,
  exportData: PanesExport,
  overwrite: boolean = false,
): Result<ImportResult> {
  const results: ImportResult = {
    created: 0,
    skipped: 0,
    errors: [],
  };

  for (const paneData of exportData.panes) {
    const existing = panesStore
      .getPanes()
      .find((p) => p.name === paneData.name);

    if (existing !== undefined) {
      if (overwrite) {
        panesStore.updatePane(existing.id, paneData);
        results.created++;
      } else {
        results.skipped++;
      }
      continue;
    }

    panesStore.createPane(paneData);
    results.created++;
  }

  return ok(results);
}

export function getTemplates(_sdk: BackendSDK): Result<PaneTemplate[]> {
  return ok(getAllTemplates());
}

export function installTemplate(
  _sdk: BackendSDK,
  templateId: string,
): Result<Pane> {
  const pane = panesStore.installTemplate(templateId);
  if (pane === undefined) {
    return error("Template not found");
  }
  return ok(pane);
}
