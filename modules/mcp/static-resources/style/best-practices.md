# DESIGN QUALITY IMPERATIVE

You are generating designs for real users who expect distinctive, intentional aesthetics - NOT generic AI output.

**The Core Challenge**: Large language models naturally converge toward statistically common design patterns during generation. This creates predictable, uninspired results that users describe as "AI slop": safe color schemes, default typography hierarchies, minimal contrast, and timid spacing.

**Your Mission**: Actively resist distributional convergence by making intentional, distinctive design choices across all aesthetic dimensions. Every design decision should have a clear purpose tied to visual hierarchy, brand personality, or user experience goals.

When in doubt between "safe" and "distinctive," choose distinctive - users can always request refinements, but they cannot salvage generic foundations.

> **Where taste comes from.** The deep, general design references — curated palettes, type scales & font pairings, layout composition, the AI-slop kill-list, and hard UX numbers (contrast, tap targets, spacing) — live in the cross-skill design skills (`color`, `typography`, `layout`, `anti-ai-design-slop`, `ui-ux-patterns`, `shadows`, `polish`, `responsive`). Use them as your source of taste. [elementor://style/design-taste] tells you exactly which of that guidance to apply here and where Elementor's static-only engine forces an override (no motion/hover, giant headlines via `clamp()` not SVG, gradients need an angle, prefer longhands). Plan the page first and run a polish/space audit at the end — both are described there.

---

# DESIGN VECTORS - Concrete Implementation Guidance

## 1. Typography & Visual Hierarchy

### Avoid Distributional Defaults:
- NO generic sans-serifs as primary typefaces (Inter, Roboto, Arial, Helvetica)
- NO timid size ratios (1.2x, 1.5x scaling)
- NO uniform font weights (everything at 400 or 600)

### Intentional Alternatives:
- **For Technical/Modern**: Consider monospace headlines (JetBrains Mono, Space Mono, IBM Plex Mono) paired with clean body text
- **For Editorial/Elegant**: Consider serif headlines (Playfair Display, Fraunces, Cormorant, Crimson Text) with sans-serif body
- **For Playful/Creative**: Consider display fonts with character (Bebas Neue, Anton, Space Grotesk), paired with highly legible body text

### Font Loading Rule (CRITICAL):
Fonts load automatically ONLY if the family name is in Elementor's registered font list (~1,500 Google Fonts + Arial, Tahoma, Verdana, Helvetica, Times New Roman, Trebuchet MS, Georgia). An unregistered name (e.g. "SF Mono", a made-up name, or a niche foundry font) renders NO font link and silently falls back to a system default — defeating the typography entirely. Use exact Google Fonts family names.

**NEVER write a CSS fallback stack.** Each `font-family` value must be a single exact family name — `font-family: Space Grotesk` — NOT `font-family: "Space Grotesk, sans-serif"`. A stack does not match the registry, so NO font loads and the element falls back to the browser default (headings render as serif because their default style is `all: unset`). One family name per value, nothing after it.

This is a rule about each *value*, NOT a limit on how many fonts the page uses. A **font pairing is good taste** — e.g. a display/heading family (`var(--heading-font)`) plus a distinct legible body family (`var(--body-font)`). Store each as its own global variable and apply the heading font to headings and the body font to paragraphs. Two well-chosen families read as more crafted than one family everywhere; just never combine them into a single stacked value.

If a design reference uses a font outside Google Fonts, pick the closest Google Fonts match and tell the user which font to install manually if they want the original.

### Scale & Contrast Implementation (use rem/em, never px):
- Headline-to-body size ratios: 3x minimum (e.g., 3rem+ headline vs 1rem body)
- Use extreme weight contrasts: pair weight-100 or 200 with weight-800 or 900
- Line height contrasts: tight headlines (1.1) vs. generous body (1.7)
- Letter spacing: compressed headlines (-0.02em to -0.05em) vs. open small text (0.03em+)

## 2. Color & Theme Strategy

### Avoid Distributional Defaults:
- NO purple gradients or blue-purple color schemes (massively overrepresented in AI output)
- NO evenly-distributed color palettes (3-4 colors used equally)
- NO timid pastels or all-neutral schemes
- NO #333333, #666666, #999999 grays

### Intentional Alternatives:
- **Commit to a Dominant Color**: Choose ONE primary brand color that appears in 60-70% of colored elements
- **Sharp Accent Strategy**: Use 1-2 high-contrast accent colors sparingly (10-15% of colored elements)
- **Neutrals with Personality**: Replace pure grays with warm (#3d3228, #f5f1ed) or cool (#2a2f3d, #f0f2f5) tinted neutrals

### Color Psychology Mapping:
- Energy/Action → Warm reds, oranges, yellows (NOT purple/blue)
- Trust/Calm → Deep teals, forest greens (NOT generic blue)
- Luxury/Premium → Deep burgundy, emerald, charcoal with gold accents
- Playful/Creative → Unexpected combinations (coral + mint, mustard + navy)

## 3. Spatial Design & White Space

### Avoid Distributional Defaults:
- NO uniform spacing (everything 1rem or 1.5rem)
- NO cramped layouts that maximize content density
- NO default container widths (75rem/1200px everywhere)

### Intentional Alternatives (use rem/em, never px):
- **Breathing Room**: Use generous white space as a design element (5-8rem vertical spacing between sections)
- **Asymmetric Spacing**: Vary padding dramatically (small: 0.75rem, medium: 3rem, large: 6rem)
- **Content Width Strategy**:
  - Reading content: max 65-75 characters (~40rem)
  - Hero sections: asymmetric layouts, not centered blocks
  - Cards/components: vary sizes intentionally, not uniform grids

## 4. Motion & Depth (CAPABILITY-AWARE — read carefully)

**What this tool can emit today is STATIC styling only.** The following are silently stripped or rejected — DO NOT use them, they will not render:
- `animation` / `@keyframes` — rejected outright (dropped, not even kept as custom CSS)
- `:hover` / `:focus` / `:active` states — cannot be expressed; the tool only writes default-state desktop styles
- `transition` — it converts, but with no hover/state to transition *to* it is inert, and easing/delay are dropped. Do not rely on it for effect.

Also NOT possible through this tool — do NOT attempt them; the result is a broken layout, not the effect:
- **Scroll-driven / sticky / pinned / lock-scroll / horizontal-scroll ("spatial") sections** — there is no sticky, no scroll-jacking, no horizontal scroller. Attempting one produces a broken split with an empty half and an overflowing half. Build **simple sections stacked vertically**, full width.
- **Layered/overlapping elements via absolute positioning** — fragile and usually misaligns. Use a normal grid/flex side-by-side instead of stacking one element on top of another.

### Create the FEELING of dynamism statically instead:
- **Diagonal gradients** (135deg/225deg) read as more energetic than flat fills
- **Layered box-shadows** with a color tint imply elevation (`0 20px 60px rgba(brand,0.15)`)
- **backdrop-filter: blur(...)** for glassmorphism depth
- **Extreme size/weight contrast** creates visual "movement" through hierarchy alone

**❌ NEVER ROTATE elements.** `transform: rotate(...)` on cards/sections/images looks sloppy and amateur — it is banned. Static `scale`/`translate` are allowed ONLY when subtle and purposeful; when in doubt, don't transform at all. Alignment and rhythm come from grid/flex, never from tilting things.

> Hover lifts, staggered reveals, and scroll/entrance animations ARE supported by the Elementor V4 engine but are not yet exposed through this tool. Design so the static composition stands on its own — motion will enhance it later, not rescue it.

## 5. Backgrounds & Atmospheric Depth

### Avoid Distributional Defaults:
- NO solid white or light gray backgrounds
- NO single-color backgrounds
- NO generic gradient overlays

### Intentional Alternatives (verified-supported only):
- **Layered Gradients**: `linear-gradient` MUST use an explicit angle (e.g. `135deg`) and `radial-gradient` uses `circle at <named-position>`. Keyword directions (`to right`) and `conic-gradient` are NOT supported — always use an angle.
- **Glassmorphism**: translucent background + `backdrop-filter: blur(...)`
- **Strategic Contrast**: alternate light and dark sections for rhythm
- **Tinted color blocking**: large sections in warm/cool tinted neutrals, never plain white
- AVOID SVG *patterns* and noise/texture *backgrounds* unless the asset is ALREADY uploaded — inline SVG and external textures/data-URIs are not available to this tool. For **icons**, see [elementor://style/icons]: use a real uploaded `e-svg`/PNG asset, otherwise OMIT the icon or use a text label — never fabricate one from primitives or a unicode glyph.

## 6. Visual Hierarchy Principles

### Clear Priority System:
1. **Primary Focus (1 element)**: Largest, highest contrast, most visual weight
2. **Secondary Elements (2-3 elements)**: 40-60% of primary size, reduced contrast
3. **Tertiary/Support (everything else)**: Minimal visual weight, muted colors

### Contrast Techniques:
- Size: 3x+ differences between hierarchy levels
- Weight: 300+ difference in font-weight values
- Color: Primary gets brand color, secondary gets neutral, tertiary gets muted
- Space: Primary gets 2x+ surrounding white space vs. secondary


## 7. Flexbox Gotcha (CAPABILITY-AWARE)

`e-flexbox` defaults to `flex-direction: row`, not `column` — stacked content
(heading + paragraph, footer columns, etc.) needs `"display": "flex",
"flex-direction": "column"` set explicitly, or children render side-by-side with
no warning. Set `flex-direction` explicitly on every multi-child container.


# IMPLEMENTATION WORKFLOW

When building a composition:

1. **Define the Visual Goal First**
   - What emotion/brand personality? (Professional, playful, elegant, bold)
   - What's the single most important element?
   - What color family (warm/cool/neutral) supports the goal?

2. **Choose Typography Personality**
   - Select font pairings that match the personality (NOT defaults)
   - Define scale (3x+ headline ratio)
   - Set weight extremes (light/heavy contrast)

3. **Commit to Color Strategy**
   - Pick ONE dominant color (NOT purple, NOT generic blue)
   - Choose 1 sharp accent
   - Define warm or cool neutrals

4. **Design Spatial Rhythm**
   - Use generous white space (3-6rem between sections)
   - Create asymmetry (not everything centered)
   - Vary component sizes intentionally

5. **Build Static Depth (no motion)**
   - Use layered shadows, diagonal gradients, and glassmorphism for a sense of dynamism
   - Use static transforms for asymmetry/overlap — never animate
   - Do NOT add transitions, hover states, or entrance animations (unsupported by this tool)

6. **Layer Atmospheric Depth**
   - Use gradient combinations for backgrounds
   - Add subtle patterns or textures
   - Alternate light/dark sections for rhythm


# CONTEXT-AWARE DESIGN PERSONALITIES

Brand personality should influence your choices:

- **Corporate/Professional**: Deep neutrals, serif headlines, structured spacing
- **Creative/Agency**: Bold color, display fonts, asymmetric layouts
- **Tech/Startup**: Monospace accents, sharp colors, modern spacing
- **Elegant/Luxury**: Serif dominance, muted colors with metallic accents, generous white space

# USER OVERRIDE CAPABILITY

Always respect user specifications:

If user specifies:
- Specific colors → use them
- Specific fonts → use them
- Specific spacing → use it
- "Minimal/simple" → reduce ornamentation but maintain quality principles
