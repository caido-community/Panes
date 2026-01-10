import { beforeEach, describe, expect, it, vi } from "vitest";

import { panesStore } from "../stores/panes";
import { setupMockSDK } from "../test-utils";

import { getActivePanesForLocation } from "./transform";

describe("transform API", () => {
  beforeEach(() => {
    setupMockSDK();
    panesStore["data"] = { version: 1, panes: [] };
    panesStore["saveToFile"] = vi.fn();
  });

  const mockSDK = {} as never;

  describe("getActivePanesForLocation", () => {
    it("should return empty array when no panes exist", () => {
      const result = getActivePanesForLocation(mockSDK, "http-history");
      expect(result.kind).toBe("Success");
      if (result.kind === "Success") {
        expect(result.value).toEqual([]);
      }
    });

    it("should return only enabled panes for location", () => {
      panesStore.createPane({
        name: "Enabled Pane",
        tabName: "Enabled",
        enabled: true,
        input: "response.body",
        locations: ["http-history"],
        transformation: {
          type: "command",
          command: "echo test",
          timeout: 30,
        },
      });

      panesStore.createPane({
        name: "Disabled Pane",
        tabName: "Disabled",
        enabled: false,
        input: "response.body",
        locations: ["http-history"],
        transformation: {
          type: "command",
          command: "echo test",
          timeout: 30,
        },
      });

      panesStore.createPane({
        name: "Other Location",
        tabName: "Other",
        enabled: true,
        input: "response.body",
        locations: ["replay"],
        transformation: {
          type: "command",
          command: "echo test",
          timeout: 30,
        },
      });

      const result = getActivePanesForLocation(mockSDK, "http-history");
      expect(result.kind).toBe("Success");
      if (result.kind === "Success") {
        expect(result.value.length).toBe(1);
        expect(result.value[0]?.name).toBe("Enabled Pane");
      }
    });

    it("should return panes for multiple locations", () => {
      panesStore.createPane({
        name: "Multi Location",
        tabName: "Multi",
        enabled: true,
        input: "response.body",
        locations: ["http-history", "replay", "sitemap"],
        transformation: {
          type: "command",
          command: "echo test",
          timeout: 30,
        },
      });

      const historyResult = getActivePanesForLocation(mockSDK, "http-history");
      expect(historyResult.kind).toBe("Success");
      if (historyResult.kind === "Success") {
        expect(historyResult.value.length).toBe(1);
      }

      const replayResult = getActivePanesForLocation(mockSDK, "replay");
      expect(replayResult.kind).toBe("Success");
      if (replayResult.kind === "Success") {
        expect(replayResult.value.length).toBe(1);
      }

      const sitemapResult = getActivePanesForLocation(mockSDK, "sitemap");
      expect(sitemapResult.kind).toBe("Success");
      if (sitemapResult.kind === "Success") {
        expect(sitemapResult.value.length).toBe(1);
      }
    });
  });
});
