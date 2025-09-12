Class Converter

Please study this project:
plugins/elementor/modules/css-converter

Study, report, research, compare, analyse, evaluate.
Ask as many questions as possible.
All reporting should be done in this document.
This document will become a PRD.


Previously:
We have focused on converting CSS Variables to Editor Variables.

Next:
Now we would like to continue with the next step: converting CSS to Elementor V4 Global Classes [plugins/elementor/modules/global-classes].
Study this the global classes module.

Example:
e.g.
.myClass {
        background-color: #eeeeee;
        font-size: 12px;
        --my-variable: 3;
        line-height: var(--my-variable);
}

Goal:
We can import this into the Global Classes.

Check:
Study this folder as well: /css-converter.
This might contains some notes and code relevant for the class converter.
Only if relevant.
Close to our /modules/css-converter if relevant.

Scenarios:
- List as many scenarios as possible
- Think of aspects like:
-- Breakpoints
-- Importing classes with the same name (with same or different content)
-- CSS variables (in :root and outside :root)
- Think of as many challenges as possible

---

## RESEARCH FINDINGS

### Current Architecture Analysis

#### 1. CSS Variable Conversion System (Current)
The existing system successfully converts CSS custom properties (CSS variables) to Elementor Global Variables:

**Key Components:**
- **CSS Parser**: Uses Sabberworm CSS parser to extract variables from `:root` and `html` selectors
- **Variable Convertors**: Pluggable system with interface-based convertors for different types:
  - `Color_Hex_Variable_Convertor` - Handles #RGB, #RRGGBB, #RRGGBBAA formats
  - `Color_RGB_Variable_Convertor` - Handles rgb() and rgba() functions
  - `Length_Size_Viewport_Variable_Convertor` - Handles px, em, rem, vh, vw units
  - `Percentage_Variable_Convertor` - Handles % values
- **Conversion Service**: Orchestrates conversion through registry pattern
- **REST API**: Endpoint at `/wp-json/elementor/v2/css-converter/variables`

**Data Flow:**
```
CSS String → ParsedCss → extract_variables() → Variable_Conversion_Service → Convertor Registry → Global Variables
```

**Variable Output Format:**
```php
[
    'id' => 'e-gv-color-hex-primary-variable', // Generated with type prefix
    'type' => 'color-hex',
    'value' => '#eeeeee', // Normalized value
    'source' => 'css-variable',
    'name' => '--primary'
]
```

#### 2. Global Classes System (Target)
The Global Classes system provides a framework for reusable CSS classes in Elementor V4:

**Key Components:**
- **Global_Classes_Repository**: Stores classes in Kit metadata (`_elementor_global_classes`)
- **Global_Classes_Parser**: Validates class structure using Atomic Widgets Style Schema
- **Global_Classes_REST_API**: Manages CRUD operations at `/wp-json/elementor/v1/global-classes`
- **Atomic_Global_Styles**: Renders classes to CSS
- **Usage Tracking**: Monitors where classes are applied

**Global Class Data Structure:**
```php
[
    'items' => [
        'class-id' => [
            'id' => 'class-id',
            'type' => 'class',
            'label' => 'My Custom Class',
            'variants' => [
                'desktop' => [ /* style properties */ ],
                'tablet' => [ /* responsive overrides */ ],
                'mobile' => [ /* mobile overrides */ ]
            ]
        ]
    ],
    'order' => ['class-id-1', 'class-id-2'] // Display order
]
```

**Style Properties Schema**: Uses Atomic Widgets Style Schema for validation (typography, spacing, colors, etc.)

### Gap Analysis: CSS Classes → Global Classes

#### Current Limitations:
1. **Scope Restriction**: Current parser only extracts from `:root`/`html` selectors
2. **Single Property Focus**: Only handles CSS custom properties, not full CSS rules
3. **No Class Selector Support**: Cannot parse `.className { ... }` rules
4. **No Responsive Handling**: No breakpoint detection or media query parsing
5. **Limited Property Types**: Only converts specific variable types

#### Required Enhancements for Class Conversion:

**1. Enhanced CSS Parsing**
- Extend parser to extract class selectors (`.className`)
- Parse complete CSS rule blocks, not just variables
- Handle media queries for responsive variants
- Support pseudo-selectors and combinators

**2. Property Mapping System**
- Map CSS properties to Atomic Widgets Style Schema
- Handle CSS shorthand properties (e.g., `margin: 10px` → individual properties)
- Convert CSS units and values to schema-compliant format
- Support CSS functions (calc(), var(), etc.)

**3. Class Conversion Pipeline**
```
CSS String → ParsedCss → extract_classes() → Class_Conversion_Service → Property Mappers → Global Classes Format
```

### Technical Challenges Identified

#### 1. Breakpoint Detection & Responsive Handling
**Challenge**: CSS media queries need to map to Elementor's breakpoint system

**Scenarios:**
- `@media (max-width: 768px)` → `tablet` variant
- `@media (max-width: 480px)` → `mobile` variant  
- Custom breakpoints vs Elementor's predefined breakpoints
- Min-width vs max-width media queries

**Solution Approach**: Create breakpoint resolver that maps CSS media queries to Elementor variants

#### 2. CSS Property → Schema Mapping
**Challenge**: Map arbitrary CSS properties to Atomic Widgets Style Schema

**Complex Cases:**
- CSS shorthand: `margin: 10px 20px` → `margin-top: 10px, margin-right: 20px, etc.`
- Vendor prefixes: `-webkit-transform`, `-moz-transform`
- CSS functions: `calc(100% - 20px)`, `var(--custom)`
- Unsupported properties: Custom CSS that doesn't map to schema

#### 3. Class Name Conflicts & Deduplication
**Challenge**: Handle duplicate class names with same or different styles

**Scenarios:**
```css
/* Scenario 1: Same name, same styles */
.button { color: red; font-size: 16px; }
.button { color: red; font-size: 16px; } /* Duplicate - merge */

/* Scenario 2: Same name, different styles */  
.button { color: red; }
.button { color: blue; } /* Conflict - how to handle? */

/* Scenario 3: Incremental styles */
.button { color: red; }
.button { font-size: 16px; } /* Additive - merge properties */
```

**Solution Approaches:**
- **Merge Strategy**: Combine non-conflicting properties
- **Conflict Resolution**: Last-wins, user prompt, or rename variants
- **Deduplication**: Hash-based duplicate detection

#### 4. CSS Variable Integration
**Challenge**: Handle CSS variables within class rules

**Example:**
```css
.myClass {
    background-color: #eeeeee;
    font-size: 12px;
    --my-variable: 3;
    line-height: var(--my-variable);
}
```

**Requirements:**
- Extract and convert inline CSS variables (--my-variable: 3)
- Resolve var() references within the same class
- Handle references to external variables (from :root)
- Maintain variable relationships in Global Classes

#### 5. Selector Complexity
**Challenge**: Handle complex CSS selectors

**Scenarios:**
```css
/* Simple class - SUPPORTED */
.button { color: red; }

/* Pseudo-selectors - COMPLEX */
.button:hover { color: blue; }
.button::before { content: ""; }

/* Combinators - COMPLEX */
.container .button { margin: 10px; }
.button + .button { margin-left: 5px; }

/* Attribute selectors - COMPLEX */
.button[disabled] { opacity: 0.5; }
```

**Solution Strategy**: 
- Phase 1: Simple class selectors only
- Phase 2: Basic pseudo-selectors (:hover, :focus)
- Future: Complex selectors with fallback to HTML widget

#### 6. CSS Specificity & Cascading
**Challenge**: CSS cascade rules don't directly apply to Global Classes

**Issues:**
- CSS specificity (inline > IDs > classes > elements)
- Source order importance
- `!important` declarations
- Inheritance behavior

**Approach**: Document conversion behavior and limitations

### Proposed Architecture

#### 1. Extended Parser
```php
class Enhanced_Css_Parser extends CssParser {
    public function extract_classes(ParsedCss $parsed): array;
    public function extract_media_queries(ParsedCss $parsed): array;
    private function resolve_breakpoints(array $media_queries): array;
}
```

#### 2. Class Conversion Service
```php
class Class_Conversion_Service {
    public function convert_css_to_global_classes(string $css): array;
    private function merge_duplicate_classes(array $classes): array;
    private function resolve_css_variables(array $classes): array;
}
```

#### 3. Property Mappers (Similar to Variable Convertors)
```php
interface Property_Mapper_Interface {
    public function supports(string $property, string $value): bool;
    public function map(string $property, string $value): array;
}

class Color_Property_Mapper implements Property_Mapper_Interface;
class Typography_Property_Mapper implements Property_Mapper_Interface;
class Spacing_Property_Mapper implements Property_Mapper_Interface;
```

#### 4. Responsive Variant Handler
```php
class Breakpoint_Resolver {
    public function resolve_media_query_to_variant(string $media_query): ?string;
    private function parse_breakpoint_values(string $media_query): array;
}
```

### Implementation Roadmap

#### Phase 1: Basic Class Extraction (MVP)
- Extend parser to extract simple `.className` selectors
- Create basic property mappers for color, background, typography
- Implement class merging for duplicates
- Support desktop variant only (no responsive)
- Handle CSS variables within classes

#### Phase 2: Responsive Support  
- Add media query parsing
- Implement breakpoint resolution to variants
- Support tablet/mobile variants
- Handle responsive CSS variable references

#### Phase 3: Advanced Features
- Pseudo-selector support (:hover, :focus)
- Complex property mappings (flexbox, grid)
- CSS function resolution (calc(), etc.)
- Import/export integration

#### Phase 4: Integration & UI
- Editor integration for class import
- Conflict resolution UI
- Bulk import tools
- Performance optimization

### Questions for Consideration

1. **Property Support Scope**: Which CSS properties should be supported in MVP? (colors, typography, spacing vs full CSS spec)

2. **Breakpoint Mapping**: How should custom CSS breakpoints map to Elementor's system? Should we support custom breakpoints?

3. **Conflict Resolution Strategy**: When duplicate class names have different styles, should we:
   - Auto-rename variants (.button-1, .button-2)
   - Merge conflicting properties (last wins)
   - Prompt user for resolution
   - Skip conflicting classes

4. **CSS Variable Handling**: Should CSS variables within classes be:
   - Converted to Global Variables and referenced
   - Resolved to literal values
   - Kept as CSS variables in the generated classes

5. **Unsupported Properties**: For CSS properties that don't map to Atomic Schema:
   - Skip the property (partial conversion)
   - Skip the entire class
   - Fallback to HTML widget with raw CSS

6. **Performance Considerations**: For large CSS files:
   - Streaming parser for memory efficiency
   - Batch processing limits
   - Progress indicators for UI

### Testing Scenarios

#### Basic Class Conversion
```css
.simple-class {
    color: #ff0000;
    background-color: #ffffff;
    font-size: 16px;
    margin: 10px;
}
```

#### CSS Variables in Classes
```css
.variable-class {
    --primary: #007cba;
    --spacing: 16px;
    color: var(--primary);
    margin: var(--spacing);
    background: #f0f0f0;
}
```

#### Responsive Classes  
```css
.responsive-class {
    font-size: 18px;
}

@media (max-width: 768px) {
    .responsive-class {
        font-size: 16px;
    }
}

@media (max-width: 480px) {
    .responsive-class {
        font-size: 14px;
    }
}
```

#### Duplicate Class Names
```css
/* File 1 */
.button {
    color: red;
    padding: 10px;
}

/* File 2 */  
.button {
    color: blue;
    margin: 5px;
}
```

#### Complex Property Mappings
```css
.complex-class {
    margin: 10px 20px 15px 25px; /* Shorthand */
    font: bold 16px/1.5 Arial, sans-serif; /* Font shorthand */
    background: url(image.jpg) no-repeat center/cover; /* Background shorthand */
    transform: translateX(50px) rotate(45deg); /* Transform functions */
}
```

### Style Schema Analysis

#### Supported Style Properties
Based on the Atomic Widgets Style Schema, the following CSS properties are supported for Global Classes conversion:

**Size & Layout:**
- `width`, `height`, `min-width`, `min-height`, `max-width`, `max-height`
- `overflow`, `aspect-ratio`, `object-fit`, `object-position`
- `display` (block, inline, flex, grid, etc.)
- `position`, `inset-block-start`, `inset-inline-end`, `z-index`

**Typography:**  
- `font-family`, `font-weight`, `font-size`, `font-style`
- `color`, `letter-spacing`, `word-spacing`, `line-height`
- `text-align`, `text-decoration`, `text-transform`, `direction`
- `stroke`, `cursor`

**Spacing:**
- `padding` (supports Dimensions_Prop_Type for individual sides)
- `margin` (supports Dimensions_Prop_Type for individual sides)

**Border:**
- `border-radius`, `border-width`, `border-color`, `border-style`

**Background:**
- `background` (complex prop type supporting images, gradients, overlays)

**Effects:**
- `box-shadow`, `opacity`, `filter`, `backdrop-filter`
- `transform`, `transition`

**Flexbox & Grid:**
- `flex-direction`, `flex-wrap`, `flex`, `gap`
- `justify-content`, `align-content`, `align-items`, `align-self`, `order`

#### Property Value Types & Validation

**Size Values:** Support for px, em, rem, vh, vw, % with Size_Prop_Type
**Color Values:** Hex, RGB, RGBA, HSL with Color_Prop_Type 
**Enum Values:** Predefined sets of valid string values
**Complex Types:** Background, Transform, Box_Shadow have specialized prop types
**Union Types:** Properties can accept multiple value types (e.g., size OR dimensions)

#### Variable Integration
The Variables module augments the schema to support Global Variable references:
- Color properties can use Color_Variable_Prop_Type 
- Font-family can use Font_Variable_Prop_Type
- All Union_Prop_Type fields are automatically extended to support variable references

### Property Mapping Challenges

#### 1. CSS Shorthand → Individual Properties
**Challenge:** CSS shorthand properties need to be expanded to individual schema properties

**Examples:**
```css
/* CSS Input */
.class {
    margin: 10px 20px 15px 25px;
    font: bold 16px/1.5 Arial;
    background: #fff url(img.jpg) no-repeat;
}

/* Required Schema Output */
{
    "margin": {
        "top": "10px",
        "right": "20px", 
        "bottom": "15px",
        "left": "25px"
    },
    "font-weight": "bold",
    "font-size": "16px",
    "line-height": "1.5",
    "font-family": "Arial",
    "background": {
        "color": "#fff",
        "image": "url(img.jpg)",
        "repeat": "no-repeat"
    }
}
```

#### 2. CSS Units → Schema Units
**Challenge:** Ensure CSS units are compatible with schema constraints

**Unit Mappings:**
- Typography: px, em, rem, %, vh, vw
- Spacing: px, em, rem, %, vh, vw
- Border: px, em, rem, %
- Opacity: % (default unit)

#### 3. Vendor Prefixes & Fallbacks
**Challenge:** Handle vendor prefixes and CSS fallbacks

**Strategy:**
- Strip vendor prefixes: `-webkit-transform` → `transform`
- Use last valid value from multiple fallback declarations
- Skip unsupported prefixed properties

#### 4. CSS Functions
**Challenge:** Handle CSS functions like calc(), var(), etc.

**Approaches:**
- `var(--variable)` → Resolve to Global Variable reference if available
- `calc()` → Pass through as string value (may need validation)
- `rgb()`, `hsl()` → Convert to hex if possible, or keep as-is

### Updated Implementation Strategy

#### Class Converter Architecture

```php
interface Class_Property_Mapper_Interface {
    public function supports(string $property, $value): bool;
    public function map_to_schema(string $property, $value): array;
    public function get_schema_properties(): array;
}

class Typography_Property_Mapper implements Class_Property_Mapper_Interface {
    // Maps font, font-family, font-size, etc. to schema
}

class Spacing_Property_Mapper implements Class_Property_Mapper_Interface {
    // Maps margin, padding shorthand to dimensions
}

class Color_Property_Mapper implements Class_Property_Mapper_Interface {
    // Maps color, background-color, border-color, etc.
}

class Layout_Property_Mapper implements Class_Property_Mapper_Interface {  
    // Maps display, flex, grid properties
}
```

#### Enhanced Conversion Pipeline

```php
class Class_Conversion_Service {
    public function convert_css_classes_to_global_classes(string $css): array {
        $parsed = $this->parser->parse($css);
        $classes = $this->extract_classes($parsed);
        
        return array_map([$this, 'convert_single_class'], $classes);
    }
    
    private function convert_single_class(array $css_class): array {
        $schema_properties = [];
        
        foreach ($css_class['properties'] as $property => $value) {
            $mapper = $this->property_mapper_registry->resolve($property, $value);
            
            if ($mapper) {
                $mapped = $mapper->map_to_schema($property, $value);
                $schema_properties = array_merge($schema_properties, $mapped);
            }
        }
        
        return [
            'id' => $this->generate_class_id($css_class['selector']),
            'type' => 'class',
            'label' => $this->generate_class_label($css_class['selector']),
            'variants' => [
                'desktop' => $schema_properties,
                // Responsive variants added by media query processor
            ]
        ];
    }
}
```

### Final Recommendations

#### MVP Scope (Phase 1)
**Focus on most common and straightforward CSS properties:**

1. **Basic Typography:** font-size, font-weight, color, text-align
2. **Simple Spacing:** margin, padding (individual values, not shorthand)  
3. **Colors:** color, background-color, border-color
4. **Basic Layout:** display, width, height
5. **Simple Border:** border-width, border-style, border-radius

**Skip in MVP:**
- CSS shorthand properties (implement expansion later)
- Complex background properties (gradients, images)
- Transform, filter, animation properties
- Pseudo-selectors
- Media queries (responsive variants)

#### Data Migration Considerations

**Global Classes Storage Format:**
```php
// Kit metadata: _elementor_global_classes
[
    'items' => [
        'button-primary-class' => [
            'id' => 'button-primary-class',
            'type' => 'class', 
            'label' => 'Primary Button',
            'variants' => [
                'desktop' => [
                    'font-size' => '16px',
                    'color' => '#ffffff',
                    'background' => ['color' => '#007cba'],
                    'padding' => ['top' => '12px', 'right' => '24px', 'bottom' => '12px', 'left' => '24px']
                ],
                'tablet' => [
                    'font-size' => '14px'  // Responsive override
                ],
                'mobile' => [
                    'font-size' => '12px'  // Mobile override  
                ]
            ]
        ]
    ],
    'order' => ['button-primary-class']
]
```

This comprehensive analysis provides a complete foundation for implementing CSS class to Global Classes conversion. The Style Schema analysis reveals exactly which CSS properties are supported and their expected format, enabling precise mapping from CSS to the Global Classes system.

The next steps would be:
1. **Create detailed technical specifications** for the MVP property mappers
2. **Implement the enhanced CSS parser** to extract class selectors
3. **Build the property mapping system** using the identified schema structure
4. **Create comprehensive tests** for various CSS input scenarios
5. **Design the user interface** for import/conflict resolution