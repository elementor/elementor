# Architecture Overview

> Audience: both
> Module: (cross-cutting)
> Status: draft
> Related: [data-flow.md](data-flow.md), [packages-map.md](packages-map.md), [../getting-started/experiments.md](../getting-started/experiments.md)

## What it is

Elementor v4 is a **three-layer system**:

1. **PHP modules** — WordPress plugins-in-miniature under `modules/`. Gate features with experiments, register elements/widgets, expose REST/MCP, generate frontend CSS.
2. **Editor V2 packages** — TypeScript/React micro-frontends under `packages/packages/`. Loaded dynamically via webpack externals; communicate through typed package APIs and `@elementor/locations`.
3. **Frontend render** — Twig templates + `Render_Props_Resolver` + `Atomic_Styles_Manager` output HTML and per-post CSS files.

The legacy v1 editor shell (`assets/dev/js/editor/`) still orchestrates the page; v2 packages extend it through `editor-v1-adapters`.

## When to use it

- Onboarding to v4 development — understand where code lives before opening a module.
- Tracing a bug (e.g. "style not applied on frontend") across JS save → PHP parse → CSS file.
- Deciding whether to add PHP, JS, or both for a new feature.

## Key concepts

### High-level diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                        WordPress Admin                               │
│  ┌──────────────┐   experiments    ┌─────────────────────────────┐  │
│  │ atomic-opt-in│◄────────────────►│ e_opt_in_v4, e_atomic_…    │  │
│  └──────────────┘                   └─────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│                     PHP Modules (modules/)                           │
│  atomic-widgets ──┬── global-classes ── variables ── components       │
│                   ├── interactions ── mcp (abilities)                 │
│                   └── css-converter, dynamic-tags bridge              │
│         │ register_widgets/elements    │ REST/MCP                     │
│         │ elementor/editor/v2/packages filter                         │
└─────────┼──────────────────────────────┼──────────────────────────────┘
          │                              │
          ▼                              ▼
┌─────────────────────┐      ┌──────────────────────────────────────┐
│  Editor V2 Packages │      │  External MCP Hosts (Cursor, etc.)   │
│  (packages/packages)│      │  via WP Abilities API + McpAdapter    │
│  editor-canvas       │      │  (no experiment gate)                 │
│  editor-editing-panel│      └──────────────────────────────────────┘
│  editor-global-classes│
│  editor-variables    │      ┌──────────────────────────────────────┐
│  editor-components   │      │  In-editor MCP (editor-mcp package)  │
│  editor-interactions │◄────►│  Angie / WebMCP tool registry        │
│  editor-mcp (lib)    │      │  (editor_mcp experiment — TBD gate)  │
└─────────┬───────────┘      └──────────────────────────────────────┘
          │ document save (REST/AJAX)
          ▼
┌─────────────────────────────────────────────────────────────────────┐
│                     Document JSON (post meta)                        │
│  elements[].settings (PropValues) + elements[].styles (variants)     │
└─────────────────────────────────────────────────────────────────────┘
          │ frontend request
          ▼
┌─────────────────────────────────────────────────────────────────────┐
│                     Frontend Render                                  │
│  Twig templates → Render_Props_Resolver → HTML                       │
│  Atomic_Styles_Manager → CSS_Files_Manager → per-post .css           │
│  Interactions_Frontend_Handler → Motion.js (if e_interactions)      │
└─────────────────────────────────────────────────────────────────────┘
```

### Experiment gates (summary)

| Layer | Primary gate | Notes |
|-------|-------------|-------|
| atomic-widgets module | `e_atomic_elements` | Module constructor returns early if inactive |
| global-classes | `e_classes` + `e_atomic_elements` | |
| variables | `e_variables` + `e_atomic_elements` | |
| components | `e_components` + `e_atomic_elements` | |
| interactions | `e_interactions` + `e_atomic_elements` | |
| MCP PHP abilities | *(none)* | Requires `McpAdapter` class |
| Editor V2 packages | Per-module filters on `elementor/editor/v2/packages` | Plus base `Editor_Loader::EXTENSIONS` |

Full matrix: [../getting-started/experiments.md](../getting-started/experiments.md).

### Package loading lifecycle

From `packages/docs/architecture.md` and `core/editor/loader/editor-loader.php`:

1. **Load** — `wp_enqueue_script` for registered package handles.
2. **Environment** — `elementorEditorEnv` config (REST base URL, placeholders).
3. **Initialize extensions** — each package's `init.ts` runs (register locations, MCP tools, menu items).
4. **Initialize app** — root `editor` package renders.
5. **React lifecycle** — standard component tree.

Packages are added to the enqueue list via:

```php
add_filter( 'elementor/editor/v2/packages', fn( $packages ) => array_merge( $packages, self::PACKAGES ) );
```

Base extensions (`editor-mcp`, `elementor-v3-mcp`, `elementor-kit-mcp`) are in `Editor_Loader::EXTENSIONS`. Module-specific packages (canvas, global-classes, etc.) arrive through the filter.

### PHP ↔ JS contract

| Concern | PHP source | JS consumer |
|---------|-----------|-------------|
| Style schema keys | `Style_Schema::get()` → localized as `settings.atomic.styles_schema` | `@elementor/editor-styles`, canvas |
| Supported size units | `Size_Constants` → `supported_size_units` | editor controls |
| Element types | `register_widgets()` / `register_elements()` | `@elementor/editor-elements` |
| Props schema | per-element `define_props_schema()` + `elementor/atomic-widgets/props-schema` filter | editor-props validation |

## Extension

Add a new v4 feature area:

1. **PHP** — create `modules/your-feature/module.php`, register experiment, hook `elementor/editor/v2/packages`.
2. **JS** — create `packages/packages/core/editor-your-feature/`, export `init.ts`, append package name via the filter.
3. **Docs** — add a folder under `docs/v4/your-feature/`.

Follow the registration pattern in [packages-map.md](packages-map.md) rather than hardcoding package lists in multiple places.

## Internals

### Editor_Loader package tiers

```php
const LIBS = [ 'editor-responsive', 'schema', 'locations', …, 'elementor-mcp-common' ];
const EXTENSIONS = [ 'editor-mcp', 'elementor-v3-mcp', 'elementor-kit-mcp', … ];
// + filtered packages from modules (editor-canvas, editor-global-classes, …)
const APP_PACKAGE = 'editor';
```

`get_packages_to_enqueue()` applies `elementor/editor/v2/packages` filter to `EXTENSIONS`, then merges LIBS.

### atomic-widgets as hub

`modules/atomic-widgets/module.php` is the central v4 module. Its `PACKAGES` constant includes both UI packages and shared libs:

```
editor-canvas, editor-controls, editor-editing-panel, editor-elements,
editor-props, editor-styles, editor-styles-repository, editor-interactions,
editor-templates, editor-design-system
```

Some libs are marked `// TODO: Need to be registered and not enqueued` — they are dependencies pulled transitively.

### Legacy editor coexistence

`editor-v1-adapters` wraps legacy commands, routes, and state. v2 packages subscribe to legacy state changes to stay in sync during the transition period. Adapters are internal-only and planned for removal.

## See also

- [data-flow.md](data-flow.md) — save and render pipeline
- [packages-map.md](packages-map.md) — module ↔ package table
- [../editor-packages/overview.md](../editor-packages/overview.md) — extension API (planned)
- [../getting-started/what-is-v4.md](../getting-started/what-is-v4.md)
- `packages/docs/architecture.md` — micro-frontend design rationale
