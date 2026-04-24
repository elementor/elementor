# Port Composition Abilities — PRD + Implementation Plan

Status: phases 0–5 complete; awaiting real-post end-to-end save verification
Owner: heinvanvlastuin@gmail.com
Created: 2026-04-24
Last updated: 2026-04-24

---

## 1. Problem

The Elementor plugin ships 37 WordPress-native abilities under `core/abilities/` and module subdirs. A parallel nestjs MCP (source-of-truth: `/Users/heinvv/Local Sites/elementor-prod/app/public/wp-content/repos/elementor-nest-mcp/src/`) has four capabilities that abilities lack and that are the actual authoring ergonomics win:

1. **make-page** — friendly spec (`{widget, children, text, css}`) → full v4 tree → save in one call.
2. **make-section** — same engine, entry-point shaped for `hero` / `two-column` / `card-grid` / `centered` patterns.
3. **make-style** — CSS string → one style-entry record.
4. **css-to-props** — CSS shorthand (`padding:12px 16px; border-radius:8px; box-shadow:0 4px 12px rgba(0,0,0,.1)`) → Elementor v4 `$$type` props.

Today, any caller who only has the ability surface (Cursor, Claude Code with abilities-only wiring, future IDEs) has to hand-roll `$$type` JSON per prop. The nestjs MCP avoids that, but it is a shadow implementation that drifts — `border-radius` corner shape, `box-shadow` handler, preview CSS, cache validity were all patched there only. Moving the capability into abilities gives one authoritative, hook-safe path every client inherits.

## 2. Goals / Non-goals

**Goals**

- Close the four authoring-ergonomics gaps in the ability surface.
- Route all writes through `$document->save()` so Elementor's CSS regen + cache lifecycle hooks fire (no direct MySQL, no bypass file writes).
- Share one CSS parser so `css-to-props`, `make-style`, `make-page`, and `make-section` all produce identical `$$type` output.
- Preserve nestjs behavior for the proven shapes (`border-radius` corner keys, `box-shadow` paren-aware split, `color` var refs, physical→logical rewrites).

**Non-goals**

- Session API (`begin-edit` / `stage-*` / `commit`) — stateful, doesn't fit the stateless per-call ability model. Stays in nestjs only.
- `wp_get_option` / `wp_update_option` / generic post queries — abilities route writes through lifecycle hooks intentionally.
- Dual-channel CSS mirroring / cache-validity bump — `$document->save()` triggers Elementor's own CSS regen via hooks.

## 3. Users

- Agents using abilities via `wp-json/abilities/v1/abilities/.../execute`.
- The Elementor editor when it exposes abilities (via `elementor/editor-mcp`).
- Future IDE integrations that cannot rely on the nestjs MCP being available.

## 4. Scope — what gets added

| Path | Action | Purpose |
|---|---|---|
| `core/abilities/css-shorthand-parser.php` | create | Trait. Ports the nestjs `cssToProps` logic. Shared by all four abilities. |
| `core/abilities/css-to-props-ability.php` | create | Ability 1 — thin wrapper over the trait. |
| `core/abilities/make-style-ability.php` | create | Ability 2 — `{css, label, breakpoint, state}` → one style-entry record. |
| `core/abilities/make-page-ability.php` | create | Ability 3 — friendly spec → built tree → delegates save to `Build_Page_Ability`. |
| `core/abilities/make-section-ability.php` | create | Ability 4 — pattern-shaped input (hero / two-column / card-grid / centered) → built section node (does not save). |
| `core/abilities/abilities-bootstrap.php` | modify | Register the four new abilities. |

All four live in the existing `elementor` ability category.

## 5. Contracts

### 5.1 `elementor/css-to-props`

**Input**

```json
{ "css": "padding:12px 16px; border-radius:8px; background:#ffffff" }
```

**Output**

```json
{
  "props": { "padding": { "$$type": "dimensions", "value": { ... } }, "...": "..." },
  "warnings": [ "string-fallback applied to ...", "..." ]
}
```

Warnings capture: values that fell through to string fallback, unknown prop names, unresolved `var()` references.

### 5.2 `elementor/make-style`

**Input**

```json
{
  "id": "abc1234",         // optional, 7-hex — auto-generated when omitted
  "label": "local",        // optional, default "local"
  "css": "padding:12px; border-radius:8px",
  "breakpoint": "desktop", // optional, default "desktop"
  "state": null            // optional, default null
}
```

**Output** — a full style-entry record, shape-identical to what `Make_Layout_Ability::make_style()` produces:

```json
{
  "style_id": "abc1234",
  "entry": {
    "id": "abc1234",
    "type": "class",
    "label": "local",
    "variants": [
      { "meta": { "breakpoint": "desktop", "state": null }, "props": { ... } }
    ]
  }
}
```

### 5.3 `elementor/make-page`

**Input**

```json
{
  "post_id": 843,
  "sections": [ { "widget": "container", "css": "padding:64px", "children": [ ... ] } ],
  "dry_run": false
}
```

Spec shape (recursive, friendly):

- **Leaf**: `{ widget: "heading"|"paragraph"|"button"|"image", text?, tag?, url?, attachment_id?, css?, classes? }`
- **Container**: `{ children: [...], css?, id? }` or explicit `{ widget: "container"|"flexbox"|"div"|"div-block"|"section", children: [...] }`

**Output**

```json
{
  "success": true,
  "post_id": 843,
  "elements": [ /* built tree; present when dry_run=true */ ],
  "errors": [ /* present when dry_run=true */ ]
}
```

Implementation: build the tree, then delegate to `Build_Page_Ability::execute(['post_id'=>$post_id, 'elements'=>$built, 'dry_run'=>$dry_run])` — keeps one source of truth for the save contract. See §9 for why this is safe.

### 5.4 `elementor/make-section`

Same engine as make-page, pattern-shaped input.

**Input** (merged shape across layouts):

```json
{
  "layout": "hero" | "two-column" | "card-grid" | "centered",
  "id": "abc1234", "classes": [...], "style": "padding:64px",
  "heading": "...", "heading_tag": "h1", "subtext": "...", "eyebrow": "...", "cta_text": "...",
  "columns": [ { "id?", "classes?", "style?", "weight?", "widgets": [...] } ],   // two-column
  "cards":   [ { "id?", "classes?", "style?", "image_id?", "image_alt?", "heading?", "body?" } ], // card-grid
  "widgets": [ { "id", "type": "e-heading"|..., "classes?", "style?", "content?" } ] // centered
}
```

**Output**

A single built section element (shape matches what `make-widget` / `make-layout` return). Does **not** save — caller passes it to `set-post-content`, `append-elements`, or `build-page`. Mirrors the existing `make-widget` / `make-layout` contract.

## 6. Parser responsibilities (the core risk)

**Note on ground truth:** After reading both the nestjs MCP source and the `elementor-html-css-converter` plugin's per-property converters, the latter is authoritative for output shapes — it emits the exact `Prop_Type::generate()` shapes that atomic-widgets' Style_Schema validates. nestjs diverges from the v4 schema in several places (no physical→logical rewrite, no flex shorthand, wrong unit for `auto`/`calc`, side-specific props kept with physical keys). The PHP trait mirrors `plugins/elementor-html-css-converter/includes/converters/css/properties/*` but reimplements inline (self-contained — no runtime dep on the converter plugin).

- `parse_declarations(string $css): array<string, array>` — splits on `;`, trims, returns `[cssProp => $$typeValue]`.
- Handlers by category:
  - **Color props** (`color`, `background-color`, `border-color`, `outline-color`, `fill`, `stroke`, …) → `{$$type:"color", value:"#..."}`. `transparent` → `rgba(0,0,0,0)`. `var(--x)` → `{$$type:"global-color-variable", value:"x"}` (label form, resolved at save time).
  - **Margin / padding**: shorthand (`margin`, `margin-block`, `margin-inline`) and all side-specific variants (`margin-top`, `margin-block-start`, `margin-inline-end`, …) collapse to the **single `margin`/`padding`** output key with a `{$$type:"dimensions", value:{…}}` value. Shorthand emits all four logical sides; side-specific emits a **partial** dimensions object (only the specified side). Multiple side-specific declarations merge into one `dimensions` object.
  - **Border-radius**: shorthand + all per-corner variants (physical + logical) collapse to `border-radius` with `{$$type:"border-radius", value:{start-start, start-end, end-end, end-start}}`. Shorthand fills all four; per-corner fills the matching corner, others `null`.
  - **Border-width**: shorthand + per-side collapse to `border-width` with `{$$type:"dimensions", value:{…}}`. Partial on per-side.
  - **Positioning** (`top`, `right`, `bottom`, `left` → `inset-block-start`, `inset-inline-end`, `inset-block-end`, `inset-inline-start`): single size, output key **renamed to logical**. Logical `inset-*` names pass through unchanged.
  - **Flex shorthand** (`flex:1 0 auto`, `flex:none`, `flex:auto`, `flex:initial`, `flex:1`, `flex:2 1`, `flex:1 200px`) → fully parsed into `{$$type:"flex", value:{flexGrow:{number}, flexShrink:{number}, flexBasis:{size}}}`. Keywords (`none`/`auto`/`initial`) map to their CSS-spec defaults.
  - **`auto` and CSS functions**: any `auto` keyword or `calc(…)`/`min(…)`/`max(…)`/`clamp(…)` in a size context emits `{$$type:"size", value:{size:"<keyword-or-expr>", unit:"custom"}}`.
  - **Variable refs in size contexts**: `var(--space-4)` on any size prop → `{$$type:"global-size-variable", value:"space-4"}` (label form). In a dimensions context, the same var-ref is wrapped once and repeated across all four sides.
  - **box-shadow** → `{$$type:"box-shadow", value:[{$$type:"shadow", value:{hOffset, vOffset, blur, spread, color, position?}}, …]}`. Paren-aware comma + space splitting. `inset` sets `position:"inset"`. Default shadow color when none supplied: `rgba(0,0,0,0.5)`.
  - **Number props** (`z-index`, `flex-grow`, `flex-shrink`, `order`, `column-count`, `animation-iteration-count`, `zoom`, `tab-size`) → `{$$type:"number", value:N}`.
  - **Single-size props** (`font-size`, `width`/`height` + min/max, `gap`, `row-gap`, `column-gap`, `letter-spacing`, `word-spacing`, `text-indent`, `flex-basis`, `outline-width`, `outline-offset`, `border-spacing`, `column-width`, `perspective`, `stroke-width`) → `{$$type:"size", value:{size:N, unit:"px"}}`.
  - **line-height**: unitless → number, with unit → size, else string.
  - **opacity**: size with unit `%`. `0.5` → `{size:50, unit:"%"}`; `"50%"` → `{size:50, unit:"%"}`.
  - **background** shorthand: when the value is a color, wraps as `{$$type:"background", value:{color:{…}}}`. Otherwise string.
  - **background-size** → size or string.
  - **String fallback** for unknown / complex values (`display`, `position`, `transform`, `font-weight`, `font-family`, `border-style`, justify/align-\*, cursor, flex-direction, flex-wrap, …). Downstream schemas may enum-validate these strings; we don't enum-check at parse time.

**Label resolution for var() refs**: the trait emits labels, not UUIDs. Resolution happens in the ability layer — `Make_Page_Ability` / `Make_Style_Ability` must run the same label→id pass that `Build_Page_Ability::resolve_variable_labels_in_classes()` does for class variant props, but extended to element styles.

Prop-name semantics (aligned with the v4 style-schema + converter plugin):

- **Dimension shorthands** (`margin`, `padding`, `border-radius`, `border-width`) → `$$type:"dimensions"` (or `"border-radius"` for the corner shape) with all four logical keys filled (`block-start`/`inline-end`/`block-end`/`inline-start`; border-radius uses `start-start`/`start-end`/`end-end`/`end-start`).
- **Axis shorthands** (`margin-block`, `margin-inline`, `padding-block`, `padding-inline`) → partial dimensions with only the two axis sides.
- **Side-specific margin/padding/border-width** (`margin-top`, `padding-left`, `margin-block-start`, `border-top-width`, …) → the output key collapses to the shorthand (`margin` / `padding` / `border-width`), value is a **partial dimensions** with just the specified logical side. Multiple side-specific decls in the same CSS string merge into one dimensions object.
- **Per-corner border-radius** (`border-top-left-radius`, `border-start-start-radius`, …) → output key collapses to `border-radius`, value has all four corners filled with the specified corner's size and `null` for the others.
- **Positioning** (`top`/`right`/`bottom`/`left`) → renamed to `inset-block-start`/`inline-end`/`block-end`/`inline-start`, single size each. Logical `inset-*` inputs pass through unchanged.
- `overflow-x` / `overflow-y`, `font-weight`, `font-family`, `border-style`, justify/align-\*, cursor, etc. → string fallback (schemas enum-validate these downstream).

Trait methods are also callable piecewise from abilities that only want one piece (e.g. a future stage-style equivalent).

## 7. Risks

1. **Parser divergence.** The most likely regression is producing a `$$type` shape that Style_Parser accepts but renders differently from the nestjs output. Mitigation: parity tests against real nestjs payloads (§10 phase 1).
2. **Source of truth lives in a sibling install.** `wp-content/repos/elementor-nest-mcp/` in the current tree only has `docs/`. The authoritative source is at `/Users/heinvv/Local Sites/elementor-prod/app/public/wp-content/repos/elementor-nest-mcp/src/` — pinned in §1 and §6. Port must be read-only against that tree.
3. **`generate_id()` — resolved, 7-hex via `Utils::generate_id()`.** Authoritative source is `plugins/elementor/modules/atomic-widgets/utils/utils.php:20-32`. Matches nestjs `validation.ts:47`. The 8-hex local helpers in `Make_Widget_Ability` / `Make_Layout_Ability` are divergent — out of scope for this port. New abilities call `\Elementor\Modules\AtomicWidgets\Utils\Utils::generate_id()` directly.
4. **Coupling make-page → Build_Page_Ability.** Direct PHP call couples two abilities. If Build_Page_Ability's signature changes, make-page breaks silently. Mitigation: optionally extract the normalize/validate/save core into a sibling trait method. Decided in phase 4.
5. **Did-you-mean helper.** Plan calls for Levenshtein-based suggestions ported from `src/validation.ts`. PHP has `levenshtein()` built-in; the risk is suggestion quality, not implementation.

## 8. Verification

Carried forward from the plan — applies on completion of phases 5/6:

1. Parser unit parity with nestjs — assert identical `$$type` output for saved payloads (border-radius corner keys; box-shadow on main card; border shorthand string; `border-radius:1000px` chips).
2. Dry-run on a real post via REST — `POST /wp-json/abilities/v1/abilities/elementor/make-page/execute` with `dry_run:true`; compare returned `elements` to nestjs output for the same spec.
3. End-to-end save — `make-page` on post 843 with a known border-radius change (input 100px → 20px). Verify `wp_postmeta._elementor_data` + rendered CSS.
4. Physical→logical — `css-to-props` with `{css:"margin-right:10px; padding-top:4px; top:0"}` emits only logical keys.
5. Container synonyms — `{widget:"div-block"}` → `elType:"e-div-block"`, `{widget:"flexbox"|"container"}` → `e-flexbox`. Confirm via `elementor/get-post-content` after save.
6. Error messages — `{widget:"text-editor"}` returns `… Did you mean 'paragraph'?`; `{widget_type:"..."}` returns `… use 'widget', not 'widget_type'`.

## 9. Why `make-page` calls `Build_Page_Ability` directly

Ability classes are plain PHP — `wp_register_ability` wires them for the REST surface but does not prevent in-PHP instantiation. `Build_Page_Ability::execute()` is a normal public method. Calling it from `Make_Page_Ability::execute()` avoids a REST round-trip and guarantees identical save semantics.

Trade-off: make-page is coupled to Build_Page_Ability's input shape. Refactors there silently break make-page. Deferred alternative: extract the pipeline (resolve labels → normalize → auto-mirror → collect errors → save) into a trait method on `Element_Tree_Helpers` and have both call it. Revisit in phase 4 if the coupling feels fragile.

## 10. Implementation plan — phased

Each phase is an independent PR-sized unit. Do not start phase N until phase N−1 acceptance passes.

**Current status** (2026-04-24):

| Phase | Status | Notes |
|---|---|---|
| 0 — source-of-truth + decisions | ✅ done | `phase-0-notes.md` |
| 0.5 — 8-hex cleanup in Make_Widget/Make_Layout | ✅ done | both now call `Utils::generate_id()` |
| 1 — `Css_Shorthand_Parser` trait | ✅ done | rewritten to match v4 schema shapes (not nestjs); 31 smoke cases + 34 PHPUnit assertions |
| 2 — `css-to-props` ability | ✅ done | registered in bootstrap; smoke-tested |
| 3 — `make-style` ability | ✅ done | registered; 12-case smoke test passes |
| 4 — `make-page` ability | ✅ done | registered; 22-case smoke test passes for spec validation + tree building. Save path delegates to `Build_Page_Ability`. End-to-end save against a real post still pending (needs WP bootstrap). |
| 5 — `make-section` ability | ✅ done | registered; 31-case smoke test covers all 4 layouts (hero, two-column with explicit + fallback, card-grid, centered). |
| 6 — end-to-end on a real post | ⏳ pending | REST call against `POST /wp-json/abilities/v1/abilities/elementor/make-page/execute` with real post ID. Verification list in §8. |

### Phase 0 — source-of-truth for the parser *(before any code)*

- Confirm location of the authoritative nestjs parser source (`mcp.server.ts`, `validation.ts`). The repo at `wp-content/repos/elementor-nest-mcp/` currently only has docs.
- Collect 3–5 saved payloads from recent `make-page` runs for parity checks (at minimum: border-radius corner keys, box-shadow, border shorthand, `var(--x)` color ref, `padding:12px 16px`).
- Decision log: 7-hex vs 8-hex IDs; pick and apply consistently.

**Acceptance:** a small `phase-0-notes.md` (adjacent to this file) listing source paths, payload fixtures, and the ID-length decision.

### Phase 1 — `Css_Shorthand_Parser` trait

- New file `core/abilities/css-shorthand-parser.php`, pattern-matches `element-tree-helpers.php`.
- Implement every handler from §6.
- Implement physical→logical rewrite at entry.
- Parity test harness: `tests/phpunit/abilities/css-shorthand-parser-test.php` — feeds each fixture payload's CSS through the trait, asserts identical `$$type` JSON vs the nestjs output fixture.

**Acceptance:** all fixture parity tests pass. No PHP warnings. No network calls.

### Phase 2 — `elementor/css-to-props` ability

- `core/abilities/css-to-props-ability.php` extends `Abstract_Ability`, uses the trait.
- Thin wrapper: `execute()` returns `{ props, warnings }`.
- Register in bootstrap (alone; other three follow later phases).
- REST smoke: `POST /wp-json/abilities/v1/abilities/elementor/css-to-props/execute` with a representative CSS string; verify shape.

**Acceptance:** ability appears in `elementor/context`'s ability list; REST call returns props+warnings; warnings populate on unknown prop.

### Phase 3 — `elementor/make-style` ability

- `core/abilities/make-style-ability.php` extends `Abstract_Ability`, uses the trait.
- Build the style-entry via the same helper shape as `Make_Layout_Ability::make_style()` (lines 217–229) — but source props from the parser.
- Respect `breakpoint` + `state` inputs; default `desktop` / `null`.

**Acceptance:** output shape matches `Make_Layout_Ability::make_style()` for equivalent inputs. REST smoke passes. Can be used as a drop-in `style-entry` inside `build-page` `elements[].styles`.

### Phase 4 — `elementor/make-page` ability

- `core/abilities/make-page-ability.php` extends `Abstract_Ability`, uses the trait + `Element_Tree_Helpers`.
- Spec validator (port `validateFriendlySpec` from `src/validation.ts`): typo detection (`widget_type` / nested `content`), id format (7- or 8-hex per phase 0 decision), container-vs-leaf ambiguity, did-you-mean via `levenshtein()`, heading tag whitelist.
- Tree builder (port `buildEl`): container synonyms via a `CONTAINER_TYPE_MAP` constant; leaf widgets `e-heading` / `e-paragraph` / `e-button` / `e-image` using the same html-v3 wrap as `Make_Widget_Ability::make_html_v3()`.
- Each spec's `css` → one style-entry keyed by generated style id; mirror into `settings.classes.value` (the `Element_Tree_Helpers::auto_mirror_style_keys_into_classes()` pipeline already handles this on save — but we also ensure the key exists on the built node so validation reads it cleanly).
- Save path: call `Build_Page_Ability::execute([...])` directly. Pass `dry_run` through.
- Error messages match nestjs wording from the plan.

**Acceptance:** verification items 2, 3, 5, 6 from §8 pass.

### Phase 5 — `elementor/make-section` ability

- `core/abilities/make-section-ability.php` extends `Abstract_Ability`, uses the trait + `Element_Tree_Helpers`.
- Implements the four `layout` entry points (port from plan §Ability 4; original `src/mcp.server.ts:1155-1257`).
- Each layout produces a single section node by assembling `Make_Widget_Ability`-style widget nodes inside a container, using the parser for every `style` input.
- Returns `{ element: <node> }` — no save.

**Acceptance:** output node can be passed verbatim into `build-page` `elements[]` and saves cleanly. Each of hero / two-column / card-grid / centered has a smoke test.

### Phase 6 — registration + end-to-end

- Edit `core/abilities/abilities-bootstrap.php` to add the four remaining registrations (phase 2 registered `css-to-props` already).
- Full verification sweep per §8 against a real post.
- Update `README.md` or appropriate docs index with pointers to the four new abilities.

**Acceptance:** all §8 verification items pass; no regressions in existing abilities' smoke tests.

## 11. Open questions

- **Source of truth for parser** (phase 0) — where is `mcp.server.ts` actually checked in?
- **ID length** — 7-hex (plan) vs 8-hex (existing `Make_Widget_Ability`/`Make_Layout_Ability`).
- **Error catalogue** — exact wording for `did you mean` suggestions; port strings verbatim, or normalize to Elementor's existing error style?
- **`make-page` coupling** — direct Build_Page_Ability call in phase 4, or extract pipeline into a shared trait method up front?
- ~~**Variable references in CSS**~~ — **resolved**, see `phase-0-notes.md` §2b. Port nestjs `varRef` as-is: color + size vars supported; font vars fall through to string.
- ~~**Source of truth for parser**~~ — **resolved**, see `phase-0-notes.md` §1. Lives at `/Users/heinvv/Local Sites/elementor-prod/app/public/wp-content/repos/elementor-nest-mcp/src/`.
- ~~**ID length**~~ — **resolved**, see `phase-0-notes.md` §2a. 7-hex via `\Elementor\Modules\AtomicWidgets\Utils\Utils::generate_id()` — canonical for the atomic-widgets module, matches nestjs.
