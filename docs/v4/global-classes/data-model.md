# Global Classes Data Model

> Audience: both
> Module: `modules/global-classes/`
> Status: draft
> Related: [overview.md](./overview.md), [api.md](./api.md), [../fundamentals/style-schema.md](../fundamentals/style-schema.md)

## What it is

Global classes persist as a combination of **CPT posts** (one per class, holding style variants) and **kit post meta** (order, label map, and id→post lookup). The in-memory shape is always `{ items, order }` — a map of class definitions keyed by internal id, plus an ordered id list.

```json
{
  "items": {
    "g-abc123": {
      "id": "g-abc123",
      "label": "wc26-gold",
      "type": "class",
      "variants": [
        {
          "meta": { "breakpoint": "desktop", "state": null },
          "props": { "color": { "$$type": "color", "value": "#D4AF37" } }
        }
      ]
    }
  },
  "order": ["g-abc123", "g-def456"]
}
```

In author-facing contexts, refer to classes by **label** (`wc26-gold`), never by internal id.

## When to use it

- Understand what travels in a kit export (`global-classes.json`).
- Debug REST `PUT` payloads or MCP `manage-classes` operations.
- Trace how preview drafts differ from published frontend state.
- Reason about per-kit isolation when multiple kits exist on one site.

## Key concepts

### CPT: `e_global_class`

Registered by `Global_Class_Post_Type` (`CPT = 'e_global_class'`). Each post stores:

| Field | Storage |
|-------|---------|
| Label | `post_title` |
| Internal id | post meta `_elementor_global_class_id` |
| Published variants | post meta `_elementor_global_class_data` |
| Draft variants | post meta `_elementor_global_class_data_preview` |
| Version | post meta `_elementor_version` |
| Last edited | post meta `_elementor_global_class_edited` |

`Global_Class_Post::to_array()` normalizes a post into the `StyleDefinition` shape consumed by the repository and REST layer.

### Kit meta

All kit-scoped indices live on the active **Kit** document:

| Meta key | Class | Purpose |
|----------|-------|---------|
| `_elementor_global_classes_order` | `Global_Classes_Order::META_KEY` | Published class id order |
| `_elementor_global_classes_order_preview` | `Global_Classes_Order::META_KEY_PREVIEW` | Draft order |
| `_elementor_global_classes_labels` | `Global_Classes_Labels::META_KEY_FRONTEND` | Published id → label map |
| `_elementor_global_classes_labels_preview` | `Global_Classes_Labels::META_KEY_PREVIEW` | Draft label map |
| `_elementor_global_classes_post_ids` | `Global_Classes_Post_IDs::META_KEY` | Internal id → CPT post id map |

`Global_Classes_Repository` is the single entry point for reads and writes. It supports two contexts:

- `CONTEXT_FRONTEND` (`'frontend'`) — published state
- `CONTEXT_PREVIEW` (`'preview'`) — in-editor draft state

Publishing (frontend `apply_changes`) copies order to preview, clears stale preview meta on touched posts, and updates the design-system sync map.

### Label is the public id

The **label** is what appears in HTML `class` attributes and what MCP agents send in `classes` maps. The **internal id** (`g-*`) is stable across renames and is what element `settings.classes.value` arrays store.

`Global_Classes_Labels::generate_unique_label()` auto-renames duplicates with a `DUP_` prefix (max 50 chars). REST returns `DUPLICATED_LABEL` with `modifiedLabels` when this happens.

### Internal `g-*` ids

New ids are generated with `Utils::generate_id( 'g-', $reserved_ids )` (see `Manage_Classes_Ability::translate_create`). They never appear in author-facing examples or MCP `classes` input — only in stored element JSON and `manage-classes` update/delete `id` fields.

### Items + order invariants

- `order` is the canonical sort for cascade and UI listing.
- `items` keys must match ids in `order` (parser sanitizes mismatches via `Global_Classes_Parser::sanitize_order`).
- Maximum **1000** classes per kit (`Global_Classes_REST_API::MAX_ITEMS`).
- Repository reads batch CPT lookups in chunks of 100 (`READ_BATCH_SIZE`).

### Kit binding and cloning

Each kit owns separate CPT posts. `Global_Classes_Post_IDs` maps class ids to post ids per kit. When a new kit is created, `create_global_classes_posts_for_new_kit` clones all class posts from the previous kit so edits are isolated.

Kit import preserves global-classes meta keys via `add_meta_to_preserve_on_kit_import`.

## Extension

N/A — the data model is fixed. External tools should use the REST `PUT` contract or MCP `elementor/manage-classes` rather than writing CPT/meta directly.

## Internals

**Read path:** `Global_Classes_Repository::all()` → reads order from kit meta → batch-fetches CPT posts by id map → returns `Global_Classes` value object.

**Write path:** `apply_changes( $touched_items, $changes, $order )` → batch create/update/delete CPT posts → update order + labels meta → fire `elementor/global_classes/update` with `{ added, deleted, modified, order, affected_post_ids }`.

**Legacy migration:** `database/migrations/migrate-to-posts.php` moved monolithic kit JSON (`_elementor_global_classes`) into per-class CPT posts. `Migrations_Orchestrator` can migrate variant prop shapes on read.

**Relations:** `Global_Classes_Relations` indexes which documents reference which class ids (post meta `_elementor_used_global_class` and reverse indexes). Updated on document save.

**Parser:** `Global_Classes_Parser` validates items against `Style_Schema` via `Style_Parser`. Used by REST, import, and export.

## See also

- [overview.md](./overview.md) — feature overview and terminology
- [api.md](./api.md) — REST payload shapes
- [applying-classes.md](./applying-classes.md) — how elements reference stored classes
- [../migration/prop-type-migrations.md](../migration/prop-type-migrations.md) — global class prop migrations
