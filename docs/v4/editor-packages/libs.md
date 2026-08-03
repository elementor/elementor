# Editor Foundation Libraries

> Audience: both
> Module: `packages/packages/libs/`
> Related: [extending-editor.md](extending-editor.md), [../fundamentals/prop-types.md](../fundamentals/prop-types.md), [../mcp/registering-editor-tools.md](../mcp/registering-editor-tools.md)

## What it is

Shared NPM libraries under `packages/packages/libs/`. Libraries are transitive webpack dependencies of feature packages; a subset is pre-registered in `Editor_Loader::LIBS`.

## Public API

| Symbol | Package | Purpose |
|--------|---------|---------|
| `createPropUtils`, `Schema.validatePropValue` | `@elementor/editor-props` | Prop type utilities and validation |
| `Schema.propTypeToJsonSchema` | `@elementor/editor-props` | LLM schema export |
| `stylesRepository.register( provider )` | `@elementor/editor-styles-repository` | Register style data provider |
| `createStylesProvider( opts )` | `@elementor/editor-styles-repository` | Build a `StylesProvider` |
| `getMCPByDomain( ns, opts? )` | `@elementor/editor-mcp` | Get/create in-editor MCP domain |
| `registerDataHook`, `blockCommand`, `listenTo` | `@elementor/editor-v1-adapters` | Legacy editor bridge |
| `__registerSlice( slice )` | `@elementor/store` | Register Redux slice (dynamic store) |
| `z`, `z4` | `@elementor/schema` | Zod re-exports for tool schemas |

Verified: `editor-props/src/index.ts`, `editor-styles-repository/src/index.ts`, `editor-mcp/src/mcp-registry.ts`, `editor-v1-adapters/src/index.ts`, `store/src/index.ts`, `schema/src/index.ts`.

## When to use it

| Library | Use when… |
|---------|-----------|
| `editor-props` | Defining/validating atomic prop types |
| `editor-styles` | Style schemas, variants, resolution |
| `editor-controls` | Atomic editor controls |
| `editor-elements` | Element models, selection |
| `editor-responsive` | Breakpoint-aware UI |
| `editor-mcp` | In-editor MCP tools (Angie/WebMCP) |
| `editor-v1-adapters` | Legacy commands, routes, events |
| `schema` | Zod validation (MCP tool inputs) |

## Key concepts

### Verified package names

| Directory | NPM name | In `Editor_Loader::LIBS`? |
|-----------|----------|---------------------------|
| `editor-props` | `@elementor/editor-props` | No (via `atomic-widgets` PACKAGES) |
| `editor-styles` | `@elementor/editor-styles` | No |
| `editor-controls` | `@elementor/editor-controls` | No |
| `editor-elements` | `@elementor/editor-elements` | No |
| `editor-responsive` | `@elementor/editor-responsive` | Yes |
| `editor-mcp` | `@elementor/editor-mcp` | No (in `EXTENSIONS`) |
| `editor-v1-adapters` | `@elementor/editor-v1-adapters` | Yes |
| `schema` | `@elementor/schema` | Yes |

Adjacent: `@elementor/locations`, `@elementor/store`, `@elementor/menus`, `@elementor/env`.

### `editor-props`

JS counterpart to PHP prop types. PHP hook `elementor/atomic-widgets/props-schema` mirrors registration. Keep `$$type` keys aligned.

### `editor-mcp`

JS-side MCP registry — **not** PHP `modules/mcp/`. Registration: [../mcp/registering-editor-tools.md](../mcp/registering-editor-tools.md). Imported by `editor-canvas`, `editor-global-classes`, `editor-variables`, `editor-interactions`.

## Extension

### Prop types

1. PHP — `elementor/atomic-widgets/props-schema` filter
2. JS — `createPropUtils` from `@elementor/editor-props`

### MCP tools

```ts
import { getMCPByDomain } from '@elementor/editor-mcp';
const mcp = getMCPByDomain( 'my-namespace', { instructions: '...' } );
```

### Locations

`createLocation()` in your package; consume `injectInto*` from `@elementor/editor`, `@elementor/editor-app-bar`, or `@elementor/editor-editing-panel`.

## Internals

`atomic-widgets` PACKAGES includes `editor-controls`, `editor-elements`, `editor-props`, `editor-styles` as dependency handles (not independently enqueued).

## See also

- [extending-editor.md](extending-editor.md)
- [../mcp/registering-editor-tools.md](../mcp/registering-editor-tools.md)
