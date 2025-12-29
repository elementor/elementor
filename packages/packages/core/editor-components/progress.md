# PR #33828 Refactor - Rename Components

## Overview
Refactoring the component rename feature to use a cleaner architecture (Option B):
- Fetch component name from store in `getTitle()` instead of syncing to each instance
- Remove `component_src_name` field entirely
- Simplify validation by reusing existing schema

## Decisions Made
- ✅ Instance titles should NOT be overwritten when component source is renamed (product requirement)
- ✅ Option B: Fetch component name from store (no sync needed)
- ✅ Reuse `createSubmitComponentSchema` for validation
- ✅ Remove `component_src_name` entirely (fetch from store instead)

---

## Phase 1: Remove Sync Architecture ✅
| Task | Status |
|------|--------|
| Delete `sync/sync-component-rename-to-navigator.ts` | ✅ Done |
| Delete `sync/__tests__/sync-component-rename-to-navigator.test.tsx` | ✅ Done |
| Remove sync injection from `init.ts` | ✅ Done |

## Phase 2: Update `getTitle()` to Fetch from Store ✅
| Task | Status |
|------|--------|
| Add `selectComponentByUid` selector to store | ✅ Done |
| Modify `getTitle()` in `create-component-type.ts` to fetch from store | ✅ Done |
| Remove `component_src_name` from `replace-element-with-component.ts` | ✅ Done |
| Remove PHP fallback in `component-instance.php` | ✅ Done |
| Remove from types in `editor-elements/src/sync/types.ts` | ✅ Done |

## Phase 3: Simplify Validation ✅
| Task | Status |
|------|--------|
| Reuse `createSubmitComponentSchema` in `component-name-validation.ts` | ✅ Done |
| Make `baseComponentSchema` private (remove export) | ✅ Done |

## Phase 4: Update Tests ✅
| Task | Status |
|------|--------|
| Update `create-component-form.test.tsx` | ✅ Done |
| Update `component-name-validation.test.ts` error messages | ✅ Done |
| Run full test suite | ✅ Done (191 tests pass) |

---

## Files Changed

### Deleted
- `packages/packages/core/editor-components/src/sync/sync-component-rename-to-navigator.ts`
- `packages/packages/core/editor-components/src/sync/__tests__/sync-component-rename-to-navigator.test.tsx`

### Modified
- `packages/packages/core/editor-components/src/init.ts` - Removed sync injection
- `packages/packages/core/editor-components/src/create-component-type.ts` - Updated `getTitle()` to fetch from store
- `packages/packages/core/editor-components/src/store/store.ts` - Added `selectComponentByUid` selector
- `packages/packages/core/editor-components/src/components/create-component-form/utils/replace-element-with-component.ts` - Removed `component_src_name`
- `packages/packages/libs/editor-elements/src/sync/types.ts` - Removed `component_src_name` from type
- `packages/packages/core/editor-components/src/utils/component-name-validation.ts` - Simplified to reuse schema
- `packages/packages/core/editor-components/src/components/create-component-form/utils/component-form-schema.ts` - Made `baseComponentSchema` private
- `modules/components/widgets/component-instance.php` - Removed component_src_name initialization

### Tests Updated
- `packages/packages/core/editor-components/src/components/__tests__/create-component-form.test.tsx`
- `packages/packages/core/editor-components/src/utils/__tests__/component-name-validation.test.ts`

---

## Progress Log

### 2025-12-29
- Created progress.md
- Phase 1: Deleted sync file and removed from init.ts
- Phase 2: Updated getTitle() to fetch component name from store using new `selectComponentByUid` selector
- Phase 2: Removed component_src_name from all files (TS and PHP)
- Phase 3: Simplified validation to reuse createSubmitComponentSchema
- Phase 4: Updated tests - all 191 tests pass
- Fixed TypeScript error: removed `title: null` (using undefined instead)
- Fixed runtime error: Changed `createComponentModel()` to use `types.Widget` instead of `models.Widget` (the latter doesn't exist)
- Fixed `selectComponentByUid` to search both published and unpublished components
- Removed async title fetching - store is expected to have component data loaded
