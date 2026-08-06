---
name: atomic-builder-extend
description: Routes Elementor v4 / atomic-builder extension work to the correct domain skill. Use when extending atomic widgets, prop types, transformers, dynamic tags, editor packages, variables, CSS converter, or interactions without a named module — or when the user asks "how do I add X" in v4.
---

# Atomic Builder Extension (router)

Source of truth: [docs/atomic-builder/README.md](../../../docs/atomic-builder/README.md). Skills are checklists that link there — do not duplicate the doc tree.

## Checklist

1. Confirm v4 context: experiments `e_atomic_elements` (and often `e_opt_in_v4`) — see [getting-started/experiments.md](../../../docs/atomic-builder/getting-started/experiments.md).
2. Map intent using the decision table below.
3. **Read the matching child skill** under `.cursor/skills/` and follow its workflow.
4. Read linked `docs/atomic-builder/...` pages before implementing.

## v3 vs v4 warning

The marketplace skill `elementor-widget-patterns` is **v3 only** (`Widget_Base`, `Controls_Manager`, `content_template`). For atomic / v4 work, use the child skills below — not legacy widget patterns.

## Decision table

| Intent | Child skill | Primary docs |
|--------|-------------|--------------|
| New widget or container element | [author-atomic-widget](../author-atomic-widget/SKILL.md) | [atomic-widgets/authoring-widgets.md](../../../docs/atomic-builder/atomic-widgets/authoring-widgets.md) |
| `$$type`, prop schema, validation, transformers | [extend-prop-types-transformers](../extend-prop-types-transformers/SKILL.md) | [fundamentals/prop-types.md](../../../docs/atomic-builder/fundamentals/prop-types.md), [transformers.md](../../../docs/atomic-builder/fundamentals/transformers.md) |
| WordPress data source / dynamic binding | [extend-dynamic-tags](../extend-dynamic-tags/SKILL.md) | [dynamic-tags/extending.md](../../../docs/atomic-builder/dynamic-tags/extending.md) |
| Editor UI, package, slots, in-editor MCP | [extend-editor-v2](../extend-editor-v2/SKILL.md) | [editor-packages/extending-editor.md](../../../docs/atomic-builder/editor-packages/extending-editor.md) |
| Design tokens / kit variables | [extend-variables](../extend-variables/SKILL.md) | [variables/types.md](../../../docs/atomic-builder/variables/types.md) |
| Legacy CSS → atomic style props | [extend-css-converter](../extend-css-converter/SKILL.md) | [css-converter/extension.md](../../../docs/atomic-builder/css-converter/extension.md) |
| Motion / interactions tab | [extend-interactions](../extend-interactions/SKILL.md) | [interactions/editor.md](../../../docs/atomic-builder/interactions/editor.md) |

## Public path vs Internal path

**Public path** — third-party plugin in its own repo: subclass + WordPress hooks/filters documented in child skills; own npm package for editor JS.

**Internal path** — Elementor Core / Pro: change `modules/atomic-widgets/`, `packages/packages/core/`, or `packages/packages/pro/`; follow module ownership in linked docs.

## Next step

Pick one child skill from the table, open its `SKILL.md`, and execute that checklist end-to-end.
