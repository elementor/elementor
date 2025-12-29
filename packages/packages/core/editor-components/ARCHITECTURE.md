# Component Rename Feature - Architecture Summary

## PR #33828 (ED-21906) - Post-Refactoring

This document describes the final architecture for the Component Rename feature after refactoring.

---

## 1. Feature Overview

### User Flow
1. User opens the **Elements Panel** → **Components Tab**
2. User clicks the **three-dot menu (⋮)** on a component
3. User selects **"Rename"**
4. Component name becomes an **inline editable field**
5. User types the new name and presses **Enter** or clicks away
6. Changes are **validated** (length, uniqueness) and **saved on document save**

### Product Requirements
- Users can rename components from the Components Tab
- **Instance names are independent** of component source names (can have different names)
- When a component is renamed, **existing instances are NOT automatically updated**
- Instances without custom titles display the **current component name** from the store

---

## 2. Architecture Decisions

### Decision 1: Store-Based Name Resolution (Option B)
**Problem:** How should component instances get their display name?

**Rejected Approach (Option A):** Sync component names to each instance via `component_src_name` field
- Required a sync mechanism to propagate changes
- Stored redundant data on each instance
- Complex timing with `await Promise.resolve()` hacks

**Chosen Approach (Option B):** Fetch component name directly from Redux store
- Single source of truth for component names
- No sync mechanism needed
- Real-time updates when component is renamed
- Cleaner, more maintainable code

### Decision 2: Instance vs Source Naming
**Product Requirement:** Users can have one name for the component source and a different name for each instance.

**Implementation:**
- `editor_settings.title` → Instance-specific custom name (user-defined)
- Store lookup by `component_uid` → Component source name (shared)
- Fallback chain ensures graceful degradation

### Decision 3: Validation Consolidation
**Problem:** Duplicate validation logic in multiple files

**Solution:** Consolidate all validation into `createSubmitComponentSchema()` and reuse it everywhere

---

## 3. Data Flow Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                        COMPONENT RENAME FLOW                        │
└─────────────────────────────────────────────────────────────────────┘

┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│  Components  │     │    Redux     │     │   Backend    │
│     Tab      │────▶│    Store     │────▶│   REST API   │
│   (React)    │     │              │     │              │
└──────────────┘     └──────────────┘     └──────────────┘
       │                    │                    │
       │ 1. User renames    │                    │
       │    component       │                    │
       ▼                    ▼                    │
┌──────────────┐     ┌──────────────┐           │
│  Validation  │     │ store.rename │           │
│   (Zod)      │────▶│   action     │           │
└──────────────┘     └──────────────┘           │
                            │                    │
                            │ 2. Updates         │
                            │    state.data      │
                            ▼                    │
                     ┌──────────────┐           │
                     │ Component    │           │
                     │ Instances    │           │
                     │ (getTitle)   │◀──────────┘
                     └──────────────┘
                            │
                            │ 3. On document save,
                            │    persist to backend
                            ▼
                     ┌──────────────┐
                     │ beforeSave   │
                     │ hooks        │
                     └──────────────┘
```

---

## 4. Component Instance Title Resolution

The `getTitle()` method in the component model uses a **fallback chain**:

```typescript
getTitle(): string {
  // 1. Instance-specific title (custom name for this instance)
  const instanceTitle = editorSettings?.title;
  if (instanceTitle) return instanceTitle;

  // 2. Component name from Redux store (real-time, most up-to-date)
  const component = selectComponentByUid(getState(), componentUid);
  if (component?.name) return component.name;

  // 3. Ultimate fallback
  return 'Unnamed';
}
```

### Why This Order?
1. **Instance title first:** Respects user's custom naming for specific instances
2. **Store second:** Provides real-time updates when component is renamed
3. **Fallback last:** Ensures graceful degradation

The store is expected to have component data loaded by the time `getTitle()` is called.

---

## 5. Key Files & Responsibilities

### Frontend (TypeScript/React)

| File | Responsibility |
|------|----------------|
| `components-item.tsx` | UI for component list item with inline rename |
| `components-list.tsx` | Renders component list, wires up rename action |
| `store/store.ts` | Redux slice with `rename` action and selectors |
| `store/actions/rename-component.ts` | Action to rename component in store |
| `create-component-type.ts` | Backbone model with `getTitle()` method |
| `component-name-validation.ts` | Validation logic using Zod schema |
| `component-form-schema.ts` | Zod schemas for component name validation |
| `replace-element-with-component.ts` | Creates component instance model |
| `update-component-title-before-save.ts` | Persists renamed titles on save |

### Backend (PHP)

| File | Responsibility |
|------|----------------|
| `components-rest-api.php` | REST endpoint `/update-titles` |
| `components-repository.php` | Database operations (`update_title`) |
| `component-instance.php` | Widget class for component instances |

---

## 6. Store Schema

```typescript
type ComponentsState = {
  data: PublishedComponent[];           // Saved components
  unpublishedData: UnpublishedComponent[]; // Newly created, not yet saved
  updatedComponentNames: {              // Pending renames for save
    [componentId: number]: string;
  };
  // ... other fields
};
```

### Key Selectors

| Selector | Purpose |
|----------|---------|
| `selectComponentByUid(state, uid)` | Find component by UID (searches both published & unpublished) |
| `selectComponents(state)` | Get all components (merged list) |
| `selectUpdatedComponentNames(state)` | Get pending renames for save |

---

## 7. Validation Rules

Component names are validated using Zod schemas:

| Rule | Message |
|------|---------|
| Required | "Component name is required." |
| Min length (2) | "Component name is too short. Please enter at least 2 characters." |
| Max length (50) | "Component name is too long. Please keep it under 50 characters." |
| Unique | "Component name already exists" |

Validation is case-insensitive (names are compared in lowercase).

---

## 8. Files Removed (Cleanup)

The following files were deleted as part of the refactoring:

- `sync/sync-component-rename-to-navigator.ts` - No longer needed (store-based approach)
- `sync/__tests__/sync-component-rename-to-navigator.test.tsx` - Associated tests

The `component_src_name` field was removed from:
- `replace-element-with-component.ts`
- `editor-elements/src/sync/types.ts`
- `component-instance.php`

---

## 9. API Endpoints

### Update Component Titles
```
POST /wp-json/elementor/v1/components/update-titles

Body:
{
  "components": [
    { "componentId": 123, "title": "New Name" },
    { "componentId": 456, "title": "Another Name" }
  ]
}

Response:
{
  "success_ids": [123, 456],
  "failed_ids": []
}
```

---

## 10. Testing

All 191 tests pass after refactoring.

### Key Test Files
- `components-tab.test.tsx` - Component list and rename UI tests
- `component-name-validation.test.ts` - Validation logic tests
- `create-component-form.test.tsx` - Component creation tests

---

## 11. Future Considerations

1. **Undo/Redo Support:** The rename action should integrate with the editor's history system
2. **Batch Rename:** Consider supporting renaming multiple components at once
3. **Real-time Collaboration:** If multiple users edit, the store-based approach handles conflicts naturally
4. **Performance:** For pages with many component instances, consider memoizing `getTitle()` results

