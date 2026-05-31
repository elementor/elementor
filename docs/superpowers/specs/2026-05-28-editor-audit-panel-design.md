# Editor Audit Panel — Design Spec

Date: 2026-05-28
Status: Brainstormed, awaiting implementation plan
Owner: TBD

## 1. Problem & goals

Add an Audit/Insights panel inside the Elementor editor that scans the current document for violations across SEO, Accessibility, Performance, Health and Best Practices, surfaces an overall and per-category score, and lets the user jump from a violation directly to the offending element.

In scope for v1:

- A new floating + dockable React panel framework, generic and reusable beyond audits.
- A new audits feature built on top of that framework, shipping with 12 built-in audits.
- A PHP module that owns the WordPress-side surface: filter for audit descriptor registration, a single REST endpoint for WP-only data, and bundle enqueueing.
- A top-bar toggle button in the editor app bar.

Explicitly out of scope for v1:

- Live re-running of audits while the user edits (audits run on demand only).
- Per-audit configuration UI.
- Audits that belong to other Elementor plugins; each plugin registers its own audits from its own bundle.
- Multiple dock targets — only one dock side (inline-end) is supported in v1.
- Porting the legacy navigator (Structure) panel to the new floating framework — possible follow-up.

## 2. Locked-in decisions

1. **Audit execution model: JS-primary.** `Audit` is a TypeScript class. Audits read the live editor model. A small PHP REST endpoint provides WP-only data (post title, excerpt, featured image, image attachment sizes, kit defaults).
2. **Panel form factor: new generic floating + dockable React panel framework**, built as part of this project, reusable for future panels.
3. **Audit timing: on-demand only.** Panel opens to an empty state with a "Run page audit" button. Re-runs are triggered by an explicit "Re-scan" affordance.
4. **Scoring: Lighthouse-style.** Each audit declares categories, severity (UI signal), and weight (score impact). Per-category score = weighted pass ratio. Overall score = mean of populated category scores.
5. **Extensibility: PHP filter + JS registry.** PHP declares the descriptor list via filter `elementor/audits/audits`. JS owns the evaluator function via `registerAudit(descriptor, evaluator)`.
6. **v1 audit coverage: 12 built-in audits in this module.** Listed in §7.
7. **Package layout: split.** A new package `@elementor/editor-floating-panels` for the framework. A new package `@elementor/editor-audits` for the audit feature. A new PHP module `modules/audits/`. The existing `@elementor/editor-panels` package is left alone because it is structurally the V2 React replacement for the V1 left dock, not a generic panel host.
8. **Dock target: inline-end only, using CSS logical properties.** Dock side is `inset-inline-end` (right in LTR, left in RTL); the browser handles direction. Position state is stored as logical values (`insetInlineStart`, `insetBlockStart`).

## 3. High-level architecture

Three deliverables, one-way dependency chain:

- `modules/audits/` (PHP) — module class extending `Core\Base\Module`. Declares the `elementor/audits/audits` filter (pre-fills it with the 12 built-in descriptors), exposes one REST endpoint for WP-side data, enqueues the `editor-audits` editor bundle and inline-prints the resolved descriptor list as `window.elementorAudits.audits`.
- `@elementor/editor-floating-panels` (new package) — generic floating + dockable React panel framework. No knowledge of audits.
- `@elementor/editor-audits` (new package) — depends on `editor-floating-panels`. Contains the `Audit` base class, audit registry, score engine, the 12 built-in audits, the panel UI, and the top-bar toggle.

Runtime flow:

1. Editor boots → PHP module enqueues the audits bundle and inline-prints `window.elementorAudits = { audits, restNamespace, nonce }`.
2. `editor-audits/init()` reads descriptors from the window config and registers each one in the JS registry. Each built-in audit also calls `registerAudit(descriptor, evaluator)` with its TS evaluator. Other plugins register audits the same way from their own editor bundle.
3. User clicks the toolbar toggle → floating audit panel opens with an empty state and a footer containing a primary "Run page audit" button.
4. User clicks "Run page audit" → runner builds an `AuditContext` once (live elements snapshot + one REST call for WP-side data + kit snapshot), invokes each registered evaluator, collects violations, computes scores, stores the `PageAuditReport`.
5. User clicks a violation → deep-link handler either selects the element via `$e.run('document/elements/select', …)` (optionally also opening that element's settings panel), or opens a document-level affordance (page settings, site settings).

## 4. PHP module — `modules/audits/`

Skeleton mirrors `modules/checklist/`:

```
modules/audits/
├── module.php                          # Core\Base\Module subclass; registers filter, enqueues bundle, prints inline config
├── audits-manager.php                  # collects descriptors, applies the elementor/audits/audits filter
├── audit-descriptor.php                # value object: id, title, description, categories, severity, weight
├── data/
│   ├── controller.php                  # registers the data endpoint via Plugin::$instance->data_manager_v2
│   └── endpoints/
│       └── page-context.php            # GET → WP-side data for the active document
└── audits/                             # PHP descriptor declarations only — no execution logic
    ├── missing-page-title.php
    ├── missing-excerpt.php
    ├── missing-featured-image.php
    ├── uses-sections-or-columns.php
    ├── default-design-system.php
    ├── heading-structure.php
    ├── images-missing-alt.php
    ├── images-too-large.php
    ├── prefer-global-colors.php
    ├── image-carousel-default-name.php
    ├── nested-boxed-containers.php
    └── icon-widget-link-missing-aria-label.php
```

Descriptor contract (PHP-side):

- `get_id(): string` — unique, doubles as JS evaluator lookup key (e.g. `'audits/heading-structure'`).
- `get_title(): string` — translatable, `esc_html__`.
- `get_description(): string` — translatable.
- `get_fix_hint(): string` — translatable.
- `get_categories(): string[]` — subset of `health | seo | accessibility | performance | best-practices`.
- `get_severity(): string` — one of `error | warning | info`.
- `get_weight(): int` — score impact.
- `is_visible(): bool` — defaults `true`; lets a registering plugin conditionally hide its audit (e.g. based on installed components or settings).

REST endpoint `data/audits/page-context`:

- `GET ?document_id=<id>&attachment_ids[]=<id>&attachment_ids[]=<id>…`
- Capability: `current_user_can('edit_post', $document_id)`. Reject with 403 otherwise.
- Returns:
  ```json
  {
    "post_title": "string|null",
    "post_excerpt": "string|null",
    "featured_image_id": "int|null",
    "image_sizes": {
      "<attachment_id>": { "width": 0, "height": 0, "filesize_bytes": 0, "mime": "image/jpeg", "src": "..." }
    },
    "kit_id": "int",
    "kit_is_default_unchanged": true
  }
  ```
- `attachment_ids` is supplied by the JS runner — derived from the elements snapshot — so the server never scans the full media library.
- One endpoint per "Run page audit" click. No per-audit calls.

Inline config printed by the module on `elementor/editor/before_enqueue_scripts`:

```js
window.elementorAudits = {
  audits: [/* descriptors from filter */],
  restNamespace: 'elementor/v1',
  nonce: '<wp_rest nonce>'
};
```

## 5. Audits framework — `@elementor/editor-audits`

### Public types

```ts
type AuditCategory = 'health' | 'seo' | 'accessibility' | 'performance' | 'best-practices';
type AuditSeverity = 'error' | 'warning' | 'info';

type AuditDescriptor = {
    id: string;
    title: string;
    description: string;
    fixHint: string;
    categories: AuditCategory[];
    severity: AuditSeverity;
    weight: number;
};

type AuditContext = {
    documentId: number;
    elements: ElementsModelSnapshot;   // flat list + tree, frozen
    pageContext: PageContextResponse;  // result of the REST page-context call
    kit: KitSnapshot;                  // active kit + globals (colors, fonts, breakpoints)
};

type AuditViolation = {
    auditId: string;
    elementId?: string;                                                   // click → select this element
    targetHint?: 'site-settings' | 'page-settings' | 'element-settings';  // click → open this affordance
                                                                          // 'element-settings' requires elementId
    label: string;
    detail?: string;
};

type AuditResult =
    | { status: 'pass' }
    | { status: 'fail'; violations: AuditViolation[] }
    | { status: 'skipped'; reason: string };

type AuditEvaluator = (ctx: AuditContext) => AuditResult | Promise<AuditResult>;

type PageAuditReport = {
    documentId: number;
    runAt: number;
    overall: number;
    categories: Record<AuditCategory, { score: number; failed: number; total: number }>;
    auditResults: Array<{ descriptor: AuditDescriptor; result: AuditResult }>;
};
```

### Public API

- `registerAudit(descriptor, evaluator): void`
- `runPageAudit(documentId): Promise<PageAuditReport>`
- `useAuditReport(): { status: 'idle' | 'loading' | 'error' | 'ready'; report?: PageAuditReport; error?: Error }`
- `Audit` abstract class for those who prefer a class shape; constructor calls `registerAudit`.

### Runner algorithm

1. Read descriptors from `window.elementorAudits.audits` (already pre-registered).
2. Build `AuditContext` once:
   - Snapshot the current document elements from `@elementor/editor-elements`.
   - Fetch `data/audits/page-context` via `@elementor/http-client`, passing the unique attachment IDs found in the snapshot.
   - Snapshot kit globals.
3. For each registered audit:
   - If no evaluator is registered for the descriptor's ID → `result = { status: 'skipped', reason: 'evaluator-not-registered' }`.
   - Otherwise `await evaluator(ctx)` inside try/catch — any throw → `skipped` with the error message. The run never crashes.
4. Score engine:
   - `categoryScore(cat) = round(sum(weight where audit in cat and passed) / sum(weight where audit in cat) * 100)`.
   - `overallScore = round(mean(categoryScore for cats with total > 0))`.
   - Skipped audits are excluded from both totals.
5. Store the report; consumers re-render.

### Deep-link handler

`useViolationFocus()` exposes `focus(violation)`:

- If `violation.elementId` is set:
  - Select the element: `runCommand('document/elements/select', { container: elementor.getContainer(violation.elementId) })` and scroll the canvas to it.
  - If `targetHint === 'element-settings'`, also open that element's editor panel (so the user can immediately fix the offending control).
- Else if `targetHint === 'page-settings'` → open document settings.
- Else if `targetHint === 'site-settings'` → open site settings.
- `targetHint === 'element-settings'` without an `elementId` is a no-op; the runner logs a warning when an evaluator emits such a violation.

## 6. Floating panel framework — `@elementor/editor-floating-panels`

> **Update (2026-05-31): docking removed.** Panels are now float-only and drag-anywhere, clamped within the viewport. `DockMode`, `initialMode`, `setMode`, the docked CSS branch, and the snap-to-dock heuristic no longer exist. See `docs/superpowers/specs/2026-05-31-floating-panels-remove-docking-design.md`. The docking-specific text below is retained for historical context only.

### Public types

```ts
type FloatingPanelDefaults = {
    width: number;
    height: number;
    minWidth: number;
    minHeight: number;
    initialPosition?: {                          // logical, not physical
        insetBlockStart: number;
        insetInlineStart: number;
    };
};

type FloatingPanelDeclaration = {
    id: string;
    title: string;
    icon: ComponentType;
    component: ComponentType;
    defaults: FloatingPanelDefaults;
};
```

### Public API

- `createFloatingPanel(declaration): { panel, useFloatingPanelStatus, useFloatingPanelActions }`
- `registerFloatingPanel({ id, ... }): void`
- Component primitives: `FloatingPanel`, `FloatingPanelHeader` (with built-in drag handle and close button), `FloatingPanelBody`, `FloatingPanelFooter`.

### Internals

- **Store slice** `floatingPanels` keyed by panel ID. Each entry: `{ isOpen, position, size, zIndex }`. Multiple panels can be open simultaneously (unlike `editor-panels`).
- **Persistence**: state is mirrored to storage (`elementor_floating_panels_state`) so position survives reloads.
- **Host component**: injected once into the editor viewport via the floating-panels location. Renders all open panels into a fixed-position layer above the canvas and below modals.
- **Floating positioning only**: `position: fixed; inset-inline-start: var(--pos-inline); inset-block-start: var(--pos-block); inline-size / block-size from store`.
- **Drag math**: pointer events are physical. Single conversion at the boundary: `inlineDelta = isRtl ? -clientDeltaX : clientDeltaX`. Internals only ever see logical values. Drag is clamped per axis: block-start to `[48px, viewportBlock − panelBlock]` (never covers the app bar) and inline-start to `[#elementor-panel width, viewportInline − panelInline]` (never covers the side panel). The single width-based inline minimum is direction-correct because `#elementor-panel` and `insetInlineStart` share the same logical start edge in LTR and RTL.
- **Z-stacking & focus**: clicking a panel brings it to the top of the stack. ESC closes the top-most open panel.
- **Accessibility**: each panel is `role="dialog"` with `aria-label` from `title`; **no** focus trap (the user must keep editing elements behind the panel).

### Risks called out

- Persistence is last-write-wins across tabs.

## 7. Built-in audits (12)

Each is an `Audit` subclass in `packages/packages/core/editor-audits/src/audits/`. Categories/severity/weight are first-pass defaults; tune in implementation as needed.

| ID / File | Categories | Severity | Source of truth | Element link |
|---|---|---|---|---|
| `audits/missing-page-title` — `missing-page-title.ts` | seo, a11y | error | `ctx.pageContext.post_title` | `targetHint: 'page-settings'` |
| `audits/missing-excerpt` — `missing-excerpt.ts` | seo, a11y | warning | `ctx.pageContext.post_excerpt` | `targetHint: 'page-settings'` |
| `audits/missing-featured-image` — `missing-featured-image.ts` | seo | warning | `ctx.pageContext.featured_image_id` | `targetHint: 'page-settings'` |
| `audits/uses-sections-or-columns` — `uses-sections-or-columns.ts` | health, performance | warning | `walkElements`, type ∈ {section, column} | `elementId` per offender (no `targetHint` — fix is structural) |
| `audits/default-design-system` — `default-design-system.ts` | health, best-practices | info | `ctx.pageContext.kit_is_default_unchanged` | `targetHint: 'site-settings'` |
| `audits/heading-structure` — `heading-structure.ts` | seo, a11y | error | walk headings widgets + level setting | `elementId` + `targetHint: 'element-settings'` per offender; document-level when none |
| `audits/images-missing-alt` — `images-missing-alt.ts` | seo, a11y | error | walk image widgets without alt | `elementId` + `targetHint: 'element-settings'` per offender |
| `audits/images-too-large` — `images-too-large.ts` | performance | warning | look up `ctx.pageContext.image_sizes[id].filesize_bytes`, threshold 500 KB | `elementId` + `targetHint: 'element-settings'` per offender |
| `audits/prefer-global-colors` — `prefer-global-colors.ts` | health, best-practices | info | walk color settings holding raw hex when kit globals exist | `elementId` + `targetHint: 'element-settings'` per offender |
| `audits/image-carousel-default-name` — `image-carousel-default-name.ts` | a11y, seo | warning | walk image-carousel widgets whose accessible name equals the default placeholder | `elementId` + `targetHint: 'element-settings'` per offender |
| `audits/nested-boxed-containers` — `nested-boxed-containers.ts` | performance, health | warning | walk containers; flag any boxed container whose nearest container ancestor is also boxed | `elementId` + `targetHint: 'element-settings'` of inner container |
| `audits/icon-widget-link-missing-aria-label` — `icon-widget-link-missing-aria-label.ts` | a11y | warning | walk icon widgets with non-empty `link.url` and no `aria-label` / `aria-labelledby` in custom attributes | `elementId` + `targetHint: 'element-settings'` per offender |

Shared helper: `walkElements(snapshot, predicate)` in `editor-audits/src/lib/walk.ts`.

Pattern for widget-specific accessible-name audits: one file per widget. v1 ships only `image-carousel-default-name`. Future widget-specific name/aria audits follow the same shape.

## 8. Panel UI

### Toggle button

- Injected by `editor-audits` into the `editor-app-bar` `utilities-menu-location`.
- Icon `ToggleAction`, title "Audit page".
- Click → `useFloatingPanelActions('audit-panel').toggle()`. Active styling when the panel is open.

### Panel anatomy

```
┌─────────────────────────────────────────────┐
│ [icon] Audit                  [dock] [×]    │  ← FloatingPanelHeader (drag handle on title area)
├─────────────────────────────────────────────┤
│ ⓘ Score  Health  SEO  A11y  Performance     │  ← Tabs row
├─────────────────────────────────────────────┤
│            <tab content>                    │  ← FloatingPanelBody (scrollable)
├─────────────────────────────────────────────┤
│ Last scan: 12:43       [↻ Re-scan]          │  ← FloatingPanelFooter — see states below
└─────────────────────────────────────────────┘
```

### States

- **Empty (no scan yet)**: body shows a centered illustration and short copy. Footer is visible with the primary button labeled **"Run page audit"**. No timestamp.
- **Loading**: footer button becomes a disabled progress button labeled "Auditing page…". Body unchanged. Tabs disabled.
- **Error**: body shows a brief error message and a "Try again" affordance. The last successful report is preserved (we do not overwrite it on failure).
- **Results**: footer shows **"Last scan: <time>"** and a **"Re-scan"** button. Tabs become interactive.

### Score tab

- Top: circular gauge for the overall score (0–100), colored by threshold (≥90 green, 50–89 amber, <50 red). Colors taken from existing v2 UI palette tokens, not hardcoded.
- Below: four smaller gauges, one per category (Health, SEO, Accessibility, Performance), each labeled with score and failed/total count. Tapping a small gauge switches to that tab.

### Category tabs

- Inline summary at top ("3 issues found in Accessibility").
- Violations grouped by audit, sorted by severity (error → warning → info).
- Each row: severity icon, audit title, count badge if multiple violations. Click → expands `description`, `fixHint`, and the list of specific violation items.
- Each violation item is itself clickable → invokes `useViolationFocus().focus(violation)`.
- Passing audits are collapsed under an expandable "X audits passed" footer of the list, dimmed.
- Skipped audits (no evaluator registered, or evaluator threw) render as a dimmed row with the reason exposed on hover. They do not affect the score (excluded from totals).
- Categories with zero registered audits are hidden — the tab does not render at all.

### Best Practices

- No separate tab in v1. Best-practices audits surface in their primary category tab (Health).
- The `best-practices` category still contributes to scoring as a secondary category.

### i18n & a11y

- Every string in the package goes through `@wordpress/i18n` `__()` with text domain `'elementor'`.
- Tabs are real `role="tablist"` with arrow-key navigation.
- Violation list is `role="list"`; each violation row is a tabbable button.
- Score gauges include `aria-label` text equivalents (e.g. "Overall score 76 of 100").

## 9. File layout

```
modules/audits/
├── module.php
├── audits-manager.php
├── audit-descriptor.php
├── data/
│   ├── controller.php
│   └── endpoints/
│       └── page-context.php
└── audits/
    ├── missing-page-title.php
    ├── missing-excerpt.php
    ├── missing-featured-image.php
    ├── uses-sections-or-columns.php
    ├── default-design-system.php
    ├── heading-structure.php
    ├── images-missing-alt.php
    ├── images-too-large.php
    ├── prefer-global-colors.php
    ├── image-carousel-default-name.php
    ├── nested-boxed-containers.php
    └── icon-widget-link-missing-aria-label.php

packages/packages/core/editor-floating-panels/
├── package.json
├── src/
│   ├── index.ts
│   ├── init.ts
│   ├── api.ts
│   ├── location.ts
│   ├── sync.ts
│   ├── store/{index.ts, slice.ts, selectors.ts}
│   ├── hooks/{use-floating-panel-status.ts, use-floating-panel-actions.ts, use-floating-panel-drag.ts}
│   ├── components/internal/{host.tsx, panel-window.tsx, drag-handle.tsx}
│   ├── components/external/{index.ts, floating-panel.tsx, floating-panel-header.tsx, floating-panel-body.tsx, floating-panel-footer.tsx}
│   └── __tests__/…

packages/packages/core/editor-audits/
├── package.json
├── src/
│   ├── index.ts
│   ├── init.ts
│   ├── api.ts
│   ├── audit.ts
│   ├── registry.ts
│   ├── runner.ts
│   ├── score/score.ts
│   ├── lib/walk.ts
│   ├── audits/<one file per built-in evaluator, matching the PHP IDs>
│   ├── components/audit-panel.tsx
│   ├── components/audit-toolbar-toggle.tsx
│   ├── components/tabs/{score-tab.tsx, category-tab.tsx, score-gauge.tsx, violation-row.tsx}
│   ├── components/states/{empty-state.tsx, loading-state.tsx, error-state.tsx}
│   └── hooks/{use-audit-report.ts, use-violation-focus.ts}
└── README.md
```

Dependency direction (no cycles):

`modules/audits` (PHP) → enqueues → `@elementor/editor-audits` → depends on → `@elementor/editor-floating-panels`, `@elementor/editor-elements`, `@elementor/editor-app-bar`, `@elementor/http-client`, `@elementor/store`, `@elementor/ui`.

No file should exceed the 300-line guidance from repo rules.

## 10. Testing

- **Jest — JS audits.** One spec per audit in `editor-audits/src/audits/__tests__/*.test.ts`. Hand-rolled `AuditContext` fixtures (small element trees, fake page-context, fake kit). Assertions on `result.status` and `violations`. AAA pattern with comments.
- **Jest — score engine.** Per-category weighted aggregation, overall = mean of populated categories, skipped audits excluded, empty category hidden.
- **Jest — walk helper.** Focused tests for `walkElements`.
- **Jest — floating panel framework.** Store reducers, drag math (`isRtl ? -dx : dx`), snap-to-dock heuristic, persistence hook. Pure functions only.
- **Jest + React Testing Library — panel shell.** Each state (empty / loading / error / results) asserts the visible affordances: empty shows "Run page audit", results show "Last scan: <time>" + "Re-scan", audits with no registered evaluator render as dimmed/skipped rows and don't affect scores.
- **PHPUnit — PHP module.** `tests/phpunit/elementor/modules/audits/`:
  - `test-module.php`: filter applied, descriptor list round-trips through JSON, bundle enqueued only on the editor screen.
  - `test-page-context-endpoint.php`: capability check, payload shape with/without featured image and excerpt, image-size lookup limited to passed attachment IDs.
- **Playwright — one happy-path E2E** (per repo "critical paths only" rule). Open editor on a seeded page (no title, image with no alt, a section, two nested boxed containers); click toggle → panel opens with empty state; click "Run page audit" → results appear; open Accessibility tab → "Images missing ALT" shows one violation; click the violation → asserted that the offending image becomes the selected element.

Not tested in v1: drag/resize gestures (manual QA), exact score numbers (we test the formula, not magic numbers).

## 11. Open implementation questions (resolve during planning)

- Exact attachment ID extraction logic from the elements snapshot (which widget settings hold attachment IDs vs URLs only).
- Detection heuristic for `kit_is_default_unchanged` — needs to be defined against the actual kit data shape; first-pass: compare current kit globals to the bundled default kit JSON.
- How to identify the "default placeholder" name for image-carousel and similar widgets — likely the widget's default control value, exposed via the widget's TS schema.
- Right-dock canvas margin interaction with the V1 left panel — verify there is no overlap or layout fight under both LTR and RTL.
- Reduced-motion handling for the score gauges.

## 12. Acceptance criteria

- New `modules/audits` PHP module loads in the editor; filter is callable from other PHP modules.
- `data/audits/page-context` returns the documented payload with a proper capability check.
- `@elementor/editor-floating-panels` is published as a workspace package with the documented API and uses CSS logical properties exclusively for direction-sensitive layout.
- `@elementor/editor-audits` is published as a workspace package; `registerAudit` and `runPageAudit` are stable public APIs.
- Top-bar toggle button appears in the editor; click toggles the audit panel.
- Empty state shows footer with "Run page audit" and no timestamp.
- "Run page audit" produces a `PageAuditReport`; the 12 built-in audits each contribute correctly to the report against seeded fixtures.
- Clicking a violation with an `elementId` selects the corresponding element on the canvas.
- Panel can be dragged, resized, and docked to the inline-end edge; behaves correctly under both LTR and RTL.
- Position and dock mode persist across editor reloads.
- All Jest, PHPUnit, and the new Playwright E2E pass.
