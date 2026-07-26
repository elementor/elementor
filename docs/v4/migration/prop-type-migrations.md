# Prop type migrations

> Audience: internal
> Module: `modules/atomic-widgets/prop-type-migrations/`
> Status: draft
> Related: [backward-compatibility.md](./backward-compatibility.md), [../fundamentals/prop-types.md](../fundamentals/prop-types.md), [../../migrations/README.md](../../migrations/README.md)

## What it is

A **prop-type migration system** — not a general data-migration framework. `Migrations_Orchestrator` walks stored JSON, compares each prop's `$$type` against the current PHP schema, and applies declarative JSON operations when a type mismatch is found. Migrations are structural only (rename keys, change `$$type`, move nested fields); value transformations belong in [transformers](../fundamentals/transformers.md).

Bundled manifests live at repo root `migrations/` (`manifest.json` + `operations/*.json`). On plugin rollback, the orchestrator can load a remote manifest from `https://editor.elementor.com/v1/migrations/` with local fallback.

## When to use it

- **Adding a new prop type** that replaces an older one — register a manifest entry and operation file, then add the old type's key to the schema union or remove it so a mismatch triggers migration.
- **Renaming a widget settings key** — add a `widgetKeys` mapping in the manifest (rare; most changes are prop-type migrations).
- **Debugging stale editor data** after a schema bump — check whether `e_bc_migrations` is active and whether the entity's migration cache is current (see [backward-compatibility.md](./backward-compatibility.md)).

## Key concepts

### Orchestrator pipeline

`Migrations_Orchestrator::migrate()` runs these steps:

1. Check per-entity cache (`Migrations_Cache`) keyed by entity ID, data identifier, and manifest hash.
2. Walk the data tree; for each object with `$$type`, resolve the expected type via `Schema_Resolver` (widget settings, style props, or interactions).
3. If `$$type` ≠ expected type, find the shortest migration path in the manifest graph (`up` or `down`).
4. Execute operations through `Migration_Interpreter` (`set`, `delete`, `move` with optional conditions).
5. Handle widget-key renames when orphaned/missing keys are detected under `settings`.
6. Persist via the caller's `$save_callback` and mark the entity migrated.

`Schema_Resolver` contexts:

| Path segment | Schema source |
|--------------|---------------|
| `settings` (under a widget/element) | `get_props_schema()` on the element instance |
| `variants` → `props` | `Style_Schema::get()` |
| `interactions` → `items` | `Interactions_Schema::get()` |

### Manifest format

`migrations/manifest.json` has two top-level maps:

```json
{
  "widgetKeys": {
    "e-form-submit-button": [{ "from": "label", "to": "text" }]
  },
  "propTypes": {
    "html-v2-to-html-v3": {
      "fromType": "html-v2",
      "toType": "html-v3",
      "path": "operations/html-v2-to-html-v3.json"
    }
  }
}
```

- **`propTypes`** — directed edges in a migration graph; `Migrations_Loader` finds the shortest path between any two registered types.
- **`widgetKeys`** — per-widget-type rename rules; applied only when exactly one valid target key exists among schema orphans/missing keys.

Each operation file defines bidirectional `up` / `down` arrays. Paths are relative to the **prop root** (e.g. `$$type`, `value.content`). See `migrations/README.md` for the full operation language.

### Example: `html-v2` → `html-v3`

Up migration wraps `value.content` in a nested `string` prop and updates `$$type`:

```json
{
  "up": [
    { "op": { "fn": "move", "src": "value.content", "dest": "value.content.value", "clean": false } },
    { "op": { "fn": "set", "path": "value.content.$$type", "value": "string" },
      "condition": { "fn": "exists", "path": "value.content.value" } },
    { "op": { "fn": "set", "path": "$$type", "value": "html-v3" } }
  ]
}
```

### Example: border logical properties

`border-width` → `border-width-v2` renames physical keys (`top`, `right`, `bottom`, `left`) to logical keys (`block-start`, `inline-end`, `block-end`, `inline-start`). A sibling migration exists for `border-radius` → `border-radius-v2`. These run on style props in documents **and** on global-class variant props (same orchestrator, different data identifier).

### Example: global classes

Global class posts store style variants under kit meta (`_elementor_global_classes`). `Global_Class_Post::migrate_data()` calls the same `Migrations_Orchestrator::migrate()` with the class post ID and meta key. Prop-type mismatches inside `items[].variants[].props` are migrated independently from document `_elementor_data`.

### Bundled prop-type snapshot (current manifest)

| Migration ID | From | To |
|--------------|------|-----|
| `string-to-html` | `string` | `html` |
| `html-to-html-v2` | `html` | `html-v2` |
| `html-v2-to-html-v3` | `html-v2` | `html-v3` |
| `border-width-to-border-width-v2` | `border-width` | `border-width-v2` |
| `border-radius-to-border-radius-v2` | `border-radius` | `border-radius-v2` |
| `number-to-size` | `number` | `size` |
| `number-to-number-range` | `number` | `number-range` |
| `image-src-to-svg-src` | `image-src` | `svg-src` |
| `config-to-config-v2` | `config` | `config-v2` |
| `email-to-emails` | `email` | `emails` |
| `string-to-font-family` | `string` | `font-family` |

Label this table as a snapshot — new migrations ship with plugin releases.

## Extension

N/A — migration manifests are bundled (or fetched remotely on rollback). Third-party prop types should avoid breaking `$$type` keys; if a breaking rename is unavoidable, coordinate with core to add a manifest entry.

## Internals

| Class | Role |
|-------|------|
| `Migrations_Orchestrator` | Entry point; `migrate()`, `register_hooks()`, cache helpers |
| `Migrations_Loader` | Manifest graph, shortest-path search, operation file loading |
| `Migration_Interpreter` | Executes `set` / `delete` / `move` with conditions |
| `Path_Resolver` | Wildcard path resolution (`value.*`, `value.items[*]`) |
| `Schema_Resolver` | Maps data path → expected `Prop_Type` instance |
| `Migrations_Cache` | Per-entity state in `_elementor_migrations_state_*` post meta |

Override local manifest path with the `ELEMENTOR_MIGRATIONS_PATH` constant.

Remote manifest is cached in transient `elementor_migrations_manifest` (12-hour TTL), invalidated on Elementor version change.

## See also

- [backward-compatibility.md](./backward-compatibility.md) — experiment gate and document-load hook
- [../fundamentals/transformers.md](../fundamentals/transformers.md) — value transformation (not migration)
- [../global-classes/data-model.md](../global-classes/data-model.md) — global class storage shape
- [../../migrations/README.md](../../migrations/README.md) — authoring guide for new operation files
