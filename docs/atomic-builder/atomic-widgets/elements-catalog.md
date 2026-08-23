# Elements catalog (snapshot)

> Audience: both
> Module: `modules/atomic-widgets/elements/`
> Related: [authoring-widgets.md](authoring-widgets.md), [../mcp/abilities/get-widget-schema.md](../mcp/abilities/get-widget-schema.md)

## What it is

Snapshot of built-in atomic types from `module.php`. For authoring see [authoring-widgets.md](authoring-widgets.md). For live schemas use MCP `get-widget-schema` / `list-widget-schemas`.

## When to use it

- Quick lookup of type strings (`e-heading`, `e-flexbox`, …)
- Container nesting constraints
- `llm_guidance` fields in MCP widget schemas

## Key concepts

### Type strings

Atomic types use `e-*` ids. These are **not** global-class labels — use labels like `wc26-gold` for class references.

### Nesting fields

| Field | Source | Meaning |
|-------|--------|---------|
| `allowed_child_types` | `define_allowed_child_types()` | Whitelist; **empty = any child allowed** |
| `allowed_parents` | Derived at schema build | Inverse index from parent whitelists |
| `required_direct_children` | `default_children` with `meta.required` | Child types that must exist |

MCP `llm_guidance` keys (via `Llm_Guidance_Builder`):

| Key | Content |
|-----|---------|
| `can_have_children` | `true` when `meta.is_container` |
| `nesting.allowed_child_types` | From parent config |
| `nesting.allowed_parents` | Computed parents index |
| `required_direct_children` | Required default child types |
| `default_styles` | Resolved base style props |
| `default_settings` | `base_settings` from element config |

## Extension

Register types per [authoring-widgets.md](authoring-widgets.md). Override `define_allowed_child_types()` to publish nesting rules.

## Internals

### SNAPSHOT — built-in types

| Type | Kind | Container | Allowed children | Notes |
|------|------|-----------|------------------|-------|
| `e-div-block` | element | yes | any | Generic block |
| `e-flexbox` | element | yes | any | Flex layout |
| `e-grid` | element | yes | any | Grid layout |
| `e-heading` | widget | no | — | Twig; `tag` h1–h6 |
| `e-paragraph` | widget | no | — | Rich text |
| `e-button` | widget | no | — | |
| `e-image` | widget | no | — | |
| `e-svg` | widget | no | — | |
| `e-divider` | widget | no | — | |
| `e-youtube` | widget | no | — | |
| `e-self-hosted-video` | widget | no | — | |
| `e-accordion` | element | yes | `e-accordion-item` | Default: 2 items, first open |
| `e-accordion-item` | element | yes | `e-accordion-item-head`, `e-accordion-item-content` | `<details>`; permanently locked |
| `e-accordion-item-head` | element | yes | `e-accordion-item-title`, `e-accordion-item-icon` | `<summary>`; permanently locked |
| `e-accordion-item-title` | element | yes | any | Tag from root's `title_tag` setting |
| `e-accordion-item-icon` | element | yes | any | Decorative (`aria-hidden`); shown/hidden via root's `show_icon` |
| `e-accordion-item-content` | element | yes | any | Collapsible body |
| `e-tabs` | element | yes | any | Default: menu + content area |
| `e-tabs-menu` | element | yes | `e-tab`, `container` | Tab triggers |
| `e-tab` | element | no | — | Single tab trigger |
| `e-tabs-content-area` | element | yes | `e-tab-content`, `container` | Tab panels wrapper |
| `e-tab-content` | element | yes | any | Panel body |
| `e-form` | element | yes | any | Pro + `e_pro_atomic_form` |
| `e-form-success-message` | element | yes | `e-paragraph` | Required child of `e-form` |
| `e-form-error-message` | element | yes | `e-paragraph` | Required child of `e-form` |
| `e-form` (promotion) | element | — | — | Free sites: placeholder |
| `e-collection-loop` | element | — | — | Free sites: Pro promotion |

### SNAPSHOT — Pro form field widgets

Registered by `elementor-pro/modules/atomic-form/module.php` when Pro + `e_pro_atomic_form` active:

| Type | Notes |
|------|-------|
| `e-form-input`, `e-form-label`, `e-form-textarea`, `e-form-submit-button`, `e-form-checkbox`, `e-form-radio-button` | Core form fields |
| `e-form-date-picker`, `e-form-time-picker`, `e-form-select`, `e-form-file-upload` | Core ≥ 4.1 |

| Site | `e_pro_atomic_form` | Registers |
|------|---------------------|-----------|
| Free | — | Promotion stubs only |
| Pro | active | Core form elements + Pro field widgets |
| Pro | inactive | Nothing |

**Tabs rule:** count of `e-tab` must equal count of `e-tab-content`; index N pairs trigger N with panel N.

**Form required children:** `e-form-success-message` and `e-form-error-message`, each requiring `e-paragraph`.

### Allowed parents (derived)

| Child | Parents |
|-------|---------|
| `e-accordion-item` | `e-accordion` |
| `e-accordion-item-head` | `e-accordion-item` |
| `e-accordion-item-content` | `e-accordion-item` |
| `e-accordion-item-title` | `e-accordion-item-head` |
| `e-accordion-item-icon` | `e-accordion-item-head` |
| `e-tab` | `e-tabs-menu` |
| `e-tab-content` | `e-tabs-content-area` |
| `e-paragraph` | `e-form-success-message`, `e-form-error-message` |

## See also

- [authoring-widgets.md](authoring-widgets.md) — registration
- [overview.md](overview.md) — widget vs element
- [../mcp/composition-workflow.md](../mcp/composition-workflow.md)
- [../components/nesting-rules.md](../components/nesting-rules.md)
