# Atomic Widgets Research and Responsibilities

## 🔍 **RESPONSIBILITY BOUNDARIES**

### **CSS Converter Module Responsibilities**
- ✅ **Parse HTML/CSS input** - Extract CSS properties and values
- ✅ **Map CSS properties to atomic prop types** - Determine which atomic prop type to use
- ✅ **Convert CSS values to atomic format** - Parse CSS values into atomic-compatible data
- ✅ **Use atomic prop types to generate JSON** - Call atomic prop type methods to create JSON
- ✅ **Build widget structure** - Use Widget_Builder/Element_Builder for complete widget JSON
- ❌ **NEVER create manual JSON structures** - All JSON must come from atomic widgets

### **Atomic Widgets Module Responsibilities**  
- ✅ **Provide prop type definitions** - Define all available prop types and their schemas
- ✅ **Generate JSON structures** - Create `{'$$type': '...', 'value': {...}}` structures
- ✅ **Validate prop values** - Ensure values match prop type requirements
- ✅ **Render widgets** - Handle widget display in editor/frontend
- ✅ **Define widget schemas** - Specify what props each widget accepts
- ❌ **NEVER parse CSS** - CSS parsing is CSS converter responsibility

---

## 📊 **COMPLETE ATOMIC PROP TYPES CATALOG**

### **Available Prop Types (42 Total)**

#### **Core Primitive Types (3)**
1. **`string-prop-type.php`** - String values
2. **`number-prop-type.php`** - Numeric values  
3. **`boolean-prop-type.php`** - Boolean values

#### **Size and Dimensions (4)**
4. **`size-prop-type.php`** - Size values with units (px, em, %, etc.)
5. **`dimensions-prop-type.php`** - Multi-directional sizes (padding, margin)
6. **`selection-size-prop-type.php`** - Size selection from predefined options
7. **`layout-direction-prop-type.php`** - Layout direction properties

#### **Color and Visual (6)**
8. **`color-prop-type.php`** - Color values (hex, rgb, named)
9. **`color-stop-prop-type.php`** - Gradient color stops
10. **`gradient-color-stop-prop-type.php`** - Gradient color stop arrays
11. **`background-prop-type.php`** - Background properties
12. **`background-color-overlay-prop-type.php`** - Background color overlays
13. **`background-gradient-overlay-prop-type.php`** - Background gradient overlays

#### **Border and Effects (4)**
14. **`border-radius-prop-type.php`** - Border radius values
15. **`border-width-prop-type.php`** - Border width values
16. **`box-shadow-prop-type.php`** - Box shadow effects
17. **`shadow-prop-type.php`** - Individual shadow definitions

#### **Images and Media (5)**
18. **`image-prop-type.php`** - Image properties
19. **`image-src-prop-type.php`** - Image source URLs
20. **`image-attachment-id-prop-type.php`** - WordPress attachment IDs
21. **`background-image-overlay-prop-type.php`** - Background image overlays
22. **`background-image-overlay-size-scale-prop-type.php`** - Background image scaling

#### **Layout and Positioning (4)**
23. **`flex-prop-type.php`** - Flexbox properties
24. **`position-prop-type.php`** - Position properties
25. **`background-image-position-offset-prop-type.php`** - Background position offsets
26. **`background-overlay-prop-type.php`** - Background overlays

#### **Typography and Text (2)**
27. **`stroke-prop-type.php`** - Text stroke properties
28. **`url-prop-type.php`** - URL values

#### **Interactive Elements (2)**
29. **`link-prop-type.php`** - Link properties
30. **`classes-prop-type.php`** - CSS class assignments

#### **Advanced Effects (4)**
31. **`transition-prop-type.php`** - CSS transitions
32. **`filters/filter-prop-type.php`** - CSS filters
33. **`filters/backdrop-filter-prop-type.php`** - Backdrop filters
34. **`filters/css-filter-func-prop-type.php`** - CSS filter functions

#### **Transform Effects (8)**
35. **`transform/perspective-prop-type.php`** - 3D perspective
36. **`transform/perspective-origin-prop-type.php`** - Perspective origin
37. **`transform/rotate-prop-type.php`** - Rotation transforms
38. **`transform/scale-prop-type.php`** - Scale transforms
39. **`transform/skew-prop-type.php`** - Skew transforms
40. **`transform/transform-origin-prop-type.php`** - Transform origin
41. **`transform/transform-prop-type.php`** - Transform combinations
42. **`transform/translate-prop-type.php`** - Translation transforms

#### **Utility Types (3)**
43. **`union-prop-type.php`** - Union of multiple prop types
44. **`key-value-prop-type.php`** - Key-value pairs
45. **`attributes-prop-type.php`** - HTML attributes

#### **Query and Dynamic (2)**
46. **`query-prop-type.php`** - Query properties
47. **`dynamic-tags/dynamic-prop-type.php`** - Dynamic content

---

## 🎯 **CSS CONVERTER IMPLEMENTATION STATUS**

### **✅ CORRECTLY IMPLEMENTED (15/47)**
1. **`opacity-property-mapper.php`** ✅ 
   - **Status**: ATOMIC COMPLIANT
   - **Uses**: `Size_Prop_Type::make()->units(Size_Constants::opacity())->generate()`
   - **Implementation**: CORRECT - Uses atomic prop type directly

2. **`box-shadow-property-mapper.php`** ✅
   - **Status**: ATOMIC COMPLIANT  
   - **Uses**: `Box_Shadow_Prop_Type::make()` and `Shadow_Prop_Type::make()`
   - **Implementation**: CORRECT - Uses atomic prop types directly

3. **`color-property-mapper.php`** ✅
   - **Status**: **FIXED** - ATOMIC COMPLIANT
   - **Uses**: `Color_Prop_Type::make()->generate($color_value)`
   - **Implementation**: CORRECT - Pure atomic prop type return

4. **`background-color-property-mapper.php`** ✅
   - **Status**: **FIXED** - ATOMIC COMPLIANT
   - **Uses**: `Color_Prop_Type::make()->generate($color_value)`
   - **Implementation**: CORRECT - Pure atomic prop type return

5. **`font-size-property-mapper.php`** ✅
   - **Status**: **FIXED** - ATOMIC COMPLIANT
   - **Uses**: `Size_Prop_Type::make()->units(Size_Constants::typography())->generate($size_data)`
   - **Implementation**: CORRECT - Pure atomic prop type return

6. **`margin-property-mapper.php`** ✅
   - **Status**: **FIXED** - ATOMIC COMPLIANT
   - **Uses**: `Dimensions_Prop_Type::make()->generate($dimensions_data)`
   - **Implementation**: CORRECT - Pure atomic prop type return

7. **`atomic-padding-property-mapper.php`** ✅
   - **Status**: **FIXED** - ATOMIC COMPLIANT
   - **Uses**: `Dimensions_Prop_Type::make()->generate($dimensions_data)`
   - **Implementation**: CORRECT - Removed fallbacks, pure atomic prop type return

8. **`border-radius-property-mapper.php`** ✅
   - **Status**: **FIXED** - ATOMIC COMPLIANT
   - **Uses**: `Border_Radius_Prop_Type::make()->generate($border_radius_data)`
   - **Implementation**: CORRECT - Removed fallbacks, pure atomic prop type return

9. **`padding-property-mapper.php`** ✅
   - **Status**: **FIXED** - ATOMIC COMPLIANT
   - **Uses**: `Dimensions_Prop_Type::make()->generate($dimensions_data)`
   - **Implementation**: CORRECT - Removed fallbacks, pure atomic prop type return

10. **`width-property-mapper.php`** ✅
    - **Status**: **FIXED** - ATOMIC COMPLIANT
    - **Uses**: `Size_Prop_Type::make()->generate($size_data)`
    - **Implementation**: CORRECT - Removed fallbacks, pure atomic prop type return

11. **`height-property-mapper.php`** ✅
    - **Status**: **NEW** - ATOMIC COMPLIANT
    - **Uses**: `Size_Prop_Type::make()->generate($size_data)`
    - **Implementation**: CORRECT - Pure atomic prop type return
    - **Properties**: `height`, `min-height`, `max-height`

12. **`display-property-mapper.php`** ✅
    - **Status**: **NEW** - ATOMIC COMPLIANT
    - **Uses**: `String_Prop_Type::make()->enum($allowed_values)->generate($display_value)`
    - **Implementation**: CORRECT - Pure atomic prop type return with enum validation
    - **Properties**: `display`

13. **`position-property-mapper.php`** ✅
    - **Status**: **NEW** - ATOMIC COMPLIANT
    - **Uses**: `String_Prop_Type::make()->enum($allowed_values)->generate($position_value)`
    - **Implementation**: CORRECT - Pure atomic prop type return with enum validation
    - **Properties**: `position`

14. **`flex-direction-property-mapper.php`** ✅
    - **Status**: **NEW** - ATOMIC COMPLIANT
    - **Uses**: `String_Prop_Type::make()->enum($allowed_values)->generate($flex_direction_value)`
    - **Implementation**: CORRECT - Pure atomic prop type return with enum validation
    - **Properties**: `flex-direction`

15. **`text-align-property-mapper.php`** ✅
    - **Status**: **NEW** - ATOMIC COMPLIANT
    - **Uses**: `String_Prop_Type::make()->enum($allowed_values)->generate($text_align_value)`
    - **Implementation**: CORRECT - Pure atomic prop type return with enum validation and CSS value mapping
    - **Properties**: `text-align`

### **❌ VIOLATIONS FIXED (0/47)**
🎉 **ALL VIOLATIONS HAVE BEEN FIXED** - 100% atomic widget compliance achieved for implemented properties!

### **❌ NOT IMPLEMENTED (32/47)**

#### **High Priority - Common CSS Properties**
16. **`font-weight`** - **CREATE** using `String_Prop_Type` with enum
17. **`text-decoration`** - **CREATE** using `String_Prop_Type`
18. **`border-width`** - **CREATE** using `Border_Width_Prop_Type`
19. **`border-color`** - **CREATE** using `Color_Prop_Type`
20. **`border-style`** - **CREATE** using `String_Prop_Type` with enum

#### **Medium Priority - Layout Properties**
21. **`max-width`** - **CREATE** using `Size_Prop_Type`
22. **`min-width`** - **CREATE** using `Size_Prop_Type`
23. **`max-height`** - **CREATE** using `Size_Prop_Type`
24. **`min-height`** - **CREATE** using `Size_Prop_Type`
25. **`top`** - **CREATE** using `Size_Prop_Type`
26. **`right`** - **CREATE** using `Size_Prop_Type`
27. **`bottom`** - **CREATE** using `Size_Prop_Type`
28. **`left`** - **CREATE** using `Size_Prop_Type`
29. **`z-index`** - **CREATE** using `Number_Prop_Type`

#### **Medium Priority - Typography Properties**
30. **`line-height`** - **CREATE** using `Size_Prop_Type`
31. **`letter-spacing`** - **CREATE** using `Size_Prop_Type`
32. **`word-spacing`** - **CREATE** using `Size_Prop_Type`
33. **`font-style`** - **CREATE** using `String_Prop_Type` with enum
34. **`text-transform`** - **CREATE** using `String_Prop_Type` with enum

#### **Lower Priority - Advanced Properties**
35. **`transform`** - **CREATE** using `Transform_Prop_Type`
36. **`transition`** - **CREATE** using `Transition_Prop_Type`
37. **`filter`** - **CREATE** using `Filter_Prop_Type`
38. **`backdrop-filter`** - **CREATE** using `Backdrop_Filter_Prop_Type`
39. **`background`** - **CREATE** using `Background_Prop_Type`
40. **`flex`** - **CREATE** using `Flex_Prop_Type`
41. **`gap`** - **CREATE** using `Size_Prop_Type` or `Layout_Direction_Prop_Type`
42. **`flex-wrap`** - **CREATE** using `String_Prop_Type` with enum
43. **`justify-content`** - **CREATE** using `String_Prop_Type` with enum
44. **`align-items`** - **CREATE** using `String_Prop_Type` with enum
45. **`overflow`** - **CREATE** using `String_Prop_Type` with enum
46. **`cursor`** - **CREATE** using `String_Prop_Type` with enum
47. **`visibility`** - **CREATE** using `String_Prop_Type` with enum

---

## 🚨 **CRITICAL IMPLEMENTATION RULES**

### **✅ CORRECT ATOMIC PATTERN**
```php
public function map_to_v4_atomic( string $property, $value ): ?array {
    $parsed_data = $this->parse_css_value( $value );
    if ( null === $parsed_data ) {
        return null;
    }
    
    // ONLY atomic widgets create JSON
    return Size_Prop_Type::make()
        ->units( Size_Constants::typography() )
        ->generate( $parsed_data );
}
```

### **❌ FORBIDDEN PATTERNS**
```php
// ❌ NEVER DO THIS - Manual JSON creation
return [
    'property' => $property,
    'value' => $atomic_value
];

// ❌ NEVER DO THIS - Base class methods
return $this->create_v4_property_with_type( $property, 'size', $data );

// ❌ NEVER DO THIS - Fallback logic
if ( $atomic_fails ) {
    return $this->fallback_method();
}
```

---

## 📋 **ACTION PLAN**

### **Phase 1: Fix Existing Violations (8 mappers)**
1. **FIX** 4 mappers with manual JSON creation
2. **REMOVE FALLBACKS** from 4 mappers with fallback logic

### **Phase 2: Implement High Priority (10 mappers)**
3. **CREATE** height, display, position, flex-direction, text-align, font-weight, text-decoration, border-width, border-color, border-style

### **Phase 3: Implement Medium Priority (15 mappers)**
4. **CREATE** remaining layout and typography properties

### **Phase 4: Implement Advanced Properties (14 mappers)**
5. **CREATE** transform, transition, filter, and other advanced properties

### **Target: 47/47 Properties with 100% Atomic Compliance**

---

## 🎯 **SUCCESS CRITERIA**

- ✅ **Zero manual JSON creation** - All JSON from atomic prop types
- ✅ **Zero fallback mechanisms** - Pure atomic widget compliance
- ✅ **Zero base class method usage** - Only atomic prop type methods
- ✅ **100% prop type coverage** - All CSS properties use appropriate atomic prop types
- ✅ **Validation compliance** - All generated JSON passes atomic widget validation
