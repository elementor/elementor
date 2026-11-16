# Prop type migrations

> Audience: internal
> Module: `modules/atomic-widgets/prop-type-migrations/`
> Related: [backward-compatibility.md](./backward-compatibility.md), [../fundamentals/prop-types.md](../fundamentals/prop-types.md), [../../../migrations/README.md](../../../migrations/README.md)

## What it is

Prop-type migration system — not a general data-migration framework. `Migrations_Orchestrator` walks stored JSON, compares each prop's `$$type` to the current PHP schema, and applies declarative JSON operations on mismatch. Structural only (rename keys, change `$$type`, move fields); value transforms belong in [transformers](../fundamentals/transformers.md).

Manifests: repo root `migrations/` (`manifest.json` + `operations/*.json`). On rollback, remote manifest from `https://editor.elementor.com/v1/migrations/` with local fallback.

## Public API

| Symbol | Signature | Purpose |
|--------|-----------|---------|
| `Migrations_Orchestrator` | `migrate( array &$data, int $id, string $identifier, callable $save ): void` | Full pipeline: cache → walk → save |
| `Migration_Interpreter` | `run( array $schema, array $data, string $direction ): array` | Execute `up`/`down` ops (`set`, `delete`, `move`) |
| `Migrations_Loader` | `find_migration_path( string $from, string $to ): ?array` | Shortest path in manifest graph |
| `Migrations_Loader` | `load_operations( string $migration_id ): ?array` | Load operation file |
| `Migrations_Loader` | `get_manifest_hash(): string` | Cache fingerprint input |

Verified: `migrations-orchestrator.php`, `migration-interpreter.php`, `migrations-loader.php`.

## When to use it

- New prop type replaces an old one → manifest entry + operation file
- Rename widget settings key → `widgetKeys` mapping in manifest (rare)
- Debug stale data → check entity migration cache ([backward-compatibility.md](./backward-compatibility.md))

## Key concepts

### Orchestrator pipeline

1. Check per-entity cache (`Migrations_Cache`)
2. Walk tree; for objects with `$$type`, resolve expected type via `Schema_Resolver`
3. On mismatch, find shortest path in manifest (`up` or `down`)
4. Execute via `Migration_Interpreter`
5. Handle widget-key renames under `settings`
6. Persist via `$save_callback`; mark migrated

| Path segment | Schema source |
|--------------|---------------|
| `settings` | Element `get_props_schema()` |
| `variants` → `props` | `Style_Schema::get()` |
| `interactions` → `items` | `Interactions_Schema::get()` |

### Manifest format

```json
{
  "widgetKeys": { "e-form-submit-button": [{ "from": "label", "to": "text" }] },
  "propTypes": {
    "html-v2-to-html-v3": {
      "fromType": "html-v2", "toType": "html-v3",
      "path": "operations/html-v2-to-html-v3.json"
    }
  }
}
```

- **`propTypes`** — directed edges; `Migrations_Loader` finds shortest path
- **`widgetKeys`** — per-widget rename rules when orphaned/missing keys detected

Operation language: `set`, `delete`, `move` with optional conditions. See `migrations/README.md`.

### Bundled prop-type snapshot

| Migration ID | From → To |
|--------------|-----------|
| `string-to-html` | `string` → `html` |
| `html-to-html-v2` | `html` → `html-v2` |
| `html-v2-to-html-v3` | `html-v2` → `html-v3` |
| `border-width-to-border-width-v2` | `border-width` → `border-width-v2` |
| `border-radius-to-border-radius-v2` | `border-radius` → `border-radius-v2` |
| `number-to-size` | `number` → `size` |
| `number-to-number-range` | `number` → `number-range` |
| `image-src-to-svg-src` | `image-src` → `svg-src` |
| `config-to-config-v2` | `config` → `config-v2` |
| `email-to-emails` | `email` → `emails` |
| `string-to-font-family` | `string` → `font-family` |

Snapshot — new migrations ship with releases.

## Extension

Manifests are bundled (or fetched remotely on rollback). Third-party prop types should avoid breaking `$$type` keys; coordinate with core for breaking renames.

Override local path: `ELEMENTOR_MIGRATIONS_PATH` constant. Remote manifest cached in transient `elementor_migrations_manifest` (12h TTL).

## Internals

| Class | Role |
|-------|------|
| `Path_Resolver` | Wildcard paths (`value.*`, `value.items[*]`) |
| `Schema_Resolver` | Data path → expected `Prop_Type` |
| `Migrations_Cache` | Per-entity state in `_elementor_migrations_state_*` post meta |

## See also

- [backward-compatibility.md](./backward-compatibility.md) — triggers and hooks
- [../global-classes/data-model.md](../global-classes/data-model.md) — global class storage
