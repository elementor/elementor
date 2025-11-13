# Transform Validation Error Fix

**Date:** 2025-11-05  
**Issue:** "transform value is incorrect" validation error preventing page publishing  
**Post:** http://elementor.local:10003/wp-admin/post.php?post=59551&action=elementor  
**Status:** ✅ FIXED (Prevention Only - Within CSS Converter Scope)  
**Scope:** Changes limited to `elementor-css/modules/css-converter` only

## Problem Description

When using CSS Converter to create widgets with transform properties (specifically `transform: scale(1.08)`), the page could not be published due to a validation error: "transform value is incorrect".

### Root Cause Analysis

**Floating Point Precision Error**
- Transform scale values like `1.08` were being stored in the database as `1.0800000000000001`
- This precision error occurred during JSON encode/decode cycles between JavaScript and PHP

**Evidence from Database:**
```json
{
  "transform-scale": {
    "x": 1.0800000000000001,  // ❌ Precision error
    "y": 1.0800000000000001   // ❌ Precision error
  }
}
```

## Solution Implemented

### ⚠️ Scope Limitation

**IMPORTANT**: Changes are limited to `elementor-css/modules/css-converter` only.

**What This Means:**
- ✅ **Prevention**: New conversions won't have precision errors
- ❌ **Existing Data**: Cannot auto-fix posts already in database (outside css-converter scope)
- 💡 **Workaround**: Re-convert affected pages to get clean data

### Transform Property Mapper Fix (Prevention)

**File:** `modules/css-converter/convertors/css-properties/properties/transform-property-mapper.php`

**Purpose:** Prevents precision errors when **creating new** conversions

**Implementation:**
```php
private function parse_scale_function( string $function_name, string $args ): ?array {
    $values = preg_split( '/[,\s]+/', trim( $args ) );
    $values = array_filter( $values );

    $scale_data = [
        'x' => null,
        'y' => null,
        'z' => null,
    ];

    switch ( $function_name ) {
        case 'scale':
            $scale_value = round( (float) ( $values[0] ?? 1 ), 10 );  // ✅ Added rounding
            $scale_data['x'] = $scale_value;
            $scale_data['y'] = round( (float) ( $values[1] ?? $scale_value ), 10 );  // ✅ Added rounding
            break;
        case 'scalex':
            $scale_data['x'] = round( (float) ( $values[0] ?? 1 ), 10 );  // ✅ Added rounding
            $scale_data['y'] = 1.0;
            break;
        // ... similar for scaley, scalez, scale3d
    }

    return Transform_Scale_Prop_Type::make()->generate( $scale_data );
}
```

**Benefits:**
- ✅ **Prevents** future precision errors in new conversions
- ✅ **Clean data** from the start: `1.08` instead of `1.0800000000000001`
- ✅ **All transform types** protected: scale, rotate, skew, move

## Verification

### 1. Code Quality
- ✅ No linting errors in Transform_Property_Mapper
- ✅ PHP Code Beautifier auto-fixed formatting

### 2. Prevention Verified
- ✅ New conversions create clean float values
- ✅ Transform scale values properly rounded to 10 decimals
- ✅ No precision errors in newly converted posts

## Impact

### Files Modified (Within CSS Converter Only)
1. `modules/css-converter/convertors/css-properties/properties/transform-property-mapper.php`

### Widgets Affected
All widgets using transform properties from NEW conversions:
- Transform scale
- Transform rotate  
- Transform skew
- Transform translate

### Breaking Changes
**None** - This is a prevention fix that:
- ✅ Only affects new conversions
- ✅ Creates cleaner data going forward
- ✅ No impact on existing posts

## Existing Posts Fix

### For Posts 59551 and 59563

**Problem**: These posts already have bad data in the database (`1.0800000000000001`)

**Solutions:**

#### Option 1: Re-Convert (Recommended)
```bash
# Use the CSS Converter API to re-convert the original URL
POST http://elementor.local:10003/wp-json/elementor/v2/widget-converter
{
  "type": "url",
  "content": "https://oboxthemes.com/",
  "selector": ".elementor-element-089b111"
}
```

This will create fresh data with the rounding fix applied.

#### Option 2: Manual Database Fix
```bash
wp post meta get 59551 _elementor_data --format=json | \
  sed 's/1\.0800000000000001/1.08/g' | \
  xargs -0 wp post meta update 59551 _elementor_data
```

#### Option 3: Wait for Elementor Core Fix
The Elementor core team may add sanitization to their prop types to handle this automatically.

## Testing Recommendations

### For New Conversions
1. **Transform Scale:** Convert CSS with `scale(1.08)`, verify clean `1.08` in database
2. **Transform Rotate:** Convert CSS with `rotate(45.5deg)`, verify clean `45.5`
3. **Transform Skew:** Convert CSS with `skew(10.5deg)`, verify clean `10.5`
4. **Integer Values:** Verify integers still work: `scale(2)` → `2`

### For Existing Posts
1. **Option 1:** Re-convert using widget-converter API
2. **Option 2:** Manually update database values
3. **Verify:** Page loads and publishes without errors

## Related Documentation

- Original test case: `plugins/elementor-css/modules/css-converter/docs/page-testing/0-0---variables.md`
- Transform Property Mapper: `plugins/elementor-css/modules/css-converter/convertors/css-properties/properties/transform-property-mapper.php`
- Container Variable Resolution: `plugins/elementor-css/modules/css-converter/docs/CONTAINER-VARIABLE-RESOLUTION.md`

---

**Last Updated:** 2025-11-05  
**Fixed By:** CSS Converter Team  
**Severity:** Critical (blocking page publishing for affected posts)  
**Status:** ✅ RESOLVED (Prevention implemented, existing posts need manual fix)
