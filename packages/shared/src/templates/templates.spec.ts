import { describe, expect, it } from "vitest";

import type { PaneInput, PaneLocation } from "../types";

import { getAllTemplates, getTemplateById, PANE_TEMPLATES } from "./index";

describe("Templates", () => {
  describe("getAllTemplates", () => {
    it("should return all templates", () => {
      const templates = getAllTemplates();
      expect(templates).toBeDefined();
      expect(Array.isArray(templates)).toBe(true);
      expect(templates.length).toBeGreaterThan(0);
    });

    it("should return templates with templateId", () => {
      const templates = getAllTemplates();
      for (const template of templates) {
        expect(template.templateId).toBeDefined();
        expect(typeof template.templateId).toBe("string");
        expect(template.templateId.length).toBeGreaterThan(0);
      }
    });
  });

  describe("getTemplateById", () => {
    it("should return template for valid ID", () => {
      const template = getTemplateById("jq");
      expect(template).toBeDefined();
      expect(template?.templateId).toBe("jq");
    });

    it("should return undefined for invalid ID", () => {
      const template = getTemplateById("non-existent");
      expect(template).toBeUndefined();
    });
  });

  describe("Template structure validation", () => {
    const validInputs: PaneInput[] = [
      "request.body",
      "request.headers",
      "request.query",
      "request.raw",
      "response.body",
      "response.headers",
      "response.raw",
    ];

    const validLocations: PaneLocation[] = [
      "http-history",
      "sitemap",
      "replay",
      "automate",
      "intercept",
    ];

    it("should have valid structure for all templates", () => {
      for (const template of PANE_TEMPLATES) {
        expect(template.templateId).toBeDefined();
        expect(typeof template.templateId).toBe("string");

        expect(template.name).toBeDefined();
        expect(typeof template.name).toBe("string");
        expect(template.name.length).toBeGreaterThan(0);

        expect(template.tabName).toBeDefined();
        expect(typeof template.tabName).toBe("string");
        expect(template.tabName.length).toBeGreaterThan(0);

        expect(template.input).toBeDefined();
        expect(validInputs).toContain(template.input);

        expect(template.locations).toBeDefined();
        expect(Array.isArray(template.locations)).toBe(true);
        expect(template.locations.length).toBeGreaterThan(0);
        for (const location of template.locations) {
          expect(validLocations).toContain(location);
        }

        expect(template.transformation).toBeDefined();
        if (template.transformation.type === "command") {
          expect(template.transformation.command).toBeDefined();
          expect(typeof template.transformation.command).toBe("string");
          expect(template.transformation.command.length).toBeGreaterThan(0);
          expect(template.transformation.timeout).toBeDefined();
          expect(typeof template.transformation.timeout).toBe("number");
          expect(template.transformation.timeout).toBeGreaterThan(0);
        } else if (template.transformation.type === "workflow") {
          expect(template.transformation.workflowId).toBeDefined();
          expect(typeof template.transformation.workflowId).toBe("string");
          expect(template.transformation.workflowId.length).toBeGreaterThan(0);
        }

        if (template.codeBlock !== undefined) {
          expect(typeof template.codeBlock).toBe("boolean");
          if (template.codeBlock === true) {
            expect(template.language).toBeDefined();
            if (template.language !== undefined) {
              expect(typeof template.language).toBe("string");
              expect(template.language.length).toBeGreaterThan(0);
            }
          }
        }

        if (template.language !== undefined) {
          expect(typeof template.language).toBe("string");
          expect(template.language.length).toBeGreaterThan(0);
        }
      }
    });

    it("should have unique template IDs", () => {
      const templateIds = PANE_TEMPLATES.map((t) => t.templateId);
      const uniqueIds = new Set(templateIds);
      expect(uniqueIds.size).toBe(templateIds.length);
    });

    it("should have enabled set to false by default", () => {
      for (const template of PANE_TEMPLATES) {
        expect(template.enabled).toBe(false);
      }
    });
  });

  describe("jq template", () => {
    it("should have correct jq template structure", () => {
      const jqTemplate = getTemplateById("jq");
      expect(jqTemplate).toBeDefined();
      if (jqTemplate === undefined) return;

      expect(jqTemplate.name).toContain("jq");
      expect(jqTemplate.tabName).toBe("jq");
      expect(jqTemplate.input).toBe("response.body");
      expect(jqTemplate.transformation.type).toBe("command");
      if (jqTemplate.transformation.type === "command") {
        expect(jqTemplate.transformation.command).toContain("jq");
      }
      expect(jqTemplate.codeBlock).toBe(true);
      expect(jqTemplate.language).toBe("json");
    });
  });
});
