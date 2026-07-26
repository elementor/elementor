# Global Classes API

> Audience: external
> Module: `modules/global-classes/global-classes-rest-api.php`, `modules/mcp/abilities/manage-classes-ability.php`
> Status: draft
> Related: [data-model.md](./data-model.md), [../mcp/abilities/manage-classes.md](../mcp/abilities/manage-classes.md), [../mcp/resources.md](../mcp/resources.md)

## What it is

Two programmatic surfaces manage global classes on the **active kit**:

1. **REST API** (`Global_Classes_REST_API`) — used by the editor's `editor-global-classes` package and direct HTTP clients.
2. **MCP ability** `elementor/manage-classes` (`Manage_Classes_Ability`) — bulk create/update/delete via raw CSS, for external agent hosts.

A read-only MCP **resource** `elementor://global-classes` (`Global_Classes_Resource_Ability`) exposes the current id → label map for discovery.

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

The editor sends the full delta in one request. `items` holds the full definition of every id listed in `changes.added` or `changes.modified` **only** — deleted classes are referenced by id alone in `changes.deleted` and must not appear in `items`:

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
    },
    "g-newid1": {
      "id": "g-newid1",
      "label": "wc26-navy",
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

Kit export writes `global-classes.json` when `settings` is in the export `include` array (`ImportExport\Export_Runner`, file constant `ImportExport::FILE_NAME`). Shape: `{ items, order }` validated by `Global_Classes_Parser`. Import (`ImportExport\Import_Runner`) calls `Global_Classes_Repository::put()`. Kit meta (order, labels, relations, sync map) is preserved via `elementor/kit/meta_to_preserve_on_kit_import`. Template library snapshots use `Template_Library_Global_Classes` filters.

### Usage tracking

`GET /global-classes/usage` returns per-class document usage via `Applied_Global_Classes_Usage::get_detailed_usage()` — keys are internal ids; each value lists `{ pageId, title, type, total, elements[] }`. Document types `e-flexbox` and `template` are excluded. Prefetched by the class manager UI (`use-css-class-usage.ts`).

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

**Output:** `{ status, results[], order[] }` per `Bulk_Operations_Result`. Create results include the generated internal id; use `elementor://global-classes` (id → label map from `all_labels()`) for discovery before composing.

### Capabilities

REST `PUT` and MCP `manage-classes` require `elementor_global_classes_update_class` (administrator by default). Additional caps: `elementor_global_classes_remove_class`, `elementor_global_classes_apply_class` (editor roles). Gated by hidden experiment `global_classes_should_enforce_capabilities` (default active).

## Extension

Integrators should prefer MCP `elementor/manage-classes` for agent workflows (raw CSS in, validated variants out) and REST `PUT` when mirroring the editor's full `{ items, order, changes }` sync model.

For composition, use `classes` label maps in `elementor/build-composition` — not REST directly. See [applying-classes.md](./applying-classes.md).

There is no public PHP filter to register custom global class types; all items use `type: "class"`.

## Internals

REST: `global-classes-rest-api.php`. MCP: `manage-classes-ability.php`, `global-classes-resource-ability.php`. JS: `editor-global-classes/src/api.ts`; in-editor Angie/WebMCP tool at `mcp-integration/manage-classes-tool.ts` (proxies PHP ability). Cache: `elementor/global_classes/update` → `Atomic_Global_Styles::invalidate_cache_for_updated_classes()`.

## See also

- [data-model.md](./data-model.md) — payload field meanings
- [applying-classes.md](./applying-classes.md) — using classes on elements after creation
- [../mcp/abilities/manage-classes.md](../mcp/abilities/manage-classes.md) — full ability reference (parallel doc)
- [../mcp/resources.md](../mcp/resources.md) — `elementor://global-classes` URI catalog
- [../mcp/composition-workflow.md](../mcp/composition-workflow.md) — variables → classes → composition flow
- [../css-converter/overview.md](../css-converter/overview.md) — how MCP converts raw CSS to style props
