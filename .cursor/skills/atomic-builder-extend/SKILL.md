---
name: atomic-builder-extend
description: "Pick the right Elementor v4 skill. Use when you want to create a widget, extend prop types, add a dynamic tag, add an editor package, extend variables, or run an Internal Core-only skill (CSS converter / interactions)."
---

# Extend Elementor V4 (router)

Source of truth: [docs/atomic-builder/README.md](../../../docs/atomic-builder/README.md). Skills are checklists that link there — do not duplicate the doc tree. Runnable examples: [docs/atomic-builder/examples/](../../../docs/atomic-builder/examples/README.md).

This router is **not** an implementation capability. It does not define hooks, paths, or a shippable outcome — it only routes intent to a child skill with a binary **External** or **Internal** scope.

## Checklist

1. Confirm v4 context: experiments `e_atomic_elements` (and often `e_opt_in_v4`) — see [getting-started/experiments.md](../../../docs/atomic-builder/getting-started/experiments.md).
2. Map intent using the decision table below.
3. **Read the matching child skill** under `.cursor/skills/` and follow its workflow.
4. Read linked `docs/atomic-builder/...` pages before implementing.

## v3 vs v4 warning

The marketplace skill `elementor-widget-patterns` is **v3 only** (`Widget_Base`, `Controls_Manager`, `content_template`). For atomic / v4 work, use the child skills below — not legacy widget patterns.

Angie's `extend-elementor` guide (surfaced inside the code-snippet MCP tool, not this repo) is also **v3 only** — legacy hooks like `elementor/widgets/register`, `elementor/element/{name}/{section}/before_section_end`. It has no atomic/v4 coverage; for v4 use the decision table below and the `elementor/atomic-widgets/*` hooks documented in the child skills.

## Decision table

**Scope** = who can ship the **full** documented outcome: **External** (3rd-party plugin, no Core changes) · **Internal** (requires a PR against Core). Partial external APIs do not change classification. Full split: [docs/atomic-builder/skills-scope.md](../../../docs/atomic-builder/skills-scope.md).

| Intent | Child skill | Scope | Primary docs |
|--------|-------------|-------|--------------|
| New widget or container element | [create-atomic-widget](../create-atomic-widget/SKILL.md) | External | [atomic-widgets/authoring-widgets.md](../../../docs/atomic-builder/atomic-widgets/authoring-widgets.md) |
| `$$type`, prop schema, validation, transformers | [extend-prop-types](../extend-prop-types/SKILL.md) | External | [fundamentals/prop-types.md](../../../docs/atomic-builder/fundamentals/prop-types.md), [transformers.md](../../../docs/atomic-builder/fundamentals/transformers.md) |
| WordPress data source / dynamic binding | [add-dynamic-tag](../add-dynamic-tag/SKILL.md) | External | [dynamic-tags/extending.md](../../../docs/atomic-builder/dynamic-tags/extending.md) |
| Editor UI, package, slots, in-editor MCP | [add-editor-package](../add-editor-package/SKILL.md) | External | [editor-packages/extending-editor.md](../../../docs/atomic-builder/editor-packages/extending-editor.md) |
| Design tokens / kit variables | [extend-variables](../extend-variables/SKILL.md) | External | [variables/types.md](../../../docs/atomic-builder/variables/types.md) |
| Legacy CSS → atomic style props | [internal-extend-css-converter](../internal-extend-css-converter/SKILL.md) | Internal | [css-converter/extension.md](../../../docs/atomic-builder/css-converter/extension.md) |
| Motion / interactions tab | [internal-extend-interactions](../internal-extend-interactions/SKILL.md) | Internal | [interactions/editor.md](../../../docs/atomic-builder/interactions/editor.md) |

## Scope: External vs Internal

Before implementing, confirm the child skill's scope — a plugin-only approach cannot ship an **Internal** capability.

- **External** — third-party plugin in its own repo: subclass + WordPress hooks/filters documented in child skills; own npm package for editor JS. Do not modify Elementor Core.
- **Internal** — requires changing Elementor Core (`modules/atomic-widgets/`, `packages/packages/core/`, `packages/packages/pro/`) via an accepted PR. Editor-only partial integrations via public hooks do not satisfy Internal skills when the full outcome includes published-page behavior.

Full classification, implementation locations, and disclaimer: [docs/atomic-builder/skills-scope.md](../../../docs/atomic-builder/skills-scope.md).

## Next step

Pick one child skill from the table, open its `SKILL.md`, and execute that checklist end-to-end.
