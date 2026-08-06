# Core Editor Packages (Snapshot)

> Audience: internal
> Module: `modules/atomic-widgets/`, `modules/global-classes/`, `modules/variables/`, `modules/components/`, `modules/editor-app-bar/`
> Related: [extending-editor.md](extending-editor.md), [overview.md](overview.md), [../architecture/packages-map.md](../architecture/packages-map.md)

## What it is

Internal reference: v4 editor packages → PHP owners → experiment gates.

> **SNAPSHOT** — Will go stale. To add a package, use [extending-editor.md](extending-editor.md).

## When to use it

- Orient: which package owns canvas / panel / classes?
- Trace PHP module → JS package
- Check experiment gates before debugging missing bundles

## Key concepts

### `atomic-widgets` PACKAGES

From `modules/atomic-widgets/module.php`:

| Package | Role |
|---------|------|
| `editor-canvas` | Canvas, overlays, style commands |
| `editor-controls` | Atomic controls (dep only — do not enqueue alone) |
| `editor-editing-panel` | Atomic editing panel |
| `editor-elements` | Element model types (dep only) |
| `editor-props` | Prop types / validation (dep only) |
| `editor-styles` | Style schema helpers (dep only) |
| `editor-styles-repository` | Style providers and repository |
| `editor-interactions` | Interactions tab |
| `editor-templates` | Template library |
| `editor-design-system` | Design system UI |

Gated by `e_atomic_elements`. Filter:

```php
add_filter( 'elementor/editor/v2/packages', fn ( $packages ) => $this->add_packages( $packages ) );
```

### Feature packages (sibling modules)

| Package | PHP module | Gate |
|---------|-----------|------|
| `editor-global-classes` | `global-classes` | `e_classes` + `e_atomic_elements` |
| `editor-variables` | `variables` | `e_variables` + `e_atomic_elements` |
| `editor-components` | `components` | `e_components` + `e_atomic_elements` |
| `editor-app-bar` | `editor-app-bar` | None |

### Base loader extensions

From `Editor_Loader::EXTENSIONS`:

| Package | Role |
|---------|------|
| `editor-documents` | Document model bridge |
| `editor-panels` | Panel host |
| `editor-elements-panel` | Legacy elements panel |
| `editor-mcp` | In-editor MCP registry |
| `editor-notifications` | Toasts |
| `unlock-v4-promo` | V4 promotion |
| `elementor-v3-mcp` / `elementor-kit-mcp` | Legacy MCP bridges |

### Other filter packages

| Package | Module | Notes |
|---------|--------|-------|
| `editor-site-navigation` | `site-navigation` | Pages panel |
| `editor-widget-creation` | `widget-creation` | Promo gated by `e_widget_creation` |
| `editor-starter` | `onboarding` | When `should_show_starter()` |
| `editor-site-settings` | `agents` | `agents_llms_txt` (infra; load once) |
| `editor-agents` | `agents` | `agents_llms_txt` |

## Public API

Per-package `init()` entry points in `packages/packages/core/{package}/src/init.ts`:

| Package | Registers |
|---------|-----------|
| `editor-canvas` | Style transformers, overlays, canvas MCP domain |
| `editor-editing-panel` | Atomic panel, v1 panel block for atomic selections |
| `editor-styles-repository` | Style provider registry (`stylesRepository.register`) |
| `editor-global-classes` | Classes store, style provider, classes MCP domain |
| `editor-variables` | Variables UI, variables MCP domain |
| `editor-components` | Component type, panel tab, instance panel |
| `editor-interactions` | Interactions repo, interactions MCP domain |
| `editor-site-settings` | Site Settings tab registry and portal host |
| `editor-agents` | Agents Site Settings tab (`llms.txt`) |

## Extension

See [extending-editor.md](extending-editor.md).

## Internals

N/A

## See also

- [libs.md](libs.md)
- [../architecture/packages-map.md](../architecture/packages-map.md)
