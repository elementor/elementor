# PRD: CSS Variable Property Duplication Fix

**Date**: 2025-11-04  
**Status**: Draft  
**Priority**: HIGH  
**Complexity**: Medium  

---

## Problem Statement

Properties that have both hardcoded values and CSS variable values are appearing duplicated in the final generated CSS output.

### Observed Behavior

```css
.elementor .e-b6778a2-5c75af9 {
    font-weight: 400;                                                    /* Line 2 - Hardcoded */
    font-size: 36px;
    color: var(--e-global-color-e66ebc9);
    line-height: 46px;
    text-transform: uppercase;
    padding-block-start: 0px;
    padding-block-end: 0px;
    padding-inline-start: 0px;
    padding-inline-end: 0px;
    margin-block-start: 0px;
    margin-block-end: 0px;
    margin-inline-start: 0px;
    margin-inline-end: 0px;
    background-color: transparent;
    font-weight: var(--e-global-typography-primary-font-weight);        /* Line 14 - Variable */
    letter-spacing: 1px;
}
```

**Issue**: `font-weight` appears twice with different values

### Expected Behavior

Only ONE `font-weight` declaration should appear in the output CSS, following CSS cascade rules:
- If both have equal specificity: **later declaration wins**
- If one has `!important`: **important wins**
- If from different sources: **higher specificity wins**

**Expected Output**:
```css
.elementor .e-b6778a2-5c75af9 {
    font-size: 36px;
    color: var(--e-global-color-e66ebc9);
    line-height: 46px;
    text-transform: uppercase;
    font-weight: var(--e-global-typography-primary-font-weight);  /* Only one - cascade winner */
    letter-spacing: 1px;
    /* ... other properties ... */
}
```

---

## Root Cause Analysis

### Hypothesis: Multiple Source Rules with Different Selectors

The duplication likely occurs because **multiple CSS rules with different selectors** are being collected and converted to the same output selector:

#### Source CSS Example

**Rule 1: Element Selector (Reset/Base Styles)**
```css
h2 {
    font-weight: 400;  /* Browser reset or theme default */
}
```
- Specificity: (0,0,1)
- Source: Reset styles processor
- Target element: All `<h2>` elements

**Rule 2: Class Selector (Elementor Global Styles)**
```css
.elementor-heading-title {
    font-weight: var(--e-global-typography-primary-font-weight);
}
```
- Specificity: (0,1,0)
- Source: Widget class processor
- Target element: Elements with `.elementor-heading-title` class

**Rule 3: ID/Compound Selector (Element-Specific)**
```css
.elementor-element-abc123.elementor-heading-title {
    /* Additional properties */
}
```
- Specificity: (0,2,0)
- Source: Widget class processor

### Why `merge_duplicate_selector_rules()` Doesn't Catch This

The recently implemented merge function works correctly at the **CSS rule extraction stage**:

```php
// unified-css-processor.php: lines 1165-1252
private function merge_duplicate_selector_rules( array $rules ): array {
    // Groups rules by SELECTOR
    foreach ( $rules as $rule ) {
        $grouped_by_selector[ $rule['selector'] ][] = $rule;
    }
    // Merges properties for SAME selector
}
```

**Problem**: The merge only works for rules with **identical selectors**:
- ✅ Merges: `.e-con-inner` (Rule 1) + `.e-con-inner` (Rule 2)
- ❌ Doesn't merge: `h2` (Rule 1) + `.elementor-heading-title` (Rule 2)

These are **different selectors** that happen to target the **same element**.

### Where the Duplication Happens

1. **Style Collection Phase** (Priority 11-85):
   - Reset Styles Processor: Collects `h2 { font-weight: 400 }`
   - Widget Class Processor: Collects `.elementor-heading-title { font-weight: var(--*) }`
   - Both stored separately in Unified Style Manager

2. **Style Resolution Phase** (Priority 100):
   - `resolve_styles_for_widget()` groups properties by name
   - Should find winning style based on specificity
   - **BUG**: Both styles might be getting through

3. **Atomic Conversion Phase**:
   - Both `font-weight` values converted to atomic properties
   - Both included in `resolved_styles` array

4. **CSS Output Generation**:
   - `atomic-widget-data-formatter.php` converts to final CSS
   - Both properties included in output
   - **Result**: Duplication in generated CSS

---

## Evidence Needed

### 1. Check Style Resolution Logic

**File**: `unified-style-manager.php` (~line 301-344)

```php
private function resolve_styles_for_widget_legacy( array $widget ): array {
    // Group by property
    $by_property = $this->group_by_property( $applicable_styles );
    
    // For each property, find the winning style based on specificity
    $winning_styles = [];
    foreach ( $by_property as $property => $styles ) {
        $winning_style = $this->find_winning_style( $styles );  // ← Check this
        if ( $winning_style ) {
            $winning_styles[ $atomic_property_name ] = $winning_style;  // ← Only ONE per property?
        }
    }
}
```

**Questions**:
1. Is `find_winning_style()` correctly selecting only ONE winner?
2. Is the winning style being properly stored (not duplicated)?
3. Are both values somehow ending up in `$winning_styles`?

### 2. Check Atomic Property Conversion

**File**: `atomic-widget-data-formatter.php` (~line 18-40)

```php
public function format_widget_data( array $resolved_styles, ... ) {
    $atomic_props = $this->extract_atomic_props_from_resolved_styles( $resolved_styles );
    // ← Check if $resolved_styles has duplicate properties
}
```

**Questions**:
1. Does `$resolved_styles` contain duplicate `font-weight` entries?
2. How are duplicate properties handled during atomic conversion?
3. Is there merging logic at this stage?

### 3. Check CSS Generation

**File**: `atomic-widget-data-formatter.php` (~line 100-200)

Where the final CSS string is generated from atomic properties.

**Questions**:
1. Are duplicate properties filtered before output?
2. Is there a final deduplication step?
3. How are properties ordered in output?

---

## Solution Design

### Option 1: Fix at Style Resolution (Preferred)

**Location**: `unified-style-manager.php`

**Current Logic** (Suspected Issue):
```php
foreach ( $by_property as $property => $styles ) {
    $winning_style = $this->find_winning_style( $styles );
    
    // Map CSS property name to atomic property name
    $atomic_property_name = $this->get_atomic_property_name( $property );
    
    // BUG: If font-weight from h2 and .class both map to same atomic name,
    // and we're not checking for existing entries properly...
    if ( isset( $winning_styles[ $atomic_property_name ] ) && isset( $winning_style['converted_property'] ) ) {
        // Merge logic: should keep HIGHER specificity
        $winning_styles[ $atomic_property_name ] = $winning_style;  // ← Always overwrites?
    } else {
        $winning_styles[ $atomic_property_name ] = $winning_style;
    }
}
```

**Fix**:
```php
foreach ( $by_property as $property => $styles ) {
    $winning_style = $this->find_winning_style( $styles );
    
    $atomic_property_name = $this->get_atomic_property_name( $property );
    
    // FIXED: Compare specificity when property already exists
    if ( isset( $winning_styles[ $atomic_property_name ] ) ) {
        $existing_style = $winning_styles[ $atomic_property_name ];
        $existing_specificity = $existing_style['specificity'] ?? 0;
        $new_specificity = $winning_style['specificity'] ?? 0;
        
        // Only override if new style has higher specificity
        if ( $new_specificity > $existing_specificity ) {
            $winning_styles[ $atomic_property_name ] = $winning_style;
        }
        // If equal specificity, keep later one (already winning from its group)
        elseif ( $new_specificity === $existing_specificity ) {
            $winning_styles[ $atomic_property_name ] = $winning_style;
        }
        // Otherwise keep existing (higher specificity)
    } else {
        $winning_styles[ $atomic_property_name ] = $winning_style;
    }
}
```

### Option 2: Fix at CSS Generation

**Location**: `atomic-widget-data-formatter.php`

Add final deduplication before CSS output:

```php
private function generate_css_from_atomic_props( array $atomic_props ): string {
    $deduplicated_props = [];
    
    foreach ( $atomic_props as $prop_name => $prop_value ) {
        // Keep only last occurrence (overwrites duplicates)
        $deduplicated_props[ $prop_name ] = $prop_value;
    }
    
    // Generate CSS from deduplicated properties
    return $this->convert_props_to_css_string( $deduplicated_props );
}
```

**Problem**: This approach loses specificity information and might keep wrong value.

### Option 3: Enhanced Property Merging

**Location**: `unified-style-manager.php`

Instead of processing properties one by one, batch-process all properties with specificity awareness:

```php
private function resolve_styles_for_widget_legacy( array $widget ): array {
    $applicable_styles = $this->filter_styles_for_widget( $widget );
    
    // NEW: Group by CSS property name (not atomic name yet)
    $by_css_property = $this->group_by_css_property( $applicable_styles );
    
    // NEW: Find winners at CSS level FIRST
    $winning_css_styles = [];
    foreach ( $by_css_property as $css_property => $styles ) {
        $winning_css_styles[ $css_property ] = $this->find_winning_style( $styles );
    }
    
    // THEN: Convert to atomic properties (deduplication happens naturally)
    $winning_atomic_styles = [];
    foreach ( $winning_css_styles as $css_property => $style ) {
        $atomic_property_name = $this->get_atomic_property_name( $css_property );
        
        // Only set if not already set, OR if new has higher specificity
        if ( ! isset( $winning_atomic_styles[ $atomic_property_name ] ) ||
             $style['specificity'] > $winning_atomic_styles[ $atomic_property_name ]['specificity'] ) {
            $winning_atomic_styles[ $atomic_property_name ] = $style;
        }
    }
    
    return $winning_atomic_styles;
}
```

---

## Recommended Solution

**Use Option 1** (Fix at Style Resolution) with enhancements from Option 3:

### Implementation Plan

1. **Add Specificity Comparison** in `unified-style-manager.php`:
   - When mapping CSS properties to atomic properties
   - Compare specificity if atomic property name already exists
   - Keep higher specificity value

2. **Add Debug Logging**:
   - Log when duplicate atomic properties are detected
   - Log which value is kept and why
   - Track specificity values for debugging

3. **Add Unit Test**:
   - Test case: Multiple rules with `font-weight` for same element
   - Verify only highest specificity wins
   - Test with `!important` flag

### Code Changes

**File**: `unified-style-manager.php`

```php
private function resolve_styles_for_widget_legacy( array $widget ): array {
    $widget_id = $this->get_widget_identifier( $widget );
    $html_id = $widget['attributes']['id'] ?? 'NO_HTML_ID';
    
    $applicable_styles = $this->filter_styles_for_widget( $widget );
    $by_property = $this->group_by_property( $applicable_styles );
    
    $winning_styles = [];
    $duplicate_log_path = WP_CONTENT_DIR . '/css-duplicate-properties.log';
    
    foreach ( $by_property as $property => $styles ) {
        $winning_style = $this->find_winning_style( $styles );
        if ( $winning_style ) {
            $atomic_property_name = $this->get_atomic_property_name( $property );
            
            // CRITICAL FIX: Handle duplicate atomic property mappings
            if ( isset( $winning_styles[ $atomic_property_name ] ) ) {
                $existing_style = $winning_styles[ $atomic_property_name ];
                $existing_specificity = $existing_style['specificity'] ?? 0;
                $existing_important = $existing_style['important'] ?? false;
                $new_specificity = $winning_style['specificity'] ?? 0;
                $new_important = $winning_style['important'] ?? false;
                
                // Log duplication for debugging
                file_put_contents(
                    $duplicate_log_path,
                    date( 'Y-m-d H:i:s' ) . " DUPLICATE: {$atomic_property_name} for {$widget_id}\n" .
                    "  Existing: {$property} = {$existing_style['value']} (specificity: {$existing_specificity}, !important: " . ($existing_important ? 'yes' : 'no') . ")\n" .
                    "  New:      {$property} = {$winning_style['value']} (specificity: {$new_specificity}, !important: " . ($new_important ? 'yes' : 'no') . ")\n",
                    FILE_APPEND
                );
                
                // Resolve using CSS cascade rules
                $should_override = $this->should_override_style( $existing_style, $winning_style );
                
                if ( $should_override ) {
                    $winning_styles[ $atomic_property_name ] = $winning_style;
                    file_put_contents(
                        $duplicate_log_path,
                        "  DECISION: Using NEW value\n",
                        FILE_APPEND
                    );
                } else {
                    file_put_contents(
                        $duplicate_log_path,
                        "  DECISION: Keeping EXISTING value\n",
                        FILE_APPEND
                    );
                }
            } else {
                $winning_styles[ $atomic_property_name ] = $winning_style;
            }
        }
    }
    
    return $winning_styles;
}

private function should_override_style( array $existing, array $new ): bool {
    $existing_important = $existing['important'] ?? false;
    $new_important = $new['important'] ?? false;
    $existing_specificity = $existing['specificity'] ?? 0;
    $new_specificity = $new['specificity'] ?? 0;
    
    // Rule 1: !important always wins over non-important
    if ( $new_important && ! $existing_important ) {
        return true;
    }
    if ( ! $new_important && $existing_important ) {
        return false;
    }
    
    // Rule 2: Higher specificity wins (both same importance)
    if ( $new_specificity > $existing_specificity ) {
        return true;
    }
    if ( $new_specificity < $existing_specificity ) {
        return false;
    }
    
    // Rule 3: Equal specificity - later declaration wins (cascade)
    // Since $new is being processed later, it should win
    return true;
}
```

---

## Testing Plan

### Test Case 1: Basic Duplication

**Input CSS**:
```css
h2 {
    font-weight: 400;
}

.elementor-heading-title {
    font-weight: var(--e-global-typography-primary-font-weight);
}
```

**Expected**: Only `.elementor-heading-title` value (higher specificity)

### Test Case 2: With !important

**Input CSS**:
```css
h2 {
    font-weight: 400 !important;
}

.elementor-heading-title {
    font-weight: var(--e-global-typography-primary-font-weight);
}
```

**Expected**: `h2` value (important wins)

### Test Case 3: Equal Specificity

**Input CSS**:
```css
.class-a {
    font-weight: 400;
}

.class-b {
    font-weight: 700;
}
```

**Expected**: `.class-b` value (later in cascade)

### Test Case 4: Multiple Properties

**Input CSS**:
```css
h2 {
    font-weight: 400;
    font-size: 24px;
}

.elementor-heading-title {
    font-weight: var(--e-global-typography-primary-font-weight);
    color: blue;
}
```

**Expected**:
- `font-weight`: `.elementor-heading-title` value
- `font-size`: `h2` value
- `color`: `.elementor-heading-title` value

---

## Success Criteria

1. ✅ **No Property Duplication**: Each CSS property appears only once in generated CSS
2. ✅ **Correct Cascade Rules**: Higher specificity wins, !important respected
3. ✅ **Preserve All Properties**: No properties lost during deduplication
4. ✅ **Performance**: No significant slowdown in conversion
5. ✅ **Logging**: Clear debug logs showing resolution decisions

---

## Rollback Plan

If issues arise:
1. Add feature flag: `enable_duplicate_property_resolution`
2. Default to OFF for production
3. Keep existing behavior as fallback
4. Monitor logs for unexpected behavior

---

## Future Enhancements

1. **Variable Resolution**: Resolve CSS variables before comparison
2. **Source Tracking**: Track which rule contributed each property
3. **Visual Debugging**: Show property sources in Elementor editor
4. **Performance**: Cache specificity calculations


