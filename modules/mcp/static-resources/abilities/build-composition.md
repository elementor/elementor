# SITE PARTS (Pro)
If the user asks about a header, footer, 404, single, archive, or search-results, that content lives in a SEPARATE document — not the current page. Call `elementor/list-site-parts` (or `elementor/manage-site-parts` to create) first to get the correct `post_id`, then invoke this tool on that id. This capability requires Elementor Pro; skip when the site-parts tools are not registered.

# RESOURCES (Read before use)
- [elementor://global-classes] - Reusable CSS classes from the active kit; check FIRST before adding inline styles
- [elementor://global-variables] - Design tokens from the active kit; use labels in CSS as `var(--label)` or `var(--label, fallback)`; ONLY variables listed here are valid
- [elementor://interactions/schema] - Native interaction item shape and allowed enums for `interactions`
- [elementor/list-widget-schemas?summary=true] - Available v4 widgets plus the closed V3 allowlist (`nav-menu`, theme-post-* / theme-archive-title)
- `elementor/list-assets` - Images and SVG icons already in the Media Library; call before placing an `e-image` (for real dimensions and `srcset`) and always before an `e-svg` (which needs an uploaded asset to render)
- `elementor/list-components` - User-defined reusable widget compositions; only call when the user explicitly asks to use a component (see COMPONENTS below)

# TOOL SUPPORT
This tool supports v4 elements and a closed V3 allowlist (`nav-menu`, `theme-post-content`, `theme-post-title`, `theme-post-featured-image`, `theme-post-excerpt`, `theme-archive-title`).

V3 mapping (same LLM contract as V4, translated internally):
- `element_config` → raw V3 settings (no schema validation).
- `classes` (global class labels) → V3 `_css_classes` (space-separated string).
- `style` (plain CSS) → V3 `custom_css`, wrapped in `selector { ... }`. **Requires Elementor Pro**; without Pro the style is skipped and a warning is emitted.
- Interactions and V4 nested `&:hover` / `@media (--mobile)` in `style` are not translated to V3 — keep V3 style inputs simple.

# WORKFLOW
1. Check/create global variables via `elementor/manage-global-variable`
2. Check/create global classes via `elementor/manage-classes`
3. Build composition (THIS TOOL) - minimal inline styles; attach existing global classes via `classes`
4. Use returned element IDs for subsequent configuration changes
5. (Only after you build everything) use `elementor/create-preview-link` to generate a preview link and use the browser to validate the work you did.

## CRITICAL: Avoid write conflicts after build-composition
`manage-elements` is a **read → modify → write** operation on the current document. If you call it after `build-composition` using element IDs from a **prior** `get-page-structure` read, it will restore the old tree and silently overwrite what `build-composition` just saved.

**Rules:**
- Only use element IDs from the `resolved_xml` in **this tool's response** for any follow-up `manage-elements` calls — never IDs from an earlier read.
- Prefer adding pseudo-states (`&:hover`, `&:focus`, `&:active`) and breakpoints (`@media (--mobile)`) **inline in the `style` string** during composition, eliminating the need for a follow-up `manage-elements` call entirely.

# COMPONENTS (only when explicitly requested)

**Do NOT call `elementor/list-components` by default.** Compose from raw widgets unless the user explicitly asks to use a component (e.g. "use my Hero component", "insert the Product Card component", "reuse the CTA component I made").

## When the user explicitly asks for a component

1. Call `elementor/list-components` with no arguments and find components whose names match what the user asked for (fuzzy match is fine: "Hero" → "Hero Section", etc.). If more than one component name is a plausible match, do NOT guess — ask the user which one before fetching the schema.
2. If found, call `elementor/list-components` again with `component_ids` set to the id(s) you plan to use (batch multiple in one call) and verify each `overridable_props` covers the customizations the user needs.
3. If a component is missing, archived (`is_archived: true`), or its overridable props do not cover the required customizations, fall back to raw widgets and tell the user why.

## Placement
- Use `<e-component configuration-id="my-hero">` in `xml_structure`. **Leaf tag — no child tags inside it.**
- Configure it under `element_config` like any other widget. The value has the flat shape `{ component_id, overrides? }` (the widget has no other settings). Each override value uses the plain-value shape from `origin_prop_schema` — no `$$type` envelopes, same convention as regular widget settings:

```json
{
  "element_config": {
    "my-hero": {
      "component_id": 42,
      "overrides": {
        "title": "Welcome",
        "cta_url": "https://example.com"
      }
    }
  }
}
```

- `component_id` is required. `overrides` is optional — omit it entirely if you have no overrides to apply.
- Only `override_key`s listed in `overridable_props` are valid. Unknown keys are rejected.
- Do NOT place archived components (`is_archived: true`).
- Components can be mixed with raw widgets in the same composition.

# XML STRUCTURE
- Use widget tags: `<e-button configuration-id="btn1"></e-button>`
- Containers: "e-flexbox", "e-div-block", "e-tabs"
- **Every element MUST have a unique "configuration-id" attribute**
- No attributes, classes, IDs, or text nodes in XML
- Pass the raw XML tags directly as the `xml_structure` string. Do NOT wrap the value in `<![CDATA[ ... ]]>`, code fences, quotes, or any other wrapper — JSON string escaping is the only escaping needed. Wrapping in CDATA turns the whole payload into text and the tool will reject it with `empty_composition`.

## NESTED ELEMENTS
Some elements have internal tree structures (nesting). When using these elements, you MUST build the FULL tree in XML.
- Check `llm_guidance.nesting` in widget schemas for structure requirements
- `llm_guidance.required_direct_children` lists element types that must appear as direct child tags in XML (from widget defaults)
- `allowed_child_types` lists which element types can be nested inside
- `allowed_parents` lists which element types this element can be placed inside

# CONFIGURATION
- Map configuration-id → element_config (props) + style (plain CSS string) + classes (global class labels)
- **element_config uses plain JSON values** — send scalars and objects exactly as shown in the widget schema.
- **Prop names must come from the widget schema (use elementor/get-widget-schema tool with the widget type). Unknown/unsupported keys are NOT rejected — they are skipped and reported in `warnings`, and the build still succeeds. Prefer valid keys so props are not silently dropped.**
- style is a plain CSS string (e.g. `color: red; padding-top: 1rem;`); supports `&:hover`/`&:focus`/`&:active` nesting and `@media (--breakpoint)` blocks (e.g. `@media (--mobile) { font-size: 2rem; }`); the server converts it to native styles. **Use Elementor breakpoint names only** (`--mobile`, `--tablet`, `--laptop`, etc.) — raw pixel queries like `@media (max-width: 768px)` are NOT converted to variants and fall back to `custom_css`, which is stripped by Pro 3.35+.
- classes is configuration-id → array of existing global class **labels** from [elementor://global-classes]
- **CSS shorthand properties may fall back to custom_css which is stripped by Pro 3.35+; prefer longhand properties (e.g., `padding-top`, `padding-right` instead of `padding`)**
- LINKS: a `link` prop is valid only when the target widget's schema (via `elementor/get-widget-schema`) includes a `link` property. On widgets without it, `link` is skipped and reported in `warnings` (the composition still builds) — wrap the element in a linkable container instead. Plain link shape: `{ "destination": "https://example.com", "isTargetBlank": true, "tag": "a" }`
- Retry on errors up to 10x
- Check `llm_guidance.default_settings` in widget schemas — omit only keys listed there from element_config unless the user explicitly asks to change them

## element_config FORMAT
Match the widget schema shape:
- **string / enum / url**: plain string (`"h2"`, `"https://example.com"`)
- **number**: plain number (`42`)
- **boolean**: plain boolean (`true`)
- **html-v3** (title, paragraph, etc.): `{ "content": "Hello", "children": [] }` — `children` is a plain array of child node objects
- **dynamic** (where schema allows): `{ "name": "<tag from elementor://dynamic-tags>", "settings": { ... } }` — settings use plain values per the tag schema; omit `group`
- **image**: two forms, `id` and `url` are mutually exclusive — send one, not both:
  - Library asset (from `elementor/list-assets` tool): `{ "src": { "id": 123 }, "size": "full" }`.
  - External URL: `{ "src": { "url": "https://example.com/photo.jpg" }, "size": "full" }` — works. If no library asset fits and no on-brand external image is available, tell the user which images to upload.
- **svg** (the `svg` prop on `e-svg`): `{ "id": <attachment id from elementor/list-assets with type: "svg"> }`. An external URL on `e-svg` renders an empty div. If no uploaded SVG exists, ask the user to upload one, otherwise omit the icon or use a text label — never fabricate an id.

## GLOBAL VARIABLES
Read [elementor://global-variables] before styling. Create or update via `elementor/manage-global-variable`. Use variable **labels** from that list — not internal ids.

**In `style` (raw CSS):** reference by label only:
- `color: var(--wc26-gold)` or `color: var(--wc26-gold, #C6A15B)`
- `font-family: var(--font-heading)` or `font-size: var(--spacing-lg, 1.5rem)`
- Do NOT use the internal `e-gv-` id prefix (e.g. `var(--e-gv-wc26-gold)` is wrong; use `var(--wc26-gold)`)
- Unrecognized variable references fall back to `custom_css`, which may not render on Pro 3.35+

## GLOBAL CLASSES
Read [elementor://global-classes] before composing. Create or update via `elementor/manage-classes`. Use class **labels** from that list — not internal ids.

**In `classes` (reference-only):** attach existing global classes by label:
- Map configuration-id → array of labels (e.g. `"Section Title": ["hero-heading", "text-muted"]`)
- Create or update classes with `elementor/manage-classes` before referencing them here
- Global classes are prepended before any local styles from `style`; local styles still win on conflicts

# DYNAMIC TAGS
- A value can be made dynamic wherever the widget schema allows a dynamic variant (often a union on the prop or a nested field such as an image's `src`).
- Put the plain dynamic object at that node, in place of the static variant. Read [elementor://dynamic-tags] for allowed tag names and each tag's settings schema.
- Plain dynamic shape: `{ "name": "<allowed tag>", "settings": { ... } }`
- Example (image `src`): `"image": { "src": { "name": "<image tag>", "settings": { ... } }, "size": "full" }`
- Do NOT send `group` (resolved automatically). Populate `settings` strictly per the tag's schema; use `{}` only when it has none.

Note about configuration ids: These names are visible to the end-user, make sure they make sense, related and relevant.

# DESIGN PHILOSOPHY: CONTEXT-DRIVEN CREATIVITY

**Use the user's context aggressively.** Business type, brand personality, target audience, and purpose should drive every design decision. A law firm needs gravitas; a children's app needs playfulness. Don't default to generic.

## SIZING: DEFAULT IS NO SIZE (CRITICAL)

**DO NOT specify height or width unless you have a specific visual reason.**

Flexbox and CSS already handle sizing automatically:
- Containers grow to fit their content
- Flex children distribute space via flex properties, not width/height
- Text elements size to their content

WHEN TO SPECIFY SIZE:
- min-height on ROOT section for viewport-spanning hero (use min-height, NOT height)
- max-width for contained content areas (e.g., max-width: 60rem)
- Explicit aspect ratios for media containers

NEVER SPECIFY:
- height on nested containers (causes overflow)
- width on flex children (use flex-basis or gap instead)
- 100vh on anything except root-level sections
- Any size "just to be safe" - if unsure, OMIT IT

vh units are VIEWPORT-relative. Nested 100vh inside 100vh = 200vh overflow.

GOOD: `<e-flexbox>content naturally sizes</e-flexbox>`
BAD: `<e-flexbox style="height:100vh"><e-div-block style="height:100vh">overflow</e-div-block></e-flexbox>`

## Layout Variety (Break the Template)
- AVOID: Full-width 100vh hero → three columns → testimonials → CTA (every AI does this)
- VARY heights: Use auto-height sections with generous padding (6rem+). Let content breathe
- VARY widths: Not everything spans full width. Use contained sections (max-width: 960px) mixed with edge-to-edge
- ASYMMETRIC grids: 2:1, 1:3, offset layouts. Avoid equal column widths
- Negative space as design element: Large margins create focus and sophistication
- Break alignment intentionally: Offset headings, overlapping elements, broken grids

## Visual Depth & Effects
- Layer elements: Overlapping cards, text over images, floating elements
- Subtle shadows with color tint (not pure black): `box-shadow: 0 20px 60px rgba(<brand-color-here>, 0.15)`
- Gradient overlays on images for text readability
- Border radius variation: Mix sharp (0) and soft (1rem+) corners purposefully
- Backdrop blur for glassmorphism where appropriate
- Micro-interactions via CSS: hover transforms, transitions (0.3s ease)

## Typography with Character
- Display fonts for headlines (from user's brand or contextually appropriate)
- Size contrast: 4rem+ headlines vs 1rem body. Make hierarchy unmistakable
- Letter-spacing: Tight for large headlines (-0.02em), loose for small caps (0.1em)
- Line-height: Tight for headlines (1.1), generous for body (1.6-1.8)
- Text decoration: Underlines, highlights, gradient text for emphasis

## Color with Purpose
- Extract palette from user context (brand colors, industry norms, mood)
- 60-30-10 rule: dominant, secondary, accent
- Tinted neutrals over pure grays: warm (#faf8f5, #2d2a26) or cool (#f5f7fa, #1e2430)
- Color blocking: Large colored sections create visual rhythm
- Gradient directions: Diagonal (135deg, 225deg) feel more dynamic than vertical

## Spacing Strategy
- Section padding: 6rem-10rem vertical, creating breathing room
- Rhythm variation: Tight groups (2rem) with generous gaps between (6rem)
- Use rem/em exclusively for responsive scaling
- Generous padding on CTAs: min 1rem 2.5rem

# INTERACTIONS
Attach element interactions via the `interactions` parameter — a record mapping `configuration-id` → array of native-shape interaction items. Read [elementor://interactions/schema] for the full shape and allowed enum values. Send `[]` for a `configuration-id` to clear its interactions.

# HARD CONSTRAINTS
- Variables ONLY from [elementor://global-variables]; reference **labels** in `style` as `var(--label)` — the `e-gv-` prefix is internal only
- Classes ONLY from [elementor://global-classes]; reference **labels** in `classes` — internal `g-` ids must not be sent in `classes`
- SVG widgets require an uploaded attachment: discover one via `elementor/list-assets` with `type: "svg"` and reference it by `id`. External URLs on `e-svg` render an empty div. When none exists, ask the user to upload, otherwise omit the icon or use a text label.
- Check `llm_guidance` in widget schemas (`default_styles`, nesting, required children)

# MODE
Redesigning an existing parent? Use `mode: 'replace_children'` with the parent's id — one call replaces its children. Default `'append'` keeps existing content.
- `append` (default): Insert new elements as children of `parent_id`, preserving existing children.
- `replace_children`: Remove all direct children of `parent_id` first, then insert new elements. The response includes `removed_element_ids` listing what was removed.
- When `parent_id: 'document'` + `mode: 'replace_children'`, all top-level elements are removed — use this to redesign the whole page.

# PARAMETERS
- **post_id**: WordPress post ID of the document to mutate
- **xml_structure**: Valid XML with configuration-id attributes on every element
- **element_config**: configuration-id → plain widget settings (see PLAIN element_config FORMAT). For `<e-component>` config-ids the value is `{ component_id, overrides? }` (see COMPONENTS section).
- **style**: configuration-id → plain CSS string (e.g. `"color: red; padding-top: 1rem;"`). Supports `&:hover`/`&:focus`/`&:active` nesting and `@media(--breakpoint)` blocks (e.g. `@media(--mobile)`). Variables by **label** via `var(--label)`
- **classes**: configuration-id → list of existing global class **labels** to attach
- **interactions**: configuration-id → array of native-shape interaction items (see INTERACTIONS section; read [elementor://interactions/schema] for allowed values)
- **parent_id**: ID of the parent container (omit to insert at document root)
- **mode**: `'append'` (default) or `'replace_children'` — see MODE section above
- **dry_run**: If true, validate and return resolved tree without persisting

# EXAMPLE
Section with heading + button (NO explicit heights - content sizes naturally):
```json
{
  "post_id": 123,
  "xml_structure": "<e-flexbox configuration-id=\"Main Section\"><e-heading configuration-id=\"Section Title\"></e-heading><e-button configuration-id=\"Call to Action\"></e-button></e-flexbox>",
  "element_config": {
    "Section Title": {
      "tag": "h2",
      "title": { "content": "Welcome", "children": [] }
    }
  },
  "style": {
    "Main Section": "padding: 6rem 4rem; background: linear-gradient(135deg, #faf8f5 0%, #f0ebe4 100%); @media(--mobile) { padding: 3rem 1.5rem; }",
    "Section Title": "font-size: 3.5rem; color: #2d2a26; &:hover { color: var(--wc26-gold); } @media(--mobile) { font-size: 2.25rem; } @media(--tablet) { font-size: 2.75rem; }"
  }
}
```
Note: No height/width specified on any element - flexbox handles layout automatically.

# FURTHER INSTRUCTIONS
Element IDs in the returned XML represent actual widgets. Use these IDs for subsequent styling or configuration changes.
