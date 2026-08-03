# Editor Packages Overview

> Audience: both
> Module: `core/editor/loader/`, `packages/packages/core/`
> Related: [extending-editor.md](extending-editor.md), [core-packages.md](core-packages.md), [../architecture/overview.md](../architecture/overview.md)

## What it is

Editor V2 is Elementor's modular editor front end. Features ship as independently built **packages** (React + TypeScript), enqueued via WordPress script handles and exposed on `window.elementorV2`.

PHP registers package names through a WordPress filter; each loaded package runs `init()` before `@elementor/editor` renders.

Monorepo reference: [`packages/docs/architecture.md`](../../../packages/docs/architecture.md).

## Public API

| Symbol | Signature | Purpose |
|--------|-----------|---------|
| `Editor_Loader` | filter `elementor/editor/v2/packages` | Register extension packages |
| `Editor_Loader` | filter `elementor/editor/v2/scripts/env` | Per-package runtime config |
| `@elementor/editor` | `start( domElement )` | Boot React shell |
| `@elementor/editor` | `injectIntoTop`, `injectIntoLogic` | Shell injection points |
| Package entry | `init(): void` | Synchronous registration (auto-called on load) |

Verified: `core/editor/loader/editor-loader.php`, `packages/packages/core/editor/src/index.ts`, `locations.ts`.

## When to use it

| Question | Answer |
|----------|--------|
| Why packages vs legacy `editor.js`? | Micro-frontend: independent build, dynamic loading |
| Which packages load? | PHP filter + experiment gates in each module |
| When does `init()` run? | After script deps load, before `editor.start()` |
| How to add a package? | [extending-editor.md](extending-editor.md) |

## Key concepts

### Package categories

| Category | Role | Example |
|----------|------|---------|
| App | Root shell | `@elementor/editor` |
| Extension | Feature area | `@elementor/editor-canvas` |
| Library | Shared APIs | `@elementor/editor-props` |
| Tool | Build support | webpack plugins |

### PHP registration

```php
add_filter( 'elementor/editor/v2/packages', fn ( $packages ) => array_merge( $packages, [ 'my-package' ] ) );
```

Filter chain: `elementor/editor/packages` → `elementor/editor/v1/packages` → `elementor/editor/v2/packages`.

Foundation libs (`locations`, `store`, `schema`, `editor-v1-adapters`) registered in `Editor_Loader::LIBS`.

### Lifecycle

1. **Load** — `wp_enqueue_script` per package (deps from `.asset.php`)
2. **Env** — `elementor/editor/v2/scripts/env` → `elementorEditorEnv`
3. **Init extensions** — `window.elementorV2.{name}?.init?.()`
4. **Start app** — `window.elementorV2.editor.start(domElement)`

Init order follows script **dependency graph**, not PHP filter array order. Experiment gates applied in PHP before adding package names.

## Extension

See [extending-editor.md](extending-editor.md).

## Internals

| Component | Path |
|-----------|------|
| Loader | `core/editor/loader/editor-loader.php` |
| Bundler | `.grunt-config/webpack.packages.js` |
| Entry | `core/editor/loader/js/editor-loader.js` |
| Pluggable UI | `@elementor/locations` → `createLocation()` |

## See also

- [extending-editor.md](extending-editor.md)
- [core-packages.md](core-packages.md)
- [libs.md](libs.md)
