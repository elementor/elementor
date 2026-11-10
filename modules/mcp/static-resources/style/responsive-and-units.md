# BUILDING BEST PRACTICES: RESPONSIVE & UNITS

Part of the Building Best Practices guides. Start from the core guide [elementor://style/best-practices].

---

# 6. UNITS & RESPONSIVE DESIGN

## Units
| Use | Unit | Example |
|---|---|---|
| Font sizes | `rem` (or `clamp()` with rem bounds) | `font-size: var(--text-lg)` |
| Spacing (padding, margin, gap) | `rem` | `gap: var(--space-md)` |
| Values that scale with the element's own text | `em` | icon size beside text, `letter-spacing: -0.02em` |
| Line height | unitless | `line-height: 1.6` |
| Reading width | `ch` | `max-width: 65ch` |
| Layout widths & columns | `%`, `fr`, `max-width` | `grid-template-columns: 2fr 1fr` |
| Viewport-relative | `vw` only inside `clamp()`; `vh` only for `min-height` on root sections | `min-height: 80vh` |
| Hairlines & shadows | `px` | `border: 1px solid var(--color-border)` |

Never use `px` for font sizes or spacing — it ignores the visitor's browser text-size setting.

## How Elementor breakpoints work
- The base `style` is the **desktop** style. `@media(--tablet)` and `@media(--mobile)` override it for smaller screens; larger custom breakpoints (e.g. `--widescreen`) apply upward. Only breakpoints enabled on the site are valid.
- Write the desktop style, then add the smallest set of tablet/mobile overrides that make it work.

## Fluid first, breakpoints second
- Use `clamp()` variables for headings and section spacing (the design system guide [elementor://style/design-system]) so they scale smoothly; then you rarely need per-breakpoint font-size overrides.
- Use self-adapting grids where possible: `grid-template-columns: repeat(auto-fit, minmax(min(100%, 18rem), 1fr))`.

## Mobile requirements (every build)
- Multi-column rows stack: `@media(--mobile) { flex-direction: column; }` or a single grid column.
- Section padding shrinks (≈ half of desktop) if not already fluid.
- No horizontal scrolling at 360px width: no fixed widths, no wide min-widths, long words and URLs can wrap.
- Asymmetric and overlapping desktop layouts collapse to a simple, readable stack.
- Primary actions stay visible and easy to tap; they may go full width on mobile.
- Content order on mobile matches its importance — fix it in the XML order, not with `order`.

## Sizing
Default is no size. Let content and flex/grid decide; use `max-width` (never fixed `width`) for contained areas. See the SIZING rules in the build-composition tool.
