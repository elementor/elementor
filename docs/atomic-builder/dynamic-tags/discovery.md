# Discovering dynamic tags

> Audience: external
> Module: `modules/mcp/abilities/list-dynamic-tags-ability.php`
> Related: [binding-propvalues.md](./binding-propvalues.md), [../mcp/overview.md](../mcp/overview.md), [../mcp/resources.md](../mcp/resources.md)

## What it is

Before binding a prop, you need registered tag names, categories, and settings schemas.

| Channel | Id |
|---------|-----|
| WordPress Ability | `elementor/list-dynamic-tags` |
| MCP tool name | `list-dynamic-tags` |
| In-editor resource URI | `elementor://dynamic-tags` |

All read from `Dynamic_Tags_Editor_Config::get_tags()` — atomic-converted legacy tags with convertible controls.

Works for both legacy widgets and atomic elements.

## When to use it

- Agent/integrator needs valid `name` values for a dynamic PropValue.
- Need settings schema before populating `value.settings`.
- Building composition JSON where a field allows `$$type: dynamic`.

**Workflow:** call `list-dynamic-tags` → match `categories` to target prop → bind per [binding-propvalues.md](./binding-propvalues.md).

## Key concepts

### Ability: `elementor/list-dynamic-tags`

| Property | Value |
|----------|-------|
| Class | `List_Dynamic_Tags_Ability` |
| Input | `{}` |
| Permission | `edit_posts` |
| MCP proxy | `POST elementor/v1/mcp-proxy` with `{ "tool": "list-dynamic-tags", "input": {} }` |

### Response shape

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

| Field | Description |
|-------|-------------|
| `name` | Tag id — use as `value.name` |
| `label` | Human-readable title |
| `categories` | e.g. `text`, `url`, `image` |
| `settings` | Plain LLM schema per setting key |

No `group` field — do not send `group` when binding. Settings skip `fallback` (`Dynamic_Tag_Llm_Resolver::OMITTED_SETTING_KEYS`).

### Resource: `elementor://dynamic-tags`

In-editor MCP resource (`editor-canvas/src/mcp/resources/dynamic-tags-resource.ts`). Fetches same data via MCP proxy.

External hosts: call **`elementor/list-dynamic-tags`** directly. No PHP `read-resource` handler for this URI.

### Excluded tags

Omitted when `Dynamic_Tags_Editor_Config` cannot convert legacy controls (unless `force_convert_to_atomic` in `get_editor_config()`). See [extending.md](./extending.md).

## Extension

N/A — read-only. Register tags via [extending.md](./extending.md) to add entries.

## Public API

| Symbol | Signature | Purpose | Source |
|--------|-----------|---------|--------|
| `List_Dynamic_Tags_Ability` | `::URI` → `'elementor://dynamic-tags'` | Resource URI constant | `list-dynamic-tags-ability.php` |
| `List_Dynamic_Tags_Ability` | `execute(): array` | List tags with schemas | `list-dynamic-tags-ability.php` |
| `Dynamic_Tags_Editor_Config` | `get_tags(): array` | Source data for ability | `dynamic-tags-editor-config.php` |
| `Dynamic_Tags_Module` | `::instance()->registry` | Editor config accessor | `dynamic-tags-module.php` |

**MCP proxy:** `POST /wp-json/elementor/v1/mcp-proxy` — `{ "tool": "list-dynamic-tags", "input": {} }`.

## Internals

- **Schema flattening** — `Widget_Context_Helper::to_plain_llm_schema()`.
- **Prompt** — `modules/mcp/static-resources/abilities/list-dynamic-tags.md`.
- **Not experiment-gated** — PHP abilities register unconditionally.

## See also

- [binding-propvalues.md](./binding-propvalues.md) — using discovered tags
- [../mcp/composition-workflow.md](../mcp/composition-workflow.md) — agent composition
- [../mcp/overview.md](../mcp/overview.md) — PHP abilities vs in-editor MCP
- [../atomic-widgets/elements-catalog.md](../atomic-widgets/elements-catalog.md) — which elements support dynamics
