---
name: visual-proof
description: >-
  How CI cursor-agent writes ## Visual proof on elementor/elementor PRs.
  Used by visual-proof-author.yml when the section is missing on opened or
  ready_for_review. Local agents must not write this section.
---

# Visual proof

This skill is for the **CI author** (`visual-proof-author.yml`). Local Cursor
agents must not add `## Visual proof` on `gh pr create` or `gh pr edit`.
Capturing screenshots or a clip is not this skill.

## What triggers it

CI workflow `.github/workflows/visual-proof-author.yml` calls the shared
`visual-proof-author` action
(`elementor/elementor-editor-github-actions`) when a same-repo PR is
**opened** or marked **ready for review**, and only if `## Visual proof` is
still missing. It does not run on every push. If a human already wrote the
section, CI leaves it alone.

Capture remains a separate job (`visual-proof-shots`) using the shared
`visual-proof-shots` action. That job follows **Steps**; it does not write
them.

CI job `visual-proof-shots` in `.github/workflows/pr.yml` runs after
`playground-preview` on normal PR pushes. When a **draft is marked ready
for review**, Playground is not rebuilt in that event; shots still run if
a `playground-preview` deployment already exists for the head SHA. It
captures Playground screenshots **and a short webm/mp4** when the section
is filled, and skips when the section is missing or has `#skip_proof`.

When `CURSOR_APIKEY` is set, a **storyboard actor** (`cursor-agent`) writes
and runs Playwright that follows **Steps** (then **Pass**) on Playground.
If that produces no PNGs, CI falls back to WP Admin → Pages → Add New →
Edit with Elementor. Overlay text still includes **Broken**; the actor must
not recreate the bug. This is not the marketplace `demo-video` skill.

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

- Jira type `Bug` or `Editor Bug` (or a clear regression fix)
- User-visible **editor** UI (panel, canvas, navigator, Style / Content)
- Can be shown on Core Playground above

**`#skip_proof`** + one sentence:

- Story / Task / feature
- No editor UI
- Needs another plugin Playground does not install
- Docs, CI, or this skill itself

## Rules

1. Write **Steps** the actor can click: short, visible labels, stay in the
   editor. If the actor cannot follow them, CI uses the generic Admin walk.
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
