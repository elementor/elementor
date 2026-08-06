---
name: extend-prop-types
description: "External: Extend prop types and transformers from a third-party plugin. PHP Prop_Type classes, TS createPropUtils, elementor/atomic-widgets hooks."
---

# Extend prop types

> **Scope: External** — the full documented outcome is shippable from a 3rd-party plugin via `elementor/atomic-widgets/*` schema and `{context}/transformers/register` hooks plus your own TS prop utils; no Core changes required. Changing the *global* prop vocabulary (core `prop-types/`) is Core-only. Full split + disclaimer: [skills-scope.md](../../../docs/atomic-builder/skills-scope.md).

## Implementation location

- **PHP:** existing or new **third-party plugin repository**; plugin-owned prop types and transformers (e.g. `MyPlugin\PropTypes\`, `MyPlugin\Transformers\`).
- **Editor TS:** plugin-owned package/bundle registered through `elementor/editor/v2/packages` and `init()`; mirror patterns from `@elementor/editor-props`.
- **Do not modify Elementor Core.** Global vocabulary lives in `modules/atomic-widgets/prop-types/` and `packages/packages/libs/editor-props/src/prop-types/` — reference only.

Read first: [fundamentals/prop-types.md](../../../docs/atomic-builder/fundamentals/prop-types.md), [fundamentals/transformers.md](../../../docs/atomic-builder/fundamentals/transformers.md), [atomic-widgets/hooks.md](../../../docs/atomic-builder/atomic-widgets/hooks.md).

## Checklist

1. **Decide: prop type vs transformer**
   - Prop type → storage shape, validation, JSON Schema (`to_json_schema()`).
   - Transformer → render/import/export output when stored shape is already valid.
2. **PHP prop type** — extend `Plain_Prop_Type`, `Object_Prop_Type`, or `Array_Prop_Type`; compose unions via `Union_Prop_Type::make()->add_prop_type()`. Implement `get_key()`, `define_shape()` (objects), `validate_value()`, `sanitize_value()`. Example: [docs/atomic-builder/examples/extend-prop-types.md](../../../docs/atomic-builder/examples/extend-prop-types.md).
3. **TypeScript mirror** — matching file in your plugin package using `createPropUtils()` and `propTypeToJsonSchema()`.
4. **Wire schema**
   - Widget props: `define_props_schema()` or filter `elementor/atomic-widgets/props-schema`.
   - Style keys: filter `elementor/atomic-widgets/styles/schema` — [style-schema.md](../../../docs/atomic-builder/fundamentals/style-schema.md).
5. **Register transformers** (priority `20+` to override core defaults at `10`):

```php
add_action( 'elementor/atomic-widgets/settings/transformers/register', function ( $registry, $resolver ) {
    $registry->register( 'my-type', new My_Settings_Transformer() ); // key must match $$type
}, 20 );
```

Contexts: `settings`, `styles`, `import`, `export`, `plain` — hook pattern:

`elementor/atomic-widgets/{context}/transformers/register`

6. **Editor controls** — filter `elementor/atomic-widgets/controls` when UI must change.
7. **MCP** — filter `elementor/atomic-widgets/llm-json-schema` to post-process single-prop JSON Schema.
8. **Verify** — PropValue `{ $$type, value }`; chained transform depth ≤ 3; `disabled: true` → `null`.

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
- Own TS prop utils published or bundled; editor reads types from `@elementor/editor-props` patterns.
- Plain-value resolvers: `elementor/atomic-widgets/settings-resolvers/register`.

## Core reference paths (do not edit)

- Global vocabulary → `modules/atomic-widgets/prop-types/` + `packages/packages/libs/editor-props/src/prop-types/`.
- Core transformer registration in `modules/atomic-widgets/module.php` (`register_settings_transformers`, etc.).
- Union wrapping pattern: `Prop_Types_Schema_Extender` (used by dynamic tags, variables).

## See also

- [fundamentals/prop-value.md](../../../docs/atomic-builder/fundamentals/prop-value.md)
- [atomic-widgets/rendering.md](../../../docs/atomic-builder/atomic-widgets/rendering.md) — resolver pipeline
