# Individual Properties Solution - Correct Pattern

## Problem Analysis

The `dimensions-prop-type.test.ts` was failing because I incorrectly assumed individual padding properties (like `padding-top`) should not be supported by atomic widgets.

## Root Cause

**My assumption was wrong.** Individual properties ARE supported by atomic widgets, but they need to be converted to the full atomic structure.

## Correct Pattern (From Other Property Mappers)

### 1. Positioning Properties (`positioning-property-mapper.php`)
- **Supports**: `top`, `right`, `bottom`, `left` (individual properties)
- **Converts**: Physical properties to logical properties (`top` → `inset-block-start`)
- **Uses**: `Size_Prop_Type` for individual properties
- **Pattern**: Individual properties are fully supported

### 2. Border Width Properties (`border-width-property-mapper.php`)
- **Supports**: `border-top-width`, `border-right-width`, etc. (individual properties)
- **Converts**: Individual properties to full `Border_Width_Prop_Type` structure
- **Uses**: All directions with zero values for unused directions
- **Pattern**: Individual properties create complete atomic structure

### 3. Box Shadow Properties (`box-shadow-property-mapper.php`)
- **Supports**: Only `box-shadow` (shorthand only)
- **Pattern**: Some properties only support shorthand

## Padding Properties - Correct Implementation

The **original implementation** in `atomic-padding-property-mapper.php` was correct:

### ✅ Correct Approach:
```php
private const SUPPORTED_PROPERTIES = [
    'padding',           // Shorthand
    'padding-top',       // Individual properties
    'padding-right',
    'padding-bottom', 
    'padding-left',
    'padding-block-start',    // Logical properties
    'padding-block-end',
    'padding-inline-start',
    'padding-inline-end',
    'padding-block',     // Logical shorthand
    'padding-inline',
];
```

### ✅ Individual Property Handling:
```php
case 'padding-top':
    return $this->parse_individual_padding( 'block-start', $value );

private function parse_individual_padding( string $logical_side, string $value ): ?array {
    $parsed_size = $this->parse_size_value( $value );
    if ( null === $parsed_size ) {
        return null;
    }

    return [
        $logical_side => $this->create_size_prop( $parsed_size ),
    ];
}
```

### ✅ Atomic Structure:
- Individual properties like `padding-top: 20px` are converted to:
```json
{
  "$$type": "dimensions",
  "value": {
    "block-start": {
      "$$type": "size", 
      "value": {"size": 20, "unit": "px"}
    }
  }
}
```

## Why This Works

1. **Atomic widgets accept partial dimensions** - they don't require all directions
2. **The unified approach correctly processes** individual properties through the atomic system
3. **CSS generation works** when the atomic structure is correct
4. **Individual properties are common** in CSS and need to be supported

## Key Learnings

### ❌ My Wrong Assumption:
- "Individual properties should not go through atomic widgets"
- "Individual properties should fall through to direct CSS generation"

### ✅ Correct Understanding:
- **Individual properties ARE supported** by atomic widgets
- **They need correct atomic structure** (Dimensions_Prop_Type with partial values)
- **The atomic system handles partial dimensions** correctly
- **CSS generation works** when the structure matches atomic expectations

## Test Results

After restoring the original implementation:
- ✅ `dimensions-prop-type.test.ts` **PASSES**
- ✅ All padding variations work correctly
- ✅ Individual properties (`padding-top: 20px`) are applied correctly
- ✅ Shorthand properties (`padding: 20px`) work correctly
- ✅ Complex shorthand (`padding: 20px 30px 0px 10px`) works correctly

## Conclusion

The **original working approach** was correct. Individual properties should:

1. **Be supported** by property mappers
2. **Be converted** to atomic widget structures
3. **Use the appropriate prop type** (Dimensions_Prop_Type for padding)
4. **Create partial structures** when only one direction is specified

The unified approach works correctly when the property mappers provide the right atomic structures.

## Pattern for Other Properties

When implementing property mappers:

1. **Study existing patterns** (positioning, border-width, etc.)
2. **Support both shorthand AND individual properties** when the CSS spec allows it
3. **Convert to correct atomic structures** based on the atomic widget prop types
4. **Test with atomic widgets** to verify the structure is accepted

**Individual properties are not the exception - they are the norm in CSS and should be fully supported.**
