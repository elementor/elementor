# RESOURCES (Read before use)
- [elementor://global-classes] - Reusable CSS classes from the active kit; check FIRST before adding inline styles
- [elementor://global-variables] - Design tokens from the active kit; use labels in CSS as `var(--label)` or `var(--label, fallback)`; ONLY variables listed here are valid
- [elementor/list-widget-schemas?summary=true] - Available v4 widgets

# TOOL SUPPORT
This tool supports v4 elements only.

# WORKFLOW
1. Check/create global variables via `elementor/manage-global-variable`
2. Check/create global classes via `elementor/manage-classes`
3. Build composition (THIS TOOL) - minimal inline styles; attach existing global classes via `classes`
4. Use returned element IDs for subsequent configuration changes

# XML STRUCTURE
- Use widget tags: `<e-button configuration-id="btn1"></e-button>`
- Containers: "e-flexbox", "e-div-block", "e-tabs"
- **Every element MUST have a unique "configuration-id" attribute**
- No attributes, classes, IDs, or text nodes in XML
- Pass the raw XML tags directly as the `xml_structure` string. Do NOT wrap the value in `<![CDATA[ ... ]]>`, code fences, quotes, or any other envelope — JSON string escaping is the only escaping needed. Wrapping in CDATA turns the whole payload into text and the tool will reject it with `empty_composition`.

## NESTED ELEMENTS
Some elements have internal tree structures (nesting). When using these elements, you MUST build the FULL tree in XML.
- Check `llm_guidance.nesting` in widget schemas for structure requirements
- `llm_guidance.required_direct_children` lists element types that must appear as direct child tags in XML (from widget defaults)
- `allowed_child_types` lists which element types can be nested inside
- `allowed_parents` lists which element types this element can be placed inside

# CONFIGURATION
- Map configuration-id → element_config (props) + style (raw CSS declarations) + classes (global class labels)
- element_config PropValues require `$$type` matching schema
- **Prop names must come from the widget schema (use elementor/get-widget-schema tool with the widget type). Unknown/unsupported keys are NOT rejected — they are skipped and reported in `warnings`, and the build still succeeds. Prefer valid keys so props are not silently dropped.**
- style is raw CSS (property → value strings); the server converts it to native styles
- classes is configuration-id → array of existing global class **labels** from [elementor://global-classes]
- **CSS shorthand properties may fall back to custom_css which is stripped by Pro 3.35+; prefer longhand properties (e.g., `padding-top`, `padding-right` instead of `padding`)**
- LINKS: a `link` prop is valid only when the target widget's schema (via `elementor/get-widget-schema`) includes a `link` property. On widgets without it, `link` is skipped and reported in `warnings` (the composition still builds) — wrap the element in a linkable container instead. Link PropValue shape: `{ "$$type": "link", "value": { "destination": { "$$type": "url", "value": "https://example.com" }, "isTargetBlank": { "$$type": "boolean", "value": true }, "tag": { "$$type": "string", "value": "a" } } }`
- Retry on errors up to 10x
- Check `llm_guidance.default_settings` in widget schemas — omit only keys listed there from element_config unless the user explicitly asks to change them

## GLOBAL VARIABLES
Read [elementor://global-variables] before styling. Create or update via `elementor/manage-global-variable`. Use variable **labels** from that list — not internal ids.

**In `style` (raw CSS):** reference by label only:
- `color: var(--wc26-gold)` or `color: var(--wc26-gold, #C6A15B)`
- `font-family: var(--font-heading)` or `font-size: var(--spacing-lg, 1.5rem)`
- Do NOT use the internal `e-gv-` id prefix (e.g. `var(--e-gv-wc26-gold)` is wrong; use `var(--wc26-gold)`)
- Unrecognized variable references fall back to `custom_css`, which may not render on Pro 3.35+

**In `element_config` (PropValues):** when the widget schema allows a global-variable type, send the label as the value:
- `{ "$$type": "global-color-variable", "value": "wc26-gold" }`
- `{ "$$type": "global-font-variable", "value": "font-heading" }`
- `{ "$$type": "global-size-variable", "value": "spacing-lg" }`

## GLOBAL CLASSES
Read [elementor://global-classes] before composing. Create or update via `elementor/manage-classes`. Use class **labels** from that list — not internal ids.

**In `classes` (reference-only):** attach existing global classes by label:
- Map configuration-id → array of labels (e.g. `"Section Title": ["hero-heading", "text-muted"]`)
- Create or update classes with `elementor/manage-classes` before referencing them here
- Global classes are prepended before any local styles from `style`; local styles still win on conflicts

# DYNAMIC TAGS
- A value can be made dynamic wherever its schema exposes a `"$$type": "dynamic"` variant. This may be the property root OR a NESTED field (e.g. an image's `src`, not the whole `image`).
- Put the dynamic object EXACTLY at that node, in place of the static variant. The variant's `name` lists the allowed tags; read [elementor://dynamic-tags] for each tag's settings schema.
- Provide at that node: `{ "$$type": "dynamic", "value": { "name": "<allowed tag>", "settings": { ... } } }`
- Example (image): `{ "$$type": "image", "value": { "src": { "$$type": "dynamic", "value": { "name": "<image tag>", "settings": { ... } } } } }`
- Do NOT send `group` (it is resolved automatically). Populate `settings` strictly per the tag's schema; use `{}` only when it has none.

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

# HARD CONSTRAINTS
- Variables ONLY from [elementor://global-variables]; reference **labels** in `style` as `var(--label)` and in `element_config` as the `value` — the `e-gv-` prefix is internal only
- Classes ONLY from [elementor://global-classes]; reference **labels** in `classes` — internal `g-` ids must not be sent in `classes`
- Avoid SVG widgets unless assets are pre-uploaded
- Check `llm_guidance` in widget schemas (`default_styles`, nesting, required children)

# MODE
Redesigning an existing parent? Use `mode: 'replace_children'` with the parent's id — one call replaces its children. Default `'append'` keeps existing content.
- `append` (default): Insert new elements as children of `parent_id`, preserving existing children.
- `replace_children`: Remove all direct children of `parent_id` first, then insert new elements. The response includes `removed_element_ids` listing what was removed.
- When `parent_id: 'document'` + `mode: 'replace_children'`, all top-level elements are removed — use this to redesign the whole page.

# PARAMETERS
- **post_id**: WordPress post ID of the document to mutate
- **xml_structure**: Valid XML with configuration-id attributes on every element
- **element_config**: configuration-id → widget PropValues
- **style**: configuration-id → raw CSS declarations (property → value strings; no selectors); variables by **label** via `var(--label)`
- **classes**: configuration-id → list of existing global class **labels** to attach
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
    "Main Section": { "tag": { "$$type": "string", "value": "section" } },
    "Section Title": { "tag": { "$$type": "string", "value": "h2" } }
  },
  "style": {
    "Main Section": {
      "padding": "6rem 4rem",
      "background": "linear-gradient(135deg, #faf8f5 0%, #f0ebe4 100%)"
    },
    "Section Title": {
      "font-size": "3.5rem",
      "color": "#2d2a26"
    }
  }
}
```
Note: No height/width specified on any element - flexbox handles layout automatically.

# FURTHER INSTRUCTIONS
Element IDs in the returned XML represent actual widgets. Use these IDs for subsequent styling or configuration changes.
