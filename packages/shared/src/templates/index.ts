import type { CreatePaneInput } from "../types";

import { commentFinderTemplate } from "./comment-finder";
import { entropyAnalyzerTemplate } from "./entropy-analyzer";
import { jqTemplate } from "./jq";
import { regexExtractorTemplate } from "./regex-extractor";

export type PaneTemplate = CreatePaneInput & {
  templateId: string;
};

export const PANE_TEMPLATES: PaneTemplate[] = [
  { ...jqTemplate, templateId: "jq" },
  { ...regexExtractorTemplate, templateId: "regex-extractor" },
  { ...commentFinderTemplate, templateId: "comment-finder" },
  { ...entropyAnalyzerTemplate, templateId: "entropy-analyzer" },
];

export function getTemplateById(templateId: string): PaneTemplate | undefined {
  return PANE_TEMPLATES.find((t) => t.templateId === templateId);
}

export function getAllTemplates(): PaneTemplate[] {
  return PANE_TEMPLATES;
}
