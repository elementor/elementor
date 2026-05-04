# MCP Description to Resources Migration Plan

## IMPORTANT: Human-in-the-Loop Required

**After EVERY TASK, the user must approve the changeset before proceeding to the next task.** Do not continue to subsequent tasks without explicit user approval. This ensures quality control and allows for course correction at each step.

## Overview

Migrate large embedded descriptions from MCP tools and servers into standalone resources. This reduces payload sizes by allowing AI to fetch documentation on-demand rather than receiving it with every tool listing.

## Key Patterns

**Reference Implementation**: [`packages/packages/core/editor-canvas/src/mcp/tools/build-composition/prompt.ts`](packages/packages/core/editor-canvas/src/mcp/tools/build-composition/prompt.ts)
- Uses `toolPrompts` utility from `@elementor/editor-mcp`
- References resources using URI patterns (e.g., `[elementor://global-classes]`)

**Resource Declaration**: Tools declare required resources via:
- `requiredResources` array in tool options
- `_meta['angie:required-resources']` for direct SDK registrations

## Phase 1: Infrastructure Enhancement

### 1.1 Enhance MCP Registry Auto-Injection

**File**: [`packages/packages/libs/editor-mcp/src/mcp-registry.ts`](packages/packages/libs/editor-mcp/src/mcp-registry.ts)

When `getMCPByDomain()` is called with `instructions` that reference a resource URI:
- Parse the instructions for server-description resource URI
- Auto-inject this resource into `requiredResources` for all tools registered via `addTool()`
- Avoid duplicates if tool already declares the resource

This removes manual burden from abstraction-layer MCP tools.

## Phase 2: Server Description Extraction

### 2.1 elementor-capabilities-mcp (Direct SDK)

**Server File**: [`packages/apps/elementor-capabilities-mcp/src/elementor-capabilities-mcp-server.ts`](packages/apps/elementor-capabilities-mcp/src/elementor-capabilities-mcp-server.ts)

- Extract ~105 line `instructions` string to new resource
- Create resource file: `packages/apps/elementor-capabilities-mcp/src/mcp-description-resource.ts` (side-by-side with server)
- URI: `elementor://capabilities/server-description`
- Manually add to `_meta['angie:required-resources']` on `navigate-to-elementor-editor` tool

### 2.2 editor-canvas (Abstraction Layer)

**Server File**: [`packages/packages/core/editor-canvas/src/mcp/mcp-description.ts`](packages/packages/core/editor-canvas/src/mcp/mcp-description.ts)

- Extract ~110 line `mcpDescription` to resource
- Create resource file: `packages/packages/core/editor-canvas/src/mcp/mcp-description-resource.ts` (side-by-side with server)
- URI: `elementor://canvas/server-description`
- Auto-injected via Phase 1 enhancement

### 2.3 elementor-kit-mcp (Direct SDK)

**Server File**: [`packages/packages/core/elementor-kit-mcp/src/elementor-kit-mcp-server.ts`](packages/packages/core/elementor-kit-mcp/src/elementor-kit-mcp-server.ts)

- Extract `SERVER_INSTRUCTIONS` (~23 lines) to resource
- Create resource file: `packages/packages/core/elementor-kit-mcp/src/mcp-description-resource.ts` (side-by-side with server)
- URI: `elementor://kit/server-description`
- Manually add to `_meta['angie:required-resources']` on `update-elementor-kit-settings-colors-and-fonts` tool

## Phase 3: Tool Description Extraction

### 3.1 editor-canvas: configure-element

**File**: [`packages/packages/core/editor-canvas/src/mcp/tools/configure-element/prompt.ts`](packages/packages/core/editor-canvas/src/mcp/tools/configure-element/prompt.ts)

- Current: ~100 line embedded prompt
- Refactor to use `toolPrompts` pattern like `build-composition/prompt.ts`
- Extract to resource: `elementor://canvas/tools/configure-element-guide`

### 3.2 editor-global-classes

**Files**:
- `mcp-manage-global-classes.ts`
- `mcp-apply-unapply-global-classes.ts`
- `mcp-get-global-class-usages.ts`

Analyze each file for large descriptions and extract to resources under `elementor://global-classes/tools/`

### 3.3 editor-variables

**File**: `manage-variable-tool.ts`

Analyze for large descriptions and extract to resource under `elementor://variables/tools/`

### 3.4 elementor-v3-mcp (Direct SDK)

**Files** (analyze and extract as needed):
- `styling-tool.ts` - Large embedded description
- `page-tool.ts` - Embedded description
- `ui-tool.ts`
- `dynamic-tool.ts`
- `ai-tool.ts`
- `routes-tool.ts`

For each, create corresponding resource and manually add `_meta['angie:required-resources']`

## Phase 4: Testing and Validation

- Verify tools function correctly with resource references
- Confirm payload reduction by comparing tool listing sizes
- Test graceful degradation when resources unavailable
- Run package tests: `cd packages && npm test`
- Run linting: `cd packages && npm run lint`

## Constraints to Maintain

- No breaking changes to tool APIs or resource URIs
- Backward compatibility (graceful degradation)
- Single responsibility per resource
- Naming convention: `elementor://{domain}/{resource-type}`
- Preserve registration method (abstraction vs direct SDK) per MCP

## Tasks

- [x] Enhance mcp-registry.ts to auto-inject server-description resources for abstraction layer tools
- [ ] Extract elementor-capabilities-mcp server instructions to resource
- [ ] Extract editor-canvas mcpDescription to resource
- [ ] Extract elementor-kit-mcp SERVER_INSTRUCTIONS to resource
- [ ] Refactor configure-element prompt to use toolPrompts pattern and resource
- [ ] Analyze and extract editor-global-classes tool descriptions
- [ ] Analyze and extract editor-variables tool descriptions
- [ ] Analyze and extract elementor-v3-mcp tool descriptions (6 tools)
- [ ] Run tests and validate payload reduction
