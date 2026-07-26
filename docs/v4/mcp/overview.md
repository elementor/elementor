# MCP overview

> Audience: both  
> Module: `modules/mcp/`, `packages/packages/libs/editor-mcp/`  
> Status: draft  
> Related: [README.md](README.md), [composition-workflow.md](composition-workflow.md), [registering-editor-tools.md](registering-editor-tools.md)

## What it is

Elementor exposes two MCP-related surfaces for v4 work:

1. **PHP abilities** — server-side tools and resources registered through the WordPress Abilities API (`wp_register_ability`), bundled into the `elementor-mcp-server` MCP server via `McpAdapter`, and reachable from external hosts through `Mcp_Proxy_REST_API`.
2. **JS in-editor tool registry** — client-side `McpServer` instances per domain namespace, registered by v4 editor packages and bridged to Angie (`AngieMcpAdapter`) and WebMCP (`WebMCPAdapter`).

## When to use it

- **External agent / MCP host integrator** — use PHP abilities and resources to read kit data and mutate documents from Claude Desktop, Cursor, or similar.
- **Editor package contributor** — use the JS registry API to add tools Angie or WebMCP can call while editing.
- **Do not conflate the two** — calling `elementor/build-composition` from an external host does not use `getMCPByDomain()`; registering an in-editor tool does not create a PHP ability.

## Key concepts

### `editor_mcp` experiment scope

The experiment constant is `editor_mcp` (`EXPERIMENT_EDITOR_MCP` in `modules/atomic-widgets/module.php`). It is registered as a hidden dev experiment with default **active**.

**Intended scope:** gate inclusion of the JS `editor-mcp` package (in-editor tool UI and adapters), **not** PHP abilities registration.

**PHP abilities are unconditional.** `modules/mcp/module.php` registers abilities when `McpAdapter` and `wp_register_ability` exist — no experiment check.

**JS package gating:** TBD — verify with v4 team. The experiment is defined in `modules/atomic-widgets/module.php`, but an `is_feature_active( 'editor_mcp' )` filter on `elementor/editor/v2/packages` was not found in the current branch. `editor-mcp` appears in `Editor_Loader::EXTENSIONS` unconditionally.

### WordPress Abilities API hooks

Registration order in `modules/mcp/module.php`:

| Hook | Callback | Purpose |
|------|----------|---------|
| `wp_abilities_api_categories_init` | `register_ability_category()` | Registers `elementor` category |
| `wp_abilities_api_init` | `register_abilities()` | Registers all Elementor abilities |
| `mcp_adapter_init` | `register_server()` | Creates `elementor-mcp-server` with tool and resource ability lists |

### Abilities vs resources

| Kind | Callable? | Examples | How hosts read resources |
|------|-----------|----------|--------------------------|
| **Ability (tool)** | Yes — takes input, returns output | `elementor/build-composition`, `elementor/manage-classes` | N/A |
| **Resource** | No — read-only content at a URI | `elementor://global-classes`, `elementor://style/best-practices` | `elementor/read-resource` (general ability, out of scope here) or host-native resource fetch |

Resource abilities carry an `mcp` metadata block with `type: resource` and a `uri`. Some resources also exist only in the JS registry (see [resources.md](resources.md)).

### v4-only scope of this folder

Documented in `docs/v4/mcp/`:

| PHP ability ID | Topic file |
|----------------|------------|
| `elementor/build-composition` | [abilities/build-composition.md](abilities/build-composition.md) |
| `elementor/get-widget-schema` | [abilities/get-widget-schema.md](abilities/get-widget-schema.md) |
| `elementor/list-widget-schemas` | [abilities/list-widget-schemas.md](abilities/list-widget-schemas.md) |
| `elementor/manage-classes` | [abilities/manage-classes.md](abilities/manage-classes.md) |
| `elementor/manage-global-variable` | [abilities/manage-global-variable.md](abilities/manage-global-variable.md) |
| `elementor/manage-elements` | [abilities/manage-elements.md](abilities/manage-elements.md) |

**Out of scope here** (future general MCP docs): `elementor/get-page-structure`, `elementor/create-page`, `elementor/update-page-settings`, `elementor/list-resources`, `elementor/read-resource`. `elementor/list-dynamic-tags` is documented under [../dynamic-tags/discovery.md](../dynamic-tags/discovery.md).

## Extension

**External:** Integrate via MCP host configuration pointing at the Elementor site's Abilities API / MCP proxy. Ability IDs and input schemas are stable contracts; prefer live `get-widget-schema` over static widget dumps.

**Internal (JS):** See [registering-editor-tools.md](registering-editor-tools.md) for `getMCPByDomain()`, `addTool()`, and adapter registration.

## Internals

- PHP base contract: `modules/mcp/abilities/abstract-ability.php` — `register()` calls `wp_register_ability()` with `execute_callback`.
- MCP server ID: `elementor-mcp-server` (namespace `elementor`, route `mcp`).
- Runtime prompts: `modules/mcp/static-resources/` (loaded by `Prompt_Loader`); human reference is `docs/v4/mcp/`.
- JS entry: `packages/packages/libs/editor-mcp/src/init.ts` → `createAndRegisterAdapters()`.

## See also

- [abilities/README.md](abilities/README.md) — recommended call order
- [resources.md](resources.md) — resource URI catalog
- [../architecture/data-flow.md](../architecture/data-flow.md) — edit/save/MCP mutation paths
