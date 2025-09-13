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

### Updated Implementation Roadmap

#### Phase 1: Minimal MVP (Current)
**Scope**: Absolute minimum viable functionality
- Extend parser to extract simple `.className` selectors only
- Create TWO property mappers: Color_Property_Mapper, Font_Size_Property_Mapper  
- CSS variable extraction and conversion to Editor Variables
- Skip duplicate classes entirely
- Desktop variant only (no responsive)
- Skip unsupported properties with warnings

**Deliverables**:
- Enhanced CSS parser for class extraction
- Color property mapper (hex, rgb, rgba, hsl)
- Font-size property mapper (px, em, rem, %)
- CSS variable integration with existing variable conversion system
- Basic REST API endpoint for class conversion
- Simple conversion reporting (converted, skipped, warnings)

#### Phase 2: Extended Property Support (Next)
**Moved to FUTURE.md** - See detailed roadmap in `/docs/class/FUTURE.md`
- Additional CSS properties (background-color, font-weight, margins, etc.)
- CSS shorthand expansion
- Complex property mappings

#### Phase 3: Responsive Support
**Moved to FUTURE.md** - See detailed roadmap in `/docs/class/FUTURE.md`  
- Media query parsing and breakpoint resolution
- Tablet/mobile variant support
- Responsive CSS variable handling

#### Phase 4: Advanced Features  
**Moved to FUTURE.md** - See detailed roadmap in `/docs/class/FUTURE.md`
- Pseudo-selector support
- Complex selector handling
- Conflict resolution strategies

#### Phase 5+: Long-term Enhancements
**Moved to FUTURE.md** - See detailed roadmap in `/docs/class/FUTURE.md`
- Performance optimizations
- Advanced CSS features
- AI-assisted conversion
- Editor integration and UI

### MVP Requirements & Decisions

Based on stakeholder feedback, the MVP scope has been significantly simplified to focus on core functionality:

#### 1. **Property Support Scope** ✅ DECIDED
**MVP Scope**: Support only `color` and `font-size` properties
- **Rationale**: Start with the most common and straightforward CSS properties
- **Implementation**: Create Color_Property_Mapper and Font_Size_Property_Mapper
- **Future**: All other properties moved to Phase 2+ (see FUTURE.md)

#### 2. **Breakpoint Mapping** ✅ DECIDED  
**MVP Scope**: Skip ALL responsive/breakpoint support
- **Rationale**: Avoid complexity of media query parsing and breakpoint resolution
- **Implementation**: Only support desktop variant, ignore @media rules
- **Future**: Responsive support moved to Phase 3 (see FUTURE.md)

#### 3. **Conflict Resolution Strategy** ✅ DECIDED
**MVP Scope**: Skip duplicate classes entirely
- **Rationale**: Avoid complex conflict resolution logic in initial version
- **Implementation**: If class name already exists, skip the duplicate
- **Future**: Advanced conflict resolution moved to Phase 5 (see FUTURE.md)

#### 4. **CSS Variable Handling** ✅ DECIDED
**MVP Scope**: Convert CSS variables to Editor Variables with conflict resolution
- **Implementation Strategy**:
  - Extract CSS variables from class rules (e.g., `--my-variable: 3`)
  - Convert to Editor Variables using existing variable conversion system
  - If Editor Variable already exists with different value, resolve to literal value
  - Replace `var()` references with resolved values or variable references
- **Example**:
  ```css
  .myClass {
      --primary: #007cba;
      color: var(--primary);
      font-size: 16px;
  }
  ```
  Becomes:
  - Editor Variable: `--primary: #007cba` (if not exists)
  - Global Class: `color: var(--primary), font-size: 16px`

#### 5. **Unsupported Properties** ✅ DECIDED
**MVP Scope**: Skip unsupported properties (partial conversion)
- **Rationale**: Allow partial conversion rather than failing entire class
- **Implementation**: Warn about skipped properties, convert supported ones
- **Future**: Custom CSS support via atomic widgets moved to Phase 9 (see FUTURE.md)

#### 6. **Performance Considerations** ✅ DECIDED
**MVP Scope**: Skip performance optimizations
- **Rationale**: Focus on core functionality first, optimize later
- **Implementation**: Basic synchronous processing, no streaming or batching
- **Future**: Performance optimizations moved to Phase 6 (see FUTURE.md)

### MVP Testing Scenarios

#### Scenario 1: Basic Supported Properties
```css
.simple-class {
    color: #ff0000;        /* ✅ SUPPORTED - converted */
    font-size: 16px;       /* ✅ SUPPORTED - converted */
    background-color: #fff; /* ❌ SKIPPED - unsupported in MVP */
    margin: 10px;          /* ❌ SKIPPED - unsupported in MVP */
}
```
**Expected Output:**
- Global Class with color and font-size only
- Warnings for skipped properties

#### Scenario 2: CSS Variables with var() References
```css
.variable-class {
    --primary: #007cba;     /* ✅ CONVERTED to Editor Variable */
    --spacing: 16px;        /* ❌ SKIPPED - spacing not supported */
    color: var(--primary);  /* ✅ RESOLVED to variable reference */
    font-size: 14px;        /* ✅ SUPPORTED - converted */
    margin: var(--spacing); /* ❌ SKIPPED - margin not supported */
}
```
**Expected Output:**
- Editor Variable: `--primary: #007cba`
- Global Class: `color: var(--primary), font-size: 14px`
- Warnings for unsupported variable and property

#### Scenario 3: Duplicate Classes (Skipped)
```css
/* First occurrence */
.button {
    color: red;
    font-size: 16px;
}

/* Second occurrence - SKIPPED */
.button {
    color: blue;
    font-size: 14px;
}
```
**Expected Output:**
- Only first .button class converted
- Warning: "Skipped duplicate class: .button"

#### Scenario 4: Complex Selectors (Skipped)
```css
.simple-class { color: red; }           /* ✅ SUPPORTED */
.parent .child { color: blue; }         /* ❌ SKIPPED - complex selector */
.button:hover { color: green; }         /* ❌ SKIPPED - pseudo-selector */
#main .content { color: black; }        /* ❌ SKIPPED - ID selector */
```
**Expected Output:**
- Only .simple-class converted
- Warnings for all skipped complex selectors

#### Scenario 5: Responsive CSS (Skipped)
```css
.responsive-class {
    font-size: 18px;  /* ✅ SUPPORTED */
}

@media (max-width: 768px) {
    .responsive-class {
        font-size: 16px;  /* ❌ SKIPPED - media query */
    }
}
```
**Expected Output:**
- Only desktop font-size converted
- Warning: "Skipped media query - responsive support not available in MVP"

#### Scenario 6: Mixed Supported/Unsupported Properties
```css
.mixed-class {
    color: #333;              /* ✅ SUPPORTED */
    font-size: 16px;          /* ✅ SUPPORTED */
    font-weight: bold;        /* ❌ SKIPPED */
    background-color: #f0f0f0; /* ❌ SKIPPED */
    padding: 10px;            /* ❌ SKIPPED */
    border-radius: 4px;       /* ❌ SKIPPED */
}
```
**Expected Output:**
- Global Class with only color and font-size
- Multiple warnings for unsupported properties
- Partial conversion success

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

#### Simplified MVP Architecture

```php
interface Class_Property_Mapper_Interface {
    public function supports(string $property, $value): bool;
    public function map_to_schema(string $property, $value): array;
    public function get_schema_properties(): array;
}

// MVP: Only TWO property mappers
class Color_Property_Mapper implements Class_Property_Mapper_Interface {
    // Maps ONLY 'color' property to Color_Prop_Type
    public function supports(string $property, $value): bool {
        return 'color' === $property;
    }
    
    public function map_to_schema(string $property, $value): array {
        // Convert color values (hex, rgb, rgba, hsl) to schema format
        return ['color' => $this->normalize_color_value($value)];
    }
}

class Font_Size_Property_Mapper implements Class_Property_Mapper_Interface {
    // Maps ONLY 'font-size' property to Size_Prop_Type  
    public function supports(string $property, $value): bool {
        return 'font-size' === $property;
    }
    
    public function map_to_schema(string $property, $value): array {
        // Convert font-size values (px, em, rem, %) to schema format
        return ['font-size' => $this->normalize_size_value($value)];
    }
}

// Future mappers moved to Phase 2+:
// - Typography_Property_Mapper (font-weight, font-family, etc.)
// - Spacing_Property_Mapper (margin, padding)  
// - Background_Property_Mapper (background-color, background-image)
// - Layout_Property_Mapper (display, width, height)
```

#### Simplified MVP Conversion Pipeline

```php
class Class_Conversion_Service {
    private $supported_properties = ['color', 'font-size'];
    private $css_variable_service;
    
    public function convert_css_classes_to_global_classes(string $css): array {
        $parsed = $this->parser->parse($css);
        $classes = $this->extract_simple_classes($parsed); // Only .className selectors
        $results = [];
        
        foreach ($classes as $css_class) {
            // Skip duplicate class names entirely
            if ($this->class_already_exists($css_class['selector'])) {
                $this->add_warning("Skipped duplicate class: {$css_class['selector']}");
                continue;
            }
            
            $converted = $this->convert_single_class($css_class);
            if (!empty($converted['variants']['desktop'])) {
                $results[] = $converted;
            }
        }
        
        return $results;
    }
    
    private function convert_single_class(array $css_class): array {
        $schema_properties = [];
        $css_variables = [];
        
        foreach ($css_class['properties'] as $property => $value) {
            // Handle CSS variables
            if (str_starts_with($property, '--')) {
                $css_variables[] = ['name' => $property, 'value' => $value];
                continue;
            }
            
            // Handle var() references  
            if (str_contains($value, 'var(')) {
                $value = $this->resolve_css_variables($value, $css_variables);
            }
            
            // Only process supported properties
            if (in_array($property, $this->supported_properties)) {
                $mapper = $this->property_mapper_registry->resolve($property, $value);
                if ($mapper) {
                    $mapped = $mapper->map_to_schema($property, $value);
                    $schema_properties = array_merge($schema_properties, $mapped);
                }
            } else {
                $this->add_warning("Skipped unsupported property: {$property}");
            }
        }
        
        // Convert CSS variables to Editor Variables
        if (!empty($css_variables)) {
            $this->css_variable_service->convert_to_editor_variables($css_variables);
        }
        
        return [
            'id' => $this->generate_class_id($css_class['selector']),
            'type' => 'class',
            'label' => $this->generate_class_label($css_class['selector']),
            'variants' => [
                'desktop' => $schema_properties
                // No responsive variants in MVP
            ]
        ];
    }
    
    private function extract_simple_classes(ParsedCss $parsed): array {
        // Only extract simple .className selectors
        // Skip complex selectors, pseudo-selectors, media queries
        // Implementation details...
    }
}
```

### Final Recommendations

#### MVP Scope (Phase 1) - UPDATED
**Simplified focus on only essential properties:**

**SUPPORTED in MVP:**
1. **Color Properties:** `color` only
2. **Typography Properties:** `font-size` only  
3. **CSS Variables:** Extract and convert to Editor Variables

**EXPLICITLY SKIPPED in MVP:**
- All other CSS properties (background-color, font-weight, margin, padding, etc.)
- CSS shorthand properties  
- Responsive/breakpoint support (@media queries)
- Pseudo-selectors (:hover, :focus, etc.)
- Complex selectors (nested, combinators, etc.)
- Duplicate class handling
- Performance optimizations
- Complex background properties
- Transform, filter, animation properties

**MVP Conversion Example:**
```css
/* Input CSS */
.simple-class {
    color: #ff0000;
    font-size: 16px;
    --primary: #007cba;
    background-color: #ffffff; /* SKIPPED */
    margin: 10px; /* SKIPPED */
}

/* Output Global Class */
{
    "id": "simple-class",
    "type": "class",
    "label": "Simple Class", 
    "variants": {
        "desktop": {
            "color": "#ff0000",
            "font-size": "16px"
        }
    }
}

/* Output Editor Variable */
{
    "id": "e-gv-color-hex-primary-variable",
    "type": "color-hex", 
    "value": "#007cba",
    "source": "css-variable",
    "name": "--primary"
}
```

#### Data Migration Considerations

**MVP Global Classes Storage Format:**
```php
// Kit metadata: _elementor_global_classes (MVP simplified)
[
    'items' => [
        'simple-class' => [
            'id' => 'simple-class',
            'type' => 'class', 
            'label' => 'Simple Class',
            'variants' => [
                'desktop' => [
                    'color' => '#ff0000',      // Only supported properties
                    'font-size' => '16px'      // Only supported properties
                ]
                // No tablet/mobile variants in MVP
            ]
        ]
    ],
    'order' => ['simple-class']
]

// Conversion Report Format
[
    'converted_classes' => [
        ['id' => 'simple-class', 'properties' => ['color', 'font-size']]
    ],
    'skipped_classes' => [
        ['selector' => '.button', 'reason' => 'duplicate']
    ],
    'css_variables' => [
        ['name' => '--primary', 'converted' => true, 'id' => 'e-gv-color-hex-primary-variable']
    ],
    'warnings' => [
        'Skipped unsupported property: background-color in .simple-class',
        'Skipped duplicate class: .button',
        'Skipped complex selector: .parent .child'
    ],
    'stats' => [
        'total_classes_found' => 5,
        'classes_converted' => 1,
        'classes_skipped' => 4,
        'properties_converted' => 2,
        'properties_skipped' => 8,
        'variables_converted' => 1
    ]
]
```

## Summary & Next Steps

### MVP Scope Validation ✅

The HVV feedback has been analyzed and is **clear and realistic**:

1. **Simplified Property Support**: Starting with only `color` and `font-size` is pragmatic and achievable
2. **No Responsive Support**: Skipping breakpoints eliminates significant complexity  
3. **Skip Duplicates**: Avoiding conflict resolution reduces MVP scope appropriately
4. **CSS Variable Integration**: Leveraging existing variable conversion system is efficient
5. **Partial Conversion**: Skipping unsupported properties allows gradual adoption

### Technical Feasibility Assessment ✅

The simplified MVP is **technically sound and implementable**:

- **Leverages Existing Architecture**: Builds on proven CSS variable conversion system
- **Minimal New Components**: Only requires 2 new property mappers and class extraction
- **Clear Boundaries**: Well-defined scope prevents feature creep
- **Incremental Approach**: Allows for learning and iteration before adding complexity

### Implementation Readiness

**Immediate Next Steps:**
1. **Implement Enhanced CSS Parser** - Extend existing parser to extract `.className` selectors
2. **Create Color Property Mapper** - Handle color values (hex, rgb, rgba, hsl)  
3. **Create Font-Size Property Mapper** - Handle size values (px, em, rem, %)
4. **Integrate CSS Variable Handling** - Use existing Variable_Conversion_Service
5. **Build Class Conversion Service** - Orchestrate the conversion pipeline
6. **Create REST API Endpoint** - Extend existing `/css-converter/variables` pattern
7. **Implement Comprehensive Testing** - Cover all MVP scenarios and edge cases

**Future Enhancements:**
- **Detailed roadmap in `/docs/class/FUTURE.md`** covers all advanced features
- **Phased approach** allows for controlled expansion of functionality
- **Modular architecture** supports adding new property mappers incrementally

### Risk Assessment: LOW ✅

The simplified MVP significantly reduces implementation risks:
- **No complex CSS parsing** (media queries, pseudo-selectors, combinators)
- **No conflict resolution logic** (skip duplicates)
- **No performance optimization requirements** (basic synchronous processing)
- **Leverages proven patterns** (existing variable conversion system)

This approach provides a solid foundation for CSS class conversion while maintaining manageable complexity and clear deliverables.