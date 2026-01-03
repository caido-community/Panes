import type { Pane, PaneLocation, Result } from "shared";
import { ok } from "shared";

import { getEnabledPanesForLocation, getInputData } from "../services/executor";
import type { BackendSDK } from "../types";

type InputDataResult = {
  input: string;
  paneId: string;
  paneName: string;
  workflowId?: string;
  command?: string;
  transformationType: "workflow" | "command";
};

export function getPaneInputData(
  _sdk: BackendSDK,
  paneId: string,
  requestId: string,
): Promise<Result<InputDataResult>> {
  return getInputData(paneId, requestId);
}

export function getActivePanesForLocation(
  _sdk: BackendSDK,
  location: PaneLocation,
): Result<Pane[]> {
  return ok(getEnabledPanesForLocation(location));
}
