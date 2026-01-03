import type { Pane, Result } from "shared";
import { error, ok } from "shared";

import { panesStore } from "../stores/panes";
import type { BackendSDK } from "../types";

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
  if (!deleted) {
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
