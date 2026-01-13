import type { CreatePaneInput } from "../types";

export const linkExtractorTemplate: CreatePaneInput = {
  name: "Link & Endpoint Finder",
  tabName: "Links",
  description:
    "Extract URLs, API endpoints, and paths from responses. Great for JS files and HTML.",
  enabled: false,
  scope: "global",
  input: "response.body",
  locations: ["http-history", "replay", "sitemap", "automate", "intercept"],
  transformation: {
    type: "command",
    command: `grep -oE '(https?://[^"'"'"'\\s<>\\)\\]]+|/[a-zA-Z0-9_/-]+\\.(js|json|xml|php|asp|aspx|jsp|html|htm|css)|/api/[^"'"'"'\\s<>\\)\\]]+|/v[0-9]+/[^"'"'"'\\s<>\\)\\]]+|"/(\\w+/)+\\w+"|\\'/(\\w+/)+\\w+\\')' | \
sed "s/["']//g" | \
sort -u | \
awk '
BEGIN {
  print "=== EXTRACTED LINKS & ENDPOINTS ===\\n"
}
/^https?:\\/\\// {
  urls[++url_count] = $0
  next
}
/^\\/api\\// || /^\\/v[0-9]+\\// {
  apis[++api_count] = $0
  next
}
/\\.(js|json|xml|php|asp|aspx|jsp|html|htm|css)$/ {
  resources[++res_count] = $0
  next
}
/^\\/[a-zA-Z]/ {
  paths[++path_count] = $0
}
END {
  if (url_count > 0) {
    print "FULL URLS (" url_count "):"
    for (i = 1; i <= url_count; i++) print "  " urls[i]
    print ""
  }
  if (api_count > 0) {
    print "API ENDPOINTS (" api_count "):"
    for (i = 1; i <= api_count; i++) print "  " apis[i]
    print ""
  }
  if (res_count > 0) {
    print "RESOURCES (" res_count "):"
    for (i = 1; i <= res_count; i++) print "  " resources[i]
    print ""
  }
  if (path_count > 0) {
    print "PATHS (" path_count "):"
    for (i = 1; i <= path_count; i++) print "  " paths[i]
    print ""
  }
  total = url_count + api_count + res_count + path_count
  if (total == 0) {
    print "[i] No links or endpoints found"
  }
}'`,
    timeout: 30,
  },
  codeBlock: true,
  language: "text",
};
