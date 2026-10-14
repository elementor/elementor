# manage-global-variable

> Audience: external  
> Module: `modules/mcp/abilities/manage-variable-ability.php`, `manage-variable-guide-ability.php`  
> Related: [../resources.md](../resources.md), [../../variables/api.md](../../variables/api.md), [build-composition.md](build-composition.md)

## What it is

Ability ID: **`elementor/manage-global-variable`**

Bulk CRUD for global design tokens on the active kit (`--label: value`). Permission: `manage_options`.

## Public API

| Symbol | Signature | Purpose |
|--------|-----------|---------|
| `Manage_Variable_Ability` | `execute( array $input ): array` | `operations[]`: `create` \| `update` \| `delete` |
| `Manage_Variable_Guide_Ability` | `execute()` → guide text | Resource: `elementor://variables/tools/manage-global-variable-guide` |
| Ability ID | `elementor/manage-global-variable` | Stable MCP host identifier |

Verified: `manage-variable-ability.php`, `manage-variable-guide-ability.php`.

## When to use it

- Before styling in `build-composition` or `manage-classes` — create tokens referenced as `var(--label)`
- To rename or update variable values
- To delete unused variables (destructive — confirm with user)

Always read `elementor://global-variables` first for existing labels, ids, and `watermark`.

## Key concepts

### Input

| Field | Required | Description |
|-------|----------|-------------|
| `operations` | yes | Array of 1–50 operation objects |

### Variable types

| `type` value | Value format | Availability |
|--------------|--------------|--------------|
| `global-color-variable` | CSS color: `#FF0000`, `rgba(...)`, `hsl(...)` | Always |
| `global-font-variable` | Font family name only: `Roboto`, `Playfair Display` | Always |
| `global-size-variable` | Simple length + unit: `16px`, `1.5rem`, `2em` | Elementor Pro |
| `global-custom-size-variable` | CSS functions/keywords: `auto`, `clamp(...)`, `calc(...)`, `300ms` | Elementor Pro |

**Never** put px/rem values in `global-font-variable` — use size types instead.

### Operation shapes

| action | Required fields |
|--------|-----------------|
| `create` | `type`, `label`, `value` |
| `update` | `id`, `label`, `value` |
| `delete` | `id` |

### Label rules

- Lowercase letters, digits, dashes, underscores only
- No spaces or special characters
- Must be unique — check `elementor://global-variables` before create
- Example rename: `"Headline Primary"` → `headline-primary`

### Examples

Create brand color:

```json
{ "action": "create", "type": "global-color-variable", "label": "brand-primary", "value": "#1A73E8" }
```

Update value (keep exact label):

```json
{ "action": "update", "id": "abc123", "label": "brand-primary", "value": "#0D47A1" }
```

Rename (keep existing value):

```json
{ "action": "update", "id": "abc123", "label": "brand-secondary", "value": "#1A73E8" }
```

### Output

```json
{
  "status": "completed",
  "results": [ { "index": 0, "action": "create", "status": "ok", "id": "...", "label": "brand-primary" } ],
  "watermark": 42
}
```

`watermark` increments on successful batch — use to detect stale reads of `elementor://global-variables`.

### Limits

Max **50** operations per request.

## Extension

New variable types register through `Variable_Types_Registry` and `elementor/variables/register` hook. See [../../variables/types.md](../../variables/types.md).

## Internals

- Delegates to `Variables_Service::process_batch()` with `Variables_Repository` on active kit
- Clears file cache and runtime object cache after mutations
- Detailed agent guide resource: `elementor://variables/tools/manage-global-variable-guide` (`Manage_Variable_Guide_Ability`, ability ID `elementor/manage-global-variable-guide`) — Pro-aware type list

## See also

- [../resources.md](../resources.md) — `elementor://variables/tools/manage-global-variable-guide` (full operations guide: naming rules, Pro types, examples)
- [../composition-workflow.md](../composition-workflow.md) — step 3
- [../../variables/usage-in-styles.md](../../variables/usage-in-styles.md) — `var(--label)` in CSS
