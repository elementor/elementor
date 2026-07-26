# Elements catalog (snapshot)

> Audience: both
> Module: `modules/atomic-widgets/elements/`
> Status: draft
> Related: [authoring-widgets.md](authoring-widgets.md), [../mcp/abilities/get-widget-schema.md](../mcp/abilities/get-widget-schema.md)

## What it is

A **snapshot** reference of built-in atomic types registered by `modules/atomic-widgets/module.php`. This table goes stale as types are added or renamed.

**Do not treat this as the teaching source.** For authoring, see [authoring-widgets.md](authoring-widgets.md). For live schemas and nesting at runtime, use MCP `get-widget-schema` / `list-widget-schemas` ([../mcp/abilities/get-widget-schema.md](../mcp/abilities/get-widget-schema.md)).

## When to use it

- Quick lookup of type strings (`e-heading`, `e-flexbox`, …)
- Understanding container nesting constraints
- Reading `llm_guidance` fields returned in MCP widget schemas

## Key concepts

### Type strings

Atomic types use `e-*` ids (e.g. `e-heading`). These are **not** global-class labels — use human labels like `wc26-gold` for class references in examples.

### Nesting fields

| Field | Source | Meaning |
|-------|--------|---------|
| `allowed_child_types` | `define_allowed_child_types()` on parent | Whitelist of child `elType` / `widgetType`; **empty = any child allowed** |
| `allowed_parents` | Derived at schema build time | Inverse index: which parents list this type as allowed child |
| `required_direct_children` | `default_children` entries with `meta.required` | Child types that must exist under this parent |

MCP builds `llm_guidance` from element config via `Llm_Guidance_Builder` (`modules/mcp/abilities/utils/llm-guidance-builder.php`):

| `llm_guidance` key | Content |
|--------------------|---------|
| `can_have_children` | `true` when `meta.is_container` is set |
| `nesting.allowed_child_types` | From parent config |
| `nesting.allowed_parents` | Computed parents index |
| `required_direct_children` | Required default child types |
| `default_styles` | Resolved base style props (CSS map) |
| `default_settings` | `base_settings` from element config |
| `instructions` | Hints to omit defaults unless user requests changes |

## Extension

Register new types per [authoring-widgets.md](authoring-widgets.md). They appear automatically in MCP discovery once registered and the experiment is active. Override `define_allowed_child_types()` to publish nesting rules into editor config and `llm_guidance`.

## Internals

### SNAPSHOT — built-in types

| Type | Kind | Container | Allowed children | Notes |
|------|------|-----------|------------------|-------|
| `e-div-block` | element | yes | any | Generic block container |
| `e-flexbox` | element | yes | any | Flex layout container |
| `e-grid` | element | yes | any | Grid layout container |
| `e-heading` | widget | no | — | Twig template; `tag` h1–h6 |
| `e-paragraph` | widget | no | — | Rich text |
| `e-button` | widget | no | — | |
| `e-image` | widget | no | — | |
| `e-svg` | widget | no | — | |
| `e-divider` | widget | no | — | |
| `e-youtube` | widget | no | — | |
| `e-self-hosted-video` | widget | no | — | |
| `e-tabs` | element | yes | any (structure via defaults) | Default children: menu + content area |
| `e-tabs-menu` | element | yes | `e-tab`, `container` | Tab triggers |
| `e-tab` | element | no | — | Single tab trigger |
| `e-tabs-content-area` | element | yes | `e-tab-content`, `container` | Tab panels wrapper |
| `e-tab-content` | element | yes | any | Panel body |
| `e-form` | element | yes | any | Pro + `e_pro_atomic_form` only |
| `e-form-success-message` | element | yes | `e-paragraph` | Required child of `e-form` |
| `e-form-error-message` | element | yes | `e-paragraph` | Required child of `e-form` |
| `e-form` (promotion) | element | — | — | Free sites: placeholder |
| `e-collection-loop` | element | — | — | Free sites: Pro promotion stub |

**Tabs pairing rule** (from `Atomic_Tabs::$widget_description`): `e-tabs` contains `e-tabs-menu` (with `e-tab` children) and `e-tabs-content-area` (with `e-tab-content` children). Count of `e-tab` must equal count of `e-tab-content`; index N pairs trigger N with panel N.

**Form required children** (`e-form` default tree): `e-form-success-message` and `e-form-error-message`, each requiring an `e-paragraph` child.

### Allowed parents (derived)

Only types with explicit `allowed_child_types` produce non-null `allowed_parents` in `llm_guidance`:

| Child type | Allowed parents (snapshot) |
|------------|---------------------------|
| `e-tab` | `e-tabs-menu` |
| `e-tab-content` | `e-tabs-content-area` |
| `e-paragraph` | `e-form-success-message`, `e-form-error-message` |

Layout containers (`e-flexbox`, `e-div-block`, `e-grid`) accept any child; they do not appear in others' `allowed_parents` lists.

## See also

- [authoring-widgets.md](authoring-widgets.md) — registration (primary)
- [overview.md](overview.md) — widget vs element
- [../mcp/composition-workflow.md](../mcp/composition-workflow.md) — agent composition rules
- [../components/nesting-rules.md](../components/nesting-rules.md) — component-specific nesting
