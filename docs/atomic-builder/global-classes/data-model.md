# Global Classes Data Model

> Audience: both
> Module: `modules/global-classes/`
> Related: [overview.md](./overview.md), [api.md](./api.md), [../fundamentals/style-schema.md](../fundamentals/style-schema.md)

## What it is

Global classes persist as **CPT posts** (one per class) plus **kit post meta** (order, label map, id→post lookup). In-memory shape: `{ items, order }`.

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

Refer to classes by **label** in author-facing contexts, not internal id.

## When to use it

- Understand kit export shape (`global-classes.json`)
- Debug REST `PUT` payloads or MCP `manage-classes`
- Trace preview vs published state
- Reason about per-kit isolation

## Key concepts

### CPT: `e_global_class`

| Field | Storage |
|-------|---------|
| Label | `post_title` |
| Internal id | `_elementor_global_class_id` |
| Published variants | `_elementor_global_class_data` |
| Draft variants | `_elementor_global_class_data_preview` |

`Global_Class_Post::to_array()` normalizes to `StyleDefinition` shape.

### Kit meta

| Meta key | Purpose |
|----------|---------|
| `_elementor_global_classes_order` | Published class id order |
| `_elementor_global_classes_order_preview` | Draft order |
| `_elementor_global_classes_labels` | Published id → label map |
| `_elementor_global_classes_labels_preview` | Draft label map |
| `_elementor_global_classes_post_ids` | Internal id → CPT post id |
| `_elementor_global_classes_sync_to_v3` | Class ids synced to v3 Global Fonts |

Repository contexts: `CONTEXT_FRONTEND` (`'frontend'`), `CONTEXT_PREVIEW` (`'preview'`).

### Label vs id

- **Label** — HTML `class` attribute, MCP `classes` maps
- **Internal id** (`g-*`) — element `settings.classes.value`, REST update/delete

Duplicates auto-renamed with `DUP_` prefix (max 50 chars). REST returns `DUPLICATED_LABEL`.

### Invariants

- `order` is canonical sort for cascade and UI
- `items` keys must match `order` (parser sanitizes via `sanitize_order`)
- Max **1000** classes per kit (`Global_Classes_REST_API::MAX_ITEMS`)
- New kits clone class posts from previous kit

### `sync_to_v3` (optional)

Boolean on class item. When `true`, typography mirrors to legacy v3 Global Fonts via `modules/design-system-sync/`. Editor UI toggle only; MCP does not expose this field.

## Public API

| Symbol | Signature | Purpose |
|--------|-----------|---------|
| `Global_Classes_Repository` | `public function all( bool $force = false ): Global_Classes` | Read all classes |
| `Global_Classes_Repository` | `public function get( string $class_id ): ?array` | Single class by id |
| `Global_Classes_Repository` | `public function get_by_ids( array $class_ids ): array` | Batch fetch by ids |
| `Global_Classes_Repository` | `public function get_order(): array` | Ordered id list |
| `Global_Classes_Repository` | `public function apply_changes( array $touched_items, array $changes, array $order ): void` | Write batch delta |
| `Global_Classes_Repository` | `public function put( array $items, array $order )` | Full replace (import) |
| `Global_Classes_Parser` | `public function parse( $data ): Parse_Result` | Validate full payload |
| `Global_Classes_Parser` | `public function parse_items( array $items )` | Validate items only |
| `Global_Classes_Parser` | `public function parse_order( array $order, array $final_item_ids )` | Validate/sanitize order |

Source: `global-classes-repository.php`, `global-classes-parser.php`.

## Extension

Fixed data model. Use REST `PUT` or MCP `elementor/manage-classes` — do not write CPT/meta directly.

## Internals

**Read:** `all()` → kit order meta → batch CPT fetch → `Global_Classes` value object.

**Write:** `apply_changes()` → batch CPT CRUD → update order/labels → `elementor/global_classes/update`.

**Relations:** `Global_Classes_Relations` indexes document ↔ class id usage on save.

## See also

- [overview.md](./overview.md)
- [api.md](./api.md)
- [applying-classes.md](./applying-classes.md)
- [../migration/prop-type-migrations.md](../migration/prop-type-migrations.md)
