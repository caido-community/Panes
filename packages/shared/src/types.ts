export type PaneInput =
  | "request.body"
  | "request.headers"
  | "request.query"
  | "request.raw"
  | "response.body"
  | "response.headers"
  | "response.raw";

export type PaneLocation =
  | "http-history"
  | "sitemap"
  | "replay"
  | "automate"
  | "intercept";

export type PaneScope = "global" | "project";

export type TransformationType = "workflow" | "command";

export type WorkflowTransformation = {
  type: "workflow";
  workflowId: string;
};

export type CommandTransformation = {
  type: "command";
  command: string;
  timeout?: number;
  shell?: string;
  shellConfig?: string;
};

export type Pane = {
  id: string;
  name: string;
  tabName: string;
  description?: string;
  enabled: boolean;
  scope: PaneScope;
  input: PaneInput;
  httpql?: string;
  locations: PaneLocation[];
  transformation: WorkflowTransformation | CommandTransformation;
  createdAt: number;
  updatedAt: number;
  templateId?: string;
  codeBlock?: boolean;
  language?: string;
  devMode?: boolean;
};

export type CreatePaneInput = Omit<Pane, "id" | "createdAt" | "updatedAt">;

export type UpdatePaneInput = Partial<CreatePaneInput>;

export type PaneFormData = {
  name: string;
  tabName: string;
  description: string;
  enabled: boolean;
  scope: PaneScope;
  input: PaneInput;
  httpql: string;
  locations: PaneLocation[];
  transformationType: TransformationType;
  workflowId: string;
  command: string;
  timeout: number;
  shell: string;
  shellConfig: string;
  codeBlock: boolean;
  language: string;
  devMode: boolean;
};

export type PanesConfig = {
  version: number;
  panes: Pane[];
  templatesSeeded?: boolean;
};

export type Result<T> =
  | { kind: "Success"; value: T }
  | { kind: "Error"; error: string };

export type InputData = {
  input: string;
  paneId: string;
  paneName: string;
  transformation:
    | { type: "workflow"; workflowId: string }
    | { type: "command"; command: string };
};

export function ok<T>(value: T): Result<T> {
  return { kind: "Success", value };
}

export function error<T>(errorMessage: string): Result<T> {
  return { kind: "Error", error: errorMessage };
}

export function isResponseInput(input: PaneInput): boolean {
  return (
    input === "response.body" ||
    input === "response.headers" ||
    input === "response.raw"
  );
}

export function isRequestInput(input: PaneInput): boolean {
  return (
    input === "request.body" ||
    input === "request.headers" ||
    input === "request.query" ||
    input === "request.raw"
  );
}

export type ExportedPane = Omit<
  Pane,
  "id" | "createdAt" | "updatedAt" | "scope"
> & {
  scope?: PaneScope;
};

export type PanesExport = {
  version: number;
  exportDate: number;
  panes: ExportedPane[];
};

export type ImportResult = {
  created: number;
  skipped: number;
  errors: string[];
};

export type WorkflowInfo = {
  id: string;
  name: string;
  kind: "CONVERT" | "ACTIVE" | "PASSIVE";
  enabled: boolean;
};

export type WorkflowValidationResult = {
  paneId: string;
  paneName: string;
  workflowId: string;
  status: "valid" | "missing";
  workflowName?: string;
};

export type AvailableVariable = {
  name: string;
  description: string;
  example: string;
};
