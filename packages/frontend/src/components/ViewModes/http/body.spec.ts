import { describe, expect, it } from "vitest";

import { bodyStart, parseBody } from "./body";

const request = (headers: string, body: string): string =>
  `POST /x HTTP/1.1\r\n${headers}\r\n\r\n${body}`;

describe("bodyStart", () => {
  it("finds the body after a CRLF separator", () => {
    const doc = "POST / HTTP/1.1\r\nHost: x\r\n\r\n{}";
    expect(doc.slice(bodyStart(doc))).toBe("{}");
  });

  it("finds the body after an LF separator", () => {
    const doc = "POST / HTTP/1.1\nHost: x\n\nbody";
    expect(doc.slice(bodyStart(doc))).toBe("body");
  });

  it("returns undefined when there is no separator", () => {
    expect(bodyStart("GET / HTTP/1.1\r\nHost: x")).toBeUndefined();
  });
});

describe("parseBody", () => {
  it("parses a JSON body", () => {
    const doc = request("Content-Type: application/json", '{"a":1}');
    const parse = parseBody(doc);
    expect(parse).toBeDefined();
    expect(doc.slice(parse?.start)).toBe('{"a":1}');
  });

  it("ignores parameters after the content type", () => {
    const doc = request("Content-Type: application/json; charset=utf-8", "{}");
    expect(parseBody(doc)).toBeDefined();
  });

  it("matches the content-type header case-insensitively", () => {
    const doc = request("content-type: APPLICATION/JSON", "{}");
    expect(parseBody(doc)).toBeDefined();
  });

  it("returns undefined without a content-type header", () => {
    expect(parseBody(request("Host: x", "{}"))).toBeUndefined();
  });

  it("returns undefined for an unsupported content type", () => {
    expect(
      parseBody(request("Content-Type: text/plain", "hello")),
    ).toBeUndefined();
  });

  it("returns undefined for an empty body", () => {
    expect(
      parseBody(request("Content-Type: application/json", "   ")),
    ).toBeUndefined();
  });
});
