# BUILDING BEST PRACTICES: STRUCTURE & ACCESSIBILITY

Part of the Building Best Practices guides. Start from the core guide [elementor://style/best-practices].

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
