# Extending the Editor

> Audience: both
> Module: `core/editor/loader/`, `packages/packages/core/`, `packages/packages/libs/`
> Related: [overview.md](overview.md), [libs.md](libs.md), [../mcp/registering-editor-tools.md](../mcp/registering-editor-tools.md)

## What it is

Durable extension surface for Editor V2:

1. **PHP** — append package name to `elementor/editor/v2/packages`
2. **JavaScript** — export `init()` that registers locations, panels, menus, registries

## Public API

| Symbol | Package | Purpose |
|--------|---------|---------|
| `injectIntoTop`, `injectIntoLogic` | `@elementor/editor` | Shell slots |
| `injectIntoPageIndication`, `toolsMenu` | `@elementor/editor-app-bar` | App bar slots and menus |
| `injectIntoStyleTab`, `registerEditingPanelReplacement` | `@elementor/editor-editing-panel` | Editing panel |
| `injectTab` | `@elementor/editor-elements-panel` | Elements panel tabs |
| `injectSiteSettingsTab` | `@elementor/editor-site-settings` | Site Settings tabs |
| `__registerPanel` | `@elementor/editor-panels` | Slide-in panels |
| `getMCPByDomain` | `@elementor/editor-mcp` | In-editor MCP domain |
| `__registerSlice` | `@elementor/store` | Redux slice registration |
| `stylesRepository.register` | `@elementor/editor-styles-repository` | Style provider |
| `registerDataHook`, `blockCommand` | `@elementor/editor-v1-adapters` | Legacy bridge |

Verified: package `src/index.ts` files listed above.

## When to use it

- New editor feature area (new package)
- Inject UI into app bar, editing panel, elements panel, or shell
- Bridge legacy editor events in React UI
- Register in-editor MCP tools

## Key concepts

### `init()` contract

```js
window.elementorV2.{packageName}?.init?.();
```

`init()` = synchronous registration only. Defer rendering to React components in injected slots.

### `@elementor/locations`

| Package | Key APIs |
|---------|----------|
| `@elementor/editor` | `injectIntoTop`, `injectIntoLogic` |
| `@elementor/editor-app-bar` | `injectIntoPageIndication`, `injectIntoResponsive`, `mainMenu`, `toolsMenu` |
| `@elementor/editor-panels` | `registerPanel` |
| `@elementor/editor-editing-panel` | `injectIntoStyleTab`, `registerEditingPanelReplacement` |
| `@elementor/editor-elements-panel` | `injectTab` |
| `@elementor/editor-site-settings` | `injectSiteSettingsTab` |

## Extension

### 1. Register package in PHP

```php
add_filter( 'elementor/editor/v2/packages', function ( array $packages ) {
    if ( ! my_feature_is_active() ) {
        return $packages;
    }
    return array_merge( $packages, [ 'my-editor-feature' ] );
} );
```

Optional env config:

```php
add_filter( 'elementor/editor/v2/scripts/env', function ( array $env ) {
    $env['@elementor/my-editor-feature'] = [ 'enabled' => true ];
    return $env;
} );
```

### 2. Create JS package with `init()`

Export `init` from `src/index.ts`. See [`packages/docs/creating-a-new-package.md`](../../../packages/docs/creating-a-new-package.md).

### 3. App bar example

```ts
import { injectIntoPageIndication, toolsMenu } from '@elementor/editor-app-bar';

export function init() {
    injectIntoPageIndication( { id: 'my-indicator', component: MyIndicator } );
    toolsMenu.registerToggleAction( { id: 'toggle-my-panel', priority: 20, useProps: useMyToggleProps } );
}
```

Reference: `packages/packages/core/editor-site-navigation/src/init.ts`.

### 4. Editing panel

```ts
import { injectIntoStyleTab, registerEditingPanelReplacement } from '@elementor/editor-editing-panel';
import { __registerPanel as registerPanel } from '@elementor/editor-panels';

injectIntoStyleTab( { id: 'my-style-section', component: MyStyleSection } );
registerPanel( { id: 'my-panel', component: MyPanel } );
registerEditingPanelReplacement( {
    id: 'my-element-panel',
    condition: ( _el, type ) => type.key === 'my-element',
    component: MyElementPanel,
} );
```

### 5. Legacy bridge

`registerDataHook`, `blockCommand`, `listenTo( v1ReadyEvent(), fn )`. Exports prefixed `__private` are internal.

### 6. MCP tools

Use `getMCPByDomain()` — see [../mcp/registering-editor-tools.md](../mcp/registering-editor-tools.md).

## Internals

- **Menus:** `@elementor/menus` → `createMenu()` per menu group
- **Globals:** `window.elementorV2.{camelCasePackage}` for late-loaded scripts; prefer NPM imports

## See also

- [overview.md](overview.md)
- [libs.md](libs.md)
- [core-packages.md](core-packages.md)
