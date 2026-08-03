# DESIGN TASTE — a METHOD for any brief (not a menu to copy)

How to DERIVE a design system for what you're building, then commit it to global variables. Every concrete value below (hexes, font names, rem numbers) is an ILLUSTRATIVE EXAMPLE, never a default — if two different briefs would get the same look from you, you're copying a menu instead of designing. Only the facts (contrast ratios, tap targets) are fixed.

- **REFERENCE mode** (link/image/Figma/brand given): take the palette, fonts, spacing, and radius FROM the reference and reproduce it faithfully.
- **INTENT mode** (prompt only): derive a fresh system from the brief's industry, audience, and mood.

## 1. COLOR
1. **Dominant hue** from the brief's industry/mood (or the reference's exact hexes).
2. **ONE accent** for all interactive elements. One accent + neutrals reads designed; five equal colors read as noise.
3. **Map by lightness to roles:** `--color-bg` (lightest) · `--color-surface` · `--color-border` · `--color-text-muted` (≥4.5:1 on bg) · `--color-text` (darkest) · `--color-accent`.
4. **Tint neutrals** 5–15° toward the hue — never pure gray (warm e.g. `#faf8f5`/`#2d2a26`; cool e.g. `#f5f7fa`/`#1e2430`).

Don't default to purple→blue gradients (the classic "AI" tell), or to brown/beige/terracotta — use warm only when the brief asks for it.

**Facts:** body 16px+ ≥ 4.5:1; large 24px+ ≥ 3:1; muted text darker than `#767676` on white. Never gray text on a photo — use white/near-black plus an overlay.

## 2. TYPOGRAPHY
**Scale** — store each step as a size variable and pull every size from them:
`body 1.0625rem` · `h3 clamp(1.3rem,1rem+1.5vw,1.9rem)` · `h2 clamp(1.6rem,1.1rem+2.5vw,2.53rem)` · `h1 clamp(2rem,1.2rem+4vw,3.37rem)` · `display clamp(2.6rem,1.5rem+5.5vw,4.5rem)`. Scale up only for a genuinely hero-led page, and cap the hero around 5rem. Contrast comes from the RATIO between big and small, not from making everything big.

**Rhythm:** line-height display `1.0`, headings `1.12`, body `1.6`. Tracking display `-0.035em`, headings `-0.02em`, uppercase labels `+0.08em`. Body measure `max-width: 65ch`. Load 2–3 weights per family.

**Pairing — method, not a menu:** pick a heading personality that matches the brief (serif = editorial/trust/luxury; geometric sans = modern/tech; grotesk = neutral; display = bold/consumer), then a highly legible body sans. Heading font on h1–h3, body font everywhere else. *Illustrative:* Fraunces/Inter, Playfair Display/Lato, Space Grotesk/Inter, Anton/Lato, Marcellus/Alegreya Sans. Vary across builds.

## 3. SPACING, RADIUS & BUTTONS
Ad-hoc per-element values are the #1 tell of an amateur build. Commit these as variables and pull EVERY value from them.

**Spacing scale** (~8px rhythm, use ONLY these for padding/gap/margin): `xs .5rem` · `sm 1rem` · `md 1.5rem` · `lg 2rem` · `xl 3rem` · `2xl 5rem` · `3xl 8rem`. Section padding = 2xl/3xl; card padding = lg. Never invent `0.72rem` one-offs.

**Radius — default SHARP (0 / near-0).** Large radii and pills everywhere is a slop tell. If you round, pick ONE step and apply it consistently.

**Buttons:** three roles at the SAME size, differing by fill — primary (solid, one main action), secondary (outline), tertiary (text). Never a bespoke size.

## 4. LAYOUT — match the archetype to the content shape
Side-by-side for every section is the #1 monotony defect and usually leaves a sparse column beside a tall one. The default is stacked, not split.

- **STACKED (default):** section header on top, content full-width below. Use whenever the content is a set of peers — cards, logos, team, steps, stats, FAQ, pricing, gallery, testimonials.
- **SPLIT (must be earned):** only when the section is exactly two peers of comparable weight — copy beside ONE strong element (hero image, form, map, portrait, quote). Imbalance test: if one half would be a short header and the other a tall grid, stack instead.
- **CENTERED:** single-focus moments — hero statement, CTA, pull quote, big stat.
- **FULL-BLEED MEDIA BAND:** an image or quote break that resets rhythm between denser sections.

Then vary down the page: no two adjacent sections share an archetype, none repeats 3× in a row, alternate backgrounds, one focal point per section. Give the page one signature move (an oversized number, a full-bleed accent band, a pull quote) — in REFERENCE mode, match the reference per section instead.

## 5. ANTI-SLOP KILL-LIST
- No Inter/Roboto/Arial/system-ui as the primary typeface.
- No purple→blue gradients; no 5 equal colors; no pure-gray neutrals.
- Break the centered-hero + 3-identical-cards template; use asymmetry, but fill both halves.
- Don't default to rounded corners or oversized everything.
- No placeholder text or links — real copy everywhere.

## 6. HARD UX NUMBERS (facts)
Tap targets ≥ ~44px; body ≥ 16px; 8px spacing rhythm; forms use visible labels and a descriptive submit (never "Submit"); nav shows an active indicator; meaningful `alt`; correct heading order.
