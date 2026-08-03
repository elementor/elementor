# Architecture Overview

> Audience: both
> Module: (cross-cutting)
> Related: [data-flow.md](data-flow.md), [packages-map.md](packages-map.md), [../getting-started/experiments.md](../getting-started/experiments.md)

## What it is

Elementor v4 is a **three-layer system**:

| Layer | Location | Role |
|-------|----------|------|
| PHP modules | `modules/` | Experiments, element registration, REST/MCP, frontend CSS |
| Editor V2 packages | `packages/packages/` | TypeScript/React micro-frontends via webpack externals |
| Frontend render | Twig + resolvers | HTML + per-post CSS files |

The legacy v1 editor shell still orchestrates the page; v2 packages extend it through `editor-v1-adapters`.

## When to use it

- Onboarding — understand where code lives before opening a module
- Tracing bugs across JS save → PHP parse → CSS file
- Deciding whether to add PHP, JS, or both for a new feature

## Key concepts

### High-level diagram

```
┌──────────────────────────────────────────────────────────────┐
│  WordPress Admin — experiments: e_opt_in_v4, e_atomic_elements │
└────────────────────────────┬─────────────────────────────────┘
                             ▼
┌──────────────────────────────────────────────────────────────┐
│  PHP Modules (modules/)                                       │
│  atomic-widgets ─┬─ global-classes ─ variables ─ components   │
│                  ├─ interactions ─ mcp (abilities)           │
│                  └─ css-converter, dynamic-tags bridge       │
│       │ elementor/editor/v2/packages filter                  │
└───────┼──────────────────────────────────────────────────────┘
        │                              │
        ▼                              ▼
┌───────────────────┐      ┌─────────────────────────┐
│ Editor V2 Packages│      │ External MCP Hosts      │
│ editor-canvas, …  │      │ WP Abilities API        │
└─────────┬─────────┘      └─────────────────────────┘
          │ document save
          ▼
┌──────────────────────────────────────────────────────────────┐
│  Document JSON — settings (PropValues) + styles (variants)    │
└────────────────────────────┬─────────────────────────────────┘
                             │ frontend request
                             ▼
┌──────────────────────────────────────────────────────────────┐
│  Frontend — Twig → Render_Props_Resolver → HTML               │
│           Atomic_Styles_Manager → per-post .css                 │
└──────────────────────────────────────────────────────────────┘
```

### Experiment gates

| Layer | Gate | Notes |
|-------|------|-------|
| atomic-widgets | `e_atomic_elements` | Module constructor returns early if inactive |
| global-classes, variables, components, interactions | `e_atomic_elements` | No separate per-feature experiments |
| MCP PHP abilities | *(none)* | Requires `McpAdapter` |
| In-editor MCP | *(none)* | `Editor_Loader::EXTENSIONS` |
| Editor V2 packages | `elementor/editor/v2/packages` filter | Plus base `Editor_Loader::EXTENSIONS` |

Full matrix: [../getting-started/experiments.md](../getting-started/experiments.md).

### Package loading lifecycle

1. **Load** — `wp_enqueue_script` for registered handles
2. **Environment** — `elementorEditorEnv` config
3. **Initialize extensions** — each package's `init.ts`
4. **Initialize app** — root `editor` package renders

```php
add_filter( 'elementor/editor/v2/packages', fn( $packages ) => array_merge( $packages, self::PACKAGES ) );
```

### PHP ↔ JS contract

| Concern | PHP | JS |
|---------|-----|-----|
| Style schema | `Style_Schema::get()` → `settings.atomic.styles_schema` | `@elementor/editor-styles` |
| Size units | `Size_Constants` → `supported_size_units` | editor controls |
| Element types | `register_widgets()` / `register_elements()` | `@elementor/editor-elements` |
| Props schema | `define_props_schema()` + `elementor/atomic-widgets/props-schema` | `@elementor/editor-props` |

### Public API

| Symbol | Signature | Purpose |
|--------|-----------|---------|
| `Style_Schema::get()` | `static get(): array` | Filtered style schema (`styles/style-schema.php`) |
| `Render_Props_Resolver::for_settings()` | `static for_settings(): self` | Settings render resolver |
| `Render_Props_Resolver::for_styles()` | `static for_styles(): self` | Styles render resolver |
| `elementor/editor/v2/packages` | filter on `string[]` | Append editor package names |
| `elementor/atomic-widgets/props-schema` | filter on `array` | Extend element props schema |
| `elementor/atomic-widgets/styles/schema` | filter on `array` | Extend style schema keys |

## Extension

1. **PHP** — `modules/your-feature/module.php`, register experiment, hook `elementor/editor/v2/packages`
2. **JS** — `packages/packages/core/editor-your-feature/`, export `init.ts`
3. **Docs** — add folder under `docs/v4/your-feature/`

See [packages-map.md](packages-map.md) for registration patterns.

## Internals

### Editor_Loader tiers

```php
const LIBS = [ 'editor-responsive', 'schema', 'locations', … ];
const EXTENSIONS = [ 'editor-mcp', 'elementor-v3-mcp', 'elementor-kit-mcp', … ];
// + filtered packages from modules
const APP_PACKAGE = 'editor';
```

### atomic-widgets as hub

`PACKAGES` in `module.php`: `editor-canvas`, `editor-controls`, `editor-editing-panel`, `editor-elements`, `editor-props`, `editor-styles`, `editor-styles-repository`, `editor-interactions`, `editor-templates`, `editor-design-system`.

Some libs are dependencies pulled transitively (marked TODO: register-only).

## See also

- [data-flow.md](data-flow.md)
- [packages-map.md](packages-map.md)
- [../editor-packages/overview.md](../editor-packages/overview.md)
- [../getting-started/what-is-v4.md](../getting-started/what-is-v4.md)
