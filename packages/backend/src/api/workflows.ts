import { spawn } from "child_process";

import type { Result, WorkflowInfo, WorkflowValidationResult } from "shared";
import { error, ok } from "shared";

import { requireSDK } from "../sdk";
import { expandVariables } from "../services/variable-expander";
import { panesStore } from "../stores/panes";
import type { BackendSDK } from "../types";

type WorkflowsQueryResponse = {
  workflows: Array<{
    id: string;
    name: string;
    kind: "CONVERT" | "ACTIVE" | "PASSIVE";
    enabled: boolean;
  }>;
};

type WorkflowError =
  | { __typename: "WorkflowUserError"; code: string; message: string }
  | { __typename: "OtherUserError"; code: string }
  | { __typename: "PermissionDeniedUserError"; code: string };

type RunConvertWorkflowResponse = {
  runConvertWorkflow: {
    output?: string;
    error?: WorkflowError;
  };
};

const WORKFLOWS_QUERY = `
  query {
    workflows {
      id
      name
      kind
      enabled
    }
  }
`;

const RUN_CONVERT_WORKFLOW_MUTATION = `
  mutation runConvertWorkflow($id: ID!, $input: Blob!) {
    runConvertWorkflow(id: $id, input: $input) {
      output
      error {
        __typename
        ... on WorkflowUserError {
          code
          message
        }
        ... on OtherUserError {
          code
        }
        ... on PermissionDeniedUserError {
          code
        }
      }
    }
  }
`;

function base64Encode(str: string): string {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
  let result = "";
  let i = 0;
  while (i < str.length) {
    const a = str.charCodeAt(i++);
    const b = i < str.length ? str.charCodeAt(i++) : 0;
    const c = i < str.length ? str.charCodeAt(i++) : 0;
    const bitmap = (a << 16) | (b << 8) | c;
    result +=
      chars.charAt((bitmap >> 18) & 63) +
      chars.charAt((bitmap >> 12) & 63) +
      (i - 2 < str.length ? chars.charAt((bitmap >> 6) & 63) : "=") +
      (i - 1 < str.length ? chars.charAt(bitmap & 63) : "=");
  }
  return result;
}

function base64Decode(str: string): string {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
  let result = "";
  let i = 0;
  str = str.replace(/[^A-Za-z0-9+/=]/g, "");
  while (i < str.length) {
    const a = chars.indexOf(str.charAt(i++));
    const b = chars.indexOf(str.charAt(i++));
    if (a === -1 || b === -1) break;
    const c = chars.indexOf(str.charAt(i++));
    const d = chars.indexOf(str.charAt(i++));
    const bitmap =
      (a << 18) | (b << 12) | ((c === -1 ? 0 : c) << 6) | (d === -1 ? 0 : d);
    result += String.fromCharCode((bitmap >> 16) & 255);
    if (c !== -1 && c !== 64) {
      result += String.fromCharCode((bitmap >> 8) & 255);
    }
    if (d !== -1 && d !== 64) {
      result += String.fromCharCode(bitmap & 255);
    }
  }
  return result;
}

export async function getWorkflows(
  _sdk: BackendSDK,
): Promise<Result<WorkflowInfo[]>> {
  const sdk = requireSDK();

  const response =
    await sdk.graphql.execute<WorkflowsQueryResponse>(WORKFLOWS_QUERY);

  if (response.errors !== undefined && response.errors.length > 0) {
    const errorMessage = response.errors.map((e) => e.message).join(", ");
    return error(`Failed to fetch workflows: ${errorMessage}`);
  }

  if (response.data === undefined) {
    return error("No data returned from workflows query");
  }

  return ok(response.data.workflows);
}

export async function getConvertWorkflows(
  _sdk: BackendSDK,
): Promise<Result<WorkflowInfo[]>> {
  const result = await getWorkflows(_sdk);
  if (result.kind === "Error") {
    return result;
  }

  const convertWorkflows = result.value.filter((w) => w.kind === "CONVERT");
  return ok(convertWorkflows);
}

export async function runWorkflow(
  _sdk: BackendSDK,
  workflowId: string,
  input: string,
): Promise<Result<string>> {
  const sdk = requireSDK();

  const workflowsResult = await getWorkflows(_sdk);
  if (workflowsResult.kind === "Error") {
    return error(workflowsResult.error);
  }

  const workflow = workflowsResult.value.find((w) => w.id === workflowId);
  if (workflow === undefined) {
    return error("Workflow not found");
  }

  if (workflow.kind !== "CONVERT") {
    return error("Only Convert workflows can be executed");
  }

  const base64Input = base64Encode(input);

  const response = await sdk.graphql.execute<RunConvertWorkflowResponse>(
    RUN_CONVERT_WORKFLOW_MUTATION,
    { id: workflowId, input: base64Input },
  );

  if (response.errors !== undefined && response.errors.length > 0) {
    const errorMessage = response.errors.map((e) => e.message).join(", ");
    return error(`Workflow execution failed: ${errorMessage}`);
  }

  if (response.data === undefined) {
    return error("No data returned from workflow execution");
  }

  const result = response.data.runConvertWorkflow;

  if (result.error !== undefined && result.error !== null) {
    if (result.error.__typename === "WorkflowUserError") {
      return error(`Workflow error: ${result.error.message}`);
    }
    return error(`Error: ${result.error.code}`);
  }

  if (result.output === undefined || result.output === null) {
    return error("Workflow returned no output");
  }

  const decodedOutput = base64Decode(result.output);
  return ok(decodedOutput);
}

export async function validateWorkflows(
  _sdk: BackendSDK,
): Promise<Result<WorkflowValidationResult[]>> {
  const panes = panesStore.getPanes();
  const workflowsResult = await getWorkflows(_sdk);

  if (workflowsResult.kind === "Error") {
    return error(workflowsResult.error);
  }

  const workflowMap = new Map(workflowsResult.value.map((w) => [w.id, w]));

  const results: WorkflowValidationResult[] = [];

  for (const pane of panes) {
    if (pane.transformation.type === "workflow") {
      const workflow = workflowMap.get(pane.transformation.workflowId);
      if (workflow === undefined) {
        results.push({
          paneId: pane.id,
          paneName: pane.name,
          workflowId: pane.transformation.workflowId,
          status: "missing",
        });
      } else {
        results.push({
          paneId: pane.id,
          paneName: pane.name,
          workflowId: pane.transformation.workflowId,
          status: "valid",
          workflowName: workflow.name,
        });
      }
    }
  }

  return ok(results);
}

async function driveChild(
  child: ReturnType<typeof spawn>,
  timeoutMs: number,
): Promise<string> {
  let output = "";
  if (child.stdout !== null) {
    child.stdout.on("data", (data) => {
      output += data.toString();
    });
  }

  let errorOutput = "";
  if (child.stderr !== null) {
    child.stderr.on("data", (data) => {
      errorOutput += data.toString();
    });
  }

  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => {
      child.kill();
      reject(new Error(`Command timed out after ${timeoutMs}ms`));
    }, timeoutMs);
  });

  const exitPromise = new Promise<number>((resolve) => {
    child.on("close", resolve);
  });

  const exitCode = await Promise.race([exitPromise, timeoutPromise]);

  if (exitCode !== 0) {
    throw new Error(
      `Command failed with exit code ${exitCode}${errorOutput ? `: ${errorOutput}` : ""}`,
    );
  }

  return output;
}

export async function runCommand(
  _sdk: BackendSDK,
  command: string,
  input: string,
  timeout: number,
  requestId: string,
): Promise<Result<string>> {
  const sdk = requireSDK();

  const requestResult = await sdk.requests.get(requestId);
  if (requestResult === undefined) {
    return error("Request not found");
  }

  const { request, response } = requestResult;

  let expandedCommand: string;
  try {
    expandedCommand = expandVariables(command, {
      input,
      request,
      response,
      requestId,
    });
  } catch (err) {
    return error(
      err instanceof Error
        ? err.message
        : `Variable expansion failed: ${String(err)}`,
    );
  }

  const timeoutMs = Math.max(0, Math.min(86400000, timeout * 1000));

  try {
    const child = spawn(expandedCommand, [], {
      shell: true,
      stdio: ["pipe", "pipe", "pipe"],
    });

    if (child.stdin !== null) {
      child.stdin.write(input);
      child.stdin.end();
    } else {
      return error("Failed to open stdin for command execution");
    }

    const output = await driveChild(child, timeoutMs);
    return ok(output.trim());
  } catch (err) {
    return error(
      err instanceof Error
        ? err.message
        : `Command execution failed: ${String(err)}`,
    );
  }
}
