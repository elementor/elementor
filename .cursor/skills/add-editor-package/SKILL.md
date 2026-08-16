---
name: add-editor-package
description: "External: Add an Editor V2 package from a third-party plugin that injects UI or in-editor MCP tools. elementor/editor/v2/packages, init(), slots, adapters."
---

# Add editor package

> **Scope: External** — the full documented outcome is shippable from a 3rd-party plugin via `elementor/editor/v2/packages` and your own package `init()`; no Core changes required. Editing core packages is Core-only. Full split + disclaimer: [skills-scope.md](../../../docs/atomic-builder/skills-scope.md).

## Implementation location

- **Editor JS/TS:** third-party plugin repo — own package bundle with `init()` (npm/webpack **or** hand-built script).
- **PHP:** filter `elementor/editor/v2/packages` and optional `elementor/editor/v2/scripts/env`; for hand-built bundles also hook `elementor/editor/v2/scripts/register` + `scripts/enqueue`.
- **Do not modify Elementor Core.** Core packages live in `packages/packages/core/editor-*` — reference only.
- **Runnable reference:** [examples/example-plugin/](../../../examples/example-plugin/) (`editor-example-feature` plain JS bundle).

## Prerequisites

- Experiment `e_atomic_elements` (and often `e_opt_in_v4`) — [getting-started/experiments.md](../../../docs/atomic-builder/getting-started/experiments.md).
- In-editor MCP has no separate experiment gate beyond editor availability.

Read first: [editor-packages/extending-editor.md](../../../docs/atomic-builder/editor-packages/extending-editor.md), [docs/atomic-builder/examples/add-editor-package.md](../../../docs/atomic-builder/examples/add-editor-package.md). Monorepo package creation (Core contributors): [packages/docs/creating-a-new-package.md](../../../packages/docs/creating-a-new-package.md).

## Checklist

### A. npm / webpack path (preferred for React UI)

1. **PHP: register package slug** — append to `elementor/editor/v2/packages` (e.g. `editor-my-feature`). Optional env via `elementor/editor/v2/scripts/env`.
2. **Build** — webpack (or Vite) with `@elementor/*` as **externals** resolved at runtime via `window.elementorV2.*` — see [packages/docs/architecture.md](../../../packages/docs/architecture.md) and [editor-packages/libs.md](../../../docs/atomic-builder/editor-packages/libs.md).
3. **Output contract** — bundle exposes `window.elementorV2.{camelCaseSlug}` (e.g. `editor-my-feature` → `editorMyFeature`). Core Vite build footer auto-calls `?.init?.()` for packages built into Core assets.
4. **`src/init.ts(x)`** — synchronous registration only; re-export from `src/index.ts`.

### B. Hand-built script path (no npm pipeline)

1. Hook **`elementor/editor/v2/scripts/register`** to `wp_register_script()` your plugin JS with deps on required `elementor-v2-*` handles (`editor`, `editor-app-bar`, etc.).
2. Hook **`elementor/editor/v2/scripts/enqueue`** to enqueue that handle.
3. **You must call `init()` yourself** — append at end of bundle:

```js
window.elementorV2.editorMyFeature?.init?.();
```

Adding the slug to `elementor/editor/v2/packages` alone does **nothing** if no Core `.asset.php` exists for that slug — manual script registration carries the load.

4. **Late-loaded global alternative** — `window.elementorV2.{camelCasePackage}` for scripts enqueued after editor packages; see [extending-editor.md](../../../docs/atomic-builder/editor-packages/extending-editor.md).

### C. Common `init()` work

- Pick injection API (read doc for full list):
  - Shell: `injectIntoTop`, `injectIntoLogic` (`@elementor/editor`)
  - App bar: `injectIntoPageIndication`, `toolsMenu` (`@elementor/editor-app-bar`)
  - Editing panel: `injectIntoStyleTab`, `registerEditingPanelReplacement` (`@elementor/editor-editing-panel`)
  - Elements panel: `injectTab` (`@elementor/editor-elements-panel`)
  - Site Settings: `injectSiteSettingsTab` (`@elementor/editor-site-settings`)
  - Slide-in panels: `registerPanel` (`@elementor/editor-panels`; `__registerPanel` is a legacy alias)
  - Styles: `stylesRepository.register` (`@elementor/editor-styles-repository`)
  - Legacy bridge: `registerDataHook`, `blockCommand`, `__privateListenTo( v1ReadyEvent(), fn )` (`@elementor/editor-v1-adapters`)
- **In-editor MCP only** — `getMCPByDomain()` + Zod from `@elementor/schema`; namespace `/^[a-z_]+$/`. **Not** PHP `modules/mcp/` abilities — see [mcp/overview.md](../../../docs/atomic-builder/mcp/overview.md).

### Verify

- Script loads in editor network tab; `window.elementorV2.{camelCaseSlug}` exists.
- UI renders in chosen slot.
- MCP tools visible when Angie / WebMCP is enabled.

## Minimal init skeleton

```ts
import { injectIntoPageIndication, toolsMenu } from '@elementor/editor-app-bar';

export function init() {
    injectIntoPageIndication( { id: 'my-indicator', component: MyIndicator } );
    toolsMenu.registerToggleAction( { id: 'toggle-my-panel', priority: 20, useProps: useMyToggleProps } );
}
```

Reference: `packages/packages/core/editor-site-navigation/src/init.ts`.

## External implementation path

- Third-party plugin ships own editor bundle; filter `elementor/editor/v2/packages` (+ manual script hooks for non-Core-built bundles).
- Register MCP tools only for in-editor agent workflows via `@elementor/editor-mcp`.

## Core reference paths (do not edit)

- Core packages: `packages/packages/core/editor-*`.
- Pro extensions: `packages/packages/pro/editor-*-extended` (elementor-pro sibling repo).
- Loader: `core/editor/loader/`.

## See also

- [editor-packages/overview.md](../../../docs/atomic-builder/editor-packages/overview.md)
- [extend-variables](../extend-variables/SKILL.md) — `registerVariableType` in your package `init()`
- [mcp/registering-editor-tools.md](../../../docs/atomic-builder/mcp/registering-editor-tools.md)
