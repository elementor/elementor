# BUILD GUIDELINES

Authoritative engine + WordPress rules for MCP-driven Elementor builds. Tool descriptions carry short teasers; this resource carries the depth. Load before making structural decisions about pages, styling, or repeating layouts.

## Styling contract (elaboration)

The `style` field on `build-composition`, `manage-elements`, `manage-classes`, `manage-default-styles`, and `manage-component` all follow the same contract; the short teaser lives on each tool description.

### Breakpoints and pseudo-states

- Breakpoint spelling: `@media(--mobile)`, `@media(--tablet)`, `@media(--laptop)` (no space between `@media` and the paren). Raw pixel queries (`@media (max-width: 768px)`) are NOT recognized as breakpoints — they fall through to `custom_css`.
- Pseudo-states: `&:hover`, `&:focus`, `&:active`. Any other selector (`&::before`, `&[data-x]`, descendant combinators) falls through to `custom_css`.
- `custom_css` is not part of the v4 rendering pipeline — content routed there may not render reliably. Every `custom_css` fallback surfaces as a `warnings` entry.

### Common value-shape traps

- `gap: 10px 20px` / `row-gap: 10px 20px` — two-value shorthand for gap does not convert. Split into single-value declarations or use `column-gap` alone.
- `border-color` / `border-style` with four values — per-side longhand only converts single-value forms; use per-side longhands (`border-top-color`, etc.) when the sides differ.
- `border-radius: 10px / 20px` — elliptical (slash) form is not supported. Use single-radius per corner if the shape is not circular.
- `transform: matrix(…)` / `skew()` / `perspective()` / `rotate3d()` — advanced transforms are not converted. Simple `translate`, `rotate`, `scale` work.
- `box-shadow: var(--…)` — `var()` inside `box-shadow` falls through. `box-shadow` with literal values is fully supported.
- `font-family: Inter, sans-serif` — fallback stacks are not supported. Pass a single Google Font name.
- `var(--something-you-did-not-define)` — unknown variable references fall through. Read `elementor://global-variables` before referencing.
- `animation`, `animation-name`, `animation-duration`, etc. — animation properties are rejected outright (dropped, not routed to `custom_css`). Use `transition` for hover-time changes.

### Variables and classes

- Reference variables by **label** — `color: var(--brand-primary)` — never with the internal `--e-gv-…` prefix.
- Attach global classes by **label** — never by internal `g-…` ids.
- Global classes are prepended before any local styles from `style`; local styles win on conflicts. When two global classes on the same element set the same property, the class earliest in `elementor://global-classes` wins. Use `elementor/reorder-classes` to change this order.

### Sizing defaults

- Do NOT set `width` / `height` unless required. Flex children distribute space via flex props; text elements size to their content.
- `min-height` on the root section for viewport-spanning heroes; never `100vh` on nested elements.

### Layout defaults

- `e-flexbox` defaults to `flex-direction: row`. Stacked content (heading + paragraph, footer columns) needs `display: flex; flex-direction: column` set explicitly.

## Partial text styling

Text widgets (`e-heading`, `e-paragraph`, `e-button` text) take a plain string. There is no inline-child schema and no way to style a substring inside a single widget. When part of a headline must render differently (bold, gradient, accent color, different font), split the text across sibling text widgets inside a flex container and style each sibling separately. For a heading "Design **like a pro**", emit `<e-flexbox>` containing two `<e-heading>` widgets — one for "Design ", one for "like a pro" — and apply the accent style to the second heading only. Do not attempt to embed HTML or Markdown in the text prop; unrecognized content is stored as-is and rendered as text.

## Widget selection: V4 + dynamic tag over V3 post-* widgets

Title, featured image, excerpt, price, meta, CTA link → V4 widget (`e-heading`, `e-image`, `e-paragraph`, `e-button`) + a dynamic tag from [elementor://dynamic-tags]. Do NOT use the V3 `theme-post-title` / `theme-post-featured-image` / `theme-post-excerpt` widgets when a V4 + dynamic tag combination works — reserve them for cases where the V4 equivalent is not viable. This applies everywhere: singles, archives, loop items, and standalone pages.

## Repeating layouts / detail pages

When the user describes a design that repeats across posts or pages ("each project", "the product detail page", "make every blog post look like this", "each item links to a page like this"), that is ONE `single` / `single-<cpt>` template driven by dynamic data — NOT N duplicated pages. Never loop `elementor/manage-site-parts` `action: create` to make one page per item.

### Condition scoping — include-all + exclude exceptions

Real sites have one repeating design for a post type plus a few one-off exceptions (bespoke Home, a landing page). Default to a broad include with explicit exclusions:
- Posts of a CPT: `include/singular/<cpt>` + `exclude/singular/<cpt>/<id>` per exception. Built-in posts use `post`; a `project` CPT uses `project`.
- Pages: `include/singular/page` + `exclude/singular/page/<id>` for each page with its own design (Home, About, …).
- Ask the user which items are the exceptions when it is not obvious, and call `elementor/list-site-parts` before creating a new single to avoid duplicates.
- Fall back to `include/singular/<cpt>/<id>` only when the user is explicitly designing for one specific post.

### Post Content slot pattern

Every single template has one optional editorial slot: a `theme-post-content` widget wrapped in a full-width `e-div-block`, placed between the fixed hero and the fixed bottom section. Posts with no body render nothing in that slot; posts with body content render it there.

```xml
<e-div-block configuration-id="Post Hero">...</e-div-block>
<e-div-block configuration-id="Post Body">
  <theme-post-content configuration-id="Post Content"></theme-post-content>
</e-div-block>
<e-div-block configuration-id="Post Bottom">...</e-div-block>
```

`theme-post-content` is the widget name. Emit `<theme-post-content>` in `xml_structure` with no `element_config` — the composition write path accepts it as-is.

- Wrap with `e-div-block`, NOT `e-flexbox` — a row-direction default would squeeze the article body. Style the wrapper's `max-width` / `padding`.
- Exactly one `theme-post-content` per single template.
- `theme-post-content` is for the single-template body slot ONLY — never place it inside a loop item, archive, header, footer, or reusable component; the surrounding loop already repeats the article body.

### Dynamic tags for the rest

Title, featured image, excerpt, meta, price, CTA link all use dynamic tags on regular widgets (`e-heading` title, `e-image` src, `e-button` link). Read [elementor://dynamic-tags] for allowed tag names. Do NOT hard-code per-post values — the same template renders every post.

### Loop → detail flow

For a listing (loop) whose items link to a detail page: build the loop with a dynamic link on the item wrapper, then create ONE single template as above with `include/singular/<cpt>` + any exclusions. Permalinks come from the dynamic tag; no per-item page.
