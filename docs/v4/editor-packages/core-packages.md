# Core Editor Packages (Snapshot)

> Audience: internal
> Module: `modules/atomic-widgets/`, `modules/global-classes/`, `modules/variables/`, `modules/components/`, `modules/editor-app-bar/`
> Status: final
> Related: [extending-editor.md](extending-editor.md), [overview.md](overview.md), [../architecture/packages-map.md](../architecture/packages-map.md)

## What it is

Internal reference table mapping v4-related editor packages to their PHP owners and experiment gates.

> **SNAPSHOT** — Lists packages registered through `elementor/editor/v2/packages` and base loader extensions as of the current branch. Will go stale as packages are added or gated differently. To add a package, use [extending-editor.md](extending-editor.md).

## When to use it

- Orienting as an internal contributor: "which package owns canvas / panel / classes?"
- Tracing a PHP module to its JS counterpart
- Checking experiment gates before debugging a missing bundle

Do **not** treat this as the extension guide — use [extending-editor.md](extending-editor.md) for that.

## Key concepts

### `atomic-widgets` PACKAGES constant

Verified against `modules/atomic-widgets/module.php` (`PACKAGES`, lines 161–172):

| Package | Role |
|---------|------|
| `editor-canvas` | Canvas rendering, overlays, style commands |
| `editor-controls` | Atomic controls (see [libs.md](libs.md); TODO: register, do not independently enqueue) |
| `editor-editing-panel` | Atomic element editing panel |
| `editor-elements` | Element model types (see [libs.md](libs.md); same TODO) |
| `editor-props` | Prop types / validation (see [libs.md](libs.md); same TODO) |
| `editor-styles` | Style schema helpers (see [libs.md](libs.md); same TODO) |
| `editor-styles-repository` | Style providers and repository |
| `editor-interactions` | Interactions tab and controls |
| `editor-templates` | Template library integration |
| `editor-design-system` | Design system UI |

The four foundation packages (`editor-controls`, `editor-elements`, `editor-props`, `editor-styles`) appear in `PACKAGES` so WordPress can resolve their script handles as dependencies of feature packages. The inline TODO comments indicate they should not be independently enqueued.

Filter application (line 188):

```php
add_filter( 'elementor/editor/v2/packages', fn ( $packages ) => $this->add_packages( $packages ) );
```

Gated by experiment `e_atomic_elements` (`Module::is_active()`). All rows above share this gate — including `editor-interactions`, which does **not** additionally check `e_interactions` at registration time.

### Feature packages registered by sibling modules

| Package | PHP module | Experiment gate |
|---------|-----------|-----------------|
| `editor-global-classes` | `modules/global-classes/module.php` | `e_classes` + `e_atomic_elements` |
| `editor-variables` | `modules/variables/hooks.php` | `e_variables` + `e_atomic_elements` |
| `editor-components` | `modules/components/module.php` | `e_components` + `e_atomic_elements` |
| `editor-app-bar` | `modules/editor-app-bar/module.php` | None (unconditional) |

### Base loader extensions (always present)

From `core/editor/loader/editor-loader.php` `EXTENSIONS` — merged before filter additions:

| Package | Role |
|---------|------|
| `events` | Event bus |
| `editor-documents` | Document model bridge |
| `editor-notifications` | Toast/notification UI |
| `editor-panels` | Panel host infrastructure |
| `editor-elements-panel` | Legacy elements panel host |
| `unlock-v4-promo` | V4 promotion UI |
| `editor-mcp` | In-editor MCP registry (always loaded; `editor_mcp` experiment not wired — see [overview.md](overview.md)) |
| `elementor-v3-mcp` | Legacy v3 MCP bridge |
| `elementor-kit-mcp` | Kit MCP bridge |

### Other packages on the filter (non-v4 or ancillary)

| Package | PHP module | Notes |
|---------|-----------|-------|
| `editor-site-navigation` | `modules/site-navigation/module.php` | Pages panel; UI gated by `pages_panel` experiment via env |
| `editor-widget-creation` | `modules/widget-creation/module.php` | Package registered unconditionally; promo UI gated by `e_widget_creation` |
| `editor-starter` | `app/modules/onboarding/module.php` | Starter onboarding; only when `should_show_starter()` |
| `elementor-capabilities-mcp` | `modules/elementor-capabilities-mcp/module.php` | Admin capabilities MCP |

## Extension

N/A — internal snapshot. To add a package, see [extending-editor.md](extending-editor.md).

## Internals

| Package | Primary `init()` responsibilities |
|---------|----------------------------------|
| `editor-canvas` | Style/settings transformers, canvas overlays, legacy view replacements, canvas MCP domain |
| `editor-editing-panel` | Registers atomic editing panel, blocks v1 panel for atomic selections, element controls |
| `editor-styles-repository` | Style provider registry |
| `editor-interactions` | Interactions repository, control types, interactions MCP domain |
| `editor-templates` | Template sync logic components |
| `editor-design-system` | Design system panel integration |
| `editor-global-classes` | Global classes store, style provider, class manager UI, classes MCP domain |
| `editor-variables` | Variables manager UI, variables MCP domain |
| `editor-components` | Component element type, elements panel tab, instance editing panel replacement |
| `editor-app-bar` | Top bar shell, menu locations, responsive bar replacement |

Source entry points: `packages/packages/core/{package}/src/init.ts` (or `init.tsx` for `editor-canvas`).

## See also

- [extending-editor.md](extending-editor.md) — how to register packages (primary)
- [overview.md](overview.md) — lifecycle and init order
- [libs.md](libs.md) — foundation libraries pulled in as dependencies
- [../architecture/packages-map.md](../architecture/packages-map.md) — broader mapping including tests paths
- [../getting-started/experiments.md](../getting-started/experiments.md) — experiment matrix
