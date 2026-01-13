import type { CreatePaneInput } from "../types";

export const cookieParserTemplate: CreatePaneInput = {
  name: "Cookie Analyzer",
  tabName: "Cookies",
  description:
    "Parse and analyze cookies from Set-Cookie headers. Shows flags, expiry, and security issues.",
  enabled: false,
  scope: "global",
  input: "response.headers",
  locations: ["http-history", "replay", "sitemap", "automate", "intercept"],
  transformation: {
    type: "command",
    command: `python3 -c "
import sys, json
from datetime import datetime

headers = json.loads(sys.stdin.read())
cookies = headers.get('set-cookie', headers.get('Set-Cookie', []))

if isinstance(cookies, str):
    cookies = [cookies]

if not cookies:
    print('[i] No Set-Cookie headers found')
    sys.exit(0)

print('=== COOKIE ANALYSIS ===\\n')

issues = []

for i, cookie in enumerate(cookies, 1):
    parts = cookie.split(';')
    name_value = parts[0].strip()
    name = name_value.split('=')[0] if '=' in name_value else name_value

    print(f'Cookie #{i}: {name}')
    print(f'  Full: {name_value[:80]}...' if len(name_value) > 80 else f'  Full: {name_value}')

    attrs = {'httponly': False, 'secure': False, 'samesite': None, 'path': None, 'domain': None, 'expires': None}

    for part in parts[1:]:
        part = part.strip().lower()
        if part == 'httponly':
            attrs['httponly'] = True
        elif part == 'secure':
            attrs['secure'] = True
        elif part.startswith('samesite='):
            attrs['samesite'] = part.split('=')[1]
        elif part.startswith('path='):
            attrs['path'] = part.split('=')[1]
        elif part.startswith('domain='):
            attrs['domain'] = part.split('=')[1]
        elif part.startswith('expires='):
            attrs['expires'] = part.split('=', 1)[1]

    flags = []
    if attrs['httponly']: flags.append('HttpOnly')
    if attrs['secure']: flags.append('Secure')
    if attrs['samesite']: flags.append(f"SameSite={attrs['samesite']}")

    print(f"  Flags: {', '.join(flags) if flags else 'NONE'}")
    if attrs['path']: print(f"  Path: {attrs['path']}")
    if attrs['domain']: print(f"  Domain: {attrs['domain']}")
    if attrs['expires']: print(f"  Expires: {attrs['expires']}")

    # Security checks
    if not attrs['httponly']:
        issues.append(f'{name}: Missing HttpOnly flag (XSS risk)')
    if not attrs['secure']:
        issues.append(f'{name}: Missing Secure flag (sent over HTTP)')
    if not attrs['samesite']:
        issues.append(f'{name}: Missing SameSite (CSRF risk)')
    elif attrs['samesite'] == 'none' and not attrs['secure']:
        issues.append(f'{name}: SameSite=None requires Secure')

    print()

if issues:
    print('=== SECURITY ISSUES ===')
    for issue in issues:
        print(f'  [!] {issue}')
else:
    print('[OK] No obvious cookie security issues')
"`,
    timeout: 30,
  },
  codeBlock: true,
  language: "text",
};
