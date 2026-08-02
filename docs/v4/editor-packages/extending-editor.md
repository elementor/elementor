# Extending the Editor

> Audience: both
> Module: `core/editor/loader/`, `packages/packages/core/`, `packages/packages/libs/`
> Status: final
> Related: [overview.md](overview.md), [libs.md](libs.md), [../mcp/registering-editor-tools.md](../mcp/registering-editor-tools.md)

## What it is

The durable extension surface for Editor V2. Core contributors and third-party extenders use the same two-step pattern:

1. **PHP** — append a package name to the `elementor/editor/v2/packages` filter so WordPress enqueues the bundle.
2. **JavaScript** — export an `init()` function from the package that registers locations, panels, menus, registries, and v1 bridge hooks.

Static catalogs of today's packages are intentionally secondary; see [core-packages.md](core-packages.md) for a labeled snapshot.

## When to use it

- Adding a new editor feature area (new package)
- Injecting UI into the app bar, editing panel, elements panel, or editor shell
- Subscribing to legacy editor events while building React-based UI
- Registering in-editor MCP tools (via `@elementor/editor-mcp` — see linked doc, do not duplicate here)

## Key concepts

### Package `init()` contract

Every extension package exports `init` from its entry (`src/index.ts`). Webpack appends this call when the script loads:

```js
window.elementorV2.{packageName}?.init?.();
```

`init()` must be **synchronous registration only** — set up locations, registries, and listeners; defer rendering to React components injected into slots. Examples: `editor-canvas` injects overlays; `editor-editing-panel` registers the atomic panel; `editor-global-classes` registers store slices and style providers; `editor-site-navigation` registers app-bar menu items.

### `@elementor/locations`

Typed component registries via `createLocation()` → `{ Slot, inject }`. Prefer established inject APIs over new top-level locations:

| Package | Key APIs |
|---------|----------|
| `@elementor/editor` | `injectIntoTop`, `injectIntoLogic` |
| `@elementor/editor-app-bar` | `injectIntoPageIndication`, `injectIntoResponsive`, `injectIntoPrimaryAction`; `mainMenu`, `toolsMenu`, `utilitiesMenu` |
| `@elementor/editor-panels` | `registerPanel` |
| `@elementor/editor-editing-panel` | `injectIntoStyleTab`, `injectIntoPanelHeaderTop`, `injectIntoClassSelectorActions`, `registerEditingPanelReplacement` |
| `@elementor/editor-elements-panel` | `injectTab` |

## Extension

### 1. Register the package in PHP

In your WordPress module (or plugin), merge the package name when your feature is active:

```php
add_filter( 'elementor/editor/v2/packages', function ( array $packages ) {
    if ( ! my_feature_is_active() ) {
        return $packages;
    }
    return array_merge( $packages, [ 'my-editor-feature' ] );
} );
```

Follow the same pattern as `modules/atomic-widgets/module.php`, `modules/global-classes/module.php`, and `modules/components/module.php`. For unconditional base infrastructure, add directly to `Editor_Loader::EXTENSIONS` or `::LIBS` in `core/editor/loader/editor-loader.php` (core contributors only).

Optional: pass runtime config through the env filter:

```php
add_filter( 'elementor/editor/v2/scripts/env', function ( array $env ) {
    $env['@elementor/my-editor-feature'] = [ 'enabled' => true ];
    return $env;
} );
```

### 2. Create the JS package with `init()`

Export `init` from `src/index.ts`; register locations/registries inside it. Publish to NPM, install in the plugin, and ensure webpack picks up the entry (see [`packages/docs/creating-a-new-package.md`](../../packages/docs/creating-a-new-package.md)).

### 3. Extend the app bar

```ts
import { injectIntoPageIndication, toolsMenu } from '@elementor/editor-app-bar';

export function init() {
    injectIntoPageIndication( { id: 'my-indicator', component: MyIndicator } );

    toolsMenu.registerToggleAction( {
        id: 'toggle-my-panel',
        priority: 20,
        useProps: useMyToggleProps,
    } );
}
```

Reference: `packages/packages/core/editor-site-navigation/src/init.ts`.

### 4. Extend the editing panel

**Inject into a section:**

```ts
import { injectIntoStyleTab } from '@elementor/editor-editing-panel';

injectIntoStyleTab( { id: 'my-style-section', component: MyStyleSection } );
```

**Register a slide-in panel:**

```ts
import { __registerPanel as registerPanel } from '@elementor/editor-panels';

registerPanel( { id: 'my-panel', component: MyPanel } );
```

**Replace the panel for a specific element type:**

```ts
import { registerEditingPanelReplacement } from '@elementor/editor-editing-panel';

registerEditingPanelReplacement( {
    id: 'my-element-panel',
    condition: ( _el, type ) => type.key === 'my-element',
    component: MyElementPanel,
} );
```

Reference: `packages/packages/core/editor-components/src/init.ts` (replacement panel + `injectTab`).

### 5. Bridge to legacy editor (v1 adapters)

`@elementor/editor-v1-adapters` wraps legacy commands/routes: `registerDataHook`, `blockCommand`, `listenTo( v1ReadyEvent(), fn )`. Example: `editor-editing-panel` blocks `panel/editor/open` for atomic selections; `editor-components` hooks `editor/documents/attach-preview`. Exports prefixed `__private` are internal.

### 6. Register in-editor MCP tools

If your package exposes Angie/WebMCP tools, use `getMCPByDomain()` from `@elementor/editor-mcp`. See [../mcp/registering-editor-tools.md](../mcp/registering-editor-tools.md) for the registration API — do not duplicate that content here.

## Internals

- **Menu system:** `@elementor/menus` wraps `@elementor/locations` — `createMenu()` generates typed `registerAction` / `registerLink` / `registerToggleAction` functions per menu group.
- **Panel routing:** `@elementor/editor-panels` syncs V2 panel open state with legacy v1 routes via `editor-v1-adapters`.
- **Elements panel tabs:** `injectTab` hooks legacy `panel/elements/regionViews`, `elementor/panel/init`, and route events to mount a React component inside the v1 panel chrome.
- **Global namespace:** Built packages are also available at `window.elementorV2.{camelCasePackage}` (e.g. `window.elementorV2.editorAppBar`). Prefer NPM imports in first-party code; globals are for late-loaded third-party scripts.

## See also

- [overview.md](overview.md) — lifecycle and filter chain
- [libs.md](libs.md) — `editor-props`, `editor-v1-adapters`, and other dependencies
- [core-packages.md](core-packages.md) — snapshot of existing packages
- [../mcp/registering-editor-tools.md](../mcp/registering-editor-tools.md) — MCP tool registration
- [../../packages/docs/creating-a-new-package.md](../../packages/docs/creating-a-new-package.md) — monorepo setup
