#!/usr/bin/env python3
"""
Scan-all-versions runner.
Queries Jira for all unreleased versions in the project, extracts unique base
version numbers (e.g. 4.3.0, 4.1.5), and runs update-release-doc.py once per
version via subprocess with FIXED_VERSION set.

Used by the scheduled GitHub Actions workflow on the fork (twice daily).
The PR-triggered flow still calls update-release-doc.py directly.
"""
import base64
import os
import re
import subprocess
import sys
import urllib.request
import json

JIRA_BASE   = os.environ["JIRA_BASE_URL"].rstrip("/")
JIRA_EMAIL  = os.environ["JIRA_EMAIL"]
JIRA_TOKEN  = os.environ["JIRA_API_TOKEN"]
JIRA_PROJECT = os.environ.get("JIRA_PROJECT", "ED")

JIRA_AUTH = base64.b64encode(f"{JIRA_EMAIL}:{JIRA_TOKEN}".encode()).decode()
HEADERS = {
    "Authorization": f"Basic {JIRA_AUTH}",
    "Accept": "application/json",
}

_SKIP_VERSIONS = {"4.2.0"}
_VERSION_RE = re.compile(r'(\d+\.\d+\.\d+)')

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
MAIN_SCRIPT = os.path.join(SCRIPT_DIR, "update-release-doc.py")


def jira_get(path):
    url = JIRA_BASE + path
    req = urllib.request.Request(url, headers=HEADERS)
    with urllib.request.urlopen(req) as resp:
        return json.loads(resp.read())


def extract_version_number(name):
    m = _VERSION_RE.search(name or "")
    return m.group(1) if m else None


def get_active_versions():
    """Return sorted list of unique unreleased base version numbers."""
    all_versions = jira_get(f"/rest/api/3/project/{JIRA_PROJECT}/versions")
    seen = set()
    active = []
    for v in all_versions:
        if v.get("released"):
            continue
        base = extract_version_number(v.get("name", ""))
        if not base or base in seen or base in _SKIP_VERSIONS:
            continue
        seen.add(base)
        active.append(base)
    # Sort ascending so patches come before majors
    active.sort(key=lambda s: tuple(int(x) for x in s.split(".")))
    return active


def main():
    versions = get_active_versions()
    if not versions:
        print("No active unreleased versions found — nothing to do.", file=sys.stderr)
        sys.exit(0)

    print(f"Active versions to process: {versions}", file=sys.stderr)
    failed = []

    for version in versions:
        print(f"\n{'='*60}", file=sys.stderr)
        print(f"Processing version {version}", file=sys.stderr)
        print(f"{'='*60}", file=sys.stderr)

        env = os.environ.copy()
        env["FIXED_VERSION"] = version
        env.pop("PR_TITLE", None)
        env.pop("PR_BODY", None)
        env.pop("PR_URL", None)
        env.pop("PR_NUMBER", None)

        result = subprocess.run(
            [sys.executable, MAIN_SCRIPT],
            env=env,
        )
        if result.returncode != 0:
            print(f"ERROR: version {version} failed with exit code {result.returncode}", file=sys.stderr)
            failed.append(version)

    if failed:
        print(f"\nFailed versions: {failed}", file=sys.stderr)
        sys.exit(1)

    print(f"\nAll {len(versions)} version(s) processed successfully.", file=sys.stderr)


if __name__ == "__main__":
    main()
