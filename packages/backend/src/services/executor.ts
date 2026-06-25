import type { Request, Response } from "caido:utils";
import type { InputData, Pane, PaneInput, Result, ScriptContext } from "shared";
import { error, ok } from "shared";

import { requireSDK } from "../sdk";
import { panesStore } from "../stores/panes";

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
    const result = sdk.requests.matches(httpql, request, response);
    return Boolean(result);
  } catch {
    return false;
  }
}

type ResolvedInput = {
  pane: Pane;
  request: Request;
  response: Response | undefined;
  input: string;
};

async function resolvePaneInput(
  paneId: string,
  requestId: string,
): Promise<Result<ResolvedInput>> {
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
    const httpqlMatches = matchesHttpql(pane.httpql, request, response);
    if (httpqlMatches === false) {
      return error("Request does not match HTTPQL filter");
    }
  }

  const input = extractInput(request, response, pane.input);

  if (input === "") {
    return error("No input data available");
  }

  return ok({ pane, request, response, input });
}

export async function getInputData(
  paneId: string,
  requestId: string,
): Promise<Result<InputData>> {
  const resolved = await resolvePaneInput(paneId, requestId);
  if (resolved.kind === "Error") {
    return resolved;
  }

  const { pane, input } = resolved.value;
  return ok({ input, paneId: pane.id, paneName: pane.name });
}

export async function getScriptContext(
  paneId: string,
  requestId: string,
): Promise<Result<ScriptContext>> {
  const resolved = await resolvePaneInput(paneId, requestId);
  if (resolved.kind === "Error") {
    return resolved;
  }

  const { request, response, input } = resolved.value;
  return ok({
    input,
    requestId,
    host: request.getHost(),
    port: request.getPort(),
    path: request.getPath(),
    method: request.getMethod(),
    url: request.getUrl(),
    scheme: request.getTls() ? "https" : "http",
    query: request.getQuery(),
    responseCode: response?.getCode(),
    responseLength:
      response !== undefined ? response.getRaw().toText().length : undefined,
  });
}

export function getEnabledPanesForLocation(
  location: Pane["locations"][number],
): Pane[] {
  return panesStore
    .getEnabledPanes()
    .filter((p) => p.locations.includes(location));
}
