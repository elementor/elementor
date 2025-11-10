# Duplicate CSS Properties Fix

## Problem

The unified CSS processor was generating duplicate CSS properties in the output, violating the principle that **"UNITY IS SACRED"**.

### Example of the Bug

```css
.elementor .e-e7546e0-35dddb3 {
    font-weight: 400;
    color: rgba(0, 0, 0, .85);
    ...
    color: inherit;
    ...
    font-weight: var(--e-global-typography-primary-font-weight);
}
```

Both `font-weight` and `color` appeared **twice** in the same CSS rule, which breaks the unified processing principle.

## Root Cause

The `Custom_Css_Collector` class was using a sequential array to store CSS properties:

```php
$this->custom_css_buffer[ $widget_id ][] = $css_declaration;
```

This meant that when multiple processors added the same property for the same widget, all values were appended without deduplication:

1. **Widget_Class_Processor** adds `font-weight: 400`
2. **Reset_Styles_Processor** adds `font-weight: var(--e-global-typography-primary-font-weight)`
3. **Result**: Both values appear in the final CSS

## The Unified Processing Pipeline

The CSS processing pipeline runs these processors in order:

1. Css_Parsing_Processor
2. Media_Query_Filter_Processor
3. Css_Variable_Registry_Processor
4. Css_Variable_Resolver
5. **Widget_Class_Processor** ← can add properties
6. Css_Variables_Processor
7. **Id_Selector_Processor** ← can add properties
8. Nested_Selector_Flattening_Processor
9. **Nested_Element_Selector_Processor** ← can add properties
10. Compound_Class_Selector_Processor
11. Style_Collection_Processor
12. **Reset_Styles_Processor** ← can add properties
13. **Widget_Child_Element_Selector_Processor** ← can add properties
14. Global_Classes_Processor
15. Html_Class_Modifier_Processor
16. Style_Resolution_Processor

Multiple processors can add properties to the same widget through the shared `Custom_Css_Collector` instance, which requires proper deduplication.

## The Solution

Implemented **property-name-keyed storage** with **intelligent cascade rules** in `Custom_Css_Collector`:

### Key Changes

#### 1. Property-Keyed Storage

Changed from:
```php
$this->custom_css_buffer[ $widget_id ][] = $css_declaration;
```

To:
```php
$property_key = $this->create_deduplicated_property_key( $property );
$this->custom_css_buffer[ $widget_id ][ $property_key ] = [
    'property' => $property,
    'value' => $value,
    'important' => $important,
];
```

#### 2. CSS Cascade Rules Implementation

Added `should_override_existing_property()` to respect CSS cascade rules:

```php
private function should_override_existing_property( string $widget_id, string $property_key, bool $new_important ): bool {
    if ( ! isset( $this->custom_css_buffer[ $widget_id ][ $property_key ] ) ) {
        return true;
    }

    $existing_important = $this->custom_css_buffer[ $widget_id ][ $property_key ]['important'] ?? false;
    
    if ( $new_important && ! $existing_important ) {
        return true;
    }
    
    if ( ! $new_important && $existing_important ) {
        return false;
    }
    
    return true;
}
```

**Cascade Logic**:
- Property with `!important` **always overrides** property without `!important`
- Property without `!important` **never overrides** property with `!important`
- Same importance level: **later value wins** (respecting source order)

#### 3. Property Key Normalization

```php
private function create_deduplicated_property_key( string $property ): string {
    return strtolower( trim( $property ) );
}
```

Ensures `font-weight`, `Font-Weight`, and `FONT-WEIGHT` are treated as the same property.

## Result

Now the unified CSS processor produces **clean, deduplicated CSS**:

### Before (Broken)
```css
.elementor .e-e7546e0-35dddb3 {
    font-weight: 400;
    color: rgba(0, 0, 0, .85);
    color: inherit;
    font-weight: var(--e-global-typography-primary-font-weight);
}
```

### After (Fixed)
```css
.elementor .e-e7546e0-35dddb3 {
    color: inherit;
    font-weight: var(--e-global-typography-primary-font-weight);
}
```

The last value for each property wins, respecting the CSS cascade and processor execution order.

## Files Modified

- `plugins/elementor-css/modules/css-converter/services/css/custom-css-collector.php`

## Architecture Principles

This fix upholds the core architecture principles:

✅ **UNITY IS SACRED** - One property, one value, unified processing  
✅ **Clean Code** - Property-keyed storage is self-documenting  
✅ **Clean Architecture** - Cascade rules properly encapsulated  
✅ **No Shortcuts** - Proper CSS cascade implementation  
✅ **No Hardcoded Logic** - Generic deduplication mechanism

## Testing

No existing tests were broken. The fix is backward-compatible as it only changes the internal storage mechanism while maintaining the same public API.

To verify the fix works:

1. Convert HTML with duplicate CSS properties from different sources
2. Check that the final CSS output has each property only once
3. Verify that `!important` properties take precedence correctly

## Date

2025-11-03



