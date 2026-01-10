import type { Request, Response } from "caido:utils";

export type VariableContext = {
  input: string;
  request: Request;
  response?: Response;
  requestId: string;
};

export type AvailableVariable = {
  name: string;
  description: string;
  example: string;
};

export const AVAILABLE_VARIABLES: AvailableVariable[] = [
  {
    name: "{{input}}",
    description: "The extracted input data",
    example: '{"key": "value"}',
  },
  { name: "{{requestId}}", description: "Request ID", example: "req_123" },
  { name: "{{host}}", description: "Request host", example: "example.com" },
  { name: "{{port}}", description: "Request port", example: "443" },
  { name: "{{path}}", description: "Request path", example: "/api/users" },
  { name: "{{method}}", description: "HTTP method", example: "POST" },
  {
    name: "{{url}}",
    description: "Full request URL",
    example: "https://example.com/api/users",
  },
  { name: "{{scheme}}", description: "URL scheme", example: "https" },
  {
    name: "{{query}}",
    description: "Query string",
    example: "page=1&limit=10",
  },
  {
    name: "{{responseCode}}",
    description: "Response status code (if available)",
    example: "200",
  },
  {
    name: "{{responseLength}}",
    description: "Response body length (if available)",
    example: "1234",
  },
];

export function expandVariables(
  command: string,
  context: VariableContext,
): string {
  const { input, request, response, requestId } = context;

  const variables: Record<string, string> = {
    "{{input}}": input,
    "{{requestId}}": requestId,
    "{{host}}": request.getHost(),
    "{{port}}": String(request.getPort()),
    "{{path}}": request.getPath(),
    "{{method}}": request.getMethod(),
    "{{url}}": request.getUrl(),
    "{{scheme}}": request.getTls() ? "https" : "http",
    "{{query}}": request.getQuery(),
  };

  if (response !== undefined) {
    variables["{{responseCode}}"] = String(response.getCode());
    const rawLength = response.getRaw().toText().length;
    variables["{{responseLength}}"] = String(rawLength);
  }

  let expanded = command;
  for (const [key, value] of Object.entries(variables)) {
    expanded = expanded.replaceAll(key, escapeForShell(value));
  }

  return expanded;
}

function escapeForShell(arg: string): string {
  return arg.replace(/'/g, "'\\''");
}
