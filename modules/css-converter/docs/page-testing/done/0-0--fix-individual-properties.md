# Root Cause Analysis: Individual Properties Not Rendering

**Date**: October 26, 2025  
**Status**: 🔍 ROOT CAUSE IDENTIFIED  
**Issue**: Individual CSS properties (padding-block-start, margin-inline-start, etc.) convert correctly but don't render in browser

---

## 🎯 **Root Cause Identified**

### **The Problem**

Individual CSS properties like `padding-block-start: 30px` are:
- ✅ Being converted to atomic format correctly
- ✅ Being added to widget `styles` array correctly
- ❌ **NOT being rendered to CSS by atomic widgets**

### **Why It's Failing**

Based on the documentation in `INDIVIDUAL_PADDING_ANALYSIS.md` (October 7, 2025), the issue was identified before:

**From the debug logs**:
```
[07-Oct-2025 15:14:40 UTC] HTML PARSER: Found inline style on p: padding-top: 20px;
[07-Oct-2025 15:14:40 UTC] UNIFIED_CSS_PROCESSOR: Converting inline property: padding-top = 20px
[07-Oct-2025 15:14:40 UTC] Unified Style Manager: Property 'padding-top' won by inline (specificity: 1000, value: 20px)
[07-Oct-2025 15:14:40 UTC] UNIFIED_CONVERTER: Converting resolved style padding-top: {"$$type":"dimensions","value":{"block-start":{"$$type":"size","value":{"size":20,"unit":"px"}}}}
[07-Oct-2025 15:14:40 UTC] Widget Creator: Checking if e-paragraph supports 'padding-top': NO
[07-Oct-2025 15:14:40 UTC] Widget Creator: Property padding-top not supported by atomic widget - routing to CSS classes
```

**Key Finding**: The old system was checking if atomic widgets "support" individual properties and routing them to CSS classes when they don't. But this routing was broken.

---

## 🔬 **Technical Analysis**

### **Issue 1: Atomic Widget Property Support Misunderstanding**

**WRONG ASSUMPTION** (from old code):
- "Atomic widgets don't support individual padding properties"
- "Only shorthand `padding` is supported"
- "Individual properties must be routed to CSS classes"

**CORRECT UNDERSTANDING**:
- Atomic widgets support ALL properties through the `styles` system
- The `styles` array accepts ANY CSS property in atomic format
- There is NO distinction between shorthand and individual properties
- The `define_props_schema()` is for CONTROLS, not CSS properties

### **Issue 2: Property Mapper Conversion**

The `Atomic_Padding_Property_Mapper` correctly handles individual properties:

```php
// Supported properties include BOTH shorthand and individual
private const SUPPORTED_PROPERTIES = [
    'padding',                  // Shorthand
    'padding-top',              // Individual physical
    'padding-block-start',      // Individual logical
    // ... etc
];

// Converts padding-block-start: 30px to:
[
    '$$type' => 'dimensions',
    'value' => [
        'block-start' => ['$$type' => 'size', 'value' => ['size' => 30, 'unit' => 'px']],
        'block-end' => null,
        'inline-start' => null,
        'inline-end' => null,
    ]
]
```

**This is CORRECT** - individual properties create a dimensions structure with only one direction filled.

### **Issue 3: Atomic Widgets CSS Rendering**

The atomic widgets styles renderer should convert the dimensions prop type to CSS:

**Expected CSS Output**:
```css
.e-abc1234 {
    padding-block-start: 30px;
}
```

**Actual CSS Output**:
```css
.e-abc1234 {
    /* Nothing - or padding-block-start: 0px */
}
```

---

## 🔍 **Investigation Results**

### **Hypothesis 1: Dimensions with Null Values**

**Theory**: Atomic widgets styles renderer doesn't handle dimensions with null values correctly

**Evidence**:
- Individual `padding-block-start: 30px` creates dimensions with 3 null values
- Shorthand `padding: 20px` creates dimensions with 4 filled values
- Shorthand works, individual doesn't

**Test**:
```php
// Individual property structure (FAILS)
[
    'block-start' => ['$$type' => 'size', 'value' => ['size' => 30, 'unit' => 'px']],
    'block-end' => null,      // ← NULL VALUES
    'inline-start' => null,
    'inline-end' => null,
]

// Shorthand structure (WORKS)
[
    'block-start' => ['$$type' => 'size', 'value' => ['size' => 20, 'unit' => 'px']],
    'block-end' => ['$$type' => 'size', 'value' => ['size' => 20, 'unit' => 'px']],
    'inline-start' => ['$$type' => 'size', 'value' => ['size' => 20, 'unit' => 'px']],
    'inline-end' => ['$$type' => 'size', 'value' => ['size' => 20, 'unit' => 'px']],
]
```

**Conclusion**: The atomic widgets styles renderer likely skips dimensions with null values or renders them incorrectly.

---

### **Hypothesis 2: Logical Properties Browser Support**

**Theory**: Browser doesn't support logical CSS properties like `padding-block-start`

**Evidence**:
- Modern browsers support logical properties
- But older browsers don't
- Atomic widgets might not be converting logical → physical

**Browser Support**:
- ✅ Chrome 87+ (Dec 2020)
- ✅ Firefox 66+ (Mar 2019)
- ✅ Safari 14.1+ (Apr 2021)
- ❌ IE 11 (never)

**Test**: Check if atomic widgets convert `padding-block-start` to `padding-top` for compatibility

---

### **Hypothesis 3: CSS Property Name Mapping**

**Theory**: Atomic widgets expect property name "padding" but individual properties use different names

**Evidence**:
- All padding properties map to target name "padding" via `get_v4_property_name()`
- This is correct for atomic widgets
- But CSS renderer might not handle it

**From `Atomic_Padding_Property_Mapper`**:
```php
public function get_v4_property_name( string $property ): string {
    return 'padding';  // ALL properties map to 'padding'
}
```

**This means**:
- `padding-block-start: 30px` → stored as `padding` in atomic props
- `padding: 20px` → also stored as `padding` in atomic props
- Both should render the same way

---

## 🎯 **Most Likely Root Cause**

### **Atomic Widgets Styles Renderer Issue**

The atomic widgets styles renderer (`styles-renderer.php` in elementor core) likely has one of these issues:

1. **Doesn't handle null values in dimensions**
   - Skips rendering when any dimension is null
   - Or renders as `0px` instead of omitting

2. **Doesn't render individual logical properties**
   - Only renders full shorthand `padding: 20px 20px 20px 20px`
   - Doesn't render individual `padding-block-start: 30px`

3. **Doesn't convert logical → physical properties**
   - Renders `padding-block-start` as-is
   - Browser doesn't support it (in older versions)
   - Should convert to `padding-top`

---

## 📋 **Next Steps**

### **Step 1: Verify Atomic Props in Widget Data**

Create a test to dump the actual widget data and verify the atomic props are correct:

```php
// Test script to check widget data
$widget = [
    'widgetType' => 'e-paragraph',
    'styles' => [
        'e-abc1234' => [
            'variants' => [[
                'props' => [
                    'padding' => [
                        '$$type' => 'dimensions',
                        'value' => [
                            'block-start' => ['$$type' => 'size', 'value' => ['size' => 30, 'unit' => 'px']],
                            'block-end' => null,
                            'inline-start' => null,
                            'inline-end' => null,
                        ]
                    ]
                ]
            ]]
        ]
    ]
];

// Check if this renders to CSS correctly
```

### **Step 2: Check Atomic Widgets Styles Renderer**

Look at the elementor core styles renderer to see how it handles dimensions:

```bash
# Find the styles renderer in elementor core
find plugins/elementor -name "*styles-renderer*" -o -name "*style-renderer*"

# Check how it renders dimensions prop type
grep -r "dimensions" plugins/elementor/modules/atomic-widgets/
```

### **Step 3: Test with Shorthand vs Individual**

Create two identical tests:
1. `<p style="padding: 30px 0 0 0;">` - Shorthand with same values
2. `<p style="padding-block-start: 30px;">` - Individual property

Compare the generated CSS to see if there's a difference.

### **Step 4: Fix the Renderer**

Based on findings, fix one of:
1. **CSS Converter** - Fill in null values with 0px before sending to atomic widgets
2. **Atomic Widgets Renderer** - Handle null values correctly in dimensions
3. **Atomic Widgets Renderer** - Convert logical properties to physical properties

---

## 🔧 **Proposed Fix**

### **Option 1: Fill Null Values (CSS Converter Side)**

Modify `Atomic_Padding_Property_Mapper` to fill null values with 0px:

```php
private function parse_individual_padding( string $logical_side, string $value ): ?array {
    $parsed_size = $this->parse_size_value( $value );
    if ( null === $parsed_size ) {
        return null;
    }

    $zero_size = ['size' => 0, 'unit' => 'px'];

    return [
        'block-start' => $logical_side === 'block-start' ? $this->create_size_prop( $parsed_size ) : $this->create_size_prop( $zero_size ),
        'block-end' => $logical_side === 'block-end' ? $this->create_size_prop( $parsed_size ) : $this->create_size_prop( $zero_size ),
        'inline-start' => $logical_side === 'inline-start' ? $this->create_size_prop( $parsed_size ) : $this->create_size_prop( $zero_size ),
        'inline-end' => $logical_side === 'inline-end' ? $this->create_size_prop( $parsed_size ) : $this->create_size_prop( $zero_size ),
    ];
}
```

**Pros**: Simple fix on CSS converter side
**Cons**: Changes semantic meaning (null vs 0px)

### **Option 2: Fix Atomic Widgets Renderer (Elementor Core Side)**

Modify the styles renderer to handle null values:

```php
// In styles-renderer.php
private function render_dimensions_property( $dimensions ) {
    $css = [];
    
    if ( isset( $dimensions['block-start'] ) && $dimensions['block-start'] !== null ) {
        $css[] = 'padding-block-start: ' . $this->render_size( $dimensions['block-start'] );
    }
    
    // ... etc for other directions
    
    return implode( '; ', $css );
}
```

**Pros**: Correct semantic handling
**Cons**: Requires changes to elementor core

### **Option 3: Use Individual Size Properties**

Instead of using Dimensions_Prop_Type for individual properties, use Size_Prop_Type:

```php
// For padding-block-start: 30px
// Instead of:
'padding' => ['$$type' => 'dimensions', 'value' => ['block-start' => ...]]

// Use:
'padding-block-start' => ['$$type' => 'size', 'value' => ['size' => 30, 'unit' => 'px']]
```

**Pros**: Each property is independent
**Cons**: Requires different property names, may not be supported by atomic widgets

---

## ✅ **Recommended Solution**

**Option 1: Fill Null Values with 0px**

This is the quickest fix and maintains compatibility with the atomic widgets system. The semantic difference between null and 0px is minimal for padding/margin properties.

**Implementation**:
1. Modify `Atomic_Padding_Property_Mapper::parse_individual_padding()`
2. Fill null values with 0px size props
3. Test all 6 failing tests
4. Verify no regressions

**Expected Result**:
- `padding-block-start: 30px` → renders as `padding: 30px 0 0 0` in CSS
- All individual properties work correctly
- Shorthand properties continue to work

---

## 🎯 **ROOT CAUSE IDENTIFIED - ATOMIC WIDGETS ARCHITECTURE ISSUE**

### The Bug in CSS Converter

In commit `d1b8cf5e58` ("Php lint"), the `parse_individual_padding()` method in `atomic-padding-property-mapper.php` was incorrectly changed to return all four dimension sides with explicit `null` values.

**Fix Applied:** Reverted to variable key approach (only one side):
```php
return [
    $logical_side => $this->create_size_prop( $parsed_size ),
];
```

### The Real Problem - Atomic Widgets Default Values

**Test still failing with `padding-block-start: 0px` instead of `30px`**

**Root Cause:** Elementor's `Dimensions_Prop_Type` has default values of `0px` for each side:
- `Dimensional_Prop_Type` trait defines `get_default_value_size(): int { return 0; }`
- When only `block-start` is provided, missing sides get filled with 0px defaults
- `Object_Prop_Type` validation (line 103) applies defaults: `$value[ $key ] ?? $prop_type->get_default()`

### Why This is a Problem

**`padding-block-start: 30px` should NOT become `padding: 30px 0px 0px 0px`**

The atomic widget system is treating missing dimension sides as explicit 0px values, which changes the semantic meaning. A partial dimension should only affect the specified side, not set the other sides to 0.

### Attempted Fixes

1. ✅ **Property Mapper**: Reverted to variable key (only one side) - CORRECT
2. ✅ **Margin Mapper**: Applied same fix - CORRECT  
3. ✅ **Merging Logic**: Added padding to dimensions merging - CORRECT
4. ❌ **Still Failing**: Atomic widget system fills missing sides with 0px defaults

### The Architectural Issue

This is a **fundamental issue with Elementor's atomic widgets architecture**:
- Dimensions prop types have default values for all sides
- Missing keys trigger default value application
- No way to distinguish between "not set" and "set to 0"

### Possible Solutions

**Option 1: Fill All Sides in CSS Converter** (Changes semantic meaning)
```php
return [
    'block-start' => $logical_side === 'block-start' ? $this->create_size_prop( $parsed_size ) : null,
    'block-end' => $logical_side === 'block-end' ? $this->create_size_prop( $parsed_size ) : null,
    'inline-start' => $logical_side === 'inline-start' ? $this->create_size_prop( $parsed_size ) : null,
    'inline-end' => $logical_side === 'inline-end' ? $this->create_size_prop( $parsed_size ) : null,
];
```

**Option 2: Fix Elementor Core** (Requires core changes - not allowed)
- Remove default values from Dimensions prop type
- Change Object_Prop_Type to not apply defaults for missing keys
- Update Multi_Props_Transformer to handle missing keys correctly

**Option 3: Use Individual Properties** (Bypass dimensions entirely)
- Don't use Dimensions_Prop_Type for individual properties
- Create separate props for each side (padding-block-start, padding-block-end, etc.)
- This would require significant architectural changes

### Status

**BLOCKED**: Need user guidance on which approach to take.
- Cannot change Elementor core (per user rules)
- Current fix is correct for CSS converter but incompatible with atomic widgets architecture
- Test still failing because atomic widgets fill missing sides with 0px defaults

