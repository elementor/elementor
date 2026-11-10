# Handoff: Unified building best practices for the Elementor MCP

> Working note for the next agent session. **Delete this file before opening a PR.**
> Branch: `cursor/unified-building-best-practices-b663` (elementor/elementor). Status: guide wording **approved by the PM**, test harness not built, no PR.

## 1. Goal (from the PM)
Create one place for "building best practices" that the AI reads before building with Elementor (via MCP), covering:
- The design system: how variables and global classes are used, and their naming convention.
- Units and modern responsive practice (rem, clamp, breakpoints).
- Strong focus on **accessibility**, **correct semantics and hierarchy**, and **mobile**.
- Page strategy and original design: what a page must achieve for its visitor, how to guide attention, and a process for original (non-generic) designs — without prescribing a visual style.

Then prove it works with a **before/after test**.

## 2. Decisions made
| Topic | Decision |
|---|---|
| One home for rules | Approved: one "Building best practices" guide; tools keep only technical how-to and point to it. Keep the URI `elementor://style/best-practices`; rename the display title to "Building Best Practices". |
| Priority order | Approved: 1. user's direction, 2. site's existing design system, 3. the guide. Accessibility never traded away. |
| Naming convention | Approved: variables `{category}-{role}[-{variant}]` (e.g. `color-primary`, `space-md`, `text-lg`, `font-heading`); classes `{component}[-{part}][-{variant}]` (e.g. `btn-primary`, `card-title`, `section-dark`); heading classes by visual level (`heading-lg`), independent of tag. Existing site names always win. |
| Accessibility target | Approved: WCAG 2.2 AA. |
| Chapter 7 | Approved: "Page strategy & original design" replaces the old prescriptive "Visual design quality" chapter. Freedom on style; defines visitor brief, mirror test for the first screen, page as a path to one decision, attention (highlighter rule, front/middle/back), motion with a job, give a taste before asking, 5-step originality process. Plus 5 matching checklist items and workflow steps 2 and 5. |
| "User is the pilot" | **Not a principle.** Only the one line in the priority order. **Do not** test or measure whether the AI asks questions. |
| Single vs. split guide | Undecided — **let the test decide** (test both). |
| Test model | **Sonnet 5.5, medium effort** (`claude-sonnet-5-5-medium`). |
| Grading | PM grades **visually**, blind (randomized labels). Automated checks are supporting data. |
| Elementor Pro | **Required** on all test sites (some variable types are Pro-only). Set an active local license (`npm run license:advanced` in elementor-pro). |
| Eval system | Prefer the team's existing evals repo `elementor/editor-mcp-evals` over a custom harness, if it can point at local sites, run Sonnet 5.5 medium, capture screenshots, and reset sites between runs. Extend it rather than replace it. Access was granted by the devs but did not reach the previous session — verify first. |
| Workflow | PM is in **planning mode**: do not open a PR or make product changes beyond the approved scope without explicit approval. Report in product language, not technical terms. |

## 3. Problems found in the current guidance (why this work exists)
- `modules/mcp/static-resources/style/best-practices.md` on `main` is a generic "anti-AI-slop" prompt: hard bans (no blue, no purple, no white backgrounds, no Inter/Roboto, no 1200px containers), **no accessibility, no mobile**, ignores the site's existing design system, recommends a non-Google font (SF Mono) that the builder cannot use.
- `modules/mcp/static-resources/abilities/build-composition.md` has its **own** design section that **contradicts** it (0.3s ease recommended vs. banned; gradient overlays recommended vs. banned; px vs. "rem exclusively"; different color ratios and section spacing).
- The build-composition instructions **never point to the style guide**, so the AI may never read it.

## 4. Product/technical facts the guide must respect (verified in code)
- Variable types (`modules/mcp/abilities/manage-variable-guide-ability.php`): color, font (single Google Font only), size, custom-size (`clamp()`, `calc()` etc.). Labels lowercase `a-z0-9-_`.
- Class label rules (`packages/packages/core/editor-styles-repository/src/utils/validate-style-label.ts`): 2–50 chars, starts with a letter, `a-zA-Z0-9-_`, no leading `--`, `container` reserved.
- Container `tag` options: `e-div-block`/`e-flexbox`: div, header, section, article, aside, footer, a, button, main, nav. `e-grid`: no main/nav. Heading: h1–h6, span. Paragraph: p, span. Lists: `e-list`.
- Styles support only `&:hover`, `&:focus`, `&:active` (no `:focus-visible`); breakpoints `@media(--tablet)`, `@media(--mobile)` etc. — desktop is the base (desktop-first), only site-enabled breakpoints are valid.
- `clamp()/calc()/min()/max()/var()` sizes are kept verbatim; `grid-template-columns` accepts `repeat()/minmax()`.
- `attributes` (aria-*) are **not configurable** via MCP → icon-only buttons can't be labeled; guide requires visible text.
- External image alt is `src.alt`; library images use the Media Library alt.
- `box-shadow` cannot use `var()`; `animation*` is dropped.
- Interactions (load, scrollIn, scrollOut, scrollOn, hover, click) **do not respect `prefers-reduced-motion`**. Chapter 7.5 works around it; flag to the PM as a product gap / separate ticket.
- Widgets can't build calculators/quizzes; chapter 7.6 tells the AI to recommend instead of faking.

## 5. Where things are wired (for implementation)
- Resource ability: `modules/mcp/abilities/style-best-practices-ability.php` (URI `elementor://style/best-practices`, name "Style Best Practices"). Registered in `modules/mcp/module.php`.
- In-editor AI also loads it: `packages/packages/core/editor-canvas/src/mcp/resources/best-practices-resource.ts` and `widgets-schema-resource.ts` (same URI) — **keep the URI** to avoid breaking either client.
- Tests asserting name/description: `tests/phpunit/elementor/modules/mcp/registry/test-list-resources-catalog-parity.php`, `test-core-resources-metadata.php`, `test-mcp-v4-gate-integration.php`.
- Docs to keep accurate: `docs/atomic-builder/mcp/design-guidance.md`, `resources.md`, `composition-workflow.md`.
- MCP endpoints: real MCP server `mcp-adapter-default-server` (WP MCP adapter, gated by the MCP setting in `McpSettingsController`, from composer package `elementor/elementor-mcp-composer`); internal proxy `POST/GET /wp-json/elementor/v1/mcp-proxy`.

## 6. State of this branch (version B, single guide)
Done (approved wording — do not rewrite without the PM):
- `modules/mcp/static-resources/style/best-practices.md` — the unified **Building Best Practices** guide, ~3,350 words (old file ~950): intro & priority order, 1. Workflow (8 steps), 2. Variables + naming, 3. Classes + naming, 4. Semantic structure, 5. Accessibility (WCAG 2.2 AA), 6. Units & responsive/mobile, 7. Page strategy & original design, Pre-flight checklist (15 items).
- `modules/mcp/static-resources/abilities/build-composition.md` — guide added as the first resource ("read FIRST"), a pointer in WORKFLOW, and its duplicated design sections replaced by a 2-line pointer (technical SIZING rules kept).

Not done yet (approved, mechanical):
- Rename the resource display name/description to "Building Best Practices" in the PHP ability and in `best-practices-resource.ts`; update the tests and docs above.
- Add one line to the variable guide (`manage-variable-guide-ability.php`, under "Naming Rules"):
  `- Follow the variable naming convention in [elementor://style/best-practices] (e.g. color-primary, space-md, text-lg). If the site already uses another convention, follow the site.`
- Add one line to the classes tool description (`manage-classes-ability.php`):
  `Name classes by purpose following the convention in [elementor://style/best-practices] (e.g. btn-primary, card-title). If the site already uses another convention, follow the site.`
- **Version C (split)** — same wording, reorganized: a core guide (~900 words: priority order, workflow, one-line naming rules, must-follow accessibility / mobile / first-screen rules, full checklist; always read) + four on-demand guides: design system (ch. 2–3), structure & accessibility (ch. 4–5), responsive & units (ch. 6), page strategy & original design (ch. 7). Variables/classes tools point to the design-system guide.

The PM reviewed everything in the Cursor canvas "AI building instructions: final version" and the decisions canvas "Building best practices: final decisions" (previous session).

## 7. Test plan (approved)
**Versions:** A = current `main`; B = single guide (this branch); C = split guide. Same base commit, only guidance files differ. Use git worktrees, build each, run each as its own local site.

**Sites:** WordPress Playground (local, WASM) with Elementor Core + **Pro** (active license state), Hello Elementor, V4 experiments on (`e_atomic_elements,container,e_opt_in_v4`), MCP setting enabled, admin application password for the AI connection. Two start states, **reset before every run**:
1. Blank site (empty kit).
2. Existing branded site: a fictional café brand with ~12 variables, ~8 classes and a finished home page, deliberately using a **different naming style** than ours (tests "existing names win").

**AI:** a fresh Sonnet 5.5 (medium) agent per run that has never seen the guides, connected only to the site's official MCP endpoint (prefer the evals repo's runner).

**Prompts (~12):** new pages for a law firm, café, SaaS, e-commerce product page, portfolio; constrained ("use brand colors #… and font …", "keep it minimal"); existing-site edits ("add a pricing section"); small edits ("make the buttons more prominent").

**Runs:** 12 prompts × 3 versions × 2 runs = 72 builds.

**Collected per build:** published page; desktop (1440px) and mobile (390px) screenshots; automated accessibility score (axe/Lighthouse) incl. contrast, focus, tap targets; structure checks (one h1, no skipped levels, section tags); horizontal scroll at 360px; % styles via variables/classes and naming compliance; reuse of the site's existing tokens; first-screen check (headline + primary action visible on mobile without scrolling, no animation on first-screen text); invented-facts check (fake testimonials/stats/logos); time, steps, warnings. **Not measured:** whether the AI asks the user questions.

**Output:** one report (scores per version + blind side-by-side screenshots for the PM to grade; reveal mapping after grading).

## 8. Environment notes
- The previous VM had **no PHP, Composer, Docker, node_modules or vendor/**; setup may be needed (`npm run install` + `npm run start` in Core then Pro, per AGENTS.md). `composer.elementor.com` is reachable.
- Run commands from `/agent`; never two playground instances on the same repo; use `--workers=1` for long-lived playground instances.

## 9. First steps for the next session
1. Check out this branch in elementor/elementor and read this file plus the guide.
2. Verify access: `git clone https://github.com/elementor/editor-mcp-evals.git` (or via the secret the devs added). Review what it supports against the criteria in section 2 and report to the PM, in product language, **before building** anything.
3. Set up the environment (section 8).
4. Propose the concrete harness (evals repo vs. extension) and get the PM's go-ahead.
5. Finish version B (section 6 "Not done yet"), build version C, run the test, deliver the report.
