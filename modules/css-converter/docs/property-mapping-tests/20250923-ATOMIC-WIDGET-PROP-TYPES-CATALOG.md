# Atomic Widget Prop Types - Comprehensive Catalog

## Overview
This document catalogs ALL atomic widget prop types from `/atomic-widgets/prop-types/` and their corresponding frontend validation schemas from `/elementor-css/packages/libs/editor-props/src/prop-types/`.

## Methodology
1. **Backend Analysis**: Study each PHP prop type's `define_shape()` method
2. **Frontend Analysis**: Study corresponding TypeScript validation schemas  
3. **Structure Documentation**: Document exact expected JSON structure
4. **Validation Rules**: Note all validation requirements and edge cases

---

## Core Primitive Types

### 1. **String_Prop_Type**
**Backend**: `/primitives/string-prop-type.php`
**Frontend**: `/string.ts`

**Expected Structure**:
```json
{
  "$$type": "string",
  "value": "string_value"
}
```

**Validation Rules**:
- Must be string type
- Can have enum restrictions
- Can be required or optional

---

### 2. **Number_Prop_Type** 
**Backend**: `/primitives/number-prop-type.php`
**Frontend**: `/number.ts`

**Expected Structure**:
```json
{
  "$$type": "number", 
  "value": 123
}
```

**Validation Rules**:
- Must be numeric (int or float)
- Can have min/max constraints
- Can be required or optional

---

### 3. **Boolean_Prop_Type**
**Backend**: `/primitives/boolean-prop-type.php` 
**Frontend**: `/boolean.ts`

**Expected Structure**:
```json
{
  "$$type": "boolean",
  "value": true
}
```

**Validation Rules**:
- Must be boolean (true/false)
- Can have default value

---

## Complex Object Types

### 4. **Size_Prop_Type** ⭐ CRITICAL
**Backend**: `/size-prop-type.php`
**Frontend**: `/size.ts`

**Expected Structure**:
```json
{
  "$$type": "size",
  "value": {
    "size": 16,
    "unit": "px"
  }
}
```

**Validation Rules**:
- `size`: MUST be numeric (not string)
- `unit`: MUST be from supported units list
- Special units: "auto", "custom" have different validation
- Units from `Size_Constants::all_supported_units()`

**Critical Notes**:
- This is used for: width, height, max-width, font-size, margins, padding components
- MOST COMMON ERROR: Using string instead of numeric for size

---

### 5. **Color_Prop_Type** ⭐ CRITICAL  
**Backend**: `/color-prop-type.php`
**Frontend**: `/color.ts`

**Expected Structure**:
```json
{
  "$$type": "color",
  "value": "#ffffff"
}
```

**Validation Rules**:
- Accepts hex, rgb, rgba, hsl, hsla
- Named colors supported
- CSS variables supported

---

### 6. **Dimensions_Prop_Type** ⭐ CRITICAL
**Backend**: `/dimensions-prop-type.php` 
**Frontend**: `/dimensions.ts`

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

**Validation Rules**:
- Uses logical properties (not top/right/bottom/left)
- Each direction is a Size_Prop_Type
- Used for: margin, padding
- Can handle "auto" values via Size_Prop_Type

---

### 7. **Box_Shadow_Prop_Type** ⭐ CRITICAL
**Backend**: `/box-shadow-prop-type.php`
**Frontend**: `/box-shadow.ts`

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

**Validation Rules**:
- Array of Shadow_Prop_Type objects
- Each shadow has ALL required fields
- position: null or "inset"
- All offset/blur/spread are Size_Prop_Type

---

### 8. **Shadow_Prop_Type**
**Backend**: `/shadow-prop-type.php`
**Frontend**: `/shadow.ts`

**Expected Structure**: (See above in Box_Shadow_Prop_Type)

**Validation Rules**:
- hOffset, vOffset, blur, spread: ALL required Size_Prop_Type
- color: required Color_Prop_Type  
- position: optional String_Prop_Type (enum: ["inset"])

---

## Layout & Positioning Types

### 9. **Border_Radius_Prop_Type**
**Backend**: `/border-radius-prop-type.php`
**Frontend**: `/border-radius.ts`

**Expected Structure**:
```json
{
  "$$type": "border-radius",
  "value": {
    "start-start": {"$$type": "size", "value": {"size": 8, "unit": "px"}},
    "start-end": {"$$type": "size", "value": {"size": 8, "unit": "px"}},
    "end-start": {"$$type": "size", "value": {"size": 8, "unit": "px"}}, 
    "end-end": {"$$type": "size", "value": {"size": 8, "unit": "px"}}
  }
}
```

**Validation Rules**:
- Uses logical properties (start-start, start-end, end-start, end-end)
- Each corner is Size_Prop_Type
- Can be uniform (all same) or individual corners

---

### 10. **Position_Prop_Type**
**Backend**: `/position-prop-type.php`
**Frontend**: `/position.ts`

**Expected Structure**:
```json
{
  "$$type": "position",
  "value": {
    "position": "absolute",
    "inset-block-start": {"$$type": "size", "value": {"size": 10, "unit": "px"}},
    "inset-inline-end": {"$$type": "size", "value": {"size": 10, "unit": "px"}},
    "inset-block-end": {"$$type": "size", "value": {"size": 10, "unit": "px"}},
    "inset-inline-start": {"$$type": "size", "value": {"size": 10, "unit": "px"}}
  }
}
```

---

## Background Types

### 11. **Background_Prop_Type**
**Backend**: `/background-prop-type.php`
**Frontend**: `/background-prop-types/background.ts`

**Expected Structure**:
```json
{
  "$$type": "background",
  "value": {
    "color": {"$$type": "color", "value": "#ffffff"},
    "image": {"$$type": "image", "value": {...}},
    "position": "center center",
    "size": "cover",
    "repeat": "no-repeat",
    "attachment": "scroll"
  }
}
```

---

## Array Types

### 12. **Classes_Prop_Type**
**Backend**: `/classes-prop-type.php`
**Frontend**: `/classes.ts`

**Expected Structure**:
```json
{
  "$$type": "classes",
  "value": ["class-1", "class-2", "class-3"]
}
```

---

## Union Types

### 13. **Union_Prop_Type**
**Backend**: `/union-prop-type.php`
**Frontend**: Not directly mapped

**Purpose**: Allows multiple prop types for same property
**Example**: margin can be Size_Prop_Type OR Dimensions_Prop_Type

---

## ANALYSIS STATUS

✅ **Completed**: Core primitives, Size, Color, Dimensions, Box Shadow, Shadow
🔄 **In Progress**: Background types, Layout types
⏳ **Pending**: Transform types, Filter types, Advanced types

---

## CRITICAL FINDINGS

### **Most Common Property Mappers Needed**:
1. **Size_Prop_Type** - width, height, max-width, font-size, etc.
2. **Dimensions_Prop_Type** - margin, padding  
3. **Color_Prop_Type** - color, background-color
4. **Box_Shadow_Prop_Type** - box-shadow
5. **Background_Prop_Type** - background shorthand

### **Most Common Errors in Our Mappers**:
1. Using string type instead of size type
2. Using string values instead of numeric values  
3. Missing required fields in complex structures
4. Wrong logical property names (top/right vs block-start/inline-end)

---

## NEXT STEPS

1. ✅ Complete catalog of ALL prop types
2. ⏳ Study frontend validation schemas in detail
3. ⏳ Create PHPUnit test proposal
4. ⏳ Write failing tests for current mappers
5. ⏳ Fix mappers based on test failures
