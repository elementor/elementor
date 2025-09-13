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

---

## IMPLEMENTATION PLAN

### Phase 1: MVP Development (Estimated: 2-3 weeks)

#### Step 1: Extend CSS Parser for Class Extraction (3-4 days)

**Objective**: Enhance existing CSS parser to extract simple class selectors

**Files to Modify:**
- `parsers/css-parser.php` - Add class extraction methods
- `parsers/parsed-css.php` - Extend to store class data

**Implementation Details:**
```php
// Add to CssParser class
public function extract_classes(ParsedCss $parsed): array {
    $classes = [];
    $this->extract_classes_recursive($parsed->get_document(), $classes);
    return $classes;
}

private function extract_classes_recursive($css_node, &$classes) {
    if ($css_node instanceof \Sabberworm\CSS\RuleSet\DeclarationBlock) {
        $this->process_declaration_block_for_classes($css_node, $classes);
    }
    $this->process_node_contents_recursively($css_node, 'extract_classes_recursive', $classes);
}

private function process_declaration_block_for_classes($css_node, &$classes) {
    foreach ($css_node->getSelectors() as $selector) {
        $selector_string = $selector->getSelector();
        
        // Only process simple class selectors (.className)
        if ($this->is_simple_class_selector($selector_string)) {
            $this->extract_properties_from_class($css_node, $selector_string, $classes);
        }
    }
}

private function is_simple_class_selector(string $selector): bool {
    $trimmed = trim($selector);
    // Match only .className (no spaces, no pseudo-selectors, no combinators)
    return preg_match('/^\.[\w-]+$/', $trimmed);
}
```

**Testing Requirements:**
- Unit tests for simple class selector detection
- Tests for skipping complex selectors
- Integration tests with existing parser

#### Step 2: Create Property Mappers (2-3 days)

**Objective**: Implement Color and Font-Size property mappers

**New Files to Create:**
- `class-convertors/class-property-mapper-interface.php`
- `class-convertors/color-property-mapper.php`
- `class-convertors/font-size-property-mapper.php`
- `class-convertors/class-property-mapper-registry.php`

**Implementation Details:**
```php
// class-property-mapper-interface.php
interface Class_Property_Mapper_Interface {
    public function supports(string $property, $value): bool;
    public function map_to_schema(string $property, $value): array;
    public function get_supported_properties(): array;
}

// color-property-mapper.php
class Color_Property_Mapper implements Class_Property_Mapper_Interface {
    public function supports(string $property, $value): bool {
        return 'color' === $property && $this->is_valid_color($value);
    }
    
    public function map_to_schema(string $property, $value): array {
        return ['color' => $this->normalize_color_value($value)];
    }
    
    private function is_valid_color(string $value): bool {
        // Support hex, rgb, rgba, hsl, named colors
        return $this->is_hex_color($value) || 
               $this->is_rgb_color($value) || 
               $this->is_named_color($value);
    }
    
    private function normalize_color_value(string $value): string {
        // Convert to consistent format (prefer hex)
        if ($this->is_rgb_color($value)) {
            return $this->rgb_to_hex($value);
        }
        return strtolower($value);
    }
}

// font-size-property-mapper.php  
class Font_Size_Property_Mapper implements Class_Property_Mapper_Interface {
    private const SUPPORTED_UNITS = ['px', 'em', 'rem', '%', 'pt'];
    
    public function supports(string $property, $value): bool {
        return 'font-size' === $property && $this->is_valid_size($value);
    }
    
    public function map_to_schema(string $property, $value): array {
        return ['font-size' => $this->normalize_size_value($value)];
    }
    
    private function is_valid_size(string $value): bool {
        foreach (self::SUPPORTED_UNITS as $unit) {
            if (preg_match('/^\d+(\.\d+)?' . $unit . '$/', $value)) {
                return true;
            }
        }
        return false;
    }
}
```

**Testing Requirements:**
- Unit tests for each property mapper
- Color format conversion tests (rgb→hex, etc.)
- Size unit validation tests
- Registry resolution tests

#### Step 3: Build Class Conversion Service (3-4 days)

**Objective**: Create main service to orchestrate class conversion

**New Files to Create:**
- `services/class-conversion-service.php`
- `exceptions/class-conversion-exception.php`

**Implementation Details:**
```php
class Class_Conversion_Service {
    private $css_parser;
    private $variable_conversion_service;
    private $property_mapper_registry;
    private $warnings = [];
    private $supported_properties = ['color', 'font-size'];
    
    public function __construct() {
        $this->css_parser = new CssParser();
        $this->variable_conversion_service = new Variable_Conversion_Service();
        $this->property_mapper_registry = new Class_Property_Mapper_Registry();
        $this->init_property_mappers();
    }
    
    public function convert_css_to_global_classes(string $css): array {
        try {
            $parsed = $this->css_parser->parse($css);
            $classes = $this->css_parser->extract_classes($parsed);
            
            return $this->process_classes($classes);
            
        } catch (CssParseException $e) {
            throw new Class_Conversion_Exception('Failed to parse CSS: ' . $e->getMessage());
        }
    }
    
    private function process_classes(array $classes): array {
        $results = [
            'converted_classes' => [],
            'skipped_classes' => [],
            'css_variables' => [],
            'warnings' => [],
            'stats' => [
                'total_classes_found' => count($classes),
                'classes_converted' => 0,
                'classes_skipped' => 0,
                'properties_converted' => 0,
                'properties_skipped' => 0,
                'variables_converted' => 0
            ]
        ];
        
        $existing_class_names = $this->get_existing_global_class_names();
        
        foreach ($classes as $css_class) {
            $class_name = $this->extract_class_name($css_class['selector']);
            
            // Skip duplicates
            if (in_array($class_name, $existing_class_names)) {
                $this->add_warning("Skipped duplicate class: {$css_class['selector']}");
                $results['skipped_classes'][] = [
                    'selector' => $css_class['selector'],
                    'reason' => 'duplicate'
                ];
                $results['stats']['classes_skipped']++;
                continue;
            }
            
            $converted = $this->convert_single_class($css_class);
            
            if (!empty($converted['variants']['desktop'])) {
                $results['converted_classes'][] = $converted;
                $results['stats']['classes_converted']++;
                $existing_class_names[] = $class_name; // Prevent duplicates within same conversion
            } else {
                $results['skipped_classes'][] = [
                    'selector' => $css_class['selector'],
                    'reason' => 'no_supported_properties'
                ];
                $results['stats']['classes_skipped']++;
            }
        }
        
        $results['warnings'] = $this->warnings;
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
            
            // Process supported properties only
            if (in_array($property, $this->supported_properties)) {
                $mapper = $this->property_mapper_registry->resolve($property, $value);
                
                if ($mapper) {
                    $mapped = $mapper->map_to_schema($property, $value);
                    $schema_properties = array_merge($schema_properties, $mapped);
                    $this->stats['properties_converted']++;
                } else {
                    $this->add_warning("Failed to map property: {$property} with value: {$value}");
                    $this->stats['properties_skipped']++;
                }
            } else {
                $this->add_warning("Skipped unsupported property: {$property} in {$css_class['selector']}");
                $this->stats['properties_skipped']++;
            }
        }
        
        // Convert CSS variables to Editor Variables
        if (!empty($css_variables)) {
            $converted_variables = $this->variable_conversion_service->convert_to_editor_variables($css_variables);
            // Handle variable conversion results...
        }
        
        return [
            'id' => $this->generate_class_id($css_class['selector']),
            'type' => 'class',
            'label' => $this->generate_class_label($css_class['selector']),
            'variants' => [
                'desktop' => $schema_properties
            ]
        ];
    }
    
    private function generate_class_id(string $selector): string {
        $class_name = $this->extract_class_name($selector);
        return sanitize_title($class_name);
    }
    
    private function generate_class_label(string $selector): string {
        $class_name = $this->extract_class_name($selector);
        return ucwords(str_replace(['-', '_'], ' ', $class_name));
    }
    
    private function extract_class_name(string $selector): string {
        return ltrim(trim($selector), '.');
    }
}
```

**Testing Requirements:**
- Integration tests with real CSS samples
- Duplicate detection tests
- CSS variable resolution tests
- Error handling tests

#### Step 4: Create REST API Endpoint (2 days)

**Objective**: Extend existing API to support class conversion

**Files to Modify:**
- `routes/variables-route.php` - Add class conversion endpoint
- OR create new `routes/classes-route.php`

**Implementation Details:**
```php
// Add to existing VariablesRoute or create new ClassesRoute
public function register_class_conversion_route() {
    register_rest_route('elementor/v2', '/css-converter/classes', [
        'methods' => 'POST',
        'callback' => [$this, 'convert_classes'],
        'permission_callback' => [$this, 'check_permissions'],
        'args' => [
            'css' => [
                'required' => false,
                'type' => 'string',
                'description' => 'CSS string to convert'
            ],
            'url' => [
                'required' => false,
                'type' => 'string',
                'description' => 'URL to fetch CSS from'
            ]
        ]
    ]);
}

public function convert_classes(\WP_REST_Request $request) {
    try {
        $css = $this->get_css_from_request($request);
        
        $conversion_service = new Class_Conversion_Service();
        $results = $conversion_service->convert_css_to_global_classes($css);
        
        // Store converted classes in Global Classes repository
        if (!empty($results['converted_classes'])) {
            $this->store_global_classes($results['converted_classes']);
        }
        
        return rest_ensure_response([
            'success' => true,
            'data' => $results
        ]);
        
    } catch (Exception $e) {
        return new \WP_Error('conversion_failed', $e->getMessage(), ['status' => 400]);
    }
}

private function store_global_classes(array $classes) {
    $repository = Global_Classes_Repository::make();
    $current_classes = $repository->all();
    
    // Merge new classes with existing ones
    $updated_items = $current_classes->get_items()->all();
    $updated_order = $current_classes->get_order()->all();
    
    foreach ($classes as $class) {
        $updated_items[$class['id']] = $class;
        $updated_order[] = $class['id'];
    }
    
    $repository->put($updated_items, $updated_order);
}
```

**Testing Requirements:**
- API endpoint tests
- Authentication tests
- Global Classes storage tests
- Error response tests

#### Step 5: Integration & Testing (2-3 days)

**Objective**: Integrate all components and create comprehensive test suite

**New Files to Create:**
- `tests/unit/class-conversion-service-test.php`
- `tests/unit/color-property-mapper-test.php`
- `tests/unit/font-size-property-mapper-test.php`
- `tests/integration/css-class-conversion-test.php`
- `tests/api/classes-route-test.php`

**Test Scenarios to Cover:**
```php
// Unit Tests
class Color_Property_Mapper_Test extends \WP_UnitTestCase {
    public function test_supports_hex_colors() {
        $mapper = new Color_Property_Mapper();
        $this->assertTrue($mapper->supports('color', '#ff0000'));
        $this->assertTrue($mapper->supports('color', '#f00'));
        $this->assertFalse($mapper->supports('background-color', '#ff0000'));
    }
    
    public function test_normalizes_color_values() {
        $mapper = new Color_Property_Mapper();
        $result = $mapper->map_to_schema('color', '#FF0000');
        $this->assertEquals(['color' => '#ff0000'], $result);
    }
}

// Integration Tests  
class CSS_Class_Conversion_Test extends \WP_UnitTestCase {
    public function test_converts_simple_class() {
        $css = '.test-class { color: #ff0000; font-size: 16px; }';
        $service = new Class_Conversion_Service();
        $result = $service->convert_css_to_global_classes($css);
        
        $this->assertEquals(1, $result['stats']['classes_converted']);
        $this->assertArrayHasKey('test-class', $result['converted_classes'][0]);
    }
    
    public function test_skips_duplicate_classes() {
        // Create existing global class first
        $this->create_global_class('existing-class');
        
        $css = '.existing-class { color: #ff0000; }';
        $service = new Class_Conversion_Service();
        $result = $service->convert_css_to_global_classes($css);
        
        $this->assertEquals(0, $result['stats']['classes_converted']);
        $this->assertEquals(1, $result['stats']['classes_skipped']);
    }
}
```

**Manual Testing Checklist:**
- [ ] Convert simple CSS classes successfully
- [ ] Skip unsupported properties with warnings
- [ ] Handle CSS variables correctly
- [ ] Skip duplicate classes
- [ ] API endpoint responds correctly
- [ ] Global Classes appear in Elementor editor
- [ ] Error handling works properly

### Phase 2: Documentation & Polish (1 week)

#### Step 6: User Documentation (2-3 days)

**Files to Create:**
- `docs/USER-GUIDE.md` - End-user instructions
- `docs/API-REFERENCE.md` - Developer API documentation
- `docs/TROUBLESHOOTING.md` - Common issues and solutions

**Documentation Content:**
```markdown
# CSS Class Converter - User Guide

## Supported CSS Properties (MVP)
- `color` - Text color (hex, rgb, rgba, hsl, named colors)
- `font-size` - Font size (px, em, rem, %, pt)

## Supported CSS Patterns
✅ Simple class selectors: `.my-class { ... }`
✅ CSS variables: `--my-var: value;` and `var(--my-var)`

## Not Supported (Coming in Future Versions)
❌ Complex selectors: `.parent .child`, `.class:hover`
❌ Media queries: `@media (max-width: 768px)`
❌ Other properties: `background-color`, `margin`, `padding`, etc.

## How to Use
1. Navigate to Elementor > Tools > CSS Converter
2. Paste your CSS or provide a URL
3. Click "Convert Classes"
4. Review conversion results and warnings
5. Converted classes will appear in Global Classes panel
```

#### Step 7: Code Review & Optimization (2-3 days)

**Review Checklist:**
- [ ] Code follows WordPress coding standards
- [ ] All functions have proper error handling
- [ ] Security: Input validation and sanitization
- [ ] Performance: No N+1 queries or memory leaks
- [ ] Accessibility: Proper ARIA labels if UI added
- [ ] Internationalization: All strings are translatable

#### Step 8: Deployment Preparation (1-2 days)

**Deployment Checklist:**
- [ ] Feature flag implementation
- [ ] Database migration scripts (if needed)
- [ ] Rollback plan
- [ ] Performance monitoring setup
- [ ] User feedback collection mechanism

### Success Criteria

**MVP is considered successful when:**
1. ✅ Converts simple CSS classes with `color` and `font-size` properties
2. ✅ Integrates CSS variables with existing Editor Variables system
3. ✅ Skips unsupported features gracefully with clear warnings
4. ✅ Provides REST API for programmatic access
5. ✅ Stores converted classes in Global Classes system
6. ✅ Has comprehensive test coverage (>90%)
7. ✅ Includes complete user and developer documentation

### Risk Mitigation

**Potential Risks & Mitigation:**
1. **CSS Parsing Edge Cases**: Extensive testing with real-world CSS samples
2. **Performance Issues**: Limit CSS file size, add processing timeouts
3. **User Confusion**: Clear documentation about limitations and supported features
4. **Integration Conflicts**: Thorough testing with existing Global Classes functionality

### Post-MVP Evaluation

**Metrics to Track:**
- Conversion success rate
- User adoption rate  
- Most requested missing features
- Performance metrics (conversion time, memory usage)
- User feedback and support requests

**Decision Points for Phase 2:**
- Which additional properties to prioritize
- Whether responsive support is needed
- User demand for conflict resolution features
- Performance optimization requirements

This implementation plan provides a clear, step-by-step approach to delivering the MVP CSS Class Converter with manageable risk and clear success criteria.