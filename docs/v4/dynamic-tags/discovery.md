# Discovering dynamic tags

> Audience: external
> Module: `modules/mcp/abilities/list-dynamic-tags-ability.php`
> Status: draft
> Related: [binding-propvalues.md](./binding-propvalues.md), [../mcp/overview.md](../mcp/overview.md), [../mcp/resources.md](../mcp/resources.md)

## What it is

Before binding a prop to a dynamic source, you need the list of registered tag names, their categories, and each tag's settings schema. Elementor exposes this through:

1. The **`elementor/list-dynamic-tags`** WordPress Ability (MCP tool name: `list-dynamic-tags`)
2. The **`elementor://dynamic-tags`** MCP resource (in-editor; backed by the same ability)

Both return data from `Dynamic_Tags_Module::instance()->registry->get_tags()` — the atomic-converted view of all legacy tags whose controls could be adapted.

**Scope note:** This ability is **general-purpose**. It lists v3 legacy tags and works regardless of whether the target element is a legacy widget or an atomic (v4) element. It is documented here (not under `mcp/abilities/`) because readers looking for dynamic-tag binding will expect to find discovery alongside the PropValue shape.

## When to use it

- An agent or integrator needs to know which `name` values are valid for a dynamic PropValue.
- You need the settings schema for a tag before populating `value.settings`.
- You are building composition JSON and the widget schema allows `$$type: dynamic` for a field.

Typical workflow:

1. Call `list-dynamic-tags` (or read `elementor://dynamic-tags`).
2. Find a tag whose `categories` match the target prop (e.g. `text` for a heading title).
3. Bind using the shape in [binding-propvalues.md](./binding-propvalues.md).

## Key concepts

### Ability: `elementor/list-dynamic-tags`

| Property | Value |
|----------|-------|
| Ability id | `elementor/list-dynamic-tags` |
| MCP proxy tool name | `list-dynamic-tags` |
| Class | `Elementor\Modules\Mcp\Abilities\List_Dynamic_Tags_Ability` |
| Input | `{}` (empty object) |
| Permission | `current_user_can( 'edit_posts' )` |
| Annotations | `readonly`, `idempotent`, non-destructive |

Registered in `modules/mcp/module.php` and exposed through the MCP proxy REST endpoint `POST elementor/v1/mcp-proxy` with `{ "tool": "list-dynamic-tags", "input": {} }`.

### Response shape

Returns an array of tag entries:

```json
[
  {
    "name": "post-title",
    "label": "Post Title",
    "categories": ["text"],
    "settings": {
      "before": { "type": "string" },
      "after": { "type": "string" }
    }
  }
]
```

| Field | Type | Description |
|-------|------|-------------|
| `name` | string | Tag id — use as `value.name` in a dynamic PropValue |
| `label` | string | Human-readable title |
| `categories` | string[] | Category ids (e.g. `text`, `url`, `image`) |
| `settings` | object | Plain LLM schema for each setting key (no `$$type` wrappers) |

There is **no `group` field** in the response. Do not add `group` when binding (see [binding-propvalues.md](./binding-propvalues.md)).

The `settings` object is built from each tag's `props_schema`, skipping non-transformable prop types and keys in `Dynamic_Tag_Llm_Resolver::OMITTED_SETTING_KEYS` (currently `fallback`).

### Resource: `elementor://dynamic-tags`

| Property | Value |
|----------|-------|
| URI | `elementor://dynamic-tags` |
| MIME type | `application/json` |
| JS registration | `packages/packages/core/editor-canvas/src/mcp/resources/dynamic-tags-resource.ts` |

The in-editor MCP resource fetches the same data by calling the `list-dynamic-tags` tool via the MCP proxy. The resource description instructs agents to bind with:

```json
{
  "$$type": "dynamic",
  "value": {
    "name": "<tag name>",
    "settings": { }
  }
}
```

External MCP hosts connecting through the WordPress Abilities API should call the ability directly. The `elementor://dynamic-tags` URI is primarily used by in-editor tools (Angie, WebMCP) via the JS MCP registry.

TBD — verify with v4 team whether a PHP-side `read-resource` handler for `elementor://dynamic-tags` will be added to `Mcp_Proxy_REST_API` (it is not in the PHP resources map today; only the JS resource exists).

### What is excluded

Tags are omitted from the list when `Dynamic_Tags_Editor_Config` cannot convert their legacy controls to atomic controls (unless `force_convert_to_atomic` is set on the tag). If a tag you expect is missing, check control compatibility in [extending.md](./extending.md).

## Extension

N/A — discovery is read-only. To add tags to the list, register a legacy tag (see [extending.md](./extending.md)).

## Internals

- **Source** — `List_Dynamic_Tags_Ability::execute()` iterates `Dynamic_Tags_Editor_Config::get_tags()`.
- **Schema flattening** — `Widget_Context_Helper::to_plain_llm_schema()` converts prop types to plain JSON Schema for agents.
- **Prompt** — runtime ability prompt loaded from `modules/mcp/static-resources/abilities/list-dynamic-tags.md`.
- **Not experiment-gated** — PHP abilities in `modules/mcp/` register unconditionally (see [../getting-started/experiments.md](../getting-started/experiments.md)).

## See also

- [binding-propvalues.md](./binding-propvalues.md) — how to use discovered tags in element JSON
- [../mcp/composition-workflow.md](../mcp/composition-workflow.md) — end-to-end agent composition
- [../mcp/overview.md](../mcp/overview.md) — PHP abilities vs in-editor JS MCP registry
- [../atomic-widgets/elements-catalog.md](../atomic-widgets/elements-catalog.md) — which elements support dynamics (via schema)
