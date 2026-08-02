# MCP (v4)

> Status: final

## Purpose

Reference for Elementor v4 agent integration: **server-side PHP abilities** exposed to external MCP hosts, and the **in-editor JS tool registry** used by Angie and WebMCP. This folder documents only the v4-specific subset; general (non-v4) abilities are deferred to a future docs folder.

## Two systems — read this first

| System | Location | Consumers | Documented here |
|--------|----------|-----------|-----------------|
| **PHP abilities** | `modules/mcp/abilities/*.php` | External MCP hosts (Claude Desktop, Cursor, etc.) via `McpAdapter` / `Mcp_Proxy_REST_API` | [abilities/](abilities/README.md), [resources.md](resources.md), [composition-workflow.md](composition-workflow.md) |
| **JS in-editor tool registry** | `packages/packages/libs/editor-mcp/src/mcp-registry.ts` | Elementor's in-editor AI (Angie) and WebMCP, registered by v4 editor packages | [registering-editor-tools.md](registering-editor-tools.md) |

These are separate stacks. PHP abilities run on the WordPress server; the JS registry runs in the browser editor and is what v4 packages (`editor-canvas`, `editor-global-classes`, `editor-variables`, `editor-interactions`) use to expose tools to Angie/WebMCP. Neither stack is gated by the `editor_mcp` experiment today — that flag is registered but not yet wired (see [overview.md](overview.md)).

## Files

| File | Covers |
|------|--------|
| [overview.md](overview.md) | Experiment scope, Abilities API basics, abilities vs resources, v4-only scope |
| [resources.md](resources.md) | URI catalog for v4-specific MCP resources |
| [composition-workflow.md](composition-workflow.md) | End-to-end agent workflow: variables → classes → XML composition |
| [design-guidance.md](design-guidance.md) | Short design principles for agents; links to full best-practices resource |
| [registering-editor-tools.md](registering-editor-tools.md) | JS registration API (`getMCPByDomain`, `addTool`, adapters) — not a tool catalog |
| [abilities/](abilities/README.md) | v4-specific PHP ability reference (6 abilities) |

## Reading order

1. [overview.md](overview.md) — disambiguation and scope
2. [composition-workflow.md](composition-workflow.md) — recommended agent call sequence
3. [abilities/README.md](abilities/README.md) — per-ability reference
4. [registering-editor-tools.md](registering-editor-tools.md) — if adding in-editor tools to a package

## Related

- [../getting-started/experiments.md](../getting-started/experiments.md) — experiment matrix including `editor_mcp`
- [../global-classes/api.md](../global-classes/api.md) — global classes REST and data model
- [../variables/api.md](../variables/api.md) — variables REST and kit storage
- [../dynamic-tags/discovery.md](../dynamic-tags/discovery.md) — `list-dynamic-tags` ability and dynamic tag binding
- [../css-converter/overview.md](../css-converter/overview.md) — `Css_Converter` used by style-related abilities
- [../editor-packages/libs.md](../editor-packages/libs.md) — `editor-mcp` lib overview
