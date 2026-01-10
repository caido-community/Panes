import type { CreatePaneInput } from "../types";

import { jqTemplate } from "./jq";

export type PaneTemplate = CreatePaneInput & {
  templateId: string;
};

export const PANE_TEMPLATES: PaneTemplate[] = [
  { ...jqTemplate, templateId: "jq" },
];

export function getTemplateById(templateId: string): PaneTemplate | undefined {
  return PANE_TEMPLATES.find((t) => t.templateId === templateId);
}

export function getAllTemplates(): PaneTemplate[] {
  return PANE_TEMPLATES;
}
