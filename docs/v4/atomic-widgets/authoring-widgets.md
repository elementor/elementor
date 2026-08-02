# Authoring atomic widgets and elements

> Audience: both
> Module: `modules/atomic-widgets/elements/`
> Status: final
> Related: [../fundamentals/prop-value.md](../fundamentals/prop-value.md), [../fundamentals/prop-types.md](../fundamentals/prop-types.md), [hooks.md](hooks.md), [rendering.md](rendering.md)

## What it is

The **primary** guide for creating atomic types. Core built-ins and third-party extenders use the same API: extend `Atomic_Widget_Base` or `Atomic_Element_Base`, declare schema + controls, optionally add Twig templates and base styles, then register with Elementor's widget/element managers.

## When to use it

- Adding a new v4 widget or container element
- Extending an existing type's props schema or editor controls
- Matching conventions used by built-ins like `Atomic_Heading`

## Key concepts

### Base classes

| Class | Use for | Key methods |
|-------|---------|-------------|
| `Atomic_Widget_Base` | Leaf widgets (`e-heading`, `e-button`) | `define_props_schema()`, `define_atomic_controls()`, `get_element_type()` |
| `Atomic_Element_Base` | Containers / structure (`e-flexbox`, `e-tabs`) | Same + `define_allowed_child_types()`, `define_default_children()`, `define_default_html_tag()` |

Both use traits `Has_Atomic_Base` (schema, controls, save) and `Has_Meta` (e.g. `is_container`). Widgets add `Has_Template` for Twig `render()`.

`get_props_schema()` wraps `define_props_schema()` with the `elementor/atomic-widgets/props-schema` filter and auto-injects `_cssid`.

### Props schema

Return an array of `Prop_Type` instances keyed by setting name:

```php
protected static function define_props_schema(): array {
    return [
        'classes' => Classes_Prop_Type::make()->default( [] ),
        'title'   => Html_V3_Prop_Type::make()
            ->default( [ 'content' => String_Prop_Type::generate( 'Hello' ), 'children' => [] ] )
            ->description( 'Heading text.' ),
        'link'    => Link_Prop_Type::make(),
    ];
}
```

PropValues use `{ $$type, value }` — see [../fundamentals/prop-value.md](../fundamentals/prop-value.md). Use `->meta()`, `->default()`, `->enum()`, `->alias()` on prop types as needed.

### Atomic controls

`define_atomic_controls()` returns `Section` trees with controls bound via `ControlClass::bind_to( 'prop_key' )`. Every control must bind to a key in the props schema.

Built-in control types (from `controls/types/`):

`text`, `textarea`, `number`, `select`, `toggle`, `switch`, `size`, `link`, `image`, `svg-media`, `video`, `html-tag`, `inline-editing`, `chips`, `repeatable`, `date-time`, `date-range`, `time-range`, `query`, `query-chips`, `query-filter-repeater`, `attachment-type`, `email` (form email-action), `tabs`

Filter controls per widget: `elementor/atomic-widgets/controls`.

### Base styles

Override `define_base_styles()` to return `Style_Definition` maps (see `Atomic_Heading`). Keys become CSS class suffixes via `get_base_styles_dictionary()`.

### Twig rendering (widgets)

Use `Has_Template`, implement `get_templates()` returning name → path, and provide a `.html.twig` file. Shared macros live in `elements/base/_macros.html.twig` (`elementor/macros`). See [rendering.md](rendering.md).

### Container metadata

Container elements call `$this->meta( 'is_container', true )` in the constructor. Override `define_allowed_child_types()` to restrict children (empty array = unrestricted). Use `define_default_children()` for required structure (tabs, forms).

## Extension

### Register a widget

Hook `elementor/widgets/register` (action — fired via `do_action` in `Widgets_Manager`):

```php
add_action( 'elementor/widgets/register', function ( \Elementor\Widgets_Manager $manager ) {
    $manager->register( new My_Atomic_Widget() );
} );
```

`My_Atomic_Widget` extends `Atomic_Widget_Base`, implements `get_element_type()` (e.g. `'e-my-widget'`), `get_title()`, `get_icon()`, and the abstract schema/controls methods.

### Register an element

Hook `elementor/elements/elements_registered`:

```php
add_action( 'elementor/elements/elements_registered', function ( \Elementor\Elements_Manager $manager ) {
    $manager->register_element_type( new My_Container() );
} );
```

`My_Container` extends `Atomic_Element_Base`, implements `get_type()` and `get_element_type()` (same string).

### Extend schema without subclassing

```php
add_filter( 'elementor/atomic-widgets/props-schema', function ( array $schema ) {
  $schema['my_prop'] = String_Prop_Type::make();
  return $schema;
} );
```

The filter receives only `$schema` (no element instance or class name) — it runs on every `get_props_schema()` call. Prefer a dedicated subclass for type-specific props; use the filter for cross-cutting unions (dynamic tags extend all schemas this way).

### Programmatic element trees

`Widget_Builder::make( 'e-heading' )` and `Element_Builder::make( 'e-flexbox' )` build JSON element data for tests, defaults, and MCP — see `elements/base/widget-builder.php`.

## Internals

- Schema validation on save: `Props_Parser` / `Style_Parser` in `Has_Atomic_Base::get_data_for_save()`
- Editor config: `get_initial_config()` exposes `atomic`, `atomic_props_schema`, `atomic_controls`, `base_styles`, Twig template contents
- Category: `get_categories()` / `define_panel_categories()` return `['v4-elements']`
- Legacy v3 `get_controls()` stack is intentionally empty for atomic types

## See also

- [elements-catalog.md](elements-catalog.md) — snapshot of built-in types (secondary)
- [hooks.md](hooks.md) — transformers and style hooks
- [../fundamentals/prop-types.md](../fundamentals/prop-types.md)
- [../dynamic-tags/extending.md](../dynamic-tags/extending.md)
