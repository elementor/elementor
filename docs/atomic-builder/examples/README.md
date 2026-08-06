# Atomic builder skill examples

Runnable reference examples for each Cursor skill under `.cursor/skills/`. Use these in agent workflows and when extending v4.

| Skill | Example | Verdict |
|-------|---------|---------|
| [atomic-builder-extend](../../../.cursor/skills/atomic-builder-extend/SKILL.md) | Router only — no standalone example | **Relevant** — keep as entry router |
| [external-author-atomic-widget](external-author-atomic-widget.md) | Minimal greeting widget + registration | **Relevant** — fix skill skeleton (namespaces, Section API) |
| [external-extend-prop-types-transformers](external-extend-prop-types-transformers.md) | Size type + styles transformer | **Relevant** — fix skill transformer FQCN and value shape |
| [external-extend-dynamic-tags](external-extend-dynamic-tags.md) | Text dynamic tag + atomic bridge | **Relevant** — clarify auto-mapping and full hook paths |
| [external-extend-editor-v2](external-extend-editor-v2.md) | Editor package + app bar injection | **Relevant** — fix init file layout and MCP Zod schema |
| [external-extend-variables](external-extend-variables.md) | Custom token type (PHP + JS) | **Relevant** — fix size/editor resolution wording |
| [internal-extend-css-converter](internal-extend-css-converter.md) | Property converter pattern | **Relevant** — core-only; no public discovery hook |
| [internal-extend-interactions](internal-extend-interactions.md) | Editor controls + schema filter | **Relevant** — full outcome requires Core PR; editor-only partial integration is insufficient |

## Scope

Each skill is **External** (3rd-party plugin, no Core changes) or **Internal** (requires a Core PR for the full outcome). See [skills-scope.md](../skills-scope.md) before implementing — a plugin-only approach cannot ship an Internal capability (`internal-extend-css-converter`, `internal-extend-interactions`).

## Prerequisites

- Experiment `e_atomic_elements` active — see [getting-started/experiments.md](../getting-started/experiments.md).
- PropValues use `{ $$type, value }` — see [fundamentals/prop-value.md](../fundamentals/prop-value.md).

## How to use with agents

1. Load [atomic-builder-extend](../../../.cursor/skills/atomic-builder-extend/SKILL.md) to route intent.
2. Open the matching example file below before implementing.
3. Cross-check linked `docs/atomic-builder/...` pages (skills are checklists, not duplicates of docs).
