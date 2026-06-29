import type { CreatePaneInput } from "../types";

export const hideHeadersTemplate: CreatePaneInput = {
  name: "Hide Headers",
  tabName: "Focused",
  description:
    "Hide noisy request headers to focus on what matters. Edit the hidden list in the script.",
  enabled: false,
  scope: "global",
  input: "request.raw",
  locations: ["http-history", "replay", "sitemap", "automate", "intercept"],
  transformation: {
    type: "script",
    timeout: 5,
    script: `const hide = ["cookie", "user-agent", "accept-encoding", "accept-language"];
const lines = input.split(/\\r?\\n/);
const out = [];
let inHeaders = true;
for (const line of lines) {
  if (inHeaders && line === "") {
    inHeaders = false;
    out.push(line);
    continue;
  }
  if (inHeaders) {
    const idx = line.indexOf(":");
    const name = idx === -1 ? "" : line.slice(0, idx).trim().toLowerCase();
    if (hide.includes(name)) continue;
  }
  out.push(line);
}
return out.join("\\n");`,
  },
  codeBlock: true,
  language: "http",
};
