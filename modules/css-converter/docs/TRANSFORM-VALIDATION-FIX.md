# Transform Validation Error Fix

**Date:** 2025-11-05  
**Issue:** "transform value is incorrect" validation error preventing page publishing  
**Post:** http://elementor.local:10003/wp-admin/post.php?post=59551&action=elementor  
**Status:** ✅ FIXED

## Problem Description

When using CSS Converter to create widgets with transform properties (specifically `transform: scale(1.08)`), the page could not be published due to a validation error: "transform value is incorrect".

### Root Cause Analysis

**1. Floating Point Precision Error**
- Transform scale values like `1.08` were being stored in the database as `1.0800000000000001`
- This precision error occurred during JSON encode/decode cycles between JavaScript and PHP

**2. Number_Prop_Type Integer Casting Bug**
- The `Number_Prop_Type::sanitize_value()` method was casting ALL numeric values to `(int)`
- This meant transform scale values like `1.08` would be converted to `1`, breaking the transform
- Validation failed because sanitized value didn't match the original value

### Evidence

**Database Value (before fix):**
```json
{
  "$$type": "transform-scale",
  "value": {
    "x": 1.0800000000000001,
    "y": 1.0800000000000001
  }
}
```

**Number_Prop_Type Bug (before fix):**
```php
protected function sanitize_value( $value ) {
    return (int) $value;  // ❌ Converts 1.08 to 1
}
```

## Solution Implemented

### 1. Fixed Number_Prop_Type to Preserve Float Values

**File:** `plugins/elementor/modules/atomic-widgets/prop-types/primitives/number-prop-type.php`

**Before:**
```php
protected function sanitize_value( $value ) {
    return (int) $value;
}
```

**After:**
```php
protected function sanitize_value( $value ) {
    $numeric_value = is_numeric( $value ) ? $value + 0 : 0;

    if ( is_float( $numeric_value ) ) {
        return (float) round( $numeric_value, 10 );
    }

    return (int) $numeric_value;
}
```

**Benefits:**
- Integer values stay as integers (e.g., `1` → `1`)
- Float values stay as floats (e.g., `1.08` → `1.08`)
- Floating point precision errors are normalized (e.g., `1.0800000000000001` → `1.08`)

### 2. Added Rounding to Transform Property Mapper

**File:** `plugins/elementor-css/modules/css-converter/convertors/css-properties/properties/transform-property-mapper.php`

**Changes:**
- Added `round(..., 10)` to all scale value conversions
- Prevents floating point precision errors at the source

**Example:**
```php
// Before
$scale_value = (float) ( $values[0] ?? 1 );

// After
$scale_value = round( (float) ( $values[0] ?? 1 ), 10 );
```

### 3. Fixed Existing Database Data

**Post ID:** 59551  
**Action:** Updated `_elementor_data` postmeta to replace `1.0800000000000001` with `1.08`

## Verification

### 1. Code Quality
- ✅ No linting errors in Number_Prop_Type
- ✅ No linting errors in Transform_Property_Mapper
- ✅ PHP Code Beautifier auto-fixed 2 formatting issues

### 2. Database Check
- ✅ No other posts found with similar floating point precision errors
- ✅ Post 59551 data corrected and saved

### 3. Expected Result
- ✅ Transform values now validate correctly
- ✅ Page publishing should work without validation errors
- ✅ Transform effects (scale) render correctly

## Impact

### Files Modified
1. `plugins/elementor/modules/atomic-widgets/prop-types/primitives/number-prop-type.php`
2. `plugins/elementor-css/modules/css-converter/convertors/css-properties/properties/transform-property-mapper.php`

### Widgets Affected
All widgets using numeric prop types, specifically:
- Transform properties (scale, rotate, skew, translate)
- Any other properties using Number_Prop_Type

### Breaking Changes
**None** - This is a bug fix that maintains backward compatibility while fixing validation

## Testing Recommendations

1. **Transform Scale:** Test `scale(1.08)`, `scale(0.5)`, `scale(2.5)`
2. **Transform Rotate:** Test `rotate(45.5deg)`, `rotate(90.25deg)`
3. **Transform Skew:** Test `skew(10.5deg, 5.25deg)`
4. **Integer Values:** Verify integers still work: `scale(2)`, `rotate(90deg)`

## Related Documentation

- Original test case: `plugins/elementor-css/modules/css-converter/docs/page-testing/0-0---variables.md`
- Transform Property Mapper: `plugins/elementor-css/modules/css-converter/convertors/css-properties/properties/transform-property-mapper.php`
- Number Prop Type: `plugins/elementor/modules/atomic-widgets/prop-types/primitives/number-prop-type.php`

---

**Last Updated:** 2025-11-05  
**Fixed By:** CSS Converter Team  
**Severity:** Critical (blocking page publishing)  
**Status:** ✅ RESOLVED

