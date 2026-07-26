# Elementor v4 Documentation

> Status: draft

Internal reference for Elementor Editor v4 — atomic widgets, global classes, variables, interactions, components, dynamic tags, CSS converter, editor packages, MCP (v4-specific surface), migration, and opt-in.

This tree lives at `docs/v4/` in the Elementor repository. It is **not published** today; `elementor/docs/README.md` notes that developer docs moved to [developers.elementor.com](https://developers.elementor.com). Treat this tree as an internal, LLM/agent-integrator, and power-user reference.

---

## Scope boundaries

| Effort | Location | How this tree relates |
|--------|----------|------------------------|
| Addon-authoring tutorial track | `elementor-developers-docs` → `docs-plan-v4-atomic-widgets.md` (branch `feature/vitepress-migration`) | **Not a substitute.** Cross-link to [developers.elementor.com](https://developers.elementor.com) for the published tutorial path; `docs/v4/` is additive reference. |
| General MCP / WP Abilities host-connectivity | Not yet started (e.g. future `docs/mcp/`) | **Out of scope.** `modules/mcp/module.php` registers PHP abilities unconditionally (no experiment gate). General abilities (`get-structure`, `create-page`, `update-settings`, `list-resources`, `read-resource`) are deferred to a separate docs folder. |

---

## What v4 is

Editor v4 replaces the legacy control-based widget model with an **atomic** model: typed props (`{ $$type, value }`), a canonical style schema, Twig-based rendering, and a micro-frontend editor (Editor V2) composed of independently loadable JS packages. PHP modules register experiments, REST endpoints, and editor packages; JS packages provide the in-editor UI.

Start with [getting-started/what-is-v4.md](getting-started/what-is-v4.md) and [architecture/overview.md](architecture/overview.md).

---

## Principles

1. **One topic per file** — small, focused pages (target 80–150 lines when filled).
2. **Registration over enumeration** — where a registry, filter, or hook exists for adding new instances (variable types, transformers, MCP tools, editor packages, elements), document *how to register* as primary content. Static catalogs are secondary snapshots, clearly labeled.
3. **Labels not internal ids** — use human-facing labels in examples (`wc26-gold`, not `e-gv-wc26-gold`).
4. **Exact hook names** — filters and actions must match source strings.
5. **Live schemas via MCP** — `get-widget-schema` remains source of truth for widget JSON; do not duplicate full schema dumps here.
6. **Relative cross-links** — link sibling files with relative paths even when targets are not yet written.

---

## Folder map

**Exists today (Phase 1):**

| Folder | Files | Description |
|--------|-------|-------------|
| [getting-started/](getting-started/README.md) | 4 | Orientation, experiments matrix, glossary |
| [architecture/](architecture/README.md) | 4 | System map, data flow, packages table |
| `css-converter.kb.md` | 1 | Legacy KB file (to be migrated in Phase 5) |

**Planned (not yet written):**

| Folder | Files | Description |
|--------|-------|-------------|
| `fundamentals/` | 6 | PropValue, prop types, style schema, transformers, validation |
| `atomic-widgets/` | 6 | Authoring, rendering, hooks, elements catalog |
| `global-classes/` | 5 | Kit-scoped reusable classes |
| `variables/` | 6 | Design tokens and variable types registry |
| `interactions/` | 5 | Element motion and triggers |
| `components/` | 5 | Reusable component documents |
| `dynamic-tags/` | 5 | v3/v4 dynamic tag bridge |
| `css-converter/` | 4 | CSS → atomic props pipeline (replaces `.kb.md`) |
| `editor-packages/` | 5 | Micro-frontend architecture and extension |
| `mcp/` | 6 + `abilities/` (7) | v4-specific MCP surface (two-system disambiguation) |
| `migration/` | 3 | Prop type migrations and BC |
| `opt-in/` | 2 | Activation UX and settings |

74 files total per the [plan](../../docs-plan-v4-documentation.md) (§3).

---

## File templates

Every topic file carries metadata and these sections:

```
# Title
> Audience: external | internal | both
> Module: modules/…
> Status: concept | draft | stable
> Related: relative/links

## What it is
## When to use it
## Key concepts
## Extension (external; or N/A)
## Internals (internal; or N/A)
## See also
```

Folder `README.md` files carry: Purpose, Files table, Reading order, Related.

---

## Audience legend

| Tag | Who |
|-----|-----|
| `external` | Theme/plugin authors, MCP integrators, community extenders |
| `internal` | Elementor R&D; PHP/JS internals |
| `both` | Shared concepts; Extension vs Internals split by audience |

**Caveat:** `external` means "written so an extender could use it," not "currently published." Nothing under `docs/v4/` is distributed today.

---

## Status policy

| Status | Meaning |
|--------|---------|
| `concept` | Structure and scope only; TBD placeholders |
| `draft` | Partial content; not API-stable |
| `stable` | Reviewed; safe for external use |

Files in this Phase 1 batch are `draft`.

---

## Future skills map

Planned 1:1 folder → Cursor skill mapping (stable paths — do not rename folders after skills ship):

| Skill | Reads |
|-------|-------|
| `v4-fundamentals` | `fundamentals/**` |
| `v4-atomic-widgets` | `atomic-widgets/**` + `fundamentals/prop-value.md` |
| `v4-global-classes` | `global-classes/**` |
| `v4-variables` | `variables/**` |
| `v4-interactions` | `interactions/**` |
| `v4-components` | `components/**` |
| `v4-dynamic-tags` | `dynamic-tags/**` |
| `v4-css-converter` | `css-converter/**` |
| `v4-mcp` | `mcp/**` |
| `v4-editor-packages` | `editor-packages/**` |

---

## Reading paths

### External addon developer

1. [getting-started/what-is-v4.md](getting-started/what-is-v4.md)
2. [architecture/overview.md](architecture/overview.md)
3. [fundamentals/prop-value.md](fundamentals/prop-value.md) → [prop-types.md](fundamentals/prop-types.md) → [style-schema.md](fundamentals/style-schema.md)
4. [atomic-widgets/authoring-widgets.md](atomic-widgets/authoring-widgets.md) → [hooks.md](atomic-widgets/hooks.md)
5. [editor-packages/extending-editor.md](editor-packages/extending-editor.md)
6. [opt-in/activation.md](opt-in/activation.md)
7. Continue on [developers.elementor.com](https://developers.elementor.com) for the full addon tutorial track

### Power user / designer

1. [getting-started/what-is-v4.md](getting-started/what-is-v4.md)
2. [global-classes/applying-classes.md](global-classes/applying-classes.md)
3. [variables/usage-in-styles.md](variables/usage-in-styles.md)
4. [components/overview.md](components/overview.md)
5. [interactions/overview.md](interactions/overview.md)

### LLM / agent integrator

1. [mcp/overview.md](mcp/overview.md) (read "two systems" disambiguation first)
2. [mcp/composition-workflow.md](mcp/composition-workflow.md)
3. [fundamentals/prop-value.md](fundamentals/prop-value.md)
4. [dynamic-tags/binding-propvalues.md](dynamic-tags/binding-propvalues.md)
5. [mcp/abilities/README.md](mcp/abilities/README.md) → per-ability files
6. [atomic-widgets/elements-catalog.md](atomic-widgets/elements-catalog.md)

### Internal contributor

1. [architecture/data-flow.md](architecture/data-flow.md)
2. [architecture/packages-map.md](architecture/packages-map.md)
3. [editor-packages/core-packages.md](editor-packages/core-packages.md)
4. [mcp/registering-editor-tools.md](mcp/registering-editor-tools.md)
5. Module-specific internals sections
6. [migration/README.md](migration/README.md)

---

## Legacy documentation

For v3 widget APIs, controls, and the legacy editor JS API, see [developers.elementor.com](https://developers.elementor.com).
