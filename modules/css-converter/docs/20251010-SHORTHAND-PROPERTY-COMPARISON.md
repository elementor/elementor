# Shorthand Property Handling Comparison

**Goal:** Understand how working mappers handle shorthand properties to fix positioning shorthand.

## Status Check

- ✅ **Individual positioning works**: `inset-block-start: 20px` → Top: 20px
- ❌ **Shorthand positioning broken**: `inset: 20px` → All empty
- ❌ **Physical to logical broken**: `top: 10px` → Wrong values

## Property Mappers to Study

### 1. Padding Mapper
**Properties:**
- Individual: `padding-top`, `padding-right`, `padding-bottom`, `padding-left`
- Logical: `padding-block-start`, `padding-inline-end`, `padding-block-end`, `padding-inline-start`
- Shorthand: `padding` (1-4 values)

### 2. Margin Mapper
**Properties:**
- Individual: `margin-top`, `margin-right`, `margin-bottom`, `margin-left`
- Logical: `margin-block-start`, `margin-inline-end`, `margin-block-end`, `margin-inline-start`
- Shorthand: `margin` (1-4 values)

### 3. Box Shadow Mapper
**Properties:**
- Shorthand: `box-shadow` (multiple shadow values)

### 4. Border Width Mapper
**Properties:**
- Individual: `border-top-width`, `border-right-width`, `border-bottom-width`, `border-left-width`
- Shorthand: `border-width` (1-4 values)

### 5. Border Radius Mapper
**Properties:**
- Individual: `border-top-left-radius`, `border-top-right-radius`, `border-bottom-right-radius`, `border-bottom-left-radius`
- Shorthand: `border-radius` (1-4 values)

## Current Positioning Implementation

**Properties:**
- Individual Physical: `top`, `right`, `bottom`, `left`
- Individual Logical: `inset-block-start`, `inset-inline-end`, `inset-block-end`, `inset-inline-start`
- Shorthand: `inset` (1-4 values), `inset-block` (1-2 values), `inset-inline` (1-2 values)

**Current Problem:**
```php
private function map_shorthand_property( string $property, $value ): ?array {
    // For shorthand properties, we need to return multiple atomic properties
    // This is a limitation - atomic widgets expect individual properties
    // For now, we'll handle the first value only
    $parts = $this->parse_shorthand_values( $value );
    if ( empty( $parts ) ) {
        return null;
    }

    $first_value = $parts[0];
    $parsed_size = $this->parse_size_value( $first_value );
    if ( null === $parsed_size ) {
        return null;
    }

    // ❌ WRONG: Only returns first value as single property
    return Size_Prop_Type::make()->generate( $parsed_size );
}
```

---

## Key Findings

### ✅ **Padding Mapper** (WORKING)
```php
// ALL properties map to 'padding'
public function get_target_property_name( string $property ): string {
    return 'padding'; // ✅ All map to same property
}

// Returns Dimensions_Prop_Type with all 4 sides
public function map_to_v4_atomic( string $property, $value ): ?array {
    $dimensions_data = $this->parse_padding_property( $property, $value );
    return Dimensions_Prop_Type::make()->generate( $dimensions_data );
}

// Shorthand: padding: 20px → All 4 sides
private function parse_shorthand_to_logical_properties( string $value ): ?array {
    $values = preg_split( '/\s+/', trim( $value ) );
    switch ( count( $values ) ) {
        case 1: // All 4 sides same
            return [
                'block-start' => Size_Prop_Type::make()->generate($parsed),
                'inline-end' => Size_Prop_Type::make()->generate($parsed),
                'block-end' => Size_Prop_Type::make()->generate($parsed),
                'inline-start' => Size_Prop_Type::make()->generate($parsed),
            ];
        // ... handles 2, 3, 4 values
    }
}

// Individual: padding-top: 20px → Only block-start, others null
private function parse_individual_padding( string $logical_side, string $value ): ?array {
    $parsed_size = $this->parse_size_value( $value );
    return [
        'block-start' => $logical_side === 'block-start' ? $this->create_size_prop($parsed_size) : null,
        'inline-end' => $logical_side === 'inline-end' ? $this->create_size_prop($parsed_size) : null,
        'block-end' => $logical_side === 'block-end' ? $this->create_size_prop($parsed_size) : null,
        'inline-start' => $logical_side === 'inline-start' ? $this->create_size_prop($parsed_size) : null,
    ];
}
```

### ✅ **Margin Mapper** (WORKING)
```php
// Same pattern as padding
public function get_target_property_name( string $property ): string {
    return 'margin'; // ✅ All map to same property
}

// Returns Dimensions_Prop_Type with all 4 sides
// Handles shorthand 1-4 values
// Individual properties set only one side, others null
```

### ✅ **Box Shadow Mapper** (WORKING)
```php
// Single property, no shorthand complexity
public function map_to_v4_atomic( string $property, $value ): ?array {
    $shadows_data = $this->parse_box_shadow_value( $value );
    return Box_Shadow_Prop_Type::make()->generate( $shadows_data );
}

// Parses multiple shadow values (comma-separated)
// Returns array of Shadow_Prop_Type
```

### ❌ **Positioning Mapper** (BROKEN)
```php
// ❌ WRONG: Individual properties don't map to common property
public function get_target_property_name( string $property ): string {
    return $this->get_v4_property_name( $property ); // Returns different names!
}

// ❌ WRONG: Shorthand only returns first value
private function map_shorthand_property( string $property, $value ): ?array {
    $parts = $this->parse_shorthand_values( $value );
    $first_value = $parts[0];
    $parsed_size = $this->parse_size_value( $first_value );
    
    // ❌ WRONG: Only one Size_Prop_Type, not all 4 sides
    return Size_Prop_Type::make()->generate( $parsed_size );
}

// ❌ WRONG: Individual properties return single Size_Prop_Type
private function map_individual_property( string $property, $value ): ?array {
    $parsed_size = $this->parse_size_value( $value );
    
    // ❌ WRONG: Not wrapped in dimensions structure
    return Size_Prop_Type::make()->generate( $parsed_size );
}
```

---

## The Problem

**Padding/Margin Pattern (CORRECT):**
1. ✅ ALL properties (shorthand, individual, logical) map to **ONE property name** (`padding` or `margin`)
2. ✅ ALL return **Dimensions_Prop_Type** with 4 sides
3. ✅ Shorthand expands to all 4 sides
4. ✅ Individual sets only one side, others are `null`

**Positioning Pattern (BROKEN):**
1. ❌ Properties map to **DIFFERENT property names** (`inset-block-start`, `inset-inline-end`, etc.)
2. ❌ Return **individual Size_Prop_Type** instead of dimensions structure
3. ❌ Shorthand only returns first value
4. ❌ No merging mechanism for multiple individual properties

---

## Why It's Broken

### Atomic Widget Style Schema:
```php
// From style-schema.php
private static function get_position_props() {
    return [
        'position' => String_Prop_Type::make()->enum([...]),
        'inset-block-start' => Size_Prop_Type::make(),    // ← Individual properties!
        'inset-inline-end' => Size_Prop_Type::make(),
        'inset-block-end' => Size_Prop_Type::make(),
        'inset-inline-start' => Size_Prop_Type::make(),
        'z-index' => Number_Prop_Type::make(),
    ];
}
```

**Key Insight:**
- ✅ Padding/Margin use **ONE property** (`padding` or `margin`) with `Dimensions_Prop_Type`
- ❌ Positioning uses **FOUR separate properties** with individual `Size_Prop_Type`
- ❌ This means we can't use the Dimensions pattern - we need to return **4 separate properties**!

---

## The Solution

**Positioning properties CANNOT use Dimensions_Prop_Type!**

The atomic widget expects:
```javascript
{
  'inset-block-start': { $$type: 'size', value: { size: 20, unit: 'px' } },
  'inset-inline-end': { $$type: 'size', value: { size: 20, unit: 'px' } },
  'inset-block-end': { $$type: 'size', value: { size: 20, unit: 'px' } },
  'inset-inline-start': { $$type: 'size', value: { size: 20, unit: 'px' } }
}
```

NOT:
```javascript
{
  'positioning': { 
    $$type: 'dimensions', 
    value: { 
      'block-start': {...}, 
      'inline-end': {...}, 
      ...  
    } 
  }
}
```

**We need to:**
1. ✅ Keep individual properties returning individual `Size_Prop_Type`
2. ✅ Shorthand (`inset`) must expand to **4 separate properties**
3. ✅ `inset-block` expands to **2 separate properties** (block-start, block-end)
4. ✅ `inset-inline` expands to **2 separate properties** (inline-start, inline-end)

**This requires a different approach in the CSS-to-Atomic converter!**


