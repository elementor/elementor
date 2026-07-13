#!/usr/bin/env python3
"""
Release Doc Generator
Triggered on every PR merge to main.

Flow:
  1. Extract [ED-XXXXX] from PR title
  2. Jira: get issue → get fixVersion → skip if none; picks earliest version if ticket is in multiple
  3. Jira: find ALL version names for that number (free + pro)
  4. Jira: get ALL epics + user-facing stories for those versions
  5. Jira: fetch Figma / video links per issue
  6. Build feature rows grouped by topic (keyword-matched from summary)
  7. Confluence: find or create "Version X.Y.Z" page → regenerate auto section,
     preserving manual top (release dates) and bottom (notes) sections
"""
import json
import os
import re
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
import base64

# ── Config ────────────────────────────────────────────────────────────────────
JIRA_BASE   = os.environ["JIRA_BASE_URL"].rstrip("/")
JIRA_EMAIL  = os.environ["JIRA_EMAIL"]
JIRA_TOKEN  = os.environ["JIRA_API_TOKEN"]
CONF_PARENT   = os.environ["CONFLUENCE_PARENT_PAGE_ID"]  # 471075795
CONF_SPACE    = os.environ["CONFLUENCE_SPACE_KEY"]        # RDDEP
JIRA_PROJECT  = os.environ.get("JIRA_PROJECT", "ED")

PR_TITLE  = os.environ.get("PR_TITLE", "")
PR_BODY   = os.environ.get("PR_BODY", "")
PR_URL    = os.environ.get("PR_URL", "")
PR_NUMBER = os.environ.get("PR_NUMBER", "")

JIRA_AUTH = base64.b64encode(f"{JIRA_EMAIL}:{JIRA_TOKEN}".encode()).decode()
JIRA_HEADERS = {
    "Authorization": f"Basic {JIRA_AUTH}",
    "Content-Type":  "application/json",
    "Accept":        "application/json",
}
CONF_HEADERS = {
    "Authorization": f"Basic {JIRA_AUTH}",
    "Content-Type":  "application/json",
    "Accept":        "application/json",
}

# Issue types considered "user-facing"
USER_FACING_TYPES = {"Epic", "Story", "Task"}

# Markers that wrap the auto-generated section; everything outside is preserved
BOT_START_MARKER = "<!-- BOT:START -->"
BOT_END_MARKER   = "<!-- BOT:END -->"

DEFAULT_TOP_SECTION = """\
<p>&nbsp;</p>
<h2>Release Info</h2>
<p><strong>Beta:</strong> TBD &nbsp;&nbsp;|&nbsp;&nbsp; <strong>GA:</strong> TBD</p>
"""

DEFAULT_BOTTOM_SECTION = """\
<p>&nbsp;</p>
<h2>Notes</h2>
<p><em>Add manual notes here — they will not be overwritten.</em></p>
"""

# Prefixes that indicate internal / non-user-facing issues (case-insensitive)
INTERNAL_PREFIXES = (
    "internal:",
    "experiments status",
    "unskip",
    "tweak:",
    "chore:",
    "refactor:",
    "fix:",
    "remove unused",
    "remove per-",
    "bump ",
    "[research]",
    "research:",
    "research -",
)

# Issues whose summary contains ANY of these substrings are excluded from the doc.
# Case-insensitive. Add entries here for whole categories you never want shown.
EXCLUDE_KEYWORDS = [
    "product analytics",
    "accessibility panel",
    "site planner",
    "adoption-blocking",
    "analytics",
    "plg",
    "promotion",
    "10bday",            # 10th-birthday promotional campaign
    "birthday",          # promotional campaigns (birthday, anniversaries)
    "black friday",
    "cyber monday",
    "pro widget",        # editor-internal V4 widget canvas issues
    "locked widget",      # Pro upsell / activation flow (not user-facing)
    "connect & activate", # Pro activation popover (commercial UI)
    "license is not active", # Pro license activation state — internal/commercial
]

# Issues tagged with this Jira label are excluded (for one-off per-issue exclusions).
EXCLUDE_LABEL = "release-doc-skip"

# Keywords that exclude issues from BOTH the main table AND the internal section.
# Use for product areas that are never relevant to any external or internal stakeholder
# in this doc (e.g. site planner, accessibility panel).
ALWAYS_EXCLUDE_KEYWORDS = [
    "accessibility panel",
    "planner",   # catches "site planner", "planner flow", etc.
]

# Additional filters applied only to child rows (tasks/stories under an Epic).
# These catch implementation details that are too technical even if the parent Epic is user-facing.
CHILD_INTERNAL_PREFIXES = (
    "migrate ",
    "introduce a ",
    "move the ",
    "rebuild ",
    "add missing",
    "refactor ",
    "create basic",
    "create the ",
    "build the ",
    "add support",
    "verify ",
    "ensure ",
    "align ",
    "update ",
    "rename ",
    "test ",
    "add feature",
    "add attribute",
    "set ",
    "get ",
    "fix ",
)
CHILD_EXCLUDE_KEYWORDS = [
    "mcp-proxy",
    "wp_capabilities",
    "schema-driven",
    "mirroring in php",
    "client side mcp",
    "server side mcp",
    "client-side mcp",
    "server-side mcp",
    "playwright",
    "qunit",
    "webpack",
    "babel",
    "slack",
    "translate service",
    "e2e",
    "sanity test",
    "flaky test",
]

def is_child_technical(summary):
    s = summary.lower()
    return (any(s.startswith(p) for p in CHILD_INTERNAL_PREFIXES) or
            any(kw in s for kw in CHILD_EXCLUDE_KEYWORDS))

# ── Topic grouping ─────────────────────────────────────────────────────────────
# Topics are matched by keywords found anywhere in the Epic/Story summary.
# First match wins. Issues that match nothing go into TOPIC_DEFAULT (Pending).
# Edit keywords and colors freely — order defines section order in the doc.
#
# Format: (keywords_list, display_name, header_background_color)
TOPIC_RULES = [
    # (keywords, display_name, hex_color, confluence_colorname)
    (["ai", "angie", "mcp", "design system", "composition", "copilot"],
     "AI Experience",    "#e6d9f3", "Light purple"),

    (["atomic", "accordion", "background video", "css grid", "html tag",
      "form element", "slider", "tabs widget", "loop"],
     "Atomic Editor",    "#deebff", "Light blue"),

    (["performance", "optimization", "canvas load", "lcp", "ttfb"],
     "Performance",      "#e3fcef", "Light green"),

    (["accessibility", "a11y", "good to know", "deprecat"],
     "Good to Know",     "#fff7c0", "Light yellow"),
]
# Issues that don't match any TOPIC_RULES keyword fall into Good to Know
TOPIC_DEFAULT           = "Good to Know"
TOPIC_DEFAULT_COLOR     = "#fff7c0"
TOPIC_DEFAULT_COLORNAME = "Light yellow"


# ── Page status (derived from Jira version released flags) ────────────────────
# Native Confluence page status IDs (RDDEP space)
_STATE_DRAFT       = {"id": 740786804, "name": "DRAFT",            "color": "#ffc400"}
_STATE_IN_PROGRESS = {"id": 687051862, "name": "In progress",      "color": "#2684ff"}
_STATE_DONE        = {"id": 687051863, "name": "Ready for review",  "color": "#57d9a3"}


def determine_phase(matching_versions):
    """
    Determine release phase from Jira version objects (each has a 'released' bool).
      'draft'       - unreleased betas exist (beta in flight)
      'in_progress' - all betas released (or none exist) and GA not yet released
      'released'    - GA version is released
    Falls back to 'in_progress' when no version data is available.
    """
    if not matching_versions:
        return 'in_progress'
    betas = [v for v in matching_versions if 'beta' in v.get('name', '').lower()]
    gas   = [v for v in matching_versions if 'beta' not in v.get('name', '').lower()]
    if any(v.get('released', False) for v in gas):
        return 'released'
    if betas and not all(v.get('released', False) for v in betas):
        return 'draft'
    return 'in_progress'


def phase_to_page_state(phase):
    if phase == 'released':
        return _STATE_DONE
    if phase == 'in_progress':
        return _STATE_IN_PROGRESS
    return _STATE_DRAFT


# ── Helpers ───────────────────────────────────────────────────────────────────
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
    """Return (figma_url, video_url, has_pr, confluence_url) from the issue's Jira remote links."""
    figma = video = confluence = ""
    has_pr = False
    try:
        links = jira_get(f"/rest/api/3/issue/{key}/remotelink")
        for link in links:
            obj = link.get("object", {})
            url = obj.get("url", "")
            if "figma.com" in url and not figma:
                figma = url
            elif any(d in url for d in ["loom.com", "youtube.com", "youtu.be"]) and not video:
                video = url
            elif "github.com" in url and "/pull/" in url:
                has_pr = True
            elif "atlassian.net/wiki" in url and not confluence:
                confluence = url
    except Exception:
        pass
    return figma, video, has_pr, confluence


def extract_adf_text(adf, max_chars=200):
    """Extract plain text from Atlassian Document Format (handles paragraphs, tables, lists, etc)."""
    if not adf or not isinstance(adf, dict):
        return ""

    def _collect(node):
        if not isinstance(node, dict):
            return []
        if node.get("type") == "text":
            return [node.get("text", "")]
        # Skip table header cells — they're column names, not content
        if node.get("type") == "tableHeader":
            return []
        parts = []
        for child in node.get("content", []):
            parts.extend(_collect(child))
        return parts

    texts = _collect(adf)
    text = " ".join(t for t in texts if t.strip()).strip()
    if len(text) > max_chars:
        text = text[:max_chars].rsplit(" ", 1)[0] + "…"
    return text


def extract_adf_paragraphs(adf):
    """Return list of plain-text strings, one per line (paragraph or hardBreak-separated).
    Strips lines starting with 'Changelog:' since those are for the main table only."""
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
    return [l for l in lines if not l.lower().startswith("changelog:")]


def conf_request(method, path, body=None):
    url = "https://elementor.atlassian.net/wiki" + path
    data = json.dumps(body).encode() if body else None
    req = urllib.request.Request(url, data=data, headers=CONF_HEADERS, method=method)
    try:
        with urllib.request.urlopen(req, timeout=30) as r:
            return r.status, json.loads(r.read()) if r.read else {}
    except urllib.error.HTTPError as e:
        body_text = e.read().decode()
        print(f"  Confluence HTTP {e.code}: {body_text[:300]}", file=sys.stderr)
        return e.code, {}


def conf_get(path, params=None):
    url = "https://elementor.atlassian.net/wiki" + path
    if params:
        url += "?" + urllib.parse.urlencode(params)
    req = urllib.request.Request(url, headers=CONF_HEADERS)
    with urllib.request.urlopen(req, timeout=30) as r:
        return json.loads(r.read())


def conf_set_page_status(page_id, state):
    """Set the native Confluence page status badge via the content-state API."""
    url = f"https://elementor.atlassian.net/wiki/rest/api/content/{page_id}/state?status=current"
    data = json.dumps(state).encode()
    req = urllib.request.Request(url, data=data, headers=CONF_HEADERS, method="PUT")
    try:
        with urllib.request.urlopen(req, timeout=30) as r:
            r.read()
        print(f"  Page status set to: {state['name']}", file=sys.stderr)
    except Exception as e:
        print(f"  Warning: could not set page status — {e}", file=sys.stderr)


def extract_version_number(v):
    """Return 'X.Y.Z' from strings like 'v4.3.0 - Beta 1' or 'Pro v4.3.0', or None."""
    m = re.search(r'(\d+\.\d+\.\d+)', v)
    return m.group(1) if m else None


def version_tuple(v):
    """Return (major, minor, patch) tuple for sorting, or None if not parseable."""
    num = extract_version_number(v)
    if not num:
        return None
    parts = num.split(".")
    return tuple(int(x) for x in parts)


def get_tier(fix_version_names):
    """Derive plugin tier from fixVersion names (e.g. 'Pro v4.3.0' → Pro)."""
    has_pro  = any("pro" in (v or "").lower() for v in fix_version_names)
    has_free = any("pro" not in (v or "").lower() for v in fix_version_names)
    if has_free and has_pro: return "Free + Pro"
    if has_pro:              return "Pro"
    if has_free:             return "Free"
    return ""


def get_topic(summary):
    """Match summary text against TOPIC_RULES keywords (case-insensitive)."""
    s = (summary or "").lower()
    for keywords, topic_name, _hex, _cn in TOPIC_RULES:
        if any(kw.lower() in s for kw in keywords):
            return topic_name
    return TOPIC_DEFAULT


def get_topic_color(topic_name):
    """Return (hex_color, colorname) for a topic name."""
    for _, name, hex_color, colorname in TOPIC_RULES:
        if name == topic_name:
            return hex_color, colorname
    return TOPIC_DEFAULT_COLOR, TOPIC_DEFAULT_COLORNAME


def status_icon(name):
    name = (name or "").lower()
    if "done" in name:        return "✅ Done"
    if "progress" in name:    return "🔄 In Progress"
    if "review" in name:      return "👀 In Review"
    if "testing" in name:     return "🧪 Testing"
    if "stuck" in name:       return "🔴 Stuck"
    if "ready for merge" in name or "ready to merge" in name: return "🟢 Ready To Merge"
    return name.title()


def is_excluded(summary, labels):
    s = (summary or "").lower().strip()
    if any(s.startswith(p) for p in INTERNAL_PREFIXES):
        return True
    if any(kw.lower() in s for kw in ALWAYS_EXCLUDE_KEYWORDS):
        return True
    if any(kw.lower() in s for kw in EXCLUDE_KEYWORDS):
        return True
    if EXCLUDE_LABEL in (labels or []):
        return True
    return False


def is_internal_stakeholder(summary, labels):
    """Return True if this issue belongs in the Internal Changes section:
    excluded from the main release table but relevant to internal stakeholders
    (e.g. onboarding changes, promotions). Purely technical issues are dropped."""
    s = (summary or "").lower().strip()
    if any(s.startswith(p) for p in INTERNAL_PREFIXES):
        return False  # purely technical — drop entirely
    if EXCLUDE_LABEL in (labels or []):
        return False  # explicitly flagged to skip
    if any(kw.lower() in s for kw in ALWAYS_EXCLUDE_KEYWORDS):
        return False  # never show anywhere
    return any(kw.lower() in s for kw in EXCLUDE_KEYWORDS)


# ── Step 1: Extract Jira ticket from PR title ─────────────────────────────────
match = re.search(r'\[?(ED-\d+)\]?', PR_TITLE)
if not match:
    print(f"No Jira ticket in PR title: '{PR_TITLE}' — skipping.", file=sys.stderr)
    sys.exit(0)

ticket = match.group(1)
print(f"PR #{PR_NUMBER}: {ticket}", file=sys.stderr)


# ── Step 2: Get fixVersion for this ticket ────────────────────────────────────
issue_data = jira_get(f"/rest/api/3/issue/{ticket}",
                      {"fields": "fixVersions,issuetype,summary,parent,status,labels,"
                                 "description,customfield_10127,customfield_10459,customfield_19347"})
fields = issue_data.get("fields", {})
fix_versions = [v["name"] for v in (fields.get("fixVersions") or [])]

if not fix_versions:
    print(f"{ticket} has no fixVersion — skipping.", file=sys.stderr)
    sys.exit(0)

versioned = [(version_tuple(v), v) for v in fix_versions if version_tuple(v)]
if not versioned:
    print(f"{ticket} fixVersions={fix_versions} — no recognizable version, skipping.", file=sys.stderr)
    sys.exit(0)

# When ticket is in multiple versions (e.g. backport), pick the earliest release
versioned.sort(key=lambda t: t[0])
fix_version_jira = versioned[0][1]
fix_version      = versioned[0][0]  # already a clean (major, minor, patch) tuple — convert back
fix_version      = extract_version_number(fix_version_jira)  # clean "4.1.5" for page title
issue_type    = (fields.get("issuetype") or {}).get("name", "")
issue_summary = (fields.get("summary") or "").strip()
status_name   = (fields.get("status") or {}).get("name", "")
print(f"fixVersion: {fix_version}  type: {issue_type}  status: {status_name}", file=sys.stderr)

_fv_parts_early = fix_version.split(".")
_is_patch_anchor = len(_fv_parts_early) == 3 and _fv_parts_early[2].isdigit() and int(_fv_parts_early[2]) > 0
if issue_type not in USER_FACING_TYPES and not _is_patch_anchor:
    print(f"Issue type '{issue_type}' is not user-facing — skipping.", file=sys.stderr)
    sys.exit(0)


# ── Step 3: Find ALL Jira versions matching this number (free + pro) ──────────
# e.g. both "v4.3.0 - Beta 1" and "Pro v4.3.0 - Beta 1"
try:
    all_project_versions = jira_get(f"/rest/api/3/project/{JIRA_PROJECT}/versions")
    matching_versions = [
        v for v in all_project_versions
        if extract_version_number(v.get("name", "")) == fix_version
    ]
    matching_version_names = [v["name"] for v in matching_versions]
except Exception:
    matching_versions = []
    matching_version_names = [fix_version_jira]

phase = determine_phase(matching_versions)
print(f"Querying versions: {matching_version_names}  phase: {phase}", file=sys.stderr)

# Build Jira version links (Core / Pro), preferring GA over beta within each tier
def _jira_version_links(versions):
    """Return HTML snippet with Jira version links, one per tier (Core/Pro)."""
    by_tier = {}
    for v in versions:
        name = v.get('name', '')
        tier = 'Pro' if 'pro' in name.lower() else 'Core'
        is_beta = 'beta' in name.lower()
        existing = by_tier.get(tier)
        # Prefer GA over beta; among betas prefer later ones (higher name sort)
        if not existing or (existing['_beta'] and not is_beta) or (is_beta and existing['_beta'] and name > existing['name']):
            by_tier[tier] = {**v, '_beta': is_beta}
    links = []
    for tier in ('Core', 'Pro'):
        v = by_tier.get(tier)
        if v:
            url = f"{JIRA_BASE}/projects/{JIRA_PROJECT}/versions/{v['id']}"
            label = tier + (' (Beta)' if v['_beta'] else '')
            links.append(f'<a href="{url}">{label}</a>')
    return " &nbsp;|&nbsp; ".join(links)

# Filter Jira version links to match the anchor ticket's tier
_anchor_tier = get_tier(fix_versions)  # "Free", "Pro", or "Free + Pro"
_tier_filtered_versions = [
    v for v in matching_versions
    if _anchor_tier == "Free + Pro"
    or (_anchor_tier == "Pro"  and 'pro' in v.get('name', '').lower())
    or (_anchor_tier == "Free" and 'pro' not in v.get('name', '').lower())
]
_version_links_html = _jira_version_links(_tier_filtered_versions)
_version_links_line = (f'<p><strong>Jira:</strong> {_version_links_html}</p>\n'
                       if _version_links_html else '')


# ── Step 4: Get ALL user-facing issues for this version ──────────────────────
# During beta: only query unreleased betas (show beta-ready content only)
if phase == 'draft':
    query_version_names = [
        v["name"] for v in matching_versions
        if 'beta' in v.get('name', '').lower() and not v.get('released', False)
    ] or matching_version_names
else:
    query_version_names = matching_version_names

# Filter query to anchor tier — a Pro-only page should not pull free version tickets
if _anchor_tier == "Pro":
    query_version_names = [v for v in query_version_names if 'pro' in v.lower()] or query_version_names
elif _anchor_tier == "Free":
    query_version_names = [v for v in query_version_names if 'pro' not in v.lower()] or query_version_names
# "Free + Pro" → keep all
print(f"Anchor tier: {_anchor_tier}  Query versions: {query_version_names}", file=sys.stderr)

version_filter = " OR ".join(f'fixVersion = "{v}"' for v in query_version_names)
jql = (
    f'project = {JIRA_PROJECT} AND ({version_filter}) '
    f'AND issuetype in (Epic, Story, Task) '
)
if phase == 'released':
    jql += 'AND status in (Done, Closed) '
jql += 'ORDER BY updated DESC'

ISSUE_FIELDS = [
    "summary", "status", "issuetype", "parent", "labels", "description",
    "fixVersions",
    "customfield_10127",   # Owner (user)
    "customfield_10459",   # Editor Team (select)
    "customfield_19347",   # Release Doc Description (Rovo-generated)
]
raw_issues = jira_search(jql, ISSUE_FIELDS)
print(f"Found {len(raw_issues)} issues for {fix_version} (free + pro)", file=sys.stderr)

main_issues = [i for i in raw_issues
               if not is_excluded(i.get("fields", {}).get("summary", ""),
                                  i.get("fields", {}).get("labels", []))]

# Detect patch release (Z > 0 in X.Y.Z)
_fv_parts = fix_version.split(".")
_is_patch_release = len(_fv_parts) == 3 and _fv_parts[2].isdigit() and int(_fv_parts[2]) > 0

if _is_patch_release:
    # For patches, show non-main-table issues that are stakeholder-relevant.
    # Exclude purely-infra prefixes (package bumps, internal plumbing, research)
    # but keep "tweak:", "fix:" etc. which may contain onboarding / UX changes.
    _PATCH_INFRA_PREFIXES = (
        "bump ",
        "internal:",
        "experiments status",
        "unskip",
        "chore:",
        "refactor:",
        "remove unused",
        "remove per-",
        "[research]",
        "research:",
        "research -",
    )
    _main_keys = {i["key"] for i in main_issues}
    internal_issues = [
        i for i in raw_issues
        if i["key"] not in _main_keys
        and EXCLUDE_LABEL not in (i.get("fields", {}).get("labels") or [])
        and not any(kw.lower() in (i.get("fields", {}).get("summary") or "").lower()
                    for kw in ALWAYS_EXCLUDE_KEYWORDS)
        and not any((i.get("fields", {}).get("summary") or "").lower().strip().startswith(p)
                    for p in _PATCH_INFRA_PREFIXES)
    ]
else:
    internal_issues = [i for i in raw_issues
                       if is_internal_stakeholder(i.get("fields", {}).get("summary", ""),
                                                  i.get("fields", {}).get("labels", []))]
print(f"  {len(main_issues)} user-facing, {len(internal_issues)} internal", file=sys.stderr)

# For patch releases, fetch all Bug/Editor Bug/Security Fix issues for the "Bugs Fixed" section.
bug_issues = []
if _is_patch_release:
    _bug_jql = (
        f'project = {JIRA_PROJECT} AND ({version_filter}) '
        f'AND issuetype in (Bug, "Editor Bug", "Security Fix") '
        f'ORDER BY updated DESC'
    )
    bug_issues = jira_search(_bug_jql, ISSUE_FIELDS)
    print(f"  {len(bug_issues)} bugs for patch release", file=sys.stderr)

    # Bugs starting with "[V4]" are atomic-editor-internal — move to Internal Changes.
    # "Fix [V4]: ..." summaries are user-facing bug fixes for V4 features, keep in Bugs Fixed.
    _V4_BUG_RE = re.compile(r'^\[?V4\]', re.IGNORECASE)
    _v4_bugs    = [i for i in bug_issues
                   if _V4_BUG_RE.search((i.get("fields", {}).get("summary") or ""))]
    bug_issues  = [i for i in bug_issues
                   if not _V4_BUG_RE.search((i.get("fields", {}).get("summary") or ""))]
    internal_issues = internal_issues + _v4_bugs
    if _v4_bugs:
        print(f"  {len(_v4_bugs)} [V4] bugs moved to Internal Changes", file=sys.stderr)

    # Bugs matching EXCLUDE_KEYWORDS are promotional/internal — move to Internal Changes.
    # Bugs matching ALWAYS_EXCLUDE_KEYWORDS are dropped entirely (never shown anywhere).
    def _bug_summary(i):
        return (i.get("fields", {}).get("summary") or "").lower()
    _promo_bugs = [i for i in bug_issues
                   if any(kw.lower() in _bug_summary(i) for kw in EXCLUDE_KEYWORDS)
                   and not any(kw.lower() in _bug_summary(i) for kw in ALWAYS_EXCLUDE_KEYWORDS)]
    _drop_bugs  = [i for i in bug_issues
                   if any(kw.lower() in _bug_summary(i) for kw in ALWAYS_EXCLUDE_KEYWORDS)]
    bug_issues      = [i for i in bug_issues if i not in _promo_bugs and i not in _drop_bugs]
    internal_issues = internal_issues + _promo_bugs
    if _promo_bugs:
        print(f"  {len(_promo_bugs)} promotional/internal bugs moved to Internal Changes", file=sys.stderr)
    if _drop_bugs:
        print(f"  {len(_drop_bugs)} bugs dropped (always-exclude keywords)", file=sys.stderr)

# Build parent→children map from all raw issues (used to check Epic progress)
_raw_children_by_parent = {}
for _i in raw_issues:
    _pk = (_i.get("fields", {}).get("parent") or {}).get("key", "")
    if _pk:
        _raw_children_by_parent.setdefault(_pk, []).append(_i)

# For internal Epics with no children in the version query, fetch their children
# separately (regardless of fixVersion) so we can show what specifically changed.
_CHILD_EXTRA_FIELDS = ["summary", "status", "issuetype", "description", "customfield_19347"]
for _issue in internal_issues:
    _f    = _issue.get("fields", {})
    _key  = _issue["key"]
    _type = (_f.get("issuetype") or {}).get("name", "")
    if _type == "Epic" and not _raw_children_by_parent.get(_key):
        try:
            _extra = jira_search(
                f'project={JIRA_PROJECT} AND parent={_key} ORDER BY updated DESC',
                _CHILD_EXTRA_FIELDS, max_results=10
            )
            if _extra:
                _raw_children_by_parent[_key] = _extra
            time.sleep(0.2)
        except Exception:
            pass


# ── Step 5: Parse PR body → extract summary bullets ──────────────────────────
def extract_pr_summary(body):
    if not body:
        return ""
    m = re.search(r'##\s*Summary\s*\n(.*?)(?=\n##|\Z)', body, re.DOTALL | re.IGNORECASE)
    if not m:
        return ""
    summary_block = m.group(1).strip()
    bullets = re.findall(r'^[-*]\s+(.+)', summary_block, re.MULTILINE)
    if bullets:
        return " ".join(b.strip() for b in bullets[:3])
    return summary_block[:200]

pr_description = extract_pr_summary(PR_BODY) or issue_summary


# ── Step 6: Build the issue table data ───────────────────────────────────────
rows = {}
for issue in main_issues:
    f       = issue.get("fields", {})
    key     = issue["key"]
    summary = (f.get("summary") or "").strip()
    itype   = (f.get("issuetype") or {}).get("name", "")
    status  = (f.get("status") or {}).get("name", "")
    labels     = f.get("labels") or []
    fv_names   = [v["name"] for v in (f.get("fixVersions") or [])]
    parent     = (f.get("parent") or {}).get("key", "")
    owner      = (f.get("customfield_10127") or {}).get("displayName", "")
    teams      = [t["value"] for t in (f.get("customfield_10459") or [])]

    jira_desc  = extract_adf_text(f.get("description"))
    rovo_paras = extract_adf_paragraphs(f.get("customfield_19347"))
    if rovo_paras:
        feature_text = rovo_paras[0]
        desc_text    = " ".join(rovo_paras[1:]) if len(rovo_paras) > 1 else jira_desc
    else:
        feature_text = summary
        desc_text    = jira_desc
    figma, video, has_pr, conf_url = get_remote_links(key)
    time.sleep(0.2)

    rows[key] = {
        "key":            key,
        "feature":        feature_text,
        "description":    desc_text,
        "version":        fix_version,
        "tier":           get_tier(fv_names),
        "topic":          get_topic(summary),
        "status":         status_icon(status),
        "type":           itype,
        "jira_url":       f"{JIRA_BASE}/browse/{key}",
        "parent":         parent,
        "figma_url":      figma,
        "video_url":      video,
        "has_pr":         has_pr,
        "confluence_url": conf_url,
        "team":           ", ".join(teams),
        "owner":          owner,
        "has_rovo_desc":  bool(rovo_paras),
    }

# Enrich the merged PR's ticket with PR summary bullets
if ticket in rows:
    if pr_description:
        rows[ticket]["description"] = pr_description
elif not is_excluded(issue_summary, fields.get("labels", [])):
    # Only force-add the anchor ticket if it isn't excluded (e.g. promotional or
    # internal-only). Excluded anchor tickets are silently dropped — the run still
    # updates the page but the ticket itself doesn't appear in Release Content.
    t_fv_names = [v["name"] for v in (fields.get("fixVersions") or [])]
    t_owner    = (fields.get("customfield_10127") or {}).get("displayName", "")
    t_teams    = [t["value"] for t in (fields.get("customfield_10459") or [])]
    t_rovo_paras = extract_adf_paragraphs(fields.get("customfield_19347"))
    if t_rovo_paras:
        t_feat = t_rovo_paras[0]
        t_desc = " ".join(t_rovo_paras[1:]) if len(t_rovo_paras) > 1 else (pr_description or extract_adf_text(fields.get("description")))
    else:
        t_feat = issue_summary
        t_desc = pr_description or extract_adf_text(fields.get("description"))
    figma, video, _has_pr, conf_url = get_remote_links(ticket)
    rows[ticket] = {
        "key":            ticket,
        "feature":        t_feat,
        "description":    t_desc,
        "version":        fix_version,
        "tier":           get_tier(t_fv_names),
        "topic":          get_topic(issue_summary),
        "status":         status_icon(status_name),
        "type":           issue_type,
        "jira_url":       f"{JIRA_BASE}/browse/{ticket}",
        "parent":         (fields.get("parent") or {}).get("key", ""),
        "figma_url":      figma,
        "video_url":      video,
        "has_pr":         True,  # this ticket triggered the run, so a PR definitely exists
        "confluence_url": conf_url,
        "team":           ", ".join(t_teams),
        "owner":          t_owner,
    }

# Drop "To Do" issues that have no linked GitHub PR (not yet started)
rows = {key: r for key, r in rows.items()
        if not ("to do" in r["status"].lower() and not r["has_pr"])}

# Mark children of Epics in the list; they'll be shown indented under their parent
epic_keys = {key for key, r in rows.items() if r["type"] == "Epic"}
for r in rows.values():
    r["is_child"] = r["type"] in {"Story", "Task"} and r["parent"] in epic_keys
    if r["is_child"] and r["parent"] in rows:
        r["topic"] = rows[r["parent"]]["topic"]  # inherit parent's topic group

# Sort by topic order, then by status, then key
topic_order = [name for _, name, _hex, _cn in TOPIC_RULES] + [TOPIC_DEFAULT]

def status_sort_key(status_str):
    s = (status_str or "").lower()
    if "done" in s:     return 0
    if "progress" in s: return 1
    return 2  # To Do / other

def topic_sort_key(r):
    try:    ti = topic_order.index(r["topic"])
    except: ti = len(topic_order)
    return (ti, status_sort_key(r["status"]), r["key"])

top_level = [r for r in rows.values() if not r["is_child"]]
top_level.sort(key=topic_sort_key)

sorted_rows = []
for r in top_level:
    sorted_rows.append(r)
    if r["type"] == "Epic":
        children = [c for c in rows.values()
                    if c["is_child"] and c["parent"] == r["key"]
                    and c.get("has_rovo_desc")
                    and not is_child_technical(c["feature"])]
        children.sort(key=lambda c: (status_sort_key(c["status"]), c["key"]))
        sorted_rows.extend(children)


# ── Step 7: Build Confluence storage format (HTML table) ─────────────────────
def escape(s):
    return (s or "").replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")

NUM_COLS = 7  # Feature+Status | Desc | Tier | Team/Owner | Jira | Video | Figma

COLGROUP = """\
  <colgroup>
    <col style="width: 175px;" />
    <col style="width: 260px;" />
    <col style="width: 65px;" />
    <col style="width: 130px;" />
    <col style="width: 100px;" />
    <col style="width: 135px;" />
    <col style="width: 135px;" />
  </colgroup>"""

THEAD = """\
    <tr>
      <th><p><strong>Feature</strong></p></th>
      <th><p><strong>Description</strong></p></th>
      <th><p><strong>Plugin</strong></p></th>
      <th><p><strong>Team / Owner</strong></p></th>
      <th><p><strong>Epic</strong></p></th>
      <th><p><strong>Demo Video</strong></p></th>
      <th><p><strong>Spec / Figma</strong></p></th>
    </tr>"""



def _is_active_status(status_name):
    """Return True for In Progress, In Review, Testing, Done, Closed."""
    s = (status_name or "").lower()
    return any(kw in s for kw in ("in progress", "in review", "testing", "done", "closed"))


def _issue_rdd(fields):
    """Return (title, description) from RDD field, or (None, None) if empty.
    Line 1 = user-facing title, Line 2 = value sentence."""
    rovo = extract_adf_paragraphs(fields.get("customfield_19347"))
    if not rovo:
        return None, None
    title = rovo[0] if len(rovo) >= 1 else None
    desc  = rovo[1] if len(rovo) >= 2 else None
    return title, desc


def _issue_description(fields):
    """Return the best available plain-text description for an issue (RDD line 2 → Jira desc → "")."""
    _, desc = _issue_rdd(fields)
    if desc:
        return desc
    return extract_adf_text(fields.get("description"), max_chars=300)


_BUG_PREFIX_RE = re.compile(
    r'^(Fix\s+\[V4\]:?|Fix:|Bug:|Editor Bug:|Issue:|Error:|\[V4\]|v4\.?x?:?)\s*',
    re.IGNORECASE,
)


def build_bugs_section(issues):
    """Build a 'Bugs Fixed' table for patch releases — shows all Bug/Editor Bug/Security Fix issues."""
    if not issues:
        return ""
    rows_html = ""
    for issue in issues:
        f          = issue.get("fields", {})
        key        = issue["key"]
        summary    = (f.get("summary") or "").strip()
        status_raw = (f.get("status") or {}).get("name", "")
        jira_url   = f"{JIRA_BASE}/browse/{key}"
        clean      = _BUG_PREFIX_RE.sub("", summary).strip() or summary
        stat       = escape(status_icon(status_raw))
        rows_html += f"""
    <tr>
      <td><p><a href="{jira_url}">{escape(key)}</a></p></td>
      <td><p>{escape(clean)}</p></td>
      <td><p>{stat}</p></td>
    </tr>"""
    if not rows_html:
        return ""
    return f"""
<p>&nbsp;</p>
<h2>Bugs Fixed</h2>
<table data-table-width="1000" data-layout="full-width">
  <colgroup>
    <col style="width: 100px;" />
    <col style="width: 680px;" />
    <col style="width: 120px;" />
  </colgroup>
  <tbody>
    <tr>
      <th><p><strong>Ticket</strong></p></th>
      <th><p><strong>Bug</strong></p></th>
      <th><p><strong>Status</strong></p></th>
    </tr>
{rows_html}
  </tbody>
</table>
"""


def build_internal_section(issues, require_active=True):
    """Build a simple HTML table for internal-only issues (below the main table).
    Epics are flattened: each active child appears as its own row, with the Epic
    name shown as italic context. When require_active=False (patch releases), all
    issues in the fixVersion are shown regardless of status."""
    if not issues:
        return ""
    rows_html = ""
    for issue in issues:
        f          = issue.get("fields", {})
        key        = issue["key"]
        itype      = (f.get("issuetype") or {}).get("name", "")
        status_raw = (f.get("status") or {}).get("name", "")

        if require_active and not _is_active_status(status_raw):
            continue

        if itype == "Epic":
            epic_summary = (f.get("summary") or "").strip()
            epic_url     = f"{JIRA_BASE}/browse/{key}"

            # Gate: only include if at least one Story/Task child is active.
            # (If no typed children found, trust the Epic's own status.)
            # When require_active=False (patch releases), skip the gate entirely.
            if require_active:
                story_task_children = [
                    c for c in _raw_children_by_parent.get(key, [])
                    if (c.get("fields", {}).get("issuetype") or {}).get("name", "") in ("Story", "Task")
                ]
                if story_task_children:
                    child_active = any(
                        _is_active_status((c.get("fields", {}).get("status") or {}).get("name", ""))
                        for c in story_task_children
                    )
                    if not child_active:
                        continue

            if require_active:
                active_children = [
                    c for c in _raw_children_by_parent.get(key, [])
                    if _is_active_status((c.get("fields", {}).get("status") or {}).get("name", ""))
                ]
            else:
                active_children = _raw_children_by_parent.get(key, [])

            # If no active children found, fall back to ALL children so we still
            # flatten rather than collapsing to the Epic row.
            display_children = active_children or _raw_children_by_parent.get(key, [])

            if display_children:
                # Flatten: one row per child, Epic name shown as italic context
                for child in display_children[:6]:
                    cf          = child.get("fields", {})
                    c_key       = child["key"]
                    c_stat_raw  = (cf.get("status") or {}).get("name", "")
                    c_url       = f"{JIRA_BASE}/browse/{c_key}"
                    c_stat      = escape(status_icon(c_stat_raw))
                    rdd_title, rdd_desc = _issue_rdd(cf)
                    c_title     = escape(rdd_title or (cf.get("summary") or "").strip())
                    desc        = rdd_desc or extract_adf_text(cf.get("description"), max_chars=300)
                    desc_html   = f'<p>{escape(desc)}</p>' if desc else ""
                    context     = f'<p><em>Part of: <a href="{epic_url}">{escape(key)}</a> — {escape(epic_summary)}</em></p>'
                    rows_html += f"""
    <tr>
      <td><p><a href="{c_url}">{escape(c_key)}</a></p></td>
      <td><p><strong>{c_title}</strong></p>{desc_html}{context}</td>
      <td><p>{c_stat}</p></td>
    </tr>"""
            else:
                # Truly no children at all — show the Epic itself
                desc     = _issue_description(f)
                desc_html = f'<p>{escape(desc)}</p>' if desc else ""
                epic_stat = escape(status_icon(status_raw))
                rows_html += f"""
    <tr>
      <td><p><a href="{epic_url}">{escape(key)}</a></p></td>
      <td><p><strong>{escape(epic_summary)}</strong></p>{desc_html}</td>
      <td><p>{epic_stat}</p></td>
    </tr>"""
        else:
            # Story / Task — show directly, no type label
            summary  = escape((f.get("summary") or "").strip())
            stat     = escape(status_icon(status_raw))
            jira_url = f"{JIRA_BASE}/browse/{key}"
            desc     = _issue_description(f)
            desc_html = f'<p>{escape(desc)}</p>' if desc else ""
            rows_html += f"""
    <tr>
      <td><p><a href="{jira_url}">{escape(key)}</a></p></td>
      <td><p><strong>{summary}</strong></p>{desc_html}</td>
      <td><p>{stat}</p></td>
    </tr>"""
    if not rows_html:
        return ""  # all issues filtered out by status/Epic rules
    return f"""
<p>&nbsp;</p>
<h2>Internal Changes</h2>
<p><em>Internal product changes — not user-facing, but worth knowing.</em></p>
<table data-table-width="1000" data-layout="full-width">
  <colgroup>
    <col style="width: 100px;" />
    <col style="width: 680px;" />
    <col style="width: 120px;" />
  </colgroup>
  <tbody>
    <tr>
      <th><p><strong>Ticket</strong></p></th>
      <th><p><strong>What Changed</strong></p></th>
      <th><p><strong>Status</strong></p></th>
    </tr>
{rows_html}
  </tbody>
</table>
"""


def _get_release_date(versions):
    """Return the GA release date (YYYY-MM-DD) from Jira version objects, or empty string."""
    gas = [v for v in versions if "beta" not in v.get("name", "").lower()]
    for v in gas:
        rd = v.get("releaseDate", "")
        if rd:
            return rd
    return ""


def _get_beta_date(versions):
    """Return the earliest beta releaseDate (YYYY-MM-DD) from Jira versions, or ''."""
    betas = sorted(
        [v for v in versions if "beta" in v.get("name", "").lower()],
        key=lambda x: x.get("name", "")
    )
    for v in betas:
        rd = v.get("releaseDate", "")
        if rd:
            return rd
    return ""


def _format_jira_date(date_str):
    """Convert YYYY-MM-DD to 'Jul 14, 2026', or 'TBD' if empty."""
    if not date_str:
        return "TBD"
    try:
        import datetime as _dt
        d = _dt.datetime.strptime(date_str, "%Y-%m-%d")
        return f"{d.strftime('%b')} {d.day}, {d.year}"
    except ValueError:
        return date_str


# Build release info line from Jira version data — updated on every run so the
# page reflects the actual dates once the version is released in Jira.
_ga_date   = _get_release_date(matching_versions)
_beta_date = _get_beta_date(matching_versions)
if _is_patch_release:
    _release_info_line = (
        f'<p><strong>Release Date:</strong> {_format_jira_date(_ga_date)}</p>\n'
    )
else:
    _release_info_line = (
        f'<p><strong>Beta:</strong> {_format_jira_date(_beta_date)}'
        f' &nbsp;&nbsp;|&nbsp;&nbsp; '
        f'<strong>GA:</strong> {_format_jira_date(_ga_date)}</p>\n'
    )

# Regex that matches either the old Beta/GA line or a Release Date line
_RELEASE_INFO_RE = re.compile(
    r'<p>\s*<strong>(?:Beta|Release Date):</strong>.*?</p>',
    re.IGNORECASE | re.DOTALL,
)


def _parse_changelog_to_html(text, tier_filter=None):
    """Convert generate-changelog.py stdout into Confluence code blocks, one per tier.
    tier_filter: 'Free', 'Pro', or None (show all)."""
    if not text:
        return ""

    # Split into (title, raw_block) pairs
    sections = []
    current_title = None
    current_lines = []
    for line in text.splitlines():
        s = line.strip()
        if re.match(r'^= .+ =$', s):           # Free: = X.Y.Z - DATE =
            if current_title is not None:
                sections.append((current_title, "\n".join(current_lines)))
            current_title = "Free"
            current_lines = [s]
        elif s.startswith("#### "):              # Pro: #### X.Y.Z - DATE
            if current_title is not None:
                sections.append((current_title, "\n".join(current_lines)))
            current_title = "Pro"
            current_lines = [s]
        elif current_title is not None:
            current_lines.append(s)
    if current_title is not None and current_lines:
        sections.append((current_title, "\n".join(current_lines)))

    # Filter to only the relevant tier(s)
    if tier_filter and tier_filter != "Free + Pro":
        sections = [(t, b) for t, b in sections if t == tier_filter]

    if not sections:
        return ""

    html = "\n<p>&nbsp;</p>\n<h2>Changelog</h2>\n<p><em>Changelog entries for this release.</em></p>\n"
    for title, block in sections:
        safe = block.rstrip().replace("]]>", "]]]]><![CDATA[>")
        code_macro = (
            '<ac:structured-macro ac:name="code">'
            '<ac:parameter ac:name="language">text</ac:parameter>'
            f"<ac:plain-text-body><![CDATA[{safe}]]></ac:plain-text-body>"
            "</ac:structured-macro>"
        )
        # Wrap in a full-width table so the code block spans the full page width
        html += (
            f"<h3>{escape(title)}</h3>\n"
            '<table data-layout="full-width" data-table-width="1500"><tbody><tr>'
            f"<td>{code_macro}</td>"
            "</tr></tbody></table>\n"
        )
    return html


def build_changelog_section(versions, tier=None):
    """Run generate-changelog.py as a subprocess and return Confluence HTML.
    Only called when phase == 'released'. Returns empty string on any failure."""
    import subprocess
    script_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "generate-changelog.py")
    if not os.path.exists(script_path):
        print("  generate-changelog.py not found — skipping changelog section.", file=sys.stderr)
        return ""

    run_env = {**os.environ}
    release_date = _get_release_date(versions)
    if release_date:
        run_env["RELEASE_DATE"] = release_date
    # has_rdd gate (Rovo ran on the issue) is the quality filter here —
    # skip the GitHub PR link check which is unreliable in Jira remote links
    run_env["SKIP_PR_CHECK"] = "1"

    try:
        result = subprocess.run(
            [sys.executable, script_path],
            capture_output=True, text=True, timeout=300, env=run_env,
        )
        if result.returncode != 0:
            print(f"  Changelog script exited {result.returncode}: {result.stderr[:300]}", file=sys.stderr)
        stdout = result.stdout.strip()
        if not stdout:
            print("  Changelog generator returned no output.", file=sys.stderr)
            return ""
        print(f"  Changelog: {len(stdout.splitlines())} lines", file=sys.stderr)
        return _parse_changelog_to_html(stdout, tier_filter=tier)
    except Exception as e:
        print(f"  Changelog generator error: {e}", file=sys.stderr)
        return ""


def build_auto_section(version, rows_list, internal_issues=None, changelog_html=None, bug_issues=None):
    # Group rows by topic (preserving order)
    topics = {}
    for r in rows_list:
        topics.setdefault(r["topic"], []).append(r)

    _toc_macro = (
        '<ac:structured-macro ac:name="toc" ac:schema-version="1">'
        '<ac:parameter ac:name="minLevel">2</ac:parameter>'
        '</ac:structured-macro>'
    )
    html = f"""\
<p>&nbsp;</p>
<hr/>
<p>&nbsp;</p>
{_toc_macro}
<p>&nbsp;</p>
<hr/>
<p>&nbsp;</p>
"""

    if topics:
        html += "<h2>Release Content</h2>\n"

    for topic_name, topic_rows in topics.items():
        color_hex, color_name = get_topic_color(topic_name)

        # Pre-compute rowspan for Epic feature cells (1 + number of visible children)
        feat_rowspan = {}
        i = 0
        while i < len(topic_rows):
            r = topic_rows[i]
            if r["type"] == "Epic":
                j = i + 1
                while (j < len(topic_rows)
                       and topic_rows[j].get("is_child")
                       and topic_rows[j]["parent"] == r["key"]):
                    j += 1
                feat_rowspan[r["key"]] = j - i
            i += 1

        rows_html = ""
        for r in topic_rows:
            is_child  = r.get("is_child", False)
            feat      = escape(r["feature"])
            desc      = escape(r["description"])
            tier      = escape(r["tier"])
            ver       = escape(r["version"])
            stat      = escape(r["status"])
            key       = escape(r["key"])
            jira_url  = r["jira_url"]
            figma_url      = r.get("figma_url", "")
            video_url      = r.get("video_url", "")
            confluence_url = r.get("confluence_url", "")
            team      = escape(r.get("team", ""))
            owner     = escape(r.get("owner", ""))

            team_items  = f'<li>{team}</li>' if team else ""
            owner_items = f'<li>{owner}</li>' if owner else ""
            team_owner_cell = f'<ul>{team_items}{owner_items}</ul>' if (team or owner) else ""
            spec_parts = []
            if figma_url:
                spec_parts.append(f'<a href="{figma_url}" target="_blank">Figma</a>')
            if confluence_url:
                spec_parts.append(f'<a href="{confluence_url}" target="_blank">Confluence</a>')
            figma_cell = "<p>" + " | ".join(spec_parts) + "</p>" if spec_parts else ""
            video_cell = f'<p><a href="{video_url}">Video</a></p>' if video_url else ""

            jira_cell = f'<p><a href="{jira_url}">{key}</a></p><hr/><p>{stat}</p>'

            if is_child:
                # Feature cell omitted — parent Epic cell uses rowspan
                feat_td   = ""
                desc_cell = f'<p><strong>{feat}</strong></p>' + (f'<p>{desc}</p>' if desc else "")
            else:
                rs = feat_rowspan.get(r["key"], 1)
                rowspan_attr = f' rowspan="{rs}"' if rs > 1 else ""
                feat_td   = f'<td{rowspan_attr}><p>{feat}</p></td>'
                desc_cell = f'<p><em>See child tasks for details.</em></p>' if rs > 1 else f'<p>{desc}</p>'

            rows_html += f"""
    <tr>
      {feat_td}
      <td>{desc_cell}</td>
      <td><p>{tier}</p></td>
      <td>{team_owner_cell}</td>
      <td>{jira_cell}</td>
      <td>{video_cell}</td>
      <td>{figma_cell}</td>
    </tr>"""

        html += f"""
<table data-table-width="1500" data-layout="full-width">
{COLGROUP}
  <tbody>
    <tr>
      <td colspan="{NUM_COLS}" data-highlight-colour="{color_hex}" colorname="{color_name}">
        <p><strong>{escape(topic_name)}</strong></p>
      </td>
    </tr>
{THEAD}
{rows_html}
  </tbody>
</table>
"""

    if bug_issues:
        html += build_bugs_section(bug_issues)

    if internal_issues:
        html += build_internal_section(internal_issues, require_active=not _is_patch_release)

    if changelog_html:
        html += changelog_html

    html += '<p>&nbsp;</p>\n'
    html += f'<p><em>Last updated by release-doc script — PR <a href="{PR_URL}">#{PR_NUMBER}</a></em></p>\n'
    html += '<p>&nbsp;</p>\n<hr/>\n<p>&nbsp;</p>\n'
    return html


# ── Step 8: Find or create the Confluence page ────────────────────────────────
_test_run      = os.environ.get("TEST_RUN") == "1"
_tier_label    = get_tier(fix_versions).replace(" + ", " & ")  # use anchor ticket's own fixVersions for tier
_tier_suffix   = f" - {_tier_label}" if _tier_label else ""
_title_suffix  = " [Test]" if _test_run else ""
page_title     = f"Version {fix_version}{_tier_suffix}{_title_suffix}"
page_title_old = f"\U0001f6a7 Version {fix_version} [WIP]"              # legacy title format
page_title_old2 = f"Version {fix_version}{_title_suffix}"               # old format without tier suffix

# Versions that should never be touched by the script (manually maintained pages).
_SKIP_VERSIONS = {"4.2.0"}
if fix_version in _SKIP_VERSIONS:
    print(f"Version {fix_version} is manually maintained — skipping.", file=sys.stderr)
    sys.exit(0)

# In TEST_RUN mode only search the test title — never touch the real page.
# Also search old title formats so existing pages are found and renamed.
_title_candidates = [page_title] if _test_run else [page_title, page_title_old2, page_title_old]
existing = []
try:
    for title_candidate in _title_candidates:
        search_params = urllib.parse.urlencode({
            "title":    title_candidate,
            "spaceKey": CONF_SPACE,
            "expand":   "version,body.storage",
        })
        result = conf_get(f"/rest/api/content?{search_params}")
        if result.get("results"):
            existing = result["results"]
            break
except Exception as e:
    print(f"Confluence search failed: {e}", file=sys.stderr)
    sys.exit(1)

# Generate changelog section (always — only merged PRs appear, via has_pr gate)
print("Generating changelog section...", file=sys.stderr)
_changelog_html = build_changelog_section(matching_versions, tier=_anchor_tier)

auto_section = build_auto_section(fix_version, sorted_rows, internal_issues, changelog_html=_changelog_html, bug_issues=bug_issues)

def assemble_page(top, auto, bottom):
    return top + BOT_START_MARKER + auto + BOT_END_MARKER + bottom

if existing:
    page_id      = existing[0]["id"]
    page_version = existing[0]["version"]["number"]
    current_body = existing[0].get("body", {}).get("storage", {}).get("value", "")

    # Extract the manually-editable Release Info section.
    # Support migration from old BOT:STATUS format.
    BOT_STATUS_END_LEGACY = "<!-- BOT:STATUS:END -->"
    status_end_idx = current_body.find(BOT_STATUS_END_LEGACY)
    start_idx      = current_body.find(BOT_START_MARKER)
    if status_end_idx != -1:
        top_section = current_body[status_end_idx + len(BOT_STATUS_END_LEGACY):start_idx] if start_idx != -1 else DEFAULT_TOP_SECTION
    else:
        top_section = current_body[:start_idx] if start_idx != -1 else DEFAULT_TOP_SECTION

    end_idx = current_body.find(BOT_END_MARKER)
    bottom_section = current_body[end_idx + len(BOT_END_MARKER):] if end_idx != -1 else DEFAULT_BOTTOM_SECTION

    # ── Migrate old content ────────────────────────────────────────────────────
    top_section = re.sub(r'\s*<p><em>Edit this section freely[^<]*</em></p>', '', top_section)
    top_section = re.sub(r'\s*<p><strong>Document status:</strong>.*?</p>', '', top_section)
    if not top_section.lstrip().startswith('<p>&nbsp;</p>'):
        top_section = '<p>&nbsp;</p>\n' + top_section.lstrip()
    # ── Inject/update auto-note above Release Info ────────────────────────────
    _AUTO_NOTE_HTML = '<p><em>This page is managed automatically. Do not edit manually.</em></p>\n'
    _AUTO_NOTE_RE = re.compile(r'<p><em>This (?:section is auto-updated|page is managed automatically)[^<]*</em></p>\s*\n?')
    top_section = _AUTO_NOTE_RE.sub('', top_section)
    if '<h2>Release Info</h2>' in top_section:
        top_section = top_section.replace('<h2>Release Info</h2>', _AUTO_NOTE_HTML + '<h2>Release Info</h2>', 1)
    bottom_section = re.sub(r'^\s*<hr\s*/?>\s*(<p>&nbsp;</p>\s*)?', '', bottom_section)
    if not bottom_section.lstrip().startswith('<p>&nbsp;</p>'):
        bottom_section = '<p>&nbsp;</p>\n' + bottom_section.lstrip()
    # ── Update release dates from Jira on every run ───────────────────────────
    # Replaces Beta/GA or Release Date line so the page reflects the actual
    # Jira release date once the version is marked released there.
    if _RELEASE_INFO_RE.search(top_section):
        top_section = _RELEASE_INFO_RE.sub(_release_info_line.strip(), top_section, count=1)
    elif '<h2>Release Info</h2>' in top_section:
        top_section = top_section.replace(
            '<h2>Release Info</h2>',
            '<h2>Release Info</h2>\n' + _release_info_line,
            1,
        )
    # ── Inject Jira version links if not already present ──────────────────────
    if _version_links_line and 'href' not in top_section:
        top_section = top_section.rstrip() + '\n' + _version_links_line
    # ──────────────────────────────────────────────────────────────────────────

    page_state = phase_to_page_state(phase)
    page_body  = assemble_page(top_section, auto_section, bottom_section)
    print(f"Updating existing page id={page_id} v{page_version}", file=sys.stderr)

    status, resp = conf_request("PUT", f"/rest/api/content/{page_id}", {
        "version": {"number": page_version + 1},
        "title":   page_title,
        "type":    "page",
        "body":    {"storage": {"value": page_body, "representation": "storage"}},
    })
    if status in (200, 204):
        print(f"✅ Updated: https://elementor.atlassian.net/wiki/spaces/{CONF_SPACE}/pages/{page_id}", file=sys.stderr)
        conf_set_page_status(page_id, page_state)
    else:
        print(f"❌ Update failed (status {status})", file=sys.stderr)
        sys.exit(1)

else:
    page_state   = phase_to_page_state(phase)
    _new_top     = ('<p>&nbsp;</p>\n'
                    '<p><em>This page is managed automatically. Do not edit manually.</em></p>\n'
                    '<h2>Release Info</h2>\n'
                    + _release_info_line + _version_links_line)
    page_body    = assemble_page(_new_top, auto_section, DEFAULT_BOTTOM_SECTION)
    print(f"Creating new page: {page_title}", file=sys.stderr)
    status, resp = conf_request("POST", "/rest/api/content", {
        "title":     page_title,
        "type":      "page",
        "space":     {"key": CONF_SPACE},
        "ancestors": [{"id": CONF_PARENT}],
        "body":      {"storage": {"value": page_body, "representation": "storage"}},
    })
    if status in (200, 201):
        new_id = resp.get("id", "?")
        print(f"✅ Created: https://elementor.atlassian.net/wiki/spaces/{CONF_SPACE}/pages/{new_id}", file=sys.stderr)
        conf_set_page_status(new_id, page_state)
    else:
        print(f"❌ Create failed (status {status})", file=sys.stderr)
        sys.exit(1)
