# manage-classes

> Audience: external  
> Module: `modules/mcp/abilities/manage-classes-ability.php`  
> Status: draft  
> Related: [../resources.md](../resources.md), [build-composition.md](build-composition.md), [../../global-classes/api.md](../../global-classes/api.md)

## What it is

Ability ID: **`elementor/manage-classes`**

Bulk create, update, or delete v4 global CSS classes on the active kit. Accepts raw CSS declarations; the server converts them to native style props via `Css_Converter`.

Annotations: `readonly: false`, `destructive: true`, `idempotent: false`.  
Permission: `Add_Capabilities::UPDATE_CLASS` capability.

## When to use it

- Before `build-composition` — create reusable classes referenced in the `classes` map
- To update class styles from agent-generated CSS
- To delete unused classes (destructive — confirm with user)

Always read `elementor://global-classes` first to avoid duplicate labels and to get internal ids for update/delete.

## Key concepts

### Input

| Field | Required | Description |
|-------|----------|-------------|
| `operations` | yes | Array of 1–50 operation objects |

### Operation shapes

| action | Required fields | Notes |
|--------|-----------------|-------|
| `create` | `label`, `css` | `css` is `{ property: value }` map; server generates internal `g-*` id |
| `update` | `id`, `label`, `css` | `id` from `elementor://global-classes` key |
| `delete` | `id` | Removes class from kit |

### css format

Raw CSS declarations as a property → value object:

```json
{
  "action": "create",
  "label": "hero-heading",
  "css": {
    "font-size": "3.5rem",
    "font-weight": "700",
    "color": "var(--brand-primary)"
  }
}
```

- Use variable **labels** in `var(--label)` — must exist in `elementor://global-variables`
- `null` or `"null"` value resets a property
- Invalid variable references → `invalid_css` error
- Shorthand may produce `custom_css` fallback (base64-stored)

### Label-based references elsewhere

In `build-composition` and `manage-elements`, reference classes by **label** only:

```json
"classes": { "hero-title": ["hero-heading", "text-muted"] }
```

Internal `g-*` ids are for update/delete operations only.

### Duplicate labels

Duplicate labels on create/update are auto-renamed with a `DUP_` prefix via `Global_Classes_Labels::generate_unique_label()`. Response includes `modified_label: { original, modified }` when renamed.

### Output

```json
{
  "status": "completed",
  "results": [
    { "index": 0, "action": "create", "status": "ok", "id": "g-abc123", "label": "hero-heading" }
  ],
  "order": ["g-abc123", "g-existing"]
}
```

Per-operation errors include `index`, `action`, `code`, `message`. Batch continues on individual failures.

### Limits

- Max **50** operations per request (`batch_size_exceeded` beyond that)
- Kit max items: `Global_Classes_REST_API::MAX_ITEMS` — overflow creates rejected with `global_classes_limit_exceeded`

## Extension

N/A — kit-scoped CRUD. Class structure validated through `Style_Parser` + `Style_Schema`. See [../../global-classes/api.md](../../global-classes/api.md) for REST equivalent.

## Internals

- Repository: `Global_Classes_Repository` on active kit
- CSS → variant via `Css_Converter` (`Converter_Registry_Factory`, `Expander_Registry_Factory`, `Variable_Prop_Value_Transformer`)
- Desktop breakpoint variant: `meta.breakpoint: desktop`
- Clears Elementor file cache after mutations

## See also

- [../composition-workflow.md](../composition-workflow.md) — step 4
- [build-composition.md](build-composition.md) — attaching classes by label
- [../../global-classes/data-model.md](../../global-classes/data-model.md) — label vs id
