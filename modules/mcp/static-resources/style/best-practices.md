# BUILDING BEST PRACTICES (CORE)

The single source of truth for how to build with Elementor: design system, variables and classes, units and responsive behavior, semantic structure, accessibility, and page strategy and original design. Tool-specific syntax lives in each tool's description; this guide decides *what* to build and *why*. It is the core guide: read it first, every time. The detailed guides listed below are read when the task needs them.

## Priority order
When guidance conflicts, follow the first that applies:
1. **The user's direction** (colors, fonts, content, structure, a reference site). When the request is thin on what matters, you may ask or suggest options before building.
2. **The site's existing design system** — variables in [elementor://global-variables], classes in [elementor://global-classes], and components from `elementor/list-components`. New work must look like it belongs to the same site.
3. **This guide.**

Accessibility rules (the structure & accessibility guide [elementor://style/structure-and-accessibility]) are never traded away for aesthetics. If a user request would break them (e.g. light gray text on white), build it as close as possible while staying compliant and tell the user why.

---

# 1. WORKFLOW

1. **Read the system** — [elementor://global-variables] and [elementor://global-classes]. For an existing page, read its structure (`elementor/get-page-structure`) to learn the heading levels already used.
2. **Write the visitor brief** and, when the look isn't set by the user or the site, choose a direction with the originality process (the page strategy guide [elementor://style/page-strategy]).
3. **Fill token gaps** — create only the variables that are missing (the design system guide [elementor://style/design-system]), via `elementor/manage-global-variable`.
4. **Define reusable classes** — for anything used twice or more (the design system guide [elementor://style/design-system]), via `elementor/manage-classes`.
5. **Plan the page** — the section path to one decision (the page strategy guide [elementor://style/page-strategy]) and its semantic tags and heading outline (the structure & accessibility guide [elementor://style/structure-and-accessibility]), before styling.
6. **Compose** — `elementor/build-composition` with classes attached and minimal local `style`.
7. **Responsive pass** — every multi-column or large-type element has a tablet and mobile answer (the responsive & units guide [elementor://style/responsive-and-units]).
8. **Accessibility pass** — run the checklist at the end of this guide before reporting done.

---

# DETAILED GUIDES

Open the one you need before that step of the workflow:

- [elementor://style/design-system] — variables and global classes: what deserves a variable, naming, values, writing good classes. Read before creating or changing variables or classes.
- [elementor://style/structure-and-accessibility] — heading outline, container tags, links vs. buttons, reading order; contrast, typography, focus, touch targets, media, motion. Read before composing a page.
- [elementor://style/responsive-and-units] — units, how Elementor breakpoints work, fluid sizing, mobile requirements. Read before composing a page and before the responsive pass.
- [elementor://style/page-strategy] — visitor brief, first-screen mirror test, path to one decision, attention, motion, taste before asking, originality process. Read before designing a new page or restyling one.

---

# NAMING AT A GLANCE

- **Variables:** `{category}-{role}[-{variant}]` — lowercase, hyphen-separated, letters and digits only. Name by role, never by value or appearance (`color-primary` not `color-blue`).
- **Classes:** `{component}[-{part}][-{variant}]` — lowercase, hyphen-separated. Name by purpose, not appearance (`btn-primary`, `card-title`).
- **Existing names win.** If the kit already uses another convention, follow it and never rename the user's variables.

---

# MUST-FOLLOW RULES

These apply to every build, even if you read nothing else:

- **Text contrast:** at least **4.5:1** for normal text, **3:1** for large text (24px+, or 18.66px+ bold).
- **Visible focus on everything interactive:** add `&:focus { outline: 2px solid var(--color-accent); outline-offset: 2px; }` (or equivalent that passes 3:1). Never remove the outline without a replacement.
- **Touch targets:** buttons and standalone links at least 44×44px (`min-height: 2.75rem` with horizontal padding), with at least `0.5rem` between adjacent targets.
- **Icon-only controls are not allowed:** the builder cannot set `aria-label`, so always pair an icon with visible text. Icons next to text are decorative.
- **One `h1` per page** — the page's main title. Before adding a hero to an existing page, check whether an `h1` already exists.
- Never use `px` for font sizes or spacing — it ignores the visitor's browser text-size setting.
- Multi-column rows stack: `@media(--mobile) { flex-direction: column; }` or a single grid column.
- No horizontal scrolling at 360px width: no fixed widths, no wide min-widths, long words and URLs can wrap.
- The first screen (on mobile too) answers who it is for, what they get, and what to do next, with one primary action visible without scrolling.
- **Never invent facts:** testimonials, statistics, client logos, awards, prices, certifications. Use clearly marked placeholders and list them for the user.

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
