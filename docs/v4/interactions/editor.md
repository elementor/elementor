# Interactions editor

> Audience: internal
> Module: `packages/packages/core/editor-interactions/`
> Status: final
> Related: [overview.md](./overview.md) · [schema.md](./schema.md) · [../mcp/registering-editor-tools.md](../mcp/registering-editor-tools.md)

## What it is

The `@elementor/editor-interactions` package implements the v4 editor surface for interactions: the Interactions tab in the editing panel, per-field controls, preview playback, clipboard paste, and in-editor MCP tools for Angie/WebMCP.

It is registered as an atomic-widgets v2 package (`editor-interactions` in `AtomicWidgetsModule` PACKAGES) and initialized via `src/init.ts`.

## When to use it

- **Internal UI work** — add or modify controls, list/detail views, empty state, promotion chips for Pro-gated options.
- **Cross-package integration** — `editor-canvas` reads `interactionsRepository` for canvas overlay; `editor-editing-panel` mounts `InteractionsTab`.
- **MCP tool authors** — the package registers its own `interactions` MCP domain; follow patterns here when adding tools, but document the API in [../mcp/registering-editor-tools.md](../mcp/registering-editor-tools.md).

## Key concepts

### Interactions tab

Exported as `InteractionsTab` from the package. `editor-editing-panel` wraps it:

```tsx
// editor-editing-panel/src/components/interactions-tab.tsx
<InteractionsTabContent elementId={ element.id } />
```

The tab component (`src/components/interactions-tab.tsx`):

1. Reads existing interactions via `useElementInteractions(elementId)`.
2. Shows `EmptyState` when no items exist; otherwise renders `InteractionsList` inside `InteractionsProvider`.
3. Uses `SessionStorageProvider` (per-element prefix) and `PopupStateProvider` for UI state.

List items open `InteractionDetails` / `InteractionSettings` for per-item editing (trigger, effect, direction, duration, delay, easing, replay, repeat, breakpoint exclusions).

### Controls registry

`interactions-controls-registry.ts` exposes a typed map of control components:

```ts
registerInteractionsControl( { type, component, options? } );
getInteractionsControl( type );
getInteractionsControlOptions( type );
```

Registered in `init.ts` (base-tier options shown; Pro options appear via promotion UI in each control):

| Control type | Component | Base options (snapshot) |
|--------------|-----------|------------------------|
| `trigger` | `Trigger` | `load`, `scrollIn` |
| `effect` | `Effect` | `fade`, `slide`, `scale` |
| `effectType` | `EffectType` | `in`, `out` |
| `direction` | `Direction` | `top`, `bottom`, `left`, `right` |
| `easing` | `Easing` | `easeIn` |
| `replay` | `Replay` | `no` |
| `repeat` | `Repeat` | (no fixed options) |

**Wiring outside the registry** — `duration` and `delay` render inline in `interaction-details.tsx` via `TimeFrameIndicator` (not `registerInteractionsControl`). Registry slots `relativeTo`, `start`, `end`, `times`, and `customEffects` exist in the type union and `InteractionDetails` looks them up via `getInteractionsControl()`, but only the seven types above are registered in `init.ts` today — Pro-gated controls are expected to register from a companion package (e.g. Elementor Pro) at init time.

Pro-gated triggers/effects use `PromotionSelect` with upgrade URLs (e.g. `go.elementor.com/go-pro-interactions-triggers-modal`).

### Interactions repository

`interactionsRepository` (`interactions-repository.ts`) is a provider registry. On init, `documentElementsInteractionsProvider` is registered — it:

- Keys by `document-elements-interactions-{documentId}`
- Subscribes to `elementor/element/update_interactions`
- Returns all elements with non-empty `interactions.items` for canvas/preview consumers

`interactionsRepository` and `createInteractionsProvider` are exported from `@elementor/editor-interactions` — any editor package can call `interactionsRepository.register()` during its own `init()`. Today only `documentElementsInteractionsProvider` is registered (feeds `editor-canvas` overlay). There is no WordPress/PHP hook; this is an internal JS registry, not a documented external extension surface.

### Config bridge

`get-interactions-config.ts` reads `window.ElementorInteractionsConfig` (injected by PHP `Module::enqueue_editor_scripts` / preview localize). Matches PHP `Presets::defaults()` and active breakpoints.

### Other init side effects

- `initCleanInteractionIdsOnDuplicate` — clears/remaps ids on element duplicate
- `initPasteInteractionsCommand` — paste interactions from clipboard
- Prop-value helpers exported from `prop-value-utils.ts` for MCP and tests

## Extension

N/A for external extenders at the package level today. Internal extension paths:

1. **New control** — implement a React component, call `registerInteractionsControl` in `init.ts` (or a future package init hook).
2. **New data provider** — `interactionsRepository.register(provider)` with `createInteractionsProvider`.
3. **MCP tools** — see below; use the shared registration API, not ad-hoc globals.

### MCP / Angie tools

In `init.ts`, the package calls:

```ts
initMcpInteractions(
  getMCPByDomain( 'interactions', {
    docs: EDITOR_INTERACTIONS_MCP_DESCRIPTION,
    instructions: EDITOR_INTERACTIONS_MCP_SHORT_DESCRIPTION,
  } )
);
```

`initMcpInteractions` (`src/mcp/index.ts`) registers a schema resource and a manage-element-interaction tool. **Do not duplicate the registration API here** — see [../mcp/registering-editor-tools.md](../mcp/registering-editor-tools.md) for `getMCPByDomain`, `addTool()`, `resource()`, and adapter patterns.

The `editor_mcp` experiment gates inclusion of the `@elementor/editor-mcp` package globally; interactions MCP init runs when both `editor-interactions` and `editor-mcp` are loaded.

## Internals

| Path | Role |
|------|------|
| `src/components/interactions-tab.tsx` | Tab shell, empty state, list |
| `src/components/interaction-details.tsx` | Single-item editor form |
| `src/components/controls/*` | Per-field controls + Pro promotion |
| `src/contexts/interactions-context.tsx` | Read/write element interactions, preview playback |
| `src/hooks/use-element-interactions.ts` | Bridge to `@elementor/editor-elements` |
| `src/mcp/` | In-editor MCP domain (`interactions`) |
| `src/commands/paste-interactions.ts` | Clipboard command |
| `assets/js/editor-interactions.js` | Preview iframe handler (PHP-registered sibling to package) |

Preview playback uses the PHP-enqueued `editor-interactions.js` script (Motion.js + shared utils), not the React package bundle directly.

## See also

- [schema.md](./schema.md) — PHP prop types the controls edit
- [frontend.md](./frontend.md) — published-page runtime (differs from editor preview in supported triggers)
- [../editor-packages/core-packages.md](../editor-packages/core-packages.md) — package snapshot
- [../editor-packages/extending-editor.md](../editor-packages/extending-editor.md) — registering new v2 packages
- [../mcp/registering-editor-tools.md](../mcp/registering-editor-tools.md) — MCP registration API
