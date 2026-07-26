# Variables API

> Audience: external
> Module: `modules/variables/classes/rest-api.php`, `modules/mcp/abilities/`
> Status: draft
> Related: [overview.md](./overview.md), [../mcp/abilities/manage-global-variable.md](../mcp/abilities/manage-global-variable.md), [../mcp/resources.md](../mcp/resources.md)

## What it is

External surfaces for reading and mutating kit variables: WordPress REST routes under `elementor/v1/variables`, kit import/export file `global-variables.json`, and MCP abilities/resources for agent integrators.

All operations target the **active kit**. Responses include a **watermark** for optimistic concurrency on writes.

## When to use it

- Build editor-adjacent tools that list or edit design tokens.
- Import/export variables with Site Kits (`settings` include + `variables` customization flag).
- Let LLM agents discover tokens before styling (`elementor://global-variables`) and CRUD via `elementor/manage-global-variable`.

## Key concepts

### Storage shape

Kit post meta key: `_elementor_global_variables`.

Serialized collection (also the payload inside `global-variables.json`):

```json
{
  "data": {
    "e-gv-abc123": {
      "type": "global-color-variable",
      "label": "wc26-gold",
      "value": "#C6A15B",
      "order": 1
    }
  },
  "watermark": 5,
  "version": 2
}
```

`value` may be a PropValue object after v2 storage encoding (`Prop_Type_Adapter`). Labels: max 50 chars, no spaces. Ids: max 64 chars.

### REST endpoints

Namespace: `elementor/v1`. Base: `variables`.

| Route | Method | Capability | Purpose |
|-------|--------|------------|---------|
| `/variables/list` | GET | `edit_posts` | List all variables + watermark |
| `/variables/create` | POST | `manage_options` | Create (`type`, `label`, `value`) |
| `/variables/update` | PUT/PATCH | `manage_options` | Update (`id`, `label`, `value`, optional `order`, `type`) |
| `/variables/delete` | POST | `manage_options` | Soft-delete (`id`) |
| `/variables/restore` | POST | `manage_options` | Restore deleted (`id`, optional overrides) |
| `/variables/batch` | POST | `manage_options` | Batch ops (`watermark`, `operations[]`) |

`type` on create/update must be a key from `Variable_Types_Registry::all()`. Valid batch operation types: `create`, `update`, `delete`, `restore`, `reorder`.

Success envelope: `{ "success": true, "data": { ... } }`. Writes clear Elementor CSS cache.

### Kit export / import

Export runner: `ImportExportCustomization\Runners\Export` (name `global-variables`). Writes file path `global-variables` → **`global-variables.json`** in the kit archive when `include` contains `settings` and variables customization is enabled.

Import reads `{extracted_directory}/global-variables.json` (`runners/import.php`). Conflict resolution via design-system import context (`variablesOverrideAll`).

Meta preserved on kit import: `_elementor_global_variables` (`Module::add_meta_to_preserve_on_kit_import`).

### MCP

| Ability / resource | ID / URI | Role |
|--------------------|----------|------|
| List resource | `elementor://global-variables` | JSON: `{ variables, total, watermark }` — ability `elementor/global-variables-resource` |
| CRUD ability | `elementor/manage-global-variable` | Bulk create/update/delete (1–50 ops); destructive |
| Guide resource | `elementor://variables/tools/manage-global-variable-guide` | Plain-text how-to; ability `elementor/manage-global-variable-guide` |

**manage-global-variable** input:

```json
{
  "operations": [
    { "action": "create", "type": "global-color-variable", "label": "wc26-gold", "value": "#C6A15B" },
    { "action": "update", "id": "e-gv-abc123", "label": "wc26-gold", "value": "#B8860B" },
    { "action": "delete", "id": "e-gv-xyz789" }
  ]
}
```

Allowed types: `global-color-variable`, `global-font-variable`, `global-size-variable`, `global-custom-size-variable` (size types require Pro — guide text adapts via `Manage_Variable_Guide_Ability::build_guide()`).

Always read `elementor://global-variables` before create to avoid duplicate labels. Use **labels** in composition CSS, **ids** in update/delete.

In-editor MCP tools also register under the `variables` domain (`editor-variables/src/init.ts`); see [../mcp/registering-editor-tools.md](../mcp/registering-editor-tools.md).

## Extension

Register types on `elementor/variables/register` before calling REST create/batch — see [types.md](./types.md). New types automatically pass `is_valid_variable_type()` validation.

Filter `elementor/variables/css_entry_additional` for extra per-variable CSS at render time (advanced).

## Internals

N/A — see `classes/rest-api.php`, `services/variables-service.php`, `storage/variables-repository.php`.

## See also

- [types.md](./types.md) — valid `type` keys
- [usage-in-props.md](./usage-in-props.md) — how ids appear in saved styles
- [../mcp/abilities/manage-global-variable.md](../mcp/abilities/manage-global-variable.md) — full ability reference
- [../mcp/composition-workflow.md](../mcp/composition-workflow.md) — variables → classes → elements
- [../global-classes/api.md](../global-classes/api.md) — parallel kit-scoped REST patterns
