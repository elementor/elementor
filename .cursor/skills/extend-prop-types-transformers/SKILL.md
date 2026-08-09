---
name: extend-prop-types-transformers
description: Extends Elementor v4 prop types and transformers — PHP Prop_Type classes, TS createPropUtils in @elementor/editor-props, elementor/atomic-widgets hooks for schema and settings/styles/import/export transformers. Use for $$type, validation, render conversion, or llm-json-schema.
---

# Extend prop types and transformers

Read first: [fundamentals/prop-types.md](../../../docs/atomic-builder/fundamentals/prop-types.md), [fundamentals/transformers.md](../../../docs/atomic-builder/fundamentals/transformers.md), [atomic-widgets/hooks.md](../../../docs/atomic-builder/atomic-widgets/hooks.md).

## Checklist

1. **Decide: prop type vs transformer**
   - Prop type → storage shape, validation, JSON Schema (`to_json_schema()`).
   - Transformer → render/import/export output when stored shape is already valid.
2. **PHP prop type** — extend `Plain_Prop_Type`, `Object_Prop_Type`, `Array_Prop_Type`, or `Union_Prop_Type`; implement `get_key()`, `validate_value()`, `sanitize_value()`.
3. **TypeScript mirror** — matching file in `editor-props/src/prop-types/` using `createPropUtils()` and `propTypeToJsonSchema()`.
4. **Wire schema**
   - Widget props: `define_props_schema()` or filter `elementor/atomic-widgets/props-schema`.
   - Style keys: filter `elementor/atomic-widgets/styles/schema` — [style-schema.md](../../../docs/atomic-builder/fundamentals/style-schema.md).
5. **Register transformers** (priority `20+` to override core defaults at `10`):

```php
add_action( 'elementor/atomic-widgets/settings/transformers/register', function ( $registry ) {
    $registry->register( 'my-type', new My_Settings_Transformer() );
}, 20 );
```

Contexts: `settings`, `styles`, `import`, `export`, `plain` — hook pattern:

`elementor/atomic-widgets/{context}/transformers/register`

6. **Editor controls** — filter `elementor/atomic-widgets/controls` when UI must change.
7. **MCP** — filter `elementor/atomic-widgets/llm-json-schema` to post-process single-prop JSON Schema.
8. **Verify** — PropValue `{ $$type, value }`; chained transform depth ≤ 3; `disabled: true` → `null`.

## Transformer skeleton

```php
class My_Transformer extends \Elementor\Modules\AtomicWidgets\PropsResolver\Transformers\Transformer_Base {
    public function transform( $value, $context ) {
        return $value['value'] . 'px'; // or Multi_Props::generate() for multi-key CSS
    }
}
```

## Public path

- Own PHP classes in the plugin; hook `elementor/atomic-widgets/*` filters/actions.
- Own TS prop utils published or bundled; editor reads types from `@elementor/editor-props` patterns.
- Plain-value resolvers: `elementor/atomic-widgets/settings-resolvers/register`.

## Internal path

- Global vocabulary → `modules/atomic-widgets/prop-types/` + `packages/packages/libs/editor-props/src/prop-types/`.
- Core transformer registration in `modules/atomic-widgets/module.php` (`register_settings_transformers`, etc.).
- Union wrapping pattern: `Prop_Types_Schema_Extender` (used by dynamic tags, variables).

## See also

- [fundamentals/prop-value.md](../../../docs/atomic-builder/fundamentals/prop-value.md)
- [atomic-widgets/rendering.md](../../../docs/atomic-builder/atomic-widgets/rendering.md) — resolver pipeline
