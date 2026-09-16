---
name: visual-proof
description: >-
  Author the ## Visual proof section on elementor/elementor PRs. Editor bugs
  get Broken + Where / Steps / Pass / Fail. Everything else gets #skip_proof.
  Triggered by the always-on visual-proof-pr rule when creating or editing a PR.
---

# Visual proof

Cursor agents in this checkout must put a `## Visual proof` section in the PR
body. This skill is how to write it. Capturing screenshots or a clip is not
this skill.

## What triggers it

`.cursor/rules/visual-proof-pr.mdc` has `alwaysApply: true`. It runs in every
Cursor session on this repo when the agent is about to `gh pr create` or
`gh pr edit`.

The rule is what makes an agent write the section. If someone opens the PR
from GitHub’s UI, nothing fills it in.

CI job `visual-proof-shots` in `.github/workflows/pr.yml` runs after
`playground-preview`. It captures Playground screenshots when the section is
filled, and skips when the section is missing or has `#skip_proof`.

Those shots always walk WP Admin → Pages → Edit with Elementor (up to 3
PNGs). They do **not** follow the PR’s **Steps**. Treat them as “Playground
editor is reachable,” not as proof of the specific bug. `**Broken:**` is
only a caption overlay.

## Environment (this repo)

The proof target is the PR’s **playground-preview** deployment, not a local
site.

| Piece | Path |
|-------|------|
| Workflow | `.github/workflows/playground-preview.yml` |
| Blueprint | `tests/playwright/blueprints/pr-preview.json` |

That workflow installs **this PR’s Core zip** into a fresh WordPress
Playground (Hello theme, admin / password, welcome popovers already
dismissed, `e_opt_in_v4` + `container` + `e_atomic_elements` on).

How to open it: on the PR page, Environments → `playground-preview`, or the
deployment URL posted after the build artifact exists.

Login: `admin` / `password`. Landing page is `/wp-admin`.

Playground only has this plugin. If the bug cannot be shown there, use
`#skip_proof`.

## When to fill vs skip

**Fill** (Broken + Where / Steps / Pass / Fail):

- Jira type `Bug` (or a clear regression fix)
- User-visible **editor** UI (panel, canvas, navigator, Style / Content)
- Can be shown on Core Playground above

**`#skip_proof`** + one sentence:

- Story / Task / feature
- No editor UI
- Needs another plugin Playground does not install
- Docs, CI, or this skill itself

## Rules

1. Write Steps for humans and a future agent capture. Today’s CI walk
   ignores them and only opens the editor.
2. Visible in-app labels only. No file paths, no GitHub, no workflow names
   inside **Steps**.
3. Do not act out the bug. Playground has the **fixed** zip. Put the old
   behaviour in `**Broken:**`, then show the fixed path.
4. Do not spend Steps dismissing welcome popovers — the blueprint already
   sets `_e_welcome_popover_displayed`.

## PR body

Order: Summary → Test plan → Visual proof → Jira.

### Editor bug

```markdown
## Visual proof
**Broken:** <one sentence: what used to happen in the editor>
**Where:** <editor path using visible labels>
**Steps:** <happy path on this PR’s Playground>
**Pass:** <fixed editor behaviour visible>
**Fail:** <bug still visible>
```

### Skip

```markdown
## Visual proof
#skip_proof
<One sentence why this cannot be shown in Core Playground editor.>
```

## Authoring checklist

- Short imperative Steps; stay in the editor.
- Pass / Fail are on-screen, not “tests pass”.
- `**Broken:**` is past tense and has no steps.
- Aim for under ~90s of actions.
- Empty containers need a border or background or they vanish in a capture.

## Examples

See [examples.md](examples.md).
