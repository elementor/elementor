# Style schema

> Audience: both
> Module: atomic-widgets
> Status: final
> Related: [prop-types.md](prop-types.md), [../variables/usage-in-styles.md](../variables/usage-in-styles.md), [../global-classes/applying-classes.md](../global-classes/applying-classes.md), [../css-converter/extension.md](../css-converter/extension.md)

## What it is

`Style_Schema` (`modules/atomic-widgets/styles/style-schema.php`) is the **canonical map of CSS property keys** to prop types for v4 atomic styling. It answers: "which longhand CSS keys can appear in a style variant's `props`, and what type is each one?"

Retrieved via `Style_Schema::get()`, which applies the `elementor/atomic-widgets/styles/schema` filter. The filtered schema is also exposed to the editor as `settings.atomic.styles_schema`.

## When to use it

- Adding or constraining a styleable CSS property for elements, local styles, or global classes
- Understanding which value shapes the CSS converter must produce
- Configuring prop dependencies that hide/disable controls in the style panel
- Knowing where variable and dynamic-tag unions are injected

## Key concepts

### Canonical keys (snapshot by group)

Keys are merged from private group methods in `get_style_schema()`. Grouping:

| Group | Example keys |
|-------|--------------|
| Size | `width`, `height`, `min-width`, `max-height`, `overflow`, `aspect-ratio`, `object-fit`, `object-position` |
| Position | `position`, `inset-*`, `z-index`, `scroll-margin-top` |
| Typography | `font-family`, `font-size`, `font-weight`, `color`, `line-height`, `text-align`, `stroke`, … |
| Spacing | `padding`, `margin` (each a union of `dimensions` \| `size`) |
| Border | `border-radius`, `border-width`, `border-color`, `border-style`, `outline-*` |
| Background | `background` (nested `Background_Prop_Type` shape) |
| Effects | `box-shadow`, `opacity`, `filter`, `backdrop-filter`, `transform`, `transition`, `mix-blend-mode` |
| Layout | `display`, `flex-direction`, `gap`, `flex`, `grid-template-*`, `grid-auto-*`, `grid-column`, `grid-row` |
| Alignment | `justify-content`, `align-items`, `align-self`, `order`, … |
| Special | `content`, `appearance`, `clip-path` |

This table is a **snapshot** — grep `style-schema.php` for the authoritative list.

### Dependencies

Prop types carry `dependencies` arrays evaluated by the editor (`editor-props` dependency utils). Example from source — `object-position` is only relevant when `object-fit` exists and is not `fill`:

```php
'object-position' => Union_Prop_Type::make()
    ->add_prop_type( String_Prop_Type::make()->enum( Position_Prop_Type::get_position_enum_values() ) )
    ->add_prop_type( Position_Prop_Type::make() )
    ->set_dependencies(
        Dependency_Manager::make( Dependency_Manager::RELATION_AND )
            ->where( [ 'operator' => 'ne', 'path' => [ 'object-fit' ], 'value' => 'fill' ] )
            ->where( [ 'operator' => 'exists', 'path' => [ 'object-fit' ] ] )
            ->get()
    ),
```

Non-`static` `position` unlocks `inset-*` size props. `column-count >= 1` unlocks `column-gap`.

### Dependencies and overridable settings

Editor dependency evaluation (`isDependencyMet` / `extractValue` in `@elementor/editor-props`) unwraps `overridable` envelopes when reading **affecting** props — it compares against `origin_value`, including nested object paths. Cascade reset/restore (`getUpdatedValues` in `editor-editing-panel`) rewraps values via `rewrapOverridableValue`.

Some core widgets still ship with dependencies commented out where overridable behavior is not yet verified end-to-end on component instances (e.g. `poster` → `poster_enabled` in `atomic-self-hosted-video.php`). Test cross-prop dependencies on component instances before relying on them in custom widgets.

### Breakpoint variants

Style data is stored per style definition as an array of **variants** (`Style_Definition` → `Style_Variant`):

```json
{
  "variants": [
    {
      "meta": { "breakpoint": "desktop", "state": null },
      "props": { "color": { "$$type": "color", "value": "#333" } }
    },
    {
      "meta": { "breakpoint": "mobile", "state": "hover" },
      "props": { "color": { "$$type": "color", "value": "#wc26-gold" } }
    }
  ]
}
```

- `meta.breakpoint` — key from Elementor breakpoints config (`desktop`, `tablet`, `mobile`, …)
- `meta.state` — pseudo-state (`hover`, `focus`, …) or `null` for default
- `props` — map of **style schema keys** to PropValues

`Atomic_Styles_Manager` renders CSS per breakpoint media query from these variants. Global classes use the same variant structure — see [../global-classes/data-model.md](../global-classes/data-model.md).

### Variable unions

The variables module augments color (and related) schema entries via `elementor/atomic-widgets/styles/schema`:

- `Color_Prop_Type` → union with `global-color-variable`
- `font-family` → union with `global-font-variable`
- Size-related keys augmented by `Size_Style_Schema`

Augmentation is recursive through object shapes and array item types (`Variables\Classes\Style_Schema::augment()`). Dynamic tags use a parallel path (`Dynamic_Prop_Types_Mapping::get_extended_style_schema()`) for color fields in nested shapes.

## Extension

### Add a new styleable CSS key

```php
add_filter( 'elementor/atomic-widgets/styles/schema', function ( array $schema ) {
    $schema['my-custom-longhand'] = Size_Prop_Type::make()
        ->units( Size_Constants::spacing() )
        ->description( 'Custom longhand for my addon' );
    return $schema;
} );
```

Also register:

1. A **styles transformer** if the prop type key needs custom CSS output — `elementor/atomic-widgets/styles/transformers/register`
2. A **CSS converter** if agents may set the property via raw CSS — see [../css-converter/extension.md](../css-converter/extension.md); `covered_properties()` must align with your schema key

For widget-level settings (not style variants), use `elementor/atomic-widgets/props-schema` instead.

## Internals

| PHP | Role |
|-----|------|
| `Style_Schema::get()` | Filter entry point |
| `Style_Schema::get_style_schema()` | Unfiltered canonical map |
| `PropDependencies\Manager` | Builds dependency term trees |
| `Style_Variant::build()` | `{ meta: { breakpoint, state }, props }` |
| `modules/variables/hooks.php` | Two `styles/schema` filters for variable unions |

Editor: `settings.atomic.styles_schema` serialized prop types; `editor-styles` / `editor-styles-repository` consume variants.

## See also

- [prop-types.md](prop-types.md) — prop type taxonomy
- [transformers.md](transformers.md) — `styles` context transformers
- [../variables/usage-in-styles.md](../variables/usage-in-styles.md) — `var(--label)` in raw CSS vs typed variable props
- [validation.md](validation.md) — `Props_Parser` validates style props against this schema
