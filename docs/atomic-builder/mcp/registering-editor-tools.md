# Registering in-editor MCP tools

> Audience: both  
> Module: `packages/packages/libs/editor-mcp/src/mcp-registry.ts`, `src/adapters/`  
> Related: [overview.md](overview.md), [../editor-packages/extending-editor.md](../editor-packages/extending-editor.md)

## What it is

API for registering tools and resources in Elementor's **in-editor** MCP layer. v4 packages call this during `init()` to expose capabilities to Angie and WebMCP.

**Not** PHP `modules/mcp/` abilities. Tool catalogs change — grep `getMCPByDomain` under `packages/packages/core/` for current implementations.

## Public API

| Symbol | Signature | Purpose |
|--------|-----------|---------|
| `getMCPByDomain` | `( namespace, { instructions?, docs? } ) → MCPRegistryEntry` | Get/create domain server (`editor-{namespace}`) |
| `MCPRegistryEntry.addTool` | `( { name, description, schema?, handler, ... } )` | Register tool with Zod input schema |
| `MCPRegistryEntry.resource` | `( name, uri, config?, handler )` | Register read-only resource |
| `MCPRegistryEntry.setMCPDescription` | `( description: string )` | Domain server description for Angie |
| `MCPRegistryEntry.waitForReady` | `() → Promise<void>` | Await adapter activation |
| `MCPRegistryEntry.sendResourceUpdated` | `( { uri } )` | Push resource update to adapters |
| `registerMcpAdapter` | `( adapter: IMcpRegistrationAdapter )` | Custom host bridge |
| `createAndRegisterAdapters` | `() → Promise<void>` | Wire WebMCP + Angie adapters |
| `signalMcpReady` | `() → void` | Unblock buffered tool registration |

Verified: `mcp-registry.ts`, `adapters/types.ts`.

### `addTool` fields

| Field | Purpose |
|-------|---------|
| `name` | Tool name exposed to hosts |
| `description` | Agent-facing description |
| `schema` | Zod raw shape → JSON Schema |
| `outputSchema` | Optional; auto-adds `errors` field |
| `isDestructive` | Maps to `destructiveHint` |
| `requiredResources` | `{ uri, description }[]` — prepended to tool description |
| `handler` | Async `(args) => result`; throws → `isError: true` |

### Namespace rules

- Lowercase + underscores only (`/^[a-z_]+$/`)
- `options.docs` auto-registers `elementor://{namespace}/server-docs` and merges into `requiredResources`

## When to use it

- New tool for Angie/WebMCP while editing
- Lazy-loaded resource URI for agent context
- Custom host adapter

## Key concepts

### Adapter pattern

```typescript
import { registerMcpAdapter, type IMcpRegistrationAdapter } from '@elementor/editor-mcp';

class MyHostAdapter implements IMcpRegistrationAdapter {
    async activate() { /* connect */ }
    onToolRegistered( tool, extraData ) { /* register */ }
    onResourceRegistered( name, uri, handler ) { /* index */ }
    sendResourceUpdated( { uri } ) { /* push */ }
}

registerMcpAdapter( new MyHostAdapter() );
```

Built-in adapters (`init.ts`):

| Adapter | When | Role |
|---------|------|------|
| `WebMCPAdapter` | `getModelContext()` available | `registerModelContextTool` + `editor-resource-getter` |
| `AngieMcpAdapter` | `isAngieAvailable()` | Local `McpServer` via Angie SDK |

## Extension

Add `@elementor/editor-mcp` dependency; call `getMCPByDomain` from `init.ts`. Use Zod from `@elementor/schema`.

Do not add PHP abilities for in-editor-only operations unless external hosts also need them.

## Internals

Module-level `mcpRegistry` map. Tests use `mockMcpRegistry()` when `globalThis.jest` defined.

## See also

- [overview.md](overview.md)
- [../editor-packages/libs.md](../editor-packages/libs.md)
