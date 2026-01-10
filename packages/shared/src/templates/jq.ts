import type { CreatePaneInput } from "../types";

export const jqTemplate: CreatePaneInput = {
  name: "jq - JSON Processor",
  tabName: "jq",
  description:
    "Process and format JSON using jq. Example: jq '.key' or jq '.' for pretty print",
  enabled: false,
  input: "response.body",
  locations: ["http-history", "replay", "sitemap", "automate", "intercept"],
  transformation: {
    type: "command",
    command: "jq .",
    timeout: 30,
  },
  codeBlock: true,
  language: "json",
};
