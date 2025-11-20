# PRD: Remaining Edge Cases - Comparison with Oct 24 Implementation

## Current Status

**Test Results**: 
- Dimensions: ✅ 100% (5/5 pass)
- Flex-direction: ✅ 100% (1/1 pass)
- Margin: ⚠️ 50% (2/4 pass)
- Position: ⚠️ 80% (4/5 pass)
- Size: ⚠️ 50% (1/2 pass)

**Total**: 12/17 original tests passing (71%)

## Failing Tests

### 1. Margin Strategy 1 - Individual Properties
**Test**: `margin-prop-type.test.ts:107`  
**Issue**: `marginInlineStart` expecting `40px` but getting `0px`  
**HTML**: `<p style="margin-left: 40px;">Physical individual</p>`

### 2. Margin-Inline Shorthand
**Test**: `margin-prop-type.test.ts:174`  
**Issue**: Timeout/elements not visible  
**HTML**: `<p style="margin-inline: 10px 30px;">Margin inline</p>`

### 3. Position Basic Properties
**Test**: `position-prop-type.test.ts:45`  
**Issue**: Elements not visible  

### 4. Size Core Functionality
**Test**: `size-prop-type.test.ts:41`  
**Issue**: Elements not visible

## Comparison with Oct 24 Working Implementation

### Key Difference Found

**Current Branch**: Shorthand expansion only in `convert_properties_to_v4_atomic()` (multiple properties)  
**Oct 24 Branch**: No shorthand expansion in conversion service - handled elsewhere

### Oct 24 Implementation Analysis

Looking at `hein/css-test2` branch (commit `3fadf1061f` from Oct 24):

**File**: `css-property-conversion-service.php` (lines 60-64)
```php
public function convert_properties_to_v4_atomic( array $properties ): array {
    // ✅ CRITICAL FIX: Expand shorthand properties before conversion
    require_once __DIR__ . '/css-shorthand-expander.php';
    
    $expanded_properties = \Elementor\Modules\CssConverter\Services\Css\Processing\CSS_Shorthand_Expander::expand_shorthand_properties( $properties );
```

**Current Branch**: Has shorthand expansion with proper namespace import ✅

### The Real Difference

The Oct 24 version uses the OLD non-refactored `unified-css-processor.php` which processes CSS differently.

**Oct 24 Flow**:
1. Parse CSS rules
2. Process through OLD direct method calls
3. Collect inline styles directly
4. Convert properties with shorthand expansion

**Current Branch Flow**:
1. Parse CSS rules  
2. Process through NEW registry-based processors
3. Collect inline styles through `style-collection-processor.php`
4. Convert properties with shorthand expansion

### Root Cause

The issue is NOT in the shorthand expansion or property conversion.  
The issue is in HOW inline styles are being collected and applied in the refactored processor system.

## Investigation Required

### Check: Style Collection Processor

**File**: `style-collection-processor.php`  
**Method**: `process_widget_inline_styles()`

This processor collects inline styles from widgets. Need to verify:
1. Are inline styles being collected correctly?
2. Are they being stored with the right property names?
3. Are they being passed to the resolution processor?

### Check: Style Resolution Processor

**File**: `style-resolution-processor.php`  
**Method**: `resolve_styles_recursively()`

This processor resolves styles for widgets. Need to verify:
1. Are resolved styles using the correct property names?
2. Is the property name mapping being applied here?

### Check: Unified Style Manager

**File**: `unified-style-manager.php`  
**Methods**: `collect_inline_styles()`, `resolve_styles_for_widget_legacy()`

We already added property name mapping here, but need to verify:
1. Is it being called for inline styles?
2. Is the mapping working for all property types?

## Action Plan

### Step 1: Add Debug Logging
Add logging to trace the complete flow for `margin-left: 40px`:
1. Where is it collected?
2. What property name is used?
3. Is it converted?
4. Is it resolved?
5. What's in the final widget data?

### Step 2: Compare with Oct 24
Run the same test on Oct 24 branch with debug logging to see the exact flow.

### Step 3: Identify the Gap
Find the specific point where the current implementation diverges from Oct 24.

### Step 4: Fix the Gap
Apply the missing logic from Oct 24 to the current refactored system.

## Expected Fix

Based on the property name mapping fix that worked for `padding-block-start`, the issue is likely:

**Hypothesis**: Inline styles are being collected with CSS property names (e.g., `margin-left`) but not being mapped to atomic property names (e.g., `margin`) before being applied to widgets.

**Solution**: Ensure the property name mapping happens at the right point in the pipeline - likely in the style resolution processor or when inline styles are being applied to the widget's `styles` array.

## No Wheel Reinvention

The solution already exists in the Oct 24 implementation. We just need to:
1. Find where it handles inline styles
2. Copy that exact logic to the refactored processors
3. Test that it works

## Files to Compare

1. `unified-css-processor.php` - Oct 24 vs Current
2. `style-collection-processor.php` - Current only (new file)
3. `style-resolution-processor.php` - Current only (new file)
4. `unified-style-manager.php` - Oct 24 vs Current

The Oct 24 version likely has the inline style handling logic directly in `unified-css-processor.php` that we need to port to the new processor files.
