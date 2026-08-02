# Design guidance for agents

> Audience: external  
> Module: `modules/mcp/abilities/style-best-practices-ability.php`  
> Status: final  
> Related: [resources.md](resources.md), [composition-workflow.md](composition-workflow.md)

## What it is

Short design principles for MCP agents composing v4 pages. This file summarizes intent; the **authoritative full prompt** lives at the MCP resource `elementor://style/best-practices` (served from `modules/mcp/static-resources/style/best-practices.md`).

Do not duplicate the full resource here — agents should read the live resource for complete guidance.

## When to use it

Read before calling `elementor/build-composition` or `elementor/manage-classes` with substantial styling. Especially important when generating marketing pages, heroes, or branded layouts where generic "AI slop" aesthetics are undesirable.

## Key concepts

### Core imperative

Generate **distinctive, intentional** designs. Resist default patterns: purple gradients, Inter/Roboto everywhere, timid spacing, uniform 16px/24px rhythm, and safe centered hero → three-column → testimonial templates.

### Typography

- Use display/serif/monospace headlines with purpose — match brand context
- Headline-to-body size ratio: **3× minimum** (e.g. 48px vs 16px)
- Weight contrast: light headlines (100–200) vs bold body accents (800–900)
- Tight headline line-height (~1.1); generous body (~1.6–1.8)

### Color

- One **dominant** brand color (~60–70% of colored elements)
- 1–2 sharp accents (~10–15%)
- Tinted neutrals over pure `#333` / `#666` grays
- Avoid purple-gradient defaults

### Spacing and layout

- Generous section padding (6rem–10rem vertical)
- Vary spacing intentionally — asymmetric beats uniform grids
- **Default: no explicit height/width** — flexbox sizes content; use `min-height` on root heroes only when needed
- Never nest `100vh` inside `100vh`

### Motion

- Animate 2–3 high-impact moments, not every element
- Stagger multi-item reveals (~0.1s increments)

### Globals first

- Read `elementor://global-variables` and `elementor://global-classes` before inline styles
- Prefer global classes for reusable patterns; use `style` for element-specific overrides
- Reference variables by **label**: `var(--wc26-gold)`, not internal ids

### Full resource

For complete vectors (backgrounds, depth, color psychology mapping, hard constraints), read:

**`elementor://style/best-practices`**

Ability ID: `elementor/style-best-practices`  
MIME: `text/markdown`  
File: `modules/mcp/static-resources/style/best-practices.md`

## Extension

N/A — guidance is maintained in the static resource. Propose changes to `best-practices.md` and the `Style_Best_Practices_Ability` URI, not this summary.

## Internals

`Style_Best_Practices_Ability::execute()` returns `file_get_contents()` of the markdown file. Registered as an MCP resource (not a callable tool) on the `elementor-mcp-server`.

## See also

- [resources.md](resources.md) — how to fetch `elementor://style/best-practices`
- [composition-workflow.md](composition-workflow.md) — workflow step 1 includes reading this resource
- [abilities/build-composition.md](abilities/build-composition.md) — inline design notes in the ability prompt
