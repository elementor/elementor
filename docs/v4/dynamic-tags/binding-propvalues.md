# Binding dynamic PropValues

> Audience: both
> Module: `modules/atomic-widgets/dynamic-tags/dynamic-prop-type.php`
> Status: draft
> Related: [overview.md](./overview.md), [discovery.md](./discovery.md), [../fundamentals/prop-value.md](../fundamentals/prop-value.md)

## What it is

In atomic (v4) element JSON, a dynamic binding is a PropValue with `$$type` set to `dynamic`. It replaces a static prop value (or a nested field within an object prop) with a reference to a legacy dynamic tag plus that tag's settings.

The prop type class is `Elementor\Modules\AtomicWidgets\DynamicTags\Dynamic_Prop_Type` (key: `dynamic`).

## When to use it

- A widget prop or style field supports dynamics (check the widget schema — the field's type is a **union** that includes `dynamic`).
- You are composing element JSON by hand, via REST, or through MCP (`build-composition`, `manage-elements`).
- You need live WordPress data at render time instead of a hard-coded string, URL, image, or color.

## Key concepts

### PropValue shape

A dynamic binding is always a full PropValue, not a bare tag object:

```json
{
  "$$type": "dynamic",
  "value": {
    "name": "post-title",
    "settings": {
      "before": "",
      "after": ""
    }
  }
}
```

| Field | Required | Description |
|-------|----------|-------------|
| `$$type` | yes | Must be `"dynamic"` |
| `value.name` | yes | Tag name from the registry (see [discovery.md](./discovery.md)) |
| `value.settings` | yes (after normalization) | Settings object matching the tag's schema; use `{}` when the tag has no settings |
| `disabled` | no | Standard PropValue flag; when `true`, the binding is ignored |

Use `Dynamic_Prop_Type::generate()` in PHP to build this shape:

```php
Dynamic_Prop_Type::generate( [
    'name' => 'post-title',
    'settings' => [ 'before' => 'Hello ' ],
] );
```

### Root-level vs nested binding

Dynamic PropValues can appear at the **root** of a prop or **nested** inside an object prop's shape.

**Root-level** — the entire prop is dynamic (e.g. heading `title`):

```json
"title": {
  "$$type": "dynamic",
  "value": {
    "name": "post-title",
    "settings": {}
  }
}
```

**Nested** — only one field within an object is dynamic (e.g. image `src` inside the `image` prop):

```json
"image": {
  "$$type": "image",
  "value": {
    "src": {
      "$$type": "dynamic",
      "value": {
        "name": "post-featured-image",
        "settings": { "fallback": { "url": "https://example.com/placeholder.jpg" } }
      }
    },
    "size": {
      "$$type": "string",
      "value": "full"
    }
  }
}
```

The `e-image` widget defines `image` as an `Image_Prop_Type` whose shape contains `src` (`Image_Src_Prop_Type`) and `size`. `Dynamic_Prop_Types_Mapping` adds a `dynamic` variant to `Image_Src_Prop_Type` because it maps to the `image` category.

### Settings shape

Tag `settings` follow the per-tag `props_schema` built by `Dynamic_Tags_Schemas` from the legacy tag's controls. In **stored element JSON**, settings values are typically full PropValues (`{ $$type, value }`).

In **MCP/agent authoring**, settings are often sent as **plain values** (no `$$type` wrapper). The `Dynamic_Tag_Llm_Resolver` and composition prompts normalize plain settings into PropValues. The `fallback` setting key is omitted from LLM-facing schemas (`Dynamic_Tag_Llm_Resolver::OMITTED_SETTING_KEYS`).

Look up the exact settings keys and types via [discovery.md](./discovery.md) (`list-dynamic-tags` / `elementor://dynamic-tags`).

### No `group` field (author-facing)

Legacy v3 tag **definitions** include a `group` — every `Base_Tag` subclass implements `get_group()`, and groups are registered with `register_group()`. The atomic editor config also carries `group` internally for UI grouping.

The **author-facing PropValue shape omits `group`**:

- `Dynamic_Prop_Type::to_json_schema()` exposes only `name` and `settings` under `value`.
- MCP prompts (`list-dynamic-tags` static resource) explicitly say: *"Do not send `group`."*
- `List_Dynamic_Tags_Ability` returns `name`, `label`, `categories`, and `settings` — no `group`.

Authors and agents bind dynamics with `name` + `settings` only. Do not send `group` — resolvers inject it from the tag registry before persistence:

- **In-editor MCP** — `dynamicTagLLMResolver` (`editor-canvas`) looks up `atomicDynamicTags` and sets `group` from the registry.
- **PHP MCP** — `Dynamic_Tag_Llm_Resolver` does the same via `Dynamic_Tags_Module::instance()->registry`.
- **Import/export** — `ImportExport\Dynamic_Transformer` fills `group` from the registry when missing.

**Stored shape:** persisted document data includes `group` because `Dynamic_Prop_Type::validate_value()` requires it. Render resolution (`Dynamic_Transformer`) uses only `name` and `settings`; `group` is not consulted at render time.

### Category gating

Not every tag is valid for every prop. `Dynamic_Prop_Type` is created with a `categories()` constraint, and only tags whose categories intersect are allowed. The LLM JSON schema may include an `enum` of allowed tag names for a given prop.

Built-in mapping (`Dynamic_Prop_Types_Mapping`) — prop type to category:

| Prop type | Category |
|-----------|----------|
| `String_Prop_Type` (no enum) | `text` |
| `Html_V3_Prop_Type` | `text` |
| `Url_Prop_Type` | `url` |
| `Image_Src_Prop_Type` | `image` |
| `Number_Prop_Type` | `number` |
| `Color_Prop_Type` | `color` |
| `Svg_Src_Prop_Type` | `svg` |

Props can opt out of dynamics via `->meta( Dynamic_Prop_Type::ignore() )`, which sets the `dynamic` meta key to `false`.

## Extension

When defining a custom prop type, add `Dynamic_Prop_Type::make()->categories( [ … ] )` to a `Union_Prop_Type` alongside the static variant. See [extending.md](./extending.md) and `Emails_Prop_Type` for a worked example.

## Internals

- **Detection** — `Dynamic_Prop_Type::is_dynamic_prop_value( $value )` checks `$$type === 'dynamic'`.
- **Render** — `Dynamic_Transformer` resolves settings, then calls `get_tag_data_content( null, $name, $settings )` on the legacy manager.
- **Schema extension** — `Dynamic_Prop_Types_Mapping` hooks `elementor/atomic-widgets/props-schema` and `elementor/atomic-widgets/styles/schema` to inject the `dynamic` union member.

## See also

- [overview.md](./overview.md) — architecture
- [discovery.md](./discovery.md) — tag lookup
- [../fundamentals/prop-value.md](../fundamentals/prop-value.md) — PropValue basics
- [../mcp/composition-workflow.md](../mcp/composition-workflow.md) — dynamics in MCP XML composition
