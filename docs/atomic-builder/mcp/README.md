# MCP (v4)

## Purpose

v4 agent integration: server-side PHP abilities and the in-editor JS tool registry.

## Two systems

| System | Location | Consumers | Docs |
|--------|----------|-----------|------|
| **PHP abilities** | `modules/mcp/abilities/*.php` | External MCP hosts via `McpAdapter` | [abilities/](abilities/README.md), [resources.md](resources.md) |
| **JS in-editor registry** | `packages/packages/libs/editor-mcp/` | Angie, WebMCP | [registering-editor-tools.md](registering-editor-tools.md) |

Separate stacks — PHP runs on WordPress server; JS runs in the browser editor.

## Files

| File | Covers |
|------|--------|
| [overview.md](overview.md) | Scope, Public API, ability IDs |
| [resources.md](resources.md) | Resource URI catalog |
| [composition-workflow.md](composition-workflow.md) | Agent workflow sequence |
| [design-guidance.md](design-guidance.md) | Design principles summary |
| [registering-editor-tools.md](registering-editor-tools.md) | JS `getMCPByDomain` API |
| [abilities/](abilities/README.md) | v4 PHP ability reference |
