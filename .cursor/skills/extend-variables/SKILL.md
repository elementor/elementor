---
name: extend-variables
description: "External: Register global design-token variable types from a third-party plugin. elementor/variables/register, registerVariableType JS, style schema, transformers."
---

# Extend variables

> **Scope: External** — the full documented custom-variable outcome is shippable from a 3rd-party plugin via `elementor/variables/register` + style-schema/transformer hooks + your own package `init()`; no Core changes required. Modifying Elementor's built-in size types or their Pro gating is outside this skill and requires Core/Pro changes. Full split + disclaimer: [skills-scope.md](../../../docs/atomic-builder/skills-scope.md).

## Implementation location

- **PHP:** third-party plugin repo; variable prop types, transformers, `elementor/variables/register` (e.g. `My\Shadow_Variable_Prop_Type`).
- **Editor JS:** `registerVariableType` in **your** editor package `init()` — see [add-editor-package](../add-editor-package/SKILL.md).
- **Do not modify Elementor Core.** Core registry: `modules/variables/`; editor package: `packages/packages/core/editor-variables/`.
- **Runnable reference:** [examples/example-plugin/](../../../examples/example-plugin/) (`global-shadow-variable` PHP + JS + `box-shadow` schema union).

## Prerequisites

- `e_atomic_elements` — variables module loads with atomic widgets.
- `e_variables` / `e_variables_manager` — variables manager UI; REST may work without the manager UI — [variables/overview.md](../../../docs/atomic-builder/variables/overview.md).
- Register `elementor/variables/register` **before** WordPress `init` (hook fires on `init`).

Read first: [variables/types.md](../../../docs/atomic-builder/variables/types.md), [variables/api.md](../../../docs/atomic-builder/variables/api.md), [fundamentals/prop-types.md](../../../docs/atomic-builder/fundamentals/prop-types.md), [usage-in-props.md](../../../docs/atomic-builder/variables/usage-in-props.md).

## Checklist

1. **PHP variable type** — typically extends `String_Prop_Type` (or other `Transformable_Prop_Type`) with stable `get_key()` (e.g. `global-shadow-variable`):

```php
add_action( 'elementor/variables/register', function (
    \Elementor\Modules\Variables\Classes\Variable_Types_Registry $registry
) {
    $registry->register( 'global-shadow-variable', \My\Shadow_Variable_Prop_Type::make() );
} );
```

2. **Style schema union (required for style binding)** — filter `elementor/atomic-widgets/styles/schema` so target style keys accept the new `$$type`. Mirror built-in patterns in Core `Style_Schema` / `Size_Style_Schema`. Example for `box-shadow`:

```php
add_filter( 'elementor/atomic-widgets/styles/schema', function ( array $schema ) {
    if ( isset( $schema['box-shadow'] ) ) {
        $schema['box-shadow'] = Union_Prop_Type::create_from( $schema['box-shadow'] )
            ->add_prop_type( Shadow_Variable_Prop_Type::make() );
    }
    return $schema;
} );
```

3. **PHP render transformer** — `elementor/atomic-widgets/styles/transformers/register` if frontend must resolve stored **id** → `var(--label)`. Pattern: `Global_Variable_Transformer` (color/font). PropValues store **id**; CSS uses **label** — see [api.md](../../../docs/atomic-builder/variables/api.md) and [usage-in-props.md](../../../docs/atomic-builder/variables/usage-in-props.md). Label rules: max 50 chars, no spaces.
4. **JS editor type (required for "Add Variable" UI)** — `registerVariableType` with `key`, `icon`, `propTypeUtil`, `fallbackPropTypeUtil`, `variableType`, plus `defaultValue` / `valueField` / `styleTransformer` as needed. Call from **your** editor v2 package `init()` (not core `register-variable-types.tsx`). Example: [docs/atomic-builder/examples/extend-variables.md](../../../docs/atomic-builder/examples/extend-variables.md).
   - Skip JS → PHP-only type works via REST / MCP / CSS but **never appears in the Add Variable dropdown**.
   - Hand-built bundle: call `init()` yourself and use `window.elementorV2.editorVariables.registerVariableType` — see [add-editor-package](../add-editor-package/SKILL.md).
5. **Storage adapter** — extend `Adapters\Prop_Type_Adapter` if value encoding is non-standard.
6. **Verify on active kit** — REST `elementor/v1/variables/*` and MCP `elementor/manage-global-variable` **confirm** types already registered; they do not define new types.

## Size gap (important)

PHP `Style_Transformers` registers `Global_Variable_Transformer` for **color and font only**. Size has **no** matching PHP styles transformer. Built-in size types in JS use `EmptyTransformer`; editor canvas uses `StyleVariablesRenderer`. New types needing `var(--label)` on canvas should pass explicit `styleTransformer` in `registerVariableType`.

Built-in keys: `global-color-variable`, `global-font-variable`, `global-size-variable`, `global-custom-size-variable`.

"(Pro)" on size is not only a PHP gate: free Core JS registers size keys with `isActive: false` + upsell CTA; Pro re-registers as active. Details: [variables/types.md](../../../docs/atomic-builder/variables/types.md#built-in-types).

## External implementation path

- Plugin hooks `elementor/variables/register` + style schema + transformers + editor `registerVariableType`.
- Optional CSS: filter `elementor/variables/css_entry_additional`.

## Core reference paths (do not edit)

- `modules/variables/classes/variable-types-registry.php`, `hooks.php`, `prop-types/*-variable-prop-type.php`.
- Editor: `packages/packages/core/editor-variables/`.

## See also

- [extend-prop-types](../extend-prop-types/SKILL.md) — prop type + transformer pairing
- [add-editor-package](../add-editor-package/SKILL.md) — bundle + `init()` for JS registration
