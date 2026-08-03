# Variables API

> Audience: external
> Module: `modules/variables/classes/rest-api.php`, `modules/mcp/abilities/`
> Related: [overview.md](./overview.md), [../mcp/abilities/manage-global-variable.md](../mcp/abilities/manage-global-variable.md), [../mcp/resources.md](../mcp/resources.md)

## What it is

External surfaces for kit variables: REST under `elementor/v1/variables`, kit file `global-variables.json`, and MCP abilities/resources.

All operations target the **active kit**. Writes require a **watermark** for optimistic concurrency.

## When to use it

- Editor-adjacent tools listing or editing design tokens
- Kit import/export (`settings` include + variables customization)
- LLM agents: discover via `elementor://global-variables`, CRUD via `elementor/manage-global-variable`

## Key concepts

### Storage shape

Kit meta: `_elementor_global_variables`.

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

Labels: max 50 chars, no spaces. Ids: max 64 chars.

### REST endpoints

Namespace: `elementor/v1`. Base: `variables`.

| Route | Method | Capability | Purpose |
|-------|--------|------------|---------|
| `/variables/list` | GET | `edit_posts` | List all + watermark |
| `/variables/create` | POST | `manage_options` | Create (`type`, `label`, `value`) |
| `/variables/update` | PUT/PATCH | `manage_options` | Update (`id`, `label`, `value`, optional `order`, `type`) |
| `/variables/delete` | POST | `manage_options` | Soft-delete (`id`) |
| `/variables/restore` | POST | `manage_options` | Restore (`id`, optional overrides) |
| `/variables/batch` | POST | `manage_options` | Batch ops (`watermark`, `operations[]`) |

`type` must be a key from `Variable_Types_Registry::all()`. Batch ops: `create`, `update`, `delete`, `restore`, `reorder`.

### MCP

| ID / URI | Role |
|----------|------|
| `elementor://global-variables` | `{ variables, total, watermark }` |
| `elementor/manage-global-variable` | Bulk create/update/delete (1–50 ops) |

```json
{
  "operations": [
    { "action": "create", "type": "global-color-variable", "label": "wc26-gold", "value": "#C6A15B" },
    { "action": "update", "id": "e-gv-abc123", "label": "wc26-gold", "value": "#B8860B" },
    { "action": "delete", "id": "e-gv-xyz789" }
  ]
}
```

Use **labels** in composition CSS, **ids** in update/delete.

### Kit export / import

File: `global-variables.json`. Import conflict resolution via `variablesOverrideAll`.

## Public API

| Symbol | Signature | Purpose |
|--------|-----------|---------|
| `Rest_Api` | `public function register_routes(): void` | Register all REST routes |
| `Rest_Api` | `const API_NAMESPACE = 'elementor/v1'` | Namespace |
| `Variables_Repository` | `public function load(): Variables_Collection` | Read kit collection |
| `Variables_Repository` | `public function save( Variables_Collection $collection )` | Persist; returns new watermark |
| `Variables_Service` | `public function load()` | Serialized list + watermark |
| `Variables_Service` | `public function process_batch( array $operations, bool $lenient = false )` | Batch CRUD |
| `Variables_Service` | `public function find_by_label_or_id( string $needle ): ?array` | Label/id lookup |
| `apiClient` (JS) | `list()` | `GET /variables/list` |
| `apiClient` (JS) | `create( type, label, value )` | `POST /variables/create` |
| `apiClient` (JS) | `update( id, label, value, type? )` | `PUT /variables/update` |
| `apiClient` (JS) | `batch( { watermark, operations } )` | `POST /variables/batch` |
| `service` (JS) | `load()` / `create()` / `update()` / `delete()` | Editor service wrapping apiClient |

Source: `classes/rest-api.php`, `storage/variables-repository.php`, `services/variables-service.php`, `editor-variables/src/api.ts`, `editor-variables/src/service.ts`.

## Extension

Register types on `elementor/variables/register` before REST create/batch — see [types.md](./types.md). Filter `elementor/variables/css_entry_additional` for extra per-variable CSS.

## Internals

See `classes/rest-api.php`, `services/variables-service.php`, `storage/variables-repository.php`.

## See also

- [types.md](./types.md)
- [usage-in-props.md](./usage-in-props.md)
- [../mcp/abilities/manage-global-variable.md](../mcp/abilities/manage-global-variable.md)
- [../global-classes/api.md](../global-classes/api.md)
