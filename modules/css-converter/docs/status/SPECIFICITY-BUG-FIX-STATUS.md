# ID Selector Specificity Bug - Fix Status

## Test Case
```html
<div id="container" class="box">Content</div>
```

```css
#container { background-color: blue; }          /* specificity: 100 */
#container.box { background-color: red; }       /* specificity: 110 */
```

**Expected**: Red background (higher specificity wins)
**Actual (before fix)**: Blue background
**Actual (after partial fix)**: Still blue background

## Fixes Applied

### Fix #1: Removed Incorrect Selector Routing ✅
**File**: `unified-css-processor.php` lines 368-376

**Before**:
```php
if ( $this->is_id_selector( $selector ) ) {
    // Route to collect_id_styles() → hardcoded specificity = 100
} else {
    // Route to collect_css_selector_styles() → calculated specificity
}
```

**After**:
```php
// Always route to CSS selector styles → uses Css_Specificity_Calculator
$this->unified_style_manager->collect_css_selector_styles(
    $selector,
    $converted_properties,
    $matched_elements
);
```

**Result**: Both `#container` and `#container.box` now use the specificity calculator.

### Fix #2: Added ID+Class Selector Matching ✅
**File**: `unified-css-processor.php` lines 680-687

**Problem**: `#container.box` wasn't matching any widgets because:
1. `is_id_selector_match()` required HTML `id` attribute (removed per requirements)
2. `is_combined_selector_match()` explicitly rejected selectors with `#`

**Fix**: Added matching logic for `#id.class` patterns:
```php
if ( strpos( $selector, '#' ) !== false && strpos( $selector, '.' ) !== false ) {
    if ( preg_match( '/#([a-zA-Z0-9_-]+)\.([a-zA-Z0-9_-]+)/', $selector, $matches ) ) {
        $class_from_selector = $matches[2];
        $class_matches = in_array( $class_from_selector, explode( ' ', $classes ), true );
        return $class_matches;  // Match by class part only
    }
}
```

**Result**: `#container.box` now matches widgets with `class="box"`.

### Fix #3: Removed Legacy Dead Code ✅
**Files**: `unified-css-processor.php`

Removed:
- `collect_id_styles_from_widgets()` - never triggered (no HTML ID attributes)
- `log_id_style_collection_ready()` - did nothing
- `is_id_selector()` - no longer used

**Result**: Cleaner code, no legacy ID-specific paths.

### Fix #4: Corrected Test Locator ✅
**File**: `id-styles-specificity.test.ts` line 140

**Problem**: Test was selecting the inner `<p>` tag (from text wrapping) instead of the div widget.

**Before**:
```typescript
const container = elementorFrame.locator( '[data-element_type] p' ).first();
```

**After**:
```typescript
const container = elementorFrame.locator( '[data-element_type="e-div-block"]' ).first();
```

## Current Status

### What Should Happen Now:
1. `#container` selector → matches DIV widget → specificity = **100** (1 ID)
2. `#container.box` selector → matches DIV widget with `class="box"` → specificity = **110** (1 ID + 1 class)
3. Style resolution compares both styles for `background-color` property
4. Higher specificity wins → `#container.box` (110) > `#container` (100)
5. **Red background applied** ✅

### Remaining Issue:
Test is still showing **blue** instead of **red**, which means:
- Either `#container.box` is not matching the widget
- Or the specificity calculation is still wrong
- Or the winning style selection is incorrect
- Or `#container` is somehow getting higher priority

## Debug Points Added

Added debug logging to trace the issue:

1. **`unified-css-processor.php:369-374`**: Logs selectors being processed
2. **`css-selector-style-factory.php:24-26`**: Logs specificity calculations
3. **`unified-style-manager.php:472-476, 486-490`**: Logs style comparison and winner selection
4. **`unified-css-processor.php:684`**: Logs ID+class selector matching

## Next Steps

1. **Run test with debug logging enabled**
2. **Check if both selectors are matching the widget**
3. **Verify specificity values are correct (100 vs 110)**
4. **Verify winning style selection logic**
5. **Use Chrome MCP to inspect the actual rendered widget**

## Key Files Modified

- `plugins/elementor-css/modules/css-converter/services/css/processing/unified-css-processor.php`
- `plugins/elementor-css/modules/css-converter/services/css/processing/factories/css-selector-style-factory.php`
- `plugins/elementor-css/modules/css-converter/services/css/processing/unified-style-manager.php`
- `plugins/elementor-css/tests/playwright/sanity/modules/css-converter/id-styles/id-styles-specificity.test.ts`


