# Context Resources - Agent Orchestration

## Overview

This file contains prompts for orchestrating the implementation of context-as-resource feature across multiple agents.

**Plan file:** `/Users/eavichay/dev/elementor/context-as-resource.md`
**Reference repo:** `~/dev/tmp-src/elementor-ai`

---

## Wave 1 - Parallel Execution

All agents in Wave 1 can run simultaneously.

---

### Agent A1: Selected Element Resource

**Scope:** `packages/packages/core/editor-canvas/src/mcp/resources/selected-element-resource.ts` (NEW)

**Prompt:**
```
Read the plan file at /Users/eavichay/dev/elementor/context-as-resource.md

Implement Phase 1: Selected Element Resource

Create new file: packages/packages/core/editor-canvas/src/mcp/resources/selected-element-resource.ts

Requirements:
- URI: elementor://context/selected-element
- Listeners: commandEndEvent('document/elements/select'), commandEndEvent('document/elements/deselect-all'), commandEndEvent('document/elements/settings')
- Data to expose: selectedElementId, selectedParentId, elementType, widgetType, elementDisplayName

Reference implementation pattern: packages/packages/core/editor-canvas/src/mcp/resources/document-structure-resource.ts

Reference for data extraction: ~/dev/tmp-src/elementor-ai/editor-saas-services/packages/ai-remote-integration/lib/mcp/context-mcp-server.ts (subscribeToElementSelection function, lines 280-392)

Use listenTo from @elementor/editor-v1-adapters for event subscriptions.
Use sendResourceUpdated to notify clients of changes.
```

---

### Agent A2: Editor State Resource

**Scope:** `packages/packages/core/editor-canvas/src/mcp/resources/editor-state-resource.ts` (NEW)

**Prompt:**
```
Read the plan file at /Users/eavichay/dev/elementor/context-as-resource.md

Implement Phase 2: Editor State Resource

Create new file: packages/packages/core/editor-canvas/src/mcp/resources/editor-state-resource.ts

Requirements:
- URI: elementor://context/editor-state
- Listeners: commandEndEvent('editor/documents/switch'), commandEndEvent('editor/documents/attach-preview')
- Data to expose: pageTitle, pageContent (500 char limit), currentlyViewedScreen
- Use debounced content extraction (1 second debounce)

Reference implementation pattern: packages/packages/core/editor-canvas/src/mcp/resources/document-structure-resource.ts

Reference for pageContent extraction: ~/dev/tmp-src/elementor-ai/editor-saas-services/packages/ai-remote-integration/lib/mcp/context-mcp-server.ts (getElementorPageContent function, lines 204-232)

Reference for pageTitle: ~/dev/tmp-src/elementor-ai/editor-saas-services/packages/ai-remote-integration/lib/mcp/context-mcp-server.ts (getPageTitle function, lines 622-640)

Use listenTo from @elementor/editor-v1-adapters for event subscriptions.
Use sendResourceUpdated to notify clients of changes.
Cache content and use debounce for performance.
```

---

### Agent A3: Variables Resource Extension

**Scope:** `packages/packages/core/editor-variables/src/mcp/variables-resource.ts` (MODIFY)

**Prompt:**
```
Read the plan file at /Users/eavichay/dev/elementor/context-as-resource.md

Implement Phase 3: Extend Variables Resource (V3 + V4 Unified)

Modify file: packages/packages/core/editor-variables/src/mcp/variables-resource.ts

Requirements:
- URI remains: elementor://global-variables
- Add version property to each entry ('v4' or 'v3')
- V4 variables: from service.variables() (existing) - add version: 'v4'
- V3 globals: from $e.data.get('globals/colors') and $e.data.get('globals/typography') - add version: 'v3'
- Add listener: commandEndEvent('document/save/update') for v3 globals refresh

Reference for v3 globals extraction: ~/dev/tmp-src/elementor-ai/editor-saas-services/packages/ai-remote-integration/lib/mcp/context-mcp-server.ts (getElementorGlobals function, lines 239-267)

Keep existing v4 functionality, extend with v3 globals.
```

---

### Agent A4: Available Widgets Resource

**Scope:** `packages/packages/core/editor-canvas/src/mcp/resources/available-widgets-resource.ts` (NEW)

**Prompt:**
```
Read the plan file at /Users/eavichay/dev/elementor/context-as-resource.md

Implement Phase 4: Available Widgets Resource

Create new file: packages/packages/core/editor-canvas/src/mcp/resources/available-widgets-resource.ts

Requirements:
- URI: elementor://context/available-widgets
- Data: Array of every widget with type and version
- Version detection: 'v4' if has atomic_props_schema in widgetsCache, otherwise 'v3'
- Source: window.elementor.widgetsCache - iterate all keys

Output format:
[
  { "type": "e-button", "version": "v4" },
  { "type": "button", "version": "v3" },
  ...
]

Reference implementation pattern: packages/packages/core/editor-canvas/src/mcp/resources/document-structure-resource.ts

Use getWidgetsCache from @elementor/editor-elements to access widgets.
```

---

### Agent A5: Widget Schema V3 Fallback

**Scope:** `packages/packages/core/editor-canvas/src/mcp/resources/widgets-schema-resource.ts` (MODIFY)

**Prompt:**
```
Read the plan file at /Users/eavichay/dev/elementor/context-as-resource.md

Implement Phase 5: Widget Schema V3 Fallback

Modify file: packages/packages/core/editor-canvas/src/mcp/resources/widgets-schema-resource.ts

Requirements:
When elementor://widgets/schema/{type} is requested for a V3 widget (no atomic_props_schema):
- Return a message indicating the widget exists but has no schema
- Include note that all fields are optional
- Extract control metadata from widgetsCache[widget].controls[*]:
  - default - default value
  - type - control type (when available)
  - options - available options (when available)

Current behavior only returns v4 widgets with atomic_props_schema. Extend to handle v3 widgets gracefully.

Reference for v3 controls structure: ~/dev/tmp-src/elementor-ai/editor-saas-services/packages/ai-remote-integration/lib/mcp/elementor-mcp-server-v2/context.ts
```

---

### Agent A6: Document Structure Resource

**Scope:** `packages/packages/core/editor-canvas/src/mcp/resources/document-structure-resource.ts` (MODIFY)

**Prompt:**
```
Read the plan file at /Users/eavichay/dev/elementor/context-as-resource.md

Implement Phase 6a: Document Structure Resource Update

Modify file: packages/packages/core/editor-canvas/src/mcp/resources/document-structure-resource.ts

Requirements:
1. Add version property to each element in extractElementData():
   - 'v4' if widget has atomic_props_schema in widgetsCache
   - 'v3' otherwise
   - Use getWidgetsCache from @elementor/editor-elements

2. Verify/add missing listeners (compare with reference):
   Current: document/elements/create, delete, move, copy, paste, editor/documents/attach-preview
   Add if missing: editor/documents/switch

Reference for version detection: check widgetsCache[widgetType]?.atomic_props_schema

Do NOT remove any existing functionality.
```

---

### Agent A7: General Context Resource

**Scope:** `packages/packages/core/editor-canvas/src/mcp/resources/general-context-resource.ts` (NEW)

**Prompt:**
```
Read the plan file at /Users/eavichay/dev/elementor/context-as-resource.md

Implement Phase 7: General Context Resource

Create new file: packages/packages/core/editor-canvas/src/mcp/resources/general-context-resource.ts

Requirements:
- URI: elementor://context/general
- Data to expose:
  - today (gmt time, user local time)
  - timezone
  - postId (from URL param)
  - currentPage (pageName, pageTitle, pageUrl)
- Update mechanism: Initialize on load, interval update for time (60 seconds)

Reference implementation: ~/dev/tmp-src/elementor-ai/editor-saas-services/packages/ai-remote-integration/lib/mcp/context-mcp-server.ts (updateGeneralContext function, lines 502-563)

Reference implementation pattern: packages/packages/core/editor-canvas/src/mcp/resources/document-structure-resource.ts

Use setInterval for periodic time updates.
Use sendResourceUpdated to notify clients of changes.
```

---

## Wave 2 - Sequential (After Wave 1)

These agents run after Wave 1 completes.

---

### Agent B1: Remove V3-MCP Duplicate

**Scope:** `packages/packages/core/elementor-v3-mcp/src/resources.ts` (MODIFY)

**Depends on:** Agent A6

**Prompt:**
```
Read the plan file at /Users/eavichay/dev/elementor/context-as-resource.md

Implement Phase 6b: Remove V3-MCP Duplicate

Modify file: packages/packages/core/elementor-v3-mcp/src/resources.ts

Requirements:
1. Remove RESOURCE_NAME_PAGE_OVERVIEW constant
2. Remove RESOURCE_URI_PAGE_OVERVIEW constant
3. Remove the server.resource() block for page-overview (lines 59-83)
4. Remove getPageOverView from the import statement (line 3)

The v4 document-structure resource at elementor://document/structure now handles this.

Do NOT remove other resources (page-settings, element-settings, widget-config).
```

---

### Agent B2: V3 Tool Detection

**Scope:** 3 tool files in `packages/packages/core/editor-canvas/src/mcp/tools/`

**Depends on:** Agents A4, A5, A6

**Prompt:**
```
Read the plan file at /Users/eavichay/dev/elementor/context-as-resource.md

Implement V3 Element Detection in V4 Tools

Modify these files:
- packages/packages/core/editor-canvas/src/mcp/tools/configure-element/tool.ts
- packages/packages/core/editor-canvas/src/mcp/tools/get-element-config/tool.ts
- packages/packages/core/editor-canvas/src/mcp/tools/build-composition/tool.ts

Requirements:
For each tool, add v3 element detection at the start of the handler:
1. Check if the element/widget type has atomic_props_schema in widgetsCache
2. If NOT (v3 element), throw an error with message:
   "This tool does not support V3 elements. Please use the elementor-v3-mcp tools instead for element type: {type}"

Use getWidgetsCache from @elementor/editor-elements for version detection.

For configure-element: check elementType parameter directly
For get-element-config: derive element type from the element using
  element.model.get('widgetType') || element.model.get('elType'), then check
For build-composition: parse xmlStructure, extract all widget types, and check each before processing
```

---

## Execution Order Summary

```
Wave 1 (parallel): A1, A2, A3, A4, A5, A6, A7
         ↓
Wave 2 (parallel): B1, B2
```

Note: Canvas MCP wiring (previously Wave 3/C1) was completed during Wave 1.

## Validation

After all agents complete, run:
```bash
cd packages && npm run lint && npm run test
```
