# Align-Self Debug Investigation Guide

## Issue
`align-self: normal` and `align-self: auto` values are being converted to `initial` in the output, which is not in the allowed enum values.

## Debug Logging Added

### 1. Widget Class Processor
**File**: `widget-class-processor.php`  
**Method**: `convert_properties_to_atomic()`  
**Lines**: 626-697

**Logs**:
- Selector being processed
- Input value for `align-self`
- Conversion success/failure
- Final converted properties count

### 2. Property Conversion Service
**File**: `css-property-conversion-service.php`  
**Method**: `convert_property_to_v4_atomic()`  
**Lines**: 215-348

**Logs**:
- Property and value entering conversion
- Validator check results
- Mapper resolution
- Conversion attempt results
- Whether sent to custom CSS

### 3. Atomic Property Validator
**File**: `atomic-property-validator.php`  
**Method**: `is_value_supported()`  
**Lines**: 20-61

**Logs**:
- Value being validated
- Property type (enum)
- List of allowed values
- Whether value is in allowed list

## How to Test

### Option 1: Use Test Script
```bash
curl http://elementor.local:10003/wp-content/test-align-self-debug.php
```

### Option 2: Use Postman
**URL**: `http://elementor.local:10003/wp-json/elementor/v2/widget-converter`  
**Method**: POST  
**Body**:
```json
{
  "type": "html",
  "content": "<div class=\"e-con e-flex\"><div class=\"e-con-inner\">Test</div></div>",
  "css": ".e-con.e-flex>.e-con-inner { align-self: auto; }"
}
```

### Option 3: Use oboxthemes.com Test
**URL**: `http://elementor.local:10003/wp-json/elementor/v2/widget-converter`  
**Method**: POST  
**Body**:
```json
{
  "type": "url",
  "content": "https://oboxthemes.com/",
  "selector": ".elementor-element-089b111"
}
```

## Log File Location
```
/Users/janvanvlastuin1981/Local Sites/elementor/app/public/wp-content/align-self-debug.log
```

## What to Look For

### Expected Flow (if value is `auto`)
```
WIDGET_CLASS_PROCESSOR: convert_properties_to_atomic()
  Current selector: .e-con.e-flex>.e-con-inner
  
  → Processing align-self property:
    Input value: 'auto'
    
  📍 CSS_PROPERTY_CONVERSION_SERVICE::convert_property_to_v4_atomic()
    Property: align-self
    Value: 'auto'
    Validator exists: YES
    ✅ VALIDATOR: Property IS supported
    → Checking if value 'auto' is supported...
    
  🔍 VALIDATOR::is_value_supported()
    Property: align-self
    Value to check: 'auto'
    Property type: enum
    Type is ENUM - checking against allowed values...
    Allowed values: auto, normal, center, start, end, self-start, self-end, flex-start, flex-end, anchor-center, baseline, first baseline, last baseline, stretch
    Is 'auto' in array? YES ✅
    
    ✅ VALIDATOR: Value 'auto' IS supported
    Mapper resolved: Elementor\Modules\CssConverter\Convertors\CssProperties\Properties\Flex_Properties_Mapper
    ✅ Mapper CAN convert to v4 atomic
    → Attempting conversion...
    ✅ MAPPER CONVERSION SUCCESS
    Result: {
      "$$type": "string",
      "value": "auto"
    }
    
    ✅ Conversion SUCCESS
```

### Problem Scenario (if value is `initial`)
```
  🔍 VALIDATOR::is_value_supported()
    Property: align-self
    Value to check: 'initial'
    Property type: enum
    Type is ENUM - checking against allowed values...
    Allowed values: auto, normal, center, start, end, self-start, self-end, flex-start, flex-end, anchor-center, baseline, first baseline, last baseline, stretch
    Is 'initial' in array? NO ❌
    
    ❌ VALIDATOR: Value 'initial' NOT supported
    Reason: Value 'initial' not supported for 'align-self' (allowed: auto, normal, center, start, end, self-start, self-end, flex-start, flex-end, anchor-center, baseline, first baseline, last baseline, stretch)
    → Will be sent to custom CSS
```

## Key Questions to Answer

1. **What is the actual value entering the processor?**
   - Look for: `Input value: 'xxx'` in the first log section
   - Expected: `auto` or `normal`
   - If it shows: `initial` → **ROOT CAUSE: Value is already `initial` before conversion**

2. **Where is the value coming from?**
   - If value is `initial`, check where CSS is extracted:
     - CSS Parser (from stylesheet text) ✅ Should preserve original
     - Browser computed styles ❌ Might normalize to `initial`

3. **Does the validator reject it?**
   - Look for: `Is 'xxx' in array? YES ✅` or `NO ❌`
   - If NO → Value goes to custom CSS instead of atomic props

## Next Steps Based on Results

### If value is `auto` or `normal` and passes validation
✅ **No issue** - conversion working correctly

### If value is `auto` or `normal` but fails validation
❌ **BUG**: Validator not recognizing valid values
- Check: `atomic-property-validator.php` line 143-158 enum values

### If value is `initial` entering the processor
❌ **ROOT CAUSE FOUND**: CSS extraction normalizing values
- Investigate: Where CSS is being read (parser vs browser)
- Check: `unified-css-processor.php` line 1146 (`getValue()`)
- Check: If using `getComputedStyle()` anywhere

## Cleanup

After testing, remove debug logging:
```bash
# Remove test script
rm /Users/janvanvlastuin1981/Local Sites/elementor/app/public/wp-content/test-align-self-debug.php

# Remove log file
rm /Users/janvanvlastuin1981/Local Sites/elementor/app/public/wp-content/align-self-debug.log
```

