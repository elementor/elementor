# Interactions editor

> Audience: internal
> Module: `packages/packages/core/editor-interactions/`
> Related: [overview.md](./overview.md) · [schema.md](./schema.md) · [../mcp/registering-editor-tools.md](../mcp/registering-editor-tools.md)

## What it is

`@elementor/editor-interactions` implements the v4 editor surface: Interactions tab, per-field controls, preview playback, clipboard paste, and MCP tools.

Registered as an atomic-widgets v2 package (`editor-interactions` in `AtomicWidgetsModule` PACKAGES), initialized via `src/init.ts`.

## When to use it

- **Internal UI work** — add/modify controls, list/detail views, Pro promotion chips.
- **Cross-package integration** — `editor-canvas` reads `interactionsRepository`; `editor-editing-panel` mounts `InteractionsTab`.
- **MCP tool authors** — package registers `interactions` MCP domain; see [../mcp/registering-editor-tools.md](../mcp/registering-editor-tools.md).

## Key concepts

### Interactions tab

`InteractionsTab` (`src/components/interactions-tab.tsx`):

1. Reads interactions via `useElementInteractions( elementId )`.
2. Shows `EmptyState` or `InteractionsList` inside `InteractionsProvider`.
3. Per-item editing via `InteractionDetails` / `InteractionSettings`.

### Controls registry

```ts
registerInteractionsControl( { type, component, options? } );
getInteractionsControl( type );
getInteractionsControlOptions( type );
```

Registered in `init.ts`:

| Control type | Base options |
|--------------|--------------|
| `trigger` | `load`, `scrollIn` |
| `effect` | `fade`, `slide`, `scale` |
| `effectType` | `in`, `out` |
| `direction` | `top`, `bottom`, `left`, `right` |
| `easing` | `easeIn` |
| `replay` | `no` |
| `repeat` | (no fixed options) |

`duration` and `delay` render inline via `TimeFrameIndicator`. Registry slots `relativeTo`, `start`, `end`, `times`, `customEffects` exist but are registered by companion packages (e.g. Pro) at init.

### Interactions repository

`interactionsRepository` keys providers (default: `documentElementsInteractionsProvider`) and subscribes to `elementor/element/update_interactions`. Any editor package can call `.register()` during its own `init()`.

### Config bridge

`get-interactions-config.ts` reads `window.ElementorInteractionsConfig` (PHP `Module::enqueue_editor_scripts`).

## Extension

Internal paths only:

1. **New control** — implement component, call `registerInteractionsControl` in `init.ts`.
2. **New data provider** — `interactionsRepository.register( createInteractionsProvider( … ) )`.
3. **MCP tools** — `initMcpInteractions( getMCPByDomain( 'interactions', … ) )` in `init.ts`.

## Public API

| Symbol | Signature | Purpose | Source |
|--------|-----------|---------|--------|
| `init` | `()` | Package bootstrap | `src/init.ts` |
| `InteractionsTab` | component | Tab shell | `src/components/interactions-tab.tsx` |
| `registerInteractionsControl` | `( { type, component, options? } )` | Register field control | `interactions-controls-registry.ts` |
| `getInteractionsControl` | `( type )` | Lookup registered control | `interactions-controls-registry.ts` |
| `interactionsRepository` | `.register()`, `.all()`, `.subscribe()` | Provider registry | `interactions-repository.ts` |
| `createInteractionsProvider` | `( options )` | Build a provider | `utils/create-interactions-provider.ts` |
| `useElementInteractions` | `( elementId )` | Element interactions hook | `hooks/use-element-interactions.ts` |
| `createInteractionItem` | `( fields )` | Build interaction-item PropValue | `utils/prop-value-utils.ts` |
| `createDefaultInteractionItem` | `()` | New item with defaults | `utils/prop-value-utils.ts` |
| `generateTempInteractionId` | `()` | Temp ID for unsaved items | `utils/temp-id-utils.ts` |
| `resolveDirection` | `( effect, type, direction )` | Resolve slide direction | `utils/resolve-direction.ts` |

## Internals

| Path | Role |
|------|------|
| `src/contexts/interactions-context.tsx` | Read/write + preview playback |
| `src/commands/paste-interactions.ts` | Clipboard command |
| `src/mcp/` | In-editor MCP domain |
| `assets/js/editor-interactions.js` | Preview iframe handler (PHP-enqueued) |

Preview playback uses `editor-interactions.js` (Motion.js), not the React bundle directly.

## See also

- [schema.md](./schema.md) — PHP prop types the controls edit
- [frontend.md](./frontend.md) — published-page runtime
- [../editor-packages/core-packages.md](../editor-packages/core-packages.md) — package snapshot
- [../mcp/registering-editor-tools.md](../mcp/registering-editor-tools.md) — MCP registration API
