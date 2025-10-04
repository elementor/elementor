# Invalid Value for Attribute Error - Root Cause Research

## Error Description
- **Error**: `invalid_value` for attribute
- **Impact**: Cannot save the page in Elementor editor
- **When**: After fixing the `InvalidCharacterError` by reverting `build_atomic_attributes()`

## Timeline
1. ✅ Fixed `InvalidCharacterError` by reverting attribute handling in `widget-creator.php`
2. ✅ Editor loads successfully without JavaScript errors
3. ✅ Widgets display correctly in editor
4. ❌ **NEW ISSUE**: Cannot save page - `invalid_value` for attribute error

## Research Questions

### 1. What is the exact error message?
- Need to capture full error from browser console
- Need to see which attribute(s) are causing validation to fail
- Need to see the exact value that's being rejected

### 2. Where does attribute validation happen?
- Elementor's attribute validation logic
- What format does Elementor expect for attributes?
- What format are we currently providing?

### 3. What changed in our attribute handling?
- **Before fix**: Used `build_atomic_attributes()` which generated numeric keys → `InvalidCharacterError`
- **After fix**: Simple assignment `$merged_settings['attributes'] = $filtered_attributes;`
- **Question**: What is the structure of `$filtered_attributes`?

### 4. What is the expected attribute structure?
- Need to examine Elementor's atomic widget attribute validation
- Need to compare with working examples
- Need to understand the difference between:
  - Attributes for rendering (HTML attributes)
  - Attributes for validation (Elementor's internal format)

## Hypotheses

### Hypothesis 1: Attribute Structure Mismatch
**Theory**: The `$filtered_attributes` array structure doesn't match what Elementor's validation expects.

**Evidence Needed**:
- Current structure of `$filtered_attributes`
- Expected structure from Elementor's validation
- Working examples from other widgets

**Test**: Log the exact structure being saved and compare with validation schema

### Hypothesis 2: Missing Atomic Wrapper
**Theory**: While `build_atomic_attributes()` had bugs (numeric keys), it might have been doing *something* necessary for validation.

**Evidence Needed**:
- What was `build_atomic_attributes()` supposed to do?
- Is there a correct way to wrap attributes for atomic widgets?
- Do attributes need `$$type` and `value` structure?

**Test**: Check if attributes need atomic prop type wrapping

### Hypothesis 3: Attribute Value Type Issues
**Theory**: The attribute values themselves (not the structure) are invalid.

**Evidence Needed**:
- What are the actual attribute values being saved?
- Are they strings, arrays, objects?
- Does Elementor expect specific types?

**Test**: Log each attribute key-value pair and check types

### Hypothesis 4: Leftover Problematic Attributes
**Theory**: Some attributes from the conversion process are not valid Elementor attributes.

**Evidence Needed**:
- Which attributes are we passing through?
- Are there HTML attributes that shouldn't be in Elementor settings?
- Is `filter_non_style_attributes()` working correctly?

**Test**: Log which attributes pass through the filter

## Investigation Plan

### Step 1: Capture Full Error Details
- [ ] Open browser console in Elementor editor
- [ ] Attempt to save the page
- [ ] Capture full error message with stack trace
- [ ] Identify which attribute(s) are failing validation
- [ ] Identify the exact value that's being rejected

### Step 2: Examine Current Attribute Structure
- [ ] Add debug logging in `widget-creator.php` before saving attributes
- [ ] Log the structure of `$filtered_attributes`
- [ ] Log the final `$merged_settings['attributes']`
- [ ] Compare with working widget examples

### Step 3: Study Elementor's Attribute Validation
- [ ] Find Elementor's attribute validation code
- [ ] Understand the expected format
- [ ] Check if attributes need atomic prop type wrapping
- [ ] Check if there's a specific schema for attributes

### Step 4: Compare with Working Examples
- [ ] Create a simple widget manually in Elementor
- [ ] Add custom attributes to it
- [ ] Export and examine the structure
- [ ] Compare with our converted widgets

### Step 5: Test Hypotheses
- [ ] Test each hypothesis systematically
- [ ] Document findings for each
- [ ] Identify the root cause

## Debug Logging Locations

### Location 1: widget-creator.php - Before Attribute Assignment
```php
// Around line 405-410
if ( ! empty( $attributes ) && ! $this->are_attributes_only_style( $attributes ) ) {
    $filtered_attributes = $this->filter_non_style_attributes( $attributes );
    if ( ! empty( $filtered_attributes ) ) {
        error_log( '=== ATTRIBUTE DEBUG - BEFORE ASSIGNMENT ===' );
        error_log( 'Filtered attributes: ' . print_r( $filtered_attributes, true ) );
        error_log( 'Filtered attributes JSON: ' . wp_json_encode( $filtered_attributes, JSON_PRETTY_PRINT ) );
        
        $merged_settings['attributes'] = $filtered_attributes;
        
        error_log( 'Final merged_settings[attributes]: ' . print_r( $merged_settings['attributes'], true ) );
        error_log( '=== END ATTRIBUTE DEBUG ===' );
    }
}
```

### Location 2: widget-creator.php - filter_non_style_attributes()
```php
// Inside filter_non_style_attributes method
private function filter_non_style_attributes( array $attributes ): array {
    error_log( '=== FILTER_NON_STYLE_ATTRIBUTES DEBUG ===' );
    error_log( 'Input attributes: ' . print_r( $attributes, true ) );
    
    $filtered = array_filter(
        $attributes,
        fn( $key ) => 'style' !== $key,
        ARRAY_FILTER_USE_KEY
    );
    
    error_log( 'Filtered result: ' . print_r( $filtered, true ) );
    error_log( '=== END FILTER DEBUG ===' );
    
    return $filtered;
}
```

### Location 3: Check What Elementor Receives
- [ ] Add logging in Elementor's save handler
- [ ] Log the data being validated
- [ ] Log the validation error details

## Expected Outcomes

### If Hypothesis 1 is correct:
- We'll see a structure mismatch in the logs
- Need to transform `$filtered_attributes` to match expected format
- May need to use atomic prop types correctly

### If Hypothesis 2 is correct:
- We'll see that attributes need atomic wrapping
- Need to implement correct atomic attribute wrapping (without numeric keys)
- May need to use `Attributes_Prop_Type` correctly

### If Hypothesis 3 is correct:
- We'll see specific values that are invalid
- Need to sanitize or transform attribute values
- May need type casting or validation

### If Hypothesis 4 is correct:
- We'll see problematic HTML attributes in the list
- Need to improve `filter_non_style_attributes()`
- May need a whitelist of allowed attributes

## Critical Discovery: Expected Attribute Structure

### From Elementor's Code Analysis

**Location**: `plugins/elementor/modules/atomic-widgets/prop-types/attributes-prop-type.php`
```php
class Attributes_Prop_Type extends Array_Prop_Type {
    protected function define_item_type(): Prop_Type {
        return Key_Value_Prop_Type::make();
    }
}
```

**Location**: `plugins/elementor/modules/atomic-widgets/prop-types/key-value-prop-type.php`
```php
class Key_Value_Prop_Type extends Object_Prop_Type {
    protected function define_shape(): array {
        return [
            'key' => String_Prop_Type::make(),
            'value' => String_Prop_Type::make(),
        ];
    }
}
```

### Expected Structure
Attributes MUST be an **array of objects**, where each object has:
```php
[
    [
        '$$type' => 'key-value',
        'value' => [
            'key' => ['$$type' => 'string', 'value' => 'attribute_name'],
            'value' => ['$$type' => 'string', 'value' => 'attribute_value']
        ]
    ],
    // ... more attributes
]
```

### What We're Currently Providing
Based on the code in `widget-creator.php`:
```php
$filtered_attributes = $this->filter_non_style_attributes( $attributes );
// Returns: ['id' => 'header', 'href' => 'https://example.com']
```

This is a **flat associative array**, NOT the nested atomic structure Elementor expects!

### Root Cause Identified
**The problem**: We're passing a simple associative array like `['id' => 'value']` but Elementor expects an array of atomic `key-value` objects with `$$type` wrappers.

**Why it fails validation**: The `Attributes_Prop_Type` expects each item to be a `Key_Value_Prop_Type` object, which must have:
- `$$type: 'key-value'`
- `value.key` with `$$type: 'string'`
- `value.value` with `$$type: 'string'`

### Frontend JavaScript Expectation
From `create-atomic-element-base-view.js` line 59:
```javascript
const customAttributes = this.model.getSetting( 'attributes' )?.value ?? [];

customAttributes.forEach( ( attribute ) => {
    const key = attribute.value?.key?.value;
    const value = attribute.value?.value?.value;
    
    if ( key && value && this.isValidAttributeName( key ) ) {
        local[ key ] = value;
    }
} );
```

This confirms the expected structure:
- `attributes.value` is an array
- Each item has `attribute.value.key.value` (the attribute name)
- Each item has `attribute.value.value.value` (the attribute value)

## Solution Requirements (Research Only - DO NOT IMPLEMENT)

### What needs to change:
1. Transform `['id' => 'header']` into atomic format
2. Use `Attributes_Prop_Type::make()->generate()` to create proper structure
3. Each attribute must be wrapped as a `Key_Value_Prop_Type` object

### Example transformation needed:
```php
// Current (WRONG):
['id' => 'header', 'href' => 'https://example.com']

// Required (CORRECT):
[
    '$$type' => 'attributes',
    'value' => [
        [
            '$$type' => 'key-value',
            'value' => [
                'key' => ['$$type' => 'string', 'value' => 'id'],
                'value' => ['$$type' => 'string', 'value' => 'header']
            ]
        ],
        [
            '$$type' => 'key-value',
            'value' => [
                'key' => ['$$type' => 'string', 'value' => 'href'],
                'value' => ['$$type' => 'string', 'value' => 'https://example.com']
            ]
        ]
    ]
]
```

## Verification Plan

### Test with Browser Console
Since we can't easily access PHP logs, we'll verify the structure by:
1. Running the conversion in the browser
2. Attempting to save the page
3. Capturing the validation error from browser console
4. Examining the data structure being sent

### Expected Validation Error
When Elementor tries to validate our flat array `['id' => 'header']`, it will fail because:
- `Attributes_Prop_Type` expects an array of `Key_Value_Prop_Type` objects
- Each item must have `$$type: 'key-value'`
- Our flat array doesn't match this structure
- Validation will return `'invalid_value'` error

## Summary of Root Cause

### The Problem
**Current Implementation**: `widget-creator.php` line 282
```php
$merged_settings['attributes'] = $filtered_attributes;
// Where $filtered_attributes = ['id' => 'header', 'href' => '...']
```

**What Elementor Expects**: Atomic structure
```php
[
    '$$type' => 'attributes',
    'value' => [
        [
            '$$type' => 'key-value',
            'value' => [
                'key' => ['$$type' => 'string', 'value' => 'id'],
                'value' => ['$$type' => 'string', 'value' => 'header']
            ]
        ]
    ]
]
```

### Why It Fails
1. **Validation**: `Props_Parser::validate()` checks each prop against its schema
2. **Schema**: `Attributes_Prop_Type` expects array of `Key_Value_Prop_Type`
3. **Our Data**: Flat associative array doesn't match schema
4. **Result**: Validation returns `'invalid_value'` error
5. **Impact**: Cannot save page in editor

### The Fix (Research Only - Not Implementing)
Transform attributes using atomic prop types:
```php
use Elementor\Modules\AtomicWidgets\PropTypes\Attributes_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Key_Value_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\String_Prop_Type;

// Build atomic structure
$atomic_attributes = [];
foreach ( $filtered_attributes as $key => $value ) {
    $atomic_attributes[] = Key_Value_Prop_Type::make()->generate([
        'key' => String_Prop_Type::make()->generate( $key ),
        'value' => String_Prop_Type::make()->generate( $value )
    ]);
}

// Wrap in Attributes_Prop_Type
$merged_settings['attributes'] = Attributes_Prop_Type::make()->generate( $atomic_attributes );
```

## Implementation Status

### ✅ Completed
1. ✅ Add comprehensive debug logging
2. ✅ Analyze Elementor's expected structure
3. ✅ Identify root cause: Flat array vs atomic structure mismatch
4. ✅ Document the exact transformation needed
5. ✅ Implement atomic attribute structure using prop types

### ❌ Current Issue
**Problem**: `InvalidCharacterError` still occurring after implementation
**Symptom**: Editor shows "Can't Edit?" and fails to load
**Root Cause**: Our atomic structure implementation is still generating numeric keys somewhere

### Investigation Needed
The atomic prop type implementation might be creating arrays with numeric indices that get passed to `setAttribute()`. Need to investigate:
1. What structure does `Attributes_Prop_Type::make()->generate()` actually produce?
2. Are we correctly using the atomic prop types?
3. Is there a mismatch between our implementation and Elementor's expectations?

## Next Steps
1. ✅ Implement atomic attribute structure
2. ⏳ Debug why InvalidCharacterError still occurs
3. ⏳ Fix the numeric key issue in atomic structure
4. ⏳ Test successful page saving in editor
