# Global Classes Overview

> Audience: both
> Module: `modules/global-classes/`, `packages/packages/core/editor-global-classes/`
> Status: draft
> Related: [data-model.md](./data-model.md), [applying-classes.md](./applying-classes.md), [../fundamentals/prop-types.md](../fundamentals/prop-types.md)

## What it is

**Global Classes** are kit-scoped, reusable style definitions — think design-system utility classes (e.g. `wc26-gold`, `hero-heading`) stored once on the active Site Kit and applied to any atomic element in any document on that kit.

Each class is a `StyleDefinition` with `type: "class"`, a human-readable **label** (the public identifier), and one or more **variants** (breakpoint/state style props validated against `Style_Schema`).

The feature is gated by experiment **`e_classes`** (`Module::NAME` in `modules/global-classes/module.php`). It loads only when both `e_classes` and `e_atomic_elements` are active. On new sites installed at Elementor 4.0.0+, `e_classes` defaults to active.

### Two different "classes" concepts

Do not conflate these:

| Concept | Location | Role |
|---------|----------|------|
| **Global Classes module** | `modules/global-classes/` | Kit-level style library — CRUD, storage, CSS generation, usage tracking |
| **`Classes_Prop_Type`** | `modules/atomic-widgets/prop-types/classes-prop-type.php` | Widget **settings prop** (`classes`) — an ordered array of class references attached to an element |

`Classes_Prop_Type` is the *wire*; the Global Classes module is the *library*. An element's `classes` prop holds **internal class ids** (e.g. stored as `g-xxxxx`); at render time those ids resolve to **labels** (the CSS class names authors see). See [applying-classes.md](./applying-classes.md).

## When to use it

- Define reusable visual tokens (typography, spacing, color treatments) shared across pages without duplicating local styles.
- Build a kit-level design system that travels with kit import/export.
- Let agents create and apply classes via MCP (`elementor/manage-classes`, `elementor://global-classes`) before composing elements.

Avoid global classes for one-off, element-specific overrides — use **local styles** (`label: "local"` on the element's `styles` map) instead.

## Key concepts

| Term | Meaning |
|------|---------|
| **Label** | Public id — the CSS class name (e.g. `wc26-gold`). What authors, agents, and MCP `classes` maps use. |
| **Internal id** | Stable storage key (`g-*`, generated via `Utils::generate_id( 'g-', … )`). Stored in element `classes` prop values and kit order/labels meta. |
| **Order** | Kit-level array defining cascade precedence among global classes. Lower-index classes are overridden by higher-index classes when properties conflict. |
| **Preview vs frontend** | Draft edits use `context=preview`; published state uses `context=frontend`. The editor saves drafts to preview meta, then publishes to frontend. |
| **Kit binding** | All global class posts and kit meta (`order`, `labels`, `post_ids` map) belong to the active kit. New kits clone classes from the previous kit. |

Global class CSS is registered through `Atomic_Global_Styles` with cache key `STYLES_KEY = 'global'`, producing per-document `global-{postId}-*.css` bundles for classes used on that document.

## Extension

N/A — global classes are not extended via a public registration hook. Third-party code should interact through REST (`api.md`) or MCP abilities. To add the `classes` prop to a custom atomic widget, use `Classes_Prop_Type::make()` in `define_props_schema()` (documented in [../atomic-widgets/authoring-widgets.md](../atomic-widgets/authoring-widgets.md)).

## Internals

**PHP module** (`modules/global-classes/module.php`) registers on boot when experiments pass:

- CPT `e_global_class` (`Global_Class_Post_Type::CPT`)
- `Global_Classes_REST_API` — REST endpoints under `elementor/v1/global-classes`
- `Atomic_Global_Styles` — hooks `elementor/atomic-widgets/styles/register` to emit document-level global CSS
- `Global_Classes_Relations` — tracks which documents use which class ids
- `Global_Classes_Usage` — usage index for the class manager UI
- Import/export runners (`global-classes.json` in kit archives)
- Editor package `editor-global-classes` via `elementor/editor/v2/packages` filter

**JS package** (`packages/packages/core/editor-global-classes/`) provides:

- Redux store (`store.ts`) with `items` + `order`, draft/publish via `apiClient.saveDraft` / `apiClient.publish`
- `globalClassesStylesProvider` — registers with `@elementor/editor-styles-repository` at `priority: 30`
- Class manager panel, usage popover, MCP in-editor tools (`manage-classes-tool.ts`)

Hooks worth knowing:

- `elementor/global_classes/update` — fired after repository mutations; triggers CSS cache invalidation
- `elementor/global_classes/cleanup` — fired after deletions; strips orphaned class refs from documents
- `elementor/atomic-widgets/settings/transformers/classes` — maps internal ids → labels at render time

## See also

- [data-model.md](./data-model.md) — storage layout
- [applying-classes.md](./applying-classes.md) — element attachment and cascade
- [api.md](./api.md) — REST and MCP surfaces
- [../getting-started/experiments.md](../getting-started/experiments.md) — `e_classes` dependencies
