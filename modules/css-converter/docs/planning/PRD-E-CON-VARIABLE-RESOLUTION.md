# PRD: E-Con CSS Variable Resolution Fix

## Problem Statement

E-con flexbox properties are not being converted to atomic props.

**Expected**:
```css
.e-con-inner {
  display: flex;
  align-items: center;
}
```

**Actual**:
```css
.e-con-inner {
  display: var(--display);      /* Not resolved */
  align-items: var(--align-items); /* Not resolved */
}
```

## Root Cause Research

### What Works ✅
- CSS Variable Registry extracts definitions: `--display: flex`, `--align-items: center`
- CSS Variable Resolver CAN resolve: `display: var() -> flex`, `align-items: var() -> center`
- Widget_Class_Processor recognizes `e-con` as widget class (after my changes)

### What Doesn't Work ❌
- E-con rules appear 277 times in logs (massive duplication)
- Widget_Class_Processor receives UNRESOLVED rules with `var()` references
- Resolved values are being lost or overwritten by unresolved duplicates

### Evidence
```
[07:24:23] CSS_VARIABLE_RESOLVER: Resolved display: var() -> flex  ✅
[07:24:58] Properties: display: var(--display)                     ❌
```

Variables ARE being resolved, but then unresolved versions appear later.

## Architecture Analysis

### Current Processor Order
1. Css_Variable_Registry_Processor (priority 9) - Extracts variable definitions
2. Css_Variable_Resolver (priority 10) - Resolves var() references  
3. Widget_Class_Processor (priority 11) - Processes widget selectors

### The Issue

**Line 67 in Css_Variable_Resolver**:
```php
if ( $variable_type === 'local' || $variable_type === 'unsupported' ) {
    $resolved_value = $this->resolve_variable_reference(...);
}
```

Variables are only resolved if they're type `'local'` or `'unsupported'`.

E-con variables (`--display`, `--align-items`, `--flex-direction`) are classified as `'local'`, so they SHOULD be resolved.

But checking line 76, if variable type is NOT local/unsupported, it's PRESERVED:
```php
} else {
    file_put_contents( $tracking_log, "CSS_VARIABLE_RESOLVER: Preserving {$property}: {$value} (type: {$variable_type})\n" );
}
```

## Solution Design

### Option 1: Fix Variable Type Classification
Ensure all layout/flexbox variables are classified as `'local'` so they get resolved.

**Problem**: Variables ARE already classified as 'local'. This is not the issue.

### Option 2: Remove Duplicate Rules
The 277 duplicate e-con rules suggest rules are being processed multiple times.

**Solution**: Deduplicate CSS rules after parsing, before processing.

### Option 3: Remove E-Con from Widget_Class_Processor
E-con classes are framework classes, not widget-specific classes like `elementor-element-089b111`.

**Insight**: `elementor-` prefix classes are INSTANCE-SPECIFIC (`.elementor-element-089b111`), while `e-con` classes are FRAMEWORK classes (apply to all e-con elements).

E-con should NOT be processed by Widget_Class_Processor - they should go through the normal CSS cascade like other framework classes.

## Recommended Solution

**Remove e-con handling from Widget_Class_Processor entirely.**

### Rationale

1. **E-con classes are framework classes**, not widget instance classes
2. **Variable resolution already works** - the resolver correctly resolves `var(--display)` to `flex`
3. **The issue is duplication**, not resolution
4. **E-con classes should be global classes**, not widget-specific styling

### Implementation

1. **Revert e-con changes from Widget_Class_Processor**:
   - Remove `E_CON_PREFIX` constant
   - Remove e-con check from `is_widget_class()`
   - Remove special case in `find_widgets_matching_selector_classes()`
   - Remove `find_e_con_widgets()` and `find_e_con_inner_widgets()` methods

2. **Let e-con selectors go through Global_Classes_Processor**:
   - E-con selectors with resolved variables will be converted to global classes
   - Widgets reference these global classes
   - Atomic system applies styles via global class references

3. **Remove metadata from HTML parser**:
   - Revert `is_e_con` and `is_e_con_inner` additions
   - These aren't needed if we're not doing special handling

### Expected Result

**CSS Flow**:
```
.e-con-inner {display: var(--display)} 
  → Variable Resolver: display: flex
  → Global Classes: Create global class "e-con-inner" with display: flex
  → Widget: References global class
  → Result: Widget has display: flex via global class
```

## Why This Is Correct

1. ✅ **Uses existing architecture** - No special cases
2. ✅ **Leverages variable resolution** - Already working
3. ✅ **Follows framework class pattern** - E-con is framework, not instance-specific
4. ✅ **Reduces complexity** - No hardcoded logic needed

## Success Criteria

- E-con-inner widget has `display: flex` in Layout controls
- No duplicate processing (single pass through)
- Variables resolved to actual values
- E-con classes available as global classes for reuse


