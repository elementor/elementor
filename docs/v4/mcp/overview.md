# MCP overview

> Audience: both  
> Module: `modules/mcp/`, `packages/packages/libs/editor-mcp/`  
> Related: [README.md](README.md), [composition-workflow.md](composition-workflow.md), [registering-editor-tools.md](registering-editor-tools.md)

## What it is

Two MCP-related surfaces for v4:

1. **PHP abilities** — server tools/resources via WordPress Abilities API (`wp_register_ability`), served through `elementor-mcp-server` / `Mcp_Proxy_REST_API`
2. **JS in-editor registry** — per-domain `McpServer` instances in v4 editor packages, bridged to Angie and WebMCP

## Public API

### PHP (`modules/mcp/abilities/`)

| Symbol | Signature | Purpose |
|--------|-----------|---------|
| `Abstract_Ability` | `register(): void` | Calls `wp_register_ability()` with `execute_callback` |
| `Abstract_Ability` | `execute( $input = [] )` | Ability implementation (subclass) |
| `*Ability` subclasses | `get_ability_id(): string` | Stable ability ID (e.g. `elementor/build-composition`) |

### JS (`@elementor/editor-mcp`)

| Symbol | Signature | Purpose |
|--------|-----------|---------|
| `getMCPByDomain` | `( namespace, opts? ) → MCPRegistryEntry` | Get/create domain MCP server |
| `MCPRegistryEntry` | `addTool( opts )` | Register tool with Zod schema |
| `registerMcpAdapter` | `( adapter: IMcpRegistrationAdapter )` | Custom host bridge |

Verified: `abstract-ability.php`, `mcp-registry.ts`.

### v4 ability IDs

| ID | Doc |
|----|-----|
| `elementor/build-composition` | [abilities/build-composition.md](abilities/build-composition.md) |
| `elementor/get-widget-schema` | [abilities/get-widget-schema.md](abilities/get-widget-schema.md) |
| `elementor/list-widget-schemas` | [abilities/list-widget-schemas.md](abilities/list-widget-schemas.md) |
| `elementor/manage-classes` | [abilities/manage-classes.md](abilities/manage-classes.md) |
| `elementor/manage-global-variable` | [abilities/manage-global-variable.md](abilities/manage-global-variable.md) |
| `elementor/manage-elements` | [abilities/manage-elements.md](abilities/manage-elements.md) |
| `elementor/list-components` | [abilities/list-components.md](abilities/list-components.md) |
| `elementor/interactions-schema-resource` | [abilities/interactions-schema-resource.md](abilities/interactions-schema-resource.md) |

## When to use it

| Integrator | Stack |
|------------|-------|
| External MCP host | PHP abilities + resources |
| Editor package contributor | JS `getMCPByDomain()` |

Do not conflate the two — external `elementor/build-composition` does not use `getMCPByDomain()`.

## Key concepts

### Abilities vs resources

| Kind | Callable? | Examples |
|------|-----------|----------|
| Ability (tool) | Yes | `elementor/build-composition`, `elementor/manage-classes` |
| Resource | No — read by URI | `elementor://global-classes`, `elementor://style/best-practices` |

Read resources via `elementor/read-resource` or host-native fetch. See [resources.md](resources.md).

### Registration hooks (`modules/mcp/module.php`)

| Hook | Purpose |
|------|---------|
| `wp_abilities_api_categories_init` | `elementor` category |
| `wp_abilities_api_init` | All Elementor abilities |
| `mcp_adapter_init` | `elementor-mcp-server` tool + resource lists |

PHP abilities register unconditionally when `McpAdapter` and `wp_register_ability` exist.

## Extension

**External:** Integrate via MCP host → Elementor Abilities API / MCP proxy.

**Internal (JS):** [registering-editor-tools.md](registering-editor-tools.md).

## Internals

- MCP server ID: `elementor-mcp-server`
- Prompts: `modules/mcp/static-resources/` via `Prompt_Loader`
- JS entry: `editor-mcp/src/init.ts` → `createAndRegisterAdapters()`

## See also

- [abilities/README.md](abilities/README.md)
- [resources.md](resources.md)
