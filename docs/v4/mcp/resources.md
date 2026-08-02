# MCP resources (v4)

> Audience: external  
> Module: `modules/mcp/abilities/*-resource-ability.php`, `packages/packages/core/editor-canvas/src/mcp/resources/`  
> Status: final  
> Related: [overview.md](overview.md), [abilities/README.md](abilities/README.md), [../dynamic-tags/discovery.md](../dynamic-tags/discovery.md)

## What it is

MCP **resources** are read-only URIs that agents fetch before mutating data. They provide kit-scoped snapshots (classes, variables) or guidance documents. v4 composition abilities reference these URIs in their prompts and validation.

Resources are **not** the same as abilities: you read a resource by URI; you invoke an ability by ID with input parameters.

## When to use it

Call or read these resources **before** styling or composing:

1. `elementor://global-variables` — confirm variable labels exist
2. `elementor://global-classes` — confirm class labels exist
3. `elementor://dynamic-tags` — look up tag names and settings schemas
4. `elementor://style/best-practices` — design quality guidance for agents

For external MCP hosts, use the general `elementor/read-resource` ability (documented in future general MCP docs) with the URI. For in-editor tools, use `editor-resource-getter` (WebMCP) or the host's native resource mechanism.

## Key concepts

### URI catalog

| URI | Ability ID | MIME type | Source | Payload |
|-----|------------|-----------|--------|---------|
| `elementor://global-classes` | `elementor/global-classes-resource` | `application/json` | `Global_Classes_Resource_Ability` | JSON object: internal id → **label** map from active kit |
| `elementor://global-variables` | `elementor/global-variables-resource` | `application/json` | `Global_Variables_Resource_Ability` | `{ variables, total, watermark }` from active kit |
| `elementor://style/best-practices` | `elementor/style-best-practices` | `text/markdown` | `Style_Best_Practices_Ability` | Contents of `modules/mcp/static-resources/style/best-practices.md` |
| `elementor://dynamic-tags` | *(no PHP resource ability)* | `application/json` | JS: `editor-canvas/src/mcp/resources/dynamic-tags-resource.ts` | Array of `{ name, label, categories, settings }` via `list-dynamic-tags` proxy |
| `elementor://interactions/schema` | `elementor/interactions-schema-resource` | `application/json` | `Interactions_Schema_Resource_Ability` | Plain LLM JSON Schema for native interaction items |

### Related resource (not in v4 catalog table)

| URI | Ability ID | MIME type | Notes |
|-----|------------|-----------|-------|
| `elementor://variables/tools/manage-global-variable-guide` | `elementor/manage-global-variable-guide` | `text/plain` | Detailed guide for `manage-global-variable`; see [abilities/manage-global-variable.md](abilities/manage-global-variable.md) |

### Label vs internal id

Resources expose **labels** for author-facing references. Internal prefixes (`g-*` for classes, `e-gv-*` for variables) must not appear in `classes` maps or `var(--...)` references sent to abilities.

- Classes in `build-composition` / `manage-elements`: use labels from `elementor://global-classes`
- Variables in `style` CSS: use `var(--label)` where `label` comes from `elementor://global-variables`

## Extension

**External:** Read resources through your MCP host's resource mechanism or `elementor/read-resource`. Cache `watermark` from global-variables to detect stale reads.

**In-editor:** Register package resources with `resource()` on your `MCPRegistryEntry` (see [registering-editor-tools.md](registering-editor-tools.md)). The canvas package registers `elementor://dynamic-tags` by proxying `elementor/v1/mcp-proxy` with tool `list-dynamic-tags`.

## Internals

- PHP resource abilities implement `execute()` returning string content; `Read_Resource_Ability` maps URIs to executors in `get_resource_executors()`.
- `elementor://dynamic-tags` is **not** in `Read_Resource_Ability`'s PHP executor map — it is editor-only, backed by the `List_Dynamic_Tags_Ability` (`elementor/list-dynamic-tags`) through the REST proxy.
- MCP server registers resources separately from tools in `register_server()` resources array.

## See also

- [design-guidance.md](design-guidance.md) — summary + link to `elementor://style/best-practices`
- [composition-workflow.md](composition-workflow.md) — when to read each resource in the agent workflow
- [../global-classes/data-model.md](../global-classes/data-model.md) — label as public id
- [../variables/types.md](../variables/types.md) — variable type registration
