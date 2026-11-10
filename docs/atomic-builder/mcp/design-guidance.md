# Design guidance for agents

> Audience: external  
> Module: `modules/mcp/abilities/style-best-practices-ability.php`  
> Related: [resources.md](resources.md), [composition-workflow.md](composition-workflow.md)

## What it is

Design principles for MCP agents composing v4 pages. **Authoritative content** is the MCP resource `elementor://style/best-practices` (`modules/mcp/static-resources/style/best-practices.md`). This page summarizes; agents should read the live resource.

## Public API

| Symbol | Ability ID | URI | Purpose |
|--------|------------|-----|---------|
| `Style_Best_Practices_Ability` | `elementor/style-best-practices` | `elementor://style/best-practices` | Returns the Building Best Practices guide (markdown) |

`execute()` → `file_get_contents()` of `best-practices.md`. Registered as MCP resource (not callable tool).

Verified: `style-best-practices-ability.php`.

## When to use it

Before `build-composition` or `manage-classes` with substantial styling — marketing pages, heroes, branded layouts.

## Key concepts

### Core imperative

One guide, "Building Best Practices", for everything the agent decides while building: the site's design system and naming, semantic structure, accessibility (WCAG 2.2 AA), units and mobile, and page strategy with an original design process. Priority order: the user's direction, then the site's existing design system, then the guide. Accessibility is never traded away.

### Quick rules

| Area | Guideline |
|------|-----------|
| Design system | Variables `{category}-{role}[-{variant}]`, classes `{component}[-{part}][-{variant}]`; existing site names win |
| Structure | One `h1`, no skipped heading levels, container tags reflect meaning |
| Accessibility | WCAG 2.2 AA: 4.5:1 text contrast, visible focus, 44px targets, visible text on every control |
| Units & mobile | `rem`/`clamp()` instead of `px`; multi-column layouts stack on mobile; no horizontal scroll at 360px |
| Page strategy | First screen passes the mirror test, one primary action, original design process, no invented facts |
| Globals | Read variables/classes first; `var(--label)` not internal ids |

### Full resource

**`elementor://style/best-practices`** — full chapters and the pre-flight checklist.

## Extension

Propose changes to `best-practices.md`, not this summary.

## Internals

N/A

## See also

- [resources.md](resources.md)
- [composition-workflow.md](composition-workflow.md)
