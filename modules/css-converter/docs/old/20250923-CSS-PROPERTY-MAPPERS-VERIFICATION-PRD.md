# CSS Property Mappers Verification - Product Requirements Document

## Overview

This PRD defines a comprehensive verification process to ensure all CSS property mappers in the CSS Converter module correctly align with Elementor's atomic widget prop transformers. The goal is to identify missing styling support and ensure 100% compatibility with Elementor's rendering system.

## Problem Statement

The CSS Converter module may have incomplete or incorrect property mappers that don't align with Elementor's atomic widget prop transformers. This can result in:
- Missing styling in converted widgets
- Incorrect atomic property structures
- Unsupported CSS properties
- Inconsistent behavior between backup and current implementations

## Objectives

### Primary Goals
1. **Complete Coverage**: Verify all CSS properties have corresponding mappers
2. **Correct Implementation**: Ensure mappers produce atomic structures matching Elementor's transformers
3. **Backup Comparison**: Identify regressions from backup implementations
4. **Missing Styling Detection**: Find and fix all gaps in styling support

### Success Criteria
- [ ] 100% of common CSS properties have working mappers
- [ ] All mappers produce atomic structures matching Elementor's prop transformers
- [ ] No regressions from backup implementations
- [ ] Zero unsupported properties in test scenarios
- [ ] All styling renders correctly in Elementor editor

## Verification Methodology

### Phase 1: Atomic Widget Prop Transformer Analysis

#### 1.1 Catalog All Elementor Prop Transformers
**Location**: `/plugins/elementor/modules/atomic-widgets/prop-types/`

**Action Items**:
- [ ] List all prop type files
- [ ] Document expected atomic structure for each
- [ ] Identify CSS properties each transformer handles
- [ ] Map transformer → CSS property relationships

#### 1.2 Analyze Transformer Implementation
For each prop transformer:
- [ ] Document `define_shape()` method structure
- [ ] Identify validation rules
- [ ] Note special handling (units, enums, nested structures)
- [ ] Document expected input/output formats

### Phase 2: Current Property Mapper Audit

#### 2.1 Enhanced Property Mapper Analysis
**File**: `convertors/css-properties/implementations/enhanced_property_mapper.php`

**Verification Points**:
- [ ] List all supported properties in `get_atomic_result()`
- [ ] Verify atomic structure matches transformers
- [ ] Check property name mapping in `get_schema_property_name()`
- [ ] Validate shorthand parsing logic
- [ ] Test edge case handling

#### 2.2 Property Registry Analysis
**File**: `convertors/css-properties/implementations/class_property_mapper_registry.php`

**Verification Points**:
- [ ] List all registered properties
- [ ] Compare against transformer capabilities
- [ ] Identify missing registrations
- [ ] Verify mapper instantiation

### Phase 3: Backup Implementation Comparison

#### 3.1 Backup Property Mappers Analysis
**Location**: `backup/convertors/css-properties/properties/`

**Action Items**:
- [ ] Catalog all backup property mapper files
- [ ] Document supported properties per mapper
- [ ] Analyze atomic structure generation
- [ ] Identify advanced features (gradients, shadows, transforms)

#### 3.2 Regression Analysis
Compare backup vs current:
- [ ] Missing property mappers
- [ ] Reduced functionality
- [ ] Changed atomic structures
- [ ] Lost edge case handling

### Phase 4: Critical Property Deep Dive

#### 4.1 Spacing Properties
**Properties**: `margin`, `padding`, `margin-*`, `padding-*`

**Verification**:
- [ ] Shorthand parsing (1, 2, 3, 4 values)
- [ ] Individual property support
- [ ] Dimensions vs Size prop type usage
- [ ] Logical property mapping (block-start, inline-end, etc.)

**Expected Transformer**: `Dimensions_Prop_Type`
**Expected Structure**:
```json
{
  "$$type": "dimensions",
  "value": {
    "block-start": {"$$type": "size", "value": {"size": 10, "unit": "px"}},
    "inline-end": {"$$type": "size", "value": {"size": 20, "unit": "px"}},
    "block-end": {"$$type": "size", "value": {"size": 10, "unit": "px"}},
    "inline-start": {"$$type": "size", "value": {"size": 20, "unit": "px"}}
  }
}
```

#### 4.2 Shadow Properties
**Properties**: `box-shadow`, `text-shadow`

**Verification**:
- [ ] Multiple shadow support
- [ ] Inset shadow handling
- [ ] Color parsing (hex, rgba, named)
- [ ] Offset, blur, spread parsing
- [ ] Shadow_Prop_Type vs Box_Shadow_Prop_Type usage

**Expected Transformer**: `Box_Shadow_Prop_Type`, `Shadow_Prop_Type`
**Expected Structure**:
```json
{
  "$$type": "box-shadow",
  "value": [
    {
      "$$type": "shadow",
      "value": {
        "hOffset": {"$$type": "size", "value": {"size": 0, "unit": "px"}},
        "vOffset": {"$$type": "size", "value": {"size": 4, "unit": "px"}},
        "blur": {"$$type": "size", "value": {"size": 15, "unit": "px"}},
        "spread": {"$$type": "size", "value": {"size": 0, "unit": "px"}},
        "color": {"$$type": "color", "value": "rgba(0,0,0,0.1)"},
        "position": null
      }
    }
  ]
}
```

#### 4.3 Background Properties
**Properties**: `background`, `background-color`, `background-image`, `background-gradient`

**Verification**:
- [ ] Solid color support
- [ ] Linear gradient support
- [ ] Radial gradient support
- [ ] Background image URLs
- [ ] Complex background shorthand
- [ ] Background_Prop_Type structure

**Expected Transformer**: `Background_Prop_Type`
**Expected Structure**:
```json
{
  "$$type": "background",
  "value": {
    "color": "#ffffff",
    "background-overlay": {
      "$$type": "background-overlay",
      "value": [
        {
          "$$type": "background-gradient-overlay",
          "value": {
            "type": {"$$type": "string", "value": "linear"},
            "angle": {"$$type": "number", "value": 45},
            "stops": {"$$type": "gradient-color-stop", "value": [...]}
          }
        }
      ]
    }
  }
}
```

#### 4.4 Transform Properties
**Properties**: `transform`, `rotate`, `scale`, `translate`

**Verification**:
- [ ] Multiple transform function support
- [ ] Individual transform properties
- [ ] 3D transform support
- [ ] Transform_Prop_Type structure

#### 4.5 Typography Properties
**Properties**: `font-size`, `font-weight`, `line-height`, `letter-spacing`, `text-align`, `text-decoration`, `text-transform`

**Verification**:
- [ ] Size_Prop_Type vs String_Prop_Type usage
- [ ] Font weight keyword mapping
- [ ] Unitless line-height handling
- [ ] Text decoration combinations

#### 4.6 Layout Properties
**Properties**: `display`, `position`, `flex-direction`, `align-items`, `justify-content`, `gap`, `width`, `height`

**Verification**:
- [ ] Flexbox property support
- [ ] Grid property support (if available)
- [ ] Position property values
- [ ] Size property handling

## Implementation Plan

### Week 1: Analysis & Documentation
1. **Day 1-2**: Catalog all Elementor prop transformers
2. **Day 3-4**: Analyze current property mappers
3. **Day 5**: Compare with backup implementations

### Week 2: Gap Analysis & Testing
1. **Day 1-2**: Identify missing/incorrect mappers
2. **Day 3-4**: Create comprehensive test cases
3. **Day 5**: Document all findings

### Week 3: Implementation & Fixes
1. **Day 1-3**: Implement missing mappers
2. **Day 4-5**: Fix incorrect atomic structures

### Week 4: Verification & Testing
1. **Day 1-3**: End-to-end testing
2. **Day 4-5**: Performance and edge case testing

## Test Cases

### Test Case 1: Spacing Properties Comprehensive
```html
<style>
.test1 { margin: 10px; }
.test2 { margin: 10px 20px; }
.test3 { margin: 10px 20px 15px; }
.test4 { margin: 10px 20px 15px 25px; }
.test5 { padding: 5px; }
.test6 { margin-top: 10px; padding-left: 15px; }
</style>
<div class="test1">Single margin</div>
<div class="test2">Two-value margin</div>
<div class="test3">Three-value margin</div>
<div class="test4">Four-value margin</div>
<div class="test5">Single padding</div>
<div class="test6">Individual properties</div>
```

**Expected**: All spacing rendered correctly with proper Dimensions_Prop_Type structure

### Test Case 2: Shadow Properties Comprehensive
```html
<style>
.shadow1 { box-shadow: 0 4px 15px rgba(0,0,0,0.1); }
.shadow2 { box-shadow: inset 0 2px 4px #000, 0 8px 16px rgba(255,0,0,0.3); }
.shadow3 { text-shadow: 2px 2px 4px rgba(0,0,0,0.5); }
.shadow4 { text-shadow: 1px 1px 2px #000, -1px -1px 2px #fff; }
</style>
<div class="shadow1">Single box shadow</div>
<div class="shadow2">Multiple box shadows with inset</div>
<div class="shadow3">Single text shadow</div>
<div class="shadow4">Multiple text shadows</div>
```

**Expected**: All shadows rendered correctly with proper Shadow_Prop_Type structure

### Test Case 3: Background Properties Comprehensive
```html
<style>
.bg1 { background-color: #ff0000; }
.bg2 { background: linear-gradient(45deg, #667eea, #764ba2); }
.bg3 { background: radial-gradient(circle, #ff0000, #0000ff); }
.bg4 { background-image: url('image.jpg'); }
.bg5 { background: #fff url('image.jpg') no-repeat center; }
</style>
<div class="bg1">Solid background</div>
<div class="bg2">Linear gradient</div>
<div class="bg3">Radial gradient</div>
<div class="bg4">Background image</div>
<div class="bg5">Complex background</div>
```

**Expected**: All backgrounds rendered correctly with proper Background_Prop_Type structure

### Test Case 4: Transform Properties Comprehensive
```html
<style>
.transform1 { transform: rotate(45deg); }
.transform2 { transform: scale(1.5); }
.transform3 { transform: translate(10px, 20px); }
.transform4 { transform: rotate(45deg) scale(1.2) translate(10px, 5px); }
</style>
<div class="transform1">Rotate</div>
<div class="transform2">Scale</div>
<div class="transform3">Translate</div>
<div class="transform4">Combined transforms</div>
```

**Expected**: All transforms rendered correctly with proper Transform_Prop_Type structure

## Deliverables

### Documentation
1. **Prop Transformer Catalog** - Complete list with structures
2. **Property Mapper Audit Report** - Current state analysis
3. **Gap Analysis Report** - Missing/incorrect implementations
4. **Regression Report** - Backup vs current comparison

### Implementation
1. **Updated Enhanced Property Mapper** - Complete property support
2. **Updated Property Registry** - All properties registered
3. **Comprehensive Test Suite** - All edge cases covered
4. **Performance Benchmarks** - Conversion speed metrics

### Verification
1. **Test Results Report** - All test cases passing
2. **Visual Verification** - Screenshots of rendered output
3. **Performance Report** - Conversion time analysis
4. **Edge Case Report** - Unusual input handling

## Success Metrics

### Functional Metrics
- **Property Coverage**: 100% of common CSS properties supported
- **Test Pass Rate**: 100% of test cases passing
- **Unsupported Properties**: 0 in standard use cases
- **Regression Count**: 0 regressions from backup

### Performance Metrics
- **Conversion Time**: < 100ms for typical HTML/CSS
- **Memory Usage**: < 50MB for large documents
- **Error Rate**: < 0.1% for valid CSS input

### Quality Metrics
- **Atomic Structure Accuracy**: 100% match with transformers
- **Edge Case Handling**: 95% of edge cases handled gracefully
- **Visual Accuracy**: 99% visual match with expected output

## Risk Mitigation

### High Risk: Breaking Changes
- **Mitigation**: Comprehensive backup before changes
- **Rollback Plan**: Restore from backup if critical issues

### Medium Risk: Performance Degradation
- **Mitigation**: Performance testing at each step
- **Optimization**: Profile and optimize slow operations

### Low Risk: Edge Case Failures
- **Mitigation**: Extensive edge case testing
- **Graceful Degradation**: Fallback to basic property types

## Conclusion

This comprehensive verification process will ensure the CSS Converter module has complete and correct property mapper coverage, matching Elementor's atomic widget system perfectly. The systematic approach will identify all gaps and ensure no styling is lost in the conversion process.
