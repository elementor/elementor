# BUILDING BEST PRACTICES

The single source of truth for how to build with Elementor: design system, variables and classes, units and responsive behavior, semantic structure, accessibility, and page strategy and original design. Tool-specific syntax lives in each tool's description; this guide decides *what* to build and *why*.

## Priority order
When guidance conflicts, follow the first that applies:
1. **The user's direction** (colors, fonts, content, structure, a reference site). When the request is thin on what matters, you may ask or suggest options before building.
2. **The site's existing design system** — variables in [elementor://global-variables], classes in [elementor://global-classes], and components from `elementor/list-components`. New work must look like it belongs to the same site.
3. **This guide.**

Accessibility rules (section 5) are never traded away for aesthetics. If a user request would break them (e.g. light gray text on white), build it as close as possible while staying compliant and tell the user why.

---

# 1. WORKFLOW

1. **Read the system** — [elementor://global-variables] and [elementor://global-classes]. For an existing page, read its structure (`elementor/get-page-structure`) to learn the heading levels already used.
2. **Write the visitor brief** and, when the look isn't set by the user or the site, choose a direction with the originality process (section 7).
3. **Fill token gaps** — create only the variables that are missing (section 2), via `elementor/manage-global-variable`.
4. **Define reusable classes** — for anything used twice or more (section 3), via `elementor/manage-classes`.
5. **Plan the page** — the section path to one decision (section 7) and its semantic tags and heading outline (section 4), before styling.
6. **Compose** — `elementor/build-composition` with classes attached and minimal local `style`.
7. **Responsive pass** — every multi-column or large-type element has a tablet and mobile answer (section 6).
8. **Accessibility pass** — run the checklist at the end of this guide before reporting done.

---

# 2. DESIGN SYSTEM: VARIABLES (TOKENS)

Variables are the site's design decisions. Every color, font, and repeated size in a build should come from a variable, so the user can restyle the whole site from one place.

## What deserves a variable
| Category | Variable type | Minimum set for an empty kit |
|---|---|---|
| Color | `global-color-variable` | `color-primary`, `color-on-primary`, `color-accent`, `color-text`, `color-text-muted`, `color-surface`, `color-surface-alt`, `color-border` |
| Font family | `global-font-variable` | `font-heading`, `font-body` |
| Type scale | `global-size-variable` / `global-custom-size-variable` (for `clamp()`) | `text-sm`, `text-base`, `text-lg`, `text-xl`, `text-2xl`, `text-3xl`, `text-4xl` |
| Spacing scale | `global-size-variable` / `global-custom-size-variable` | `space-xs`, `space-sm`, `space-md`, `space-lg`, `space-xl`, `space-section` |
| Radius | `global-size-variable` | `radius-sm`, `radius-md`, `radius-full` |
| Layout width | `global-size-variable` | `width-content`, `width-wide` |

Do not create variables for one-off values (a single decorative offset, one image's aspect ratio).

## Naming convention
Pattern: `{category}-{role}[-{variant}]` — lowercase, hyphen-separated, letters and digits only.

- **Name by role, never by value or appearance.** `color-primary` not `color-blue`; `space-md` not `space-24`; `font-heading` not `font-playfair`. The value will change; the role will not.
- **Category prefixes are fixed:** `color-`, `font-`, `text-` (font sizes), `space-`, `radius-`, `width-`.
- **Scales use t-shirt steps:** `xs`, `sm`, `md`, `lg`, `xl`, `2xl`, `3xl`, `4xl`. Font sizes use `sm` / `base` / `lg` / `xl`… so `text-base` is body copy.
- **State and pairing suffixes:** `-hover`, `-muted`, `-alt`, and `on-` for a color meant to sit on another (`color-on-primary` is the text color on a `color-primary` background).
- **Existing names win.** If the kit already uses another convention (e.g. `brand-gold`), follow it for new variables and never rename the user's variables.

## Values
- Colors: hex or `hsl()`. Pick each `on-` pair to pass contrast (section 5) at creation time.
- Fonts: one Google Font family per variable, no fallback stack. Two families maximum per site (heading + body); one is fine.
- Fluid sizes: use `global-custom-size-variable` with `clamp()` for headings and section spacing so they shrink on small screens without per-breakpoint overrides (section 6).

Example starter scale (adjust values to the brand, keep the names):
```
text-base      1rem
text-lg        1.125rem
text-xl        1.375rem
text-2xl       clamp(1.5rem, 1.25rem + 1vw, 2rem)
text-3xl       clamp(2rem, 1.5rem + 2vw, 3rem)
text-4xl       clamp(2.5rem, 1.75rem + 3.5vw, 4.5rem)
space-sm       0.5rem
space-md       1rem
space-lg       2rem
space-xl       4rem
space-section  clamp(4rem, 2.5rem + 6vw, 8rem)
width-content  65ch
width-wide     75rem
```

---

# 3. DESIGN SYSTEM: GLOBAL CLASSES

Classes are reusable bundles of styles built **from variables**. They keep repeated elements identical and editable in one place.

## When to use a class vs. local style
- **Class:** the same styling appears on 2+ elements, or is an obvious site pattern (buttons, cards, section shells, eyebrow labels, heading styles).
- **Local `style`:** a genuine one-off (a single decorative glow, one hero's unique layout).
- Check [elementor://global-classes] first — reuse or extend an existing class before creating a new one.

## Naming convention
Pattern: `{component}[-{part}][-{variant}]` — lowercase, hyphen-separated.

- **Name by purpose, not appearance.** `btn-primary`, `card`, `card-title`, `section-hero`, `eyebrow` — not `blue-button`, `big-text`, `mt-40`.
- **Parts** describe the piece inside a component: `card-media`, `card-body`, `card-title`.
- **Variants** describe the alternative: `btn-secondary`, `card-featured`, `section-dark`.
- **Heading styles** are named by visual level, independent of the HTML tag: `heading-display`, `heading-lg`, `heading-md`, `heading-sm`. An `h3` may use `heading-lg` — the tag is about structure, the class is about looks.
- **Hard rules:** 2–50 characters, starts with a letter, only letters, digits, `-` and `_`, no spaces, must not start with `--`, `container` is reserved (use `wrap` or `content-width`).
- **Existing names win** — follow the kit's convention if it has one.

## Writing good classes
- Reference variables, not raw values: `color: var(--color-text); padding: var(--space-md) var(--space-lg);`.
- One job per class; combine up to ~3 on an element (`section` + `section-dark`). If you need more, the system is missing a class.
- Put interaction states and breakpoints **inside the class** (`&:hover`, `&:focus`, `@media(--mobile)`), so every instance is accessible and responsive by default.
- Every interactive class (`btn-*`, linked `card`) must include a visible `&:focus` style (section 5).
- When two classes conflict, fix the priority with `elementor/reorder-classes` instead of adding local overrides.

---

# 4. SEMANTIC STRUCTURE & HIERARCHY

Structure is what screen readers, search engines, and AI assistants read. Choose tags for meaning first, then style for looks.

## Heading outline
- **One `h1` per page** — the page's main title. Before adding a hero to an existing page, check whether an `h1` already exists.
- **Never skip levels** going down: `h1` → `h2` (section titles) → `h3` (items inside a section). Going back up is fine.
- **Tag by structure, size by class.** A small visual heading can be an `h2`; a big decorative number is not a heading.
- **Only real headings get heading tags.** Eyebrow labels, taglines, prices, and stats are `e-paragraph` (tag `p` or `span`) with a class.
- Every `section` should have a heading that names it.

## Container tags (`tag` on `e-div-block` / `e-flexbox` / `e-grid`)
| Tag | Use for |
|---|---|
| `section` | A thematic block of the page with its own heading (features, pricing, FAQ) |
| `article` | A self-contained item that makes sense on its own (blog card, testimonial, product card) |
| `aside` | Complementary content (sidebar, related links, callout) |
| `nav` | A group of navigation links (menus, breadcrumbs, footer link groups) |
| `header` / `footer` | The header/footer site parts, or the header/footer of an `article` |
| `main` | Do not add — the theme already wraps page content in `main` |
| `div` | Pure layout wrappers with no meaning (rows, columns, spacing shells) — the default |

## Links vs. buttons
- **Goes somewhere → link** (`link` prop, or `tag: a`). **Does something on the page → button.**
- Never nest interactive elements: no link or button inside a container whose tag is `a` or `button`.
- Link and button text must make sense out of context: "View pricing plans", not "Click here" or a lone "Read more".

## Reading order
- Visual order must match source order. Do not use `order`, `row-reverse`, or absolute positioning to move meaningful content; reorder the XML instead.
- Mark visual-only containers that stay empty (glows, shapes) with `editor_settings: { "decorative": true }`.
- Use `e-list` for real lists when it is available, rather than stacked paragraphs.

---

# 5. ACCESSIBILITY (WCAG 2.2 AA)

These are requirements, not suggestions.

## Color & contrast
- **Text contrast:** at least **4.5:1** for normal text, **3:1** for large text (24px+, or 18.66px+ bold).
- **UI contrast:** at least **3:1** for button boundaries, form field borders, icons that carry meaning, and focus indicators.
- Check **every state** (hover, focus) and **every background**, including text over images or gradients — add a solid or gradient overlay behind text until it passes.
- **Never rely on color alone.** Links inside body text are underlined; errors and statuses also use text or an icon.

## Typography
- Body text at least `1rem` (16px), line-height 1.5–1.7, line length 45–75 characters (`max-width: var(--width-content)` or `65ch`).
- Body weight at least 400. Light weights (300) only at display sizes (2rem+). Avoid 100–200 entirely.
- Avoid long passages in all caps, italics, or centered alignment — keep those for short labels and headlines.
- Do not put text inside images; use real text over the image.

## Interaction
- **Visible focus on everything interactive:** add `&:focus { outline: 2px solid var(--color-accent); outline-offset: 2px; }` (or equivalent that passes 3:1). Never remove the outline without a replacement.
- **Hover parity:** anything revealed or changed on `&:hover` is also available on `&:focus`.
- **Touch targets:** buttons and standalone links at least 44×44px (`min-height: 2.75rem` with horizontal padding), with at least `0.5rem` between adjacent targets.
- **Icon-only controls are not allowed:** the builder cannot set `aria-label`, so always pair an icon with visible text. Icons next to text are decorative.

## Media
- **Alt text:** external images get a meaningful `alt` in `src`; decorative external images get `alt: ""`. Library images use the Media Library alt — if it is missing, tell the user which images need it.
- Background videos are muted and decorative only; never put essential information only in a video.

## Motion
- Animate only to clarify (reveal a section, confirm an action). No infinite loops, no flashing more than 3 times per second, no large parallax.
- Keep motion short and subtle (opacity, small translate) so it stays comfortable for motion-sensitive users.

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
- Use `clamp()` variables for headings and section spacing (section 2) so they scale smoothly; then you rarely need per-breakpoint font-size overrides.
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

---

# 7. PAGE STRATEGY & ORIGINAL DESIGN

You are a capable designer. This chapter does not prescribe a style. Fonts, palettes, layouts, imagery, shapes and effects are your call, within whatever the user has decided. What it defines is what every page must achieve for its visitor, and a process for arriving at a design that is original rather than the statistically average answer.

Everything here sits inside the priority order: the user's direction and the site's existing design system come first, and the accessibility (section 5), mobile (section 6) and design system (sections 2-3) rules always apply.

## 7.1 Start from the visitor, not the category
Before designing, write a short brief for yourself:
- **Visitor:** who they are and their situation (device, place, urgency). Example: truck drivers browsing on a phone between shifts.
- **Problem:** what they are trying to solve, in the words they would use or search for.
- **Promise:** the outcome they get, not the feature you offer.
- **One action:** the single thing this page should get them to do.
- **Doubts:** what they need to believe before acting (price, trust, fit, effort).

Fill it from what the user told you; infer the rest from the business and state your assumptions in your reply.

## 7.2 The first screen passes the mirror test
When the right visitor lands, the first screen (on mobile too) should feel like a mirror: their problem, their world, and a clear sign they are in the right place. It must answer three questions without scrolling:
1. **Who is this for?** The visitor recognizes themselves: their vocabulary, their context, imagery they could see themselves in.
2. **What do I get?** An outcome, not a feature. "Fill your calendar without answering DMs", not "AI-powered scheduling".
3. **What do I do next?** One primary action with a specific label ("Book your free call"), visible without scrolling.

Copy rules:
- Specific beats clever. Use the visitor's words, not marketing vocabulary.
- Avoid generic AI phrasing ("Elevate your...", "Unlock", "Seamless", "Revolutionize", "Welcome to...", "Your journey").
- **Never invent facts:** testimonials, statistics, client logos, awards, prices, certifications. Use clearly marked placeholders and list them for the user.

## 7.3 The page is a path to one decision
- Every section has one job: answer the visitor's next question (what is it, why trust it, how does it work, what does it cost, what if...). The order follows the brief, not a template.
- A section that answers no real question is cut.
- One primary action per page. Repeat it at natural decision points; secondary actions are visibly quieter.
- Not every page sells. For content, about or support pages, the "one action" may be "keep reading" or "find the answer" — the same logic applies.

## 7.4 Guide attention deliberately
- **Highlighter rule:** the most attention-grabbing color is reserved for the primary action and very few key moments. If the accent is on headlines, icons, borders and backgrounds, nothing stands out. Most of the page stays calm.
- **Front, middle, back:** the background sets context and mood, the middle carries the content, and only the one thing that matters most is lifted to the front. Depth comes from layering, overlap and contrast — used so the eye knows where to look, not as decoration.
- **One focal point per screen:** squint at each screen-height of the page. If two things compete for first look, demote one.
- Hierarchy comes from size, contrast, space and position before it comes from effects.

## 7.5 Motion must have a job
Every animation does exactly one job: show the product, point the eye to the next step, or confirm something happened. If it has no job, remove it.
- One thing moves per screen; everything else stays still.
- **Never make visitors wait for words:** no load or scroll-in animation on the first screen's headline, text or primary action.
- No decorative loops, spins or parallax.
- Elementor's interactions do not currently follow the visitor's "reduce motion" setting, so the page must be complete and readable with no motion at all, and motion stays small and short.

## 7.6 Give a taste before asking
Before the contact form, let visitors experience some value. Find the question every customer asks before buying and answer it on the page: transparent prices or ranges, a before/after, a sample of the deliverable, a short "which option fits you" guide, a short quote form. If an interactive tool (calculator, quiz, estimator) would serve best and the widgets can't build it, recommend it to the user instead of faking it.

## 7.7 Originality: a process, not a style
Models drift to the most common answer. When the look is not already set by the user or the site, counter it with this process:
1. **Name the default.** In one line, write what a typical AI site for this category would look like (e.g. "dental clinic: white and teal, smiling stock family, centered hero, three service cards"). That is the baseline to move away from.
2. **Diverge.** Sketch three genuinely different directions in a sentence each. Each must come from something specific in the brief — the visitor's world, the business's materials, place or craft, or a reference outside the web (print, signage, packaging, editorial, product design). They must differ in layout concept and imagery, not just color.
3. **Choose by fit.** Pick the direction that best serves the visitor and the one action. If two tie, pick the less expected one.
4. **Specificity test.** Replace the business name with a competitor's. If the page still works unchanged, it is generic: make the copy, imagery and structure more specific to this business.
5. **Review for AI tells** after building: the reflexive hero, three cards, testimonials, CTA sequence; the accent color everywhere; identical section structures repeated; decorative blobs or gradients with no job; stock-looking imagery; buzzword copy; everything centered; motion on everything.

Originality never overrides the user's direction or the site's existing design system. On an existing site, be original within its system.

---

# PRE-FLIGHT CHECKLIST
Before reporting a build as done, confirm:
- [ ] The first screen answers who it's for, what they get, and what to do next — on mobile too.
- [ ] One primary action; the strongest color is reserved for it.
- [ ] No animation delays the first screen's text or primary action; every animation has one job.
- [ ] No invented testimonials, stats, logos or prices; placeholders are listed for the user.
- [ ] The page fails the competitor swap test (it only fits this business).
- [ ] Colors, fonts, and repeated sizes come from variables; new variables follow the naming convention.
- [ ] Repeated styles are global classes named by purpose; local `style` is only for one-offs.
- [ ] Exactly one `h1` on the page; heading levels never skip; every `section` has a heading.
- [ ] Container tags reflect meaning (`section`, `article`, `nav`, `aside`); no nested links or buttons.
- [ ] All text meets 4.5:1 (3:1 for large), including over images and in hover/focus states.
- [ ] Every link and button has descriptive visible text, a visible focus style, and a 44px tap target.
- [ ] Images have appropriate alt text (or the user was told which library images need it).
- [ ] Font sizes and spacing use rem/clamp, not px; body text is at least 1rem.
- [ ] Every multi-column layout stacks on mobile; nothing scrolls horizontally at 360px.
- [ ] The result matches the site's existing look, or the user's explicit direction.
