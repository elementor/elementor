# Context as MCP Resources - Feature Plan

## Overview

Replace the monolithic `currentContext` object (sent as a single payload) with discrete MCP resources that can be independently subscribed to and updated. This enables granular updates, better resource management, and cleaner separation of concerns.

## Scope

**Reference Repository:** `~/dev/tmp-src/elementor-ai`

**Implementation Scope (this repo):**

```
packages/packages/core/editor-canvas/src/mcp/
├── resources/
│   ├── selected-element-resource.ts    (NEW)
│   ├── editor-state-resource.ts        (NEW)
│   ├── available-widgets-resource.ts   (NEW)
│   ├── general-context-resource.ts     (NEW)
│   ├── document-structure-resource.ts  (MODIFY)
│   └── widgets-schema-resource.ts      (MODIFY)
├── tools/
│   ├── configure-element/tool.ts       (MODIFY - v3 detection)
│   ├── get-element-config/tool.ts      (MODIFY - v3 detection)
│   └── build-composition/tool.ts       (MODIFY - v3 detection)
└── canvas-mcp.ts                       (MODIFY)

packages/packages/core/editor-variables/src/mcp/
└── variables-resource.ts               (MODIFY)
```

**Related (v3 MCP):**
```
packages/packages/core/elementor-v3-mcp/src/
├── resources.ts                        (MODIFY - remove duplicate page-overview)
└── elementor-mcp-server.ts             (reference)
```

## Current Implementation (Reference: elementor-ai)

### Context Object Structure

**Location:** <Reference repo> `editor-saas-services/packages/ai-remote-integration/lib/mcp/context-mcp-server.ts`

The current `Context` type contains:

| Context Key       | Description                                               | Current Listeners                                                   |
| ----------------- | --------------------------------------------------------- | ------------------------------------------------------------------- |
| `editor`          | Elementor editor state (selection, globals, page content) | `addEditorListener()` - subscribes to `$e.commands.on('run:after')` |
| `general`         | WordPress admin info (time, plugins, page info)           | `updateGeneralContext()` - interval updates every 60s               |
| `woocommerce`     | WooCommerce product edit data                             | OUT OF SCOPE                                                        |
| `wp_admin_fields` | WordPress admin form fields                               | OUT OF SCOPE                                                        |
| `studio`          | Studio UI session state                                   | OUT OF SCOPE                                                        |

### Context Data Details

1. **Editor Context** (<Reference repo>`editor-saas-services/packages/ai-remote-integration/lib/mcp/context-mcp-server.ts:234-415`)

   - `displayName`: Page title + selected element
   - `data.pageTitle`, `data.pageContent`, `data.elementDisplayName`
   - `data.selectedElementId`, `data.selectedParentId`, `data.selectedWidgetType`
   - `globals.colors`, `globals.typography`
   - Listeners: `document/elements/select`, `document/elements/deselect-all`, `document/elements/settings`, `document/save/update`, `editor/documents/switch`

2. **General Context** (`context-mcp-server.ts:502-563`)

   - `data.today` (gmt, user time)
   - `data.timezone`, `data.currentPage` (pageName, pageTitle, menuPath, pageUrl)
   - `data.plugins`, `data.installedPlugins`
   - `postId`

3. **WooCommerce Context** (<Reference repo>`woocommerce-single-product-edit-server.ts:187-224`)

   - `currentlyViewedProductId`
   - `productUIInputFields` (array of label, name, id, type, value)

4. **WP Admin Fields Context** (`wp-admin-fields-context.ts:117-446`)

   - `data.selectedField` (name, type, value, label, id, imageUrl, isVisible, isDisabled)
   - `data.checklist` (checkboxes)
   - `data.allAvailableFields`

5. **Studio Context** (event-driven via `MessageEventType.STUDIO_UI_STATE_UPDATE`)
   - `isStudioMode`
   - `currentView` ('sitemap' | 'wireframe' | 'page planner empty state')

---

## Proposed Resource Structure

### Resources Overview

| Resource URI                            | Action | Package            | Notes                                   |
| --------------------------------------- | ------ | ------------------ | --------------------------------------- |
| `elementor://context/selected-element`  | New    | `editor-canvas`    | Selection details                       |
| `elementor://context/editor-state`      | New    | `editor-canvas`    | Page title, content                     |
| `elementor://context/general`           | New    | `editor-canvas`    | Time, timezone, page info               |
| `elementor://context/available-widgets` | New    | `editor-canvas`    | All widgets with version                |
| `elementor://document/structure`        | Extend | `editor-canvas`    | Add element `version`, verify listeners |
| `elementor://global-variables`          | Extend | `editor-variables` | Add v3 globals + version property       |
| `elementor://widgets/schema/{type}`     | Extend | `editor-canvas`    | V3 fallback: message + defaults         |
| `elementor://breakpoints`               | Keep   | `editor-canvas`    | No changes                              |
| `elementor://context/wp-admin`          | -      | Out of scope       | AI plugin                               |
| `elementor://context/woocommerce`       | -      | Out of scope       | AI plugin                               |
| `elementor://context/studio`            | -      | Out of scope       | AI plugin                               |

---

## Implementation Plan

### Phase 1: Selected Element Resource

**New File:** `packages/packages/core/editor-canvas/src/mcp/resources/selected-element-resource.ts`

**URI:** `elementor://context/selected-element`

**Listeners to implement:**

- `commandEndEvent('document/elements/select')`
- `commandEndEvent('document/elements/deselect-all')`
- `commandEndEvent('document/elements/settings')`

**Data to expose:**

- `selectedElementId`, `selectedParentId`, `elementType`, `widgetType`, `elementDisplayName`

### Phase 2: Editor State Resource

**New File:** `packages/packages/core/editor-canvas/src/mcp/resources/editor-state-resource.ts`

**URI:** `elementor://context/editor-state`

**Listeners to implement:**

- `commandEndEvent('editor/documents/switch')`
- `commandEndEvent('editor/documents/attach-preview')`
- Debounced content extraction (same as reference `getElementorPageContent()`)

**Data to expose:**

- `pageTitle`, `pageContent` (text from preview, **500 char limit for now**), `currentlyViewedScreen`

### Phase 3: Extend Variables Resource (V3 + V4 Unified)

**Modify:** `packages/packages/core/editor-variables/src/mcp/variables-resource.ts`

**URI:** `elementor://global-variables` (unchanged)

**Changes:**

- Add `version` property to each entry (`'v4'` or `'v3'`)
- V4: from `service.variables()` (existing)
- V3: from `$e.data.get('globals/colors')` and `$e.data.get('globals/typography')`

**Additional listener:** `commandEndEvent('document/save/update')` for v3 globals refresh

### Phase 4: Available Widgets Resource

**New File:** `packages/packages/core/editor-canvas/src/mcp/resources/available-widgets-resource.ts`

**URI:** `elementor://context/available-widgets`

**Data:** Array of **every widget** with `type` and `version` (`'v4'` if has `atomic_props_schema`, otherwise `'v3'`)

**Source:** `window.elementor.widgetsCache` - all keys

### Phase 5: Widget Schema V3 Fallback

**Modify:** `packages/packages/core/editor-canvas/src/mcp/resources/widgets-schema-resource.ts`

**V3 widget behavior:** When schema requested for V3 widget:

- Return message: widget exists but has no schema, all fields are optional
- Extract from `widgetsCache[widget].controls[*]`: `default`, `type`, `options`

### Phase 6: Document Structure Resource (Update + Remove Duplicate)

**Modify:** `packages/packages/core/editor-canvas/src/mcp/resources/document-structure-resource.ts`

**URI:** `elementor://document/structure` (unchanged)

**Changes:**

- Add `version` property to each element (`'v4'` or `'v3'` based on `atomic_props_schema`)
- Verify all proper listeners are in place (compare with reference implementation)

**Current listeners:**

- `document/elements/create`, `delete`, `move`, `copy`, `paste`
- `editor/documents/attach-preview`

**Reference listeners to verify:**

- `document/elements/select`, `deselect-all`, `settings`
- `editor/documents/switch`

**Remove duplicate from `elementor-v3-mcp/src/resources.ts`:**

- Remove `RESOURCE_NAME_PAGE_OVERVIEW` / `elementor://editor/page-overview` (lines 59-83)
- Remove `getPageOverView` from `./context` import
- V3 tools use `elementor://document/structure` instead

### Phase 7: General Context Resource

**New File:** `packages/packages/core/editor-canvas/src/mcp/resources/general-context-resource.ts`

**URI:** `elementor://context/general`

**Data to expose:**

- `today` (gmt, user time)
- `timezone`, `postId`
- `currentPage` (pageName, pageTitle, pageUrl)

**Update mechanism:**

- Initialize on load
- Interval update for time (60s)

---

## Reference Mappings

| Reference Code Location                             | New Elementor Location                                     | Notes                                              |
| --------------------------------------------------- | ---------------------------------------------------------- | -------------------------------------------------- |
| `context-mcp-server.ts:addEditorListener`           | `selected-element-resource.ts`, `editor-state-resource.ts` | Split into two resources                           |
| `context-mcp-server.ts:getElementorGlobals`         | `variables-resource.ts`                                    | Extend existing with v3 globals + version property |
| `context-mcp-server.ts:subscribeToElementSelection` | `selected-element-resource.ts`                             | Use `listenTo` pattern                             |
| `context-mcp-server.ts:updateGeneralContext`        | `general-context-resource.ts`                              | Time, timezone, page info                          |
| `context-mcp-server.ts:getPageTitle`                | Shared util                                                | Already exists partially                           |
| `context-mcp-server.ts:getElementDisplayName`       | Shared util                                                | Reuse in selection resource                        |
| `context-mcp-server.ts:getElementorPageContent`     | `editor-state-resource.ts`                                 | Content extraction with limit                      |
| `context-mcp-server.ts:filterWidgetTypes`           | `available-widgets-resource.ts`                            | Extended with version metadata                     |
| `widgets-schema-resource.ts:list()`                 | `available-widgets-resource.ts`                            | Unified widget listing with v3/v4 distinction      |

---

## Out of Scope (Handled by AI Plugin)

The following contexts remain in the AI plugin codebase (elementor-ai):

- WooCommerce product edit context
- WP Admin fields context
- Studio UI context
- `quickActions` - handled in Angie React context, UI concern not editor state

These are WordPress-admin-level or AI plugin UI concerns that don't belong in the editor packages.

---

## Resolved Decisions

- **URI Naming:** Use `context/*` prefix (not `session/*`)
- **Globals Strategy:** Unified resource - extend existing `global-variables` to include both v3 and v4 with `version` property
- **Widget Versions:** Expose version info (`v3`/`v4`) based on presence of `atomic_props_schema`
- **Widget Description:** Provide `meta?.description` if available (v4 has it, v3 is future ticket)
- **Package Location:** All context resources in `editor-canvas` module (including `editor-state` and `selected-element`)
- **Page Content Updates:** Resource with `sendResourceUpdated` notification (debounced)

---

## Files to Create/Modify

### New Files (`editor-canvas`)

- `src/mcp/resources/selected-element-resource.ts`
- `src/mcp/resources/editor-state-resource.ts`
- `src/mcp/resources/available-widgets-resource.ts`
- `src/mcp/resources/general-context-resource.ts`

### Modify

- `editor-canvas/src/mcp/canvas-mcp.ts` - add new resource initializations
- `editor-canvas/src/mcp/resources/document-structure-resource.ts` - add element `version`, verify listeners
- `editor-canvas/src/mcp/resources/widgets-schema-resource.ts` - V3 fallback: message + defaults
- `editor-canvas/src/mcp/tools/configure-element/tool.ts` - v3 element detection, return error
- `editor-canvas/src/mcp/tools/get-element-config/tool.ts` - v3 element detection, return error
- `editor-canvas/src/mcp/tools/build-composition/tool.ts` - v3 element detection, return error
- `editor-variables/src/mcp/variables-resource.ts` - add v3 globals + version property
- `elementor-v3-mcp/src/resources.ts` - remove duplicate page-overview resource

### Reference (~/dev/tmp-src/elementor-ai)

- `editor-saas-services/packages/ai-remote-integration/lib/mcp/context-mcp-server.ts`
- `editor-saas-services/packages/ai-remote-integration/lib/mcp/elementor-mcp-server-v2/context.ts`

---

## Task Dependencies

```
┌──────────────┬──────────────┬──────────────┬────────────┐
│ Phase 1      │ Phase 2      │ Phase 3      │ Phase 7    │
│ selected-    │ editor-      │ variables    │ general-   │
│ element      │ state        │ (extend)     │ context    │
├──────────────┼──────────────┼──────────────┼────────────┤
│ Phase 4      │ Phase 5      │ Phase 6a     │            │
│ available-   │ widget-      │ document-    │            │
│ widgets      │ schema v3    │ structure    │            │
├──────────────┴──────────────┴──────────────┴────────────┤
│ Phase 6b: Remove v3-mcp duplicate                       │
├─────────────────────────────────────────────────────────┤
│ V3 tool detection (configure/get/build-composition)     │
├─────────────────────────────────────────────────────────┤
│ Wire up in canvas-mcp.ts                                │
└─────────────────────────────────────────────────────────┘
```

**Shared utility consideration:** Phases 4, 5, 6a all need version detection (`atomic_props_schema` check) - could extract shared util or duplicate inline.

---

## V3 Element Handling in V4 Tools

**Current state:** `configure-element` and `build-compositions` tools in `editor-canvas` only support v4 elements.

**Implementation change:** These tools should detect v3 elements (no `atomic_props_schema`) and return an error instructing the LLM to change the plan and use `elementor-v3-mcp` tools instead.

**Files to modify:**
- `editor-canvas/src/mcp/tools/configure-element/tool.ts`
- `editor-canvas/src/mcp/tools/get-element-config/tool.ts`
- `editor-canvas/src/mcp/tools/build-composition/tool.ts`

**Existing v3 tools location:** `packages/packages/core/elementor-v3-mcp/src/elementor-mcp-server.ts`

---

## Technical Debts (to be created as JIRA tickets)

- Update MCP descriptions and text-based guide resources
- Ensure `quickActions` works without context-mcp
- Add `meta.description` to V3 widgets
- Discuss `pageContent` truncation limit (currently 500 characters)
- Discuss converting document structure from resource to tool (performance: rebuilds on every action)
- Unify `elementor-v3-mcp` element tools with v4 `editor-canvas` tools
