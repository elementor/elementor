# manage-elements

> Audience: external  
> Module: `modules/mcp/abilities/manage-elements-ability.php`  
> Status: final  
> Related: [build-composition.md](build-composition.md), [get-widget-schema.md](get-widget-schema.md), [../../css-converter/overview.md](../../css-converter/overview.md)

## What it is

Ability ID: **`elementor/manage-elements`**

Surgical edits on **existing** v4 elements in a document: partial settings merge, raw-CSS style update, global class attachment, delete, move, or duplicate. Unlike `build-composition`, this operates on real element IDs returned from prior composition or editor state.

Annotations: `readonly: false`, `destructive: true`, `idempotent: false`.  
Permission: `edit_posts` (plus `edit_post` on target `post_id`).

## When to use it

- After `build-composition` — tweak settings/styles on returned element IDs
- Update a single element without rebuilding a subtree
- Reparent (`move`) or clone (`duplicate`) elements
- Remove elements (`delete`)

For new multi-element layouts, prefer [build-composition.md](build-composition.md).

## Key concepts

### Common input

| Field | Required | Description |
|-------|----------|-------------|
| `action` | yes | `update`, `delete`, `move`, or `duplicate` |
| `post_id` | yes | WordPress post ID |
| `element_id` | yes | Target element ID in the document tree |

### action: update

Requires at least one of `settings`, `style`, or `classes`.

| Field | Description |
|-------|-------------|
| `settings` | Partial plain settings map — merged onto existing (same shape as `element_config` in build-composition) |
| `style` | Raw CSS declarations; `null` resets a property |
| `classes` | Array of global class **labels** to attach (prepended to existing) |

Schema source: `elementor/get-widget-schema` for the element's widget type.

### action: delete

Removes the element and descendants via `Document_Mutator::remove()`.

### action: move

| Field | Required | Description |
|-------|----------|-------------|
| `new_parent_id` | yes | Target parent element ID or `document` for root |
| `index` | no | Insertion index within parent; `null` = append |

### action: duplicate

Clones the element subtree with fresh IDs, inserted immediately after the source.

### Output (success)

```json
{
  "status": "ok",
  "post_id": 123,
  "element_id": "abc456",
  "version": "2026-07-26 09:00:00",
  "warnings": ["Optional non-fatal notices"]
}
```

### v4-specific: CSS converter dependency

Despite operating on "elements" generically, **`update` with `style` or `classes` depends on the AtomicWidgets CSS converter stack**:

- `Css_Converter`
- `Converter_Registry_Factory`
- `Expander_Registry_Factory`
- `Variable_Prop_Value_Transformer`

These convert raw CSS to native v4 style props (same pipeline as `build-composition` and `manage-classes`). This is why the ability is documented under v4 MCP — it does not apply to legacy v3 widget styling paths.

Settings merge uses `Element_Config_Applier` + `Plain_Values_Resolver`. Class attachment uses `Class_Applier` + `Global_Classes_Repository`.

### Errors

- `invalid_input` — missing/invalid fields
- `elementor_forbidden` — no edit permission
- `elementor_not_found` — element or document not found

## Extension

N/A — consume via MCP host. Element types must resolve through `Widget_Type_Resolver` (v4 atomic widgets).

## Internals

- Document resolution: `get_doc_or_auto_save()` fallback chain
- Tree mutation: `Document_Mutator` (`remove`, `move`, `duplicate`, `save_as_draft`)
- Update path reuses `Build_Composition` appliers on a single-element ref index
- Clears file cache after save

## See also

- [build-composition.md](build-composition.md) — create elements first
- [manage-classes.md](manage-classes.md) — create global classes before attaching
- [../../css-converter/pipeline.md](../../css-converter/pipeline.md) — converter internals
