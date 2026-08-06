---
name: extend-variables
description: Registers Elementor v4 global design-token variable types — elementor/variables/register, registerVariableType JS, style schema unions, and styles transformers. Use for global-color-variable, kit tokens, Variable_Types_Registry, or Prop_Type_Adapter extensions.
---

# Extend variables (design tokens)

Read first: [variables/types.md](../../../docs/atomic-builder/variables/types.md), [variables/api.md](../../../docs/atomic-builder/variables/api.md), [editor-packages/extending-editor.md](../../../docs/atomic-builder/editor-packages/extending-editor.md) (for the no-build-pipeline path). Usage: [usage-in-props.md](../../../docs/atomic-builder/variables/usage-in-props.md), [usage-in-styles.md](../../../docs/atomic-builder/variables/usage-in-styles.md).

## Checklist

1. **PHP variable type** — `Transformable_Prop_Type` with `get_key()` (e.g. `global-shadow-variable`):

```php
add_action( 'elementor/variables/register', function (
    \Elementor\Modules\Variables\Classes\Variable_Types_Registry $registry
) {
    $registry->register( 'global-shadow-variable', \My\Shadow_Variable_Prop_Type::make() );
} );
```

2. **Style schema union** — extend `elementor/atomic-widgets/styles/schema` so atomic style keys accept the new `$$type`.
3. **PHP render transformer** — `elementor/atomic-widgets/styles/transformers/register` if frontend must resolve id → `var(--label)` (pattern: `Global_Variable_Transformer` for color/font).
4. **JS editor type (required for UI)** — `registerVariableType` with `key`, `icon`, `propTypeUtil`, `fallbackPropTypeUtil`, `variableType`, plus `defaultValue` / `valueField` / `styleTransformer` as needed. Call from **your** editor v2 package `init()` (not core `register-variable-types.tsx`). Example: [docs/atomic-builder/examples/extend-variables.md](../../../docs/atomic-builder/examples/extend-variables.md).
   - **Warning:** skip this step and a PHP-only type still works via REST / MCP / CSS, but it will **not appear in the "Add Variable" dropdown** — the UI only lists registered JS types.
   - **No build pipeline** (WP code snippet, no npm/webpack): register via the `window.elementorV2.{camelCasePackage}` global for late-loaded scripts — see [extending-editor.md](../../../docs/atomic-builder/editor-packages/extending-editor.md). Full `registerVariableType` field/`valueField` prop contract is in [variables/types.md](../../../docs/atomic-builder/variables/types.md#registervariabletype-field-contract).
5. **Storage adapter** — extend `Adapters\Prop_Type_Adapter` if value encoding is non-standard.
6. **Verify on active kit** — REST `elementor/v1/variables/*` and MCP `elementor/manage-global-variable` only **confirm** types already registered; they do not define new types.

## Size gap (important)

PHP `Style_Transformers` registers `Global_Variable_Transformer` for **color and font only**. Size has **no** matching PHP styles transformer. Built-in size types in JS use `EmptyTransformer`; editor canvas gets token values via `StyleVariablesRenderer`. New types needing `var(--label)` in canvas should pass an explicit `styleTransformer` in `registerVariableType`. Requires experiment `e_atomic_elements`; register `elementor/variables/register` before WordPress `init`.

Built-in keys: `global-color-variable`, `global-font-variable`, `global-size-variable`, `global-custom-size-variable`.

"(Pro)" on size is not only a PHP gate: the free Core JS bundle registers both size keys with `isActive: false` + an upsell `emptyState` CTA, so the picker shows a promotion, not an editable field. Pro re-registers them as active. `clamp(...)` / `calc(...)` belong to `global-custom-size-variable`. Details: [variables/types.md](../../../docs/atomic-builder/variables/types.md#built-in-types).

## Public path

- Plugin hooks `elementor/variables/register` + style schema + transformers.
- Editor: `registerVariableType` in own v2 package `init()`.
- Optional CSS: filter `elementor/variables/css_entry_additional`.

## Internal path

- `modules/variables/classes/variable-types-registry.php`, `hooks.php`, `prop-types/*-variable-prop-type.php`.
- Editor package: `packages/packages/core/editor-variables/`.
- REST/MCP in `modules/variables/classes/rest-api.php` and `modules/mcp/abilities/` — verification surfaces only.

## See also

- [extend-prop-types-transformers](../extend-prop-types-transformers/SKILL.md) — prop type + transformer pairing
- [variables/overview.md](../../../docs/atomic-builder/variables/overview.md)
