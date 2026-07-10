#!/usr/bin/env python3
"""
Release Doc Generator
Triggered on every PR merge to main.

Flow:
  1. Extract [ED-XXXXX] from PR title
  2. Jira: get issue → get fixVersion → skip if none / not major (X.Y.0)
  3. Jira: find ALL version names for that number (free + pro)
  4. Jira: get ALL epics + user-facing stories for those versions
  5. Jira: fetch Figma / video links per issue
  6. Build feature rows grouped by topic (keyword-matched from summary)
  7. Confluence: find or create "Version X.Y.Z" page → regenerate auto section,
     preserving manual top (release dates) and bottom (notes) sections
"""
import datetime
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
]

# Issues tagged with this Jira label are excluded (for one-off per-issue exclusions).
EXCLUDE_LABEL = "release-doc-skip"

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


# ── Page status (derived from Release Info dates) ─────────────────────────────
def _parse_date_from_text(text):
    """Try to parse a date string in common formats. Returns datetime.date or None."""
    text = text.strip()
    for fmt in ("%B %d, %Y", "%b %d, %Y", "%B %d %Y", "%b %d %Y",
                "%m/%d/%Y", "%d/%m/%Y", "%m-%d-%Y", "%Y-%m-%d"):
        try:
            return datetime.datetime.strptime(text, fmt).date()
        except ValueError:
            pass
    return None

# Native Confluence page status IDs (RDDEP space)
_STATE_DRAFT       = {"id": 740786804, "name": "DRAFT",            "color": "#ffc400"}
_STATE_IN_PROGRESS = {"id": 687051862, "name": "In progress",      "color": "#2684ff"}
_STATE_DONE        = {"id": 687051863, "name": "Ready for review",  "color": "#57d9a3"}

def determine_page_state(top_section):
    """
    Parse Beta / GA dates from the Release Info section and return
    the appropriate native Confluence content-state dict.
      - No dates / TBD  → DRAFT
      - Beta date passed → In progress
      - GA date passed   → Ready for review (Done)
    """
    today = datetime.date.today()
    date_re = re.compile(
        r'(\w{3,9}\s+\d{1,2},?\s*\d{4}'   # Jan 15, 2026
        r'|\d{1,2}[/-]\d{1,2}[/-]\d{2,4}' # 01/15/2026  or  15-01-26
        r'|\d{4}-\d{2}-\d{2})'             # 2026-01-15
    )

    def extract_date(label):
        m = re.search(rf'{label}\s*:?\s*([^\|<\n]+)', top_section, re.IGNORECASE)
        if not m:
            return None
        snippet = m.group(1)
        if re.search(r'\btbd\b', snippet, re.IGNORECASE):
            return None
        dm = date_re.search(snippet)
        return _parse_date_from_text(dm.group(1)) if dm else None

    ga_date   = extract_date("GA")
    beta_date = extract_date("Beta")

    if ga_date and today >= ga_date:
        return _STATE_DONE
    if beta_date and today >= beta_date:
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
    """Extract plain text from the first paragraph of Atlassian Document Format."""
    if not adf or not isinstance(adf, dict):
        return ""
    texts = []
    for block in adf.get("content", []):
        if block.get("type") == "paragraph":
            for node in block.get("content", []):
                if node.get("type") == "text":
                    texts.append(node.get("text", ""))
            break
    text = "".join(texts).strip()
    if len(text) > max_chars:
        text = text[:max_chars].rsplit(" ", 1)[0] + "…"
    return text


def extract_adf_paragraphs(adf):
    """Return list of plain-text strings, one per paragraph, from ADF."""
    if not adf or not isinstance(adf, dict):
        return []
    paras = []
    for block in adf.get("content", []):
        if block.get("type") == "paragraph":
            texts = [n.get("text", "") for n in block.get("content", []) if n.get("type") == "text"]
            line  = "".join(texts).strip()
            if line:
                paras.append(line)
    return paras


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


def is_major_version(v):
    num = extract_version_number(v)
    return bool(num) and num.split(".")[2] == "0"


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
    if "done" in name:     return "✅ Done"
    if "progress" in name: return "🔄 In Progress"
    if "review" in name:   return "👀 In Review"
    if "testing" in name:  return "🧪 Testing"
    return name.title()


def is_excluded(summary, labels):
    s = (summary or "").lower().strip()
    if any(s.startswith(p) for p in INTERNAL_PREFIXES):
        return True
    if any(kw.lower() in s for kw in EXCLUDE_KEYWORDS):
        return True
    if EXCLUDE_LABEL in (labels or []):
        return True
    return False


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

major_versions = [v for v in fix_versions if is_major_version(v)]
if not major_versions:
    print(f"{ticket} fixVersions={fix_versions} — no major version (X.Y.0), skipping.", file=sys.stderr)
    sys.exit(0)

fix_version_jira = major_versions[0]
fix_version      = extract_version_number(fix_version_jira)  # clean "4.3.0" for page title
issue_type    = (fields.get("issuetype") or {}).get("name", "")
issue_summary = (fields.get("summary") or "").strip()
status_name   = (fields.get("status") or {}).get("name", "")
print(f"fixVersion: {fix_version}  type: {issue_type}  status: {status_name}", file=sys.stderr)

if issue_type not in USER_FACING_TYPES:
    print(f"Issue type '{issue_type}' is not user-facing — skipping.", file=sys.stderr)
    sys.exit(0)


# ── Step 3: Find ALL Jira versions matching this number (free + pro) ──────────
# e.g. both "v4.3.0 - Beta 1" and "Pro v4.3.0 - Beta 1"
try:
    all_project_versions = jira_get(f"/rest/api/3/project/{JIRA_PROJECT}/versions")
    matching_version_names = [
        v["name"] for v in all_project_versions
        if extract_version_number(v["name"]) == fix_version
    ]
except Exception:
    matching_version_names = [fix_version_jira]

print(f"Querying versions: {matching_version_names}", file=sys.stderr)


# ── Step 4: Get ALL user-facing issues for this version ──────────────────────
version_filter = " OR ".join(f'fixVersion = "{v}"' for v in matching_version_names)
jql = (
    f'project = {JIRA_PROJECT} AND ({version_filter}) '
    f'AND issuetype in (Epic, Story, Task) '
    f'ORDER BY updated DESC'
)
ISSUE_FIELDS = [
    "summary", "status", "issuetype", "parent", "labels", "description",
    "fixVersions",
    "customfield_10127",   # Owner (user)
    "customfield_10459",   # Editor Team (select)
    "customfield_19347",   # Release Doc Description (Rovo-generated)
]
all_issues = jira_search(jql, ISSUE_FIELDS)
all_issues = [i for i in all_issues
              if not is_excluded(i.get("fields", {}).get("summary", ""),
                                 i.get("fields", {}).get("labels", []))]
print(f"Found {len(all_issues)} user-facing issues for {fix_version} (free + pro)", file=sys.stderr)


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
for issue in all_issues:
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
else:
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



def build_auto_section(version, rows_list):
    # Group rows by topic (preserving order)
    topics = {}
    for r in rows_list:
        topics.setdefault(r["topic"], []).append(r)

    html = """\
<p>&nbsp;</p>
<hr/>
<p>&nbsp;</p>
<p><em>Do not edit below — this section is auto-generated.</em></p>
<p>&nbsp;</p>
<h2>Release Content</h2>
"""

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

    html += '<p>&nbsp;</p>\n'
    html += f'<p><em>Last updated by release-doc script — PR <a href="{PR_URL}">#{PR_NUMBER}</a></em></p>\n'
    html += '<p>&nbsp;</p>\n<hr/>\n<p>&nbsp;</p>\n'
    return html


# ── Step 8: Find or create the Confluence page ────────────────────────────────
_test_run      = os.environ.get("TEST_RUN") == "1"
_title_suffix  = " [Test]" if _test_run else ""
page_title     = f"Version {fix_version}{_title_suffix}"
page_title_old = f"\U0001f6a7 Version {fix_version} [WIP]"  # legacy title format (no suffix)

# In TEST_RUN mode only search the test title — never touch the real page
_title_candidates = [page_title] if _test_run else [page_title, page_title_old]
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

auto_section = build_auto_section(fix_version, sorted_rows)

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
    bottom_section = re.sub(r'^\s*<hr\s*/?>\s*(<p>&nbsp;</p>\s*)?', '', bottom_section)
    if not bottom_section.lstrip().startswith('<p>&nbsp;</p>'):
        bottom_section = '<p>&nbsp;</p>\n' + bottom_section.lstrip()
    # ──────────────────────────────────────────────────────────────────────────

    page_state = determine_page_state(top_section)
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
    page_state = determine_page_state(DEFAULT_TOP_SECTION)
    page_body  = assemble_page(DEFAULT_TOP_SECTION, auto_section, DEFAULT_BOTTOM_SECTION)
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
