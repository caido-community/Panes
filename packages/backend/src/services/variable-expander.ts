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
  shell: string = "/bin/bash",
): string {
  const { input, request, response, requestId } = context;

  const variables: Record<string, string> = {
    "{{input}}": input,
    "{{ input }}": input,
    "{{requestId}}": requestId,
    "{{ requestId }}": requestId,
    "{{host}}": request.getHost(),
    "{{ host }}": request.getHost(),
    "{{port}}": String(request.getPort()),
    "{{ port }}": String(request.getPort()),
    "{{path}}": request.getPath(),
    "{{ path }}": request.getPath(),
    "{{method}}": request.getMethod(),
    "{{ method }}": request.getMethod(),
    "{{url}}": request.getUrl(),
    "{{ url }}": request.getUrl(),
    "{{scheme}}": request.getTls() ? "https" : "http",
    "{{ scheme }}": request.getTls() ? "https" : "http",
    "{{query}}": request.getQuery(),
    "{{ query }}": request.getQuery(),
  };

  if (response !== undefined) {
    const responseCode = String(response.getCode());
    const rawLength = String(response.getRaw().toText().length);
    variables["{{responseCode}}"] = responseCode;
    variables["{{ responseCode }}"] = responseCode;
    variables["{{responseLength}}"] = rawLength;
    variables["{{ responseLength }}"] = rawLength;
  }

  let expanded = command;

  for (const [key, value] of Object.entries(variables)) {
    if (expanded.includes(key)) {
      expanded = expanded.replaceAll(key, escapeForShell(value, shell));
    }
  }

  const remainingVariables = expanded.match(/\{\{[^}]+\}\}/g);
  if (remainingVariables !== null && remainingVariables.length > 0) {
    const uniqueVars = [...new Set(remainingVariables)];
    const availableVars = Object.keys(variables)
      .filter((k) => !k.includes(" "))
      .join(", ");
    throw new Error(
      `Unknown variables found: ${uniqueVars.join(", ")}. Available variables: ${availableVars}`,
    );
  }

  return expanded;
}

function escapeForShell(arg: string, shell: string = "/bin/bash"): string {
  const shellName = shell.toLowerCase();
  const isWindows =
    shellName.includes("powershell") ||
    shellName.includes("pwsh") ||
    shellName.includes("cmd");

  if (arg === "") {
    return isWindows ? '""' : "''";
  }

  if (isWindows) {
    if (shellName.includes("cmd")) {
      const escaped = arg.replace(/"/g, '""');
      return `"${escaped}"`;
    }
    const escaped = arg.replace(/'/g, "''");
    return `'${escaped}'`;
  }

  const escaped = arg.replace(/'/g, "'\\''");
  return `'${escaped}'`;
}
