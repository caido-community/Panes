import type {
  InputData,
  Pane,
  PaneLocation,
  Result,
  ScriptContext,
} from "shared";
import { ok } from "shared";

import {
  getEnabledPanesForLocation,
  getInputData,
  getScriptContext as resolveScriptContext,
} from "../services/executor";
import type { BackendSDK } from "../types";

export function getPaneInputData(
  _sdk: BackendSDK,
  paneId: string,
  requestId: string,
): Promise<Result<InputData>> {
  return getInputData(paneId, requestId);
}

export function getScriptContext(
  _sdk: BackendSDK,
  paneId: string,
  requestId: string,
): Promise<Result<ScriptContext>> {
  return resolveScriptContext(paneId, requestId);
}

export function getActivePanesForLocation(
  _sdk: BackendSDK,
  location: PaneLocation,
): Result<Pane[]> {
  return ok(getEnabledPanesForLocation(location));
}
