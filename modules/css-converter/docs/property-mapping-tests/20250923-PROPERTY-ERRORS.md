# Property Mapper Errors - September 23, 2025

Fundamental task:
- List the expected data structure inside the Atomic Widgets module for each transformer. This is missing here. I am expected each transformer.
- Also study the transformers inside the elementor-css/packages folder. This package is for the frontend and has validation schema's. 
- Study if we can use these scheme's for validation.
- Once we have a good understanding of the data structures, let's write PHPunit tests, with the goal that they will fail. All fundamental data validation aspects of the Atomic Widgets should be tested in the unit tests.
- Before writing the tests, make a proposal about how to write them.

- Before we start asksing for further improvements of the process and validation, let's first study what we have thoroughly.
- Question all of your assumptions. You keep on rushing and delivering poor quality work.
- Quality over quantity.
- Use debugging where possible.
- Create fundamental tests.


Follow up task:
- Wait for approval to start with this. 
- We need to ensure quality phpunit tests first.
- Study the failing tests, and start fixing the properties.
- Afterwards list ALL properties data schema's, and compare with the expected data schema afterwards.



## Current Issues Identified

### 1. **Margin Property - MISSING from Inner Div**
**HTML Input**: `margin: 0 auto 40px;`
**Expected JSON**: Should be present in props
**Actual JSON**: Completely missing from inner div styles
**Status**: ❌ CRITICAL - Property not converted at all

### 2. **Max-Width Property - WRONG TYPE**
**HTML Input**: `max-width: 500px;`
**Expected JSON**: `{"$$type":"size","value":{"size":500,"unit":"px"}}`
**Actual JSON**: `{"$$type":"string","value":"500px"}`
**Status**: ❌ WRONG TYPE - Using string instead of size

### 3. **Box-Shadow Property - WRONG TYPE**
**HTML Input**: `box-shadow: 0 4px 20px rgba(0,0,0,0.08);`
**Expected JSON**: `{"$$type":"box-shadow","value":[...]}`
**Actual JSON**: `{"$$type":"string","value":"0 4px 20px rgba(0,0,0,0.08)"}`
**Status**: ❌ WRONG TYPE - Using string instead of box-shadow

## Expected Data Structures (Based on Atomic Widgets Analysis)

### 1. **Size_Prop_Type** (max-width, width, height, etc.)
**Expected Structure**:
```json
{
  "$$type": "size",
  "value": {
    "size": 500,
    "unit": "px"
  }
}
```
**Key Requirements**:
- Must have `size` (numeric) and `unit` (string) properties
- Unit must be from supported units list
- Size must be numeric (not string)

### 2. **Box_Shadow_Prop_Type** (box-shadow)
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
        "blur": {"$$type": "size", "value": {"size": 20, "unit": "px"}},
        "spread": {"$$type": "size", "value": {"size": 0, "unit": "px"}},
        "color": {"$$type": "color", "value": "rgba(0,0,0,0.08)"},
        "position": null
      }
    }
  ]
}
```
**Key Requirements**:
- Array of Shadow_Prop_Type objects
- Each shadow has hOffset, vOffset, blur, spread (all Size_Prop_Type)
- Color is Color_Prop_Type
- Position is optional string ("inset" or null)

### 3. **Dimensions_Prop_Type** (margin, padding)
**Expected Structure**:
```json
{
  "$$type": "dimensions",
  "value": {
    "block-start": {"$$type": "size", "value": {"size": 0, "unit": "px"}},
    "inline-end": {"$$type": "size", "value": {"size": 0, "unit": "auto"}},
    "block-end": {"$$type": "size", "value": {"size": 40, "unit": "px"}},
    "inline-start": {"$$type": "size", "value": {"size": 0, "unit": "auto"}}
  }
}
```
**Key Requirements**:
- Uses logical properties (block-start, inline-end, block-end, inline-start)
- Each direction is a Size_Prop_Type
- Can handle "auto" values

## Critical Analysis of Our Property Mappers

### 1. **Dimension Property Mapper Issues**
**Problem**: Uses `create_v4_property()` which defaults to string type
**Code**: `return $this->create_v4_property( $property, $value );`
**Should Be**: `return $this->create_v4_property_with_type( $property, 'size', $parsed_size );`

### 2. **Box Shadow Property Mapper Issues**
**Problem**: Appears to have correct structure but may not be registered properly
**Need to Check**: Is it being called? Is the parsing correct?

### 3. **Margin Property Mapper Issues**
**Problem**: May not be handling shorthand `margin: 0 auto 40px` correctly
**Need to Check**: Does it parse 3-value shorthand? Does it handle "auto" values?

## Systematic Errors Identified

### 1. **Type Confusion**
- Many mappers use `create_v4_property()` instead of `create_v4_property_with_type()`
- This defaults to string type instead of proper atomic type
- **Root Cause**: Misunderstanding of the base class methods

### 2. **Incomplete Shorthand Parsing**
- Margin shorthand `0 auto 40px` may not be parsed correctly
- Need to verify all shorthand parsing logic
- **Root Cause**: Complex CSS shorthand rules not fully implemented

### 3. **Missing Validation**
- No validation that our output matches atomic widget expectations
- No tests comparing our output to atomic widget prop types
- **Root Cause**: Lack of systematic validation approach

## Critical Questions

### **Fundamental Architecture Questions**:
1. **Are we using the right base class methods?**
   - `create_v4_property()` vs `create_v4_property_with_type()`
   - When should we use each?

2. **Are our parsers comprehensive enough?**
   - Do we handle all CSS shorthand variations?
   - Do we handle edge cases like "auto", "inherit", etc.?

3. **How do we validate our output?**
   - Should we have automated tests against atomic widget prop types?
   - Should we validate the JSON structure before returning?

### **Implementation Questions**:
4. **Why is margin missing from the inner div?**
   - Is the margin mapper not being called?
   - Is the shorthand parsing failing?
   - Is there a CSS specificity issue?

5. **Are we following the atomic widgets mapping rule correctly?**
   - Did we study each prop type thoroughly before implementing?
   - Are we missing any required fields or structures?

### **Process Questions**:
6. **How can we prevent these errors in the future?**
   - Should we have stricter cursor rules?
   - Should we require validation tests for each mapper?
   - Should we have a review checklist?

## Learning Opportunities

### **What We Did Wrong**:
1. **Rushed Implementation**: Created mappers without thorough study of atomic widgets
2. **Insufficient Testing**: No validation against expected atomic widget structures
3. **Incomplete Understanding**: Misunderstood base class methods and their purposes
4. **No Systematic Validation**: No process to verify our output matches expectations

### **What We Should Do Better**:
1. **Thorough Research**: Study each atomic widget prop type completely before implementing
2. **Validation-First Approach**: Create validation tests before implementing mappers
3. **Systematic Review**: Have a checklist for each mapper implementation
4. **Better Cursor Rules**: More specific rules about validation and testing requirements

## Impact
- Inner div styling is incomplete (missing margin)
- Properties are not rendering correctly due to wrong types
- CSS converter is not reliable for production use

## Next Steps
1. **STUDY PHASE**: Analyze atomic widgets thoroughly before fixing
2. **DOCUMENT PHASE**: Create detailed expected data structures
3. **VALIDATE PHASE**: Review all existing property mappers
4. **FIX PHASE**: Correct the identified issues
5. **PREVENT PHASE**: Update cursor rules to prevent future errors
