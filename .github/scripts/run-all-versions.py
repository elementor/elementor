#!/usr/bin/env python3
"""
Scan-all-versions runner.
Queries Jira for all unreleased versions in the project, extracts unique base
version numbers (e.g. 4.3.0, 4.1.5), and runs update-release-doc.py once per
version (or once per tier for patch releases) via subprocess with FIXED_VERSION
and FIXED_TIER set.

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
_MIN_VERSION = (4, 0, 0)  # ignore Jira versions older than this
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
    """Return (sorted list of unique unreleased base version numbers, all raw Jira versions)."""
    all_versions = jira_get(f"/rest/api/3/project/{JIRA_PROJECT}/versions")
    seen = set()
    active = []
    for v in all_versions:
        if v.get("released"):
            continue
        base = extract_version_number(v.get("name", ""))
        if not base or base in seen or base in _SKIP_VERSIONS:
            continue
        if tuple(int(x) for x in base.split(".")) < _MIN_VERSION:
            continue
        seen.add(base)
        active.append(base)
    # Sort ascending so patches come before majors
    active.sort(key=lambda s: tuple(int(x) for x in s.split(".")))
    return active, all_versions


def get_tiers_for_version(version_str, all_jira_versions):
    """Return list of tiers ('Free', 'Pro') present in Jira for this version number."""
    matching = [v for v in all_jira_versions
                if extract_version_number(v.get("name", "")) == version_str]
    has_pro  = any("pro" in v.get("name", "").lower() for v in matching)
    has_free = any("pro" not in v.get("name", "").lower() for v in matching)
    tiers = []
    if has_free:
        tiers.append("Free")
    if has_pro:
        tiers.append("Pro")
    return tiers or ["Free"]  # default to Free if nothing matched


def is_patch(version_str):
    parts = version_str.split(".")
    return len(parts) == 3 and parts[2].isdigit() and int(parts[2]) > 0


def run_version(version, tier=None):
    """Run update-release-doc.py for a version (and optionally a specific tier).
    Returns True on success."""
    env = os.environ.copy()
    env["FIXED_VERSION"] = version
    env.pop("PR_TITLE", None)
    env.pop("PR_BODY", None)
    env.pop("PR_URL", None)
    env.pop("PR_NUMBER", None)
    if tier:
        env["FIXED_TIER"] = tier
    else:
        env.pop("FIXED_TIER", None)

    label = f"{version}" + (f" ({tier})" if tier else "")
    result = subprocess.run([sys.executable, MAIN_SCRIPT], env=env)
    if result.returncode != 0:
        print(f"ERROR: {label} failed with exit code {result.returncode}", file=sys.stderr)
        return False
    return True


def main():
    versions, all_jira_versions = get_active_versions()
    if not versions:
        print("No active unreleased versions found — nothing to do.", file=sys.stderr)
        sys.exit(0)

    print(f"Active versions to process: {versions}", file=sys.stderr)
    failed = []

    for version in versions:
        print(f"\n{'='*60}", file=sys.stderr)

        if is_patch(version):
            # Patch releases: one page per tier, never combined
            tiers = get_tiers_for_version(version, all_jira_versions)
            print(f"Processing patch {version} — tiers: {tiers}", file=sys.stderr)
            print(f"{'='*60}", file=sys.stderr)
            for tier in tiers:
                if not run_version(version, tier=tier):
                    failed.append(f"{version} ({tier})")
        else:
            # Major/minor releases: combined Free & Pro page
            print(f"Processing version {version}", file=sys.stderr)
            print(f"{'='*60}", file=sys.stderr)
            if not run_version(version):
                failed.append(version)

    if failed:
        print(f"\nFailed: {failed}", file=sys.stderr)
        sys.exit(1)

    print(f"\nAll version(s) processed successfully.", file=sys.stderr)


if __name__ == "__main__":
    main()
