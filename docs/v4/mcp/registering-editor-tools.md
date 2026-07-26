# Registering in-editor MCP tools

> Audience: both  
> Module: `packages/packages/libs/editor-mcp/src/mcp-registry.ts`, `src/adapters/`  
> Status: draft  
> Related: [overview.md](overview.md), [../editor-packages/extending-editor.md](../editor-packages/extending-editor.md)

## What it is

API reference for registering tools and resources in Elementor's **in-editor** MCP layer. v4 editor packages (`editor-canvas`, `editor-global-classes`, `editor-variables`, `editor-interactions`) call this API during `init()` to expose capabilities to Angie and WebMCP.

This document describes **how to register** — not which tools exist today. Tool catalogs change frequently; read source in each package's `mcp/` folder for current implementations.

## When to use it

- Adding a new tool Angie or WebMCP should call while editing
- Registering a lazy-loaded resource URI for agent context
- Building a new host adapter that bridges the registry to another client

## Key concepts

### Entry point: `getMCPByDomain(namespace, options?)`

```typescript
import { getMCPByDomain } from '@elementor/editor-mcp';

const reg = getMCPByDomain('my_feature', {
  instructions: 'Short hint about this domain (MCP SDK instructions).',
  docs: '# Full markdown docs for this domain...',
});
```

| Parameter | Rules |
|-----------|-------|
| `namespace` | Lowercase letters and underscores only (`/^[a-z_]+$/`). Becomes server name `editor-{namespace}`. |
| `options.instructions` | Brief toolset hint passed to MCP SDK |
| `options.docs` | Full documentation; auto-registered at `elementor://{namespace}/server-docs` and merged into every tool's `requiredResources` |

Returns `MCPRegistryEntry`: `{ addTool, resource, setMCPDescription, sendResourceUpdated, waitForReady }`.

Call from your package's `init.ts` after the editor loads. Existing domains include `canvas`, `classes`, `variables`, `interactions` — grep `getMCPByDomain` under `packages/packages/core/` for current callers (context only).

### `addTool(opts)`

```typescript
reg.addTool({
  name: 'my-tool',
  description: 'What this tool does.',
  schema: { elementId: z.string() },
  outputSchema: { success: z.boolean() },
  isDestructive: false,
  requiredResources: [
    { uri: 'elementor://global-variables', description: 'Kit variables' },
  ],
  handler: async (args) => ({ success: true }),
});
```

| Field | Purpose |
|-------|---------|
| `name` | Tool name exposed to hosts |
| `description` | Agent-facing description; WebMCP prepends required-resources hints |
| `schema` | Zod raw shape for input (converted to JSON Schema) |
| `outputSchema` | Optional; auto-adds `errors` string field |
| `isDestructive` | Sets MCP `destructiveHint` annotation |
| `requiredResources` | `{ uri, description }[]` — injected into Angie `_meta` and WebMCP tool description |
| `modelPreferences` | Angie model routing preferences (optional) |
| `handler` | Async function; return value serialized as JSON text content |

Errors thrown in `handler` become `isError: true` responses with message text.

### `resource(name, uriOrTemplate, config?, handler)`

Registers a read-only MCP resource on the domain's `McpServer`. Also notifies adapters via `onResourceRegistered`.

Use for domain-specific context documents. Example pattern: `editor-canvas` registers `elementor://dynamic-tags` by proxying the PHP `list-dynamic-tags` ability.

### `setMCPDescription(description)`

Human-readable description for the whole domain server. Used by `AngieMcpAdapter` when calling `sdk.registerLocalServer()`.

### `waitForReady()` / `signalMcpReady()`

Tools registered before adapters activate are buffered. `init.ts` calls `createAndRegisterAdapters()` then `signalMcpReady()`. Await `waitForReady()` in handlers that depend on full registration.

### Namespace conventions

| Situation | Approach |
|-----------|----------|
| Tool belongs to an existing domain's workflow | Add to that domain (`canvas` for element ops, `classes` for global classes, etc.) |
| New product area with distinct resources and toolset | New namespace via `getMCPByDomain('my_area', { docs })` |
| Cross-cutting resource many tools need | Register on the most relevant domain; reference URI in `requiredResources` |

### `requiredResources` / `isDestructive` conventions

- **`requiredResources`**: List URIs the agent should read before calling the tool. `mergeRequiredResources()` auto-appends `elementor://{namespace}/server-docs` when `options.docs` was provided.
- **`isDestructive: true`**: Set for delete, replace, or irreversible mutations. Maps to `destructiveHint: true` and `readOnlyHint: false`.
- **`isDestructive: false`** (default): Read-only or additive operations get `readOnlyHint: true` when not destructive.

### Adapter pattern

```typescript
import { registerMcpAdapter, type IMcpRegistrationAdapter } from '@elementor/editor-mcp';

class MyHostAdapter implements IMcpRegistrationAdapter {
  async activate() { /* connect to host */ }
  onToolRegistered(tool, extraData) { /* register tool with host */ }
  onResourceRegistered(name, uriOrTemplate, handler) { /* index resource */ }
  sendResourceUpdated({ uri }) { /* push update if supported */ }
}

registerMcpAdapter(new MyHostAdapter());
```

`createAndRegisterAdapters()` (in `init.ts`) registers built-in adapters:

| Adapter | When active | Role |
|---------|-------------|------|
| `WebMCPAdapter` | `getModelContext()` available | Registers each tool with `registerModelContextTool`; provides `editor-resource-getter` for URI lookup |
| `AngieMcpAdapter` | `isAngieAvailable()` | Registers local `McpServer` instances via Angie SDK at `activate()` |

Reference implementations:

- `packages/packages/libs/editor-mcp/src/adapters/web-mcp-adapter.ts`
- `packages/packages/libs/editor-mcp/src/adapters/angie-adapter.ts`
- `packages/packages/libs/editor-mcp/src/adapters/types.ts` — `IMcpRegistrationAdapter`

New adapters: implement `IMcpRegistrationAdapter`, call `registerMcpAdapter()` before or during `createAndRegisterAdapters()`. Buffered tools/resources replay through `onToolRegistered` / `onResourceRegistered` on late registration.

## Extension

**External package authors:** Add `@elementor/editor-mcp` dependency, call `getMCPByDomain` from your package `init.ts`, register tools with Zod schemas from `@elementor/schema`.

**Internal:** Follow existing `editor-*` package `mcp/` folder patterns. Do not add PHP abilities for in-editor-only operations unless external hosts also need them.

## Internals

- Registry: module-level `mcpRegistry` map namespace → `McpServer`
- `registerTool` on server + adapter fan-out via `callAdapters()`
- Tests use `mockMcpRegistry()` when `globalThis.jest` is defined
- `editor-mcp` package loaded unconditionally via `Editor_Loader::EXTENSIONS` (`core/editor/loader/editor-loader.php`); the `editor_mcp` experiment is registered but not wired to any `is_feature_active()` check yet

## See also

- [overview.md](overview.md) — PHP abilities vs JS registry
- [../interactions/editor.md](../interactions/editor.md) — interactions package MCP registration example
- [../editor-packages/libs.md](../editor-packages/libs.md) — `editor-mcp` lib in package map
