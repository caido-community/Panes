import type { Request, Response } from "caido:utils";
import type { InputData, Pane, PaneInput, Result } from "shared";
import { error, ok } from "shared";

import { requireSDK } from "../sdk";
import { panesStore } from "../stores/panes";

type TransformResult = {
  output: string;
  paneId: string;
  paneName: string;
};

function extractInput(
  request: Request,
  response: Response | undefined,
  inputType: PaneInput,
): string {
  switch (inputType) {
    case "request.body":
      return request.getBody()?.toText() ?? "";
    case "request.headers":
      return JSON.stringify(request.getHeaders(), null, 2);
    case "request.query":
      return request.getQuery();
    case "request.raw":
      return request.getRaw().toText();
    case "response.body":
      return response?.getBody()?.toText() ?? "";
    case "response.headers":
      return response !== undefined
        ? JSON.stringify(response.getHeaders(), null, 2)
        : "";
    case "response.raw":
      return response?.getRaw().toText() ?? "";
    case "request-response":
      return `=== REQUEST ===\n${request.getRaw().toText()}\n\n=== RESPONSE ===\n${response?.getRaw().toText() ?? ""}`;
    default:
      return "";
  }
}

function matchesHttpql(
  httpql: string,
  request: Request,
  response: Response | undefined,
): boolean {
  if (httpql.trim() === "") return true;

  const sdk = requireSDK();
  try {
    return sdk.requests.matches(httpql, request, response);
  } catch {
    return false;
  }
}

export async function getInputData(
  paneId: string,
  requestId: string,
): Promise<Result<InputData>> {
  const sdk = requireSDK();
  const pane = panesStore.getPane(paneId);

  if (pane === undefined) {
    return error("Pane not found");
  }

  if (pane.enabled !== true) {
    return error("Pane is disabled");
  }

  const requestResult = await sdk.requests.get(requestId);
  if (requestResult === undefined) {
    return error("Request not found");
  }

  const { request, response } = requestResult;

  if (pane.httpql !== undefined && pane.httpql.trim() !== "") {
    if (!matchesHttpql(pane.httpql, request, response)) {
      return error("Request does not match HTTPQL filter");
    }
  }

  const input = extractInput(request, response, pane.input);

  if (input === "") {
    return error("No input data available");
  }

  const transformation =
    pane.transformation.type === "workflow"
      ? {
          type: "workflow" as const,
          workflowId: pane.transformation.workflowId,
        }
      : { type: "command" as const, command: pane.transformation.command };

  return ok({
    input,
    paneId: pane.id,
    paneName: pane.name,
    transformation,
  });
}

export async function transformData(
  paneId: string,
  requestId: string,
): Promise<Result<TransformResult>> {
  const result = await getInputData(paneId, requestId);

  if (result.kind === "Error") {
    return result;
  }

  const data = result.value;

  if (data.transformation.type === "command") {
    return error(
      "Shell command execution is not supported in the Caido runtime. Please use a Convert workflow instead.",
    );
  }

  return error(
    "Workflow transformation must be executed from the frontend using the SDK.",
  );
}

export function getEnabledPanesForLocation(
  location: Pane["locations"][number],
): Pane[] {
  return panesStore
    .getEnabledPanes()
    .filter((p) => p.locations.includes(location));
}
