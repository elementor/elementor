# Research Plan: Editor Not Loading Content

## What We Know (Evidence-Based)

### ✅ Confirmed Facts

1. **Depth is NOT the problem**
   - Evidence: Playwright tests show depth 3, 6, 9, 12, 15 all render correctly
   - File: `test-depth-limit.spec.js`
   - Result: All 5 tests passed

2. **Data structure is valid**
   - Evidence: All elements have required fields (id, elType)
   - Widgets have widgetType
   - JSON is valid

3. **Save mechanism works**
   - Evidence: Data is saved to `_elementor_data` correctly
   - JSON encoding is valid

4. **Preview shows content**
   - Evidence: `?page_id=60816&preview=true` shows content
   - This means widgets are rendering on frontend
   - Only first section visible (not all content)

5. **Editor shows nothing**
   - Evidence: Editor panel shows 0 elements
   - Console error: "`id` and `element` are required"

### ❓ What We Don't Know

1. **Why does preview work but editor doesn't?**
   - Preview loads `_elementor_data` and renders
   - Editor loads `_elementor_data` but shows nothing

2. **What causes the console error?**
   - Error is from `addDocumentHandle` in Elementor Pro
   - Does this error prevent editor from loading?
   - Or is it a symptom of a different issue?

3. **Why only first section in preview?**
   - Is content truncated?
   - Is there a limit on what renders?
   - Are subsequent sections malformed?

4. **What's the actual difference between working and broken?**
   - Working: Simple HTML with 1 widget
   - Broken: Complex HTML with 112 widgets
   - Both have similar depth
   - Both have valid structure

## Investigation Plan

### Phase 1: Console Error Analysis

**Goal:** Understand what triggers the error and if it prevents loading

**Steps:**
1. Read `addDocumentHandle` source code
2. Identify what conditions trigger the error
3. Check if error is thrown before or after editor loads data
4. Verify if error prevents rendering or is unrelated

**Files to check:**
- `plugins/elementor-pro/assets/dev/js/preview/utils/document-handle.js:16-24`
- `plugins/elementor-pro/assets/dev/js/preview/preview.js:26-38`

**Expected outcome:** Understand error's impact on editor loading

### Phase 2: Preview vs Editor Difference

**Goal:** Identify why preview works but editor doesn't

**Steps:**
1. Compare how preview loads `_elementor_data`
2. Compare how editor loads `_elementor_data`
3. Check if editor has additional validation that preview skips
4. Identify where editor fails to process the data

**Files to check:**
- Frontend preview loading
- Editor data loading
- `document.php` - data loading methods

**Expected outcome:** Specific point where editor fails

### Phase 3: First Section Only Issue

**Goal:** Understand why only first section shows in preview

**Steps:**
1. Check how many sections are in `_elementor_data`
2. Verify if all sections have valid structure
3. Check if there's a rendering limit
4. Test if it's a performance/memory issue

**Method:**
- Count sections in post 60816
- Verify each section structure
- Test with different section counts

**Expected outcome:** Reason for truncated content

### Phase 4: Working Post Analysis

**Goal:** Understand what makes post 60744 work

**Steps:**
1. Verify post 60744 actually shows in editor (not just preview)
2. Compare exact save mechanism used
3. Check when and how post 60744 was created
4. Identify any differences in processing

**Method:**
- Open post 60744 in editor
- Check `_elementor_data` structure
- Compare with post 60820 field by field

**Expected outcome:** Specific difference that makes it work

### Phase 5: Large Widget Set Test

**Goal:** Determine if widget count is the issue

**Steps:**
1. Test with 10, 25, 50, 100, 112 widgets
2. Check at what count editor stops loading
3. Verify if it's count or structure

**Method:**
- Create test posts with controlled widget counts
- All at same depth (e.g., depth 2)
- Check editor for each

**Expected outcome:** Maximum widget count or identify it's not count-related

## Test Execution Order

1. **Phase 4** - Verify post 60744 works in editor (baseline)
2. **Phase 1** - Console error (quickest to rule out) ✅ COMPLETED
3. **Phase 2** - Preview vs Editor (likely root cause) 🔄 IN PROGRESS
4. **Phase 3** - First section only (related to Phase 2)
5. **Phase 5** - Widget count (if needed)

## Phase 1 Results: Console Error Analysis

**Finding:** The console error `"id and element are required"` is from Elementor Pro's preview feature (`addDocumentHandle`). It occurs when iterating over `elementorFrontend.documentsManager.documents` and trying to create edit handles for documents that don't have proper `id` or `element` properties.

**Evidence:**
- Error location: `plugins/elementor-pro/assets/dev/js/preview/utils/document-handle.js:22-24`
- Called from: `plugins/elementor-pro/assets/dev/js/preview/preview.js:37`
- Error occurs during preview initialization, not editor loading

**Conclusion:** This error is likely a **symptom, not the cause**. It happens because some documents in the documents manager don't have proper IDs, but this shouldn't prevent the editor from loading. The error is caught and logged but doesn't stop execution.

**Next:** Investigate why documents don't have proper IDs - this might indicate a deeper issue with how documents are being registered.

## Phase 2 Results: Preview vs Editor Data Loading

**Finding:** Both preview and editor use the same data source (`_elementor_data`), but they process it differently:

1. **Preview (Frontend):**
   - Loads `_elementor_data` directly via `get_json_meta()`
   - Renders elements using frontend rendering system
   - Works correctly (shows content, though only first section)

2. **Editor (Backend):**
   - Loads `_elementor_data` via `get_elements_data()`
   - Processes through `get_elements_raw_data()` which calls `create_element_instance()` for each element
   - If `create_element_instance()` returns null, element is skipped (line 1080-1082 in document.php)
   - Elements are then passed to JavaScript via `get_config()`

**Key Code Path:**
- `document.php:735` - `$config['elements'] = $this->get_elements_raw_data( null, true );`
- `document.php:1078` - `$element = Plugin::$instance->elements_manager->create_element_instance( $element_data );`
- `document.php:1080` - `if ( ! $element ) { continue; }` - **Elements that fail to create are silently skipped**

**Evidence:**
- `e-div-block` is registered as element type (verified via wp-cli)
- Data structure has required fields (id, elType)
- First element is `e-div-block` with valid structure

**Conclusion:** The editor is likely failing to create element instances, causing them to be skipped. This could be due to:
1. Missing required fields in element data
2. Exception during element creation
3. Element type not found (but we verified `e-div-block` exists)

**Next:** Add debug logging to `create_element_instance()` to see why elements fail to create.

## Hypothesis to Test (No Assumptions)

### Hypothesis 1: Console error prevents loading
- **Test:** Fix console error, check if editor loads
- **Evidence needed:** Error occurs before or after data load?

### Hypothesis 2: Editor has different validation than preview
- **Test:** Compare preview vs editor data loading code
- **Evidence needed:** Where does validation differ?

### Hypothesis 3: Widget count exceeds editor limit
- **Test:** Create posts with incrementing widget counts
- **Evidence needed:** Exact breaking point

### Hypothesis 4: Data format incompatibility
- **Test:** Compare working post exact format with broken
- **Evidence needed:** Field-by-field differences

## Success Criteria

- Identify specific cause (not "probably" or "might be")
- Provide evidence (code location, test results, data comparison)
- Verify fix with tests
- No remaining assumptions

## Current Status Summary

### ✅ Completed
- **Phase 1:** Console error is symptom, not cause
- **Phase 2:** Identified editor skips elements that fail `create_element_instance()`

### 🔄 In Progress
- **Root Cause:** Why does `create_element_instance()` fail for our elements?

### 📋 Next Steps
1. ✅ Add debug logging to `create_element_instance()` to capture failures - **COMPLETED**
2. Test debug logging by loading editor and checking debug.log
3. Compare working post (60744) vs broken post (60820) element structure
4. Test if issue is specific to `e-div-block` or affects all atomic widgets
5. Check if exception is thrown during element creation

## Debug Logging Added

**Files Modified:**
1. `plugins/elementor-css/includes/managers/elements.php:80-90` - Logs when element type not found
2. `plugins/elementor-css/includes/managers/elements.php:99-106` - Logs exceptions during element creation
3. `plugins/elementor-css/core/base/document.php:1081-1087` - Logs when elements are skipped

**Debug Log Locations:**
- `/Users/janvanvlastuin1981/Local Sites/elementor/app/public/debug.log`
- `/Users/janvanvlastuin1981/Local Sites/elementor/app/public/wp-content/debug.log`

**To Test:**
1. Open editor for post 60820: `http://elementor.local:10003/wp-admin/post.php?post=60820&action=elementor`
2. Check debug.log for `[ELEMENTOR-CSS DEBUG]` messages
3. Look for patterns:
   - "Element type not found" - indicates registration issue
   - "exception" - indicates error during element instantiation
   - "Element skipped" - confirms elements are being skipped

### 🎯 Key Insight
The editor silently skips elements that fail to create instances. This explains why:
- API reports success (data is saved correctly)
- Preview works (uses different rendering path)
- Editor shows nothing (elements are skipped during instance creation)

## Phase 3 Results: Root Cause Found

**Finding:** The editor was failing to load document config due to a fatal error in `SettingsManager::get_settings_managers_config()`.

**Error:**
```
Call to a member function get_tabs_controls() on null in 
plugins/elementor-css/core/settings/manager.php:149
```

**Root Cause:**
- `$manager->get_model_for_config()` was returning `null` for one of the settings managers
- Code attempted to call `get_tabs_controls()` on null, causing fatal error
- This prevented `get_config()` from completing, so editor couldn't load

**Fix Applied:**
- Added null check before calling `get_tabs_controls()` in `manager.php:148`
- If `$settings_model` is null, skip that manager and continue

**Evidence:**
- Error occurred when calling `get_config()` via wp-cli
- Stack trace shows error in `document.php:689` calling `SettingsManager::get_settings_managers_config()`
- Fix prevents fatal error and allows config to load

**Next:** Test if editor now loads correctly with this fix.

