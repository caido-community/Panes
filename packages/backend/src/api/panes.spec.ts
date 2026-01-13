import type { PanesExport } from "shared";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { panesStore } from "../stores/panes";
import { setupMockSDK } from "../test-utils";

import {
  createPane,
  deletePane,
  exportPanes,
  getPane,
  getPanes,
  importPanes,
  updatePane,
} from "./panes";

describe("panes API", () => {
  beforeEach(() => {
    setupMockSDK();
    panesStore["globalData"] = { version: 1, panes: [] };
    panesStore["projectData"] = { version: 1, panes: [] };
    panesStore["initialized"] = true;
    panesStore["currentProjectId"] = "test-project-id";
    panesStore["saveGlobalPanes"] = vi.fn().mockResolvedValue(undefined);
    panesStore["saveProjectPanes"] = vi.fn().mockResolvedValue(undefined);
  });

  const mockSDK = {} as never;

  describe("getPanes", () => {
    it("should return empty array when no panes exist", () => {
      const result = getPanes(mockSDK);
      expect(result.kind).toBe("Success");
      if (result.kind === "Success") {
        expect(result.value).toEqual([]);
      }
    });

    it("should return all panes", () => {
      const paneData = {
        name: "Test Pane",
        tabName: "Test",
        enabled: true,
        scope: "project" as const,
        input: "response.body" as const,
        locations: ["http-history" as const],
        transformation: {
          type: "command" as const,
          command: "echo test",
          timeout: 30,
        },
      };

      createPane(mockSDK, paneData);

      const result = getPanes(mockSDK);
      expect(result.kind).toBe("Success");
      if (result.kind === "Success") {
        expect(result.value.length).toBe(1);
        expect(result.value[0]?.name).toBe("Test Pane");
      }
    });
  });

  describe("getPane", () => {
    it("should return error when pane not found", () => {
      const result = getPane(mockSDK, "nonexistent");
      expect(result.kind).toBe("Error");
      if (result.kind === "Error") {
        expect(result.error).toBe("Pane not found");
      }
    });

    it("should return pane when found", () => {
      const paneData = {
        name: "Test Pane",
        tabName: "Test",
        enabled: true,
        scope: "project" as const,
        input: "response.body" as const,
        locations: ["http-history" as const],
        transformation: {
          type: "command" as const,
          command: "echo test",
          timeout: 30,
        },
      };

      const createResult = createPane(mockSDK, paneData);
      expect(createResult.kind).toBe("Success");

      if (createResult.kind === "Success") {
        const paneId = createResult.value.id;
        const result = getPane(mockSDK, paneId);
        expect(result.kind).toBe("Success");
        if (result.kind === "Success") {
          expect(result.value.name).toBe("Test Pane");
        }
      }
    });
  });

  describe("createPane", () => {
    it("should create a new pane", () => {
      const paneData = {
        name: "New Pane",
        tabName: "New",
        enabled: false,
        scope: "project" as const,
        input: "request.body" as const,
        locations: ["replay" as const],
        transformation: {
          type: "workflow" as const,
          workflowId: "workflow_123",
        },
      };

      const result = createPane(mockSDK, paneData);
      expect(result.kind).toBe("Success");
      if (result.kind === "Success") {
        expect(result.value.name).toBe("New Pane");
        expect(result.value.id).toBeDefined();
        expect(result.value.createdAt).toBeDefined();
        expect(result.value.updatedAt).toBeDefined();
      }
    });

    it("should create pane with codeBlock and language", () => {
      const paneData = {
        name: "Code Pane",
        tabName: "Code",
        enabled: true,
        scope: "project" as const,
        input: "response.body" as const,
        locations: ["http-history" as const],
        transformation: {
          type: "command" as const,
          command: "jq .",
          timeout: 30,
        },
        codeBlock: true,
        language: "json",
      };

      const result = createPane(mockSDK, paneData);
      expect(result.kind).toBe("Success");
      if (result.kind === "Success") {
        expect(result.value.codeBlock).toBe(true);
        expect(result.value.language).toBe("json");
      }
    });
  });

  describe("updatePane", () => {
    it("should update existing pane", () => {
      const paneData = {
        name: "Original",
        tabName: "Orig",
        enabled: true,
        scope: "project" as const,
        input: "response.body" as const,
        locations: ["http-history" as const],
        transformation: {
          type: "command" as const,
          command: "echo test",
          timeout: 30,
        },
      };

      const createResult = createPane(mockSDK, paneData);
      expect(createResult.kind).toBe("Success");

      if (createResult.kind === "Success") {
        const paneId = createResult.value.id;
        const updateResult = updatePane(mockSDK, paneId, {
          name: "Updated",
          tabName: "Upd",
        });

        expect(updateResult.kind).toBe("Success");
        if (updateResult.kind === "Success") {
          expect(updateResult.value.name).toBe("Updated");
          expect(updateResult.value.tabName).toBe("Upd");
          expect(updateResult.value.id).toBe(paneId);
        }
      }
    });

    it("should return error when pane not found", () => {
      const result = updatePane(mockSDK, "nonexistent", { name: "Test" });
      expect(result.kind).toBe("Error");
      if (result.kind === "Error") {
        expect(result.error).toBe("Pane not found");
      }
    });
  });

  describe("deletePane", () => {
    it("should delete existing pane", () => {
      const paneData = {
        name: "To Delete",
        tabName: "Delete",
        enabled: true,
        scope: "project" as const,
        input: "response.body" as const,
        locations: ["http-history" as const],
        transformation: {
          type: "command" as const,
          command: "echo test",
          timeout: 30,
        },
      };

      const createResult = createPane(mockSDK, paneData);
      expect(createResult.kind).toBe("Success");

      if (createResult.kind === "Success") {
        const paneId = createResult.value.id;
        const deleteResult = deletePane(mockSDK, paneId);
        expect(deleteResult.kind).toBe("Success");

        const getResult = getPane(mockSDK, paneId);
        expect(getResult.kind).toBe("Error");
      }
    });

    it("should return error when pane not found", () => {
      const result = deletePane(mockSDK, "nonexistent");
      expect(result.kind).toBe("Error");
      if (result.kind === "Error") {
        expect(result.error).toBe("Pane not found");
      }
    });
  });

  describe("exportPanes", () => {
    it("should export all panes when no IDs specified", () => {
      panesStore["globalData"].panes = [];
      panesStore["projectData"].panes = [];

      createPane(mockSDK, {
        name: "Pane 1",
        tabName: "P1",
        enabled: true,
        scope: "project" as const,
        input: "response.body" as const,
        locations: ["http-history" as const],
        transformation: {
          type: "command" as const,
          command: "echo test",
          timeout: 30,
        },
      });

      createPane(mockSDK, {
        name: "Pane 2",
        tabName: "P2",
        enabled: false,
        scope: "project" as const,
        input: "request.body" as const,
        locations: ["replay" as const],
        transformation: {
          type: "workflow" as const,
          workflowId: "workflow_123",
        },
      });

      const result = exportPanes(mockSDK);
      expect(result.kind).toBe("Success");
      if (result.kind === "Success") {
        expect(result.value.panes.length).toBe(2);
        expect(result.value.version).toBe(1);
        expect(result.value.exportDate).toBeDefined();
      }
    });

    it("should export only specified panes", () => {
      const pane1Result = createPane(mockSDK, {
        name: "Pane 1",
        tabName: "P1",
        enabled: true,
        scope: "project" as const,
        input: "response.body" as const,
        locations: ["http-history" as const],
        transformation: {
          type: "command" as const,
          command: "echo test",
          timeout: 30,
        },
      });

      createPane(mockSDK, {
        name: "Pane 2",
        tabName: "P2",
        enabled: false,
        scope: "project" as const,
        input: "request.body" as const,
        locations: ["replay" as const],
        transformation: {
          type: "workflow" as const,
          workflowId: "workflow_123",
        },
      });

      if (pane1Result.kind === "Success") {
        const result = exportPanes(mockSDK, [pane1Result.value.id]);
        expect(result.kind).toBe("Success");
        if (result.kind === "Success") {
          expect(result.value.panes.length).toBe(1);
          expect(result.value.panes[0]?.name).toBe("Pane 1");
        }
      }
    });

    it("should include codeBlock and language in export", () => {
      const createResult = createPane(mockSDK, {
        name: "Code Pane",
        tabName: "Code",
        enabled: true,
        scope: "project" as const,
        input: "response.body" as const,
        locations: ["http-history" as const],
        transformation: {
          type: "command" as const,
          command: "jq .",
          timeout: 30,
        },
        codeBlock: true,
        language: "json",
      });

      if (createResult.kind === "Success") {
        const result = exportPanes(mockSDK, [createResult.value.id]);
        expect(result.kind).toBe("Success");
        if (result.kind === "Success") {
          expect(result.value.panes[0]?.codeBlock).toBe(true);
          expect(result.value.panes[0]?.language).toBe("json");
        }
      }
    });
  });

  describe("importPanes", () => {
    it("should import panes from export data", () => {
      panesStore["globalData"].panes = [];
      panesStore["projectData"].panes = [];

      const exportData: PanesExport = {
        version: 1,
        exportDate: Date.now(),
        panes: [
          {
            name: "Imported Pane",
            tabName: "Import",
            enabled: true,
            scope: "project",
            input: "response.body",
            locations: ["http-history"],
            transformation: {
              type: "command",
              command: "echo test",
              timeout: 30,
            },
          },
        ],
      };

      const result = importPanes(mockSDK, exportData);
      expect(result.kind).toBe("Success");
      if (result.kind === "Success") {
        expect(result.value.created).toBe(1);
        expect(result.value.skipped).toBe(0);
      }

      const getResult = getPanes(mockSDK);
      expect(getResult.kind).toBe("Success");
      if (getResult.kind === "Success") {
        expect(getResult.value.length).toBe(1);
        expect(getResult.value[0]?.name).toBe("Imported Pane");
      }
    });

    it("should skip existing panes when overwrite is false", () => {
      createPane(mockSDK, {
        name: "Existing",
        tabName: "Exist",
        enabled: true,
        scope: "project" as const,
        input: "response.body" as const,
        locations: ["http-history" as const],
        transformation: {
          type: "command" as const,
          command: "echo test",
          timeout: 30,
        },
      });

      const exportData: PanesExport = {
        version: 1,
        exportDate: Date.now(),
        panes: [
          {
            name: "Existing",
            tabName: "Updated",
            enabled: false,
            input: "request.body",
            locations: ["replay"],
            transformation: {
              type: "workflow",
              workflowId: "workflow_123",
            },
          },
        ],
      };

      const result = importPanes(mockSDK, exportData, false);
      expect(result.kind).toBe("Success");
      if (result.kind === "Success") {
        expect(result.value.created).toBe(0);
        expect(result.value.skipped).toBe(1);
      }
    });

    it("should overwrite existing panes when overwrite is true", () => {
      panesStore["globalData"].panes = [];
      panesStore["projectData"].panes = [];

      const createResult = createPane(mockSDK, {
        name: "Existing",
        tabName: "Exist",
        enabled: true,
        scope: "project" as const,
        input: "response.body" as const,
        locations: ["http-history" as const],
        transformation: {
          type: "command" as const,
          command: "echo test",
          timeout: 30,
        },
      });

      const exportData: PanesExport = {
        version: 1,
        exportDate: Date.now(),
        panes: [
          {
            name: "Existing",
            tabName: "Updated",
            enabled: false,
            scope: "project",
            input: "request.body",
            locations: ["replay"],
            transformation: {
              type: "workflow",
              workflowId: "workflow_123",
            },
          },
        ],
      };

      const result = importPanes(mockSDK, exportData, true);
      expect(result.kind).toBe("Success");
      if (result.kind === "Success") {
        expect(result.value.created).toBe(1);
        expect(result.value.skipped).toBe(0);
      }

      if (createResult.kind === "Success") {
        const getResult = getPane(mockSDK, createResult.value.id);
        expect(getResult.kind).toBe("Success");
        if (getResult.kind === "Success") {
          expect(getResult.value.tabName).toBe("Updated");
        }
      }
    });
  });
});
