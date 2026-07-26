# Prop types

> Audience: both
> Module: atomic-widgets
> Status: draft
> Related: [prop-value.md](prop-value.md), [style-schema.md](style-schema.md), [../atomic-widgets/authoring-widgets.md](../atomic-widgets/authoring-widgets.md), [../editor-packages/libs.md](../editor-packages/libs.md)

## What it is

**Prop types** are the schema layer: they declare what shape a PropValue may take, validate and sanitize incoming data, export JSON Schema for LLMs, and pair with transformers at render time.

Every prop type implements `Prop_Type` (PHP) and has a mirror in `@elementor/editor-props` (TS).

## When to use it

- Defining a widget's `define_props_schema()` — map setting keys to prop type instances
- Extending the global type vocabulary for a new domain concept (e.g. a custom media picker)
- Understanding why a value fails validation or what `$$type` values are legal

Prefer **registration over enumeration**: document how to add a type; treat built-in catalogs as snapshots that go stale.

## Key concepts

### Taxonomy (structural kinds)

| Kind | PHP base | `get_type()` | Stored envelope | Inner `value` |
|------|----------|--------------|-----------------|---------------|
| Plain | `Plain_Prop_Type` | `plain` (subclasses use `string`/`number`/`boolean`) | `{ $$type, value }` | Scalar |
| Object | `Object_Prop_Type` | `object` | `{ $$type, value }` | `Record<key, PropValue>` per `define_shape()` |
| Array | `Array_Prop_Type` | `array` | `{ $$type, value }` | `PropValue[]` per `define_item_type()` |
| Union | `Union_Prop_Type` | `union` | `{ $$type, value }` | Shape depends on which member type matches `$$type` |

`Union_Prop_Type` validates by dispatching to the member whose `get_key()` matches `value.$$type`. It serializes as `anyOf` in JSON Schema.

### Domain types (snapshot)

Built-in domain types live in `modules/atomic-widgets/prop-types/`. Examples — not an exhaustive list:

| Category | Types (`get_key()`) |
|----------|---------------------|
| Primitives | `string`, `number`, `boolean`, `string-array` |
| Layout / size | `size`, `dimensions`, `position`, `flex`, `span`, `grid-track-size` |
| Color / effects | `color`, `box-shadow`, `shadow`, `stroke`, `filter`, `backdrop-filter`, `transform`, `transition` |
| Media | `image`, `image-src`, `svg-src`, `video-src`, `background` (+ overlay sub-shapes) |
| Content / data | `link`, `html`, `html-v2`, `html-v3`, `query`, `attributes`, `classes` |
| Structured | `border-radius`, `border-width`, `font-family`, `key-value`, `date-time`, `time-range` |

Variables module adds `global-color-variable`, `global-font-variable`, `global-size-variable` via style-schema augmentation (see [style-schema.md](style-schema.md)).

Components module adds `overridable`, `component-instance`, `override`.

### PHP ↔ TypeScript mapping

| PHP | TS (`packages/packages/libs/editor-props/`) |
|-----|-----------------------------------------------|
| `modules/atomic-widgets/prop-types/` | `src/prop-types/*.ts` |
| `Plain_Prop_Type::jsonSerialize()` | Prop type object (`kind`, `key`, `settings`, `meta`, …) |
| `Prop_Type::to_json_schema()` | `propTypeToJsonSchema()` in `utils/props-to-llm-schema.ts` |
| `::make()` factory | `createPropUtils()` / `*PropTypeUtil` exports |

The editor receives serialized prop type definitions via localized settings; widget schemas are built from `define_props_schema()` and passed through `elementor/atomic-widgets/props-schema`.

### Shared behaviors

- **Defaults** — `->default( $value )`; missing keys validate against default
- **Required** — `->required()`; `null` fails validation when required
- **Dependencies** — `->set_dependencies( … )` on prop types; consumed by editor controls (see [style-schema.md](style-schema.md))
- **Meta** — `->meta( $key, $value )` for editor/LLM hints (`description`, `overridable`, etc.)
- **Persistence** — `should_persist()`: object/array types drop empty inner values on sanitize; plain types always persist

## Extension

### Add a prop type to the global vocabulary

**PHP** — create a class under `prop-types/` extending the appropriate base, implement `get_key()`, `validate_value()`, `sanitize_value()`.

**TS** — add a matching file in `editor-props/src/prop-types/` using `createPropUtils()`.

### Extend a widget's props schema

```php
// In your widget class
protected static function define_props_schema(): array {
    return [
        'badge_label' => String_Prop_Type::make()
            ->default( 'New' )
            ->meta( 'description', 'Badge text shown on the card' ),
    ];
}
```

Other plugins/modules extend schemas without editing the widget:

```php
add_filter( 'elementor/atomic-widgets/props-schema', function ( array $schema ) {
    // $schema is the element-type map from define_props_schema() for the current widget/element
    $schema['my_extension_field'] = String_Prop_Type::make();
    return $schema;
} );
```

Hook runs in `Has_Atomic_Base::get_props_schema()` after the element class builds its own schema (per element type, not a global registry).

For style keys, use `elementor/atomic-widgets/styles/schema` instead — see [style-schema.md](style-schema.md).

## Internals

| Class / file | Role |
|--------------|------|
| `PropTypes\Contracts\Prop_Type` | Validate, sanitize, `to_json_schema()`, `should_persist()` |
| `PropTypes\Contracts\Transformable_Prop_Type` | Transformable types + `generate()` |
| `PropTypes\Utils\Prop_Types_Schema_Extender` | Base for modules that union-wrap existing types (dynamic tags, variables) |
| `Union_Prop_Type::create_from()` | Promote a single type to union while preserving dependencies/meta |

Object prop types recursively validate shape fields. Array prop types validate each item against `item_type`.

## See also

- [prop-value.md](prop-value.md) — envelope shape and null semantics
- [style-schema.md](style-schema.md) — `Style_Schema` canonical keys
- [transformers.md](transformers.md) — render-time transformation
- [../variables/types.md](../variables/types.md) — variable type registration
