---
name: promote-beta-to-stable
description: >-
  Replace release/stable with release/beta in elementor/elementor (Core) by a guarded
  force push, after listing the commits that only release/stable has and making sure no
  changelog entry is lost. Use when asked to merge, promote, sync, or force push
  release/beta into release/stable in Core.
disable-model-invocation: true
---

# Promote release/beta to release/stable (Core)

`release/stable` is reset to the tip of `release/beta`. It is **not** merged: the branches
diverge through cherry-picks, so a merge or a PR from beta to stable conflicts in dozens of
files. Do not open a beta-to-stable PR.

## Rules

- Work against `elementor/elementor`. If `origin` is a personal fork, use the remote that
  points at `elementor/elementor` (often `upstream`). Never push the result to a fork.
- Show the user the stable-only list (Step 2) and get an explicit go-ahead before pushing.
- Always push with `--force-with-lease` pinned to the stable SHA you listed against.
- Never change repository rulesets yourself, and never work around a rejected push.

## Workflow

```
- [ ] Step 1: Fetch both branches and record SHAs
- [ ] Step 2: List commits only release/stable has
- [ ] Step 3: Make sure every changelog entry is in release/beta
- [ ] Step 4: Get the user's go-ahead
- [ ] Step 5: Force push with lease
- [ ] Step 6: Verify and report the rollback SHA
```

### Step 1: Fetch and record SHAs

```bash
git fetch upstream release/stable release/beta
STABLE_SHA="$(git rev-parse upstream/release/stable)"
BETA_SHA="$(git rev-parse upstream/release/beta)"
```

`STABLE_SHA` is both the lease and the rollback point.

### Step 2: List commits only release/stable has

Use the shared script from `elementor/elementor-editor-github-actions`. It skips commits whose
patch already exists on beta and flags cherry-picks whose original PR is on beta.

```bash
gh api "repos/elementor/elementor-editor-github-actions/contents/actions/force-push-beta-to-stable/list-stable-only-prs.sh?ref=main" \
  --jq .content | base64 -d > /tmp/list-stable-only-prs.sh
bash -c 'source /tmp/list-stable-only-prs.sh && collect_target_only_prs upstream/release/beta upstream/release/stable'
```

Run it with `bash`, not by sourcing into zsh (zsh breaks `BASH_REMATCH`). Each row is
`pr_number<TAB>sha<TAB>author<TAB>subject<TAB>note`. Also report the raw count from
`git rev-list --no-merges --count upstream/release/beta..upstream/release/stable`, and present
the list as a table with PR links.

### Step 3: Changelog entries

`Internal: Changelog for vX.Y.Z` commits often exist only on stable. Core keeps the changelog in
both `changelog.txt` and the `== Changelog ==` section of `readme.txt`. For each changelog
commit in the list, check that beta already has that version:

```bash
git show upstream/release/beta:changelog.txt | rg -n '^= X\.Y\.Z '
git show upstream/release/beta:readme.txt | rg -n '^= X\.Y\.Z '
```

If an entry is missing, stop. It has to reach beta first through a
`Internal: Synced - Changelog for vX.Y.Z [ED-XXXXX]` PR into `release/beta`. Then repeat Steps 1–3.

### Step 4: Go-ahead

Tell the user which commits the push drops, which of them are cherry-picks of PRs already on
beta, and the rollback SHA. Wait for confirmation.

### Step 5: Force push with lease

Brace the variables. In zsh, `$BETA_SHA:refs` applies the `:r` modifier and corrupts the refspec.

```bash
git push --force-with-lease="release/stable:${STABLE_SHA}" \
  https://github.com/elementor/elementor.git "${BETA_SHA}:refs/heads/release/stable"
```

The account must be able to bypass the `release/stable` ruleset with **Always allow**. A bypass
set to **For pull requests only** still rejects direct pushes. If GitHub answers with `GH013`,
report the rules it lists and ask a repository admin for a bypass. "Bypassed rule violations"
in the output is expected for an account that can bypass.

### Step 6: Verify and report

```bash
git fetch upstream release/stable
test "$(git rev-parse upstream/release/stable)" = "${BETA_SHA}"
```

Report the new tip, the dropped commits, and the rollback command:

```bash
git push --force-with-lease="release/stable:${BETA_SHA}" \
  https://github.com/elementor/elementor.git "${STABLE_SHA}:refs/heads/release/stable"
```

If the user kept a local `release/stable` checkout, reset it to `upstream/release/stable`.

## Rulesets

If ruleset rules were disabled to allow a push, recover their previous settings from history
rather than from memory:

```bash
gh api repos/elementor/elementor/rulesets --jq '.[] | {id, name}'
gh api repos/elementor/elementor/rulesets/<id>/history --jq '.[] | {version_id, updated_at}'
gh api repos/elementor/elementor/rulesets/<id>/history/<version_id> --jq .state
```

Remind the user to re-enable anything that was turned off, since the same ruleset protects `main`.

## Jira and PR conventions

- Ticket: project `ED`, type `Task`. Ask for the team and sprint if the user did not name them
  and resolve them with `searchTeams` and the board's active sprint.
- Core PR titles: `Internal: Sentence case description [ED-XXXXX]` (see `AGENTS.md`).

## Related

- `elementor/elementor-pro` has its own `promote-beta-to-stable` skill. Pro is a separate
  repository with its own ruleset, so do it as a separate push.
