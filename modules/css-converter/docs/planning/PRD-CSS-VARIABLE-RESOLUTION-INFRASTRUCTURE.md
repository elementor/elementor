# PRD: CSS Variable Resolution Infrastructure

**Date**: November 1, 2025  
**Status**: Planning  
**Priority**: High  
**Type**: Infrastructure Enhancement

---

## Executive Summary

Implement a comprehensive CSS variable resolution system that correctly handles CSS variables from external websites during conversion to v4 atomic widgets. The system must distinguish between:
1. **Editor Variables** (colors, fonts) → Import as v4 global design tokens
2. **Local CSS Variables** (flex, sizing, spacing) → Resolve to atomic properties
3. **Unsupported Variables** → Discard or fallback

## Problem Statement

### Current Issues

1. **Incomplete Variable Handling**
   - CSS variables like `--display`, `--justify-content`, `--flex-direction` are **skipped** during conversion
   - Properties referencing these variables (`display: var(--display)`) fail to convert
   - Result: Missing flex layout properties in converted containers

2. **Wrong Classification**
   - System treats ALL Elementor variables (`--e-global-*`, `--elementor-*`) as importable
   - Reality: Only **colors** and **fonts** can be imported as editor variables
   - Other variables (sizing, spacing, flex) have no v4 editor variable support

3. **Confusion About Variable Types**
   - **Global Editor Variables**: Design tokens stored in Kit (colors, fonts)
   - **Local CSS Variables**: Element-specific values (`--display: flex`)
   - **External Variables**: From source website (may not exist in target)

### Evidence from Codebase

**V4 Editor Variables Support**:

**Core (Free) - from `plugins/elementor/modules/variables/`**:
- ✅ `Color_Variable_Prop_Type` - Supports color variables
- ✅ `Font_Variable_Prop_Type` - Supports font variables

**Pro (Extended) - from `plugins/elementor-pro/modules/variables/`**:
- ✅ `Size_Variable_Prop_Type` - Supports size variables (width, height, gap, margin, padding, font-size, etc.)

**Prop Types Augmented**:

**Core Schema** (`plugins/elementor/modules/variables/classes/style-schema.php`):
```php
private function update_color( Color_Prop_Type $color_prop_type ): Union_Prop_Type {
    return Union_Prop_Type::create_from( $color_prop_type )
        ->add_prop_type( Color_Variable_Prop_Type::make() );
}

private function update_font_family( String_Prop_Type $prop_type ): Union_Prop_Type {
    return Union_Prop_Type::create_from( $prop_type )
        ->add_prop_type( Font_Variable_Prop_Type::make() );
}
```

**Pro Schema** (`plugins/elementor-pro/modules/variables/classes/style-schema.php`):
```php
private function update_size( Size_Prop_Type $size_prop_type ): Union_Prop_Type {
    return Union_Prop_Type::create_from( $size_prop_type )
        ->add_prop_type( Size_Variable_Prop_Type::make() );
}
```

**Pro Blacklist** (properties that do NOT get size variable support):
- `border-width`, `border-radius`, `box-shadow`, `filter`, `backdrop-filter`, `transform`, `transition`

**Result**: 
- ✅ Colors support variables (Core)
- ✅ Fonts support variables (Core)
- ✅ **Sizes support variables (Pro)** - includes font-size, width, height, gap, margin, padding, line-height, letter-spacing, word-spacing, etc.

---

## Goals

### Primary Goals

1. **Resolve Local CSS Variables to Atomic Properties**
   - Extract CSS variable definitions from source CSS
   - Resolve properties that reference variables
   - Convert resolved values to atomic format
   - Example: `--justify-content: space-between` + `justify-content: var(--justify-content)` → `{$$type: "string", value: "space-between"}`

2. **Import Supported Variables as Editor Variables**
   - Identify importable variables (colors, fonts)
   - Create global design tokens in target Kit
   - Preserve `var()` references in atomic properties
   - Example: `color: var(--e-global-color-primary)` → Keep as-is (will resolve in editor)

3. **Handle Unsupported Variables Gracefully**
   - Detect variables without resolution path
   - Provide fallback or skip property
   - Log for debugging

---

## Variable Classification System

### Type 1: Importable Editor Variables ✅

**Supported By**: v4 Editor Variables Module (Core + Pro)

| Variable Pattern | Prop Type | Import Action | Example | Requires |
|------------------|-----------|---------------|---------|----------|
| `--e-global-color-*` | `Color_Variable_Prop_Type` | Import to Kit | `--e-global-color-primary: #007bff` | Core |
| `--e-global-typography-*-font-family` | `Font_Variable_Prop_Type` | Import to Kit | `--e-global-typography-primary-font-family: Arial` | Core |
| **`--e-global-size-*`** | **`Size_Variable_Prop_Type`** | **Import to Kit** | **`--e-global-size-spacing: 20px`** | **Pro** |
| Custom color vars | `Color_Variable_Prop_Type` | Import to Kit | `--brand-color: #ff0000` | Core |
| Custom font vars | `Font_Variable_Prop_Type` | Import to Kit | `--heading-font: Georgia` | Core |
| **Custom size vars** | **`Size_Variable_Prop_Type`** | **Import to Kit** | **`--container-gap: 1.5rem`** | **Pro** |

**Size Properties Supported** (when Pro is active):
- ✅ `font-size`, `line-height`, `letter-spacing`, `word-spacing`
- ✅ `width`, `height`, `max-width`, `max-height`, `min-width`, `min-height`
- ✅ `gap`, `column-gap`, `row-gap`
- ✅ `margin`, `padding` (and all directional variants)
- ✅ `top`, `right`, `bottom`, `left`
- ❌ `border-width`, `border-radius` (blacklisted)
- ❌ `box-shadow`, `filter`, `backdrop-filter`, `transform`, `transition` (blacklisted)

**Conversion Flow**:
```
Source CSS: 
  gap: var(--container-spacing);
  color: var(--e-global-color-primary);
          ↓
Extract Variables: 
  --container-spacing: 20px
  --e-global-color-primary: #007bff
          ↓
Import to Kit: 
  - Create size variable "container-spacing" with value "20px" (Pro)
  - Create color variable "primary" with value "#007bff" (Core)
          ↓
Atomic Properties: 
  - { $$type: "size", value: "var(--e-global-size-container-spacing)" }
  - { $$type: "color", value: "var(--e-global-color-primary)" }
          ↓
Result: Both properties reference global variables (resolve in editor)
```

---

### Type 2: Local CSS Variables (Context-Dependent) ⚠️

**Import vs Resolve Decision**: Depends on whether variable can map to a supported prop type

| Variable Pattern | Prop Type | Action | Reason |
|------------------|-----------|--------|--------|
| `--gap: 20px` | `Size_Prop_Type` | **Import** (if Pro) | Size variables supported |
| `--width: 100%` | `Size_Prop_Type` | **Import** (if Pro) | Size variables supported |
| `--height: auto` | `Size_Prop_Type` | **Import** (if Pro) | Size variables supported |
| `--margin-top: 10px` | `Size_Prop_Type` | **Import** (if Pro) | Size variables supported |
| `--padding: 15px` | `Size_Prop_Type` | **Import** (if Pro) | Size variables supported |
| `--display: flex` | `String_Prop_Type` | **Resolve** | No Display_Variable_Prop_Type |
| `--flex-direction: row` | `String_Prop_Type` | **Resolve** | No Flex_Variable_Prop_Type |
| `--justify-content: center` | `String_Prop_Type` | **Resolve** | No Justify_Variable_Prop_Type |
| `--align-items: center` | `String_Prop_Type` | **Resolve** | No Align_Variable_Prop_Type |
| `--flex-wrap: wrap` | `String_Prop_Type` | **Resolve** | No Wrap_Variable_Prop_Type |

**Decision Logic**:
```php
if ( is_size_variable( $var_name, $var_value ) && is_pro_active() ) {
    import_as_size_variable();
} elseif ( is_color_variable( $var_name, $var_value ) ) {
    import_as_color_variable();
} elseif ( is_font_variable( $var_name, $var_value ) ) {
    import_as_font_variable();
} else {
    resolve_to_direct_value();
}
```

**Conversion Flow**:
```
Source CSS: 
  .container { --justify-content: space-between; }
  .container .inner { justify-content: var(--justify-content); }
          ↓
Extract Variable: --justify-content: space-between
          ↓
Resolve Reference: justify-content: space-between
          ↓
Convert to Atomic: { $$type: "string", value: "space-between" }
          ↓
Result: Direct atomic property (no variable reference)
```

---

### Type 3: Unsupported Variables (Discard) ❌

| Variable Pattern | Reason Unsupported | Action | Example |
|------------------|-------------------|--------|---------|
| Third-party vars | Unknown source | Discard/fallback | `--bootstrap-primary: #0d6efd` |
| Complex calc() | Unresolvable | Discard/fallback | `--dynamic-width: calc(100% - 20px)` |
| Nested vars | Complex resolution | Flatten or discard | `--final: var(--base)` |

---

## Technical Architecture

### Component 1: CSS Variable Registry (Enhanced)

**Current**: `Css_Variable_Registry_Processor` (Priority 9 - EARLY)

**Enhancement Needed**:
```php
class Css_Variable_Registry_Processor {
    
    private function classify_variable( string $var_name, string $value ): string {
        const VARIABLE_TYPE_COLOR = 'color';
        const VARIABLE_TYPE_FONT = 'font';
        const VARIABLE_TYPE_LOCAL = 'local';
        const VARIABLE_TYPE_UNSUPPORTED = 'unsupported';
        
        if ( $this->is_color_variable( $var_name, $value ) ) {
            return self::VARIABLE_TYPE_COLOR;
        }
        
        if ( $this->is_font_variable( $var_name, $value ) ) {
            return self::VARIABLE_TYPE_FONT;
        }
        
        if ( $this->is_local_variable( $var_name ) ) {
            return self::VARIABLE_TYPE_LOCAL;
        }
        
        return self::VARIABLE_TYPE_UNSUPPORTED;
    }
    
    private function is_color_variable( string $var_name, string $value ): bool {
        if ( strpos( $var_name, '--e-global-color-' ) === 0 ) {
            return true;
        }
        
        if ( $this->is_color_value( $value ) ) {
            return true;
        }
        
        return false;
    }
    
    private function is_font_variable( string $var_name, string $value ): bool {
        if ( strpos( $var_name, '-font-family' ) !== false ) {
            return true;
        }
        
        return false;
    }
    
    private function is_size_variable( string $var_name, string $value ): bool {
        if ( strpos( $var_name, '--e-global-size-' ) === 0 ) {
            return true;
        }
        
        if ( ! class_exists( 'ElementorPro\\Plugin' ) ) {
            return false;
        }
        
        const SIZE_PATTERNS = [
            'width',
            'height',
            'gap',
            'margin',
            'padding',
            'spacing',
            'size',
        ];
        
        foreach ( $SIZE_PATTERNS as $pattern ) {
            if ( strpos( $var_name, '--' . $pattern ) === 0 ) {
                return $this->is_size_value( $value );
            }
        }
        
        return $this->is_size_value( $value );
    }
    
    private function is_size_value( string $value ): bool {
        return (bool) preg_match( '/^-?\d+\.?\d*(px|em|rem|%|vh|vw|vmin|vmax)$/', trim( $value ) );
    }
    
    private function is_local_variable( string $var_name ): bool {
        const LOCAL_VARIABLE_PATTERNS = [
            'display',
            'flex-direction',
            'justify-content',
            'align-items',
            'gap',
            'flex-wrap',
            'width',
            'height',
            'margin',
            'padding',
        ];
        
        foreach ( $LOCAL_VARIABLE_PATTERNS as $pattern ) {
            if ( strpos( $var_name, '--' . $pattern ) === 0 ) {
                return true;
            }
        }
        
        return false;
    }
}
```

---

### Component 2: CSS Variable Resolver (NEW)

**Purpose**: Resolve CSS variables to actual values before property conversion

**Location**: `plugins/elementor-css/modules/css-converter/services/css/processing/processors/css-variable-resolver.php`

**Priority**: 50 (After variable registry, before property conversion)

```php
class Css_Variable_Resolver implements Css_Processor_Interface {
    
    public function get_priority(): int {
        return 50;
    }
    
    public function process( Css_Processing_Context $context ): Css_Processing_Context {
        $css_rules = $context->get_metadata( 'css_rules', [] );
        $variable_definitions = $context->get_metadata( 'css_variable_definitions', [] );
        
        $resolved_rules = $this->resolve_variables_in_rules( $css_rules, $variable_definitions );
        
        $context->set_metadata( 'css_rules', $resolved_rules );
        
        return $context;
    }
    
    private function resolve_variables_in_rules( array $css_rules, array $variable_definitions ): array {
        $resolved_rules = [];
        
        foreach ( $css_rules as $rule ) {
            $resolved_properties = [];
            
            foreach ( $rule['properties'] as $property_data ) {
                $property = $property_data['property'] ?? '';
                $value = $property_data['value'] ?? '';
                
                if ( strpos( $property, '--' ) === 0 ) {
                    $variable_type = $this->get_variable_type( $property, $variable_definitions );
                    
                    if ( $variable_type === 'color' || $variable_type === 'font' ) {
                        continue;
                    }
                }
                
                if ( strpos( $value, 'var(' ) !== false ) {
                    $resolved_value = $this->resolve_variable_reference( $value, $variable_definitions );
                    $property_data['value'] = $resolved_value;
                    $property_data['resolved_from_variable'] = true;
                }
                
                $resolved_properties[] = $property_data;
            }
            
            $rule['properties'] = $resolved_properties;
            $resolved_rules[] = $rule;
        }
        
        return $resolved_rules;
    }
    
    private function resolve_variable_reference( string $value, array $variable_definitions ): string {
        return preg_replace_callback(
            '/var\s*\(\s*(--[a-zA-Z0-9_-]+)\s*(?:,\s*([^)]+))?\s*\)/',
            function( $matches ) use ( $variable_definitions ) {
                $var_name = trim( $matches[1] );
                $fallback = $matches[2] ?? '';
                
                $clean_name = ltrim( $var_name, '-' );
                
                if ( isset( $variable_definitions[ $clean_name ] ) ) {
                    $var_value = $variable_definitions[ $clean_name ]['value'] ?? '';
                    
                    if ( ! empty( $var_value ) ) {
                        return $var_value;
                    }
                }
                
                return ! empty( $fallback ) ? trim( $fallback ) : '0';
            },
            $value
        );
    }
    
    private function get_variable_type( string $var_name, array $variable_definitions ): string {
        $clean_name = ltrim( $var_name, '-' );
        
        if ( isset( $variable_definitions[ $clean_name ]['type'] ) ) {
            return $variable_definitions[ $clean_name ]['type'];
        }
        
        return 'local';
    }
}
```

---

### Component 3: Editor Variable Importer (NEW)

**Purpose**: Import color and font variables as global design tokens

**Location**: `plugins/elementor-css/modules/css-converter/services/variables/editor-variable-importer.php`

```php
class Editor_Variable_Importer {
    
    private $variables_repository;
    
    public function __construct() {
        $this->variables_repository = Plugin::$instance->modules_manager
            ->get_modules( 'variables' )
            ->get_repository();
    }
    
    public function import_variables( array $variable_definitions ): array {
        const IMPORT_RESULT_CREATED = 'created';
        const IMPORT_RESULT_UPDATED = 'updated';
        const IMPORT_RESULT_SKIPPED = 'skipped';
        
        $results = [
            self::IMPORT_RESULT_CREATED => [],
            self::IMPORT_RESULT_UPDATED => [],
            self::IMPORT_RESULT_SKIPPED => [],
        ];
        
        foreach ( $variable_definitions as $var_name => $var_data ) {
            $type = $var_data['type'] ?? 'local';
            
            if ( $type !== 'color' && $type !== 'font' ) {
                $results[self::IMPORT_RESULT_SKIPPED][] = $var_name;
                continue;
            }
            
            $result = $this->create_or_update_variable( $var_name, $var_data, $type );
            
            if ( $result === self::IMPORT_RESULT_CREATED || $result === self::IMPORT_RESULT_UPDATED ) {
                $results[ $result ][] = $var_name;
            } else {
                $results[self::IMPORT_RESULT_SKIPPED][] = $var_name;
            }
        }
        
        return $results;
    }
    
    private function create_or_update_variable( string $var_name, array $var_data, string $type ): string {
        $variable_id = $this->normalize_variable_id( $var_name );
        $variable_label = $this->normalize_variable_label( $var_name );
        
        $existing = $this->variables_repository->get( $variable_id );
        
        if ( $existing ) {
            return 'updated';
        }
        
        $variable_value = $this->prepare_variable_value( $var_data['value'], $type );
        
        $this->variables_repository->create( [
            'id' => $variable_id,
            'label' => $variable_label,
            'type' => $type,
            'value' => $variable_value,
        ] );
        
        return 'created';
    }
    
    private function normalize_variable_id( string $var_name ): string {
        $clean = ltrim( $var_name, '-' );
        $clean = str_replace( '--e-global-color-', 'imported-color-', $clean );
        $clean = str_replace( '--e-global-typography-', 'imported-font-', $clean );
        
        return sanitize_key( $clean );
    }
    
    private function normalize_variable_label( string $var_name ): string {
        $clean = ltrim( $var_name, '-' );
        $clean = str_replace( '-', ' ', $clean );
        
        return ucwords( $clean );
    }
    
    private function prepare_variable_value( string $value, string $type ): string {
        if ( $type === 'color' ) {
            return $this->normalize_color( $value );
        }
        
        return $value;
    }
    
    private function normalize_color( string $color ): string {
        if ( strpos( $color, '#' ) === 0 ) {
            return strtolower( $color );
        }
        
        return $color;
    }
}
```

---

### Component 4: Property Mapper Enhancement

**Current**: `Widget_Class_Processor` skips CSS variables (line 618-619)

**Enhancement Needed**:
```php
private function convert_properties_to_atomic( array $properties, $property_conversion_service, Css_Processing_Context $context ): array {
    $converted_properties = [];
    $variable_definitions = $context->get_metadata( 'css_variable_definitions', [] );

    foreach ( $properties as $property_data ) {
        $property = $property_data['property'] ?? '';
        $value = $property_data['value'] ?? '';
        $important = $property_data['important'] ?? false;

        if ( strpos( $property, '--' ) === 0 ) {
            $variable_type = $this->get_variable_type( $property, $variable_definitions );
            
            if ( $variable_type === 'color' || $variable_type === 'font' ) {
                continue;
            }
            
            if ( $variable_type === 'local' ) {
                $resolved_property = $this->convert_css_variable_to_property( $property );
                $resolved_value = $variable_definitions[ ltrim( $property, '-' ) ]['value'] ?? '';
                
                if ( $resolved_property && $resolved_value ) {
                    $property = $resolved_property;
                    $value = $resolved_value;
                } else {
                    continue;
                }
            } else {
                continue;
            }
        }

        $converted = $property_conversion_service->convert( $property, $value );

        if ( null !== $converted && isset( $converted['property'] ) ) {
            $converted['important'] = $important;
            $converted['original_property'] = $property_data['property'] ?? '';
            $converted['original_value'] = $property_data['value'] ?? '';
            $converted_properties[] = $converted;
        }
    }

    return $converted_properties;
}

private function convert_css_variable_to_property( string $css_variable ): ?string {
    const CSS_VARIABLE_TO_PROPERTY_MAP = [
        '--display' => 'display',
        '--flex-direction' => 'flex-direction',
        '--justify-content' => 'justify-content',
        '--align-items' => 'align-items',
        '--gap' => 'gap',
        '--flex-wrap' => 'flex-wrap',
        '--width' => 'width',
        '--height' => 'height',
        '--margin-top' => 'margin-top',
        '--margin-right' => 'margin-right',
        '--margin-bottom' => 'margin-bottom',
        '--margin-left' => 'margin-left',
        '--padding-top' => 'padding-top',
        '--padding-right' => 'padding-right',
        '--padding-bottom' => 'padding-bottom',
        '--padding-left' => 'padding-left',
    ];
    
    return self::CSS_VARIABLE_TO_PROPERTY_MAP[ $css_variable ] ?? null;
}

private function get_variable_type( string $var_name, array $variable_definitions ): string {
    $clean_name = ltrim( $var_name, '-' );
    
    if ( isset( $variable_definitions[ $clean_name ]['type'] ) ) {
        return $variable_definitions[ $clean_name ]['type'];
    }
    
    return 'unsupported';
}
```

---

## Implementation Plan

### Phase 1: Variable Classification (Week 1)

**Tasks**:
1. Enhance `Css_Variable_Registry_Processor` with classification logic
2. Add `type` field to variable definitions (`color`, `font`, `local`, `unsupported`)
3. Implement classification methods
4. Add unit tests for classification

**Files**:
- `plugins/elementor-css/modules/css-converter/services/css/processing/processors/css-variable-registry-processor.php`

**Tests**:
- Color variable detection (global and custom)
- Font variable detection
- Local variable detection (flex, sizing, spacing)
- Unsupported variable detection

---

### Phase 2: CSS Variable Resolver (Week 2)

**Tasks**:
1. Create `Css_Variable_Resolver` processor
2. Implement variable resolution logic
3. Handle nested variables and fallbacks
4. Add integration tests

**Files**:
- `plugins/elementor-css/modules/css-converter/services/css/processing/processors/css-variable-resolver.php`

**Tests**:
- Simple variable resolution
- Nested variable resolution
- Fallback handling
- Complex value resolution (`calc()`, multiple vars)

---

### Phase 3: Editor Variable Importer (Week 3)

**Tasks**:
1. Create `Editor_Variable_Importer` service
2. Integrate with Elementor Variables Module
3. Implement import/update logic
4. Add API endpoint integration

**Files**:
- `plugins/elementor-css/modules/css-converter/services/variables/editor-variable-importer.php`

**Tests**:
- Variable creation in Kit
- Variable update logic
- Duplicate handling
- Type validation

---

### Phase 4: Property Mapper Integration (Week 4)

**Tasks**:
1. Update `Widget_Class_Processor` to handle classified variables
2. Add CSS variable to property mapping
3. Preserve editor variables in atomic properties
4. Resolve local variables before conversion

**Files**:
- `plugins/elementor-css/modules/css-converter/services/css/processing/processors/widget-class-processor.php`

**Tests**:
- Color variables preserved
- Font variables preserved
- Local variables resolved
- Flex properties from variables

---

### Phase 5: End-to-End Testing (Week 5)

**Tasks**:
1. Create Playwright tests for full conversion flow
2. Test all variable types
3. Test flex container conversion
4. Test color/font variable import

**Files**:
- `plugins/elementor-css/tests/playwright/sanity/modules/css-converter/css-variables/`

**Test Cases**:
- Flex container with local variables
- Text widget with color variables
- Heading with font variables
- Mixed variable types

---

## Success Criteria

### Functional Requirements

1. **Local Variables Resolved** ✅
   - Flex properties from variables applied to containers
   - Sizing properties from variables converted correctly
   - Spacing properties from variables converted correctly

2. **Editor Variables Imported** ✅
   - Color variables imported to Kit
   - Font variables imported to Kit
   - Variables accessible in editor UI

3. **Backward Compatibility** ✅
   - Existing conversions still work
   - Non-variable properties unaffected
   - CSS cleaning logic preserved

### Technical Requirements

1. **Performance**
   - Variable resolution adds < 100ms to conversion time
   - No N+1 queries for variable import
   - Memory usage increase < 10MB

2. **Maintainability**
   - Clear separation of concerns
   - Comprehensive documentation
   - Unit test coverage > 90%

---

## Risk Assessment

### High Risk

1. **Variable Resolution Complexity**
   - **Risk**: Nested variables may cause infinite loops
   - **Mitigation**: Implement depth limit, cycle detection

2. **Editor Variables Limit**
   - **Risk**: Kit has 100-variable limit
   - **Mitigation**: Prioritize variables, smart filtering

### Medium Risk

1. **Property Mapper Performance**
   - **Risk**: Resolving variables may slow conversion
   - **Mitigation**: Cache resolutions, optimize lookups

2. **Test Coverage**
   - **Risk**: Edge cases may be missed
   - **Mitigation**: Comprehensive Playwright tests

---

## Future Enhancements

### Phase 6: Size Variable Support (Post-MVP)

**Possibility**: Add `Size_Variable_Prop_Type` to v4 editor variables

**Benefits**:
- Import sizing variables as design tokens
- Consistent spacing system
- Better theme portability

**Requires**:
- Core Elementor changes
- Variables module enhancement
- Frontend rendering updates

### Phase 7: Advanced Variable Features

**Features**:
- Variable nesting resolution
- Variable transformations (calc, math)
- Variable inheritance
- Variable scoping

---

## Appendix

### A. Variable Type Reference

| Type | Core Support | Pro Support | Import to Kit | Resolve to Value | Example |
|------|--------------|-------------|---------------|------------------|---------|
| Color | ✅ | ✅ | ✅ | ❌ | `--brand-blue: #007bff` |
| Font | ✅ | ✅ | ✅ | ❌ | `--heading-font: Georgia` |
| **Size** | **❌** | **✅** | **✅** | **❌** | **`--spacing: 20px`** |
| **Gap** | **❌** | **✅** | **✅** | **❌** | **`--gap: 1.5rem`** |
| **Width/Height** | **❌** | **✅** | **✅** | **❌** | **`--width: 100%`** |
| **Margin/Padding** | **❌** | **✅** | **✅** | **❌** | **`--margin: 10px`** |
| Display | ❌ | ❌ | ❌ | ✅ | `--display: flex` |
| Flex Direction | ❌ | ❌ | ❌ | ✅ | `--flex-direction: row` |
| Justify Content | ❌ | ❌ | ❌ | ✅ | `--justify-content: space-between` |
| Align Items | ❌ | ❌ | ❌ | ✅ | `--align-items: center` |

**Pro Variable Support Requirements**:
- ✅ Elementor Pro installed and active
- ✅ `e_pro_variables` experiment enabled (default: active)
- ✅ Valid Pro license with `size-variable` feature
- ✅ `e_atomic_elements` experiment enabled
- ✅ `e_opt_in_v4_page` experiment enabled

### B. Code Examples

**Example 1: Flex Container with Local Variables**

Input CSS:
```css
.container {
    --display: flex;
    --justify-content: space-between;
    --align-items: center;
}

.container .inner {
    display: var(--display);
    justify-content: var(--justify-content);
    align-items: var(--align-items);
}
```

Expected Output:
```json
{
  "widgetType": "e-container",
  "settings": {
    "display": {
      "$$type": "string",
      "value": "flex"
    },
    "justify-content": {
      "$$type": "string",
      "value": "space-between"
    },
    "align-items": {
      "$$type": "string",
      "value": "center"
    }
  }
}
```

**Example 2: Text Widget with Color Variable**

Input CSS:
```css
:root {
    --brand-primary: #007bff;
}

.text {
    color: var(--brand-primary);
}
```

Expected Output:
```json
{
  "widgetType": "e-paragraph",
  "settings": {
    "color": {
      "$$type": "color",
      "value": "var(--e-global-color-imported-brand-primary)"
    }
  }
}
```

Kit Variable Created:
```json
{
  "id": "imported-brand-primary",
  "label": "Brand Primary",
  "type": "color",
  "value": "#007bff"
}
```

---

**Last Updated**: November 1, 2025  
**Status**: Ready for Implementation  
**Estimated Effort**: 5 weeks  
**Priority**: High

