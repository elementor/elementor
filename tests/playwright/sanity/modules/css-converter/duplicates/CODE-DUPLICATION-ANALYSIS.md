# Code Duplication Analysis - Property Conversion

## The Problem

**We have TWO different conversion implementations doing the SAME job:**

1. **Widget inline styles**: Uses `Css_Property_Conversion_Service::convert_properties_to_v4_atomic()`
2. **Global classes**: Uses custom loop calling `convert_property_to_v4_atomic()` one at a time

## Evidence

### Widget Conversion (CORRECT)
**File**: `plugins/elementor-css/modules/css-converter/services/css/processing/css-property-conversion-service.php`
**Method**: `convert_properties_to_v4_atomic()` (line 60)

**Features**:
- ✅ Expands shorthand properties
- ✅ Maps property names to v4 format (`margin-bottom` → `margin`)
- ✅ Merges dimensions (multiple margin properties → single `margin` object)
- ✅ Handles collisions correctly

**Code**:
```php
public function convert_properties_to_v4_atomic( array $properties ): array {
    // ✅ Expand shorthand
    $expanded_properties = CSS_Shorthand_Expander::expand_shorthand_properties( $properties );

    $converted = [];

    foreach ( $expanded_properties as $property => $value ) {
        $mapper = $this->resolve_property_mapper_safely( $property, $value );
        $result = $this->convert_property_to_v4_atomic( $property, $value );
        
        if ( $result && $mapper ) {
            // ✅ Get v4 property name
            $v4_property_name = method_exists( $mapper, 'get_v4_property_name' )
                ? $mapper->get_v4_property_name( $property )
                : $property;

            // ✅ Merge dimensions
            if ( 'margin' === $v4_property_name && isset( $converted[ $v4_property_name ] ) ) {
                $converted[ $v4_property_name ] = $this->merge_dimensions_values(
                    $converted[ $v4_property_name ],
                    $result
                );
            } else {
                $converted[ $v4_property_name ] = $result;
            }
        }
    }

    return $converted;
}
```

### Global Classes Conversion (BROKEN)
**File**: `plugins/elementor-css/modules/css-converter/services/global-classes/unified/global-classes-conversion-service.php`
**Method**: `convert_properties_to_atomic()` (line 41)

**Original Code**:
```php
private function convert_properties_to_atomic( array $properties ): array {
    $atomic_props = [];

    foreach ( $properties as $property_data ) {
        $property = $property_data['property'] ?? '';
        $value = $property_data['value'] ?? '';

        // ❌ NO shorthand expansion
        // ❌ NO v4 property name mapping
        // ❌ NO dimension merging
        $converted = $this->property_conversion_service->convert_property_to_v4_atomic(
            $property,
            $value
        );

        if ( $converted && isset( $converted['$$type'] ) ) {
            // ❌ Stores with CSS property name, not v4 name
            $atomic_props[ $property ] = $converted;
        }
    }

    return $atomic_props;
}
```

## Why This Is Chaotic

1. **Duplicated Logic**: Two places doing the same conversion with different implementations
2. **Inconsistent Results**: Same CSS produces different atomic structures
3. **Hard to Maintain**: Bug fixes need to be applied in two places
4. **No Single Source of Truth**: Which implementation is correct?

## The Impact

### Example: `margin-bottom: 30px`

**Widget inline styles** (works):
```
Input: ['margin-bottom' => '30px']
Output: ['margin' => { $$type: 'dimensions', value: { 'block-end': {...} } }]
```

**Global classes** (broken):
```
Input: [['property' => 'margin-bottom', 'value' => '30px']]
Output: ['margin-bottom' => { $$type: 'dimensions', value: { 'block-end': {...} } }]
                ↑ WRONG KEY - Should be 'margin'
```

## What Should Happen

**Option 1: Reuse Existing Service**
Global classes should call the SAME method that widgets use:

```php
private function convert_properties_to_atomic( array $properties ): array {
    // Transform input format
    $properties_array = [];
    foreach ( $properties as $property_data ) {
        $property = $property_data['property'] ?? '';
        $value = $property_data['value'] ?? '';
        if ( ! empty( $property ) && ! empty( $value ) ) {
            $properties_array[ $property ] = $value;
        }
    }

    // ✅ Use the SAME conversion method as widgets
    return $this->property_conversion_service->convert_properties_to_v4_atomic(
        $properties_array
    );
}
```

**Option 2: Extract to Shared Service**
Create a standalone conversion service that both widgets and global classes use:

```php
class Atomic_Property_Converter {
    public function convert_css_properties_to_atomic( array $properties ): array {
        // Single implementation
        // Used by both widgets and global classes
    }
}
```

## Questions for Architecture Decision

1. **Why were these implemented separately?**
   - Was there a reason for different logic?
   - Or was it just duplicated by mistake?

2. **Is there any case where global classes need different conversion?**
   - If not, they should use the same code path

3. **Should we extract this to a shared service?**
   - Would make the architecture cleaner
   - Single source of truth for property conversion

## Current Status

- ❌ Global classes conversion is broken
- ❌ Code is duplicated
- ❌ No clear architecture
- ⚠️ Fix attempted but needs architectural decision first

## Recommendation

**DO NOT FIX YET** - Need to decide on architecture:
1. Should global classes just call `convert_properties_to_v4_atomic()`?
2. Should we extract to a shared service?
3. Is there a reason for the duplication we're missing?

This is a code quality/architecture issue, not just a bug fix.

