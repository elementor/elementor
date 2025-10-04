# Attribute `invalid_value` Error - Root Cause Analysis Summary

## Executive Summary

**Problem**: Cannot save converted pages in Elementor editor due to `invalid_value` error for attributes.

**Root Cause**: CSS Converter is passing attributes as a flat associative array `['id' => 'value']`, but Elementor's atomic widgets expect a nested atomic structure with `$$type` wrappers.

**Impact**: Critical blocker - prevents users from saving any converted pages that have HTML attributes.

## Technical Root Cause

### Location
File: `plugins/elementor-css/modules/css-converter/services/widgets/widget-creator.php`
Line: 282 (approximately)

### Current Implementation (WRONG)
```php
if ( ! empty( $attributes ) && ! $this->are_attributes_only_style( $attributes ) ) {
    $filtered_attributes = $this->filter_non_style_attributes( $attributes );
    if ( ! empty( $filtered_attributes ) ) {
        $merged_settings['attributes'] = $filtered_attributes;
        // ❌ $filtered_attributes = ['id' => 'header', 'href' => 'https://...']
    }
}
```

### What Elementor Expects (CORRECT)
Based on analysis of Elementor's atomic widget code:

**Prop Type Definition**: `Attributes_Prop_Type` extends `Array_Prop_Type`
- Each array item must be a `Key_Value_Prop_Type` object
- `Key_Value_Prop_Type` has shape: `{ key: String_Prop_Type, value: String_Prop_Type }`

**Expected Structure**:
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

## Evidence from Elementor's Code

### 1. Prop Type Definitions

**File**: `plugins/elementor/modules/atomic-widgets/prop-types/attributes-prop-type.php`
```php
class Attributes_Prop_Type extends Array_Prop_Type {
    protected function define_item_type(): Prop_Type {
        return Key_Value_Prop_Type::make();  // ← Each item must be Key_Value_Prop_Type
    }
}
```

**File**: `plugins/elementor/modules/atomic-widgets/prop-types/key-value-prop-type.php`
```php
class Key_Value_Prop_Type extends Object_Prop_Type {
    protected function define_shape(): array {
        return [
            'key' => String_Prop_Type::make(),    // ← Must have 'key' with String_Prop_Type
            'value' => String_Prop_Type::make(),  // ← Must have 'value' with String_Prop_Type
        ];
    }
}
```

### 2. Validation Logic

**File**: `plugins/elementor/modules/atomic-widgets/parsers/props-parser.php` (line 29-54)
```php
public function validate( array $props ): Parse_Result {
    $result = Parse_Result::make();
    $validated = [];

    foreach ( $this->schema as $key => $prop_type ) {
        $value = $props[ $key ] ?? null;
        $is_valid = $prop_type->validate( $value ?? $prop_type->get_default() );

        if ( ! $is_valid ) {
            $result->errors()->add( $key, 'invalid_value' );  // ← This is the error we're seeing
            continue;
        }

        if ( ! is_null( $value ) ) {
            $validated[ $key ] = $value;
        }
    }

    return $result->wrap( $validated );
}
```

**Why it fails**:
1. Our flat array `['id' => 'header']` is passed to `Attributes_Prop_Type->validate()`
2. `Attributes_Prop_Type` expects each item to be a `Key_Value_Prop_Type` object
3. Our flat array doesn't match this structure
4. Validation returns `false`
5. Error `'invalid_value'` is added for the `attributes` key
6. Save operation fails

### 3. Frontend JavaScript Expectation

**File**: `plugins/elementor/modules/atomic-widgets/assets/js/editor/create-atomic-element-base-view.js` (line 59-79)
```javascript
const customAttributes = this.model.getSetting( 'attributes' )?.value ?? [];

customAttributes.forEach( ( attribute ) => {
    const key = attribute.value?.key?.value;      // ← Expects nested structure
    const value = attribute.value?.value?.value;  // ← Expects nested structure
    
    if ( key && value && this.isValidAttributeName( key ) ) {
        local[ key ] = value;
    }
} );
```

This confirms the expected structure:
- `attributes.value` is an array
- Each item has `attribute.value.key.value` (the attribute name)
- Each item has `attribute.value.value.value` (the attribute value)

### 4. Usage in Atomic Widgets

**File**: `plugins/elementor/modules/atomic-widgets/elements/atomic-button/atomic-button.php` (line 54)
```php
protected static function define_props_schema(): array {
    $props = [
        // ...
        'attributes' => Attributes_Prop_Type::make(),  // ← Declares attributes prop
    ];

    return $props;
}
```

All atomic widgets that support custom attributes use `Attributes_Prop_Type::make()` in their schema.

## Why the Previous Fix Failed

### The `build_atomic_attributes()` Attempt
In commit `b92f66755b`, an attempt was made to fix this by creating `build_atomic_attributes()` method. However:

**Problem 1**: Generated numeric keys
```php
$attributes_array = [];
foreach ( $filtered_attributes as $key => $value ) {
    $attributes_array[] = [  // ← This creates numeric keys [0], [1], [2]
        '$$type' => 'key-value',
        'value' => [
            'key' => ['$$type' => 'string', 'value' => $key],
            'value' => ['$$type' => 'string', 'value' => $value]
        ]
    ];
}
```

**Problem 2**: Caused `InvalidCharacterError`
- The numeric keys `[0]`, `[1]`, `[2]` were passed to jQuery's `setAttribute()`
- jQuery tried to set attribute `'0'` on the element
- Browser threw: `InvalidCharacterError: '0' is not a valid attribute name`

**Problem 3**: Incomplete implementation
- The method generated the inner structure correctly
- But it didn't wrap the result in the outer `Attributes_Prop_Type` structure
- Missing the top-level `$$type: 'attributes'` wrapper

### Why We Reverted
We reverted `build_atomic_attributes()` because it caused `InvalidCharacterError`, which prevented the editor from loading at all. This was a more critical issue than the `invalid_value` validation error.

## The Correct Solution (Research Only)

### Required Transformation

**Input** (what we have):
```php
['id' => 'header', 'href' => 'https://example.com', 'data-custom' => 'value']
```

**Output** (what Elementor needs):
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
        ],
        [
            '$$type' => 'key-value',
            'value' => [
                'key' => ['$$type' => 'string', 'value' => 'href'],
                'value' => ['$$type' => 'string', 'value' => 'https://example.com']
            ]
        ],
        [
            '$$type' => 'key-value',
            'value' => [
                'key' => ['$$type' => 'string', 'value' => 'data-custom'],
                'value' => ['$$type' => 'string', 'value' => 'value']
            ]
        ]
    ]
]
```

### Implementation Approach (DO NOT IMPLEMENT - RESEARCH ONLY)

```php
use Elementor\Modules\AtomicWidgets\PropTypes\Attributes_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Key_Value_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\String_Prop_Type;

private function build_atomic_attributes_correctly( array $filtered_attributes ): array {
    $atomic_attributes = [];
    
    foreach ( $filtered_attributes as $key => $value ) {
        // Build each key-value pair using atomic prop types
        $key_prop = String_Prop_Type::make()->generate( $key );
        $value_prop = String_Prop_Type::make()->generate( $value );
        
        // Generate the key-value object
        $key_value = Key_Value_Prop_Type::make()->generate([
            'key' => $key_prop,
            'value' => $value_prop
        ]);
        
        $atomic_attributes[] = $key_value;
    }
    
    // Wrap in Attributes_Prop_Type
    return Attributes_Prop_Type::make()->generate( $atomic_attributes );
}
```

### Usage in widget-creator.php
```php
if ( ! empty( $attributes ) && ! $this->are_attributes_only_style( $attributes ) ) {
    $filtered_attributes = $this->filter_non_style_attributes( $attributes );
    if ( ! empty( $filtered_attributes ) ) {
        // ✅ Use atomic prop types to generate correct structure
        $merged_settings['attributes'] = $this->build_atomic_attributes_correctly( $filtered_attributes );
    }
}
```

## Alternative Approaches (Research)

### Option 1: Use Atomic Prop Types (Recommended)
- **Pros**: Follows Elementor's patterns, uses official API, type-safe
- **Cons**: Requires understanding atomic prop type system
- **Risk**: Low - this is the "official" way

### Option 2: Manual Structure Building
- **Pros**: No dependencies on Elementor classes
- **Cons**: Fragile, breaks if Elementor changes structure, error-prone
- **Risk**: High - maintenance nightmare

### Option 3: Don't Pass Attributes
- **Pros**: No validation errors
- **Cons**: Loses all HTML attributes (id, data-*, aria-*, etc.)
- **Risk**: Medium - acceptable if attributes aren't critical

## Testing Strategy (When Fix is Implemented)

### Test Case 1: Simple Attributes
```html
<div id="test-id" class="test-class">Content</div>
```
Expected: `id` attribute should be preserved

### Test Case 2: Multiple Attributes
```html
<div id="header" data-custom="value" aria-label="Header">Content</div>
```
Expected: All attributes should be preserved

### Test Case 3: Link Attributes
```html
<a href="https://example.com" target="_blank" rel="noopener">Link</a>
```
Expected: href, target, rel should be preserved

### Test Case 4: Save and Reload
1. Convert HTML with attributes
2. Save page in editor
3. Reload page
4. Verify attributes are still present

## Conclusion

**Root Cause**: Structure mismatch between flat array and atomic prop type expectations

**Impact**: Cannot save pages with HTML attributes

**Solution**: Transform flat array to atomic structure using `Attributes_Prop_Type` and `Key_Value_Prop_Type`

**Next Step**: Implement the correct transformation using atomic prop types (when approved to fix)
