# HOW THIS TOOL WORKS — READ FIRST (the #1 cause of broken builds)
This tool takes THREE separate inputs. **The XML is STRUCTURE ONLY.** Text and styles are NOT written inside the XML — they go in separate parameters keyed by `configuration-id`. Writing HTML-style XML (inline `style=`, text between tags) is silently stripped → you get "This is a title" placeholders and no styling. That is the most common failure.

❌ WRONG (HTML-style — text + styles are DROPPED):
`<e-heading configuration-id="hero-title" tag="h1" style="font-size:5rem;color:#fff">Your Headline</e-heading>`

✅ RIGHT — three params, separated (element_config uses PLAIN JSON values):
- `xml_structure` (tags + configuration-id ONLY):
  `<e-heading configuration-id="hero-title"></e-heading>`
- `element_config` (text + props, keyed by configuration-id):
  `{ "hero-title": { "tag": "h1", "title": { "content": "Your Headline", "children": [] } } }`
- `style` (raw CSS, keyed by configuration-id):
  `{ "hero-title": { "font-size": "5rem", "color": "#fff" } }`

Hard structural rules (ignoring any of these breaks the build):
- NO `style=`, `class`, `id`, or any attribute except `configuration-id` in the XML. NO text between tags.
- NO `<![CDATA[...]]>` wrapper and NO `<?xml?>` declaration — pass raw tags as the string.
- Containers are ONLY `e-flexbox`, `e-div-block`, `e-grid`, `e-tabs`. **There is NO `e-section`** — for a section, use `e-flexbox`/`e-div-block` and set `tag: "section"` in element_config.
- Body text widget is `e-paragraph` (there is no `e-text`).

**LAYOUT-ENGINE TRUTHS (design within these — most "broken/weird" output comes from ignoring them):**
- **`e-flexbox` defaults to COLUMN.** Anything meant to be a horizontal row (nav bar, button group, footer columns row, pill row) MUST set `flex-direction:row` explicitly — or it stacks vertically. This is the #1 nav failure.
- **STATIC & STACKED only.** No hover/transition/animation; **no scroll-driven / sticky / pinned / horizontal-scroll sections** (they don't exist here — attempting one yields an empty-half + overflowing-half mess). Build plain full-width sections stacked top to bottom.
- **NEVER `transform: rotate()`** on any element — banned, looks sloppy. No absolute-positioned overlapping/floating cards — use grid/flex side-by-side.
- **Full width, no overflow.** Root sections `width:100%` (NEVER `100vw` → causes a horizontal-scroll sliver at the page edge). Nothing wider than the viewport.
- **Text over an image/dark background** MUST have an explicit light `color` AND a dark overlay on the container (e.g. `linear-gradient(rgba(0,0,0,.45),rgba(0,0,0,.45))` over the image) — never dark text on a photo.
- **Restrained sizing** — don't max out type/space; a hero display ~3–5rem, section headings ~2–3rem. Oversized-everything reads amateur.

# HARD RULES — EVERY BUILD, DO NOT SKIP (these override laziness)
1. **Design system FIRST.** Create global VARIABLES (colors, fonts, sizes) via `elementor/manage-global-variable` and reusable CLASSES via `elementor/manage-classes` before composing. Variable labels MUST be lowercase-dash (`dark-brown`, NOT "Dark Brown") or they error. Style via classes + `var(--label)` — not scattered inline hex.
2. **Real fonts (pairing encouraged).** Use ONE or TWO distinctive Google Fonts families — a common, tasteful choice is a display/heading font (e.g. Space Grotesk, Fraunces, DM Serif Display) paired with a legible body font, each stored as its own variable (`--heading-font`, `--body-font`). Use each family's EXACT name. NEVER `system-ui`/`-apple-system`, NEVER Inter/Roboto/Arial, NEVER a fallback stack like `"X, sans-serif"` in a single value (a stack does not load → renders as serif).
3. **Populate ALL text.** Every heading `title`, paragraph `text`, and button `text` gets REAL content via `element_config` in the html-v3 shape `{ "content": "…", "children": [] }` (see element_config FORMAT). NEVER leave the widget default ("This is a title" / "Type your paragraph here") — that is a failed build.
4. **Real images.** Set each `e-image` `image` with the exact shape `{ "src": { "url": "https://…" }, "size": "full" }` using an on-theme Unsplash/Pexels direct image URL. A gray box / broken slot is a failed build. If no fit, ask the user.
5. **Read [elementor://style/best-practices] + [elementor://style/widget-patterns] before composing** — they prevent generic "AI slop". Build fluid for mobile per [elementor://style/responsive] (rem/em only, `clamp()`, wrapping flex).
6. **Static only.** No hover/transition/animation (the engine writes a single desktop/no-state variant — states are silently dropped); gradients need an explicit angle (`135deg`).
7. **Real controls, never fake ones.** Anything a user would click is a real link/button — never a paragraph or div styled to look clickable. Nav items → linked `e-button` in a `tag:"header"` container; a whole clickable card → a container (`e-div-block`/`e-flexbox`/`e-grid`) with `tag:"a"` + a `link`. A label/CTA sitting ON an image → a linked container with the photo as `background-image` and the label as a child (NOT an absolutely-positioned button over an `<e-image>`). A "faux-CTA" is a functional defect. Full patterns: [elementor://style/interactive].
8. **Reuse via classes.** Any styling used ≥2× becomes a shared global class attached via the `classes` param — do NOT repeat the same inline `style` across elements (that auto-creates junk per-element `"local"` classes). See GLOBAL CLASSES.
9. **Icons: real asset or omit — NEVER fabricate.** Per [elementor://style/icons]: use an icon only when a real UPLOADED asset exists (`e-svg` with an uploaded media asset `{id,url}`, or a PNG via `e-image`). If none, OMIT the icon or use a text label. Do NOT auto-build icons from `e-div-block`/`e-flexbox` primitives, NEVER a unicode/emoji glyph, NEVER a data-URI `background-image` (dropped), NEVER `e-svg` with an external URL (renders an empty div).
10. **Inventory the reference FIRST.** Before composing, list every text block, image, ICON, and INTERACTIVE element from the reference (see WORKFLOW step 0). An icon or control you don't inventory is one you'll fake — this is the #1 cause of missed hamburgers, glyph-arrows, and paragraph "buttons".

If you did not do 1–10, the build is not done. Do not report success with placeholder text, system fonts, empty images, faked controls, faked/empty icons, or repeated inline styles that should be a class.

# RESOURCES (Read before use)
- [elementor://global-classes] - Reusable CSS classes from the active kit; check FIRST before adding inline styles
- [elementor://global-variables] - Design tokens from the active kit; use labels in CSS as `var(--label)` or `var(--label, fallback)`; ONLY variables listed here are valid
- [elementor/list-widget-schemas?summary=true] - Available v4 widgets
- [elementor://style/best-practices] - **READ THIS FIRST.** Design-quality / anti-"AI slop" guide: typography, color, spacing, depth, hierarchy. It reflects what this tool can actually render — do not add motion/effects it warns against.
- [elementor://style/widget-patterns] - UI pattern → widget-combination guide (hero, nav, cards, pricing, forms, tabs). Use these structures as starting points instead of inventing layouts from scratch.
- [elementor://style/responsive] - How to build ONE desktop composition that also works on mobile (fluid units, `clamp()`, wrapping flex, `auto-fit` grids). The tool cannot emit per-breakpoint overrides — build intrinsically fluid.
- [elementor://style/design-taste] - **Your source of taste (self-contained):** curated palettes (with hexes), type scales, font pairings, rhythm/weight tokens, the anti-slop kill-list, and hard UX numbers — all adapted to engine limits, plus the plan-first and polish-gate steps.
- [elementor://style/icons] - Icons are real assets or nothing: use an uploaded `e-svg`/PNG asset, else OMIT or use a text label. Never fabricate from primitives, glyphs, data-URIs, or external `e-svg` URLs.
- [elementor://style/interactive] - Real controls: inventory clickable elements, use `e-button`/linked containers, semantic nav, forms, clickable cards, and buttons on images.
- [elementor://interactions/schema] - Native interaction item shape and allowed enums for the `interactions` parameter (read only when adding interactions).

# TOOL SUPPORT
This tool supports v4 elements only.

# WORKFLOW
0. **Inventory the reference** (if any): list every text block, image, ICON (hamburger/arrows/chevrons/logos/social), and INTERACTIVE element (buttons, nav items, links, form fields, anything clickable — including labels/CTAs on images). This inventory is what stops you faking icons and controls. Then read [elementor://style/best-practices] + [elementor://style/design-taste] and commit to a design system FIRST (font pairing, 60-30-10 palette, type scale, one signature move) before placing any element
1. Check/create global variables via `elementor/manage-global-variable`
2. Check/create global classes via `elementor/manage-classes`
3. Build composition (THIS TOOL) — prefer **one ROOT-level section per call** (hero, nav, features, footer, …) with default `append` at document root, not the whole page in one XML. Minimal inline styles; attach existing global classes via `classes`.
4. Use returned element IDs for subsequent configuration changes or as `parent_id` when adding nested content under an existing section.

# DESIGN SYSTEM STATE (branch before styling)
Read [elementor://global-variables] and [elementor://global-classes], then branch:
- **Rich system** (colors + fonts + sizes defined): CONSTRAINED MODE. Snap every color/font/size to existing tokens via `var(--label)`. Zero rogue hex values. Match the site's established look — consistency over novelty.
- **Partial system** (some tokens, gaps or conflicts): use what exists; propose additions to the user before creating them; flag conflicts (e.g. 3 near-identical blues) instead of adding a 4th.
- **Clean slate** (no tokens): CREATIVE MODE. Derive a full system from context (business type, mood, audience), CREATE the global variables first (colors, fonts, key sizes), then build against them — never hard-code values that should be tokens.

# PAGE TEMPLATE (set this or the theme wraps your design)
For a full-page / reference-matched build, set the document to **Elementor Canvas** so the WordPress theme's header, page title, and footer do NOT wrap the composition — call `elementor/update-page-settings` with `{ "post_id": <id>, "settings": { "template": "elementor_canvas" } }`. Use `"elementor_header_footer"` (Full Width) only when you intend to keep the theme's header/footer. Leaving the default theme template on a full-bleed design is the #1 "looks broken" defect.

# XML STRUCTURE
- Use widget tags: `<e-button configuration-id="btn1"></e-button>`
- Containers: "e-flexbox" (1-D row/column layout), "e-div-block" (plain block box), "e-grid" (2-D rows+columns), "e-tabs". Choosing the right one matters — see the "CHOOSING A CONTAINER" section in [elementor://style/widget-patterns]. Do not default everything to flexbox.
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
- Map configuration-id → element_config (props) + style (raw CSS declarations) + classes (global class labels)
- **element_config uses plain JSON values** — send scalars and objects exactly as shown in the widget schema.
- **Prop names must come from the widget schema (use elementor/get-widget-schema tool with the widget type). Unknown/unsupported keys are NOT rejected — they are skipped and reported in `warnings`, and the build still succeeds. Prefer valid keys so props are not silently dropped.**
- style is raw CSS (property → value strings); the server maps supported declarations to native styles — anything unmapped lands in `custom_css` (non-fatal warning; may not render on Pro 3.35+). Prefer longhands for layout, type, and color (e.g. `padding-top`, `border-…`); a few `custom_css` fallbacks are fine when no native prop exists (e.g. per-side border color, an exotic background you could not split).
- classes is configuration-id → array of existing global class **labels** from [elementor://global-classes]
- LINKS: a `link` prop is valid only when the target widget's schema (via `elementor/get-widget-schema`) includes a `link` property. On widgets without it, `link` is skipped and reported in `warnings` (the composition still builds) — wrap the element in a linkable container instead. Plain link shape: `{ "destination": "https://example.com", "isTargetBlank": true, "tag": "a" }`
- Retry on errors up to 10x
- Check `llm_guidance.default_settings` in widget schemas — omit only keys listed there from element_config unless the user explicitly asks to change them

## element_config FORMAT
**⚠ SEND PLAIN, UNWRAPPED VALUES. NEVER use a `$$type`/`value` wrapper in `element_config`.** The widget schema you get from `elementor/get-widget-schema` is already plain JSON, and the engine's resolver wraps values internally. If YOU wrap them, they will NOT resolve — you get `Property "X" on "e-*" could not be resolved`. Elementor's *stored/persisted* format uses `$$type`; the input you SEND does not. Ignore any `$$type` you may see in stored page JSON, internal engine code, or old examples — that is not the input shape.
- ❌ WRONG: `"tag": { "$$type": "string", "value": "h2" }`  → fails to resolve
- ❌ WRONG: `"title": { "content": { "$$type": "string", "value": "Hello" } }`  → fails to resolve
- ✅ RIGHT: `"tag": "h2"`, `"title": { "content": "Hello", "children": [] }`

Match the widget schema shape:
- **string / enum / url**: plain string (`"h2"`, `"https://example.com"`)
- **number**: plain number (`42`)
- **boolean**: plain boolean (`true`)
- **html-v3** (title, paragraph, etc.): `{ "content": "Hello", "children": [] }` — `children` is a plain array of child node objects
- **dynamic** (where schema allows): `{ "name": "<tag from elementor://dynamic-tags>", "settings": { ... } }` — settings use plain values per the tag schema; omit `group`
- **image**: `{ "src": { "url": "https://example.com/photo.jpg", "alt": "Description" }, "size": "full" }` — `url` alone is sufficient for any external or placeholder image (e.g. `https://placehold.co/300x400`). `id` is only required for images already in the WordPress media library; omit it for all other cases. `alt` is optional but recommended for accessibility.

## GLOBAL VARIABLES
Read [elementor://global-variables] before styling. Create or update via `elementor/manage-global-variable`. Use variable **labels** from that list — not internal ids.

**EXACT CALL SHAPE (this tool is BULK — there is NO top-level `action`).** The one required param is `operations`, an array (1–50). Each item needs `action` (`create`/`update`/`delete`); `create` needs `type`+`label`+`value`, `update` needs `id`+`label`+`value`, `delete` needs `id`. `type` is one of `global-color-variable`, `global-font-variable`, `global-size-variable`, `global-custom-size-variable`. Create the WHOLE design system in ONE call (labels/values below are illustrative placeholders — substitute the palette and fonts from the design system you chose):
```json
{ "operations": [
  { "action": "create", "type": "global-color-variable", "label": "brand-primary", "value": "#1a1a2e" },
  { "action": "create", "type": "global-color-variable", "label": "brand-accent",  "value": "#e94560" },
  { "action": "create", "type": "global-font-variable",  "label": "heading-font",  "value": "Space Grotesk" },
  { "action": "create", "type": "global-font-variable",  "label": "body-font",     "value": "Work Sans" }
] }
```
Do NOT send `{ "action": "create", "type": …, "label": … }` at the top level — that is the OLD single-variable shape and the tool rejects it with "operations is a required property". If a call errors, fix the payload shape/label and retry — NEVER give up on the design system and fall back to inline hex (that reintroduces the no-classes / junk-`local`-class defect).

**Variable labels MUST be lowercase, dash-separated, no spaces or capitals** — `dark-brown`, `heading-font`, `spacing-lg`. A label like `Dark Brown` is rejected; if create errors, fix the label and retry — do not abandon variables and inline raw hex instead.
**In `style`, reference a font by its single exact family name (`font-family: var(--heading-font)` or `font-family: Space Grotesk`) — never a fallback stack like `Space Grotesk, sans-serif`, which fails to load and renders as serif. Pairing two families (heading + body) is good taste; just keep each `font-family` value a single exact name.**

**In `style` (raw CSS):** reference by label only:
- `color: var(--brand-primary)` or `color: var(--brand-primary, #1a1a2e)`
- `font-family: var(--font-heading)` or `font-size: var(--spacing-lg, 1.5rem)`
- Do NOT use the internal `e-gv-` id prefix (e.g. `var(--e-gv-brand-primary)` is wrong; use `var(--brand-primary)`)
- Unrecognized variable references fall back to `custom_css`, which may not render on Pro 3.35+

## GLOBAL CLASSES — MANDATORY for anything repeated
Read [elementor://global-classes] before composing. Create or update via `elementor/manage-classes`. Use class **labels** from that list — not internal ids.

**Why this matters:** if you style every element only through the per-element `style` param, the tool auto-creates one junk class labelled `"local"` per element — dozens of near-duplicate style blocks and a Classes panel showing only `local`. That is the signature of an unreasoned, un-crafted build. Create real, named classes for repeated patterns instead.

**In `classes` (reference-only):** attach existing global classes by label:
- Map configuration-id → array of labels (e.g. `"Section Title": ["hero-heading", "text-muted"]`)
- Create the class with `elementor/manage-classes` BEFORE referencing it here — an unknown label errors (the tool resolves labels→ids against the kit).
- Global classes are prepended before any local styles from `style`; local styles still win on conflicts — so use a class for the shared base and `style` only for a genuine one-off override.
- **Gate:** any styling pattern used ≥2× (cards, nav links, buttons, section shells, eyebrows) MUST be a shared class. Per-element `style` is for one-offs only. Two elements sharing styling without sharing a class = a defect to fix.

# DYNAMIC TAGS
- A value can be made dynamic wherever the widget schema allows a dynamic variant (often a union on the prop or a nested field such as an image's `src`).
- Put the plain dynamic object at that node, in place of the static variant. Read [elementor://dynamic-tags] for allowed tag names and each tag's settings schema.
- Plain dynamic shape: `{ "name": "<allowed tag>", "settings": { ... } }`
- Example (image `src`): `"image": { "src": { "name": "<image tag>", "settings": { ... } }, "size": "full" }`
- Do NOT send `group` (resolved automatically). Populate `settings` strictly per the tag's schema; use `{}` only when it has none.

Note about configuration ids: These names are visible to the end-user, make sure they make sense, related and relevant.

# DESIGN PHILOSOPHY: CONTEXT-DRIVEN CREATIVITY

**Use the user's context aggressively.** Business type, brand personality, target audience, and purpose should drive every design decision. A law firm needs gravitas; a children's app needs playfulness. Don't default to generic.

## PAGE IDENTITY (commit before first section)
Before the first `append`, commit in a short internal plan:
- **layout identity** in 2–3 words (e.g. "editorial magazine", "brutalist grid", "warm boutique")
- **palette vibe** (from design-taste §1) and **type scale tier** (from design-taste §2)
- **one signature move** for the whole page (design-taste §5 / widget-patterns §18)

Every subsequent section is checked against this identity. If a section drifts into the safe template (centered hero → 3 equal cards → testimonials → CTA), stop and swap in the signature move or a non-boxy recipe.

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
- NO hover states, transitions, or animations — this tool writes a single desktop/no-state style variant, so states are silently dropped. Create dynamism through static depth instead (layering, shadows, contrast).

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
- Icons: real asset or omit — see [elementor://style/icons]. `e-svg` needs an UPLOADED media asset `{id,url}` (external URL renders an empty div; data-URI `background-image` is dropped); a PNG `e-image` also works. If no uploaded asset exists, OMIT the icon or use a text label. Do NOT build icons from primitives, and never a unicode glyph.
- Check `llm_guidance` in widget schemas (`default_styles`, nesting, required children)

# MODE
Prefer section-by-section assembly: each call adds one top-level section via `append` (default). Use `replace_children` only to redesign an existing parent (or the whole page via `parent_id: 'document'`).
- `append` (default): Insert new elements as children of `parent_id`, preserving existing children.
- `replace_children`: Remove all direct children of `parent_id` first, then insert new elements. The response includes `removed_element_ids` listing what was removed.
- When `parent_id: 'document'` + `mode: 'replace_children'`, all top-level elements are removed — use this to redesign the whole page.

# PARAMETERS
- **post_id**: WordPress post ID of the document to mutate
- **xml_structure**: Valid XML with configuration-id attributes on every element
- **element_config**: configuration-id → plain widget settings (see PLAIN element_config FORMAT)
- **style**: configuration-id → raw CSS declarations (property → value strings; no selectors); variables by **label** via `var(--label)`
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
