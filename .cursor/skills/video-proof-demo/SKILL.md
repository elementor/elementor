---
name: video-proof-demo
description: >-
  Author the ## Video demo section for Elementor editor-bug PRs (Broken
  caption + Where / Steps / Pass / Fail). Other tickets get #skip_video.
  Use when opening or updating an elementor/elementor PR, when running /pr
  or create-ship-deploy, or when the user asks for a demo script. Does not
  record video — recording is a separate demo-video / Playwright step.
---

# Video demo (Elementor)

The demo script lives in the **PR body** as a `## Video demo` section.
A recorder (demo-video skill, Cursor browser video, or a later CI job) drives
the PR's WordPress Playground preview from this section.

**Current scope: editor bugs only.** Features, Tasks, frontend-only fixes,
Pro-only widgets, and infra PRs keep the heading with `#skip_video`.

## When this applies

**Record (fill Where / Steps / Pass / Fail):**

- Jira type is `Bug` (or the PR is clearly a regression fix)
- The user-visible surface is the **Elementor editor** (panel, canvas,
  navigator, Style / Content controls, editor chrome)
- The change can be shown in Core Playground (no Pro-only widget required)

**Skip (heading + `#skip_video` + one sentence):**

- Story / Task / new feature
- Frontend-only, WP-admin-only, or API with no editor UI
- Needs Elementor Pro (or another plugin) that Playground does not install
- Docs, skills, CI, or anything that cannot be shown in the editor

## Rules

1. **Audience of this section** = the recording agent, not human reviewers.
   Reviewers read Summary / Test plan.
2. **In-app UI only.** Visible labels (buttons, tabs, panel names). Never file
   paths, GitHub, or CI.
3. **Environment** = PR Playground (`playground-preview`). Not `*.local`.
4. **Intro overlays** — Playground blueprints already dismiss welcome
   popovers. Do not spend Steps closing them unless this PR changes that UI.
5. **Never perform the bug.** Playground installs only the PR build (the
   fix). Put the old behaviour in `**Broken:**` as an opening caption, then
   demo the fixed editor path. That *is* the “video of the bug that was
   fixed”: what was wrong, then what the editor does now.

## Classify

| Signal | Mode |
|--------|------|
| Jira `Bug` + editor UI + Core Playground | **Record** → `**Broken:**` + Where / Steps / Pass / Fail |
| Anything else | **`#skip_video`** |

## PR body contract

Always include the heading `## Video demo`. Order: Summary → Test plan →
Video demo → Jira.

### Editor bug (record)

```markdown
## Video demo
**Broken:** <one sentence in user terms: what used to happen in the editor>
**Where:** <editor path using visible labels>
**Steps:** <happy path on the PR build>
**Pass:** <fixed editor behaviour visible>
**Fail:** <bug still visible>
```

### Skip

```markdown
## Video demo
#skip_video
<One sentence: not an editor bug, needs Pro, or no useful editor UI.>
```

## Authoring checklist

- Steps are imperative and short; stay in the editor.
- Pass / Fail are observable on screen.
- `**Broken:**` is one sentence, past tense, no steps.
- Keep the demo under ~90s when possible.
- Name Style / Content tabs, section titles, control labels.
- Empty containers need a border or background so they show on video.
- Do not put “open the Playground URL” in Steps — the runner resolves it.

## Recording (separate from this skill)

After the PR exists and CI has a plugin zip:

1. Read `## Video demo`. If `#skip_video`, do not record.
2. Boot the PR Playground (or run the **demo-video** skill with
   `DEMO_PR_REPO=elementor/elementor`).
3. Follow Steps. Render `**Broken:**` as the first caption.
4. Attach `demo.mp4` to the PR (manual for now; CI later).

Cursor browser `start_video` is an allowed camera for a dry-run. Do not
record the local site.

## Out of scope (for now)

- Feature / Task demos
- Frontend (published page) demos
- Pro Playground / Pro widgets
- Automatic GitHub Action on every push

## Examples

See [examples.md](examples.md).

## Integration

- **`/pr`**: Auto-author `## Test plan` and `## Video demo` from Jira + diff.
  Never leave placeholders. Editor bugs get a full block; everything else
  gets `#skip_video`.
- **`create-ship-deploy`**: inherits via `/pr`.
- **`demo-video` skill**: prefer this PR section over inventing a plan.
- **Existing PRs**: if asked, `gh pr edit` the section in; do not make the
  user paste it.
