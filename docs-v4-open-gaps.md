# Elementor v4 Docs — Open Gaps Needing Engineering Sign-off

> Companion to `docs-plan-v4-documentation.md`. Compiles every `TBD — verify with v4 team` item and
> unresolved code-vs-plan discrepancy surfaced while writing the 12 content PRs into
> `feat/v4-docs-plan-revision-ee1d`. Each row cites the PR and file where it's currently documented
> as a TBD, so the answer can be dropped straight into that file once resolved.
>
> This is a tracking doc, not docs content — it does not live under `docs/v4/`.

## How to use this

For each row: someone with source-of-truth knowledge (usually the module owner) confirms the answer,
then either (a) the doc gets a small follow-up edit removing the TBD, or (b) it turns out to be a
real product gap (missing hook, undocumented behavior) worth its own ticket. Column "Action needed"
distinguishes the two.

---

## Cross-cutting (affects multiple PRs)

| # | Gap | Where flagged | Action needed |
|---|-----|----------------|----------------|
| 1 | **`editor_mcp` experiment appears to gate nothing.** `EXPERIMENT_EDITOR_MCP` is registered in `modules/atomic-widgets/module.php`, but no `is_feature_active( 'editor_mcp' )` call was found anywhere in the repo. The JS `editor-mcp` package loads unconditionally via `Editor_Loader::EXTENSIONS`. Three independent agents hit this same finding. | #36657 (`getting-started/experiments.md`, `mcp/overview.md`), #36655 (`editor-packages/overview.md`, `libs.md`), #36656 (`mcp/overview.md`) | **Confirm with engineering**: is this dead/unwired code (experiment registered but never checked), or is there a gating path we missed? One answer fixes 3 PRs. |
| 2 | **Opt-in bundle vs. UI copy mismatch.** `OPT_IN_FEATURES` in `modules/atomic-widgets/opt-in/opt-in.php` only bundles `container`, but the opt-in settings-page copy says "Containers **and Nested Elements**" will be activated together. `e_interactions` and `e_variables_manager` are confirmed absent from both `OPT_IN_FEATURES` and `OPT_OUT_FEATURES`. | #36659 (`opt-in/activation.md`), cross-confirmed independently by #36657 (`getting-started/experiments.md`) | **Confirm with product/eng**: is the UI copy stale, or is there a second code path that also enables nested-elements that we didn't find? If UI copy is just stale, that's a separate small bug ticket, not a docs fix. |

---

## `fundamentals/` (PR #36648)

| # | Gap | File | Action needed |
|---|-----|------|----------------|
| 3 | Overridable prop dependencies may not work correctly inside `overridable`-wrapped props — inferred from a comment in `atomic-self-hosted-video.php`, not from a test or spec. | `prop-value.md` | Confirm whether this is a known limitation (document as such) or already fixed. |

## `atomic-widgets/` (PR #36649)

| # | Gap | File | Action needed |
|---|-----|------|----------------|
| 4 | Hook naming inconsistency: `elementor/atomic_widgets/editor_data/element_styles` uses an **underscore** (`atomic_widgets`), unlike every other hook in the `elementor/atomic-widgets/*` (hyphenated) family. | `hooks.md` | Likely a typo bug in the hook's registration, not just a docs nuance — worth a quick eng look; if it's intentional, docs need to say why. |
| 5 | `e_pro_atomic_form` gate for the `e-form` element registered conditionally, but its own experiment definition wasn't re-verified. | `elements-catalog.md` | Low priority — confirm gate logic if/when Pro form elements get their own docs section. |

## `variables/` (PR #36650)

| # | Gap | File | Action needed |
|---|-----|------|----------------|
| 6 | Size variables may be resolved primarily on the JS side rather than through a PHP `Global_Variable_Transformer` (confirmed for color/font, not confirmed for size). | `usage-in-props.md` | Confirm the size-variable resolution path so the doc can state it definitively instead of "TBD." |
| 7 | The Pro ≥3.35 `custom_css` stripping behavior is implemented in source (`get_license_based_filtered_styles()`) but its PHPUnit test is `markTestSkipped`. | `usage-in-styles.md` | Test-coverage gap, not a docs gap — worth a ticket to un-skip or replace the test. |

## `interactions/` (PR #36651)

| # | Gap | File | Action needed |
|---|-----|------|----------------|
| 8 | No frontend registration hook found for adding new triggers/effects — schema extension exists (`elementor/atomic-widgets/interactions/schema`), but nothing found for the Motion.js execution side. | `frontend.md` | Confirm whether third-party triggers/effects are supported at all today, or if this is intentionally editor-schema-only for now. |
| 9 | Unclear whether `duration`/`delay`/`times`/`relativeTo`/`start`/`end`/`customEffects` controls are wired anywhere outside `editor-interactions/src/init.ts`. | `editor.md` | Confirm control wiring completeness. |
| 10 | Unclear whether legacy `[data-interactions]` attributes are still emitted, and which atomic renderer sets `data-interaction-id`. | `frontend.md` | Confirm current renderer behavior — affects anyone debugging interaction markup. |
| 11 | Unverified whether third parties can call `interactionsRepository.register()` directly. | `editor.md` | Confirm intended extension surface for interactions presets. |

## `components/` (PR #36652)

| # | Gap | File | Action needed |
|---|-----|------|----------------|
| 12 | No public hook found for registering an override `schema_source` type beyond the built-in `component` one. | `instances-and-overrides.md` | Confirm whether this extension point is planned but unbuilt, or intentionally closed. |
| 13 | No MCP abilities specific to components found anywhere in `modules/mcp/`. | `overview.md` | Confirm whether component authoring/composition via MCP is roadmapped — affects whether `docs/v4/mcp/` needs a components-specific ability later. |

## `dynamic-tags/` (PR #36653)

| # | Gap | File | Action needed |
|---|-----|------|----------------|
| 14 | `group` field handling is inconsistent: the author/MCP-facing PropValue shape omits `group`, but `validate_value()` still requires it internally (import/export back-fills it from the tag registry). | `binding-propvalues.md` | Confirm whether omitting `group` in the public-facing shape while requiring it internally is intentional API design or an oversight. |
| 15 | `force_convert_to_atomic` is used in `Dynamic_Tags_Editor_Config` but has no verified public API for third-party tag authors. | `extending.md` | Confirm intended third-party usage, if any. |
| 16 | No PHP `read-resource` handler backs `elementor://dynamic-tags` — it's resolved entirely in JS (`editor-canvas/src/mcp/resources/dynamic-tags-resource.ts`) via the `elementor/list-dynamic-tags` ability through the REST proxy. | `discovery.md` | Confirm this is by design (not every resource needs a PHP-side reader) rather than a missing implementation. |
| 17 | No public filter found for extending the tag-category-to-prop-type mapping (`get_related_categories()` is private). | `extending.md` | Confirm whether third-party dynamic tag categories can map to atomic prop types today. |

## `css-converter/` (PR #36654)

| # | Gap | File | Action needed |
|---|-----|------|----------------|
| 18 | No public WordPress filter exists for registering new CSS expanders/converters — extension currently requires modifying `Converter_Registry_Factory`/`Expander_Registry_Factory` directly. | `extension.md` | Confirm whether a registration filter is roadmapped; if not, `extension.md`'s "Extension" section is currently internal-only in practice despite `external` audience tag — may need a scope note. |

## `global-classes/` (PR #36658)

| # | Gap | File | Action needed |
|---|-----|------|----------------|
| 19 | `sync_to_v3` field exists on global class items (`Global_Class_Data_Normalizer`) but its purpose/behavior wasn't determined. | `data-model.md` | Confirm what this field does — likely BC-related, worth a one-line answer. |
| 20 | `api.md` runs to 179 lines, above the plan's 80–150 target, due to dense REST/MCP reference tables. | `api.md` | Editorial, not a knowledge gap — split into `api.md` + a `reference.md` if a v4-team reviewer agrees it's too long. |

## `migration/` (PR #36659)

| # | Gap | File | Action needed |
|---|-----|------|----------------|
| 21 | `$migrations_affecting_features` is an empty array in source today — the hook infrastructure exists but no experiments are currently registered against it. | `backward-compatibility.md` | Confirm this is expected pre-launch state, not a bug. |

---

## Already resolved during the fan-out (no action needed, listed for traceability)

- Component CPT slug — confirmed `elementor_component` (was plan §10 open decision #5).
- `editor-packages` `PACKAGES` list — plan's draft omitted `editor-controls`, `editor-elements`, `editor-props`, `editor-styles`; corrected in #36655.
- `css-converter.kb.md` pipeline claims — corrected against source in #36654 (`validate_props()` conditionality, `covered_properties()` maintenance model, extra output-routing cases).
