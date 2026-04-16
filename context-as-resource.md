# Context as MCP Resources - Feature Plan

## Overview

Replace the monolithic `currentContext` object (sent as a single payload) with discrete MCP resources that can be independently subscribed to and updated. This enables granular updates, better resource management, and cleaner separation of concerns.

## Current Implementation (Reference: elementor-ai)

### Context Object Structure

**Location:** `editor-saas-services/packages/ai-remote-integration/lib/mcp/context-mcp-server.ts`

The current `Context` type contains:

| Context Key | Description | Current Listeners |
|-------------|-------------|-------------------|
| `editor` | Elementor editor state (selection, globals, page content) | `addEditorListener()` - subscribes to `$e.commands.on('run:after')` |
| `general` | WordPress admin info (time, plugins, page info) | `updateGeneralContext()` - interval updates every 60s |
| `woocommerce` | WooCommerce product edit data | `addWooListener()` - subscribes to `history.pushState/replaceState` |
| `wp_admin_fields` | WordPress admin form fields | `addWpAdminFieldsContextListener()` - `focusin`, `change` events |
| `studio` | Studio UI session state | `addStudioListener()` - custom window events |

### Context Data Details

1. **Editor Context** (`editor-saas-services/packages/ai-remote-integration/lib/mcp/context-mcp-server.ts:234-415`)
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

3. **WooCommerce Context** (`woocommerce-single-product-edit-server.ts:187-224`)
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

### Resource URIs

| Resource URI | Maps To | Package Location |
|--------------|---------|------------------|
| `elementor://context/editor-state` | `editor` context | `editor-canvas` |
| `elementor://context/selected-element` | Editor selection details | `editor-canvas` |
| `elementor://context/general` | `general` context | `editor-canvas` |
| `elementor://context/available-widgets` | Widget types with version info | `editor-canvas` |
| `elementor://global-variables` | V3 + V4 globals (unified) | `editor-variables` (extend existing) |
| `elementor://context/wp-admin` | `wp_admin_fields` context | Out of scope (handled by AI plugin) |
| `elementor://context/woocommerce` | `woocommerce` context | Out of scope (handled by AI plugin) |
| `elementor://context/studio` | `studio` context | Out of scope (handled by AI plugin) |

### Existing Resources to Leverage

| Existing Resource | URI | Package | Notes |
|-------------------|-----|---------|-------|
| Document structure | `elementor://document/structure` | `editor-canvas` | Extend: add element `version`, verify listeners |
| Global variables | `elementor://global-variables` | `editor-variables` | Extend to include v3 + v4 with version property |
| Widgets schema | `elementor://widgets/schema/{widgetType}` | `editor-canvas` | V4: full schema; V3: message + defaults from `controls[*].default` |
| Breakpoints | `elementor://breakpoints` | `editor-canvas` | |

### Globals Strategy: Unified Resource with Version Property

| Resource | Source | Description |
|----------|--------|-------------|
| `elementor://global-variables` | `service.variables()` + `$e.data.get('globals/*')` | Combined v3 & v4 variables with version property |

Single resource provides both v3 and v4 globals, each entry includes a `version` property:
- V4 variables: from `service.variables()` with `version: 'v4'`
- V3 globals: from `$e.data.get('globals/colors')` and `$e.data.get('globals/typography')` with `version: 'v3'`

### Available Widgets Strategy: Complete List with Version

New resource `elementor://context/available-widgets` exposes **every widget** from `widgetsCache` with version metadata:

| Widget Version | Identification | Schema Resource Behavior |
|----------------|----------------|--------------------------|
| V4 (Atomic) | Has `atomic_props_schema` in `widgetsCache` | Returns full schema via `elementor://widgets/schema/{type}` |
| V3 (Legacy) | No `atomic_props_schema` in `widgetsCache` | Returns message + default values (see below) |

**Output:** Array of all widgets, each with:
- `type`: widget type name
- `version`: `'v4'` or `'v3'`

**Note:** This is the complete list of all available widgets, not filtered by version.

### V3 Widget Schema Fallback Behavior

When `elementor://widgets/schema/{type}` is requested for a V3 widget:
- Return a message indicating the widget exists but has no schema
- Include note that **all fields are optional**
- Extract control metadata from `widgetsCache[widget].controls[*]`:
  - `default` - default value
  - `type` - control type (when available)
  - `options` - available options (when available)

**Source:** `window.elementor.widgetsCache[widgetType].controls` - iterate controls, extract `default`, `type`, `options`

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

**Data structure change:**
- Each variable entry includes `version: 'v4'` or `version: 'v3'`
- V4 variables: from `service.variables()` (existing)
- V3 globals: from `$e.data.get('globals/colors')` and `$e.data.get('globals/typography')`

**Additional listeners to implement:**
- `commandEndEvent('document/save/update')` for v3 globals refresh

**Output format:**
```
{
  "var-id-1": { ...v4Variable, version: "v4" },
  "global-color-primary": { ...v3Color, version: "v3" },
  "global-typography-primary": { ...v3Typography, version: "v3" }
}
```

### Phase 4: Available Widgets Resource

**New File:** `packages/packages/core/editor-canvas/src/mcp/resources/available-widgets-resource.ts`

**URI:** `elementor://context/available-widgets`

**Data to expose:**
- Array of **every widget** with:
  - `type`: widget type name (e.g., `'e-button'`, `'button'`)
  - `version`: `'v4'` if has `atomic_props_schema`, otherwise `'v3'`

**Source:** `window.elementor.widgetsCache` - iterate **all** keys, determine version by presence of `atomic_props_schema`

**Output format:**
```
[
  { "type": "e-button", "version": "v4" },
  { "type": "e-heading", "version": "v4" },
  { "type": "button", "version": "v3" },
  { "type": "heading", "version": "v3" },
  ...
]
```

### Phase 5: Document Structure Resource (Update Existing)

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

### Phase 6: General Context Resource

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

| Reference Code Location | New Elementor Location | Notes |
|------------------------|------------------------|-------|
| `context-mcp-server.ts:addEditorListener` | `selected-element-resource.ts`, `editor-state-resource.ts` | Split into two resources |
| `context-mcp-server.ts:getElementorGlobals` | `variables-resource.ts` | Extend existing with v3 globals + version property |
| `context-mcp-server.ts:subscribeToElementSelection` | `selected-element-resource.ts` | Use `listenTo` pattern |
| `context-mcp-server.ts:updateGeneralContext` | `general-context-resource.ts` | Time, timezone, page info |
| `context-mcp-server.ts:getPageTitle` | Shared util | Already exists partially |
| `context-mcp-server.ts:getElementDisplayName` | Shared util | Reuse in selection resource |
| `context-mcp-server.ts:getElementorPageContent` | `editor-state-resource.ts` | Content extraction with limit |
| `context-mcp-server.ts:filterWidgetTypes` | `available-widgets-resource.ts` | Extended with version metadata |
| `widgets-schema-resource.ts:list()` | `available-widgets-resource.ts` | Unified widget listing with v3/v4 distinction |

---

## Registration Pattern

Follow existing pattern from `editor-canvas/src/mcp/canvas-mcp.ts`:

```
initCanvasMcp(reg) → calls initDocumentStructureResource(reg)
                   → calls initSelectedElementResource(reg)      // NEW
                   → calls initEditorStateResource(reg)          // NEW
                   → calls initAvailableWidgetsResource(reg)     // NEW
                   → calls initGeneralContextResource(reg)       // NEW
```

```
initVariablesMcp(reg) → calls initVariablesResource(reg)         // MODIFIED (v3 + v4 unified)
```

Each resource:
1. Registers via `reg.resource(name, uri, options, handler)`
2. Sends updates via `reg.sendResourceUpdated({ uri })`
3. Listens to Elementor commands via `listenTo([commandEndEvent(...)])`

---

## Out of Scope (Handled by AI Plugin)

The following contexts remain in the AI plugin codebase (elementor-ai):
- WooCommerce product edit context
- WP Admin fields context
- Studio UI context
- `quickActions` - handled in Angie React context, UI concern not editor state

These are WordPress-admin-level or AI plugin UI concerns that don't belong in the editor packages.

---

## Open Questions

(All resolved)

## Resolved Decisions

- **URI Naming:** Use `context/*` prefix (not `session/*`)
- **Globals Strategy:** Unified resource - extend existing `global-variables` to include both v3 and v4 with `version` property
- **Widget Versions:** Expose version info (`v3`/`v4`) based on presence of `atomic_props_schema`
- **Widget Description:** Provide `meta?.description` if available (v4 has it, v3 is future ticket)
- **Package Location:** All context resources in `editor-canvas` module (including `editor-state` and `selected-element`)
- **Page Content Updates:** Resource with `sendResourceUpdated` notification (debounced)

---

## Files to Create/Modify

### New Files
- `packages/packages/core/editor-canvas/src/mcp/resources/selected-element-resource.ts`
- `packages/packages/core/editor-canvas/src/mcp/resources/editor-state-resource.ts`
- `packages/packages/core/editor-canvas/src/mcp/resources/available-widgets-resource.ts`
- `packages/packages/core/editor-canvas/src/mcp/resources/general-context-resource.ts`

### Files to Modify
- `packages/packages/core/editor-canvas/src/mcp/canvas-mcp.ts` - add new resource initializations
- `packages/packages/core/editor-canvas/src/mcp/resources/document-structure-resource.ts` - add element `version`, verify listeners
- `packages/packages/core/editor-variables/src/mcp/variables-resource.ts` - extend with v3 globals + version property

### Files to Modify (Schema Fallback)
- `packages/packages/core/editor-canvas/src/mcp/resources/widgets-schema-resource.ts` - Add V3 fallback: return message + defaults from `controls[*].default`

### Reference Files (elementor-ai)
- `editor-saas-services/packages/ai-remote-integration/lib/mcp/context-mcp-server.ts`
- `editor-saas-services/packages/ai-remote-integration/lib/mcp/elementor-mcp-server-v2/context.ts`
- `editor-saas-services/packages/ai-remote-integration/lib/mcp/wp-admin-fields-context.ts`
- `editor-saas-services/packages/ai-remote-integration/lib/mcp/woocommerce-mcp-server/woocommerce-single-product-edit-server.ts`

---

## Technical Debts (to be created as JIRA tickets)

- Update MCP descriptions and text-based guide resources
- Ensure `quickActions` works without context-mcp
- Add `meta.description` to V3 widgets
- Discuss `pageContent` truncation limit (currently 500 characters)
- Discuss converting document structure from resource to tool (performance: rebuilds on every action)
