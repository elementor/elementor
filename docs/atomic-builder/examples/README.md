# Atomic builder skill examples

Runnable reference examples for each Cursor skill under `.cursor/skills/`. Use these in agent workflows and when extending v4.

| Skill | Example | Verdict |
|-------|---------|---------|
| [atomic-builder-extend](../../.cursor/skills/atomic-builder-extend/SKILL.md) | Router only — no standalone example | **Relevant** — keep as entry router |
| [author-atomic-widget](author-atomic-widget.md) | Minimal greeting widget + registration | **Relevant** — fix skill skeleton (namespaces, Section API) |
| [extend-prop-types-transformers](extend-prop-types-transformers.md) | Size type + styles transformer | **Relevant** — fix skill transformer FQCN and value shape |
| [extend-dynamic-tags](extend-dynamic-tags.md) | Text dynamic tag + atomic bridge | **Relevant** — clarify auto-mapping and full hook paths |
| [extend-editor-v2](extend-editor-v2.md) | Editor package + app bar injection | **Relevant** — fix init file layout and MCP Zod schema |
| [extend-variables](extend-variables.md) | Custom token type (PHP + JS) | **Relevant** — fix size/editor resolution wording |
| [extend-css-converter](extend-css-converter.md) | Property converter pattern | **Relevant** — core-only; no public discovery hook |
| [extend-interactions](extend-interactions.md) | Editor controls + schema filter | **Relevant, limited** — editor yes, frontend no public hook |

## Prerequisites

- Experiment `e_atomic_elements` active — see [getting-started/experiments.md](../getting-started/experiments.md).
- PropValues use `{ $$type, value }` — see [fundamentals/prop-value.md](../fundamentals/prop-value.md).

## How to use with agents

1. Load [atomic-builder-extend](../../.cursor/skills/atomic-builder-extend/SKILL.md) to route intent.
2. Open the matching example file below before implementing.
3. Cross-check linked `docs/atomic-builder/...` pages (skills are checklists, not duplicates of docs).
