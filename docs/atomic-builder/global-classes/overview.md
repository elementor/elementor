# Global Classes Overview

> Audience: both
> Module: `modules/global-classes/`, `packages/packages/core/editor-global-classes/`
> Related: [data-model.md](./data-model.md), [applying-classes.md](./applying-classes.md), [../fundamentals/prop-types.md](../fundamentals/prop-types.md)

## What it is

Kit-scoped, reusable style definitions (e.g. `wc26-gold`, `hero-heading`) stored on the active Site Kit and applied to atomic elements via the `classes` prop.

Each class is a `StyleDefinition` with `type: "class"`, a **label** (public CSS name), and **variants** (breakpoint/state style props validated against `Style_Schema`).

Gated by experiment **`e_classes`**. Module boots when **both** `e_classes` and `e_atomic_elements` are active.

| Setting | Value |
|---------|-------|
| Default (existing sites) | inactive |
| New sites (Elementor ≥ 4.0.0) | active |
| Visibility | hidden, alpha |

### Two "classes" concepts

| Concept | Location | Role |
|---------|----------|------|
| **Global Classes module** | `modules/global-classes/` | Kit style library — CRUD, storage, CSS, usage |
| **`Classes_Prop_Type`** | `modules/atomic-widgets/prop-types/classes-prop-type.php` | Element settings prop — ordered class id references |

Element `classes` prop stores **internal ids** (`g-*`); render resolves to **labels** (CSS class names). See [applying-classes.md](./applying-classes.md).

## When to use it

- Reusable visual tokens shared across pages on the same kit
- Kit-level design system for import/export
- Agent workflows: MCP `manage-classes` + `elementor://global-classes` before composition

Use **local styles** (`label: "local"`) for one-off element overrides.

## Key concepts

| Term | Meaning |
|------|---------|
| **Label** | Public CSS class name (e.g. `wc26-gold`) |
| **Internal id** | Stable storage key (`g-*`) in element JSON and kit meta |
| **Order** | Kit array defining cascade precedence; later entries win on conflict |
| **Preview vs frontend** | Draft (`context=preview`) vs published (`context=frontend`) |
| **Kit binding** | All class posts and meta belong to the active kit |

CSS registered via `Atomic_Global_Styles` with key `['global', $post_id, $context]`.

## Public API

| Symbol | Signature | Purpose |
|--------|-----------|---------|
| `Global_Classes_Repository` | `public static function make( ?Kit $kit = null ): self` | Factory |
| `Global_Classes_Repository` | `public function set_preview( bool $is_preview = true ): self` | Switch draft/published context |
| `Global_Classes_Repository` | `public function all( bool $force = false ): Global_Classes` | Full `{ items, order }` |
| `Global_Classes_Repository` | `public function all_labels(): array` | Ordered id → label map |
| `Global_Classes_Repository` | `public function apply_changes( array $touched_items, array $changes, array $order ): void` | Batch create/update/delete |
| `Global_Classes_Parser` | `public static function make(): self` | Factory |
| `Global_Classes_Parser` | `public function parse( $data ): Parse_Result` | Validate `{ items, order }` payload |
| `Global_Classes_REST_API` | `const API_NAMESPACE = 'elementor/v1'` | REST namespace |
| `apiClient` (JS) | `all( context?: 'preview' \| 'frontend' )` | List `{ id, label }` index |
| `apiClient` (JS) | `saveDraft( payload )` / `publish( payload )` | `PUT /global-classes` |
| `globalClassesStylesProvider` | `createStylesProvider({ key, priority: 30, ... })` | Editor styles repository provider |

Source: `global-classes-repository.php`, `global-classes-parser.php`, `global-classes-rest-api.php`, `editor-global-classes/src/api.ts`, `global-classes-styles-provider.ts`.

## Extension

No public registration hook. Interact via REST ([api.md](./api.md)) or MCP. To expose `classes` on a custom widget: `Classes_Prop_Type::make()` in `define_props_schema()`.

## Internals

**PHP:** CPT `e_global_class`, REST, `Atomic_Global_Styles`, `Global_Classes_Relations`, import/export (`global-classes.json`), editor package `editor-global-classes`.

**Hooks:** `elementor/global_classes/update`, `elementor/global_classes/cleanup`, `elementor/atomic-widgets/settings/transformers/classes`.

## See also

- [data-model.md](./data-model.md) — storage layout
- [applying-classes.md](./applying-classes.md) — element attachment
- [api.md](./api.md) — REST and MCP
- [../getting-started/experiments.md](../getting-started/experiments.md)
