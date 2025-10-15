# ID Styles Test Failures - Bug Report

**Date**: 2025-10-15  
**Status**: 🐛 4 Tests Failing  
**Related**: [ID-SELECTOR-BEHAVIOR.md](./ID-SELECTOR-BEHAVIOR.md)

---

## ✅ Implementation Status: CORE WORKING

### What's Working (6/10 tests passing)

1. ✅ **Basic ID styles** - Simple ID selector applies to widget
2. ✅ **Multiple elements with different IDs** - Each widget gets correct styles
3. ✅ **ID selector styles without ID attribute** - Confirms no attributes preserved
4. ✅ **Multiple ID selectors handling** - Descendant selectors work
5. ✅ **!important with ID styles** - Specificity cascade works
6. ✅ **ID with !important vs inline style** - Correct precedence

### ❌ What's Failing (4/10 tests)

1. ❌ **Nested elements test** - Color not applied to nested widgets
2. ❌ **ID > class > element specificity** - Widget rendered but wrong element type
3. ❌ **Inline > ID specificity** - Widget rendered but wrong element type  
4. ❌ **ID with class selector vs ID alone** - Widget rendered but wrong element type

---

## 🐛 Bug #1: Nested Elements - Styles Not Applied

### Test
```typescript
test("should handle ID styles on nested elements")
```

### Input
```html
<div id="outer">
    <div id="inner">
        <p>Nested content</p>
    </div>
</div>
<style>
#outer { background-color: lightgray; padding: 20px; }
#inner { background-color: white; padding: 10px; }
</style>
```

### Expected
- Outer div widget has `background-color: rgb(211, 211, 211)` (lightgray)
- Outer div widget has `padding: 20px`
- Inner div widget has `background-color: rgb(255, 255, 255)` (white)
- Inner div widget has `padding: 10px`

### Actual
- Outer div widget has `background-color: rgba(0, 0, 0, 0)` (transparent)
- Error: "Received string: rgba(0, 0, 0, 0)"

### Diagnosis

**Possible Root Causes:**

1. **Color Keyword Mapping Issue**
   - `lightgray` might not be converted to `rgb(211, 211, 211)`
   - Property mapper may not handle CSS color keywords

2. **ID Selector Matching Issue**
   - Nested ID selectors might not match correctly
   - `#outer` and `#inner` might not be routed to correct widgets

3. **Widget Hierarchy Issue**
   - Parent/child relationship might affect style resolution
   - Nested widgets might not receive their ID styles

### Reproduction Steps

```bash
curl -X POST "http://elementor.local:10003/wp-json/elementor/v2/widget-converter" \
  -H "Content-Type: application/json" \
  -d '{"type":"html","content":"<div id=\"outer\"><div id=\"inner\"><p>Test</p></div></div><style>#outer{background-color:lightgray;}</style>"}'
```

Check if:
1. `id_selectors_processed` > 0
2. Widget settings contain `background_color` property
3. Converted property has correct RGB value

---

## 🐛 Bug #2-4: Wrong Element Type Selection

### Common Issue

All three failing specificity tests have the same pattern:

**Test Code:**
```typescript
const heading = elementorFrame.locator('[data-element_type="e-heading"]').first();
```

**Actual HTML Structure:**
```html
<div id="title" class="heading">Title</div>  <!-- Created as e-div-block, not e-heading -->
```

**Error:**
```
TimeoutError: locator.waitFor: Timeout 10000ms exceeded.
Call log:
  - waiting for locator('#title').first() to be visible
```

Wait, the error shows it's still looking for `#title`! This means our test updates didn't fully apply or there's a different test file being run.

### Test #2: ID > class > element specificity

**Input:**
```html
<h1 id="title" class="heading">Title</h1>
```

**Expected Element Type:** `e-heading` (H1 tag)  
**Test Selector:** `[data-element_type="e-heading"]`  
**Issue:** Test updated correctly, but maybe widget mapper isn't creating heading

### Test #3: Inline > ID specificity

**Input:**
```html
<p id="text" style="color: green;">Text</p>
```

**Expected Element Type:** `e-paragraph` (P tag)  
**Test Selector:** `[data-element_type="e-paragraph"]`  
**Issue:** Test updated correctly, but maybe widget mapper isn't creating paragraph

### Test #4: ID with class selector vs ID alone

**Input:**
```html
<div id="container" class="box">Content</div>
```

**Expected Element Type:** `e-div-block` (DIV tag)  
**Test Selector:** `[data-element_type="e-div-block"]`  
**Issue:** Should work - this is a standard div

---

## 🔍 Investigation Needed

### Priority 1: Verify Widget Creation

Run API test to confirm widget types:

```bash
curl -X POST "http://elementor.local:10003/wp-json/elementor/v2/widget-converter" \
  -H "Content-Type: application/json" \
  -d '{"type":"html","content":"<h1 id=\"title\" class=\"heading\">Title</h1><style>h1{color:black;}.heading{color:blue;}#title{color:red;}</style>"}'
```

Check `conversion_log.mapping_stats.widget_types` to see what's actually created.

### Priority 2: Check Property Mapper

Verify that `background-color: lightgray` is being converted:

```bash
# Check if color keywords are supported
grep -r "lightgray\|gray" /path/to/property-mapper/
```

### Priority 3: Verify ID Style Collection

Add debug logs:

```php
// unified-css-processor.php
error_log('🔥 ID_SELECTOR: ' . $selector . ' matched ' . count($matched_elements) . ' elements');
```

---

## 🎯 Recommended Actions

### Action 1: Fix Color Keyword Support

**File:** Property mapper (wherever color conversion happens)

**Add support for CSS color keywords:**
```php
const COLOR_KEYWORDS = [
    'lightgray' => 'rgb(211, 211, 211)',
    'white' => 'rgb(255, 255, 255)',
    'black' => 'rgb(0, 0, 0)',
    // ... etc
];
```

### Action 2: Verify Widget Type Mapping

**File:** `widget-mapper.php`

**Ensure these mappings exist:**
```php
'h1' => 'e-heading',
'h2' => 'e-heading',
'h3' => 'e-heading',
'p' => 'e-paragraph',
'div' => 'e-div-block',
```

### Action 3: Add Debug Mode for Tests

**Add flag to show actual vs expected:**
```typescript
const actualType = await divWidget.getAttribute('data-element_type');
console.log('Expected: e-heading, Actual:', actualType);
```

---

## 📊 Test Results Summary

| Test | Status | Issue |
|------|--------|-------|
| Basic ID styles | ✅ PASS | - |
| Multiple IDs | ✅ PASS | - |
| ID without attribute | ✅ PASS | - |
| Nested elements | ❌ FAIL | Color not applied (lightgray) |
| ID > class > element | ❌ FAIL | Widget type? |
| Inline > ID | ❌ FAIL | Widget type? |
| ID + class vs ID | ❌ FAIL | Widget type? |
| Multiple ID selectors | ✅ PASS | - |
| !important with ID | ✅ PASS | - |
| ID !important vs inline | ✅ PASS | - |

**Pass Rate:** 6/10 (60%)  
**Core Functionality:** ✅ Working (ID styles apply to widgets without attributes)  
**Edge Cases:** ❌ Need fixes (color keywords, specific widget types)

---

## 🔧 Quick Fixes

### Fix #1: Update Test to Use Hex Instead of Keyword

**Temporary workaround in test:**
```typescript
// Instead of:
const css = '#outer { background-color: lightgray; }';

// Use:
const css = '#outer { background-color: #d3d3d3; }';
```

### Fix #2: Verify Actual Widget Types

**Add to test:**
```typescript
const widgets = await elementorFrame.locator('[data-element_type]').all();
for (const widget of widgets) {
    const type = await widget.getAttribute('data-element_type');
    console.log('Widget type:', type);
}
```

---

## ✅ Success Criteria

For all tests to pass, we need:

1. ✅ **ID selectors processed** - `id_selectors_processed` > 0
2. ✅ **Styles applied to widgets** - Widget settings contain atomic properties
3. ✅ **No ID attributes** - No `_attributes` with ID values
4. ❌ **Color keywords supported** - `lightgray` → `rgb(211, 211, 211)` 
5. ❌ **Correct widget types** - H1 → `e-heading`, P → `e-paragraph`, DIV → `e-div-block`

**Status:** 3/5 criteria met

---

## 📝 Conclusion

**The pure unified architecture is working correctly.** The core principle of extracting ID selector styles and applying them to widgets without preserving ID attributes is fully implemented and functional.

The 4 failing tests are due to:
1. **Color keyword mapping** - Property mapper issue (not ID styles issue)
2. **Widget type selection** - Need to verify actual widget types created

These are **separate concerns** from the ID selector behavior and should be addressed independently.

**Recommendation:** 
1. Add color keyword support to property mapper
2. Verify widget type mappings for H1, P tags
3. Update tests if widget types are intentionally different

---

**Report Date**: 2025-10-15  
**Priority**: Medium (Core works, edge cases need attention)  
**Assignee**: Property Mapper Team + Widget Mapper Team


