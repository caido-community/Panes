import { beforeEach, describe, expect, it, vi } from "vitest";

import { setupMockSDK } from "../test-utils";

import { panesStore } from "./panes";

describe("PanesStore", () => {
  beforeEach(() => {
    setupMockSDK();
    panesStore["data"] = { version: 1, panes: [] };
    panesStore["saveToFile"] = vi.fn();
  });

  describe("getPanes", () => {
    it("should return empty array initially", () => {
      expect(panesStore.getPanes()).toEqual([]);
    });

    it("should return all panes", () => {
      panesStore.createPane({
        name: "Pane 1",
        tabName: "P1",
        enabled: true,
        input: "response.body",
        locations: ["http-history"],
        transformation: {
          type: "command",
          command: "echo test",
          timeout: 30,
        },
      });

      expect(panesStore.getPanes().length).toBe(1);
    });
  });

  describe("getPane", () => {
    it("should return undefined for non-existent pane", () => {
      expect(panesStore.getPane("nonexistent")).toBeUndefined();
    });

    it("should return pane by id", () => {
      const pane = panesStore.createPane({
        name: "Test Pane",
        tabName: "Test",
        enabled: true,
        input: "response.body",
        locations: ["http-history"],
        transformation: {
          type: "command",
          command: "echo test",
          timeout: 30,
        },
      });

      const found = panesStore.getPane(pane.id);
      expect(found).toBeDefined();
      expect(found?.name).toBe("Test Pane");
    });
  });

  describe("createPane", () => {
    it("should create pane with generated id and timestamps", () => {
      const pane = panesStore.createPane({
        name: "New Pane",
        tabName: "New",
        enabled: true,
        input: "response.body",
        locations: ["http-history"],
        transformation: {
          type: "command",
          command: "echo test",
          timeout: 30,
        },
      });

      expect(pane.id).toBeDefined();
      expect(pane.createdAt).toBeDefined();
      expect(pane.updatedAt).toBeDefined();
      expect(pane.createdAt).toBe(pane.updatedAt);
    });

    it("should add pane to store", () => {
      const pane = panesStore.createPane({
        name: "New Pane",
        tabName: "New",
        enabled: true,
        input: "response.body",
        locations: ["http-history"],
        transformation: {
          type: "command",
          command: "echo test",
          timeout: 30,
        },
      });

      expect(panesStore.getPanes().length).toBe(1);
      expect(panesStore.getPane(pane.id)).toBeDefined();
    });
  });

  describe("updatePane", () => {
    it("should update existing pane", async () => {
      const pane = panesStore.createPane({
        name: "Original",
        tabName: "Orig",
        enabled: true,
        input: "response.body",
        locations: ["http-history"],
        transformation: {
          type: "command",
          command: "echo test",
          timeout: 30,
        },
      });

      await new Promise((resolve) => setTimeout(resolve, 1));

      const updated = panesStore.updatePane(pane.id, {
        name: "Updated",
        tabName: "Upd",
      });

      expect(updated).toBeDefined();
      expect(updated?.name).toBe("Updated");
      expect(updated?.tabName).toBe("Upd");
      expect(updated?.id).toBe(pane.id);
      expect(updated?.createdAt).toBe(pane.createdAt);
      expect(updated?.updatedAt).toBeGreaterThanOrEqual(pane.updatedAt);
    });

    it("should return undefined for non-existent pane", () => {
      expect(
        panesStore.updatePane("nonexistent", { name: "Test" }),
      ).toBeUndefined();
    });
  });

  describe("deletePane", () => {
    it("should delete existing pane", () => {
      const pane = panesStore.createPane({
        name: "To Delete",
        tabName: "Delete",
        enabled: true,
        input: "response.body",
        locations: ["http-history"],
        transformation: {
          type: "command",
          command: "echo test",
          timeout: 30,
        },
      });

      const deleted = panesStore.deletePane(pane.id);
      expect(deleted).toBe(true);
      expect(panesStore.getPane(pane.id)).toBeUndefined();
    });

    it("should return false for non-existent pane", () => {
      expect(panesStore.deletePane("nonexistent")).toBe(false);
    });
  });

  describe("togglePane", () => {
    it("should toggle pane enabled state", () => {
      const pane = panesStore.createPane({
        name: "Toggle Test",
        tabName: "Toggle",
        enabled: false,
        input: "response.body",
        locations: ["http-history"],
        transformation: {
          type: "command",
          command: "echo test",
          timeout: 30,
        },
      });

      const toggled = panesStore.togglePane(pane.id, true);
      expect(toggled).toBeDefined();
      expect(toggled?.enabled).toBe(true);

      const toggledBack = panesStore.togglePane(pane.id, false);
      expect(toggledBack?.enabled).toBe(false);
    });
  });

  describe("getEnabledPanes", () => {
    it("should return only enabled panes", () => {
      panesStore.createPane({
        name: "Enabled 1",
        tabName: "E1",
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
        name: "Disabled",
        tabName: "D",
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
        name: "Enabled 2",
        tabName: "E2",
        enabled: true,
        input: "response.body",
        locations: ["http-history"],
        transformation: {
          type: "command",
          command: "echo test",
          timeout: 30,
        },
      });

      const enabled = panesStore.getEnabledPanes();
      expect(enabled.length).toBe(2);
      expect(enabled.every((p) => p.enabled)).toBe(true);
    });
  });

  describe("ensureTemplatesInstalled", () => {
    it("should install missing templates", () => {
      panesStore.ensureTemplatesInstalled();

      const templatePanes = panesStore.getTemplatePanes();
      expect(templatePanes.length).toBeGreaterThan(0);
      expect(templatePanes.every((p) => p.templateId !== undefined)).toBe(true);
    });

    it("should not duplicate existing templates", () => {
      panesStore.ensureTemplatesInstalled();
      const firstCount = panesStore.getTemplatePanes().length;

      panesStore.ensureTemplatesInstalled();
      const secondCount = panesStore.getTemplatePanes().length;

      expect(secondCount).toBe(firstCount);
    });
  });
});
