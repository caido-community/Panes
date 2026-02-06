import type { Request, Response } from "caido:utils";
import { describe, expect, it } from "vitest";

import { expandVariables } from "./variable-expander";

function createMockRequest(): Request {
  return {
    getHost: () => "example.com",
    getPort: () => 443,
    getPath: () => "/api/users",
    getMethod: () => "POST",
    getUrl: () => "https://example.com/api/users",
    getTls: () => true,
    getQuery: () => "page=1&limit=10",
    getId: () => "req_123",
    getHeaders: () => ({}),
    getHeader: () => undefined,
    getBody: () => undefined,
    getRaw: () => ({
      toText: () => "",
    }),
    getCreatedAt: () => Date.now(),
    toSpec: () => ({}),
    toSpecRaw: () => ({}),
  } as unknown as Request;
}

function createMockResponse(): Response {
  return {
    getCode: () => 200,
    getRaw: () => ({
      toText: () => "Response body content",
    }),
    getId: () => "resp_123",
    getHeaders: () => ({}),
    getHeader: () => undefined,
    getBody: () => undefined,
    getRoundtripTime: () => 0,
    getCreatedAt: () => Date.now(),
  } as unknown as Response;
}

describe("expandVariables", () => {
  it("should expand basic variables", () => {
    const request = createMockRequest();
    const command = "echo {{input}} {{host}} {{port}}";
    const result = expandVariables(command, {
      input: "test data",
      request,
      requestId: "req_123",
    });

    expect(result).toContain("'test data'");
    expect(result).toContain("'example.com'");
    expect(result).toContain("'443'");
  });

  it("should expand variables with spaces", () => {
    const request = createMockRequest();
    const command = "echo {{ input }} {{ host }}";
    const result = expandVariables(command, {
      input: "test",
      request,
      requestId: "req_123",
    });

    expect(result).toContain("'test'");
    expect(result).toContain("'example.com'");
  });

  it("should expand response variables when response is provided", () => {
    const request = createMockRequest();
    const response = createMockResponse();
    const command = "echo {{responseCode}} {{responseLength}}";
    const result = expandVariables(command, {
      input: "test",
      request,
      response,
      requestId: "req_123",
    });

    expect(result).toContain("'200'");
    expect(result).toContain("'21'");
  });

  it("should escape single quotes in values", () => {
    const request = createMockRequest();
    const command = "echo {{input}}";
    const result = expandVariables(command, {
      input: "test'data",
      request,
      requestId: "req_123",
    });

    expect(result).toBe("echo 'test'\\''data'");
  });

  it("should handle empty input", () => {
    const request = createMockRequest();
    const command = "echo {{input}}";
    const result = expandVariables(command, {
      input: "",
      request,
      requestId: "req_123",
    });

    expect(result).toBe("echo ''");
  });

  it("should expand all request variables", () => {
    const request = createMockRequest();
    const command =
      "{{method}} {{url}} {{scheme}} {{path}} {{query}} {{requestId}}";
    const result = expandVariables(command, {
      input: "test",
      request,
      requestId: "req_123",
    });

    expect(result).toContain("'POST'");
    expect(result).toContain("'https://example.com/api/users'");
    expect(result).toContain("'https'");
    expect(result).toContain("'/api/users'");
    expect(result).toContain("'page=1&limit=10'");
    expect(result).toContain("'req_123'");
  });

  it("should throw error for unknown variables", () => {
    const request = createMockRequest();
    const command = "echo {{unknownVar}}";

    expect(() => {
      expandVariables(command, {
        input: "test",
        request,
        requestId: "req_123",
      });
    }).toThrow("Unknown variables found");
  });

  it("should handle http scheme for non-TLS requests", () => {
    const request = {
      ...createMockRequest(),
      getTls: () => false,
    };
    const command = "echo {{scheme}}";
    const result = expandVariables(command, {
      input: "test",
      request,
      requestId: "req_123",
    });

    expect(result).toContain("'http'");
  });

  it("should use PowerShell escaping for PowerShell shell", () => {
    const request = createMockRequest();
    const command = "echo {{input}}";
    const result = expandVariables(
      command,
      {
        input: "test'data",
        request,
        requestId: "req_123",
      },
      "powershell.exe",
    );

    expect(result).toContain("'test''data'");
  });

  it("should use CMD escaping for cmd.exe shell", () => {
    const request = createMockRequest();
    const command = "echo {{input}}";
    const result = expandVariables(
      command,
      {
        input: 'test"data',
        request,
        requestId: "req_123",
      },
      "cmd.exe",
    );

    expect(result).toContain('"test""data"');
  });

  it("should use Unix escaping for bash shell", () => {
    const request = createMockRequest();
    const command = "echo {{input}}";
    const result = expandVariables(
      command,
      {
        input: "test'data",
        request,
        requestId: "req_123",
      },
      "/bin/bash",
    );

    expect(result).toContain("'test'\\''data'");
  });
});
