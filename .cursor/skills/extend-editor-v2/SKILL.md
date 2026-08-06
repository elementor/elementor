---
name: extend-editor-v2
description: Extends Elementor Editor V2 — elementor/editor/v2/packages PHP filter, init() package contract, app bar / panel / elements-panel slots, v1 adapters, and getMCPByDomain in-editor MCP. Use for editor packages, React UI injection, or editor-mcp tools (not PHP modules/mcp).
---

# Extend Editor V2

Read first: [editor-packages/extending-editor.md](../../../docs/atomic-builder/editor-packages/extending-editor.md), [mcp/registering-editor-tools.md](../../../docs/atomic-builder/mcp/registering-editor-tools.md), [packages/docs/creating-a-new-package.md](../../../packages/docs/creating-a-new-package.md).

## Checklist

1. **Decide package home** — new package vs extend existing — [creating-a-new-package.md](../../../packages/docs/creating-a-new-package.md).
2. **PHP: register package name**

```php
add_filter( 'elementor/editor/v2/packages', function ( array $packages ) {
    return array_merge( $packages, [ 'my-editor-feature' ] );
} );
```

Optional env: `elementor/editor/v2/scripts/env` → `$env['@elementor/my-editor-feature']`.

3. **JS: implement `init()` in `src/init.ts(x)`**, re-export from `src/index.ts` — synchronous registration only; Vite footer auto-calls `window.elementorV2.{camelCasePackage}?.init?.()`. Example: [docs/atomic-builder/examples/extend-editor-v2.md](../../../docs/atomic-builder/examples/extend-editor-v2.md).
4. **Pick injection API** (read doc for full list):
   - Shell: `injectIntoTop`, `injectIntoLogic` (`@elementor/editor`)
   - App bar: `injectIntoPageIndication`, `toolsMenu` (`@elementor/editor-app-bar`)
   - Editing panel: `injectIntoStyleTab`, `registerEditingPanelReplacement` (`@elementor/editor-editing-panel`)
   - Elements panel: `injectTab` (`@elementor/editor-elements-panel`)
   - Slide-in panels: `__registerPanel` (`@elementor/editor-panels`)
   - Styles: `stylesRepository.register` (`@elementor/editor-styles-repository`)
   - Legacy bridge: `registerDataHook`, `blockCommand`, `__privateListenTo( v1ReadyEvent(), fn )` (`@elementor/editor-v1-adapters`)
5. **MCP (in-editor only)** — in `init()`; Zod from `@elementor/schema`:

```ts
import { getMCPByDomain } from '@elementor/editor-mcp';
import { z } from '@elementor/schema';

const mcp = getMCPByDomain( 'my_domain', { instructions: '…', docs: '…' } );
mcp.addTool( { name: 'my_tool', description: '…', schema: { id: z.string() }, handler: async () => '…' } );
```

Namespace: `/^[a-z_]+$/` only. **Not** PHP `modules/mcp/` abilities.

6. **Verify** — `window.elementorV2.editorMyFeature` (camelCase slug); UI in chosen slot; MCP tools when experiment allows.

## Minimal init skeleton

```ts
import { injectIntoPageIndication, toolsMenu } from '@elementor/editor-app-bar';

export function init() {
    injectIntoPageIndication( { id: 'my-indicator', component: MyIndicator } );
    toolsMenu.registerToggleAction( { id: 'toggle-my-panel', priority: 20, useProps: useMyToggleProps } );
}
```

Reference: `packages/packages/core/editor-site-navigation/src/init.ts`.

## Public path

- Third-party plugin ships own `@elementor/my-editor-feature` (or bundles equivalent); filter `elementor/editor/v2/packages`.
- Register MCP tools only for in-editor agent workflows via `@elementor/editor-mcp`.

## Internal path

- Core packages: `packages/packages/core/editor-*`.
- Pro extensions: `packages/packages/pro/editor-*-extended` (sibling Pro repo).
- Loader: `core/editor/loader/`; conditional loading via module filters instead of hardcoding `editor-loader.php` when possible.

## See also

- [editor-packages/overview.md](../../../docs/atomic-builder/editor-packages/overview.md)
- [editor-packages/libs.md](../../../docs/atomic-builder/editor-packages/libs.md)
- [mcp/overview.md](../../../docs/atomic-builder/mcp/overview.md) — PHP abilities vs in-editor JS
