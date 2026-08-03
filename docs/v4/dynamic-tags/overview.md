# Dynamic tags overview

> Audience: both
> Module: `modules/dynamic-tags/` (v3) + `modules/atomic-widgets/dynamic-tags/` (v4 bridge)
> Related: [binding-propvalues.md](./binding-propvalues.md), [extending.md](./extending.md), [../architecture/overview.md](../architecture/overview.md)

## What it is

Dynamic tags let props resolve at render time from WordPress data (post title, author, featured image, etc.) instead of static values.

| Layer | Role |
|-------|------|
| **Legacy registry** (`modules/dynamic-tags/`, `core/dynamic-tags/`) | PHP tag classes extending `Tag` or `Data_Tag`; register on `elementor/dynamic_tags/register` |
| **Atomic bridge** (`modules/atomic-widgets/dynamic-tags/`) | Adapts registry into `$$type: dynamic` PropValues; extends prop schemas with `dynamic` union; resolves via transformer pipeline |

The bridge does **not** replace the legacy registry — every atomic binding calls `Plugin::$instance->dynamic_tags` to render.

## When to use it

- Bind atomic widget/style props to live data.
- Author element JSON where a field can be static or dynamic.
- Register new data sources as plugins via the legacy tag API (bridge picks up matching categories).

## Key concepts

### v3 tag registration

```php
add_action( 'elementor/dynamic_tags/register', function ( $dynamic_tags_manager ) {
    $dynamic_tags_manager->register( new My_Custom_Tag() );
} );
```

| Method | Purpose |
|--------|---------|
| `get_name()` | Unique tag id (e.g. `post-title`) |
| `get_title()` | Human label |
| `get_categories()` | Category strings (`text`, `url`, `image`, …) |
| `get_group()` | Editor grouping key |
| `register_controls()` | Tag settings |

Category constants on `Elementor\Modules\DynamicTags\Module`: `TEXT_CATEGORY`, `URL_CATEGORY`, `IMAGE_CATEGORY`, `NUMBER_CATEGORY`, `COLOR_CATEGORY`, `SVG_CATEGORY`, etc.

### v4 bridge components

| Class | Role |
|-------|------|
| `Dynamic_Tags_Module` | Singleton; wires filters and transformer registration |
| `Dynamic_Tags_Editor_Config` | Converts legacy tags to atomic editor shape |
| `Dynamic_Tags_Schemas` | Per-tag settings prop schemas from legacy controls |
| `Dynamic_Prop_Type` | Prop type key `dynamic` |
| `Dynamic_Prop_Types_Mapping` | Adds `dynamic` union to prop schemas by category |
| `Dynamic_Transformer` | Resolves dynamic PropValue at render time |

`Dynamic_Tags_Module::instance()->register_hooks()` called from `atomic-widgets/module.php`.

### Editor data flow

1. Legacy tags register → `Dynamic_Tags_Editor_Config::get_tags()` converts them.
2. Exposed as `atomicDynamicTags` in `elementor/editor/localize_settings`.
3. Prop schemas gain `dynamic` variant via `elementor/atomic-widgets/props-schema` and `elementor/atomic-widgets/styles/schema` filters.

Tags with unconvertible controls are excluded unless `force_convert_to_atomic` is set in `get_editor_config()` (see [extending.md](./extending.md)).

## Extension

See [extending.md](./extending.md) for registering tags and wiring custom prop types.

## Public API

| Symbol | Signature | Purpose | Source |
|--------|-----------|---------|--------|
| `Dynamic_Tags_Module` | `::instance()`, `::fresh()`, `register_hooks()` | Bridge bootstrap | `dynamic-tags-module.php` |
| `Dynamic_Tags_Module` | `get_dynamic_tag_names_by_categories( array $categories )` | Tags matching categories | `dynamic-tags-module.php` |
| `Dynamic_Tags_Editor_Config` | `get_tags(): array`, `get_tag( string $name )` | Atomic-converted tag registry | `dynamic-tags-editor-config.php` |
| `Dynamic_Tags_Schemas` | `get( string $tag_name )` | Per-tag settings schema | `dynamic-tags-schemas.php` |
| `Dynamic_Prop_Type` | `::get_key()`, `::ignore()`, `::is_dynamic_prop_value()` | Dynamic prop type | `dynamic-prop-type.php` |
| `Dynamic_Prop_Types_Mapping` | `::make()`, `get_extended_schema()` | Category → union injection | `dynamic-prop-types-mapping.php` |
| `Dynamic_Transformer` | `transform( $value, $key )` | Render-time resolution | `dynamic-transformer.php` |
| `Dynamic_Tags_Converter` | `convert_control_to_prop_type( array $control )` | Legacy control → prop type | `dynamic-tags-converter.php` |
| `Module` (v3) | `TEXT_CATEGORY`, `URL_CATEGORY`, … | Category constants | `modules/dynamic-tags/module.php` |

**Filters:** `elementor/atomic-widgets/props-schema`, `elementor/atomic-widgets/styles/schema` — extended by `Dynamic_Prop_Types_Mapping`.

## Internals

- **Control conversion** — `Dynamic_Tags_Converter` maps legacy controls to prop types for settings schemas.
- **Render** — `Dynamic_Transformer` resolves settings via `Render_Props_Resolver`, then `get_tag_data_content()`.
- **LLM** — `Dynamic_Tag_Llm_Resolver` (PHP MCP) and `dynamicTagLLMResolver` (editor) inject `group` and wrap plain settings.
- **Import/export** — `ImportExport\Dynamic_Transformer` fills `group` when missing.

## See also

- [binding-propvalues.md](./binding-propvalues.md) — PropValue JSON shape
- [discovery.md](./discovery.md) — MCP discovery
- [extending.md](./extending.md) — plugin extension guide
- [../fundamentals/transformers.md](../fundamentals/transformers.md) — transformer registry
