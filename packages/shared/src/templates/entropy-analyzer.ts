import type { CreatePaneInput } from "../types";

export const entropyAnalyzerTemplate: CreatePaneInput = {
  name: "Entropy Analyzer",
  tabName: "Entropy",
  description:
    "Calculate Shannon entropy to detect encoded, encrypted, or compressed data. High entropy = likely encoded.",
  enabled: false,
  scope: "global",
  input: "response.body",
  locations: ["http-history", "replay", "sitemap", "automate", "intercept"],
  transformation: {
    type: "command",
    command: `python3 -c "
import sys
import math
from collections import Counter

data = sys.stdin.read()

if not data:
    print('[i] Empty input')
    sys.exit(0)

def calc_entropy(s):
    if not s:
        return 0
    freq = Counter(s)
    length = len(s)
    entropy = -sum((count/length) * math.log2(count/length) for count in freq.values())
    return entropy

def analyze_chunk(chunk, name):
    entropy = calc_entropy(chunk)

    # Determine what the entropy might indicate
    if entropy < 2:
        assessment = 'Very low - repetitive/simple data'
    elif entropy < 4:
        assessment = 'Low - likely plain text'
    elif entropy < 5:
        assessment = 'Medium - structured data'
    elif entropy < 6:
        assessment = 'Medium-high - possibly encoded'
    elif entropy < 7:
        assessment = 'High - likely Base64/encoded'
    else:
        assessment = 'Very high - encrypted/compressed/random'

    return entropy, assessment

print('=== ENTROPY ANALYSIS ===\\n')

# Overall entropy
total_entropy, total_assessment = analyze_chunk(data, 'Total')
print(f'Overall Entropy: {total_entropy:.3f} bits/byte')
print(f'Assessment: {total_assessment}')
print(f'Data size: {len(data):,} bytes')
print()

# Character distribution
printable = sum(1 for c in data if c.isprintable())
alpha = sum(1 for c in data if c.isalpha())
digits = sum(1 for c in data if c.isdigit())
spaces = sum(1 for c in data if c.isspace())
total = len(data)

print('CHARACTER DISTRIBUTION:')
print(f'  Printable: {printable:,} ({100*printable/total:.1f}%)')
print(f'  Alphabetic: {alpha:,} ({100*alpha/total:.1f}%)')
print(f'  Digits: {digits:,} ({100*digits/total:.1f}%)')
print(f'  Whitespace: {spaces:,} ({100*spaces/total:.1f}%)')
print()

# Find high-entropy strings (potential secrets)
import re
high_entropy_strings = []
for match in re.finditer(r'[A-Za-z0-9+/=_-]{20,}', data):
    s = match.group()
    e = calc_entropy(s)
    if e > 4.5 and len(s) >= 20:
        high_entropy_strings.append((s[:50] + '...' if len(s) > 50 else s, e, len(s)))

if high_entropy_strings:
    print('HIGH ENTROPY STRINGS (potential secrets):')
    for s, e, length in sorted(high_entropy_strings, key=lambda x: -x[1])[:10]:
        print(f'  [{e:.2f}] ({length} chars) {s}')
    print()

# Entropy per line analysis (first 50 lines)
lines = data.split('\\n')[:50]
high_lines = [(i+1, calc_entropy(line), line[:60]) for i, line in enumerate(lines) if line.strip() and calc_entropy(line) > 5.5]

if high_lines:
    print('HIGH ENTROPY LINES:')
    for linenum, e, preview in sorted(high_lines, key=lambda x: -x[1])[:5]:
        print(f'  Line {linenum} [{e:.2f}]: {preview}...' if len(preview) >= 60 else f'  Line {linenum} [{e:.2f}]: {preview}')

# Visual entropy bar
bar_length = 30
filled = int((total_entropy / 8) * bar_length)
bar = '[' + '#' * filled + '-' * (bar_length - filled) + ']'
print(f'\\nEntropy: {bar} {total_entropy:.2f}/8.00')
"`,
    timeout: 30,
  },
  codeBlock: true,
  language: "text",
};
