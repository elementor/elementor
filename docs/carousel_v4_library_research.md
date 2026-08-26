# ED-25237 — Carousel spec review and library evaluation

Research output for [ED-25237](https://elementor.atlassian.net/browse/ED-25237), against
[Carousel — Spec](https://elementor.atlassian.net/wiki/spaces/RDDEP/pages/2750644229) and
[Embla Carousel — Library Evaluation](https://elementor.atlassian.net/wiki/spaces/RDDEP/pages/2823684106).

Date of data collection: **14 Aug 2026**. Every version number, bundle size and behavioural claim
below was measured locally (npm registry, esbuild, Playwright against Chromium) rather than quoted
from the docs.

**Re-checked on 25 Aug 2026 against spec version 21.** The spec changed materially: Carousel became
an **Elementor Pro** feature, the autoplay pause/play button became a persisted eighth element, and
three props were added or reshaped. §9 covers what moved and where the code has to live; §10 covers
the shared-code question. Everything measured on 14 Aug still holds — the changes are about
packaging and ownership, not about the engine.

Two pieces of code back this document. The `e-carousel` element itself is in this repository, under
`modules/atomic-widgets/elements/atomic-carousel/`, behind the hidden `e_carousel` experiment (§12).
The standalone measurement harness is deliberately *outside* the repository, in `carousel-poc/` at
the WordPress root, because it installs two conflicting Embla versions side by side to compare them —
see [Running the POC](#running-the-poc).

---

## 1. Decision summary

| Question | Answer |
|---|---|
| Is Embla the right engine? | **Yes.** It is the only candidate that is genuinely headless *and* loops without cloning or reordering slide nodes. |
| Which version? | **v8.6.0, pinned.** Not the v9 RC, which reached rc03 on 21 Aug 2026 but still has no stable release — see §4. |
| Can we upgrade to v9 later without breaking what users built? | **Yes, provided nothing engine-specific is ever persisted.** One prop in the spec currently breaks that rule (`transition_speed`). Fix it and a version bump is a one-file change with no data migration — see §4, "The migration contract". |
| Alternative if Embla is rejected? | keen-slider (smaller, but no fade and no autoplay, both would be ours to write and maintain). |
| Can we skip the library entirely? | **Not yet.** `::scroll-button()` / `::scroll-marker` are still Chromium-only (~70% of pageviews) and give no loop and no fade. |
| Blocking issues found? | **No blockers.** Two factual defects still in the spec (§3.1, §3.2), one it has since fixed (§3.7), plus the decisions listed in §8. |
| Where does it live? | **Elementor Pro**, per spec v21 — a Pro module plus a promotion stub in core. See §9. |
| Does it need new shared code in `packages`? | **One item only** — a responsive settings prop that can drive a CSS custom property (§5, R9). Everything else reuses what exists. See §10. |

The standalone POC scores **58 / 60** behavioural checks on v8 and **57 / 60** on the v9 RC. The
failures are genuine findings, not harness noise, and are described in §3.

Beyond the harness, the branch contains a working `e-carousel` element in the plugin behind a hidden
experiment — seven element types, Twig templates, conditional children and the frontend handler —
verified end to end at 30 PHP-side and 22 browser-side checks. See §12.

---

## 2. Corrections to the evaluation page

Five claims on the Confluence evaluation page do not match reality. None of them change the
conclusion, but the page should be updated before it is used to justify the decision.

| Claim on the page | Measured / verified reality |
|---|---|
| Core is "~3–5 KB gzipped" | **7.45 KB gzipped** (17.89 KB minified). The main spec's "~7 KB" figure is the correct one. |
| "~8.7M downloads/week (core)" | **~37.1M/week**, but this is mostly `embla-carousel-react` traffic. `embla-carousel-autoplay` at ~2.7M/week is the better proxy for direct vanilla-JS use. |
| "v9.0.0-rc02 (release candidate, April 2026)" | Superseded: **9.0.0-rc03 shipped on 21 Aug 2026**. The cadence is one RC per four months (rc01 20 Jan, rc02 10 Apr, rc03 21 Aug 2026), and npm's `latest` tag is **still `8.6.0`** — the last stable release of anything, on 4 Apr 2025. |
| `@bluecadet/embla-carousel-a11y` / `embla-carousel-accessibility` listed as a v8 option to "evaluate" | `embla-carousel-accessibility` **has never been published for v8**. Its `latest` tag is `9.0.0-rc01` and it peer-depends on the v9 core. Using it means shipping the RC. |
| "Zero dependencies" | True for core and all first-party plugins. **Not** true for `embla-carousel-wheel-gestures`, which is third-party (maintainer `xiel`) and depends on `wheel-gestures`. Not in our V1 scope, but the blanket claim should be qualified. |

### Measured bundle sizes

esbuild, `--minify --format=iife --target=es2019`, gzip level 9 — the same shape the Elementor Vite
frontend build emits.

| Packages | minified | gzip | brotli |
|---|---|---|---|
| `embla-carousel` (v8.6.0) | 17.89 KB | **7.45 KB** | 6.72 KB |
| \+ `autoplay` + `fade` — **our V1 set** | 22.88 KB | **9.17 KB** | 8.30 KB |
| \+ `class-names` | 24.43 KB | 9.68 KB | 8.76 KB |
| `embla-carousel` (v9.0.0-rc02) | 19.15 KB | 7.99 KB | 7.24 KB |
| v9 rc02 + `autoplay` + `fade` + `accessibility` | 27.93 KB | 10.87 KB | 9.89 KB |
| `embla-carousel` (v9.0.0-rc03) | 19.18 KB | 8.01 KB | 7.26 KB |
| v9 rc03 + `autoplay` + `fade` — the v1 set | 25.19 KB | **10.16 KB** | 9.19 KB |
| v9 rc03 + `autoplay` + `fade` + `accessibility` | 30.23 KB | 11.80 KB | 10.69 KB |
| Whole POC bundle (engine + plugins + our handler + test harness) | 30.29 KB | 11.71 KB | — |

For comparison, V3 ships Swiper 8.4.5 (~20 KB gzipped for a *minimal* v14 build; the vendored v8
file is larger). The "~7 KB vs ~47 KB" framing in the spec is directionally right: the honest
number is **~9.2 KB gzipped for the full V1 feature set**, still a solid win.

---

## 3. POC findings

The POC reproduces the spec's exact DOM (all seven `data-e-type` nodes, arrows as siblings of the
viewport, JS-populated pagination) and the spec's base-styles CSS verbatim, then drives 15 scenarios
in a real browser. Full output: `node verify.mjs` / `node verify.mjs v9`.

### 3.1 Defect — RTL arrows do not swap (spec is wrong)

The spec's RTL section states: *"Arrow positions swap automatically (CSS `left`/`right` follow
document direction). No extra CSS needed."*

This is incorrect. `left` and `right` are **physical** properties and are unaffected by `direction`.
Measured in RTL with the spec's base styles, the Prev arrow stays on the left while the carousel
scrolls right-to-left, so the arrow that visually points backwards moves the slides forwards:

```
Spec CSS (left/right):           prev.x=40   next.x=685    <- prev on the LEFT, wrong for RTL
Logical props (inset-inline-*):  prev.x=685  next.x=40     <- prev on the RIGHT, correct
```

![RTL with the spec's base styles](img/carousel/v8-rtl.png)

**Fix:** use logical properties in the base styles.

```css
[data-e-type="e-carousel-arrow-prev"] { inset-inline-start: 16px; }
[data-e-type="e-carousel-arrow-next"] { inset-inline-end: 16px; }
```

Verified working (`node rtl-fix.mjs`). Pagination needs no change — the dots are a flex row and
already reverse with `direction`, with dot 0 landing rightmost.

Embla's own RTL handling is correct as long as the `direction: 'rtl'` option is paired with a real
`dir`/`direction` on the DOM. Nearly every RTL bug report in the tracker is someone setting the JS
option alone; all 18 RTL issues are closed and there are no open ones.

### 3.2 Defect — disabling an arrow at the edge breaks keyboard navigation

The spec requires two things that conflict:

- *Arrow buttons — `disabled` when can't scroll (non-loop)*
- *Keyboard — Arrow keys navigate slides*

When the user tabs to Next and presses ArrowRight until the last slide, the handler sets
`nextBtn.disabled = true`. A focused element that becomes `disabled` **loses focus to `<body>`**, so
a keydown listener scoped to the carousel stops receiving keys and the user's keyboard journey
dead-ends mid-carousel. Reproduced on both v8 and v9:

```
FAIL  a11y: focus survives the Next arrow becoming disabled at the last snap
      document.activeElement is <body> after the arrow was disabled
FAIL  a11y: ArrowLeft navigates back
      snap is 1, focus on <body>
```

The same test passes as soon as focus is put back inside the carousel, confirming the cause is focus
loss and not the key handling.

**Fix options**, in order of preference:

1. Use `aria-disabled="true"` plus a no-op click handler instead of the `disabled` attribute. The
   button stays focusable, which is the
   [APG-recommended](https://www.w3.org/WAI/ARIA/apg/patterns/carousel/) treatment for exactly this
   reason.
2. Keep `disabled`, but move focus to the opposite arrow (or the carousel root) when the focused
   button is about to be disabled.

This needs a decision from product/a11y, because option 1 changes the spec's stated contract
(`disabled` attribute, visually dimmed).

### 3.3 `transition_speed` as a 1–100 slider is a footgun

Embla's `duration` is a spring-physics constant, not milliseconds, and the docs recommend **20–60**.
The spec exposes it directly as a 1–100 slider with the raw value passed through. Measured
end-to-end transition time, averaged over 3 runs per value (`node speed-curve.mjs`):

| `transition_speed` | Measured transition |
|---|---|
| 1 (panel minimum) | 649 ms |
| 5 | 814 ms |
| 10 | 907 ms |
| 20 (bottom of Embla's documented range) | 739 ms |
| **25 (spec default)** | **1,708 ms** |
| 40 | 3,289 ms |
| 60 (top of Embla's documented range) | 5,274 ms |
| 80 | 7,231 ms |
| 100 (panel maximum) | **9,182 ms** |

Three problems. The **top of the slider gives a nine-second slide transition**, which reads as a
broken carousel. The **bottom third of the slider does nothing useful** — everything from 1 to 20
lands in the same ~650–900 ms band, so a quarter of the control's travel is dead (the floor is the
spring settling plus event latency, not the animation). And the **default of 25 is already 1.7 s**,
which is slower than most users will expect from a carousel.

On top of the UX, the raw Embla constant would be **persisted in `_elementor_data`**, making the
engine's internal unit part of our saved data contract — any future engine change then needs a prop
migration.

**Recommendation:** store a milliseconds value in the prop and map it to `duration` inside the
handler. That fixes the dead zone, gives product a meaningful default, and keeps the saved prop
engine-independent. Clamping the panel to 20–60 is the cheaper alternative but leaves the data
contract coupled to Embla.

### 3.4 Good news — the loop worry did not reproduce

The evaluation page and the Embla docs both warn that `loop` silently falls back to `false` when
there isn't enough slide content. The spec's default tree is 4 slides at 3 per view, which looked
like a likely trigger. It is not:

| Scenario | Effective `loop` |
|---|---|
| 4 slides, 3 per view (spec default) | **true** |
| 8 slides, 3 per view | true |
| 2 slides, 1 per view | true |

Wrap-around from the last snap to the first works, arrows correctly stay enabled in loop mode, and
the slide count in the DOM is unchanged — **no cloning**, confirmed by counting `e-carousel-slide`
nodes after looping. The editor still needs to handle the fallback case eventually, but it is not on
the default path and does not need to block V1.

### 3.5 Good news — CSS `gap` works, and the spec's `flex-basis` formula is correct

With `gap: 20px` on the container, the measured inter-slide distance is exactly 20 px and slide 2
lands flush at the viewport start after navigating (`slide.x=23.7`, `viewport.x=24.0`). Embla
measures rendered geometry, so no JS-side gap calculation is needed — exactly as the spec assumes.
The `flex-basis` formula in the spec's "Gap between slides" section validates as written.

### 3.6 Style ownership — Embla writes inline styles our Style tab cannot beat

Confirmed in the POC:

- container gets an inline `transform: translate3d(...)` always;
- individual slides get inline `transform` in loop mode (3 of 8 slides at the moment of sampling);
- slides get inline `opacity` in fade mode (`["1","0","0","0"]`).

V4 emits user styles as **generated CSS classes in a stylesheet**
(`modules/atomic-widgets/styles/styles-renderer.php`), and the style schema
(`modules/atomic-widgets/styles/style-schema.php`) does expose `transform`, `opacity` and
`transition` to users. Inline styles always beat class rules, so a user who sets `transform` or
`opacity` on `e-carousel-slide` or `e-carousel-container` gets **silently ignored styling** — a
support-ticket generator, and the gotcha the evaluation page already flags ("never apply custom
transform or transition to the container or slides").

**Recommendation:** restrict the style schema on the two Embla-controlled node types
(`e-carousel-container`, `e-carousel-slide`) rather than relying on documentation, or introduce an
inner wrapper inside each slide that carries user transforms.

### 3.7 One dot per snap position, not per slide — fixed in spec v21

The spec used to describe pagination as one dot per slide. Embla's dot count comes from
`scrollSnapList()`, which is the list of *reachable* positions, and with `containScroll: 'trimSnaps'`
the trailing positions that would scroll past the last slide are dropped. Six slides at three per
view with a 16 px gap produce **five** dots, not six, because the slides do not tile the viewport
exactly. A sixth dot would be a dot that cannot be selected.

Measured in the integration harness (`node verify-integration.mjs`): 6 slides → 5 dots, 7 slides →
6 dots, 2 slides → 1 dot, at which point the arrows and the dot strip hide themselves.

Spec v21 now reads "one dot per scroll snap point (depends on slide count and `slides_to_scroll`)",
so this is resolved. Recording it here because the numbers are the ones QA should expect, and a
reviewer counting dots against slides will otherwise file a bug.

### 3.8 Everything else in the spec verified as achievable

| Requirement | Result |
|---|---|
| Arrow disabled states, first/last/middle, loop on/off | pass |
| Dot count from `scrollSnapList()`, active dot, click-to-navigate | pass |
| Arrows and pagination hidden when `slides_per_view >= slide count` | pass |
| Fade + loop together, `slides_per_view` forced to 1 | pass |
| `slides_to_scroll = 3` over 9 slides → 3 snaps | pass |
| `slides_to_scroll (5) > slides_per_view (3)` — spec edge case | initialises cleanly, 2 snaps |
| Autoplay advances; pause/play button toggles and updates `aria-label` (WCAG 2.2.2) | pass |
| `pause_on_hover` | pass **on v8**; fails on v9 (see §4) |
| Editor mode: loop off, autoplay off, drag off — dragging the viewport does nothing | pass |
| Dynamic add/remove of slides auto-reinits and rebuilds dots and `aria-label="X of Y"` | pass |
| `prefers-reduced-motion`: no autoplay, instant transitions | pass |
| Multiple carousels on one page, independent | pass |
| No-JS: slides render in a static clipped flex row | pass |

The dynamic-slides result matters most for the editor: Embla's `watchSlides` runs a MutationObserver
on the container and re-inits itself when the repeater adds or removes a slide. We get the editor's
hardest requirement for free.

![Default scenario](img/carousel/v8-default.png)

---

## 4. Version decision: v8.6.0, not v9 RC

The evaluation page leaves this open ("if stable enough for our timeline, start on v9 to avoid
migration later").

**Re-checked on 26 Aug 2026 against `9.0.0-rc03`, which shipped on 21 Aug** — after the original
evaluation, and five days before this re-check. The packages were installed and their type
definitions read directly (`carousel-poc/v9rc3/`) rather than taken from a changelog. One of the two
original objections is fixed by rc03; the other is not.

**Fixed in rc03 — the accessibility plugin is now configurable.** On rc02 it wrote `role="region"`,
`aria-roledescription="carousel"` and `aria-label` onto the Embla root, which in our structure is
`e-carousel-viewport`, producing a second carousel region nested inside the one the spec puts on
`e-carousel`. rc03 adds a `rootNode` callback plus `carouselRole`, `carouselAriaRoleDescription`,
`slideRole`, `slideAriaRoleDescription`, `slideAriaLabel`, `dotButtonAriaLabel`, `liveRegionContent`
and `announceChanges` options, and explicit `setupPrevAndNextButtons` / `setupDotButtons` /
`setupLiveRegion` methods. Pointing `rootNode` at our `e-carousel` would put the attributes exactly
where the spec wants them. The spec has since chosen manual ARIA anyway, so the plugin is no longer
an argument either way — but this objection is gone.

**Not fixed in rc03 — autoplay still has no pause-on-hover option.** The complete option set is
`delay`, `instant`, `defaultInteraction`, `stopOnLastSnap`, `rootNode`. `stopOnMouseEnter`,
`stopOnInteraction`, `stopOnFocusIn` and `playOnInit` are still gone, so `pause_on_hover` and
`pause_on_interaction` are ours to implement on v9 — the identical POC handler passes `pause_on_hover`
on v8 and fails it on v9 for exactly this reason. The cost is smaller than it first appears, though:
rc03 exposes `play` / `stop` / `pause` / `reset` / `isPlaying` / `timeUntilNext` and an
`autoplay:interaction` event carrying `interaction: 'mouseenter' | 'mouseleave' | 'pointerdown' |
'pointerup' | 'slidefocus' | 'slidefocusout'` plus `isMouseOver` and `isPointerDown`. So it is
`defaultInteraction: false` and one event subscription — roughly twenty lines, and finer-grained
control than v8's booleans.

**Still no stable release.** npm's `latest` tag is `8.6.0`. The RC cadence is one every four months
(rc01 20 Jan, rc02 10 Apr, rc03 21 Aug 2026) with no announced date, and the surface does still move
between RCs — `scrolloptimize` was added in rc01 and removed in rc02 after it broke stacking
contexts.

**The rename is broad, and confirmed against rc03.** `scrollNext` / `scrollPrev` / `scrollTo` →
`goToNext` / `goToPrev` / `goTo`; `scrollSnapList` → `snapList`; `selectedScrollSnap` →
`selectedSnap`; `canScrollNext` / `canScrollPrev` → `canGoToNext` / `canGoToPrev`; `watchDrag` →
`draggable`; `watchSlides` → `slideChanges`; `watchResize` → `resize`; `startIndex` → `startSnap`;
all events lowercase. Against that, v8 is a dead branch for fixes — genuine autoplay bugs (#1300,
#1139) were fixed only in the v9 line and never backported.

**Recommendation:** pin `embla-carousel@8.6.0` exactly (plugin peer deps pin the core version to the
patch, so all packages must move together), keep the seam described below, and re-evaluate when v9
goes stable. The deciding factor is no longer the API — it is that shipping a release candidate
inside a paid Pro feature is a risk architecture cannot absorb, whereas the risk of a later library
upgrade *can* be absorbed. The next section is how.

### The migration contract — what makes any engine change safe

The question worth answering is not "which version" but "what happens to the carousels users already
built when we upgrade the library". Two different things get called an adapter here, and only one of
them is a real risk.

**What users persist is our schema, not Embla's.** Users write no code. What lands in
`_elementor_data` is our props — `loop: true`, `slides_per_view: 3`, `transition_type: 'slide'`. If no
persisted byte is a value that belongs to the engine, a library upgrade cannot invalidate an existing
element and no data migration is ever needed. Four rules keep it that way:

1. **Never persist an engine constant.** Prop values are in units a human chose, not units a library
   invented.
2. **Prop names describe user intent**, not library options — `pause_on_hover`, never
   `stopOnMouseEnter`.
3. **Enum values are ours** — `slide` / `fade`, not plugin names.
4. **Never persist a derived value** such as a snap index or a dot index. Both are recomputed from
   the DOM on every init.

**The current spec breaks rule 1 in exactly one place:** `transition_speed` as a raw 1–100 slider
passed straight through as Embla's `duration`. That is the engine's internal spring constant stored
in our database. If we change engines — or if Embla merely retunes its physics between versions,
which is not a breaking change by semver — then `25` silently means a different speed on pages that
are already published, and *that* is the kind of data migration this section exists to avoid. Storing
milliseconds and mapping inside the handler removes the only such leak in the element. That is why
§3.3 is more than a UX nitpick.

**The DOM and the ARIA are ours too.** Embla is headless: no markup, no classes, no ARIA, no CSS. V4
style props attach to our element types, so an engine change cannot move a user's styling. The one
exception is the inline `transform` on the container and the inline `transform` / `opacity` on slides
(§3.6) — a second reason to restrict the style schema on those two types. It protects users from
silently-ignored styles today and from a change in how the engine animates tomorrow.

**One seam, one file.** Every Embla import lives in a single engine module exposing an interface we
define — `next()`, `prev()`, `goTo(i)`, `snapCount()`, `selectedSnap()`, `canPrev()`, `canNext()`,
`on()`, `play()`, `pause()`, `isPlaying()`, `reinit()`, `destroy()`. The handler never imports
`embla-carousel` and never calls an `emblaApi.*` method directly. Worth enforcing with an ESLint
`no-restricted-imports` rule rather than a convention, so nobody punches through the seam six months
from now.

**Contract tests written against the seam, not against Embla.** This is what turns "we can upgrade
safely" from a promise into a checkable fact: the behavioural suite targets our interface, so the same
suite runs against both engine versions and a green run *is* the parity proof. The POC already
demonstrates it — one handler, a ~20-line adapter, 60 checks on v8 and 57 on the v9 RC, the three
differences being real findings rather than harness breakage. The seam has survived a real
major-version swap once already.

Net effect: a future v9 move is one rewritten file plus one test run. Nothing reads or rewrites
anything a user saved.

---

## 5. Backward- and forward-compatibility risks

The spec's Backward Compatibility section only says "V3 stays as-is, `e-carousel` is new, no
migration needed". That is true and also not the interesting part. The real risks are
**forward**-compatibility ones created by how V4 persists nested elements.

| # | Risk | Severity | Notes |
|---|---|---|---|
| **R1** | **Structural changes after release cannot be migrated.** `define_default_children()` only runs when the element is created (`atomic-element-base-model.js`), and the full tree is written into `_elementor_data` on save (`Document::save_elements`). `children_dependencies` *do* backfill missing children when a model initialises in the editor (`reconcileInitialChildren`) and at render time for component instances (`Reconcile_Component_Instance_Elements::apply`) — so a conditional child added later does reach documents that are reopened. What has no path is a published page that is never reopened, and `Migrations_Orchestrator` cannot help: it walks `settings` props, not `elements[]`. | Medium | Not a v1 problem for a brand-new element, and spec v21 resolves the specific case by making `e-carousel-autoplay-button` a persisted conditional child. It stays on the list because it constrains every post-release structural change. |
| **R2** | **`children_dependencies` stash is sessionStorage-only.** Toggling `show_arrows` off detaches the arrow elements and stashes them in session storage (`stash.ts`); saving writes a document without them. After the session ends the stash is gone, so re-enabling arrows restores the **factory default**, not the user's customised arrow content. | **High** | The spec explicitly asks for `Child_Dependency` here. Same pattern already shipped in `e-background-video`, so this may be an accepted product behaviour — but it must be a conscious decision, not a surprise. |
| **R3** | **Embla's inline styles beat the Style tab** on `e-carousel-container` and `e-carousel-slide`. | **High** | See §3.6. Restrict the style schema on those node types. |
| **R4** | **`transition_speed` persists an Embla physics constant** into `_elementor_data`. | Medium | See §3.3. Store ms and map, or the engine becomes part of our data contract. |
| **R5** | **Prop renames/removals need a migration.** `Props_Parser` throws on save for invalid settings; render is lenient and ignores unknown props. Migrations exist for prop *types* and key renames via `migrations/manifest.json`. | Medium | Cheap if planned; expensive if discovered post-release. |
| **R6** | **Swiper 8.4.5 and Embla both load** on a page containing a V3 `image-carousel` and a V4 `e-carousel`. No dedup mechanism exists. | Medium | ~20 KB + ~9 KB gzipped. Probably acceptable during the V3/V4 overlap period, but worth stating explicitly rather than discovering in a performance review. |
| **R7** | **`eicon-nested-carousel` is already used by Elementor Pro's `nested-carousel` widget**, which is also labelled "Carousel" in the panel. | Low | The spec says "exists in the eicons set, no design task needed" without noting the collision. Users with Pro will see two identically-iconed, identically-named widgets. |
| **R9** | **Per-breakpoint `slides_per_view` cannot come from a settings prop.** Only *style* props are breakpoint-aware in V4; settings props hold one value. The element writes `--e-carousel-slides-per-view` as an inline attribute, so it is one value for all breakpoints. | Medium | Making it responsive means either sourcing the variable from a style prop or emitting per-breakpoint CSS for the element's own class. Discovered while implementing, not while reading the spec. |
| **R8** | **Component instances**: dependency-inserted children get deterministic derived IDs (`reconcile-component-instance-elements.ts`), and detached conditional children fall back to `default_model` with no stash server-side. | Medium | Spec v21 requires all 14 props to be exposable as component properties, including `show_arrows`, `pagination_type` and `show_autoplay_button` — precisely the three that detach children. Needs explicit QA. |
| **R10** | **`--e-carousel-gap` has no source.** Spec v21's `flex-basis` formula reads `var(--e-carousel-gap, 0px)`, but the gap is set by the user through the Style tab as plain CSS `gap` on the container. Nothing writes the variable, and CSS cannot read a computed `gap`. | Medium | Either own a Gap control on the root that emits both `gap` and the variable, or drop the variable and accept that with a gap the Nth slide is partially clipped. Embla itself needs no help — see §3.5. |

**R3, R2 and R9 are the ones worth deciding early.** R3 is a silent-failure class of bug that
generates support tickets rather than test failures. R2 changes what users lose and needs a product
call, not a technical one. R9 is the only item on the list that needs infrastructure which does not
exist yet, and whichever way it is solved becomes precedent for every future element with a
responsive behavioural prop.

The earlier draft of this report treated R1 as undeferrable and recommended generating the autoplay
button in JavaScript to avoid it. That was too absolute: `children_dependencies` backfill missing
children in the editor and for component instances, so a persisted conditional child is viable, and
spec v21 has since chosen exactly that. The POC still generates the button in JS and should be
brought in line.

---

## 6. Alternatives considered

Verified against the npm registry and each library's shipped source (not just docs) on 14 Aug 2026.

| Library | Version (date) | gzip | Loop mechanism | Headless | Fade | Verdict |
|---|---|---|---|---|---|---|
| **Embla** | 8.6.0 (Apr 2025) | **9.2 KB** w/ plugins | Transform on real nodes | **Yes** — ships zero CSS, zero DOM, zero ARIA | Plugin | **Recommended** |
| Swiper | 14.1.0 (Aug 2026) | 22.5 KB minimal | **Physically prepends/appends real slide nodes** | No — own CSS, DOM, ARIA | Module | **No.** Reordering our slide nodes on every loop wrap would fight the editor's element tree; arguably worse for us than cloning. |
| keen-slider | 6.8.6 (Jul 2023) | 6.0 KB | Transform | Mostly | **No — DIY** | Viable fallback. Smallest option, but no fade and no autoplay, and no feature release in 3 years. |
| Glide.js | 3.7.1 (Nov 2024) | 7.8 KB | **Clones** | No | No | Disqualified on cloning. |
| Splide | 4.1.4 (**Nov 2022**) | 13.4 KB | **Clones** | No | Yes | Disqualified — unmaintained for ~4 years, 143 open issues. |
| Flicking | 4.16.4 (Jul 2026) | 33.2 KB | Transform | No | Plugin | Best-maintained (Naver, 12 maintainers) but 3.4× the size. |
| `@zag-js/carousel` | 1.43.0 (Aug 2026) | 9.7 KB | Jump-back only | Yes, but owns ARIA | No | Excellent maintenance; wrong loop semantics and no fade. Revisit if we ever move to native scroll-snap. |
| tiny-slider / blaze-slider / Nuka | 2021–2025 | — | clones / n-a | — | — | Dead, or React-only (Nuka). |

### Native CSS carousel primitives

The spec already rejected this path; the data still supports that call. From `@mdn/browser-compat-data@8.0.11`
and `caniuse-db@1.0.30001809`:

| Feature | Chrome | Safari | Firefox | Reach |
|---|---|---|---|---|
| `::scroll-button()`, `::scroll-marker`, `::scroll-marker-group` | 135 | **not shipped** | **not shipped** | ~69.8% |
| `scroll-snap-type` | 69 | 11 | 99 | 96.1% |
| Scroll-driven animations | 115 | 26 | Nightly only | ~84.4% |

Seventeen months after Chrome 135, neither Safari nor Firefox has shipped the pseudo-elements, and
you cannot polyfill a pseudo-element. Building on them means ~30% of pageviews — essentially all
Safari and Firefox users — see a carousel with no arrows and no dots. Native scroll-snap also gives
no loop and no fade, so the two hardest features would still be ours.

Worth doing anyway: build the viewport as `overflow: auto` + `scroll-snap-type` **underneath**
Embla. Embla coexists with it, it improves the no-JS fallback beyond the current static row, and it
leaves the door open to dropping the JS layer for simple carousels once Safari and Firefox catch up.

---

## 7. Maintenance risk on Embla — stated plainly

- **Bus factor is 1.** David Jerleke has 837 of ~900 commits; the next highest human contributor has
  10. One npm publisher and one release author for every release in the project's history.
- **Funding is minimal** — GitHub Sponsors only, with Syntax FM the one substantial sponsor. The
  maintainer states publicly that lack of sponsorship delayed v9 by 6–10 months.
- **But the tracker is genuinely clean**: 6 open issues, 14 open PRs (9 of them dependabot), and the
  repo was pushed 3 days before this report.
- **And v8 shipped the same way**: v8 spent 10 months and 23 release candidates in RC before going
  stable. v9 at 7 months and 2 RCs is tracking normally for this project, not dying.

Two open issues are on our path and worth watching:

- [#1243](https://github.com/davidjerleke/embla-carousel/issues/1243) — selected slide resets on
  window resize when using `breakpoints`. Open 11 months. We plan responsive `slides_per_view`,
  though we intend to drive it with our own CSS variable rather than Embla's `breakpoints`, which
  likely avoids it.
- [#1321](https://github.com/davidjerleke/embla-carousel/issues/1321) — `reInit()` called
  synchronously inside the ResizeObserver callback. Relevant to the editor canvas, which resizes
  constantly. Community fix PRs #1327/#1328 have been open and unmerged since April.

Mitigation: pin the version, keep the API adapter, and accept that a fork is cheap if it ever comes
to that — the whole engine is 18 KB of dependency-free MIT TypeScript.

---

## 8. Spec gaps and questions for product

1. **RTL arrows** (§3.1) — the RTL section is factually wrong. Base styles must use logical
   properties. *Spec fix, no product decision needed.*
2. **`disabled` arrows vs keyboard navigation** (§3.2) — these two requirements conflict. Proposal:
   `aria-disabled` instead of the `disabled` attribute. **Needs product/a11y sign-off** since it
   changes a stated contract.
3. **`transition_speed` range** (§3.3) — the 1–100 slider produces a 9-second transition at the top,
   a dead zone across its bottom fifth, and a 1.7-second default. Proposal: store milliseconds and
   map internally. **Needs product decision.**
4. **`show_autoplay_button` contradicts itself in spec v21** — the props table keeps it (Boolean,
   default true, exposable as a component property) while panel item 13 says to remove the control
   entirely and always show the button when autoplay is ON. **Needs product decision.** Either
   reading is implementable; the persisted-child mechanism works for both (§5 R1).
5. **`show_arrows` OFF loses customised arrow content across sessions** (§5 R2) — is that acceptable?
   It is the existing `e-background-video` behaviour, so there may be precedent, but the carousel
   spec makes arrows a headline customisation feature, which raises the stakes.
6. **Style tab on slides/container** (§3.6) — user `transform` / `opacity` will be silently ignored.
   Should we hide those controls on those two node types?
7. **`eicon-nested-carousel` + "Carousel" label collide with Elementor Pro's nested carousel** (§5 R7).
8. **Loop fallback UX** (§3.4) — did not reproduce on the default tree, but if a user reaches a
   configuration where Embla disables loop, should the editor warn?
9. ~~**"One dot per slide"**~~ (§3.7) — **resolved in spec v21**, which now says one dot per scroll
   snap point. QA should expect 5 dots from 6 slides at 3 per view, not 6.
10. **Is `slides_per_view` meant to be per breakpoint?** (§5 R9) — spec v21 marks both
    `slides_per_view` and `slides_to_scroll` as responsive, but V4 settings props hold a single
    value. **Needs a product and core decision**, and it is the one item that needs new
    infrastructure. `slides_to_scroll` is the harder half, because the handler reads it at runtime
    rather than through CSS, so a per-breakpoint CSS variable alone does not solve it.
11. **Who sets `--e-carousel-gap`?** (§5 R10) — the spec's own formula depends on a variable nothing
    writes.
12. **Experiment name and ownership** — the spec says `e_carousel`, but Pro modules register their
    own flags and the two existing V4 Pro elements use `e_pro_atomic_form` / `e_pro_collection_loop`
    (§9). Proposal: `e_pro_atomic_carousel`, registered from the Pro module, with core's
    `e_atomic_elements` as a prerequisite.
13. **`eicon-nested-carousel` + "Carousel" collide with Pro's `nested-carousel` widget** (§5 R7).
    Now that both live in Pro, the collision is inside a single plugin rather than across two.
14. **Go links** for the Carousel upgrade and renewal flows — spec v21 has `[Add link]` placeholders
    in both places, and both need to exist before the promotion work can be finished.

---

## 9. What spec v21 changed, and where the code lives now

Re-read on 25 Aug against version 21 (24 Aug). What moved:

| Change | Effect on this report |
|---|---|
| **Version is now Pro**, with a Pro requirements section: license-tier registration, Free→Pro promotion tile, locked-but-intact state without Pro, expired-license behaviour, Go links | The POC has to be ported into an `elementor-pro` module with a promotion stub in core. Discussed below |
| **Eight element types.** `e-carousel-autoplay-button` is now an explicit locked child, added when autoplay is ON | Resolves the open decision in §5 R1, in the opposite direction to the earlier recommendation. The mechanism does work — see the R1 note |
| **`carousel_name`** (String, default `Carousel`) drives the root `aria-label` | New prop, new QA row, new component property |
| **`equal_height`** (Boolean, default true) | New prop. Explicitly *not* viewport auto-height, which stays out of scope |
| **`show_pagination` → `pagination_type`** (`none` \| `dots`), with fraction and progress deferred to V2 | Prop rename; the POC still uses the boolean |
| **`slides_per_view` and `slides_to_scroll` are marked responsive** | Turns §5 R9 from a nice-to-have into a scoping decision. See §10 |
| **`transition_speed` confirmed as a 1–100 slider, default 25, higher = slower** | The measurements in §3.3 still stand and still argue against it; the default moved into a saner part of the curve but the dead zone and the nine-second top end did not |
| **Pagination reworded to "one dot per scroll snap point"** | §3.7 is resolved |
| **`aria-live` is now dynamic** — `off` while autoplay runs, `polite` when off or paused | New handler requirement |
| **Gap formula now references `var(--e-carousel-gap, 0px)`** | Nothing writes that variable. New risk, §5 R10 |
| **QA checklist grew from 20 to 23 rows**; Components Compatibility from 12 to 14 props | Test scope |
| **Open Questions section emptied** ("all resolved") | Two of the three defects in §3 are still present in the spec, and §8 lists what is genuinely still open |

The spec also repeats that the structure is "suggested, not rigid" — the public API (props,
accessibility, behaviour) is the contract, and internal implementation details are ours.

### Where the code lives

The POC in this repository was built as a core element, so it has to move. Two precedents exist for a Pro-gated V4 atomic element — `Atomic_Form` / `Atomic_Form_Promotion` and
`Collection_Loop_Promotion` — and between them they cover everything the spec asks for.

| Concern | Where it goes | Precedent |
|---|---|---|
| Element classes, Twig, base styles, handler | **elementor-pro**, as a module | `elementor-pro/modules/collection-loop/` |
| Registration switch | **core** — `if ( Utils::has_pro() && experiment ) { real } elseif ( ! has_pro() ) { promotion }` | `modules/atomic-widgets/module.php:399-409` |
| Promotion stub | **core** — same `elType`, `meta( 'is_pro_promotion', true )`, `should_show_in_panel() => false`, `Preserves_Children_Subtree`, Twig upgrade placeholder | `atomic-form-promotion.php`, `collection-loop-promotion.php` |
| Panel tile + upgrade popover | **core** `Promotions_Module` → `atomicWidgetPromotions` | `atomic-form-widget-promotion.php` |
| Experiment flag | **elementor-pro**, via the module's `get_experimental_data()` | `e_pro_atomic_form`, `e_pro_collection_loop` |
| Handler build | **elementor-pro** Vite frontend entry, `@elementor/frontend-handlers` externalised to `elementorV2.frontendHandlers`, script registered with a dependency on core's `elementor-v2-frontend-handlers` | `collection-loop-pagination-handler` |
| Slides repeater control | **elementor-pro** editor package; `controlsRegistry` is a public export of `@elementor/editor-editing-panel` and Pro already registers into it | `editor-collection-loop`, `editor-editing-panel-extended` |

Two things worth knowing before this work is scoped:

**The "already on the canvas without Pro" requirement needs no new code.**
`Pro_Promotion_Data_Preservation` discovers promotion types by the `is_pro_promotion` meta and
restores settings and children on document save, and `Preserved_Element` keeps unknown child types
verbatim, so a carousel's whole subtree survives an editor save with Pro inactive. The requirement is
satisfied by the stub following the meta convention.

**There is a hole in the existing pattern.** When Pro *is* installed but the experiment or the
license blocks registration, neither the real element nor the promotion stub registers — core only
registers a stub in the `! has_pro()` branch. That state renders nothing. The same hole exists for
Form and Loop today, so it is a core question rather than a carousel one, but the carousel needs an
answer either way.

Also: Embla must be bundled in exactly one place. If the handler moves to Pro, the packages come out
of core's `package.json` with it.

---

## 10. Shared code and `packages` — what, if anything, belongs there

The short answer: **one genuine piece of new infrastructure, two cheap utilities, one generalisation
to defer, and no new package for the element or its handler.**

### Reuse as-is

- **`@elementor/frontend-handlers`** gives the handler registration by `data-e-type`, settings from
  `data-e-settings`, an `AbortSignal` that cleans up listeners, teardown on re-render, and
  `listenToChildren( types ).render()` for editor child churn. The carousel needs all of it and adds
  nothing to it — Pro consumes the package as a global, it cannot extend it.
- **`Repeater` from `@elementor/editor-controls`**, plus `useElementChildren`, `createElements`,
  `removeElements`, `moveElements` and `updateElementEditorSettings` from `@elementor/editor-elements`
  — all public exports, all usable from a Pro package. That is the whole Slides repeater.
- **`Style_Variant::set_breakpoint()`** for static per-breakpoint base CSS, and `Size_Prop_Type` with
  a custom unit for the slide `flex-basis: calc(...)`.
- **Per-entry Vite bundling for npm dependencies.** There is already a Pro precedent for a handler
  with an npm dep (`dompurify` in the collection-loop pagination handler).

### Genuine new infrastructure — one item

**A responsive settings prop that can drive a CSS custom property** (§5 R9). Only *style* props are
breakpoint-aware in V4; settings props hold one value. The three routes are: source the variable from
a style prop with per-breakpoint variants; add a responsive settings prop type with a resolver and
panel control; or hard-code breakpoint overrides in base styles and give up user control. The
carousel is the first element to need this, and whichever route is chosen becomes precedent.

### Cheap shared utilities, worth doing if the core team agrees

`prefersReducedMotion()` and `isEditorPreview()` in `@elementor/frontend-handlers`. There are
currently **four** different editor-detection idioms across shipped handlers — a `data-*` attribute
on the carousel, `isEditorPreview()` in background video, `isEditorContext()` in forms and links, and
an inline check in collection loop — and reduced motion is implemented locally in two places. The
carousel needs both helpers, so this is the moment to stop the drift, if we want to.

### Defer

- **A generic nested-children repeater.** Tabs ships `tabs-control` plus its own `use-actions`;
  Accordion is planned the same way; the carousel would be the third roughly 80%-identical copy.
  Extract a shared hook when the third one lands, not before — and the carousel *is* the third, so
  this is worth a look during that story rather than a blind copy.
- **A shared `@elementor/embla` package, or externalising Embla to a global.** No second consumer, no
  precedent. Per-entry bundling is correct until there is one.

---

## 11. Proposed implementation stories under ED-25236

Each story carries something a user or the business can see, and each is independently reviewable.
Unit and Playwright tests are part of every story's definition of done rather than a story of their
own — a carousel whose behaviour is not tested is not done. Stories 1, 2, 3 and part of 5 exist on
this branch as the POC described in §12, but the POC is a sketch, not a reviewable PR: it has no
tests, skips the panel control, and lives in core rather than Pro.

| Story | What it delivers | Notes |
|---|---|---|
| [ED-25375](https://elementor.atlassian.net/browse/ED-25375) | Pro gating, feature flag and the Embla asset pipeline | Nothing user-visible. Unblocks everything else and lets the work merge dark. §4, §9 |
| [ED-25376](https://elementor.atlassian.net/browse/ED-25376) | Element structure, panel controls and rendering | Drop a carousel, fill four slides, style every part. Carries the RTL fix (§3.1) and the style-schema restriction (§3.6) |
| [ED-25377](https://elementor.atlassian.net/browse/ED-25377) | Navigation and motion on the frontend | Arrows, dots, slide/fade, loop. Carries the one-dot-per-snap model (§3.7) and the `transition_speed` decision (§3.3) |
| [ED-25378](https://elementor.atlassian.net/browse/ED-25378) | Autoplay with an accessible pause/play control | WCAG 2.2.2. Carries the persisted eighth element (§5 R1) and the runtime `aria-live` switch |
| [ED-25379](https://elementor.atlassian.net/browse/ED-25379) | Authoring experience in the editor | Slides repeater, navigate-on-selection, editor-safe engine. Third children-repeater in the codebase — see §10 |
| [ED-25380](https://elementor.atlassian.net/browse/ED-25380) | Keyboard and screen-reader accessibility | Carries the `aria-disabled` decision (§3.2) |
| [ED-25381](https://elementor.atlassian.net/browse/ED-25381) | Per-breakpoint Slides Per View / Slides To Scroll | The only story that needs new core infrastructure (§5 R9, §10). May be descoped |
| [ED-25382](https://elementor.atlassian.net/browse/ED-25382) | Free → Pro promotion and license states | The revenue path, plus content preservation when Pro is absent (§9) |
| [ED-25383](https://elementor.atlassian.net/browse/ED-25383) | Works as a Component | All 14 props exposable; the three children-detaching props need explicit QA (§5 R8) |
| [ED-25384](https://elementor.atlassian.net/browse/ED-25384) | Agent Ready | Descriptions, `render_markdown()`, prop self-documentation |
| [ED-25385](https://elementor.atlassian.net/browse/ED-25385) | GA — remove the experiment and document the element | Also lands the spec and evaluation-page corrections from §2 and §8 |

ED-25375 should carry the decision record from §4 (v8.6.0 pinned, adapter at the boundary) so the
rationale is not lost in a commit message.

---

## 12. The element itself, built on this branch

The standalone harness proves Embla can satisfy the spec. To prove the *architecture* works, the
branch also contains a working `e-carousel` in the plugin, wired the way a real PR would be:

```
modules/atomic-widgets/elements/atomic-carousel/
  atomic-carousel.php                  # root: props, controls, base styles, default children,
  atomic-carousel.html.twig            #       children dependencies, script registration
  atomic-carousel-arrow-base.php       # shared arrow behaviour
  atomic-carousel-viewport/            # + container/, slide/, arrow-prev/, arrow-next/, pagination/
  handlers/carousel-handler.js         # the POC handler, ported onto @elementor/frontend-handlers
```

plus `e_carousel` as a hidden dev experiment in `modules/atomic-widgets/module.php`, the three
pinned Embla packages in `package.json`, and a `carousel-handler` entry in
`scripts/vite/shared/entries.mjs`.

Verified two ways:

**`carousel-poc/render-check.php`** boots the real WordPress install, registers the seven element
types, renders the tree through Elementor's own renderer and asserts the contract the handler
depends on — 30 checks, all passing. It also writes `carousel-poc/integration.html` from that
rendered markup.

**`carousel-poc/verify-integration.mjs`** serves that markup with the *built* bundle
(`assets/js/carousel-handler.js`) loaded exactly as WordPress loads it, and drives it in Chromium —
22 checks, all passing, including one-dot-per-snap, focusable `aria-disabled` arrows, keyboard
navigation, and add/remove of slides from outside the handler.

![The rendered element](img/carousel/integration-e-carousel.png)

Three places where the implementation deliberately differs from the spec, each following a
measurement above:

| Spec says | Implementation does | Why |
|---|---|---|
| `transition_speed` is a 1–100 slider stored as Embla's `duration` | stores milliseconds, maps to Embla's 12–60 band in the handler | §3.3 — the raw constant is a physics value, and persisting it makes the engine part of our data contract |
| `show_autoplay_button` was "a dev decision" at the time | the button is created by the handler, not persisted | §5 R1 as it was first understood. **Spec v21 has since made the button a persisted conditional child, and the mechanism does work — the POC is now the odd one out and should follow the spec.** |
| Arrows sit at `left` / `right`, "RTL swaps automatically" | `inset-inline-start` / `inset-inline-end` | §3.1 — physical properties do not follow `direction` |

What a real PR still needs that this POC does not have: the Slides repeater panel control (slides are
managed from the Structure panel here), an editor preview handler, the v8/v9 API adapter (the ported
handler imports v8 directly, since that is what `package.json` pins), the three props spec v21 added
or reshaped (`carousel_name`, `equal_height`, and `pagination_type` in place of the boolean
`show_pagination`), the runtime `aria-live` switch, and the persisted autoplay button. None of those
change the architecture.

**The bigger gap is packaging, not behaviour.** This POC lives in core behind `e_carousel`, while
spec v21 makes Carousel a Pro feature. The element, its templates, its handler and its Embla
dependencies all belong in an `elementor-pro` module, with a promotion stub left behind in core (§9).
Treat the code on this branch as a reference implementation to port, not as the first commit.

A note for whoever picks this up: Playwright refuses to click a button with
`aria-disabled="true"`, treating it as not actionable. The behaviour is correct in a browser — the
click lands and the handler ignores it — but the spec's QA checklist will need `force: true` on
those steps, or it will read as a bug.

---

## Running the POC

```bash
cd carousel-poc      # at the WordPress root, i.e. three levels above this repository
npm install          # embla v8 in ./node_modules, v9 rc02 in ./v9/node_modules
node build.mjs       # bundles both harnesses, prints the size table
node verify.mjs      # 60 behavioural checks against Embla v8.6.0
node verify.mjs v9   # the same checks against v9.0.0-rc02
node a11y-diff.mjs   # what the v9 accessibility plugin writes onto our markup
node rtl-fix.mjs     # RTL arrow positioning, before and after the logical-property fix
node speed-curve.mjs # real transition time across the 1-100 transition_speed range
```

The element built into the plugin (§12) is verified separately, because it needs the local
WordPress install and the built bundle:

```bash
cd wp-content/plugins/elementor && npm install && node scripts/vite/build-scripts.mjs --dev

# from the site root; the socket path comes from the local WP stack's my.cnf
php -d memory_limit=1024M \
    -d mysqli.default_socket="<local-mysql-socket>" \
    carousel-poc/render-check.php     # 30 PHP-side checks, writes integration.html

cd carousel-poc && node verify-integration.mjs   # 22 browser checks on the built handler
```

`dist/v8.html` and `dist/v9.html` can also be opened directly in a browser to click through all 15
scenarios by hand.

| File | Purpose |
|---|---|
| `src/e-carousel.js` | The handler — spec props in, Embla out. Contains the v8/v9 API adapter. |
| `src/scenarios.js` | The 15 test scenarios and the spec-exact DOM builder. |
| `base.css` | The spec's base-styles table, verbatim. |
| `nojs.html` | Static markup for the graceful-degradation check. |
| `verify.mjs` | Playwright checks. Waits on Embla's `settle` event rather than fixed timeouts, because `duration` is not milliseconds. |
| `render-check.php` | Renders the real element through WordPress and asserts the markup contract. |
| `integration.template.html` | Page shell for the integration harness; restates the PHP base styles so it can be served statically. |
| `verify-integration.mjs` | Browser checks against the real markup and the built bundle. |

The POC needs a local Chromium; it reuses the one already in the Playwright cache
(`POC_CHROMIUM=/path/to/Chromium` to override).
