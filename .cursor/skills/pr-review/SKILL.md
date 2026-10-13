---
name: pr-review
description: "Multi-lens PR/branch review for Elementor Core and Pro. Reads the ED ticket, checks scope and tests first, gates specialist lenses (architecture, quality, Core/Pro + license, reuse, security, perf, a11y, MCP, QA, product), runs a bounded debate, and returns a terse report. Use for /review, 'review this PR', or reviewing local branch changes."
---

# PR review (orchestrator)

Read-only. Never edit code or post to GitHub unless the user asks. Be terse: tables and bullets, `file:line`, no code pasting, no restating the diff. Expand only when asked ("expand #3").

## Invocation

`/review [PR# | URL | branch | "local"] [model=<slug>] [effort=<low|medium|high|max>] [+lens ...] [-lens ...] [<lens>=<model>:<effort>] [escalate] [expand]`

- Default model/effort: see [config.md](config.md) (`claude-sonnet-5-5-low`).
- Model must be a slug the Task tool accepts. Unknown slug: stop and say so. Never silently substitute.
- `+lens` forces a lens that gating skipped. `-lens` skips one.
- `escalate`: re-run only lenses with blocker findings on a stronger model (config.md).
- Re-review (PR already reviewed): re-check prior findings and new changed lines only.

## Flow

1. **Intake** (inline). Repo (Core/Pro), `gh pr view` + `gh pr diff --stat`, base branch, ED key from title/branch/body. For `local`: `git diff <base>...HEAD --stat`.
2. **Checks first** (inline, cheap). Run lint/typecheck for touched areas if available; do not spend agent tokens rediscovering lint errors.
3. **Ticket pass** (subagent, [lenses/00-ticket.md](lenses/00-ticket.md)). Jira via Atlassian tools, read-only. No key: say "no ticket", continue. Output: logic, AC list, AC conflicts, ambiguities, missing edge cases, free-vs-Pro, and a **look-for list**. If the spec is broken, report that before code findings.
4. **Scope + tests** (inline, [lenses/01-scope.md](lenses/01-scope.md)). Read tests before code. Map tests to AC/edge cases; flag test bloat, tautologies, over-mocking, mixed concerns, PR too big (suggest split).
5. **Code skim** (inline). Structure, boundaries, hotspots, conventions in neighboring code. Add to look-for list.
6. **Gating**. Pick lenses from the table. For every skipped lens write one line why. Report this list so the user can force with `+lens`.
7. **Deep dive**. Run selected lenses as parallel subagents (`generalPurpose`, `readonly: true`). Each gets: its lens file, [common.md](common.md), [contracts.md](contracts.md), the look-for list, only the diff slice relevant to it, and the chosen model/effort. Cross-repo: Core PR -> grep Pro for callers; Pro PR -> verify Core API exists in min supported version.
8. **Verify**. Drop any finding without `file:line` evidence or that contradicts contracts.md. Spot-check blockers against real code.
9. **Debate** ([debate.md](debate.md)). Only conflicting lenses, max 2 rounds. Unresolved = report as disagreement.
10. **Report** ([report.md](report.md)).

## Lenses and gating

| Lens file | Runs when |
|---|---|
| `02-architecture` | new files/modules, cross-package imports, public APIs/hooks |
| `03-quality` | any non-test code (SOLID, KISS, YAGNI, clean code, Elementor standards) |
| `04-core-pro` | any Pro file; Core touching hooks/filters/promotions/license/REST/MCP/import-export; ticket mentions Pro/license/tier |
| `05-reuse` | new implementation of anything (events, promotions, registries, helpers, test utils, shared JS) |
| `06-security` | render/Twig, REST/ajax, MCP, import/export, forms, capabilities |
| `07-performance` | data access, loops, React components, new deps, CSS/assets |
| `08-accessibility` | widgets, markup/Twig, editor controls/panels, icons, popovers |
| `09-ai-mcp` | MCP, ability, schema, prop-type, elements catalog |
| `10-qa` | any code change; test-only PRs |
| `11-product` | Feature/New/Tweak, UI changes, or ticket AC exists |

Light path (cherry-picks from `github-actions`, snapshot-only, changelog): `10-qa` + `04-core-pro` only, unless user forces more.

## Rules

- No gold-plating: do not suggest abstractions without a real second use.
- A hook existing in current code is not automatically safe or unsafe. Judge on behavior.
- Dismissed findings: when the user says a finding was wrong, offer to append the reason to [contracts.md](contracts.md).
