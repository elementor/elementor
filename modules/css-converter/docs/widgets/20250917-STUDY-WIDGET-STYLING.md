# Elementor v4 Atomic Widget Styling - PRD

## 1. Analysis of Current v4 Styling Schema

### 1.1 Actual Elementor v4 Structure (from user's demo):

```json
{
  "id": "f2eca9c",
  "elType": "e-flexbox",
  "settings": {
    "classes": {
      "$$type": "classes",
      "value": ["e-f2eca9c-f0ff5e0"]
    }
  },
  "elements": [
    {
      "id": "12a169d",
      "elType": "widget",
      "widgetType": "e-heading",
      "settings": {
        "classes": {
          "$$type": "classes", 
          "value": ["e-12a169d-a2712b7"]
        }
      },
      "styles": {
        "e-12a169d-a2712b7": {
          "id": "e-12a169d-a2712b7",
          "label": "local",
          "type": "class",
          "variants": [
            {
              "meta": {
                "breakpoint": "desktop",
                "state": null
              },
              "props": {
                "font-weight": {"$$type": "string", "value": "700"},
                "color": {"$$type": "color", "value": "#5f669c"},
                "text-align": {"$$type": "string", "value": "justify"},
                "border-width": {"$$type": "size", "value": {"size": 5, "unit": "px"}},
                "border-color": {"$$type": "color", "value": "#5c3f3f"},
                "border-style": {"$$type": "string", "value": "ridge"}
              }
            }
          ]
        }
      }
    }
  ],
  "styles": {
    "e-f2eca9c-f0ff5e0": {
      "id": "e-f2eca9c-f0ff5e0", 
      "label": "local",
      "type": "class",
      "variants": [
        {
          "meta": {
            "breakpoint": "desktop",
            "state": null
          },
          "props": {
            "width": {"$$type": "size", "value": {"size": 600, "unit": "px"}},
            "padding": {"$$type": "dimensions", "value": {
              "block-start": {"$$type": "size", "value": {"size": 100, "unit": "px"}},
              "block-end": {"$$type": "size", "value": {"size": 100, "unit": "px"}},
              "inline-start": {"$$type": "size", "value": {"size": 20, "unit": "px"}},
              "inline-end": {"$$type": "size", "value": {"size": 5, "unit": "px"}}
            }},
            "background": {"$$type": "background", "value": {
              "color": {"$$type": "color", "value": "#d03737"}
            }}
          }
        }
      ]
    }
  }
}
```

### 1.2 Current Widget Converter Output (INCORRECT):

Our system currently generates:
```json
{
  "id": "widget-id",
  "elType": "widget", 
  "widgetType": "e-heading",
  "settings": {
    "tag": {"$$type": "string", "value": "h1"}
  },
  "styles": []  // Empty - not implementing v4 styling
}
```

## 2. Problem Statement

### 2.1 Critical Issues:
1. **Empty styles array** - We're not converting CSS to v4 atomic styles
2. **Missing class generation** - No unique class IDs generated for styling
3. **v3 style mapping** - Hierarchy processor uses v3 attribute names
4. **No breakpoint support** - Missing responsive styling variants
5. **Incorrect prop types** - Not using proper `$$type` wrappers

### 2.2 Impact:
- Converted widgets have no styling applied
- CSS styles are completely lost in conversion
- Widgets appear unstyled in Elementor editor
- No responsive behavior

## 3. Requirements

### 3.1 Functional Requirements:

#### FR1: v4 Atomic Style Generation
- Convert CSS properties to v4 atomic style objects
- Generate unique class IDs for each styled widget
- Support all major CSS properties (color, typography, spacing, borders, background)

#### FR2: Proper Type Wrappers
- Use `$$type` wrappers for all style values:
  - `string` for text values
  - `color` for color values  
  - `size` for dimensional values with units
  - `dimensions` for spacing (padding/margin)
  - `background` for background properties

#### FR3: Breakpoint Support
// HVV: Later, see future.md.
- Generate desktop variants by default
- Support for responsive breakpoints (mobile, tablet, desktop)
- Proper meta structure with breakpoint and state

#### FR4: Class Management
- Generate unique class IDs (e.g., `e-{widget-id}-{hash}`)
- Add classes to widget settings
- Create style objects in styles array

#### FR5: CSS Property Mapping
- Map CSS properties to v4 atomic properties:
  - `color` → `color`
  - `font-size` → `font-size` 
  - `font-weight` → `font-weight`
  - `text-align` → `text-align`
  - `padding` → `padding` (dimensions)
  - `margin` → `margin` (dimensions)
  - `background-color` → `background.color`
  - `border-*` → `border-*`

### 3.2 Technical Requirements:

#### TR1: Remove v3 Style Mapping
- Remove `apply_parent_styles()` and `apply_child_styles()` v3 mappings
- Move styling logic to Widget Creator's `convert_styles_to_v4_format()`

#### TR2: Implement v4 Style Converter
- Create proper v4 atomic style objects
- Generate unique class IDs
- Handle CSS specificity and inheritance

#### TR3: Update Widget Structure
- Ensure `settings.classes` contains generated class IDs
- Populate `styles` object with atomic style definitions
- Maintain proper widget hierarchy

## 4. Implementation Plan

### 4.1 Phase 1: Remove v3 Style Mappings
**Duration**: 1 day
**Files**: `widget-hierarchy-processor.php`

- Remove v3 style attribute mappings from `apply_parent_styles()`
- Remove v3 style attribute mappings from `apply_child_styles()`
- Keep only settings/content processing, move styling to Widget Creator

### 4.2 Phase 2: Implement v4 Style Converter
**Duration**: 3 days  
**Files**: `widget-creator.php`

- Implement `convert_styles_to_v4_format()` method
- Create `generate_unique_class_id()` method
- Create `map_css_to_v4_props()` method
- Create `create_v4_style_object()` method

### 4.3 Phase 3: CSS Property Mapping
**Duration**: 2 days
**Files**: `widget-creator.php`

- Map color properties to v4 color type
- Map size properties to v4 size type  
- Map spacing properties to v4 dimensions type
- Map background properties to v4 background type

### 4.4 Phase 4: Integration & Testing
**Duration**: 2 days
**Files**: Multiple

- Update widget settings to include generated classes
- Test with inline CSS, ID selectors, class selectors
- Verify output matches Elementor v4 schema

## 5. Test Cases

### 5.1 Test Case 1: Inline CSS Only
**Input**:
```html
<div style="color: red; font-size: 24px; padding: 20px;">
  <h1 style="color: blue; font-weight: bold;">Heading</h1>
</div>
```

**Expected Output**:
- e-flexbox with generated class ID
- Styles object with color, padding properties
- e-heading with generated class ID  
- Styles object with color, font-weight properties

### 5.2 Test Case 2: CSS with Element ID
**Input**:
```html
<style>
#container { background: #f0f0f0; margin: 10px; }
#title { text-align: center; border: 1px solid #ccc; }
</style>
<div id="container">
  <h1 id="title">Title</h1>
</div>
```

**Expected Output**:
- Proper CSS specificity handling
- ID selector styles converted to v4 format
- Unique class generation for each element

### 5.3 Test Case 3: CSS with Classes
**Input**:
```html
<style>
.container { display: flex; gap: 20px; }
.heading { font-family: Arial; line-height: 1.5; }
</style>
<div class="container">
  <h1 class="heading">Title</h1>
</div>
```

**Expected Output**:
- Class selector styles converted to v4 format
- Flexbox properties mapped correctly
- Typography properties with proper types

## 6. Success Criteria

### 6.1 Functional Success:
- ✅ CSS styles are preserved in conversion
- ✅ Widgets display correctly in Elementor editor
- ✅ Generated JSON matches v4 atomic schema
- ✅ All test cases pass

### 6.2 Technical Success:
- ✅ No v3 style mappings remain
- ✅ Proper `$$type` wrappers used
- ✅ Unique class IDs generated
- ✅ Styles array properly populated

## 7. API Test Bodies

### 7.1 Step 1: Inline CSS Only
```json
{
  "type": "html",
  "content": "<div style=\"color: #2b9fa5; padding: 20px 10px; background-color: #f0f0f0;\"><h1 style=\"color: #5f669c; font-weight: 700; text-align: center; border: 2px solid #ccc;\">Styled Heading</h1><p style=\"font-size: 16px; line-height: 1.5; margin: 10px 0;\">Styled paragraph text.</p></div>",
  "options": {
    "createGlobalClasses": false,
    "timeout": 30
  }
}
```

### 7.2 Step 2: CSS with Element IDs
```json
{
  "type": "html", 
  "content": "<style>#container { background: #d03737; padding: 100px 20px; width: 600px; margin: 10px; } #heading { color: #5f669c; font-weight: 700; text-align: justify; border: 5px ridge #5c3f3f; }</style><div id=\"container\"><h1 id=\"heading\">ID Styled Heading</h1></div>",
  "options": {
    "createGlobalClasses": false,
    "timeout": 30
  }
}
```

### 7.3 Step 3: CSS with Classes
```json
{
  "type": "html",
  "content": "<style>.flex-container { display: flex; flex-direction: column; gap: 15px; padding: 25px; background: linear-gradient(45deg, #ff6b6b, #4ecdc4); } .styled-heading { color: white; font-size: 28px; font-weight: bold; text-shadow: 2px 2px 4px rgba(0,0,0,0.3); } .styled-text { color: #333; font-size: 18px; line-height: 1.6; }</style><div class=\"flex-container\"><h1 class=\"styled-heading\">Class Styled Heading</h1><p class=\"styled-text\">This paragraph uses class-based styling.</p></div>",
  "options": {
    "createGlobalClasses": true,
    "timeout": 30
  }
}
```

## 8. Code Reuse & Architecture Analysis

### 8.1 Current Architecture Overview

The CSS Converter module has two parallel styling systems:

#### **Class Conversion System** (Existing):
```
CSS → Class_Conversion_Service → Property_Mapper_Registry → Individual_Property_Mappers → Global_Classes
```

#### **Widget Conversion System** (New):
```
CSS → Widget_Creator → convert_styles_to_v4_format() → v4_atomic_styles → Widget_Styles_Array
```

### 8.2 Shared Components Analysis

#### **✅ Currently Shared:**
1. **CSS Parser** (`CssParser`) - Used by both systems
2. **CSS Specificity Calculator** - Used by both systems  
3. **Variable Conversion Service** - Used by both systems
4. **Global Classes Repository** - Used by both systems

#### **❌ Currently Duplicated:**
1. **CSS Property Parsing** - Both systems parse CSS values independently
2. **Type Conversion Logic** - Both convert to `$$type` wrappers
3. **Value Validation** - Both validate CSS values (colors, sizes, etc.)
4. **CSS Property Support Detection** - Both determine which properties are supported

### 8.3 Property Mapper System Deep Dive

The existing **37 Property Mappers** provide:

```php
interface Class_Property_Mapper_Interface {
    public function supports( string $property, $value ): bool;
    public function map_to_schema( string $property, $value ): array;
    public function get_supported_properties(): array;
}
```

**Examples of Existing Mappers:**
- `Color_Property_Mapper` - Handles color validation and `$$type: color` conversion
- `Dimension_Property_Mapper` - Handles width/height with `$$type: size` conversion  
- `Margin_Property_Mapper` - Handles spacing with `$$type: dimensions` conversion
- `Background_Property_Mapper` - Handles background with `$$type: background` conversion

### 8.4 Code Duplication Problem

**Current Widget Implementation** (Duplicated):
```php
// Widget Creator - DUPLICATED LOGIC
private function convert_css_property_to_v4( $property, $value ) {
    switch ( $property ) {
        case 'color':
            return ['property' => 'color', 'value' => ['$$type' => 'color', 'value' => $value]];
        case 'font-size':
            $parsed = $this->parse_css_size_value( $value );
            return ['property' => 'font-size', 'value' => ['$$type' => 'size', 'value' => $parsed]];
        // ... 15+ more cases
    }
}
```

**Existing Class System** (Original):
```php
// Color_Property_Mapper - ORIGINAL LOGIC
public function map_to_schema( string $property, $value ): array {
    return ['color' => ['$$type' => 'color', 'value' => $this->normalize_color_value( $value )]];
}
```

### 8.5 Recommended Architecture: Unified Property Mapping

#### **8.5.1 Proposed Solution: Extend Property Mappers**

Create a **unified property mapping system** that serves both Class and Widget conversion:

```php
interface Unified_Property_Mapper_Interface extends Class_Property_Mapper_Interface {
    // Existing methods for Class conversion
    public function supports( string $property, $value ): bool;
    public function map_to_schema( string $property, $value ): array;
    public function get_supported_properties(): array;
    
    // New methods for Widget v4 conversion
    public function map_to_v4_atomic( string $property, $value ): array;
    public function get_v4_property_name( string $css_property ): string;
}
```

#### **8.5.2 Implementation Strategy**

**Phase 1: Extend Existing Mappers**
```php
class Color_Property_Mapper implements Unified_Property_Mapper_Interface {
    // Existing Class conversion method
    public function map_to_schema( string $property, $value ): array {
        return ['color' => ['$$type' => 'color', 'value' => $this->normalize_color_value( $value )]];
    }
    
    // New Widget v4 conversion method  
    public function map_to_v4_atomic( string $property, $value ): array {
        return [
            'property' => $this->get_v4_property_name( $property ),
            'value' => ['$$type' => 'color', 'value' => $this->normalize_color_value( $value )],
        ];
    }
    
    public function get_v4_property_name( string $css_property ): string {
        return $css_property; // color → color
    }
}
```

**Phase 2: Update Widget Creator**
```php
class Widget_Creator {
    private $property_mapper_registry;
    
    public function __construct() {
        $this->property_mapper_registry = Class_Property_Mapper_Factory::get_registry();
    }
    
    private function convert_css_property_to_v4( $property, $value ) {
        $mapper = $this->property_mapper_registry->resolve( $property, $value );
        
        if ( $mapper && method_exists( $mapper, 'map_to_v4_atomic' ) ) {
            return $mapper->map_to_v4_atomic( $property, $value );
        }
        
        // Fallback for unsupported properties
        return null;
    }
}
```

### 8.6 Benefits of Unified Architecture

#### **✅ Advantages:**
1. **Single Source of Truth** - One place for CSS property validation and conversion
2. **Consistency** - Both systems use identical parsing logic
3. **Maintainability** - Updates to CSS support benefit both systems
4. **Extensibility** - New property mappers automatically work for both
5. **Code Reduction** - Eliminate ~200 lines of duplicated parsing logic
6. **Testing** - Single test suite covers both conversion paths

#### **⚠️ Considerations:**
1. **Backward Compatibility** - Must not break existing Class conversion
2. **Interface Changes** - Requires extending existing mapper interfaces
3. **Migration Effort** - Need to update all 37 existing mappers
4. **Performance** - Minimal impact (same logic, different interface)

### 8.7 Alternative Approaches

#### **Option A: Shared Utility Service** (Simpler)
```php
class Css_Property_Converter_Service {
    public function convert_to_class_format( $property, $value ): array;
    public function convert_to_v4_format( $property, $value ): array;
    public function validate_property( $property, $value ): bool;
}
```

#### **Option B: Adapter Pattern** (Current + Wrapper)
```php
class Property_Mapper_V4_Adapter {
    public function __construct( Class_Property_Mapper_Interface $mapper );
    public function convert_to_v4_atomic( $property, $value ): array;
}
```

#### **Option C: Unified Mappers** (Recommended)
- Extend existing mappers with v4 methods
- Single registry serves both systems
- Maximum code reuse with minimal changes

### 8.8 Implementation Recommendation

**Recommended: Option C - Unified Mappers**

**Rationale:**
- **Minimal Breaking Changes** - Extends existing interfaces
- **Maximum Code Reuse** - Leverages all existing validation logic
- **Future-Proof** - Single system for all CSS property handling
- **Performance** - No additional abstraction layers

**Implementation Order:**
1. **Phase 1**: Extend `Class_Property_Mapper_Interface` with v4 methods
2. **Phase 2**: Update 5-10 core mappers (color, size, spacing, background)
3. **Phase 3**: Replace Widget Creator's custom conversion logic
4. **Phase 4**: Update remaining 27 mappers incrementally
5. **Phase 5**: Add comprehensive tests for unified system

This approach eliminates code duplication while maintaining backward compatibility and leveraging the existing, battle-tested property mapping system.

## 9. Next Steps

1. **Immediate**: Remove v3 style mappings from hierarchy processor
2. **Priority**: Implement unified property mapper system
3. **Integration**: Replace Widget Creator's custom CSS conversion with property mappers
4. **Testing**: Validate with provided test cases
5. **Documentation**: Update API documentation with v4 styling support