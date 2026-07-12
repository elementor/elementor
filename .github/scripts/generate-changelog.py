#!/usr/bin/env python3
"""
Changelog Generator
Generates WordPress readme.txt / Pro markdown changelog from Jira issues.

Usage (local):
  set -a; source .github/scripts/.env.release-doc; set +a
  SKIP_PR_CHECK=1 PR_TITLE="[ED-20684] run" PR_BODY="" PR_URL="x" PR_NUMBER="0" \
    python3 .github/scripts/generate-changelog.py

Environment variables:
  JIRA_BASE_URL, JIRA_EMAIL, JIRA_API_TOKEN, JIRA_PROJECT (default: ED)
  SKIP_PR_CHECK=1   — bypass GitHub PR check (for local testing)
  RELEASE_DATE      — override today's date (YYYY-MM-DD)
  PR_TITLE          — must contain [ED-XXXXX] anchor ticket
"""

import base64
import json
import os
import re
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
from datetime import date

# ── Config ─────────────────────────────────────────────────────────────────────
JIRA_BASE     = os.environ["JIRA_BASE_URL"].rstrip("/")
JIRA_EMAIL    = os.environ["JIRA_EMAIL"]
JIRA_TOKEN    = os.environ["JIRA_API_TOKEN"]
JIRA_PROJECT  = os.environ.get("JIRA_PROJECT", "ED")
SKIP_PR_CHECK = os.environ.get("SKIP_PR_CHECK", "") == "1"
RELEASE_DATE  = os.environ.get("RELEASE_DATE", "")
PR_TITLE      = os.environ.get("PR_TITLE", "")

JIRA_AUTH = base64.b64encode(f"{JIRA_EMAIL}:{JIRA_TOKEN}".encode()).decode()
JIRA_HEADERS = {
    "Authorization": f"Basic {JIRA_AUTH}",
    "Content-Type":  "application/json",
    "Accept":        "application/json",
}

CHANGELOG_SKIP_LABEL = "changelog-skip"

# ── Tweak keywords ─────────────────────────────────────────────────────────────
TWEAK_EPIC_KEYWORDS = [
    "improvement", "improvements", "stabilization", "phase 2", "phase 3",
    "enhancement", "enhancements", "ordering", "reorder", "reordering",
    "reorganiz", "consolidation", "consolidate", "migration",
]

# ── Regex helpers ──────────────────────────────────────────────────────────────
_PAST_TENSE_RE = re.compile(
    r'^(Improved|Modernized|Updated|Refined|Enhanced|Optimized|Streamlined|'
    r'Simplified|Revamped|Redesigned|Restructured|Consolidated|Migrated|'
    r'Added|Introduced|Enabled|Extended)\b\s*',
    re.IGNORECASE,
)

_ACTION_VERB_RE = re.compile(
    r'^(Added|Improved|Optimized|Extended|Enabled|Fixed|Updated|Simplified|'
    r'Streamlined|Expanded|Removed|Reduced|Replaced|Refactored|Migrated|'
    r'Moved|Renamed|Reorganized|Enhanced|Introduced|Unified|Standardized)\b',
    re.IGNORECASE,
)

_BENEFIT_OPENER_RE = re.compile(
    r'^(Users can|You can|Allows|Makes it|Helps|Provides|Gives|Now |Enables users)',
    re.IGNORECASE,
)

_FIX_PREFIX_RE = re.compile(
    r'^(Fix:|Bug:|Editor Bug:|Issue:|Error:|\[V4\]|v4\.?x?:?)\s*',
    re.IGNORECASE,
)

# ── Name substitution (compound patterns first) ────────────────────────────────
_NAME_SUBS = [
    (re.compile(r'Elementor\s+Editor\s+MCP\s+tools?', re.IGNORECASE), "AI editor tools"),
    (re.compile(r'Elementor\s+Editor\s+MCP',           re.IGNORECASE), "AI editor tools"),
    (re.compile(r'Editor\s+MCP\s+tools?',              re.IGNORECASE), "AI editor tools"),
    (re.compile(r'Editor\s+MCP',                       re.IGNORECASE), "AI editor tools"),
    (re.compile(r'MCP\s+tools?',                       re.IGNORECASE), "AI editor tools"),
    (re.compile(r'\bMCP\b',                            re.IGNORECASE), "AI editor tools"),
    (re.compile(r'\bAngie\b',                          re.IGNORECASE), "the AI assistant"),
    (re.compile(r'\bRovo\b',                           re.IGNORECASE), "AI"),
]


def apply_name_subs(text):
    for pattern, replacement in _NAME_SUBS:
        text = pattern.sub(replacement, text)
    return text


# ── ADF helpers ────────────────────────────────────────────────────────────────
def _extract_adf_all_lines(adf):
    """Return all lines from an ADF field, including Changelog: and Category: lines."""
    if not adf or not isinstance(adf, dict):
        return []
    lines = []
    for block in adf.get("content", []):
        if block.get("type") != "paragraph":
            continue
        current = []
        for node in block.get("content", []):
            if node.get("type") == "hardBreak":
                line = "".join(current).strip()
                if line:
                    lines.append(line)
                current = []
            elif node.get("type") == "text":
                current.append(node.get("text", ""))
        line = "".join(current).strip()
        if line:
            lines.append(line)
    return lines


def _parse_rdd(adf):
    """Parse Release Doc Description field.
    Returns (line1, line2, changelog_override, category_override).
    line1/line2: user-facing content lines (excludes Changelog:/Category: directives).
    changelog_override: text after 'Changelog:' directive (overrides derived text).
    category_override: 'New', 'Tweak', or 'Fix' after 'Category:' directive.
    """
    all_lines = _extract_adf_all_lines(adf)
    changelog_override = None
    category_override = None
    content_lines = []
    for line in all_lines:
        ll = line.lower()
        if ll.startswith("changelog:"):
            changelog_override = line[len("changelog:"):].strip()
        elif ll.startswith("category:"):
            raw = line[len("category:"):].strip().capitalize()
            if raw in ("New", "Tweak", "Fix"):
                category_override = raw
        else:
            content_lines.append(line)
    line1 = content_lines[0] if content_lines else None
    line2 = content_lines[1] if len(content_lines) > 1 else None
    return line1, line2, changelog_override, category_override


# ── Jira API helpers ───────────────────────────────────────────────────────────
def jira_get(path, params=None):
    url = JIRA_BASE + path
    if params:
        url += "?" + urllib.parse.urlencode(params)
    req = urllib.request.Request(url, headers=JIRA_HEADERS)
    with urllib.request.urlopen(req, timeout=30) as r:
        return json.loads(r.read())


def jira_post(path, body):
    url = JIRA_BASE + path
    data = json.dumps(body).encode()
    req = urllib.request.Request(url, data=data, headers=JIRA_HEADERS, method="POST")
    with urllib.request.urlopen(req, timeout=30) as r:
        return json.loads(r.read())


def jira_search(jql, fields, max_results=300):
    issues, next_token = [], None
    while True:
        body = {"jql": jql, "fields": fields, "maxResults": 50}
        if next_token:
            body["nextPageToken"] = next_token
        data = jira_post("/rest/api/3/search/jql", body)
        batch = data.get("issues", [])
        issues.extend(batch)
        if data.get("isLast", True) or not batch or len(issues) >= max_results:
            break
        next_token = data.get("nextPageToken")
        if not next_token:
            break
        time.sleep(0.3)
    return issues


def get_remote_links(key):
    """Return (has_pr, pr_link_title, gh_issue_urls) from issue's Jira remote links."""
    has_pr = False
    pr_title = ""
    gh_issue_urls = []
    try:
        links = jira_get(f"/rest/api/3/issue/{key}/remotelink")
        for link in links:
            obj = link.get("object", {})
            url = obj.get("url", "")
            if "github.com" in url and "/pull/" in url:
                has_pr = True
                if not pr_title:
                    pr_title = obj.get("title", "")
            elif "github.com" in url and "/issues/" in url:
                gh_issue_urls.append(url)
    except Exception:
        pass
    return has_pr, pr_title, gh_issue_urls


def _format_gh_issues(urls):
    """Format GitHub issue URLs as markdown links: ([#123](url), [#456](url))"""
    links = []
    for url in urls:
        m = re.search(r'/issues/(\d+)$', url)
        if m:
            links.append(f"[#{m.group(1)}]({url})")
    return " (" + ", ".join(links) + ")" if links else ""


# ── Version helpers ────────────────────────────────────────────────────────────
def extract_version_number(v):
    m = re.search(r'(\d+\.\d+\.\d+)', v)
    return m.group(1) if m else None


def version_tuple(v):
    num = extract_version_number(v)
    if not num:
        return None
    return tuple(int(x) for x in num.split("."))


def determine_phase(matching_versions):
    if not matching_versions:
        return "in_progress"
    betas = [v for v in matching_versions if "beta" in v.get("name", "").lower()]
    gas   = [v for v in matching_versions if "beta" not in v.get("name", "").lower()]
    if any(v.get("released", False) for v in gas):
        return "released"
    if betas and not all(v.get("released", False) for v in betas):
        return "draft"
    return "in_progress"


# ── Category classification ────────────────────────────────────────────────────
def _classify_epic_category(row, current_fix_version):
    """Classify category for an Epic issue."""
    if row.get("category_override"):
        return row["category_override"]

    # Previous-release fixVersions → ongoing work → Tweak
    current_tuple = version_tuple(current_fix_version)
    if current_tuple:
        for fv in row["fv_names"]:
            t = version_tuple(fv)
            if t and t < current_tuple:
                return "Tweak"

    # Tweak keywords in summary or RDD line1
    s  = row["summary"].lower()
    l1 = (row.get("line1") or "").lower()
    if any(kw in s or kw in l1 for kw in TWEAK_EPIC_KEYWORDS):
        return "Tweak"

    # Line1 starts with past-tense adjective → Tweak
    if row.get("line1") and _PAST_TENSE_RE.match(row["line1"]):
        return "Tweak"

    return "New"


def _classify_child_category(row, rows_by_key):
    """Classify category for Bug, Story, Task, Sub-task, Security Fix, Editor Bug."""
    if row.get("category_override"):
        return row["category_override"]

    itype = row["type"]
    if itype in ("Bug", "Editor Bug", "Security Fix"):
        return "Fix"

    # Story / Task / Sub-task: inherit from parent Epic
    parent_key = row.get("parent_key", "")
    if parent_key and parent_key in rows_by_key:
        parent = rows_by_key[parent_key]
        if parent["type"] == "Epic":
            # Parent has no user-facing description (Rovo didn't run) → always Tweak
            if not parent.get("has_rdd"):
                return "Tweak"
            return parent.get("category", "Tweak")

    return "Tweak"


# ── Gate ───────────────────────────────────────────────────────────────────────
def _passes_gate(row):
    """Return True if this issue should appear in the changelog."""
    if CHANGELOG_SKIP_LABEL in (row.get("labels") or []):
        return False
    # has_rdd: Rovo ran (line1 exists) OR manual Changelog: override set
    if not row["has_rdd"] and not row.get("changelog_override"):
        return False
    if not row["has_pr"] and not SKIP_PR_CHECK:
        return False
    return True


# ── Text derivation ────────────────────────────────────────────────────────────
def _derive_text(row):
    """Derive changelog entry text from RDD lines, override, or PR title."""
    line1             = row.get("line1")
    line2             = row.get("line2")
    category          = row.get("category", "Tweak")
    changelog_override = row.get("changelog_override")
    itype             = row.get("type", "")
    summary           = row.get("summary", "")

    if changelog_override:
        return apply_name_subs(changelog_override)

    # Security Fix without changelog override: derive vague text from PR title or summary
    if itype == "Security Fix":
        raw = row.get("pr_title") or summary
        raw = re.sub(r'^Internal:\s*', '', raw, flags=re.IGNORECASE).strip()
        raw = re.sub(r'^Cherry-pick PR \d+ to [\d.]+:\s*', '', raw, flags=re.IGNORECASE).strip()
        raw = re.sub(r'\s*\[?' + JIRA_PROJECT + r'-\d+\]?', '', raw).strip()
        raw = re.sub(r'\b(api|rest|data|hardening|xss|sql|csrf|injection|bypass)\b', '', raw, flags=re.IGNORECASE)
        raw = re.sub(r'\s+', ' ', raw).strip().rstrip(".")
        if len(raw) < 5:
            return "Improved code security enforcement"
        return f"Improved code security enforcement in {raw.lower()} handling"

    if not line1:
        return apply_name_subs(summary)

    if category == "New":
        text = _PAST_TENSE_RE.sub("", line1).strip()
        # Append short benefit from line2 (only if ≤60 chars and not a benefit opener)
        if line2 and len(line2) <= 60 and not _BENEFIT_OPENER_RE.match(line2):
            text = f"{text} - {line2}"
        return apply_name_subs(text)

    if category == "Tweak":
        # Use line2 if it starts with an action verb and is NOT a benefit opener
        if line2 and _ACTION_VERB_RE.match(line2) and not _BENEFIT_OPENER_RE.match(line2):
            return apply_name_subs(line2)
        return apply_name_subs(line1)

    if category == "Fix":
        text = _FIX_PREFIX_RE.sub("", line1).strip()
        text = re.sub(r'\s*\[?PR[- ]?\d+\]?', '', text).strip()
        return apply_name_subs(text)

    return apply_name_subs(line1)


def _derive_child_label(child_row, parent_line1=""):
    """Derive a short inline label for a child in a New parent's aggregated list."""
    text = _PAST_TENSE_RE.sub("", (child_row.get("line1") or child_row.get("summary") or "")).strip()
    # Strip AI agent suffix if parent already implies AI context
    parent_ctx = parent_line1.lower()
    if "ai" in parent_ctx or "mcp" in parent_ctx:
        text = re.sub(r'\s+(for|to)\s+AI\s+agents?$', '', text, flags=re.IGNORECASE).strip()
    # Strip "exposed/accessible as/via [phrase]"
    text = re.sub(r'\s+(exposed|accessible)\s+(as|via)\s+\S+(\s+\S+)?$', '', text, flags=re.IGNORECASE).strip()
    # Strip trailing bare filler words
    text = re.sub(r'\s+(available|exposed|accessible)$', '', text, flags=re.IGNORECASE).strip()
    return apply_name_subs(text)


# ── Free/Pro tier helpers ──────────────────────────────────────────────────────
def _is_free(fv_names):
    return any("pro" not in (v or "").lower() for v in fv_names)


def _is_pro(fv_names):
    return any("pro" in (v or "").lower() for v in fv_names)


# ── Step 1: Extract anchor ticket from PR title ────────────────────────────────
match = re.search(r'\[?(' + JIRA_PROJECT + r'-\d+)\]?', PR_TITLE)
if not match:
    print(f"No Jira ticket in PR title: '{PR_TITLE}' — skipping.", file=sys.stderr)
    sys.exit(0)

ticket = match.group(1)
print(f"Anchor ticket: {ticket}", file=sys.stderr)


# ── Step 2: Get fixVersion from anchor ticket ─────────────────────────────────
issue_data = jira_get(f"/rest/api/3/issue/{ticket}", {"fields": "fixVersions,issuetype,summary"})
fields = issue_data.get("fields", {})
fix_versions = [v["name"] for v in (fields.get("fixVersions") or [])]

if not fix_versions:
    print(f"{ticket} has no fixVersion — skipping.", file=sys.stderr)
    sys.exit(0)

versioned = [(version_tuple(v), v) for v in fix_versions if version_tuple(v)]
if not versioned:
    print(f"{ticket} fixVersions={fix_versions} — no recognizable version, skipping.", file=sys.stderr)
    sys.exit(0)

versioned.sort(key=lambda t: t[0])
fix_version = extract_version_number(versioned[0][1])
print(f"fixVersion: {fix_version}", file=sys.stderr)


# ── Step 3: Find all matching Jira versions (free + pro, all betas) ───────────
try:
    all_project_versions = jira_get(f"/rest/api/3/project/{JIRA_PROJECT}/versions")
    matching_versions = [
        v for v in all_project_versions
        if extract_version_number(v.get("name", "")) == fix_version
    ]
    matching_version_names = [v["name"] for v in matching_versions]
except Exception:
    matching_versions = []
    matching_version_names = [versioned[0][1]]

phase = determine_phase(matching_versions)
print(f"Versions: {matching_version_names}  phase: {phase}", file=sys.stderr)


# ── Step 4: Fetch all issues for this version ─────────────────────────────────
version_filter = " OR ".join(f'fixVersion = "{v}"' for v in matching_version_names)
jql = (
    f'project = {JIRA_PROJECT} AND ({version_filter}) '
    f'AND issuetype in (Epic, Story, Task, Bug, "Editor Bug", "Security Fix", "Sub-task") '
    f'ORDER BY updated DESC'
)

ISSUE_FIELDS = [
    "summary", "status", "issuetype", "parent", "labels", "fixVersions",
    "customfield_19347",  # Release Doc Description (Rovo-generated)
]

raw_issues = jira_search(jql, ISSUE_FIELDS)
print(f"Found {len(raw_issues)} issues for {fix_version}", file=sys.stderr)


# ── Step 5: Build rows_by_key (preserves Jira query order) ───────────────────
rows_by_key = {}
for issue in raw_issues:
    f         = issue.get("fields", {})
    key       = issue["key"]
    itype     = (f.get("issuetype") or {}).get("name", "")
    summary   = (f.get("summary") or "").strip()
    labels    = f.get("labels") or []
    fv_names  = [v["name"] for v in (f.get("fixVersions") or [])]
    parent_key = (f.get("parent") or {}).get("key", "")

    line1, line2, changelog_override, category_override = _parse_rdd(f.get("customfield_19347"))
    has_rdd = bool(line1)  # Rovo ran = line1 present (changelog_override alone does NOT count as has_rdd)

    # Always fetch remote links — needed for GitHub issue numbers.
    # SKIP_PR_CHECK only bypasses the gate; we still want the issue links.
    has_pr, pr_title, gh_issue_urls = get_remote_links(key)
    time.sleep(0.15)
    if SKIP_PR_CHECK:
        has_pr = True

    rows_by_key[key] = {
        "key":                key,
        "type":               itype,
        "summary":            summary,
        "labels":             labels,
        "fv_names":           fv_names,
        "parent_key":         parent_key,
        "line1":              line1,
        "line2":              line2,
        "changelog_override": changelog_override,
        "category_override":  category_override,
        "has_rdd":            has_rdd,
        "has_pr":             has_pr,
        "pr_title":           pr_title,
        "gh_issues":          gh_issue_urls,
        # category set in next steps
    }

print(f"Built rows for {len(rows_by_key)} issues", file=sys.stderr)


# ── Step 6: Classify categories (Epics first, then children) ─────────────────
for key, row in rows_by_key.items():
    if row["type"] == "Epic":
        row["category"] = _classify_epic_category(row, fix_version)

for key, row in rows_by_key.items():
    if row["type"] != "Epic":
        row["category"] = _classify_child_category(row, rows_by_key)


# ── Step 6.5: Build effective children per Epic ───────────────────────────────
# IMPORTANT: iterate rows_by_key (preserves Jira query order), never a set.
effective_children_by_epic = {}
for epic_key, epic_row in rows_by_key.items():
    if epic_row["type"] != "Epic":
        continue
    if not _passes_gate(epic_row):
        continue
    children = [
        k for k, r in rows_by_key.items()
        if r.get("parent_key") == epic_key and _passes_gate(r)
    ]
    effective_children_by_epic[epic_key] = children


# ── Step 7: Build output entries ──────────────────────────────────────────────
free_entries = []
pro_entries  = []
suppressed   = set()  # keys whose output is absorbed into a parent entry


def _add_entry(row, text_override=None):
    """Add a changelog entry to the appropriate free/pro list."""
    text = text_override if text_override is not None else _derive_text(row)
    cat  = row["category"]
    # Ensure New entries start with "Introducing"
    if cat == "New" and not text.lower().startswith("introducing"):
        text = "Introducing " + text
    # Append GitHub issue links if present
    text += _format_gh_issues(row.get("gh_issues", []))
    entry = {"category": cat, "text": text, "key": row["key"]}
    if _is_free(row["fv_names"]):
        free_entries.append(entry)
    if _is_pro(row["fv_names"]):
        pro_entries.append(entry)


# First pass: Epics (drive child suppression decisions)
for key, row in rows_by_key.items():
    if row["type"] != "Epic":
        continue
    if not _passes_gate(row):
        continue

    eff_children = effective_children_by_epic.get(key, [])
    category     = row["category"]

    if category == "New":
        if eff_children:
            # Aggregate children inline: "Introducing [parent]: child1, child2, child3, and more"
            parent_ctx = row.get("line1") or row["summary"]
            labels_list = [_derive_child_label(rows_by_key[ck], parent_ctx) for ck in eff_children]
            if len(labels_list) > 3:
                inline = ", ".join(labels_list[:3]) + ", and more"
            elif len(labels_list) > 1:
                inline = ", ".join(labels_list[:-1]) + ", and " + labels_list[-1]
            else:
                inline = labels_list[0]

            # Get parent base name (strip "Introducing" and " - benefit" suffix)
            parent_text = _derive_text(row)
            parent_base = re.sub(r'^Introducing\s+', '', parent_text, flags=re.IGNORECASE).strip()
            parent_base = re.sub(r'\s+-\s+.+$', '', parent_base).strip()

            aggregated = f"Introducing {parent_base}: {inline}" if inline else f"Introducing {parent_base}"
            _add_entry(row, text_override=aggregated)
            # Children absorbed — suppress their individual entries
            for ck in eff_children:
                suppressed.add(ck)
        else:
            _add_entry(row)

    elif category == "Tweak":
        if len(eff_children) >= 3:
            # Show parent as general Tweak + children shown individually (not suppressed)
            _add_entry(row)
        else:
            # <3 children → suppress parent, show children individually
            suppressed.add(key)

    else:
        # Fix or override category
        _add_entry(row)

# Second pass: non-Epics
for key, row in rows_by_key.items():
    if row["type"] == "Epic":
        continue
    if key in suppressed:
        continue
    if not _passes_gate(row):
        continue
    _add_entry(row)

# Fallback: if a tier has issues but nothing passed the gate, add a generic Tweak
_FALLBACK = {"category": "Tweak", "text": "General improvements and maintenance", "key": ""}
if not free_entries and any(_is_free(r["fv_names"]) for r in rows_by_key.values()):
    free_entries.append(_FALLBACK)
if not pro_entries and any(_is_pro(r["fv_names"]) for r in rows_by_key.values()):
    pro_entries.append(_FALLBACK)


# ── Step 8: Format and print output ──────────────────────────────────────────
today = RELEASE_DATE or date.today().strftime("%Y-%m-%d")


def _format_section(entries, version, date_str, fmt):
    """Format changelog entries as Free (WordPress readme.txt) or Pro (markdown)."""
    new_items   = [e for e in entries if e["category"] == "New"]
    tweak_items = [e for e in entries if e["category"] == "Tweak"]
    fix_items   = [e for e in entries if e["category"] == "Fix"]

    lines = []
    if fmt == "free":
        lines.append(f"= {version} - {date_str} =")
    else:
        lines.append(f"#### {version} - {date_str}")

    lines.append("")  # blank line between header and entries

    for e in new_items:
        text = e["text"]
        if not text.lower().startswith("introducing"):
            text = "Introducing " + text
        lines.append(f"* New: {text}")
    for e in tweak_items:
        lines.append(f"* Tweak: {e['text']}")
    for e in fix_items:
        lines.append(f"* Fix: {e['text']}")

    return "\n".join(lines)


print(f"\nCounts — Free: {len(free_entries)}  Pro: {len(pro_entries)}", file=sys.stderr)

if free_entries:
    print(_format_section(free_entries, fix_version, today, "free"))
    print()

if pro_entries:
    print(_format_section(pro_entries, fix_version, today, "pro"))
    print()

if not free_entries and not pro_entries:
    print(f"# No changelog entries found for {fix_version}", file=sys.stderr)
    print(f"# (check SKIP_PR_CHECK=1 for local testing)", file=sys.stderr)
