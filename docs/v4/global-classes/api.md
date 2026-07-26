# Global Classes API

> Audience: external
> Module: `modules/global-classes/global-classes-rest-api.php`, `modules/mcp/abilities/manage-classes-ability.php`
> Status: draft
> Related: [data-model.md](./data-model.md), [../mcp/abilities/manage-classes.md](../mcp/abilities/manage-classes.md), [../mcp/resources.md](../mcp/resources.md)

## What it is

Two programmatic surfaces manage global classes on the **active kit**:

1. **REST API** (`Global_Classes_REST_API`) — used by the editor's `editor-global-classes` package and direct HTTP clients.
2. **MCP ability** `elementor/manage-classes` (`Manage_Classes_Ability`) — bulk create/update/delete via raw CSS, for external agent hosts.

A read-only MCP **resource** `elementor://global-classes` (`Global_Classes_Resource_Ability`) exposes the current label map for discovery.

## When to use it

- Build editor integrations or automation that CRUD kit classes.
- Let LLM agents create design tokens before `build-composition`.
- Export/import classes with Site Settings kits.
- Query class usage across documents before deletion.

## Key concepts

### REST namespace

Base: `elementor/v1/global-classes`

All routes accept optional `context` query param: `frontend` (default) or `preview`.

| Method | Route | Permission | Purpose |
|--------|-------|------------|---------|
| `GET` | `/global-classes` | logged in | List `{ id, label }` for all classes |
| `GET` | `/global-classes/post?post_id=` | logged in | Style definitions used on a document + meta `order` |
| `GET` | `/global-classes/styles?ids=` | logged in | Style definitions by comma-separated internal ids + meta `order` |
| `GET` | `/global-classes/usage` | `manage_options` | Detailed per-class document usage |
| `PUT` | `/global-classes` | `elementor_global_classes_update_class` | Batch create/update/delete/reorder |

### REST `PUT` contract

The editor sends the full delta in one request:

```json
{
  "context": "preview",
  "changes": {
    "added": ["g-newid1"],
    "deleted": [],
    "modified": ["g-abc123"],
    "order": true
  },
  "items": {
    "g-abc123": {
      "id": "g-abc123",
      "label": "wc26-gold",
      "type": "class",
      "variants": []
    }
  },
  "order": ["g-abc123", "g-newid1"]
}
```

Responses:

- `204` on success.
- `400` with `DUPLICATED_LABEL` body `{ code, modifiedLabels }` when labels were auto-renamed.
- `400` with `global_classes_limit_exceeded` when total exceeds 1000.

The JS client (`api.ts`) wraps this as `apiClient.saveDraft()` (`context=preview`) and `apiClient.publish()` (`context=frontend`).

### Import / export with kits

Kit export includes `global-classes.json` when `settings` is in the export `include` array (`Import_Export\Export_Runner`). The file shape matches `{ items, order }` validated by `Global_Classes_Parser`.

Import (`Import_Export\Import_Runner`) reads the JSON from the extracted kit directory and calls `Global_Classes_Repository::put()`. Kit meta keys for order, labels, relations, and sync map are preserved via `elementor/kit/meta_to_preserve_on_kit_import`.

Template library import/export also supports global class snapshots through `Template_Library_Global_Classes` filters.

### Usage tracking

`GET /global-classes/usage` returns detailed usage via `Applied_Global_Classes_Usage::get_detailed_usage()`:

```json
{
  "g-abc123": [
    {
      "pageId": 42,
      "title": "Home",
      "type": "page",
      "total": 3,
      "elements": ["e1a2b3c", "d4e5f6g"]
    }
  ]
}
```

Document types `e-flexbox` and `template` are excluded from reporting. The editor prefetches usage for the class manager UI (`use-css-class-usage.ts`).

Deletion triggers `elementor/global_classes/cleanup` to strip removed class ids from affected documents.

### MCP `manage-classes` ability

**Ability id:** `elementor/manage-classes`

**Permission:** `elementor_global_classes_update_class` (capability from `Add_Capabilities` migration).

**Input:** bulk `operations` array (1–50 items):

```json
{
  "operations": [
    {
      "action": "create",
      "label": "wc26-gold",
      "css": { "color": "#D4AF37", "font-weight": "700" }
    },
    {
      "action": "update",
      "id": "g-abc123",
      "label": "wc26-gold",
      "css": { "color": "#FFD700" }
    },
    {
      "action": "delete",
      "id": "g-def456"
    }
  ]
}
```

- **create** — generates internal `g-*` id; `label` + `css` required. CSS is converted via `Css_Converter` against `Style_Schema`.
- **update** — `id` (internal), `label`, `css` required.
- **delete** — `id` (internal) required.

Duplicate labels are auto-renamed with `DUP_` prefix. Variable references in CSS must use label-only syntax and exist in `elementor://global-variables`.

**Output:** `{ status, results[], order[] }` per `Bulk_Operations_Result`.

**Resource:** Read `elementor://global-classes` before creating — returns JSON map of `id → label` from `all_labels()`.

**In-editor JS tool:** `editor-global-classes` registers a `manage-classes` MCP tool that proxies to the PHP ability via `elementor/v1/mcp-proxy`. This is separate from the PHP ability but targets the same backend.

### Capabilities

| Capability | Roles (default) |
|------------|-----------------|
| `elementor_global_classes_update_class` | administrator |
| `elementor_global_classes_remove_class` | administrator, editor, author, contributor, shop_manager |
| `elementor_global_classes_apply_class` | administrator, editor, author, contributor, shop_manager |

Gated by hidden experiment `global_classes_should_enforce_capabilities` (default active).

## Extension

Integrators should prefer MCP `elementor/manage-classes` for agent workflows (raw CSS in, validated variants out) and REST `PUT` when mirroring the editor's full `{ items, order, changes }` sync model.

For composition, use `classes` label maps in `elementor/build-composition` — not REST directly. See [applying-classes.md](./applying-classes.md).

There is no public PHP filter to register custom global class types; all items use `type: "class"`.

## Internals

- REST controller: `modules/global-classes/global-classes-rest-api.php`
- MCP ability: `modules/mcp/abilities/manage-classes-ability.php`
- MCP resource: `modules/mcp/abilities/global-classes-resource-ability.php`
- JS API client: `packages/packages/core/editor-global-classes/src/api.ts`
- JS MCP tool: `packages/packages/core/editor-global-classes/src/mcp-integration/manage-classes-tool.ts`
- Cache invalidation: `elementor/global_classes/update` → `Atomic_Global_Styles::invalidate_cache_for_updated_classes()`

## See also

- [data-model.md](./data-model.md) — payload field meanings
- [applying-classes.md](./applying-classes.md) — using classes on elements after creation
- [../mcp/abilities/manage-classes.md](../mcp/abilities/manage-classes.md) — full ability reference (parallel doc)
- [../mcp/resources.md](../mcp/resources.md) — `elementor://global-classes` URI catalog
- [../mcp/composition-workflow.md](../mcp/composition-workflow.md) — variables → classes → composition flow
- [../css-converter/overview.md](../css-converter/overview.md) — how MCP converts raw CSS to style props
