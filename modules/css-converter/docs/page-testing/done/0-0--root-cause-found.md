# ROOT CAUSE FOUND: Property Name Mapping Issue

## Problem
Test fails: `padding-block-start: 0px` instead of `30px`

## Root Cause
The refactored processor system returns resolved styles with **CSS property names** as keys (e.g., `"padding-block-start"`), but Elementor's atomic widgets expect **atomic property names** as keys (e.g., `"padding"`).

## Evidence

### 1. Conversion Works Correctly
```json
{
  "$$type": "dimensions",
  "value": {
    "block-start": {"$$type": "size", "value": {"size": 30, "unit": "px"}},
    "block-end": null,
    "inline-start": null,
    "inline-end": null
  }
}
```
✅ The padding mapper correctly converts `padding-block-start: 30px` to atomic format with explicit nulls.

### 2. Resolved Styles Use Wrong Key
```json
{
  "padding-block-start": {  // ❌ WRONG KEY - should be "padding"
    "source": "inline",
    "property": "padding-block-start",
    "value": "30px",
    "converted_property": { /* atomic format */ }
  }
}
```

### 3. Atomic Widgets Expect Different Key
Elementor's atomic widgets look for `$widget['styles']['padding']`, not `$widget['styles']['padding-block-start']`.

## Solution
Transform resolved styles to use atomic property names as keys:
- `"padding-block-start"` → `"padding"`
- `"margin-top"` → `"margin"`
- etc.

The atomic property name can be obtained from the mapper's `get_v4_property_name()` method.

## Location of Fix
File: `plugins/elementor-css/modules/css-converter/services/css/processing/unified-style-manager.php`
Method: `resolve_styles_for_widget_legacy()` (line 277-310)

Need to transform the `$winning_styles` array keys from CSS property names to atomic property names before returning.

## Why Oct 24 Version Worked
The Oct 24 version likely had different logic that properly mapped the property names, or the widgets were structured differently to accept CSS property names.

## Next Steps
1. Add property name transformation in `resolve_styles_for_widget_legacy()`
2. Use `get_v4_property_name()` from property mappers to get atomic names
3. Test that `padding-block-start` resolves to `"padding"` key with atomic value

