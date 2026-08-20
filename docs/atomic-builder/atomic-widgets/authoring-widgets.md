# Authoring atomic widgets and elements

> Audience: both
> Module: `modules/atomic-widgets/elements/`
> Related: [../fundamentals/prop-value.md](../fundamentals/prop-value.md), [../fundamentals/prop-types.md](../fundamentals/prop-types.md), [hooks.md](hooks.md), [rendering.md](rendering.md)

## What it is

Guide for creating atomic types: extend `Atomic_Widget_Base` or `Atomic_Element_Base`, declare schema + controls, optionally add Twig templates and base styles, then register with Elementor's widget/element managers.

## When to use it

- Adding a new v4 widget or container element
- Extending props schema or editor controls
- Matching conventions used by built-ins like `Atomic_Heading`

## Key concepts

### Base classes

| Class | Use for | Override |
|-------|---------|----------|
| `Atomic_Widget_Base` | Leaf widgets | `define_props_schema()`, `define_atomic_controls()`, `get_element_type()` |
| `Atomic_Element_Base` | Containers | Same + `define_allowed_child_types()`, `define_default_children()`, `define_default_html_tag()` |

Widgets add `Has_Template` for Twig `render()`. Containers call `$this->meta( 'is_container', true )` in the constructor.

### Props schema

```php
protected static function define_props_schema(): array {
    return [
        'classes' => Classes_Prop_Type::make()->default( [] ),
        'title'   => Html_V3_Prop_Type::make()
            ->default( [ 'content' => String_Prop_Type::generate( 'Hello' ), 'children' => [] ] ),
        'link'    => Link_Prop_Type::make(),
    ];
}
```

PropValues use `{ $$type, value }` — see [../fundamentals/prop-value.md](../fundamentals/prop-value.md).

### Atomic controls

`define_atomic_controls()` returns `Section` trees with controls bound via `ControlClass::bind_to( 'prop_key' )`. Every control must bind to a schema key.

Built-in control types: `text`, `textarea`, `number`, `select`, `toggle`, `switch`, `size`, `link`, `image`, `svg-media`, `video`, `html-tag`, `inline-editing`, `chips`, `repeatable`, `date-time`, `date-range`, `time-range`, `query`, `query-chips`, `query-filter-repeater`, `attachment-type`, `email`, `tabs`.

Filter: `elementor/atomic-widgets/controls`.

### Base styles

Override `define_base_styles()` to return `Style_Definition` maps. Keys become CSS class suffixes via `get_base_styles_dictionary()`.

### Twig rendering (widgets)

Use `Has_Template`, implement `get_templates()`, provide `.html.twig` files. Shared macros: `elements/base/_macros.html.twig` (`elementor/macros`).

### Container metadata

`define_allowed_child_types()` — whitelist child types; **empty array = any child allowed**. `define_default_children()` for required structure (tabs, forms).

## Public API

| Symbol | Signature | Purpose |
|--------|-----------|---------|
| `Atomic_Widget_Base` | `abstract protected static function define_props_schema(): array` | Widget schema declaration |
| `Atomic_Widget_Base` | `abstract protected function define_atomic_controls(): array` | Widget control tree |
| `Atomic_Widget_Base` | `abstract public static function get_element_type(): string` | Type id (e.g. `e-my-widget`) |
| `Atomic_Widget_Base` | `public static function generate()` | `Widget_Builder::make( static::get_element_type() )` |
| `Atomic_Element_Base` | `protected function define_allowed_child_types(): array` | Child type whitelist (default `[]` = unrestricted) |
| `Atomic_Element_Base` | `protected function define_default_children(): array` | Required default child tree |
| `Atomic_Element_Base` | `public static function generate()` | `Element_Builder::make( static::get_type() )` |
| `Has_Atomic_Base` | `public static function get_props_schema(): array` | Schema with `_cssid` injection + filter |
| `Has_Atomic_Base` | `public function get_atomic_controls(): array` | Validated, filtered control tree |
| `Widget_Builder` | `public static function make( string $widget_type ): self` | Fluent builder for test/MCP element JSON |
| `Element_Builder` | `public static function make( string $element_type ): self` | Fluent builder for container element JSON |
| `Plain_Prop_Type` | `public static function make(): static` | Create prop type instance |
| `Transformable_Prop_Type` | `public static function generate( $value, bool $disable = false ): array` | Create PropValue |

Source: `elements/base/atomic-widget-base.php`, `atomic-element-base.php`, `has-atomic-base.php`, `widget-builder.php`, `element-builder.php`, `prop-types/base/plain-prop-type.php`.

## Extension

### Register a widget

```php
add_action( 'elementor/widgets/register', function ( \Elementor\Widgets_Manager $manager ) {
    $manager->register( new My_Atomic_Widget() );
} );
```

### Register an element

```php
add_action( 'elementor/elements/elements_registered', function ( \Elementor\Elements_Manager $manager ) {
    $manager->register_element_type( new My_Container() );
} );
```

### Extend schema without subclassing

```php
add_filter( 'elementor/atomic-widgets/props-schema', function ( array $schema ) {
    $schema['my_prop'] = String_Prop_Type::make();
    return $schema;
} );
```

Filter receives only `$schema` (no element instance). Prefer subclassing for type-specific props.

## Internals

- Save validation: `Props_Parser` / `Style_Parser` in `get_data_for_save()`
- Editor config: `get_initial_config()` exposes `atomic`, `atomic_props_schema`, `atomic_controls`, `base_styles`
- Category: `['v4-elements']`
- Legacy v3 `get_controls()` returns `[]` for atomic types

## See also

- [elements-catalog.md](elements-catalog.md) — built-in type snapshot
- [hooks.md](hooks.md) — transformers and style hooks
- [../fundamentals/prop-types.md](../fundamentals/prop-types.md)
- [../dynamic-tags/extending.md](../dynamic-tags/extending.md)
