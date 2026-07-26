# Transformers

> Audience: both
> Module: atomic-widgets
> Status: draft
> Related: [prop-value.md](prop-value.md), [prop-types.md](prop-types.md), [../atomic-widgets/rendering.md](../atomic-widgets/rendering.md), [../atomic-widgets/hooks.md](../atomic-widgets/hooks.md)

## What it is

**Transformers** convert validated PropValues into render-ready output — CSS declaration fragments, HTML attributes, resolved URLs, flattened multi-props, etc. They run inside **props resolvers** after schema-driven recursion into object/array shapes.

Registration is **per context** via `Transformers_Registry` and WordPress action hooks. Lookup is by prop type `get_key()` (the `$$type` string).

## When to use it

- Output for a prop type cannot be a simple passthrough of `value` (e.g. `size` → `"12px"`, `image` → attachment URL)
- Import/export needs to rewrite values (attachment IDs ↔ URLs)
- A transformer returns another transformable value that must be resolved again (chained transforms)

Use a **prop type** when you need validation, schema, and editor controls. Use a **transformer** when stored shape is correct but render/import/export representation differs.

## Key concepts

### Registry contexts

| Context | Resolver | Hook | Typical use |
|---------|----------|------|-------------|
| `settings` | `Render_Props_Resolver::for_settings()` | `elementor/atomic-widgets/settings/transformers/register` | Widget settings → Twig/template context |
| `styles` | `Render_Props_Resolver::for_styles()` | `elementor/atomic-widgets/styles/transformers/register` | Style props → CSS declarations |
| `import` | `Import_Export_Props_Resolver::for_import()` | `elementor/atomic-widgets/import/transformers/register` | Kit/template import rewriting |
| `export` | `Import_Export_Props_Resolver::for_export()` | `elementor/atomic-widgets/export/transformers/register` | Kit/template export rewriting |

Hooks are wired in `modules/atomic-widgets/module.php`. The resolver triggers registration lazily:

```php
do_action(
    "elementor/atomic-widgets/$context/transformers/register",
    $instance->get_transformers_registry(),
    $instance
);
```

(`$context` is `settings`, `styles`, `import`, or `export`.)

### Transformer vs prop type

| Concern | Prop type | Transformer |
|---------|-----------|-------------|
| JSON storage shape | Defines | Reads |
| Validation / sanitize | Yes | No |
| Editor JSON Schema | `to_json_schema()` | No |
| Render output | No | Yes |
| Import/export rewrite | No | Yes (import/export contexts) |

Example: `Size_Prop_Type` stores `{ size, unit }`; `Size_Transformer` (styles context) emits a CSS length string. `Link_Prop_Type` stores structured link data; `Link_Transformer` (settings) emits `href`/`target` for templates.

### `Render_Props_Resolver` depth

`Render_Props_Resolver` extends the base resolver with recursive `resolve_item()`:

1. `null` → `null`
2. Not transformable → return as-is
3. `disabled: true` → `null`
4. `depth >= TRANSFORM_DEPTH_LIMIT` (constant **3**) → `null` (loop guard)
5. `transform()` → if result is transformable, recurse with `depth + 1`

Each transformer may return a **new** `{ $$type, value }`, enabling multi-step pipelines (e.g. resolve nested object props, then run type transformer). `Import_Export_Props_Resolver` does **not** chain — single `transform()` pass per item.

### Fallback transformer

Settings context registers `Plain_Transformer` as **fallback** — returns `value` unchanged. Styles context registers type-specific transformers per key (`size`, `color`, `background`, `transform`, …) plus `Multi_Props_Transformer` for props that expand to multiple CSS keys.

### `Multi_Props`

Some transformers return `Multi_Props::make( [ 'key' => $val, … ] )`; the resolver merges these into the parent resolved array (used when one logical prop maps to several CSS properties).

## Extension

### Register a transformer

```php
add_action( 'elementor/atomic-widgets/styles/transformers/register', function ( $registry ) {
    $registry->register(
        'my-custom-type',  // must match prop type get_key()
        new My_Custom_Transformer()
    );
}, 20 );
```

Extend `Transformer_Base` and implement `transform( $value, Props_Resolver_Context $context )`. Use `$context->get_key()`, `get_prop_type()`, `is_disabled()`.

For import/export, register on the corresponding hook. Dynamic tags and variables modules append transformers on both `settings` and `styles` hooks.

Priority `10` is core defaults; use `20+` to override or extend.

## Internals

| PHP | Role |
|-----|------|
| `Props_Resolver` | Base: union dispatch, object/array recursion, `transform()` |
| `Render_Props_Resolver` | Settings/styles render; depth limit; `disabled` handling |
| `Import_Export_Props_Resolver` | Single-pass import/export |
| `Transformers_Registry` | `register()`, `register_fallback()`, `get()` |
| `Transformer_Base` | Abstract `transform()` |
| `Props_Resolver_Context` | Key, prop type, disabled flag |
| `Multi_Props` | Multi-key expand wrapper |

Core registrations in `module.php`: `register_settings_transformers()`, `register_styles_transformers()`, `register_import_transformers()`, `register_export_transformers()`.

## See also

- [prop-value.md](prop-value.md) — `disabled` and envelope shape
- [../atomic-widgets/rendering.md](../atomic-widgets/rendering.md) — Twig + CSS file pipeline
- [../dynamic-tags/binding-propvalues.md](../dynamic-tags/binding-propvalues.md) — dynamic transformer registration
- [../variables/usage-in-props.md](../variables/usage-in-props.md) — variable style transformers
