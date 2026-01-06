import type { InputData, Pane, PaneLocation, Result } from "shared";
import { ok } from "shared";

import { getEnabledPanesForLocation, getInputData } from "../services/executor";
import type { BackendSDK } from "../types";

export function getPaneInputData(
  _sdk: BackendSDK,
  paneId: string,
  requestId: string,
): Promise<Result<InputData>> {
  return getInputData(paneId, requestId);
}

export function getActivePanesForLocation(
  _sdk: BackendSDK,
  location: PaneLocation,
): Result<Pane[]> {
  return ok(getEnabledPanesForLocation(location));
}
