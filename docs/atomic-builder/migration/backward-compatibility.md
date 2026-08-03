# Backward compatibility migrations

> Audience: both
> Module: `modules/atomic-widgets/prop-type-migrations/`
> Related: [prop-type-migrations.md](./prop-type-migrations.md), [../getting-started/experiments.md](../getting-started/experiments.md), [../opt-in/activation.md](../opt-in/activation.md)

## What it is

Automatic, in-place upgrades of stored atomic prop data when PHP/JS schemas move ahead of saved JSON. Migrations run lazily on data load, persist corrected JSON, and cache per entity so the same data is not re-processed until the manifest or plugin version changes.

Distinct from v4 **opt-in** — opt-in toggles feature experiments; BC migrations reconcile saved data with the current schema.

## Public API

| Symbol | Signature | Purpose |
|--------|-----------|---------|
| `Migrations_Orchestrator` | `make( ?string $path ): self` | Singleton factory |
| `Migrations_Orchestrator` | `register_hooks(): void` | Attach `elementor/document/load/data` filter |
| `Migrations_Orchestrator` | `migrate( array &$data, int $id, string $identifier, callable $save ): void` | Run migration on any entity tree |
| `Migrations_Orchestrator` | `is_active(): bool` | Always `true` (no experiment gate) |
| `Migrations_Orchestrator` | `clear_migration_cache(): void` | Invalidate all entity caches |
| `Migrations_Orchestrator` | `clear_entity_migration_cache( int $id, string $identifier ): void` | Invalidate one entity |
| `Migration_Interpreter` | `run( array $schema, array $data, string $dir ): array` | Execute `up`/`down` operations on one prop |

Verified: `migrations-orchestrator.php`, `migration-interpreter.php`.

## When to use it

| Role | Action |
|------|--------|
| Site owners | Migrations run automatically on document/global-class load — no configuration needed |
| Contributors | Add manifest entries when bumping prop `$$type` keys ([prop-type-migrations.md](./prop-type-migrations.md)) |
| Addon authors | Hook `elementor/document/after_migrate` to rebuild derived data |

## Key concepts

### Triggers

| Data | Identifier | Trigger |
|------|------------|---------|
| Document tree | `_elementor_data` | `elementor/document/load/data` (also editor load + frontend render) |
| Global class CPT | `_elementor_global_class_data` | `Global_Class_Post::get_data()` |

Each entity cached by `(post_id, data_identifier, manifest_hash)`.

### Cache invalidation

`Migrations_Cache` fingerprint includes `ELEMENTOR_VERSION` and manifest MD5. Clears on version change, manifest change, or `clear_migration_cache()`.

`register_affecting_feature_flag_hooks()` exists but is currently a no-op — no experiments wired to cache invalidation.

### Post-migrate action

```php
add_action( 'elementor/document/after_migrate', function ( $document, $migrated_data ) {
    // Rebuild derived caches
}, 10, 2 );
```

Fires only when migration changed and persisted document data. Known consumer: components module (`align_overridable_props_with_elements()`).

### Rollback

When `ELEMENTOR_VERSION` < stored upgrade version (`is_rollback()`), remote manifest loads from `https://editor.elementor.com/v1/migrations/` with bundled local fallback for `down` operations.

## Extension

### `elementor/document/load/data`

Orchestrator uses priority `10`. Avoid mutating prop `$$type` in other filters without understanding cache interaction.

## Internals

Migration state meta: `_elementor_migrations_state_{hash}` (first 4 hex of `md5( $data_identifier )`).

On failure, `Logger::warning()` records entity ID and error; original data unchanged.

Tests call `Migrations_Orchestrator::destroy()` to reset loaders.

## See also

- [prop-type-migrations.md](./prop-type-migrations.md) — manifest format
- [../global-classes/data-model.md](../global-classes/data-model.md) — global class meta keys
