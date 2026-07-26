# Editor Packages Overview

> Audience: both
> Module: `core/editor/loader/`, `packages/packages/core/`
> Status: draft
> Related: [extending-editor.md](extending-editor.md), [core-packages.md](core-packages.md), [../architecture/overview.md](../architecture/overview.md)

## What it is

Editor V2 is Elementor's modular, composable editor front end. Instead of one monolithic JavaScript bundle, the editor is split into independently developed **packages** — each built with React and TypeScript, published to NPM, and loaded at runtime via WordPress script enqueue.

Internal v4 features and third-party extensions use the same mechanism: PHP registers package names through a WordPress filter; webpack exposes each package on `window.elementorV2`; each loaded package runs an `init()` function that registers UI, hooks, and integrations before the root `@elementor/editor` app renders.

The official monorepo description lives in [`packages/docs/architecture.md`](../../packages/docs/architecture.md).

## When to use it

Read this page when you need to understand:

- Why v4 editor code is organized as packages rather than inline in legacy `assets/js/editor.js`
- How PHP decides which packages load in a given editor session
- When package `init()` runs relative to the React shell mounting
- Where to go next to **add** a package (see [extending-editor.md](extending-editor.md) — that is the durable content; package lists go stale)

## Key concepts

### Micro-frontend approach

Packages are built as webpack **externals** and exposed as globals (`window.elementorV2.{packageName}`), similar to WordPress core's `window.wp` pattern. This allows dynamic loading of extensions at runtime without a fixed set of remote entries at build time.

Package categories in the monorepo:

| Category | Role | Example |
|----------|------|---------|
| **App** | Root shell | `@elementor/editor` |
| **Extension** | Feature area injected into the app | `@elementor/editor-canvas` |
| **Library** | Shared, reusable APIs | `@elementor/editor-props` |
| **Tool** | Build/dev support | webpack plugins |

### PHP package registration

`Editor_Loader` (`core/editor/loader/editor-loader.php`) merges a base extension list with filter callbacks:

```php
add_filter( 'elementor/editor/v2/packages', fn ( $packages ) => array_merge( $packages, [ 'my-package' ] ) );
```

The filter chain is `elementor/editor/packages` → `elementor/editor/v1/packages` → `elementor/editor/v2/packages` (the v2 name is legacy but still the hook used across modules). Each module that owns a feature registers its packages here — for example `modules/atomic-widgets/module.php` for atomic core packages, `modules/global-classes/module.php` for `editor-global-classes`, and so on.

Base extensions always loaded (before filter additions) include `editor-panels`, `editor-documents`, `editor-elements-panel`, and `editor-mcp`. Foundation libraries (`locations`, `store`, `schema`, `editor-v1-adapters`, etc.) are registered separately in `Editor_Loader::LIBS`.

### Application lifecycle

From `packages/docs/architecture.md`, the runtime phases are:

1. **Load** — `wp_enqueue_script` for each registered package (dependency order from `.asset.php` files)
2. **Environment variables** — `elementor/editor/v2/scripts/env` filter sets per-package config on `elementorEditorEnv`
3. **Initialize extensions** — each enqueued bundle auto-calls `window.elementorV2.{name}?.init?.()` (via `EntryInitializationWebpackPlugin` in `.grunt-config/webpack.packages.js`)
4. **Initialize application** — `editor-loader.js` calls `window.elementorV2.editor.start(domElement)`
5. **React lifecycle** — standard React rendering from there

### Init order

Init order is **not** the PHP filter array order. It follows the WordPress script **dependency graph**: a package's `init()` runs after its declared `deps` have loaded and initialized. Packages that only register APIs (no `init` export) are pulled in as transitive dependencies of feature packages.

Experiment gates are applied in PHP before a package name is added to the filter (for example `editor-global-classes` only registers when both `e_classes` and `e_atomic_elements` are active). Not every experiment gates its JS package: `editor-interactions` loads whenever `e_atomic_elements` is active (it is in the `atomic-widgets` `PACKAGES` constant) even though the interactions PHP module also defines `e_interactions`.

The `editor_mcp` experiment is registered in `modules/atomic-widgets/module.php` but **no `is_feature_active( 'editor_mcp' )` check exists anywhere in the repo** — the `editor-mcp` bundle is always enqueued via `Editor_Loader::EXTENSIONS`. Disabling the experiment in WP Admin has no effect on package loading today. See [../mcp/overview.md](../mcp/overview.md) for how PHP abilities differ from the in-editor JS registry.

## Extension

N/A — see [extending-editor.md](extending-editor.md) for how to register a new package.

## Internals

- **Loader:** `core/editor/loader/editor-loader.php` — `get_packages_to_enqueue()` applies the packages filter; `enqueue_scripts()` walks registered handles.
- **Bundler:** `.grunt-config/webpack.packages.js` — builds each package to `assets/js/packages/{name}/`, generates `.asset.php` dependency metadata, and appends the `init()` call.
- **Entry point:** `core/editor/loader/js/editor-loader.js` — waits for legacy `elementor/init`, then starts the V2 React shell.
- **Pluggable UI:** `@elementor/locations` (`createLocation`) backs the `injectInto*` APIs re-exported from `@elementor/editor`, `@elementor/editor-app-bar`, and `@elementor/editor-editing-panel`.

## See also

- [extending-editor.md](extending-editor.md) — register and extend packages
- [core-packages.md](core-packages.md) — snapshot of registered v4 packages
- [libs.md](libs.md) — foundation libraries
- [../architecture/packages-map.md](../architecture/packages-map.md) — full PHP ↔ JS mapping
- [../../packages/docs/creating-a-new-package.md](../../packages/docs/creating-a-new-package.md) — monorepo package creation guide
