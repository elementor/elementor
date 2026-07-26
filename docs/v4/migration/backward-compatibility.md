# Backward compatibility migrations

> Audience: both
> Module: `modules/atomic-widgets/prop-type-migrations/`
> Status: draft
> Related: [prop-type-migrations.md](./prop-type-migrations.md), [../getting-started/experiments.md](../getting-started/experiments.md), [../opt-in/activation.md](../opt-in/activation.md)

## What it is

Automatic, in-place upgrades of stored atomic prop data when PHP/JS schemas move ahead of saved JSON. Gated by the hidden experiment **`e_bc_migrations`** (`Migrations_Orchestrator::EXPERIMENT_BC_MIGRATIONS`). When active, migrations run lazily on data load, persist corrected JSON back to the database, and cache the result so the same entity is not re-processed until the manifest or plugin version changes.

This is distinct from the v4 **opt-in** flow — opt-in toggles feature experiments; BC migrations reconcile existing saved data with the current schema.

## When to use it

- **Site owners / power users** — leave `e_bc_migrations` active (default) so opening a page or global class silently upgrades stale prop shapes. Disabling it stops automatic writes but may leave editor/frontend mismatches until data is manually fixed.
- **Internal contributors** — register a new experiment in `$migrations_affecting_features` when a feature flag changes style/settings schema in ways that require re-running migrations (see Internals).
- **Addon authors** — listen to `elementor/document/after_migrate` if your module stores derived data that must be rebuilt after a document migration (components module does this).

## Key concepts

### Experiment `e_bc_migrations`

Registered in `modules/atomic-widgets/module.php`:

| Property | Value |
|----------|-------|
| Name | `e_bc_migrations` |
| Title | Backward compatibility migrations |
| Default | **Active** |
| Release status | Dev |
| Hidden | Yes |

`Migrations_Orchestrator::is_active()` returns whether this experiment is on. All orchestrator hooks no-op when it is off.

### Document-load hook

When active, the orchestrator registers:

```
elementor/document/load/data
```

Callback: `Migrations_Orchestrator::migrate_doc()` — migrates `_elementor_data` for the loaded document, clears document cache meta, writes updated JSON, then fires `elementor/document/after_migrate`.

The same filter is also applied from `core/base/document.php` (editor load) and `includes/frontend.php` (frontend render), so migrations can run in both contexts.

### Global classes and other entities

Documents are not the only migration target:

| Data | Identifier meta key | Trigger |
|------|-------------------|---------|
| Page/kit document tree | `_elementor_data` | `elementor/document/load/data` filter |
| Global class post | `_elementor_global_classes` (or preview meta) | `Global_Class_Post::get_data()` |

Each entity is cached independently by `(post_id, data_identifier, manifest_hash)`.

### Cache invalidation

`Migrations_Cache` stores a fingerprint of `ELEMENTOR_VERSION` (+ Pro version if defined) and the manifest MD5 hash. Cache clears when:

- `Migrations_Orchestrator::clear_migration_cache()` is called (e.g. feature-flag state change)
- Elementor version changes (fingerprint mismatch)
- Manifest content changes (hash mismatch)
- Per-entity: `Migrations_Orchestrator::clear_entity_migration_cache( $id, $data_identifier )` — used after global-class import

### Feature-affecting flags

`Migrations_Orchestrator::register_affecting_feature_flag_hooks( $features )` attaches `clear_migration_cache` to `elementor/experiments/feature-state-change/{feature}` for each listed experiment.

Currently `$migrations_affecting_features` is an **empty array** in `modules/atomic-widgets/module.php` — the hook infrastructure exists but no experiments are registered yet. When a feature changes schema at runtime, add its experiment name here so toggling it forces migrations to re-run.

### Post-migrate action

```
elementor/document/after_migrate
```

Arguments: `( Document $document, array $migrated_data )`

Known consumer: **components module** — on `Component_Document`, calls `align_overridable_props_with_elements()` after migration so override props match nested element schemas.

### Rollback behavior

If `ELEMENTOR_VERSION` is lower than the stored upgrade version (`Migrations_Orchestrator::is_rollback()`), the orchestrator loads the remote manifest from `https://editor.elementor.com/v1/migrations/` (with bundled local fallback) so downgrade paths (`down` operations) are available.

## Extension

### `elementor/document/after_migrate`

```php
add_action( 'elementor/document/after_migrate', function ( $document, $migrated_data ) {
    // Rebuild derived caches, notify integrations, etc.
}, 10, 2 );
```

Only fires when migration actually changed and persisted document data.

### `elementor/document/load/data`

Lower-priority filters can run before/after migration. The orchestrator uses priority `10`. Avoid mutating prop `$$type` values in other filters unless you understand cache interaction.

### Registering a feature-affecting experiment

When your experiment changes atomic schema at toggle time, append its name to `$migrations_affecting_features` in `modules/atomic-widgets/module.php` so migration caches invalidate on state change.

## Internals

Activation check: `Migrations_Orchestrator::is_active()` → `experiments->is_feature_active( 'e_bc_migrations' )`.

Migration state meta key pattern: `_elementor_migrations_state_{hash}` where hash is the first 4 hex chars of `md5( $data_identifier )`.

On failure, `Logger::warning()` records entity ID and error; original data is left unchanged.

Singleton lifecycle: `Migrations_Orchestrator::make()` / `::destroy()` — tests call `destroy()` to reset loaders.

## See also

- [prop-type-migrations.md](./prop-type-migrations.md) — manifest format and operation language
- [../getting-started/experiments.md](../getting-started/experiments.md) — full experiment matrix
- [../components/instances-and-overrides.md](../components/instances-and-overrides.md) — overridable props aligned post-migrate
- [../global-classes/data-model.md](../global-classes/data-model.md) — global class meta keys
