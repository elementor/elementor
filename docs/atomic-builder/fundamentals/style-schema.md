# Style schema

> Audience: both
> Module: atomic-widgets
> Related: [prop-types.md](prop-types.md), [../variables/usage-in-styles.md](../variables/usage-in-styles.md), [../global-classes/applying-classes.md](../global-classes/applying-classes.md), [../css-converter/extension.md](../css-converter/extension.md)

## What it is

`Style_Schema` (`styles/style-schema.php`) is the **canonical map of CSS property keys** to prop types. It answers: which longhand keys can appear in a style variant's `props`, and what type is each?

Retrieved via `Style_Schema::get()` (applies `elementor/atomic-widgets/styles/schema` filter). Localized to the editor as `settings.atomic.styles_schema`.

## When to use it

- Adding or constraining a styleable CSS property
- Understanding CSS converter output shapes
- Configuring prop dependencies for the style panel
- Knowing where variable/dynamic-tag unions are injected

## Key concepts

### Canonical keys (snapshot by group)

| Group | Example keys |
|-------|--------------|
| Size | `width`, `height`, `min-width`, `overflow`, `aspect-ratio`, `object-fit` |
| Position | `position`, `inset-*`, `z-index` |
| Typography | `font-family`, `font-size`, `font-weight`, `color`, `line-height`, `text-align` |
| Spacing | `padding`, `margin` (union: `dimensions` \| `size`) |
| Border | `border-radius`, `border-width`, `border-color`, `border-style` |
| Background | `background` (nested `Background_Prop_Type`) |
| Effects | `box-shadow`, `opacity`, `filter`, `transform`, `transition` |
| Layout | `display`, `flex-direction`, `gap`, `grid-template-*`, `grid-column` |
| Alignment | `justify-content`, `align-items`, `align-self`, `order` |

Grep `style-schema.php` for the authoritative list.

### Dependencies

Prop types carry `dependencies` arrays evaluated by editor-props (`isDependencyMet`, `extractValue`). Example: `object-position` requires `object-fit` exists and ≠ `fill`.

Editor dependency evaluation unwraps `overridable` envelopes when reading affecting props (`rewrapOverridableValue` on cascade).

### Breakpoint variants

```json
{
  "variants": [
    { "meta": { "breakpoint": "desktop", "state": null },
      "props": { "color": { "$$type": "color", "value": "#333" } } },
    { "meta": { "breakpoint": "mobile", "state": "hover" },
      "props": { "color": { "$$type": "color", "value": "#wc26-gold" } } }
  ]
}
```

- `meta.breakpoint` — from Elementor breakpoints config
- `meta.state` — pseudo-state (`hover`, `focus`) or `null`
- `props` — style schema keys → PropValues

### Variable unions

Variables module augments schema via `elementor/atomic-widgets/styles/schema`:

- `color` → union with `global-color-variable`
- `font-family` → union with `global-font-variable`
- Size keys via `Size_Style_Schema`

Augmentation is recursive through object shapes and array item types.

### Public API

| Symbol | Signature | Purpose |
|--------|-----------|---------|
| `Style_Schema::get()` | `static get(): array` | Filtered schema map (`style-schema.php`) |
| `Style_Schema::get_style_schema()` | `static get_style_schema(): array` | Unfiltered canonical map |
| `getStylesSchema()` | `getStylesSchema(): Record<string, PropType>` | Read localized schema in editor (`editor-styles`) |
| `isExistingStyleProperty()` | `isExistingStyleProperty( property: string ): boolean` | Check if key exists in schema |
| `getVariantByMeta()` | `getVariantByMeta( variants, meta )` | Find variant by breakpoint/state (`editor-styles`) |

## Extension

```php
add_filter( 'elementor/atomic-widgets/styles/schema', function ( array $schema ) {
    $schema['my-custom-longhand'] = Size_Prop_Type::make()
        ->units( Size_Constants::spacing() );
    return $schema;
} );
```

Also register:

1. **Styles transformer** if custom CSS output needed — `elementor/atomic-widgets/styles/transformers/register`
2. **CSS converter** if agents set via raw CSS — [../css-converter/extension.md](../css-converter/extension.md)

For widget settings (not style variants), use `elementor/atomic-widgets/props-schema`.

## Internals

`PropDependencies\Manager` builds dependency term trees. `Style_Variant::build()` creates `{ meta, props }`. Variables hooks register two `styles/schema` filters.

## See also

- [prop-types.md](prop-types.md)
- [transformers.md](transformers.md)
- [../variables/usage-in-styles.md](../variables/usage-in-styles.md)
- [validation.md](validation.md)
