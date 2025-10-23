# Required Atomic Mapper Updates

## 🚨 **MERGED INTO COMPREHENSIVE GUIDE**

**This document has been merged into**: `COMPREHENSIVE-ATOMIC-WIDGETS-IMPLEMENTATION-GUIDE.md`

**Please refer to the comprehensive guide for:**
- Complete atomic prop types catalog (50 prop types)
- Full implementation plan with phases
- Atomic widget integration architecture
- Complete code location updates
- Testing strategies and templates

## 🎯 OVERVIEW (LEGACY)

This document lists all code locations that require atomic widget-based updates. Each item marked with `// Needs atomic mapper update` must be replaced with proper atomic widget research and implementation.

---

## 📋 COMPLETE LIST OF REQUIRED UPDATES

### **1. Enhanced_Property_Mapper (28 Properties)**
**File**: `convertors/css-properties/implementations/enhanced_property_mapper.php`
**Status**: Entire class needs atomic widget replacement

#### Properties Requiring Atomic Mappers:
1. `background` - Needs Background_Prop_Type research
2. `padding` - Needs Dimensions_Prop_Type research  
3. `margin-top` - Needs Size_Prop_Type research
4. `margin-right` - Needs Size_Prop_Type research
5. `margin-bottom` - Needs Size_Prop_Type research
6. `margin-left` - Needs Size_Prop_Type research
7. `padding-top` - Needs Size_Prop_Type research
8. `padding-right` - Needs Size_Prop_Type research
9. `padding-bottom` - Needs Size_Prop_Type research
10. `padding-left` - Needs Size_Prop_Type research
11. `border-radius` - Needs Border_Radius_Prop_Type research
12. `box-shadow` - Needs Box_Shadow_Prop_Type research
13. `text-shadow` - Needs Shadow_Prop_Type research
14. `transform` - Needs Transform_Prop_Type research
15. `transition` - Needs Transition_Prop_Type research
16. `opacity` - Needs Number_Prop_Type research
17. `z-index` - Needs Number_Prop_Type research
18. `width` - Needs Size_Prop_Type research
19. `height` - Needs Size_Prop_Type research
20. `display` - Needs String_Prop_Type research
21. `position` - Needs String_Prop_Type research
22. `flex-direction` - Needs String_Prop_Type research
23. `align-items` - Needs String_Prop_Type research
24. `justify-content` - Needs String_Prop_Type research
25. `gap` - Needs Size_Prop_Type research
26. `font-weight` - Needs String_Prop_Type research
27. `line-height` - Needs Size_Prop_Type research
28. `text-align` - Needs String_Prop_Type research

---

## 🔧 SPECIFIC CODE LOCATIONS REQUIRING UPDATES

### **Class_Property_Mapper_Registry**
**File**: `convertors/css-properties/implementations/class_property_mapper_registry.php`

#### Lines 38-56: Fallback Property Loading
```php
// Needs atomic mapper update: Add Enhanced_Property_Mapper for remaining properties
// Load the enhanced mapper for remaining properties
require_once __DIR__ . '/enhanced_property_mapper.php';

// Fallback properties that still use enhanced mapper
$fallback_properties = [
    'background', 'padding',
    'margin-top', 'margin-right', 'margin-bottom', 'margin-left',
    'padding-top', 'padding-right', 'padding-bottom', 'padding-left',
    'border-radius', 'box-shadow', 'text-shadow', 'transform', 'transition',
    'opacity', 'z-index', 'width', 'height', 'display', 'position',
    'flex-direction', 'align-items', 'justify-content', 'gap', 'font-weight',
    'line-height', 'text-align'
];

foreach ( $fallback_properties as $property ) {
    // Needs atomic mapper update: Replace Enhanced_Property_Mapper with atomic widget-based mapper
    $this->mappers[ $property ] = new Enhanced_Property_Mapper( $property );
}
```

#### Line 107: Basic_Property_Mapper
```php
public function map_to_v4_atomic( string $property, $value ): ?array {
    // Needs atomic mapper update: Replace string type with atomic widget-based type
    return [
        '$$type' => 'string',
        'value' => (string) $value
    ];
}
```

### **Property_Mapper_Base**
**File**: `convertors/css-properties/implementations/property_mapper_base.php`

#### Lines 17-23: String Fallback Method
```php
protected function create_v4_property( string $property, $value ): array {
    // Needs atomic mapper update: Replace string fallback with atomic widget-based type
    return [
        '$$type' => 'string',
        'value' => (string) $value
    ];
}
```

#### Lines 25-34: Type Validation Method
```php
protected function create_v4_property_with_type( string $property, string $type, $value ): array {
    // Needs atomic mapper update: Add atomic widget type validation
    return [
        'property' => $property,
        'value' => [
            '$$type' => $type,
            'value' => $value
        ]
    ];
}
```

### **Enhanced_Property_Mapper Methods**
**File**: `convertors/css-properties/implementations/enhanced_property_mapper.php`

#### All Methods Requiring Atomic Updates:

1. **Line 22**: `get_atomic_result()` - Replace switch statement with atomic widget research
2. **Line 46**: `create_color_property()` - Use Color_Prop_Type structure
3. **Line 91**: `create_size_property()` - Use Size_Prop_Type structure  
4. **Line 108**: `create_number_property()` - Use Number_Prop_Type structure
5. **Line 115**: `create_string_property()` - Use String_Prop_Type structure
6. **Line 122**: `create_shorthand_size_property()` - Use Dimensions_Prop_Type structure
7. **Line 138**: `create_background_property()` - Use Background_Prop_Type structure
8. **Line 165**: `create_font_weight_property()` - Use String_Prop_Type structure
9. **Line 256**: `map_to_schema()` - Replace with atomic widget schema mapping
10. **Line 268**: `get_schema_property_name()` - Use atomic widget property name mapping
11. **Line 275**: `create_background_gradient_property()` - Use Background_Prop_Type gradient structure
12. **Line 287**: `parse_gradient_to_elementor_format()` - Use atomic widget gradient parsing
13. **Line 358**: `parse_color_stops_elementor_format()` - Use atomic widget color stop parsing

---

## 📚 ATOMIC WIDGET RESEARCH REQUIRED

### **For Each Property, Research:**

1. **Find Atomic Widget**: Search `/plugins/elementor/modules/atomic-widgets/elements/` for widgets using the property
2. **Identify Prop Type**: Locate the prop type in `/plugins/elementor/modules/atomic-widgets/prop-types/`
3. **Study Structure**: Examine `define_shape()` method in the prop type
4. **Document Source**: Add atomic source verification to class docblock
5. **Implement Mapper**: Create atomic-compliant property mapper

### **Expected Atomic Prop Types:**

- **Size Properties**: `Size_Prop_Type` (width, height, font-size, margins, paddings)
- **Color Properties**: `Color_Prop_Type` (color, text-color)
- **Background Properties**: `Background_Prop_Type` (background, background-color)
- **Dimension Properties**: `Dimensions_Prop_Type` (margin, padding shorthand)
- **Border Properties**: `Border_Radius_Prop_Type` (border-radius)
- **Shadow Properties**: `Box_Shadow_Prop_Type`, `Shadow_Prop_Type` (box-shadow, text-shadow)
- **String Properties**: `String_Prop_Type` (display, position, text-align, font-weight)
- **Number Properties**: `Number_Prop_Type` (opacity, z-index)
- **Transform Properties**: `Transform_Prop_Type` (transform)
- **Transition Properties**: `Transition_Prop_Type` (transition)

---

## 🎯 IMPLEMENTATION PRIORITY

### **Phase 1: High-Priority Properties (Most Used)**
1. `padding` - Dimensions_Prop_Type
2. `width` - Size_Prop_Type  
3. `height` - Size_Prop_Type
4. `border-radius` - Border_Radius_Prop_Type
5. `box-shadow` - Box_Shadow_Prop_Type
6. `opacity` - Number_Prop_Type
7. `display` - String_Prop_Type
8. `position` - String_Prop_Type

### **Phase 2: Layout Properties**
1. `flex-direction` - String_Prop_Type
2. `align-items` - String_Prop_Type
3. `justify-content` - String_Prop_Type
4. `gap` - Size_Prop_Type
5. `z-index` - Number_Prop_Type

### **Phase 3: Individual Spacing Properties**
1. `margin-top` - Size_Prop_Type
2. `margin-right` - Size_Prop_Type
3. `margin-bottom` - Size_Prop_Type
4. `margin-left` - Size_Prop_Type
5. `padding-top` - Size_Prop_Type
6. `padding-right` - Size_Prop_Type
7. `padding-bottom` - Size_Prop_Type
8. `padding-left` - Size_Prop_Type

### **Phase 4: Typography Properties**
1. `font-weight` - String_Prop_Type
2. `line-height` - Size_Prop_Type
3. `text-align` - String_Prop_Type

### **Phase 5: Advanced Properties**
1. `background` - Background_Prop_Type
2. `text-shadow` - Shadow_Prop_Type
3. `transform` - Transform_Prop_Type
4. `transition` - Transition_Prop_Type

---

## 📝 ATOMIC MAPPER TEMPLATE

### **For Each New Atomic Mapper:**

```php
<?php

namespace Elementor\Modules\CssConverter\Convertors\CssProperties\Properties;

use Elementor\Modules\CssConverter\Convertors\CssProperties\Implementations\Modern_Property_Mapper_Base;

/**
 * [Property Name] Property Mapper
 * 
 * 🎯 ATOMIC SOURCE VERIFICATION:
 * - Atomic Widget: [specific atomic widget file and class]
 * - Prop Type: [specific prop type file and class]
 * - Expected Structure: [exact JSON structure from prop type]
 * - Validation Rules: [rules from atomic prop type]
 * 
 * 🚫 FALLBACK STATUS: NONE - This mapper has zero fallbacks
 * ✅ COMPLIANCE: 100% atomic widget based
 */
class [Property_Name]_Property_Mapper extends Modern_Property_Mapper_Base {
    
    private const SUPPORTED_PROPERTIES = ['property-name'];
    
    public function get_supported_properties(): array {
        return self::SUPPORTED_PROPERTIES;
    }
    
    public function map_to_v4_atomic( string $property, $value ): ?array {
        if ( ! $this->supports( $property ) ) {
            return null;
        }
        
        // Parse and validate value using atomic widget rules
        $parsed_value = $this->parse_[property]_value( $value );
        if ( null === $parsed_value ) {
            return null;
        }
        
        // Create atomic property using exact atomic widget structure
        return $this->create_v4_property_with_type( 
            $property, 
            '[atomic_type]', 
            $parsed_value 
        );
    }
    
    private function parse_[property]_value( $value ): ?array {
        // Implement atomic widget-compliant parsing
        // Return structure that matches atomic prop type exactly
    }
}
```

---

## 🚨 CRITICAL REQUIREMENTS

### **Every Atomic Mapper Must:**

1. **Reference Specific Atomic Widget** - Document which atomic widget uses the property
2. **Use Exact Prop Type Structure** - Match atomic prop type `define_shape()` exactly  
3. **Include Source Documentation** - Add atomic source verification in docblock
4. **Have Zero Fallbacks** - No Enhanced_Property_Mapper patterns allowed
5. **Pass Atomic Validation** - Structure must match atomic widget expectations

### **Forbidden Patterns:**

- ❌ Using Enhanced_Property_Mapper patterns
- ❌ Creating custom JSON structures  
- ❌ String type fallbacks where atomic types exist
- ❌ Generic property handling without atomic research
- ❌ Hardcoded property structures not from atomic widgets

---

## 📊 PROGRESS TRACKING

### **Current Status:**
- ✅ **Atomic Mappers**: 4 (color, background-color, font-size, margin)
- ❌ **Enhanced_Property_Mapper**: 28 properties
- 🎯 **Atomic Compliance**: 12.5% (4/32 properties)

### **Target Status:**
- 🎯 **Atomic Mappers**: 32 (all properties)
- ❌ **Enhanced_Property_Mapper**: 0 properties  
- 🎯 **Atomic Compliance**: 100% (32/32 properties)

---

## 💡 NEXT STEPS

1. **Start with Phase 1 properties** (highest priority)
2. **Research atomic widgets** for each property
3. **Create atomic-compliant mappers** following the template
4. **Replace Enhanced_Property_Mapper usage** one property at a time
5. **Test atomic compliance** for each new mapper
6. **Document atomic sources** in each mapper class
7. **Remove Enhanced_Property_Mapper** when all properties have atomic mappers

**Goal**: Achieve 100% atomic widget compliance with zero fallback mechanisms.
