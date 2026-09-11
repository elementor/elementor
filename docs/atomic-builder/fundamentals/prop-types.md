# Prop types

> Audience: both
> Module: atomic-widgets
> Related: [prop-value.md](prop-value.md), [style-schema.md](style-schema.md), [../atomic-widgets/authoring-widgets.md](../atomic-widgets/authoring-widgets.md), [../editor-packages/libs.md](../editor-packages/libs.md)

## What it is

**Prop types** declare what shape a PropValue may take, validate/sanitize data, export JSON Schema for LLMs, and pair with transformers at render time.

Every prop type implements `Prop_Type` (PHP) with a mirror in `@elementor/editor-props` (TS).

## When to use it

- Defining `define_props_schema()` on a widget/element
- Extending the global type vocabulary
- Understanding validation failures or legal `$$type` values

Prefer **registration over enumeration** — built-in catalogs go stale.

## Key concepts

### Taxonomy (structural kinds)

| Kind | PHP base | `get_type()` | Inner `value` |
|------|----------|--------------|---------------|
| Plain | `Plain_Prop_Type` | `string`/`number`/`boolean` | Scalar |
| Object | `Object_Prop_Type` | `object` | `Record<key, PropValue>` per `define_shape()` |
| Array | `Array_Prop_Type` | `array` | `PropValue[]` per `define_item_type()` |
| Union | `Union_Prop_Type` | `union` | Dispatches on `$$type` to member type |

`Union_Prop_Type` serializes as `anyOf` in JSON Schema.

### Domain types (snapshot)

Built-in types in `modules/atomic-widgets/prop-types/`:

| Category | Examples (`get_key()`) |
|----------|------------------------|
| Primitives | `string`, `number`, `boolean`, `string-array` |
| Layout / size | `size`, `dimensions`, `position`, `flex`, `span`, `grid-track-size` |
| Color / effects | `color`, `box-shadow`, `stroke`, `filter`, `transform`, `transition` |
| Media | `image`, `image-src`, `svg-src`, `video-src`, `background` |
| Content | `link`, `html`, `html-v2`, `html-v3`, `query`, `attributes`, `classes` |

Variables module adds `global-color-variable`, `global-font-variable`, `global-size-variable`. Components adds `overridable`, `component-instance`, `override`.

### Responsive settings

Per-breakpoint **settings** (not style props) opt in with `Responsive_Settings::enable()` on the inner prop type. Desktop stays in `settings[propKey]`. Other breakpoints are stored as element-level variants:

```json
{
  "settings": {
    "slides_per_view": { "$$type": "number", "value": 3 }
  },
  "settings_variants": [
    {
      "meta": { "breakpoint": "tablet" },
      "props": { "slides_per_view": { "$$type": "number", "value": 2 } }
    }
  ]
}
```

This is the same envelope styles use (`meta.breakpoint` beside `props`), so panel controls stay breakpoint-agnostic. `SettingsField` writes the active breakpoint: desktop → `settings`, anything else → `settings_variants`.

```php
use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\Number_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Responsive_Settings;

'slides_per_view' => Number_Prop_Type::make()
    ->default( 3 )
    ->meta( Responsive_Settings::enable() ),
```

| Behavior | Detail |
|----------|--------|
| Opt-in | `Number_Prop_Type::make()->meta( Responsive_Settings::enable() )` — default off |
| Desktop | Lives in the existing `settings` map |
| Overrides | Sparse `settings_variants[]` with `{ meta: { breakpoint }, props }` — no desktop row |
| Cascade | `Responsive_Settings::fallback_chain()` / `resolveResponsiveValue()` walk toward desktop |
| CSS helpers | `css_var_fallback_chain()` for nested `var()` on custom properties |
| Frontend | Resolved `settings` stay flat; variants emit as `data-e-settings-responsive` |

> **MCP:** `get-widget-schema` marks those props with `x-responsive: true` and exposes a reserved `settings_variants` key (`[{ breakpoint, props }]`). Desktop stays in `settings`. `get-page-structure` (include_content) and `manage-elements` / `build-composition` round-trip the same shape. This is **not** the legacy v3 `_tablet` / `_mobile` suffix pattern.

### PHP ↔ TypeScript mapping

| PHP | TS |
|-----|-----|
| `prop-types/*.php` | `editor-props/src/prop-types/*.ts` |
| `Prop_Type::to_json_schema()` | `propTypeToJsonSchema()` |
| `::make()` factory | `createPropUtils()` |

### Shared behaviors

- **Defaults** — `->default( $value )`
- **Required** — `->required()`; `null` fails when required
- **Dependencies** — `->set_dependencies( … )` for editor control visibility
- **Meta** — `->meta( $key, $value )` for editor/LLM hints
- **Persistence** — `should_persist()`: object/array drop empty inner values on sanitize

### Public API

| Symbol | Signature | Purpose |
|--------|-----------|---------|
| `Prop_Type::get_key()` | `static get_key(): string` | Type discriminator / `$$type` value |
| `Prop_Type::validate()` | `validate( $value ): bool` | Validate envelope + inner value |
| `Prop_Type::sanitize()` | `sanitize( $value )` | Normalize before persist |
| `Prop_Type::to_json_schema()` | `to_json_schema(): array` | JSON Schema for LLM/agents |
| `Plain_Prop_Type::make()` | `static make(): self` | Factory for plain types |
| `Union_Prop_Type::create_from()` | `static create_from( Transformable_Prop_Type $type ): self` | Promote type to union |
| `Responsive_Settings::enable()` | `static enable(): array` | Opt-in meta tuple for per-breakpoint settings |
| `Responsive_Settings::fallback_chain()` | `static fallback_chain( string $breakpoint ): string[]` | Cascade order toward desktop |
| `createPropUtils()` | `createPropUtils( key, valueSchema )` | TS factory with `.create()`, `.extract()`, `.isValid()` |
| `propTypeToJsonSchema()` | `propTypeToJsonSchema( propType, suppressDynamic? )` | TS JSON Schema export |

## Extension

### Add a global prop type

**PHP** — class under `prop-types/` extending the appropriate base; implement `get_key()`, `validate_value()`, `sanitize_value()`.

**TS** — matching file in `editor-props/src/prop-types/` using `createPropUtils()`.

### Extend a widget schema

```php
protected static function define_props_schema(): array {
    return [
        'badge_label' => String_Prop_Type::make()->default( 'New' ),
    ];
}
```

Via filter (per element type):

```php
add_filter( 'elementor/atomic-widgets/props-schema', function ( array $schema ) {
    $schema['my_extension_field'] = String_Prop_Type::make();
    return $schema;
} );
```

For style keys, use `elementor/atomic-widgets/styles/schema` — [style-schema.md](style-schema.md).

## Internals

`Prop_Types_Schema_Extender` is the base for modules that union-wrap existing types (dynamic tags, variables). Object types recursively validate shape fields; array types validate each item.

## See also

- [prop-value.md](prop-value.md)
- [style-schema.md](style-schema.md)
- [transformers.md](transformers.md)
- [../variables/types.md](../variables/types.md)
