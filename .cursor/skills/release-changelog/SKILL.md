---
name: release-changelog
description: Adds a release changelog entry to Elementor Core or Pro and opens the paired PRs to main and the release line. Use when asked to "create changelog" for a version, add release notes, or port a changelog entry to a release branch.
---

# Release Changelog

A changelog task always lands the same entry twice: once on `main`, once on the release line that ships it. One branch and one PR per target.

## Files and entry format

| Repo | Files to edit | Header format |
|------|---------------|---------------|
| Core (`elementor`) | `changelog.txt` **and** `readme.txt` | `= X.Y.Z - YYYY-MM-DD =` |
| Pro (`elementor-pro`) | `changelog.txt` only (its `readme.txt` has no changelog section) | `#### X.Y.Z - YYYY-MM-DD` |

The new entry goes directly under the file header (`== Changelog ==` in Core, `# Elementor Pro - by Elementor.com` in Pro), then a blank line, then one `* Type: Description` bullet per change, then a blank line before the previous version. Never reorder or reword existing entries.

Bullet types match the PR types: `New`, `Feature`, `Tweak`, `Fix`, `Experiment`, `Deprecate`, `Revert`, `Internal`.

## Branch naming

| Target branch | Branch name |
|---------------|-------------|
| `main` | `changelog-<version>-to-main` |
| release line (`release/stable`, `release/beta`) | `changelog-<version>-to-<line>` |

`<line>` is the `MAJOR.MINOR` shipped by that branch (`changelog-4.2.8-to-4.2`), not the branch path. Resolve it from the branch itself:

```bash
git show origin/release/stable:elementor.php | rg "ELEMENTOR_VERSION"      # Core
git show origin/release/stable:elementor-pro.php | rg "ELEMENTOR_PRO_VERSION"  # Pro
```

These names are the team convention (`changelog-4.2.12-to-main`, `changelog-4.2.12-to-4.2`, Pro `changelog-3.28-to-main`). Use them even when an agent's default template would produce `cursor/<slug>-<suffix>`; from a Cloud Agent pass `skip_branch_prefix_check: true` to `ManagePullRequest`.

## Checklist

1. Use the entry text exactly as the requester supplied it. If a linked Jira ticket words it differently, apply the requested text and report the difference rather than silently choosing.
2. `git fetch origin main release/stable` (add `release/beta` when it ships the version) — a stale checkout puts the entry on the wrong base.
3. Confirm the version is not already present in the changelog files on each target.
4. Branch from each target with `git checkout -b <branch> origin/<target>`, edit the files, commit. Cherry-pick the first commit onto the second branch so both entries stay byte-identical.
5. Commit and PR title: `Internal: Changelog for v<version> [ED-XXXXX]` — commitlint runs on the PR title and `PR Jira Ticket Check` needs the `ED-` key. See [PR conventions](../../../AGENTS.md).
6. Verify on each branch, then push and open both PRs, cross-linking the sibling branch in each body.

## Verify

```bash
VERSION=<version> node ./.github/scripts/verify-version-changelog.js
rm -f temp-changelog.txt temp-readme.txt
```

This is the same check `one-click-release.yml` runs through `.github/workflows/verify-version-changelog`; it fails when the header is missing or the section is empty. It writes `temp-<file>` next to each source file, so delete those before committing.

## Gotchas

- `main` carries a higher version than the line being released (e.g. `4.3.0` on `main` while shipping `4.2.8`), so on `main` the new entry sits at the top even though its number is lower than the development version. That is expected.
- Do not touch `Stable tag` / `Beta tag` in `readme.txt` or the version in `elementor.php`; release automation owns those.
- Header dates are the release date and must match `\d{4}-\d{2}-\d{2}`; the verifier rejects anything else.
- Pro entries use `####` and no `=` wrappers — reusing the Core format silently breaks Pro's verifier.
