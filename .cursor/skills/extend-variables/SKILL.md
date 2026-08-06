---
name: extend-variables
description: Registers Elementor v4 global design-token variable types — elementor/variables/register, registerVariableType JS, style schema unions, and styles transformers. Use for global-color-variable, kit tokens, Variable_Types_Registry, or Prop_Type_Adapter extensions.
---

# Extend variables (design tokens)

Read first: [variables/types.md](../../../docs/atomic-builder/variables/types.md), [variables/api.md](../../../docs/atomic-builder/variables/api.md). Usage: [usage-in-props.md](../../../docs/atomic-builder/variables/usage-in-props.md), [usage-in-styles.md](../../../docs/atomic-builder/variables/usage-in-styles.md).

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
4. **JS editor type** — `registerVariableType` from `@elementor/editor-variables` with matching `key`, `propTypeUtil`, `variableType`, `defaultValue`; call from package `init()` / `register-variable-types.tsx`.
5. **Storage adapter** — extend `Adapters\Prop_Type_Adapter` if value encoding is non-standard.
6. **Verify on active kit** — REST `elementor/v1/variables/*` and MCP `elementor/manage-global-variable` only **confirm** types already registered; they do not define new types.

## Size gap (important)

PHP `Style_Transformers` registers `Global_Variable_Transformer` for **color and font only**. **Size** variables resolve in editor JS (`variableTransformer`); do not assume PHP render parity for every type — read [types.md](../../../docs/atomic-builder/variables/types.md) internals.

Built-in keys: `global-color-variable`, `global-font-variable`, `global-size-variable`, `global-custom-size-variable`.

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
