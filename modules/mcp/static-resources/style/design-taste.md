# DESIGN TASTE — a METHOD for any brief (not a menu to copy)

This is how to DERIVE a design system for whatever you're building — any industry, any mood, any
case. It is deliberately **not** a fixed set of palettes/fonts/layouts to pick from: a fixed menu is
what makes every build look the same. Use the methods below to make intentional choices for THIS
brief, then commit them to global variables (the mandatory design-system-first step).

**How to use it**
- **REFERENCE mode** (a link/image/Figma/HTML/brand given): take the real palette, fonts, spacing,
  and radius FROM the reference. The methods here just help you read and reproduce it faithfully.
- **INTENT mode** (prompt only): derive a fresh system from the brief's industry, audience, and mood.
- Every concrete value below (hexes, font names, rem numbers) is an **ILLUSTRATIVE EXAMPLE**, never a
  default. **Vary across builds** — if two different briefs would get the same look from you, you're
  copying a menu, not designing. Only the *facts* (contrast ratios, tap targets, engine limits) are fixed.

## Two-step frame (prevents "no craft / dead space")
1. **Plan first.** Before composing, write a short section-by-section plan: layout identity in 2–3
   words, each section's archetype, and — explicitly — **stacked vs split** for that content (default
   stacked; only split when both halves are peers of comparable weight, per §4). Note what changes vs the
   previous section. No two adjacent sections share a pattern; no structure repeats 3×; a split is only
   used when BOTH halves are filled with comparable content.
2. **Polish gate.** After building, audit space/alignment/consistency: no trailing voids, consistent
   spacing scale, hierarchy holds, copy is real, contrast passes. If you can't render to verify, say so.

---

## 1. COLOR — derive a palette, map to roles, tint the neutrals
Method:
1. **Dominant hue** from the brief's content/industry/mood (or exact brand/reference hexes). Not a habit.
2. **ONE accent** for all interactive elements. One accent + neutrals reads designed; five equal colors read as noise.
3. **Map by lightness to roles:** `--color-bg` (lightest) · `--color-surface` (2nd) · `--color-border` (mid-light) · `--color-text-muted` (mid, ≥4.5:1 on bg) · `--color-text` (darkest) · `--color-accent`.
4. **Tint neutrals** 5–15° toward the hue — never pure gray. (warm e.g. `#faf8f5`/`#2d2a26`; cool e.g. `#f5f7fa`/`#1e2430`.)

ILLUSTRATIVE directions (examples of the method, NOT a list — derive your own, vary by brief):
monochrome/editorial (near-black + off-white + one restrained accent) · cool/tech (deep slate + electric accent) · vibrant/consumer (white ground + one saturated hero color) · dark/premium (near-black ground + soft off-white + a single jewel/metallic accent).

**⚠ Do NOT default to brown / warm-beige / desert / olive / terracotta** — it's overused and reads as a template; use warm ONLY if the brief asks for it. Also don't default to purple→blue gradients (the classic "AI" tell). When unsure, restrained cool or near-monochrome is a safer, less generic default than warm.

**Facts (not opinions):** body 16px+ ≥ **4.5:1**; large 24px+ ≥ **3:1**; muted text darker than `#767676` on white. Never gray text on a colored/photo background — use white/near-black + an overlay.

---

## 2. TYPOGRAPHY — choose a scale + a pairing for the brief's personality
**Type scale** is a calibrated system (pick by content density, store each step as a size variable):

| Token | Standard (most sites) | Editorial (brand/story) | Dramatic (hero-led) |
|-------|-----------------------|-------------------------|---------------------|
| body | `1.0625rem` | `1.0625rem` | `1.125rem` |
| h3 | `clamp(1.3rem,1rem+1.5vw,1.9rem)` | `clamp(1.4rem,1rem+2vw,2.13rem)` | `clamp(1.5rem,1rem+2.5vw,2.5rem)` |
| h2 | `clamp(1.6rem,1.1rem+2.5vw,2.53rem)` | `clamp(1.75rem,1rem+3.5vw,3rem)` | `clamp(1.9rem,1rem+4.5vw,3.8rem)` |
| h1 | `clamp(2rem,1.2rem+4vw,3.37rem)` | `clamp(2.25rem,1rem+5.5vw,4.25rem)` | `clamp(2.5rem,0.5rem+7vw,5.6rem)` |
| display | `clamp(2.6rem,1.5rem+5.5vw,4.5rem)` | `clamp(3rem,1rem+8vw,6rem)` | `clamp(3.5rem,0.5rem+10vw,7.5rem)` |

**Sizing restraint:** default to **Standard**; Editorial for brand pages; reserve Dramatic for a genuinely hero-led page and cap the hero ~5rem (not 7–8rem). Calm/premium = smaller, tighter type. Contrast comes from the RATIO between big and small, not from making everything big.

**Rhythm (facts):** line-height display `1.0`, headings `1.12`, body `1.6` (unitless). Tracking display `-0.035em`, headings `-0.02em`, body `0`, uppercase labels `+0.08em`. Body measure `max-width: 65ch`. Load 2–3 weights per family.

**Font pairing — METHOD, not a menu:** pick a heading personality that matches the brief (serif = editorial/trust/luxury; geometric sans = modern/tech; grotesk = neutral/versatile; display = bold/consumer), then a highly-legible body sans. Use each family's EXACT Google-Fonts name (never a stack); heading font on h1–h3, body font everywhere else. *Illustrative pairings (don't just reuse these — choose for the brief):* Fraunces/Inter, Playfair Display/Lato (editorial); Space Grotesk/Inter, Manrope/Lora (modern); Anton/Lato, Archivo/Inter (bold); Marcellus/Alegreya Sans (elegant). Vary the pairing across builds.

---

## 3. SPACING, RADIUS & BUTTONS — the system that kills "random"
Ad-hoc per-element values are the #1 tell of an amateur build. Commit these as variables/classes and pull EVERY value from them.

**Spacing scale** (size variables, ~8px rhythm — use ONLY these for padding/gap/margin): `--space-xs .5rem` · `sm 1rem` · `md 1.5rem` · `lg 2rem` · `xl 3rem` · `2xl 5rem` · `3xl 8rem`. Section padding = 2xl/3xl; card padding = lg; related-item gaps = sm/md. Never invent `0.72rem`/`2.25rem` one-offs. (Scale the exact numbers to the brief's density — but keep it a fixed set.)

**Radius — default SHARP (0 / near-0).** Square corners suit editorial/premium/modern/most brands; large radii + pills everywhere is a slop tell. Rounding is a DELIBERATE choice for soft/friendly/playful brands. If you round, pick ONE small step and apply consistently (`--radius-sm .375rem`; `--radius-pill 999rem` only for actual pill buttons/tags). Never mix random radii.

**Button hierarchy** (three classes, SAME size, differ by fill — see [elementor://style/interactive]): `btn-primary` (solid, the one main action) · `btn-secondary` (outline/subtle) · `btn-tertiary` (text/link). Every button is one of these — never a bespoke size.

---

## 4. LAYOUT & COMPOSITION — derive the RIGHT archetype per section (don't default to split)
Choosing side-by-side for every section is the #1 monotony defect: it reads as templated and usually
leaves a sparse header column beside a tall content column (the "empty-half" break). **Match the
archetype to the CONTENT SHAPE**, and the default is *stacked*, not split.

**DECISION — read the section's content, then pick:**
- **STACKED (the DEFAULT):** section header (eyebrow + heading + intro) on top, content **full-width
  below**. Use this whenever the content is *a set of peers* — cards, logos, team, steps, stats, FAQ,
  pricing tiers, a gallery, a list/table, a testimonial row. A header does NOT pair with a grid/list
  side-by-side; it sits above it. Header can be centered or left-aligned; the band below spans full width.
- **SPLIT 50/50 or asymmetric 2:1 / 1:3 (the EXCEPTION — must be EARNED):** only when the section is
  exactly **two peers of comparable visual weight**, e.g. a block of copy beside **ONE** strong single
  element (a hero image, a form, a map, a portrait, a code/quote block). Before choosing split, apply the
  **imbalance test**: *will BOTH halves hold substantial, comparable content?* If one side would be a
  short header and the other a tall grid/list → it FAILS → stack instead. Fill both halves; never pin a
  half to a fixed width that leaves it empty.
- **CENTERED:** single-focus moments — hero statement, section CTA, a pull quote, a big stat.
- **FULL-BLEED MEDIA BAND:** an image/quote break that resets rhythm between two denser sections.

**Then vary down the page:** no two adjacent sections share an archetype; don't repeat any archetype 3×
in a row. Alternate section backgrounds (bg/surface/accent — never two identical adjacent); vary weight
and density; one clear focal point per section. One **signature move** per page (an oversized number, a
full-bleed accent band, a pull quote) — INTENT mode only; in REFERENCE mode match the reference layout
per section instead (reproduce its stacked/split choice 1:1, don't re-derive).

## 5. ANTI-SLOP KILL-LIST
- No Inter/Roboto/Arial/system-ui as the *primary* type; no `font-family` stacks.
- No purple→blue gradients; no 5 equal colors; no pure-gray neutrals; no default-brown/warm unless asked.
- Break the centered-hero + 3-identical-cards template; use asymmetry but fill both halves.
- Don't default to rounded corners or oversized everything; no tilted/rotated elements.
- No placeholder text/links; real copy everywhere. Icons = real uploaded assets or omit (see [elementor://style/icons]) — never emoji or fabricated shapes.

## 6. HARD UX NUMBERS (facts)
Tap targets ≥ ~44px; body ≥ 16px; 8px spacing rhythm; forms use visible labels + a descriptive submit (never "Submit"); nav shows an active indicator; meaningful `alt`; correct heading order.

---

## 7. ELEMENTOR ENGINE CONSTRAINTS (facts — design within these)
- **Static & vertically stacked only.** No hover/transition/animation; **no scroll-driven/sticky/pinned/horizontal-scroll** sections; **no `transform: rotate`**; no absolute-position overlaps. These render broken.
- **Giant headlines** via an `e-heading` + `clamp()` (no SVG text; `e-svg` needs an uploaded asset).
- **Gradients:** explicit angle only (`linear-gradient(135deg,…)`, `radial-gradient(circle at …)`); no `to right`, no `conic-gradient`.
- **Textures:** no inline SVG / data-URI noise; external **raster** URLs work as `background-image`.
- **Full width, no overflow:** root sections `width:100%` (never `100vw` → edge sliver); nothing wider than the viewport.
- **Responsive:** fluid desktop CSS only (`clamp()`, wrapping flex, `grid auto-fit`/`minmax`), not per-breakpoint queries.
- **CSS:** prefer longhands (`padding-top`, `border-…`); reference tokens via `var(--label)`. `e-flexbox` defaults to COLUMN — set `flex-direction:row` on every horizontal bar.

## Net
Everything here is a method to derive a system for THIS brief and reproduce it via global variables +
the plan-first / polish-gate steps — adapted to the static engine. Examples illustrate the method;
they are never the answer. Vary your output across briefs; only the facts are fixed.
