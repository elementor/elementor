# Editor Foundation Libraries

> Audience: both
> Module: `packages/packages/libs/`
> Status: draft
> Related: [extending-editor.md](extending-editor.md), [../fundamentals/prop-types.md](../fundamentals/prop-types.md), [../mcp/registering-editor-tools.md](../mcp/registering-editor-tools.md)

## What it is

Shared NPM libraries under `packages/packages/libs/` that v4 editor packages import. Unlike core **extension** packages (which have an `init()` and are enqueued via the PHP filter), libraries are typically pulled in as **transitive webpack dependencies** of feature packages. A subset is also pre-registered in `Editor_Loader::LIBS` so they are always available at runtime.

These libs define the contracts extenders most often need: prop shapes, controls, style resolution, legacy bridging, and in-editor MCP registration.

## When to use it

| Library | Reach for it when… |
|---------|-------------------|
| `editor-props` | Defining or validating atomic prop types and `PropValue` shapes |
| `editor-styles` | Working with style schemas, variants, or style resolution in the editor |
| `editor-controls` | Building atomic editor controls bound to prop types |
| `editor-elements` | Reading element models, types, or selection in V2 code |
| `editor-responsive` | Breakpoint-aware UI or responsive state |
| `editor-mcp` | Registering in-editor MCP tools/resources (Angie/WebMCP) |
| `editor-v1-adapters` | Bridging to legacy commands, routes, or document events |
| `schema` | Runtime validation with Zod (tool inputs, MCP schemas) |

## Key concepts

### Verified package names

All eight libraries below exist as directories under `packages/packages/libs/`:

| Directory | NPM name | Also in `Editor_Loader::LIBS`? |
|-----------|----------|-------------------------------|
| `editor-props` | `@elementor/editor-props` | No (registered via `atomic-widgets` PACKAGES) |
| `editor-styles` | `@elementor/editor-styles` | No (registered via `atomic-widgets` PACKAGES) |
| `editor-controls` | `@elementor/editor-controls` | No (registered via `atomic-widgets` PACKAGES) |
| `editor-elements` | `@elementor/editor-elements` | No (registered via `atomic-widgets` PACKAGES) |
| `editor-responsive` | `@elementor/editor-responsive` | Yes |
| `editor-mcp` | `@elementor/editor-mcp` | No (in `EXTENSIONS`) |
| `editor-v1-adapters` | `@elementor/editor-v1-adapters` | Yes |
| `schema` | `@elementor/schema` | Yes |

Related infrastructure libs (not in the plan scope but commonly adjacent): `@elementor/locations` (pluggable UI — folder `locations/`), `@elementor/store`, `@elementor/menus`, `@elementor/env`.

### `editor-props` — primary extension surface

The main JS counterpart to PHP prop types in `modules/atomic-widgets/prop-types/`. Provides:

- Prop type utilities (`createPropUtils`, domain types for size, color, link, etc.)
- `PropValue` validation (`Schema.validatePropValue`)
- LLM schema export (`Schema.propTypeToJsonSchema`, `Schema.jsonSchemaToPropType`)
- Overridable/transformable helpers

PHP hook `elementor/atomic-widgets/props-schema` mirrors the registration model on the server. See [../fundamentals/prop-types.md](../fundamentals/prop-types.md) for the shared contract.

### `editor-v1-adapters` — legacy bridge

Wraps legacy Elementor JS API (commands, routes, hooks) for React packages during the v1/v2 transition. Public-ish APIs used by extensions:

- `registerDataHook`, `blockCommand` — hook into legacy data flow
- `listenTo`, `v1ReadyEvent`, `routeOpenEvent` — event subscription
- `getCanvasIframeDocument`, `useEditMode` — editor state readers

Exports prefixed `__private` are internal-only and may be removed when legacy code is deleted. See [extending-editor.md](extending-editor.md) for usage patterns.

### `editor-mcp` — in-editor tool registry

JS-side MCP registry used by v4 packages to expose tools to Elementor's in-editor AI assistant (Angie) and WebMCP. **Not** the same as PHP `modules/mcp/` WordPress Abilities.

Registration API (`getMCPByDomain`, `addTool`, `resource`, adapters) is documented in [../mcp/registering-editor-tools.md](../mcp/registering-editor-tools.md). Packages that currently import it include `editor-canvas`, `editor-global-classes`, `editor-variables`, and `editor-interactions`.

The `editor_mcp` experiment is registered in `modules/atomic-widgets/module.php` but is not wired to any loader check — `editor-mcp` is always enqueued from `Editor_Loader::EXTENSIONS`. Individual v4 packages gate their own MCP tool registration in `init()`; the shared registry library itself loads unconditionally.

## Extension

### Prop types (extend `editor-props`)

Register matching prop types on both sides:

1. **PHP** — `elementor/atomic-widgets/props-schema` filter (see [../atomic-widgets/hooks.md](../atomic-widgets/hooks.md))
2. **JS** — use `createPropUtils` / domain prop types from `@elementor/editor-props` in your editor package controls

Keep `$$type` keys aligned between PHP and TS.

### Controls (extend `editor-controls`)

Build controls that bind to your prop type and register them in your package's `init()` via the editing panel controls registry (see `editor-editing-panel` `registerElementControls`).

### MCP tools (extend `editor-mcp`)

```ts
import { getMCPByDomain } from '@elementor/editor-mcp';

const mcp = getMCPByDomain( 'my-namespace', { instructions: '...' } );
// Register tools — see ../mcp/registering-editor-tools.md
```

Do not duplicate the full API here.

### Locations (extend `@elementor/locations`)

For new injection points in your own package, use `createLocation()` and export `inject`/`Slot` from your package's public API. Consume established locations from `@elementor/editor`, `@elementor/editor-app-bar`, or `@elementor/editor-editing-panel` when injecting into existing UI.

## Internals

| Library | Path | Notes |
|---------|------|-------|
| `editor-props` | `packages/packages/libs/editor-props/` | Prop model + validation |
| `editor-styles` | `packages/packages/libs/editor-styles/` | Style schema helpers |
| `editor-controls` | `packages/packages/libs/editor-controls/` | Atomic control components |
| `editor-elements` | `packages/packages/libs/editor-elements/` | Element model types |
| `editor-responsive` | `packages/packages/libs/editor-responsive/` | Breakpoint utilities |
| `editor-mcp` | `packages/packages/libs/editor-mcp/` | `mcp-registry.ts`, adapters |
| `editor-v1-adapters` | `packages/packages/libs/editor-v1-adapters/` | Commands, routes, data hooks |
| `schema` | `packages/packages/libs/schema/` | Re-exports Zod (`z`, `z4`) |

`atomic-widgets` `PACKAGES` includes `editor-controls`, `editor-elements`, `editor-props`, and `editor-styles` with TODO comments indicating they should be registered but not independently enqueued — they are resolved as dependencies of feature packages.

## See also

- [extending-editor.md](extending-editor.md) — package registration and location injection
- [../fundamentals/prop-value.md](../fundamentals/prop-value.md) — `PropValue` shape
- [../fundamentals/prop-types.md](../fundamentals/prop-types.md) — PHP ↔ JS prop type taxonomy
- [../mcp/registering-editor-tools.md](../mcp/registering-editor-tools.md) — `editor-mcp` registration API
- [../mcp/overview.md](../mcp/overview.md) — PHP abilities vs JS in-editor MCP
- [../../packages/docs/architecture.md](../../packages/docs/architecture.md) — monorepo library vs extension categories
