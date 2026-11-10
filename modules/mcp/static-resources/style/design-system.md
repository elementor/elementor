# BUILDING BEST PRACTICES: DESIGN SYSTEM

Part of the Building Best Practices guides. Start from the core guide [elementor://style/best-practices].

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
- Colors: hex or `hsl()`. Pick each `on-` pair to pass contrast (the structure & accessibility guide [elementor://style/structure-and-accessibility]) at creation time.
- Fonts: one Google Font family per variable, no fallback stack. Two families maximum per site (heading + body); one is fine.
- Fluid sizes: use `global-custom-size-variable` with `clamp()` for headings and section spacing so they shrink on small screens without per-breakpoint overrides (the responsive & units guide [elementor://style/responsive-and-units]).

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
- Every interactive class (`btn-*`, linked `card`) must include a visible `&:focus` style (the structure & accessibility guide [elementor://style/structure-and-accessibility]).
- When two classes conflict, fix the priority with `elementor/reorder-classes` instead of adding local overrides.
