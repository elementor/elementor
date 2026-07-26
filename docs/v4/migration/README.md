# Migration

> Status: draft

## Purpose

Reference for how Elementor v4 upgrades stored atomic data when prop-type schemas change. Covers the `Migrations_Orchestrator`, bundled manifest/operations, and the `e_bc_migrations` experiment gate.

## Files

| File | Covers |
|------|--------|
| [prop-type-migrations.md](./prop-type-migrations.md) | Orchestrator pipeline, manifest format, operation interpreter, concrete migration examples |
| [backward-compatibility.md](./backward-compatibility.md) | `e_bc_migrations` experiment, document-load hook, cache invalidation, post-migrate actions |

## Reading order

1. [prop-type-migrations.md](./prop-type-migrations.md) — understand what triggers a migration and how manifests are structured
2. [backward-compatibility.md](./backward-compatibility.md) — when migrations run, how they are gated, and which hooks fire afterward

## Related

- [../fundamentals/prop-types.md](../fundamentals/prop-types.md) — prop-type taxonomy that migrations align data to
- [../fundamentals/prop-value.md](../fundamentals/prop-value.md) — `{ $$type, value }` shape migrations operate on
- [../global-classes/data-model.md](../global-classes/data-model.md) — kit-scoped class storage migrated via the same orchestrator
- [../opt-in/activation.md](../opt-in/activation.md) — enabling v4 experiments that may introduce schema changes requiring migration
- [../../migrations/README.md](../../migrations/README.md) — upstream manifest authoring guide (repo root `migrations/`)
