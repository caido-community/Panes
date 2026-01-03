export type PaneInput =
  | "request.body"
  | "request.headers"
  | "request.query"
  | "request.raw"
  | "response.body"
  | "response.headers"
  | "response.raw"
  | "request-response";

export type PaneLocation =
  | "http-history"
  | "sitemap"
  | "replay"
  | "automate"
  | "intercept";

export type TransformationType = "workflow" | "command";

export type WorkflowTransformation = {
  type: "workflow";
  workflowId: string;
};

export type CommandTransformation = {
  type: "command";
  command: string;
  timeout?: number;
};

export type Pane = {
  id: string;
  name: string;
  tabName: string;
  description?: string;
  enabled: boolean;
  input: PaneInput;
  httpql?: string;
  locations: PaneLocation[];
  transformation: WorkflowTransformation | CommandTransformation;
  createdAt: number;
  updatedAt: number;
};

export type PanesConfig = {
  version: number;
  panes: Pane[];
};

export type Result<T> =
  | { kind: "Success"; value: T }
  | { kind: "Error"; error: string };

export type TransformRequest = {
  paneId: string;
  requestId: string;
};

export type TransformResult = {
  paneId: string;
  requestId: string;
  output: string;
  executionTime: number;
  error?: string;
};

export function ok<T>(value: T): Result<T> {
  return { kind: "Success", value };
}

export function error<T>(errorMessage: string): Result<T> {
  return { kind: "Error", error: errorMessage };
}
