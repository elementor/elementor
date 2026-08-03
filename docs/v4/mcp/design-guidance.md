# Design guidance for agents

> Audience: external  
> Module: `modules/mcp/abilities/style-best-practices-ability.php`  
> Related: [resources.md](resources.md), [composition-workflow.md](composition-workflow.md)

## What it is

Design principles for MCP agents composing v4 pages. **Authoritative content** is the MCP resource `elementor://style/best-practices` (`modules/mcp/static-resources/style/best-practices.md`). This page summarizes; agents should read the live resource.

## Public API

| Symbol | Ability ID | URI | Purpose |
|--------|------------|-----|---------|
| `Style_Best_Practices_Ability` | `elementor/style-best-practices` | `elementor://style/best-practices` | Returns markdown design guidance |

`execute()` → `file_get_contents()` of `best-practices.md`. Registered as MCP resource (not callable tool).

Verified: `style-best-practices-ability.php`.

## When to use it

Before `build-composition` or `manage-classes` with substantial styling — marketing pages, heroes, branded layouts.

## Key concepts

### Core imperative

Generate **distinctive, intentional** designs. Avoid purple gradients, Inter/Roboto defaults, timid spacing, and generic hero→three-column→testimonial templates.

### Quick rules

| Area | Guideline |
|------|-----------|
| Typography | 3×+ headline-to-body ratio; tight headline line-height (~1.1) |
| Color | One dominant (~60–70%), 1–2 accents (~10–15%); tinted neutrals |
| Spacing | Generous section padding (6–10rem); vary intentionally |
| Layout | Default: no explicit height/width; no nested `100vh` |
| Motion | 2–3 high-impact moments; stagger ~0.1s |
| Globals | Read variables/classes first; `var(--label)` not internal ids |

### Full resource

**`elementor://style/best-practices`** — complete vectors, backgrounds, depth, hard constraints.

## Extension

Propose changes to `best-practices.md`, not this summary.

## Internals

N/A

## See also

- [resources.md](resources.md)
- [composition-workflow.md](composition-workflow.md)
