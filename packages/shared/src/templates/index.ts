import type { CreatePaneInput } from "../types";

import { commentFinderTemplate } from "./comment-finder";
import { cookieParserTemplate } from "./cookie-parser";
import { entropyAnalyzerTemplate } from "./entropy-analyzer";
import { jqTemplate } from "./jq";
import { linkExtractorTemplate } from "./link-extractor";
import { regexExtractorTemplate } from "./regex-extractor";

export type PaneTemplate = CreatePaneInput & {
  templateId: string;
};

export const PANE_TEMPLATES: PaneTemplate[] = [
  { ...jqTemplate, templateId: "jq" },
  { ...regexExtractorTemplate, templateId: "regex-extractor" },
  { ...linkExtractorTemplate, templateId: "link-extractor" },
  { ...cookieParserTemplate, templateId: "cookie-parser" },
  { ...commentFinderTemplate, templateId: "comment-finder" },
  { ...entropyAnalyzerTemplate, templateId: "entropy-analyzer" },
];

export function getTemplateById(templateId: string): PaneTemplate | undefined {
  return PANE_TEMPLATES.find((t) => t.templateId === templateId);
}

export function getAllTemplates(): PaneTemplate[] {
  return PANE_TEMPLATES;
}
