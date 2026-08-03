# Global Classes API

> Audience: external
> Module: `modules/global-classes/global-classes-rest-api.php`, `modules/mcp/abilities/manage-classes-ability.php`
> Related: [data-model.md](./data-model.md), [../mcp/abilities/manage-classes.md](../mcp/abilities/manage-classes.md), [../mcp/resources.md](../mcp/resources.md)

## What it is

Two surfaces for managing global classes on the **active kit**:

1. **REST API** (`Global_Classes_REST_API`) — editor `editor-global-classes` package and HTTP clients
2. **MCP ability** `elementor/manage-classes` — bulk create/update/delete via raw CSS

Read-only MCP resource: `elementor://global-classes` (id → label map).

## When to use it

- Editor integrations or automation that CRUD kit classes
- LLM agents creating design tokens before `build-composition`
- Kit import/export
- Query class usage before deletion

## Key concepts

### REST routes

Base: `elementor/v1/global-classes`. Optional `context`: `frontend` (default) or `preview`.

| Method | Route | Permission | Purpose |
|--------|-------|------------|---------|
| `GET` | `/global-classes` | logged in | List `{ id, label }` |
| `GET` | `/global-classes/post?post_id=` | logged in | Styles used on document + `order` |
| `GET` | `/global-classes/styles?ids=` | logged in | Styles by comma-separated ids + `order` |
| `GET` | `/global-classes/usage` | `manage_options` | Per-class document usage |
| `PUT` | `/global-classes` | `elementor_global_classes_update_class` | Batch create/update/delete/reorder |

### REST `PUT` contract

`items` holds full definitions for ids in `changes.added` / `changes.modified` only. Deleted ids appear in `changes.deleted` without `items` entries.

```json
{
  "context": "preview",
  "changes": { "added": ["g-newid1"], "deleted": [], "modified": ["g-abc123"], "order": true },
  "items": {
    "g-abc123": { "id": "g-abc123", "label": "wc26-gold", "type": "class", "variants": [] },
    "g-newid1": { "id": "g-newid1", "label": "wc26-navy", "type": "class", "variants": [] }
  },
  "order": ["g-abc123", "g-newid1"]
}
```

Responses: `204` success; `400` `DUPLICATED_LABEL` or `global_classes_limit_exceeded` (>1000).

### MCP `manage-classes`

```json
{
  "operations": [
    { "action": "create", "label": "wc26-gold", "css": { "color": "#D4AF37" } },
    { "action": "update", "id": "g-abc123", "label": "wc26-gold", "css": { "color": "#FFD700" } },
    { "action": "delete", "id": "g-def456" }
  ]
}
```

- **create** — generates `g-*` id; CSS converted via `Css_Converter` against `Style_Schema`
- **update** — `id` (internal), `label`, `css` required
- **delete** — `id` required

Use `elementor://global-classes` for discovery; use **labels** in `build-composition`.

### Import / export

Kit export writes `global-classes.json` when `settings` is in `include`. Import calls `Global_Classes_Repository::put()`.

## Public API

| Symbol | Signature | Purpose |
|--------|-----------|---------|
| `Global_Classes_REST_API` | `public function register_hooks(): void` | Register REST routes on `rest_api_init` |
| `Global_Classes_REST_API` | `const API_NAMESPACE = 'elementor/v1'` | Namespace |
| `Global_Classes_REST_API` | `const MAX_ITEMS = 1000` | Per-kit limit |
| `Global_Classes_Repository` | `public function apply_changes( array $touched_items, array $changes, array $order ): void` | REST write handler backend |
| `Global_Classes_Parser` | `public function parse( $data ): Parse_Result` | Import/export validation |
| `apiClient` (JS) | `all( context?: ApiContext )` | `GET /global-classes` |
| `apiClient` (JS) | `getStylesForPost( postId, context? )` | `GET /global-classes/post` |
| `apiClient` (JS) | `getStylesByIds( ids, context? )` | `GET /global-classes/styles` |
| `apiClient` (JS) | `saveDraft( payload )` | `PUT` with `context=preview` |
| `apiClient` (JS) | `publish( payload )` | `PUT` with `context=frontend` |
| `apiClient` (JS) | `usage()` | `GET /global-classes/usage` |

Source: `global-classes-rest-api.php`, `global-classes-repository.php`, `global-classes-parser.php`, `editor-global-classes/src/api.ts`.

## Extension

- Agents: MCP `elementor/manage-classes` (raw CSS in, validated variants out)
- Editor parity: REST `PUT` with `{ items, order, changes }`
- Composition: `classes` label maps in `build-composition` — not REST directly

## Internals

Cache invalidation: `elementor/global_classes/update` → `Atomic_Global_Styles::invalidate_cache_for_updated_classes()`. JS MCP tool: `mcp-integration/manage-classes-tool.ts`.

## See also

- [data-model.md](./data-model.md)
- [applying-classes.md](./applying-classes.md)
- [../mcp/abilities/manage-classes.md](../mcp/abilities/manage-classes.md)
- [../css-converter/overview.md](../css-converter/overview.md)
