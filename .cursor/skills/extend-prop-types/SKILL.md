---
name: extend-prop-types
description: "External: Add or extend a prop type from a third-party plugin. Description also covers transformers for render/import/export. PHP Prop_Type, createPropUtils, atomic-widgets hooks."
---

# Extend prop types

> **Scope: External** — the full documented outcome is shippable from a 3rd-party plugin via `elementor/atomic-widgets/*` schema and `{context}/transformers/register` hooks plus your own TS prop utils; no Core changes required. Changing the *global* prop vocabulary (core `prop-types/`) is Core-only. Full split + disclaimer: [skills-scope.md](../../../docs/atomic-builder/skills-scope.md).

## Implementation location

- **PHP:** existing or new **third-party plugin repository**; plugin-owned prop types and transformers (e.g. `MyPlugin\PropTypes\`, `MyPlugin\Transformers\`).
- **Editor TS:** plugin-owned package/bundle registered through [add-editor-package](../add-editor-package/SKILL.md); mirror patterns from `@elementor/editor-props`.
- **Do not modify Elementor Core.** Global vocabulary lives in `modules/atomic-widgets/prop-types/` and `packages/packages/libs/editor-props/src/prop-types/` — reference only.
- **Runnable reference:** [examples/example-plugin/](../../../examples/example-plugin/) (`Badge_Prop_Type` + settings transformer).

## Prerequisites

- Experiment `e_atomic_elements` (and often `e_opt_in_v4`) — [getting-started/experiments.md](../../../docs/atomic-builder/getting-started/experiments.md).

Read first: [fundamentals/prop-types.md](../../../docs/atomic-builder/fundamentals/prop-types.md), [fundamentals/transformers.md](../../../docs/atomic-builder/fundamentals/transformers.md), [fundamentals/validation.md](../../../docs/atomic-builder/fundamentals/validation.md), [atomic-widgets/hooks.md](../../../docs/atomic-builder/atomic-widgets/hooks.md).

## Checklist

1. **Start with the prop type** — storage shape, validation, JSON Schema (`to_json_schema()`). Add a **transformer** only when render/import/export needs a different output from the stored shape.
2. **PHP prop type** — extend `Plain_Prop_Type`, `Object_Prop_Type`, or `Array_Prop_Type`; compose unions via `Union_Prop_Type::make()->add_prop_type()` or `Union_Prop_Type::create_from()`. Implement `get_key()`, `define_shape()` (objects), `validate_value()`, `sanitize_value()`. Example: [docs/atomic-builder/examples/extend-prop-types.md](../../../docs/atomic-builder/examples/extend-prop-types.md).
3. **Wire schema — pick one scope**
   - **Widget-only:** `define_props_schema()` on the widget class (preferred for type-specific props).
   - **Global:** filter `elementor/atomic-widgets/props-schema` (all elements).
   - **Style keys:** filter `elementor/atomic-widgets/styles/schema` — [style-schema.md](../../../docs/atomic-builder/fundamentals/style-schema.md).
4. **Register transformers** when needed (priority `20+` to override core defaults at `10`):

```php
add_action( 'elementor/atomic-widgets/settings/transformers/register', function ( $registry ) {
    $registry->register( 'my-type', new My_Settings_Transformer() ); // key must match $$type
}, 20 );
```

Hook receives `( Transformers_Registry $registry, Props_Resolver $resolver )`.

Contexts: `settings`, `styles`, `import`, `export`, `plain` — hook pattern:

`elementor/atomic-widgets/{context}/transformers/register`

**Note:** `plain` is documented in [transformers.md](../../../docs/atomic-builder/fundamentals/transformers.md) but omitted from the verified list in [hooks.md](../../../docs/atomic-builder/atomic-widgets/hooks.md) — confirm at runtime if you depend on it.

5. **TypeScript mirror (when editor validation/UI needs it)** — `createPropUtils()` + `propTypeToJsonSchema()` in your editor package `init()`. There is **no** global editor registry like `registerVariableType` — unlike variables, general prop types rely on custom controls (`elementor/atomic-widgets/controls` filter) and/or your package exports.
6. **If this prop type is used in styles** — legacy CSS import also needs [internal-extend-css-converter](../internal-extend-css-converter/SKILL.md) (Internal; no public discovery hook). Style schema + transformer alone do not cover import.
7. **Editor controls** — match control to prop shape (e.g. `Select_Control` for enums); filter `elementor/atomic-widgets/controls` when built-ins are insufficient.
8. **MCP** — filter `elementor/atomic-widgets/llm-json-schema` to post-process single-prop JSON Schema.
9. **Verify** — PropValue `{ $$type, value }`; transformer receives **inner** payload; chained transform depth ≤ 3; `disabled: true` → `null`.

## Transformer skeleton

```php
class My_Transformer extends \Elementor\Modules\AtomicWidgets\PropsResolver\Transformer_Base {
    public function transform( $value, \Elementor\Modules\AtomicWidgets\PropsResolver\Props_Resolver_Context $context ) {
        return +$value['size'] . $value['unit']; // inner PropValue payload, not full envelope
    }
}
```

## External implementation path

- Own PHP classes in the plugin; hook `elementor/atomic-widgets/*` filters/actions.
- Own TS prop utils in editor package; plain-value resolvers: `elementor/atomic-widgets/settings-resolvers/register`.

## Core reference paths (do not edit)

- Global vocabulary → `modules/atomic-widgets/prop-types/` + `packages/packages/libs/editor-props/src/prop-types/`.
- Union wrapping: `Prop_Types_Schema_Extender` (dynamic tags, variables).

## See also

- [fundamentals/prop-value.md](../../../docs/atomic-builder/fundamentals/prop-value.md)
- [internal-extend-css-converter](../internal-extend-css-converter/SKILL.md) — style keys + legacy CSS import (Internal)
- [add-editor-package](../add-editor-package/SKILL.md) — editor package for TS prop utils
