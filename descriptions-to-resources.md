# Mission Brief: Extract Tool Descriptions to MCP Resources

## Goal

Reduce payload sizes sent to the AI server by extracting large embedded text from MCP tool descriptions into standalone MCP resources. Tools will then reference these resources as required dependencies, allowing the AI to fetch them on-demand rather than receiving them with every tool listing.

## Background

The current implementation embeds extensive instructional text, design guidelines, workflow documentation, and examples in two locations:
1. **Tool descriptions**: Large text within individual tool `description` fields
2. **Server instructions**: Large text within MCP server `instructions` configuration

This results in large payloads being transmitted to the AI server on every tool listing, even when the context is not immediately needed.

### Reference Implementation

The pattern to follow is demonstrated in:
- `packages/packages/core/editor-canvas/src/mcp/tools/build-composition/prompt.ts`

This file shows how to:
1. Use the `toolPrompts` utility from `@elementor/editor-mcp`
2. Reference resources using URI patterns (e.g., `[elementor://global-classes]`)
3. Structure descriptions to point to resources rather than embed content

## Success Criteria

1. **Payload Reduction**: Tool descriptions contain only essential operational information; lengthy instructional content moved to resources
2. **Resource Availability**: All extracted content is accessible via documented MCP resource URIs
3. **Tool Functionality**: Tools declare required resources via `requiredResources` or `_meta['angie:required-resources']` configuration
4. **No Behavioral Changes**: AI agents can perform the same operations with identical quality
5. **Consistent Pattern**: All affected MCPs follow the same extraction pattern

## Constraints

1. **No Breaking Changes**: Existing tool APIs and resource URIs must remain stable
2. **Backward Compatibility**: Tools must continue to function if resources are unavailable (graceful degradation)
3. **Single Responsibility**: Each resource should serve one clear purpose
4. **Minimal Duplication**: Shared content (e.g., PropValue schemas) should be defined once and referenced by multiple tools
5. **Naming Convention**: Resource URIs must follow the established pattern `elementor://{domain}/{resource-type}`
6. **Server Description as Required Resource**: When server-level `instructions` are extracted to a resource, ALL tools within that server MUST require that resource. This ensures AI agents always have access to the server context when using any tool.
7. **Preserve Registration Pattern**: Some MCP servers register via the `editor-mcp` abstraction layer, others register directly via the MCP SDK. This distinction exists by design and MUST NOT be changed. The registration method for each MCP must remain as-is.

## Implementation Suggestion: Automatic Resource Inclusion

The `editor-mcp` package should be enhanced to automatically inject server-description resources as required dependencies for all tools registered through the abstraction layer.

### Proposed Enhancement Location
- `packages/packages/libs/editor-mcp/src/mcp-registry.ts`

### Expected Behavior for Abstraction Layer Registration
1. When a server defines its `instructions` as a resource URI (e.g., `elementor://capabilities/server-description`), the abstraction layer should:
   - Automatically add this resource to the `requiredResources` array of every tool registered with that server
   - Avoid duplicate entries if a tool already explicitly declares the resource
2. This removes the burden from individual tool implementations and ensures consistent behavior

### Expected Behavior for Direct SDK Registration
For MCPs that register directly via the MCP SDK (not through the abstraction layer):
1. Each tool MUST explicitly declare the server-description resource in its `requiredResources` or `_meta['angie:required-resources']` configuration
2. This is a manual process and must be implemented in the tool registration code

## Scope

### MCPs to Investigate

The following MCPs are under our responsibility and require investigation:

| MCP Package | Location | Registration | Status |
|-------------|----------|--------------|--------|
| elementor-capabilities-mcp | `packages/apps/elementor-capabilities-mcp/src/` | Direct SDK | Has large embedded server instructions |
| editor-canvas | `packages/packages/core/editor-canvas/src/mcp/` | Abstraction | Has large embedded descriptions |
| editor-global-classes | `packages/packages/core/editor-global-classes/src/mcp-integration/` | Abstraction | Has embedded descriptions |
| editor-variables | `packages/packages/core/editor-variables/src/mcp/` | Abstraction | Has embedded descriptions |
| elementor-kit-mcp | `packages/packages/core/elementor-kit-mcp/src/` | Direct SDK | Has large embedded descriptions |
| elementor-v3-mcp | `packages/packages/core/elementor-v3-mcp/src/` | Direct SDK | Has embedded descriptions |
| editor-components | `packages/packages/core/editor-components/src/` | N/A | No MCP implementation - skip |

### Files Requiring Analysis

#### elementor-capabilities-mcp
- `packages/apps/elementor-capabilities-mcp/src/elementor-capabilities-mcp-server.ts` - **Server instructions**: Large `instructions` string with capabilities/limitations documentation (~150 lines)

#### editor-canvas
- `packages/packages/core/editor-canvas/src/mcp/mcp-description.ts` - **Server instructions**: `mcpDescription` constant (~110 lines)
- `packages/packages/core/editor-canvas/src/mcp/tools/build-composition/prompt.ts` - Reference implementation for tool-level extraction
- `packages/packages/core/editor-canvas/src/mcp/tools/configure-element/prompt.ts` - **Tool description**: Large embedded prompt (~100 lines)

#### editor-global-classes
- `packages/packages/core/editor-global-classes/src/mcp-integration/mcp-manage-global-classes.ts`
- `packages/packages/core/editor-global-classes/src/mcp-integration/mcp-apply-unapply-global-classes.ts`
- `packages/packages/core/editor-global-classes/src/mcp-integration/mcp-get-global-class-usages.ts`

#### editor-variables
- `packages/packages/core/editor-variables/src/mcp/manage-variable-tool.ts`

#### elementor-kit-mcp
- `packages/packages/core/elementor-kit-mcp/src/elementor-kit-mcp-server.ts` - **Server instructions**: `SERVER_INSTRUCTIONS` constant; **Tool descriptions**: Large embedded descriptions in `update-elementor-kit-settings-colors-and-fonts` tool

#### elementor-v3-mcp
- `packages/packages/core/elementor-v3-mcp/src/tools/styling-tool.ts` - Large embedded description
- `packages/packages/core/elementor-v3-mcp/src/tools/page-tool.ts` - Embedded description
- `packages/packages/core/elementor-v3-mcp/src/tools/ui-tool.ts`
- `packages/packages/core/elementor-v3-mcp/src/tools/dynamic-tool.ts`
- `packages/packages/core/elementor-v3-mcp/src/tools/ai-tool.ts`
- `packages/packages/core/elementor-v3-mcp/src/tools/routes-tool.ts`

### Supporting Infrastructure

- `packages/packages/libs/editor-mcp/src/utils/prompt-builder.ts` - ToolPrompts utility
- `packages/packages/core/editor-canvas/src/mcp/resources/best-practices.ts` - Example of extracted content

## References

### Existing Resource Patterns
- `packages/packages/core/editor-canvas/src/mcp/resources/available-widgets-resource.ts`
- `packages/packages/core/editor-canvas/src/mcp/resources/widgets-schema-resource.ts`
- `packages/packages/core/editor-variables/src/mcp/variables-resource.ts`
- `packages/packages/core/editor-global-classes/src/mcp-integration/classes-resource.ts`

### MCP Registry Pattern (Enhancement Target)
- `packages/packages/libs/editor-mcp/src/mcp-registry.ts` - Target for automatic server-description resource injection

## Out of Scope

- Creating new MCP servers
- Modifying tool handler logic
- Changing tool input/output schemas
- Performance optimization beyond payload reduction
- Documentation updates (unless explicitly requested)
