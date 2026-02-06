import type { CreatePaneInput } from "../types";
import { getDefaultShell, getDefaultShellConfig } from "../types";

export const regexExtractorTemplate: CreatePaneInput = {
  name: "Pattern Extractor",
  tabName: "Extract",
  description:
    "Extract common patterns: IPs, emails, domains, S3 buckets, private keys, and more.",
  enabled: false,
  scope: "global",
  input: "response.body",
  locations: ["http-history", "replay", "sitemap", "automate", "intercept"],
  transformation: {
    type: "command",
    command: `awk '
BEGIN { IGNORECASE = 1 }

# IPv4 Addresses
/([0-9]{1,3}\\.){3}[0-9]{1,3}/ {
  while (match($0, /([0-9]{1,3}\\.){3}[0-9]{1,3}/)) {
    ip = substr($0, RSTART, RLENGTH)
    if (!seen_ip[ip]++) ips[++ip_count] = ip
    $0 = substr($0, RSTART + RLENGTH)
  }
}

# Email Addresses
/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}/ {
  while (match($0, /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}/)) {
    email = substr($0, RSTART, RLENGTH)
    if (!seen_email[email]++) emails[++email_count] = email
    $0 = substr($0, RSTART + RLENGTH)
  }
}

# S3 Buckets
/s3\\.amazonaws\\.com\\/[a-z0-9.-]+|[a-z0-9.-]+\\.s3\\.amazonaws\\.com/ {
  while (match($0, /s3\\.amazonaws\\.com\\/[a-z0-9.-]+|[a-z0-9.-]+\\.s3\\.amazonaws\\.com/)) {
    bucket = substr($0, RSTART, RLENGTH)
    if (!seen_bucket[bucket]++) buckets[++bucket_count] = bucket
    $0 = substr($0, RSTART + RLENGTH)
  }
}

# Internal Paths
/\\/(api|admin|internal|private|dev|test|staging|debug)\\/[a-zA-Z0-9_\\/-]+/ {
  while (match($0, /\\/(api|admin|internal|private|dev|test|staging|debug)\\/[a-zA-Z0-9_\\/-]+/)) {
    path = substr($0, RSTART, RLENGTH)
    if (!seen_path[path]++) paths[++path_count] = path
    $0 = substr($0, RSTART + RLENGTH)
  }
}

END {
  if (ip_count > 0) {
    print "=== IP ADDRESSES ==="
    for (i = 1; i <= ip_count; i++) print "  " ips[i]
    print ""
  }
  if (email_count > 0) {
    print "=== EMAILS ==="
    for (i = 1; i <= email_count; i++) print "  " emails[i]
    print ""
  }
  if (bucket_count > 0) {
    print "=== S3 BUCKETS ==="
    for (i = 1; i <= bucket_count; i++) print "  " buckets[i]
    print ""
  }
  if (path_count > 0) {
    print "=== INTERESTING PATHS ==="
    for (i = 1; i <= path_count; i++) print "  " paths[i]
    print ""
  }
  if (ip_count + email_count + bucket_count + path_count == 0) {
    print "[i] No patterns found"
  } else {
    total = ip_count + email_count + bucket_count + path_count
    print "---"
    print "Total: " total " unique patterns found"
  }
}'`,
    timeout: 30,
    shell: getDefaultShell(),
    shellConfig: getDefaultShellConfig(),
  },
  codeBlock: true,
  language: "text",
};
