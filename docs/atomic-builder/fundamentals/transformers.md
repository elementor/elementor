# Transformers

> Audience: both
> Module: atomic-widgets
> Related: [prop-value.md](prop-value.md), [prop-types.md](prop-types.md), [../atomic-widgets/rendering.md](../atomic-widgets/rendering.md), [../atomic-widgets/hooks.md](../atomic-widgets/hooks.md)

## What it is

**Transformers** convert validated PropValues into render-ready output — CSS fragments, HTML attributes, resolved URLs, etc. They run inside **props resolvers** after schema-driven recursion into object/array shapes.

Registration is **per context** via `Transformers_Registry`. Lookup is by prop type `get_key()` (the `$$type` string).

## When to use it

- Render output differs from stored shape (e.g. `size` → `"12px"`, `image` → URL)
- Import/export needs value rewriting
- Transformer returns another transformable value for chained resolution

Use a **prop type** for validation/schema. Use a **transformer** when stored shape is correct but render representation differs.

## Key concepts

### Registry contexts

| Context | Resolver | Hook |
|---------|----------|------|
| `settings` | `Render_Props_Resolver::for_settings()` | `elementor/atomic-widgets/settings/transformers/register` |
| `styles` | `Render_Props_Resolver::for_styles()` | `elementor/atomic-widgets/styles/transformers/register` |
| `import` | `Import_Export_Props_Resolver::for_import()` | `elementor/atomic-widgets/import/transformers/register` |
| `export` | `Import_Export_Props_Resolver::for_export()` | `elementor/atomic-widgets/export/transformers/register` |
| `plain` | `Plain_Values_Resolver` | `elementor/atomic-widgets/plain/transformers/register` |

Hooks wired in `module.php`. Resolver triggers registration lazily via `do_action( "elementor/atomic-widgets/$context/transformers/register", $registry, $instance )`.

### Transformer vs prop type

| Concern | Prop type | Transformer |
|---------|-----------|-------------|
| Storage shape | Defines | Reads |
| Validation | Yes | No |
| JSON Schema | `to_json_schema()` | No |
| Render output | No | Yes |
| Import/export | No | Yes (import/export contexts) |

### `Render_Props_Resolver` depth

1. `null` → `null`
2. Not transformable → return as-is
3. `disabled: true` → `null`
4. `depth >= TRANSFORM_DEPTH_LIMIT` (3) → `null`
5. `transform()` → if result is transformable, recurse

`Import_Export_Props_Resolver` does single-pass (no depth recursion).

### Fallback and multi-props

Both settings and styles register `Plain_Transformer` as fallback. `Multi_Props::generate()` lets one transformer expand to multiple CSS keys.

### Public API

| Symbol | Signature | Purpose |
|--------|-----------|---------|
| `Transformers_Registry::register()` | `register( string $key, Transformer_Base $t ): self` | Register by `$$type` key |
| `Transformers_Registry::register_fallback()` | `register_fallback( Transformer_Base $t ): self` | Default when no match |
| `Transformer_Base::transform()` | `transform( $value, Props_Resolver_Context $context )` | Implement conversion |
| `Render_Props_Resolver::resolve()` | `resolve( array $schema, array $props ): array` | Resolve full props map |
| `Render_Props_Resolver::for_settings()` | `static for_settings(): self` | Settings context factory |
| `Render_Props_Resolver::for_styles()` | `static for_styles(): self` | Styles context factory |
| `Multi_Props::generate()` | `static generate( $value ): array` | Wrap multi-key expand result |
| `Props_Resolver_Context::make()` | `static make(): self` | Builder for transformer context |

## Extension

```php
add_action( 'elementor/atomic-widgets/styles/transformers/register', function ( $registry ) {
    $registry->register( 'my-custom-type', new My_Custom_Transformer() );
}, 20 );
```

Extend `Transformer_Base`. Use `$context->get_key()`, `get_prop_type()`, `is_disabled()`. Priority `10` = core defaults; use `20+` to override.

## Internals

Core registrations in `module.php`: `register_settings_transformers()`, `register_styles_transformers()`, `register_import_transformers()`, `register_export_transformers()`, `register_plain_transformers()`.

## See also

- [prop-value.md](prop-value.md)
- [../atomic-widgets/rendering.md](../atomic-widgets/rendering.md)
- [../dynamic-tags/binding-propvalues.md](../dynamic-tags/binding-propvalues.md)
- [../variables/usage-in-props.md](../variables/usage-in-props.md)
