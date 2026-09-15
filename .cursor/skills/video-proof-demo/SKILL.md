---
name: video-proof-demo
description: >-
  Author the ## Video demo section for Elementor PRs (Where / Steps /
  Pass / Fail). Bugs add a Broken caption line; the demo always runs the fixed
  build. Use when opening or updating an elementor/elementor or elementor-pro
  PR, when running /pr or create-ship-deploy, or when the user asks for a demo
  script / video proof section. Does not record video — that is a later
  record-demo + Playwright step.
---

# Video demo (Elementor)

The demo script lives in the **PR body** as a `## Video demo` section, not
behind a label. A future `record-demo` + Playwright job will drive the browser
from this section against the PR's WordPress Playground preview.

## When this applies

**Relevant PRs** (always add `## Video demo` with real Where / Steps / Pass / Fail, plus `**Broken:**` for bugs):

- User-visible editor, canvas, widgets, frontend, or WP-admin UI changes
- `/pr` / `create-ship-deploy` when the diff or Jira ticket is UI-facing
- User asks to "add video demo" or "demo steps"

**Not relevant** (still add the heading, but only `#skip_video` + one sentence why):

- Docs-only, skill text, pure backend/API with no useful UI, or changes that cannot be shown in Playground

## Rules

1. **Audience of this section** = the recording agent, Playwright runner, not
   human reviewers. Reviewers read Problem / Summary; the agent reads Where /
   Steps / Pass / Fail.
2. **In-app UI only.** Describe WordPress admin and Elementor editor surfaces
   with **visible labels** (buttons, tabs, panel names). Never: file paths,
   GitHub, Actions artifacts, PR comments, or "check the workflow".
3. **Environment when recording** = the PR Playground preview URL (deployment
   `playground-preview`). Do not assume `*****.local`.
4. **Intro overlays** — assume Playground blueprints pre-dismiss welcome /
   announcement popovers (`_e_welcome_popover_displayed`, etc.). Do not spend
   Steps closing them unless this PR specifically changes that UI.
5. **Never perform the bug.** `playground-preview.yml` installs only the PR's
   own build artifact, which already contains the fix, so broken behaviour
   cannot be reproduced there. State it in a `**Broken:**` caption line and
   demo the fixed path.

## Classify the change

| Signal | Mode |
|--------|------|
| Jira type `Bug`, or fix/regression language | **Bug** → `**Broken:**` caption + one Where / Steps / Pass / Fail |
| Jira `Story` / `Task`, or new behaviour | **Feature** → single Where / Steps / Pass / Fail |
| Docs-only, skill text, no useful UI | **`#skip_video`** |
| Infra / CI but a screenshot still helps | **Smoke** — open editor (or relevant admin screen) → confirm loaded → capture |

Prefer smoke over `#skip_video` when a still image helps reviewers.

## PR body contract

Always include the exact heading `## Video demo` on Elementor / Elementor Pro PRs opened via `/pr`. On relevant (UI) PRs, fill Where / Steps / Pass / Fail. On non-relevant PRs, keep the heading and put `#skip_video` under it.

### Feature (or Task with UI)

```markdown
## Video demo
**Where:** <screen path using visible labels, e.g. WP Admin → Pages → Edit with Elementor → Style → Position>
**Steps:** <ordered in-app actions the recorder can perform>
**Pass:** <visible success state>
**Fail:** <visible failure / missing state>
```

### Bug

Same shape as a feature, plus a `**Broken:**` line the recorder renders as an
opening caption. Do not script the broken behaviour as Steps — see rule 5.

```markdown
## Video demo
**Broken:** <one sentence in user terms: what used to happen>
**Where:** <entry point using visible labels>
**Steps:** <happy path on the PR build>
**Pass:** <fixed behaviour visible>
**Fail:** <bug still visible>
```

### Skip

```markdown
## Video demo
#skip_video
<One sentence: why nothing visual helps (e.g. docs-only skill text).>
```

### Smoke (non-app change, screenshot for humans)

```markdown
## Video demo
**Where:** WordPress admin → Edit with Elementor
**Steps:** open a new page → Edit with Elementor → wait until canvas loads → capture screenshot
**Pass:** editor chrome and canvas are visible
**Fail:** blank iframe, fatal error, or editor never loads
```

## Authoring checklist

- Steps are imperative and short.
- Pass / Fail are **observable on screen**, not "unit tests pass".
- `**Broken:**` is one sentence, past tense, and contains no steps.
- Keep total demo under ~90s of actions when possible.
- For editor work: name Style / Content tabs, section titles, control labels.
- For containers/layout: note that empty boxes need border or background to be visible on video (recorder may add this).
- Link Playground in Summary/Test plan if useful for humans; **do not** put "open the Playground URL from the deployment" inside Steps — the runner resolves the preview URL itself.

## Out of scope (this skill)

- Recording, ffmpeg, narration, uploading `demo.mp4`
- Creating GitHub labels (`needs-demo` is retired; `record-demo` is future)
- Compiling to `storyboard.json` (optional later bridge from this section)

## Examples

See [examples.md](examples.md).

## Integration

- **`/pr`**: **Auto-author** both `## Test plan` and `## Video demo` from the Jira ticket + diff when opening the PR. Never leave placeholders; never ask the user to write these sections unless two demo paths are equally plausible. Order: Summary → Test plan → Video demo → Jira.
- **`create-ship-deploy`**: inherits via `/pr`.
- **`demo-video` skill**: when recording manually, prefer Steps from this PR section over inventing a new plan.
- **Existing PRs**: if the user asks to add demo/test plan to an open PR, generate the sections and update the PR body with `gh pr edit` (do not make them paste manually).
