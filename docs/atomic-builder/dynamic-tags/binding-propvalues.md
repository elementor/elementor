# Binding dynamic PropValues

> Audience: both
> Module: `modules/atomic-widgets/dynamic-tags/dynamic-prop-type.php`
> Related: [overview.md](./overview.md), [discovery.md](./discovery.md), [../fundamentals/prop-value.md](../fundamentals/prop-value.md)

## What it is

In atomic element JSON, a dynamic binding is a PropValue with `$$type: "dynamic"` — a reference to a legacy dynamic tag plus settings.

Class: `Elementor\Modules\AtomicWidgets\DynamicTags\Dynamic_Prop_Type` (key: `dynamic`).

## When to use it

- Widget prop or style field supports dynamics (union includes `dynamic`).
- Composing JSON by hand, REST, or MCP.
- Live WordPress data at render time instead of static values.

## Key concepts

### PropValue shape

```json
{
  "$$type": "dynamic",
  "value": {
    "name": "post-title",
    "settings": { "before": "", "after": "" }
  }
}
```

| Field | Required | Description |
|-------|----------|-------------|
| `$$type` | yes | `"dynamic"` |
| `value.name` | yes | Tag name from registry ([discovery.md](./discovery.md)) |
| `value.settings` | yes (after normalization) | Tag settings; use `{}` when none |
| `disabled` | no | Standard PropValue flag |

Build in PHP:

```php
Dynamic_Prop_Type::generate( [
    'name' => 'post-title',
    'group' => 'post',
    'settings' => [ 'before' => 'Hello ' ],
] );
```

### Root-level vs nested

**Root-level** — entire prop is dynamic:

```json
"title": { "$$type": "dynamic", "value": { "name": "post-title", "settings": {} } }
```

**Nested** — one field within an object (e.g. image `src`):

```json
"image": {
  "$$type": "image",
  "value": {
    "src": { "$$type": "dynamic", "value": { "name": "post-featured-image", "settings": {} } },
    "size": { "$$type": "string", "value": "full" }
  }
}
```

### Settings shape

Stored JSON uses full PropValues in `settings`. MCP/agent authoring often sends **plain values** — resolvers normalize them.

`fallback` is omitted from LLM schemas (`Dynamic_Tag_Llm_Resolver::OMITTED_SETTING_KEYS`). Look up keys via [discovery.md](./discovery.md).

### `group` field

**Author-facing shape omits `group`** — bind with `name` + `settings` only. Resolvers inject `group` from the registry before persistence:

- In-editor: `dynamicTagLLMResolver`
- PHP MCP: `Dynamic_Tag_Llm_Resolver`
- Import/export: `ImportExport\Dynamic_Transformer`

Persisted data includes `group` (`Dynamic_Prop_Type::validate_value()` requires it). Render (`Dynamic_Transformer`) uses only `name` and `settings`.

### Category gating

`Dynamic_Prop_Type` is created with `categories()` constraint. Built-in mapping (`Dynamic_Prop_Types_Mapping`):

| Prop type | Category |
|-----------|----------|
| `String_Prop_Type` (no enum) | `text` |
| `Html_V3_Prop_Type` | `text` |
| `Url_Prop_Type` | `url` |
| `Image_Src_Prop_Type` | `image` |
| `Number_Prop_Type` | `number` |
| `Color_Prop_Type` | `color` |
| `Svg_Src_Prop_Type` | `svg` |

Opt out: `->meta( Dynamic_Prop_Type::ignore() )`.

## Extension

Add `Dynamic_Prop_Type::make()->categories( [ … ] )` to a `Union_Prop_Type`. See [extending.md](./extending.md).

## Public API

| Symbol | Signature | Purpose | Source |
|--------|-----------|---------|--------|
| `Dynamic_Prop_Type` | `::get_key()` → `'dynamic'` | Prop type key | `dynamic-prop-type.php` |
| `Dynamic_Prop_Type` | `::generate( $value, $disable = false )` | Build PropValue | `dynamic-prop-type.php` (via `Has_Generate`) |
| `Dynamic_Prop_Type` | `::ignore()` | Opt out of dynamics | `dynamic-prop-type.php` |
| `Dynamic_Prop_Type` | `::is_dynamic_prop_value( $value ): bool` | Detect dynamic binding | `dynamic-prop-type.php` |
| `Dynamic_Prop_Type` | `categories( array )`, `allowed_tag_names( array )` | Constrain allowed tags | `dynamic-prop-type.php` |
| `Dynamic_Transformer` | `transform( $value, $key )` | Resolve to rendered output | `dynamic-transformer.php` |
| `Dynamic_Prop_Types_Mapping` | `::make()`, `get_extended_schema( $schema )` | Inject dynamic union | `dynamic-prop-types-mapping.php` |

## Internals

- **Schema extension** — hooks `elementor/atomic-widgets/props-schema` and `elementor/atomic-widgets/styles/schema`.
- **LLM dedupe** — `LLM_Schema_Dedupe_Filter` on `elementor/atomic-widgets/llm-json-schema`.

## See also

- [overview.md](./overview.md) — architecture
- [discovery.md](./discovery.md) — tag lookup
- [../fundamentals/prop-value.md](../fundamentals/prop-value.md) — PropValue basics
- [../mcp/composition-workflow.md](../mcp/composition-workflow.md) — dynamics in MCP composition
