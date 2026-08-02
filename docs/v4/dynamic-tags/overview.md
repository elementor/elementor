# Dynamic tags overview

> Audience: both
> Module: `modules/dynamic-tags/` (v3) + `modules/atomic-widgets/dynamic-tags/` (v4 bridge)
> Status: final
> Related: [binding-propvalues.md](./binding-propvalues.md), [extending.md](./extending.md), [../architecture/overview.md](../architecture/overview.md)

## What it is

Dynamic tags let element props resolve at render time from WordPress data (post title, author, featured image, etc.) instead of a static value. Elementor has two cooperating layers:

1. **Legacy (v3) registry** — `modules/dynamic-tags/` and `core/dynamic-tags/`. Tags are PHP classes extending `Elementor\Core\DynamicTags\Tag` (or `Data_Tag`). They declare categories, a group, and controls. `Tag` subclasses implement `render()`; `Data_Tag` subclasses implement `get_value()`. The manager resolves output via `get_tag_data_content()`.
2. **Atomic (v4) bridge** — `modules/atomic-widgets/dynamic-tags/`. Adapts the legacy registry into atomic PropValues (`$$type: dynamic`), extends widget/style prop schemas with a `dynamic` union variant, and resolves values through the props transformer pipeline.

The bridge does **not** replace the legacy registry. Every atomic dynamic binding ultimately calls `Plugin::$instance->dynamic_tags` to render tag content.

## When to use it

- **Binding a prop to live data** on an atomic widget or style (heading text, image `src`, link URL, color).
- **Authoring or integrating** element JSON where a field can be static or dynamic.
- **Registering a new data source** as a plugin — still done through the legacy tag API; the bridge picks it up automatically when categories match.

## Key concepts

### v3 tag registration

Legacy tags register on the `elementor/dynamic_tags/register` action. The manager's `register()` method accepts a `Base_Tag` instance:

```php
add_action( 'elementor/dynamic_tags/register', function ( $dynamic_tags_manager ) {
    $dynamic_tags_manager->register( new My_Custom_Tag() );
} );
```

Each tag class implements:

| Method | Purpose |
|--------|---------|
| `get_name()` | Unique tag id (e.g. `post-title`) |
| `get_title()` | Human label shown in the editor |
| `get_categories()` | One or more category strings (e.g. `text`, `url`, `image`) |
| `get_group()` | Editor grouping key (e.g. `post`, `site`) — registered via `register_group()` |
| `register_controls()` | Tag settings (select, text, query, etc.) |

Category constants live on `Elementor\Modules\DynamicTags\Module`: `TEXT_CATEGORY`, `URL_CATEGORY`, `IMAGE_CATEGORY`, `NUMBER_CATEGORY`, `COLOR_CATEGORY`, `SVG_CATEGORY`, and others.

Groups are a **legacy editor concept**. Tag classes return a group string; modules register group metadata with `Plugin::$instance->dynamic_tags->register_group( $name, $settings )`.

### v4 bridge components

| Class | Role |
|-------|------|
| `Dynamic_Tags_Module` | Singleton; wires filters and transformer registration |
| `Dynamic_Tags_Editor_Config` | Converts legacy tag config to atomic editor shape (`atomic_controls`, `props_schema`) |
| `Dynamic_Tags_Schemas` | Builds per-tag settings prop schemas from legacy controls |
| `Dynamic_Prop_Type` | Prop type key `dynamic`; defines the `{ $$type, value: { name, settings } }` shape |
| `Dynamic_Prop_Types_Mapping` | Extends prop schemas with a `dynamic` union member based on prop type → category mapping |
| `Dynamic_Transformer` | Resolves a dynamic PropValue to rendered tag output at render time |

`Dynamic_Tags_Module::instance()->register_hooks()` is called from `modules/atomic-widgets/module.php` when atomic widgets load.

### Editor data flow

1. Legacy tags register → `Dynamic_Tags_Editor_Config::get_tags()` converts them.
2. Converted tags are exposed to the editor via `atomicDynamicTags` in `elementor/editor/localize_settings`.
3. Prop schemas gain a `dynamic` variant through the `elementor/atomic-widgets/props-schema` and `elementor/atomic-widgets/styles/schema` filters (both use `Dynamic_Prop_Types_Mapping`).

Tags whose controls cannot be converted to atomic controls are **excluded** from the atomic registry unless `force_convert_to_atomic` is present in the tag's `get_editor_config()` output (see [extending.md](./extending.md)).

## Extension

See [extending.md](./extending.md) for registering a new legacy tag and ensuring it maps to the correct atomic prop types.

## Internals

- **Control conversion** — `Dynamic_Tags_Editor_Config` maps legacy controls to atomic editor controls for the picker; `Dynamic_Tags_Schemas` uses `Dynamic_Tags_Converter` to map the same control types to prop types for settings schemas. Unsupported control types block inclusion unless `force_convert_to_atomic` is set in `get_editor_config()`.
- **Render resolution** — `Dynamic_Transformer::transform()` resolves tag `settings` through `Render_Props_Resolver`, then calls `Dynamic_Tags_Manager::get_tag_data_content()`.
- **LLM normalization** — `Dynamic_Tag_Llm_Resolver` (PHP MCP) and `dynamicTagLLMResolver` (in-editor) inject `group` from the registry and wrap plain settings into PropValues.
- **Import/export** — `ImportExport\Dynamic_Transformer` fills in `group` from the tag registry when missing (see [binding-propvalues.md](./binding-propvalues.md)).
- **LLM schema** — `LLM_Schema_Dedupe_Filter` runs on `elementor/atomic-widgets/llm-json-schema` to keep dynamic union schemas concise for agents.

## See also

- [binding-propvalues.md](./binding-propvalues.md) — PropValue JSON shape
- [discovery.md](./discovery.md) — MCP discovery of available tags
- [extending.md](./extending.md) — plugin extension guide
- [../fundamentals/transformers.md](../fundamentals/transformers.md) — transformer registry contexts
- [developers.elementor.com](https://developers.elementor.com) — legacy dynamic tag authoring (v3 widget API)
