# ID Selector Direct Styling - Product Requirements Document

## Overview

This PRD defines the implementation of CSS ID selector processing that applies styling directly to Elementor widgets without creating intermediate CSS classes or adding ID attributes to the final widgets.

## Problem Statement

Currently, the CSS Converter processes class selectors and element selectors but does not properly handle CSS ID selectors (`#id`). When HTML contains elements with IDs that have corresponding CSS rules, these styles are not applied to the resulting Elementor widgets, leading to lost styling information.

## Solution Overview

Implement ID selector processing that:
1. Parses CSS ID selectors from `<style>` tags
2. Matches HTML elements with corresponding IDs
3. Applies ID-based styling directly to widgets with highest CSS specificity
4. Does not add ID attributes to final Elementor widgets
5. Supports complex CSS properties (gradients, shadows, transforms, etc.)

## Requirements

### Functional Requirements

#### FR1: CSS ID Selector Parsing
- **Requirement**: Parse CSS ID selectors (`#id`) from embedded `<style>` tags
- **Input**: CSS containing ID selectors like `#container { background: red; }`
- **Output**: Parsed CSS rules with ID selector information
- **Priority**: HIGH

#### FR2: HTML-CSS ID Matching
- **Requirement**: Match HTML elements with `id` attributes to corresponding CSS ID rules
- **Input**: HTML element `<div id="container">` and CSS rule `#container { ... }`
- **Output**: Matched element-style pairs
- **Priority**: HIGH

#### FR3: Direct Widget Styling Application
- **Requirement**: Apply ID-based styles directly to widget's `styles` array
- **Input**: Matched element-style pairs
- **Output**: Elementor v4 atomic widget with populated `styles` array
- **Priority**: HIGH

#### FR4: CSS Specificity Compliance
- **Requirement**: ID selectors must have higher specificity than class and element selectors
- **Specificity Order**: `!important` > inline styles > ID selectors > class selectors > element selectors
- **Priority**: HIGH

#### FR5: Complex CSS Property Support
- **Requirement**: Support advanced CSS properties in ID selectors
- **Supported Properties**:
  - Gradients: `background: linear-gradient(...)`
  - Shadows: `box-shadow`, `text-shadow`
  - Transforms: `transform: rotate(...)`
  - Animations: `transition`, `animation`
  - All existing property mappers
- **Priority**: MEDIUM

#### FR6: No ID Attribute Injection
- **Requirement**: Final Elementor widgets must NOT contain `id` attributes
- **Rationale**: ID styling is applied directly, no need for CSS selectors
- **Priority**: HIGH

### Non-Functional Requirements

#### NFR1: Performance
- **Requirement**: ID selector processing should not significantly impact conversion time
- **Target**: < 10% performance overhead
- **Priority**: MEDIUM

#### NFR2: Memory Usage
- **Requirement**: ID selector processing should not significantly increase memory usage
- **Target**: < 20% memory overhead
- **Priority**: LOW

#### NFR3: Backward Compatibility
- **Requirement**: Existing functionality must remain unaffected
- **Priority**: HIGH

## Technical Specifications

### API Contract

#### Input Format
```json
{
    "type": "html",
    "content": "<style>#container { background: linear-gradient(45deg, #667eea, #764ba2); padding: 40px 20px; border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.1); } #title { color: white; font-size: 32px; font-weight: 700; text-align: center; text-shadow: 2px 2px 4px rgba(0,0,0,0.3); } #subtitle { color: #e0e6ed; font-size: 18px; margin-top: 10px; }</style><div id=\"container\"><h1 id=\"title\">Premium Design</h1><p id=\"subtitle\">Beautiful gradients and shadows</p></div>",
    "options": {
        "createGlobalClasses": false
    }
}
```

#### Expected Output Format
```json
[{
    "id": "widget-uuid",
    "elType": "e-flexbox",
    "settings": {
        "direction": "column",
        "classes": {"$$type": "classes", "value": ["generated-class-id"]}
    },
    "styles": {
        "generated-class-id": {
            "id": "generated-class-id",
            "label": "local",
            "type": "class",
            "variants": [{
                "meta": {"breakpoint": "desktop", "state": null},
                "props": {
                    "background": {
                        "$$type": "background",
                        "value": {
                            "gradient": {
                                "$$type": "gradient",
                                "value": {
                                    "type": "linear",
                                    "angle": 45,
                                    "stops": [
                                        {"color": "#667eea", "position": 0},
                                        {"color": "#764ba2", "position": 100}
                                    ]
                                }
                            }
                        }
                    },
                    "padding": {
                        "$$type": "dimensions",
                        "value": {
                            "block-start": {"$$type": "size", "value": {"size": 40, "unit": "px"}},
                            "inline-end": {"$$type": "size", "value": {"size": 20, "unit": "px"}},
                            "block-end": {"$$type": "size", "value": {"size": 40, "unit": "px"}},
                            "inline-start": {"$$type": "size", "value": {"size": 20, "unit": "px"}}
                        }
                    },
                    "border-radius": {
                        "$$type": "dimensions",
                        "value": {"size": 12, "unit": "px"}
                    },
                    "box-shadow": {
                        "$$type": "shadow",
                        "value": {
                            "horizontal": 0,
                            "vertical": 4,
                            "blur": 15,
                            "spread": 0,
                            "color": "rgba(0,0,0,0.1)"
                        }
                    }
                }
            }]
        }
    },
    "elements": [
        {
            "id": "heading-uuid",
            "elType": "widget",
            "widgetType": "e-heading",
            "settings": {
                "title": "Premium Design",
                "tag": {"$$type": "string", "value": "h1"},
                "classes": {"$$type": "classes", "value": ["heading-class-id"]}
            },
            "styles": {
                "heading-class-id": {
                    "id": "heading-class-id",
                    "label": "local",
                    "type": "class",
                    "variants": [{
                        "meta": {"breakpoint": "desktop", "state": null},
                        "props": {
                            "color": {"$$type": "color", "value": "white"},
                            "font-size": {"$$type": "size", "value": {"size": 32, "unit": "px"}},
                            "font-weight": {"$$type": "string", "value": "700"},
                            "text-align": {"$$type": "string", "value": "center"},
                            "text-shadow": {
                                "$$type": "text-shadow",
                                "value": {
                                    "horizontal": 2,
                                    "vertical": 2,
                                    "blur": 4,
                                    "color": "rgba(0,0,0,0.3)"
                                }
                            }
                        }
                    }]
                }
            }
        }
    ]
}]
```

### Implementation Architecture

#### Component Modifications

##### 1. CSS Parser Enhancement
**File**: `services/css/processing/css-processor.php`

**New Methods**:
```php
private function extract_id_selectors(array $css_rules): array
private function match_elements_to_id_selectors(array $elements, array $id_selectors): array
private function calculate_id_specificity(string $selector): int
```

##### 2. Specificity Calculator Update
**File**: `services/css/processing/css-specificity-calculator.php`

**Enhanced Constants**:
```php
const ID_WEIGHT = 100;        // ID selectors
const CLASS_WEIGHT = 10;      // Class selectors  
const ELEMENT_WEIGHT = 1;     // Element selectors
const INLINE_WEIGHT = 1000;   // Inline styles
const IMPORTANT_WEIGHT = 10000; // !important
```

##### 3. Widget Creator Enhancement
**File**: `services/widgets/widget-creator.php`

**New Methods**:
```php
private function apply_id_styles_to_widget(array $widget, array $id_styles): array
private function merge_id_styles_with_existing(array $existing_styles, array $id_styles): array
```

#### Data Flow

```
1. HTML Input with <style> and id attributes
   ↓
2. CSS Parser extracts ID selectors (#id { ... })
   ↓
3. HTML Parser identifies elements with id attributes
   ↓
4. CSS Processor matches elements to ID selectors
   ↓
5. Specificity Calculator ensures ID rules have highest priority
   ↓
6. Property Mappers convert CSS properties to v4 format
   ↓
7. Widget Creator applies styles directly to widget's styles array
   ↓
8. Final widget output (no id attributes, styles applied directly)
```

## Test Cases

### Test Case 1: Basic ID Styling
**Input**:
```html
<style>#box { background: red; }</style>
<div id="box">Content</div>
```

**Expected Output**:
- Widget with `background: {"$$type": "color", "value": "red"}` in styles array
- No `id` attribute in final widget

### Test Case 2: Complex Gradient Styling
**Input**: As provided in original requirement

**Expected Output**: As specified in API contract above

### Test Case 3: Multiple ID Selectors
**Input**:
```html
<style>
#header { background: blue; }
#content { padding: 20px; }
#footer { color: gray; }
</style>
<div id="header">Header</div>
<div id="content">Content</div>
<div id="footer">Footer</div>
```

**Expected Output**: Three separate widgets with respective styling applied

### Test Case 4: ID vs Class Specificity
**Input**:
```html
<style>
.container { background: red; }
#container { background: blue; }
</style>
<div id="container" class="container">Content</div>
```

**Expected Output**: Widget with blue background (ID selector wins)

### Test Case 5: Non-matching IDs
**Input**:
```html
<style>#nonexistent { background: red; }</style>
<div id="existing">Content</div>
```

**Expected Output**: Widget with no additional styling from ID selector

## Implementation Plan

### Phase 1: Core ID Processing (Week 1)
1. **CSS Parser Enhancement**
   - Add ID selector extraction
   - Update CSS rule parsing to handle ID selectors
   - Test with various ID selector formats

2. **Element-ID Matching**
   - Implement HTML element to ID selector matching
   - Handle multiple IDs per document
   - Test matching accuracy

### Phase 2: Specificity & Application (Week 2)
1. **Specificity Calculator Update**
   - Add ID specificity constants
   - Update specificity calculation logic
   - Test specificity ordering

2. **Widget Creator Enhancement**
   - Implement direct style application
   - Ensure no ID attributes in output
   - Test with complex CSS properties

### Phase 3: Advanced Features (Week 3)
1. **Complex Property Support**
   - Gradients, shadows, transforms
   - Animation properties
   - Custom CSS properties

2. **Edge Case Handling**
   - Multiple IDs on same element
   - Conflicting ID selectors
   - Invalid CSS handling

### Phase 4: Testing & Optimization (Week 4)
1. **Comprehensive Testing**
   - Unit tests for all components
   - Integration tests for full pipeline
   - Performance benchmarking

2. **Documentation & Examples**
   - Update API documentation
   - Create usage examples
   - Performance optimization

## Success Criteria

### Primary Success Criteria
- ✅ ID selectors are parsed correctly from CSS
- ✅ HTML elements with IDs are matched to corresponding CSS rules
- ✅ ID-based styling is applied directly to widgets
- ✅ No ID attributes appear in final Elementor widgets
- ✅ CSS specificity rules are properly followed
- ✅ Complex CSS properties (gradients, shadows) work correctly

### Secondary Success Criteria
- ✅ Performance impact < 10%
- ✅ Memory usage increase < 20%
- ✅ All existing functionality remains unaffected
- ✅ Comprehensive test coverage (>90%)

## Risk Assessment

### High Risk
- **CSS Parsing Complexity**: ID selectors with pseudo-classes, combinators
- **Property Mapping**: Complex CSS properties may not have existing mappers
- **Performance Impact**: Additional processing may slow down conversion

### Medium Risk
- **Specificity Edge Cases**: Complex specificity calculations
- **Memory Usage**: Storing additional ID-style mappings

### Low Risk
- **Backward Compatibility**: Well-isolated feature
- **API Changes**: No breaking changes to existing API

## Dependencies

### Internal Dependencies
- All existing property mappers in `convertors/css-properties/properties/`
- CSS parsing infrastructure in `parsers/`
- Widget creation pipeline in `services/widgets/`

### External Dependencies
- Sabberworm CSS Parser (already in use)
- WordPress REST API framework
- Elementor v4 atomic widget format

## Acceptance Criteria

1. **Functional Testing**: All test cases pass
2. **Performance Testing**: < 10% performance degradation
3. **Integration Testing**: Works with existing CSS Converter features
4. **Documentation**: Complete API documentation and examples
5. **Code Quality**: Passes all linting and code review standards

---

**Document Version**: 1.0  
**Last Updated**: September 20, 2025  
**Next Review**: Upon implementation completion
