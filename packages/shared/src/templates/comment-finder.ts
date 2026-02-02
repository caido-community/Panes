import type { CreatePaneInput } from "../types";

export const commentFinderTemplate: CreatePaneInput = {
  name: "Comment Finder",
  tabName: "Comments",
  description:
    "Find HTML, JavaScript, and CSS comments. Often reveals sensitive info, TODOs, and debug code.",
  enabled: false,
  scope: "global",
  input: "response.body",
  locations: ["http-history", "replay", "sitemap", "automate", "intercept"],
  transformation: {
    type: "command",
    command: `python3 -c "
import sys, re

content = sys.stdin.read()

# HTML comments
html_comments = re.findall(r'<!--(.*?)-->', content, re.DOTALL)

# JS single-line comments (but not URLs)
js_single = re.findall(r'(?<!:)//(?!/)[^\\n]*', content)

# JS/CSS multi-line comments
multi_comments = re.findall(r'/\\*([^*]|\\*(?!/))*\\*/', content, re.DOTALL)

print('=== COMMENT ANALYSIS ===\\n')

total = 0

if html_comments:
    print(f'HTML COMMENTS ({len(html_comments)}):')
    for i, c in enumerate(html_comments[:20], 1):
        c = c.strip()
        if c:
            preview = c[:100].replace('\\n', ' ')
            if len(c) > 100: preview += '...'
            print(f'  {i}. {preview}')
    if len(html_comments) > 20:
        print(f'  ... and {len(html_comments) - 20} more')
    print()
    total += len(html_comments)

if js_single:
    # Filter out noise
    js_single = [c.strip() for c in js_single if len(c.strip()) > 3]
    js_single = [c for c in js_single if not c.startswith('//# source')]
    if js_single:
        print(f'JS SINGLE-LINE ({len(js_single)}):')
        for i, c in enumerate(js_single[:15], 1):
            print(f'  {i}. {c[:80]}')
        if len(js_single) > 15:
            print(f'  ... and {len(js_single) - 15} more')
        print()
        total += len(js_single)

if multi_comments:
    # Filter out minified junk
    multi_comments = [c.strip() for c in multi_comments if len(c.strip()) > 5]
    if multi_comments:
        print(f'MULTI-LINE COMMENTS ({len(multi_comments)}):')
        for i, c in enumerate(multi_comments[:10], 1):
            preview = c[:120].replace('\\n', ' ').strip()
            if len(c) > 120: preview += '...'
            print(f'  {i}. /* {preview} */')
        if len(multi_comments) > 10:
            print(f'  ... and {len(multi_comments) - 10} more')
        print()
        total += len(multi_comments)

# Look for interesting patterns in comments
all_comments = ' '.join(html_comments + js_single + multi_comments)
interesting = []
patterns = [
    (r'TODO[:\\s]', 'TODO'),
    (r'FIXME[:\\s]', 'FIXME'),
    (r'HACK[:\\s]', 'HACK'),
    (r'password', 'password mention'),
    (r'secret', 'secret mention'),
    (r'api[_-]?key', 'API key mention'),
    (r'admin', 'admin mention'),
    (r'debug', 'debug mention'),
    (r'test', 'test mention'),
]

for pattern, label in patterns:
    if re.search(pattern, all_comments, re.IGNORECASE):
        interesting.append(label)

if interesting:
    print('INTERESTING KEYWORDS FOUND:')
    print('  ' + ', '.join(interesting))
    print()

if total == 0:
    print('[i] No comments found')
else:
    print(f'---\\nTotal: {total} comments found')
"`,
    timeout: 30,
    shell: "/bin/bash",
    shellConfig: "~/.bashrc",
  },
  codeBlock: true,
  language: "text",
};
