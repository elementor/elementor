
## font-family-exclusion/ (1 passed, 8 failed)

### Failed Tests:
- font-family-exclusion.test.ts:42 - Basic font-family exclusion
- font-family-exclusion.test.ts:85 - Font-family with other properties
- font-family-exclusion.test.ts:129 - Multiple font-family declarations
- font-family-exclusion.test.ts:174 - Font-family in class selectors
- font-family-exclusion.test.ts:216 - Font-family with CSS variables
- font-family-exclusion.test.ts:261 - Font-family in different CSS contexts
- font-family-exclusion.test.ts:347 - Complex font-family declarations
- font-family-exclusion.test.ts:402 - Font-family mixed with important properties
ication verification CSS classes on widgets

# Font-Family Exclusion Test Failures - Root Cause Analysis

## Test Failure Summary
- **Total Tests**: 9
- **Failed**: 8
- **Passed**: 1 (Font-Family Only CSS - Conversion Succeeds)

## Evidence from Test Execution

### Test 1: Simple Font-Family Properties
**Expected**: `line-height: 1.5`  
**Actual**: `24px`  
**CSS Rule**:
```css
.font-test {
    font-family: "Helvetica Neue", Arial, sans-serif;
    color: #333333;
    font-size: 16px;
    line-height: 1.5;
}
```
**Observation**: line-height property is not applied correctly, receiving wrong value

### Test 2: Font-Family with CSS Variables
**Expected**: `color: rgb(0, 124, 186)`  
**Actual**: `color: rgb(243, 186, 253)`  
**CSS Rule**:
```css
:root {
    --primary-font: "Roboto", sans-serif;
    --primary-color: #007cba;
}
.font-variable-test {
    font-family: var(--primary-font);
    color: var(--primary-color);
    font-weight: bold;
    margin: 10px;
}
```
**Observation**: CSS variables are not being preserved/applied - getting completely wrong color

### Test 3: Multiple Font-Family Declarations
**Expected**: `font-size: 24px` for h1  
**Actual**: `font-size: 40px`  
**Observation**: CSS not applied at all (40px is default h1 size)

### Test 4: Font Shorthand Properties
**Expected**: `margin: 15px`  
**Actual**: `margin: 0px`  
**CSS Rule**:
```css
.font-shorthand-test {
    /* Font shorthand: font-style font-weight font-size/line-height font-family */
    font: italic bold 18px/1.6 "Times New Roman", serif;
    color: #e74c3c;
    margin: 15px;
}
```
**Observation**: Entire rule not applied when `font` shorthand is present

## Root Causes Identified

### ✅ ROOT CAUSE #1: Missing `font` Shorthand Support in CSS_Shorthand_Expander

**Location**: `css-shorthand-expander.php:26-48`

**Current State**:
```php
private static function is_shorthand_property( string $property ): bool {
    $shorthand_properties = [
        'border',
        'border-top',
        'border-right',
        'border-bottom',
        'border-left',
        'margin-inline',
        'margin-block',
        'inset',
        'inset-inline',
        'inset-block',
        'top',
        'right',
        'bottom',
        'left',
    ];

    return in_array( $property, $shorthand_properties, true );
}
```

**Problem**: The `font` shorthand property is NOT in the list!

**Impact**: When CSS contains `font: italic bold 18px/1.6 "Times New Roman", serif;`:
1. The shorthand expander does NOT expand it
2. The property is passed through as-is
3. Downstream processing doesn't know how to handle the `font` shorthand
4. The entire rule is likely skipped or fails

**What Should Happen**:
```css
font: italic bold 18px/1.6 "Times New Roman", serif;
```
Should expand to:
```css
font-style: italic;
font-weight: bold;
font-size: 18px;
line-height: 1.6;
font-family: "Times New Roman", serif;  /* Then this should be filtered out */
```

### ✅ ROOT CAUSE #2: Font-Family Filtering Happens Too Late

**Location**: `css-parsing-processor.php:138-141` and `unified-css-processor.php:1049-1052`

**Current Filtering**:
```php
private function create_property_from_declaration( $declaration ): array {
    $property = $declaration->getRule();
    $value = (string) $declaration->getValue();
    $important = method_exists( $declaration, 'getIsImportant' ) ? $declaration->getIsImportant() : false;

    // FILTER: Skip font-family properties (not supported in current implementation)
    if ( 'font-family' === $property ) {
        return []; // Return empty array to skip this property
    }

    return [
        'property' => $property,
        'value' => $value,
        'important' => $important,
    ];
}
```

**Problem Flow**:
1. CSS parsing happens first (filters font-family ✅)
2. Properties are collected into rules ✅
3. **BUT**: Shorthand expansion might happen AFTER parsing in some processors
4. **AND**: If `font` shorthand is never expanded, it passes through as a single property
5. No filter exists for the `font` property itself (only `font-family`)

### ✅ ROOT CAUSE #3: CSS Variable Handling Issues

**Location**: Test #2 shows CSS variables with font-family are causing problems

**Problem**: When a CSS variable contains font-family:
```css
:root {
    --primary-font: "Roboto", sans-serif;
    --primary-color: #007cba;
}
.font-variable-test {
    font-family: var(--primary-font);  /* This needs to be filtered */
    color: var(--primary-color);       /* This should work */
}
```

The variable definition needs special handling:
1. Extract and store CSS variables from :root
2. When processing properties, detect `var(--variable-name)`
3. If the variable is a font-family variable, filter it out
4. But OTHER variables (like colors) should still work

**Current Issue**: The entire rule or CSS variable processing is failing when font-family variables are present

## Solution Architecture

### Option A: Add Font-Family-Aware Processor (RECOMMENDED ✅)

Create a dedicated processor that runs EARLY in the pipeline:

```
CSS Parsing → Font-Family Filter Processor → Shorthand Expansion → Property Conversion
```

**Processor Responsibilities**:
1. Detect and filter `font-family` properties at the earliest stage
2. Detect and expand `font` shorthand, then filter out font-family part
3. Handle CSS variables that contain font-family values
4. Ensure other properties in the same rule continue processing

**Benefits**:
- ✅ Separation of concerns
- ✅ Easy to test in isolation
- ✅ Can be enabled/disabled via configuration
- ✅ Handles all edge cases (shorthand, variables, important flags)

### Option B: Enhance CSS_Shorthand_Expander (QUICK FIX)

Add `font` shorthand support to `CSS_Shorthand_Expander`:

```php
private static function is_shorthand_property( string $property ): bool {
    $shorthand_properties = [
        'font',  // ← ADD THIS
        'border',
        // ... rest
    ];
}

private static function expand_shorthand( string $property, $value ): array {
    switch ( $property ) {
        case 'font':
            return self::expand_font_shorthand( $value );
        // ... rest
    }
}

private static function expand_font_shorthand( $value ): array {
    // Parse: [font-style] [font-variant] [font-weight] [font-stretch] font-size[/line-height] font-family
    // Return expanded properties WITHOUT font-family
    return [
        'font-style' => $parsed_style,
        'font-weight' => $parsed_weight,
        'font-size' => $parsed_size,
        'line-height' => $parsed_line_height,
        // font-family is EXCLUDED here
    ];
}
```

**Benefits**:
- ✅ Quick fix for font shorthand issue
- ✅ Minimal code changes

**Limitations**:
- ❌ Doesn't solve CSS variable issues
- ❌ Font shorthand parsing is complex
- ❌ Mixing concerns (shorthand expansion + filtering)

### Option C: Hybrid Approach (BEST LONG-TERM ✅✅)

1. **Add Font-Family Filter Processor** (early in pipeline)
   - Filters font-family properties from all rules
   - Handles CSS variables with font-family
   - Validates other properties continue processing

2. **Enhance CSS_Shorthand_Expander** (add font shorthand)
   - Expand font shorthand to individual properties
   - Let the filter processor remove font-family after expansion

3. **Add Integration Tests** (verify end-to-end)
   - Test font shorthand expansion
   - Test font-family filtering
   - Test CSS variables
   - Test mixed scenarios

**Pipeline Flow**:
```
1. CSS Parsing
   ↓
2. CSS Variables Extraction (preserve non-font variables)
   ↓
3. Font-Family Filter Processor (NEW)
   - Detect and remove font-family properties
   - Handle CSS variables containing font-family
   ↓
4. Shorthand Expansion (ENHANCED)
   - Expand font shorthand
   - Expand border, margin, etc.
   ↓
5. Property Conversion (continues as normal)
```

## Recommended Implementation Order

### Phase 1: Quick Wins (Fix Test #4 - Font Shorthand)
1. Add `font` shorthand to `CSS_Shorthand_Expander`
2. Implement basic `expand_font_shorthand()` method
3. Exclude font-family during expansion

### Phase 2: Comprehensive Solution (Fix All Tests)
1. Create `Font_Family_Filter_Processor`
2. Register in processor registry
3. Handle CSS variables with font-family
4. Ensure proper error handling

### Phase 3: Validation
1. Run all 9 font-family exclusion tests
2. Verify no regression in other tests
3. Add performance benchmarks

## Expected Outcomes

After implementation:
- ✅ All 9 font-family exclusion tests pass
- ✅ Font shorthand properly expanded and font-family filtered
- ✅ CSS variables work correctly (non-font variables preserved)
- ✅ Other properties in rules with font-family work normally
- ✅ No performance degradation
- ✅ Clean separation of concerns

## Files That Need Changes

### Must Change:
1. `css-shorthand-expander.php` - Add font shorthand support
2. `processors/font-family-filter-processor.php` - CREATE NEW
3. `css-processor-factory.php` - Register new processor

### May Need Changes:
4. `css-variables-processor.php` - Handle font-family in variables
5. `unified-css-processor.php` - Remove duplicate filtering logic
6. `css-parsing-processor.php` - Coordinate with new processor

## Next Steps

1. Create separate processor: `Font_Family_Filter_Processor`
2. Enhance `CSS_Shorthand_Expander` to handle `font` shorthand
3. Register processor early in the pipeline
4. Run tests to validate
5. Refactor duplicate filtering code

## Decision

**Recommendation**: Implement **Option C - Hybrid Approach**

**Rationale**:
- Fixes all identified root causes
- Maintains clean architecture
- Easy to test and maintain
- Scalable for future font-related features
- Minimal risk of regression

