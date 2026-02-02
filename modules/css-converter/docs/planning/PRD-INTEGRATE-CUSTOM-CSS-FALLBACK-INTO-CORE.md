# PRD: Integrate Custom CSS Fallback Into Core Property Conversion

## Problem Statement

The Custom CSS Fallback system was implemented as a separate method (`convert_property_with_fallback`), but most of the CSS processing pipeline still uses the original `convert_property_to_v4_atomic` method. This means:

1. ❌ Unsupported CSS properties are being silently dropped
2. ❌ Unsupported CSS values (like `align-items: initial`) are being lost
3. ❌ The Custom CSS Fallback system is only triggered in 2 places (widget-class-processor, global-classes-conversion-service)
4. ❌ Most processors (unified-css-processor, style-collection-processor, id-selector-processor, etc.) bypass the fallback system entirely

## Solution

**Integrate the Custom CSS Fallback logic directly into `convert_property_to_v4_atomic`** so that:
- Priority 1: Try to convert to atomic styling (existing behavior)
- Priority 2: If conversion fails OR value is unsupported → automatically add to Custom CSS
- Works everywhere: widget styling, global classes, inline styles, ID selectors, nested selectors, etc.

## Technical Design

### 1. Core Method: `convert_property_to_v4_atomic`

**File**: `plugins/elementor-css/modules/css-converter/services/css/processing/css-property-conversion-service.php`

**Current Flow**:
```php
public function convert_property_to_v4_atomic( string $property, $value ): ?array {
    // 1. Resolve property mapper
    $mapper = $this->resolve_property_mapper_safely( $property, $value );
    
    // 2. Try to convert
    if ( $mapper ) {
        return $mapper->map_to_prop_type( $property, $value );
    }
    
    // 3. Return null if no mapper found (property is lost!)
    return null;
}
```

**New Flow**:
```php
public function convert_property_to_v4_atomic( string $property, $value, string $widget_id = null, bool $important = false ): ?array {
    // Skip CSS variable definitions
    if ( strpos( $property, '--' ) === 0 ) {
        return null;
    }
    
    // 1. Check if property is supported in atomic schema
    if ( ! $this->validator->is_property_supported( $property ) ) {
        // Fallback: Add to custom CSS
        if ( $widget_id ) {
            $this->add_to_custom_css( $widget_id, $property, $value, $important, 'Property not in atomic schema' );
        }
        return null;
    }
    
    // 2. Check if value is supported for this property
    if ( ! $this->validator->is_value_supported( $property, $value ) ) {
        // Fallback: Add to custom CSS
        if ( $widget_id ) {
            $reason = $this->validator->get_unsupported_reason( $property, $value );
            $this->add_to_custom_css( $widget_id, $property, $value, $important, $reason );
        }
        return null;
    }
    
    // 3. Try to convert using property mappers
    $mapper = $this->resolve_property_mapper_safely( $property, $value );
    
    if ( $mapper ) {
        try {
            $converted = $mapper->map_to_prop_type( $property, $value );
            if ( $converted ) {
                return $converted;
            }
        } catch ( \Exception $e ) {
            // Conversion failed - fallback to custom CSS
            if ( $widget_id ) {
                $this->add_to_custom_css( $widget_id, $property, $value, $important, 'Conversion failed: ' . $e->getMessage() );
            }
            return null;
        }
    }
    
    // 4. No mapper found - fallback to custom CSS
    if ( $widget_id ) {
        $this->add_to_custom_css( $widget_id, $property, $value, $important, 'No property mapper found' );
    }
    
    return null;
}
```

### 2. Method Signature Update

**Challenge**: The method is called from 30+ places without `$widget_id` parameter.

**Solution**: Make `$widget_id` optional (default `null`)
- When `$widget_id` is provided → Custom CSS Fallback is active
- When `$widget_id` is `null` → Behaves like the old method (no fallback)

This ensures **backward compatibility** while enabling the fallback system.

### 3. Update Call Sites to Pass Widget ID

Update processors to pass the `widget_id` when available:

#### 3.1 Widget-Specific Styles
**File**: `plugins/elementor-css/modules/css-converter/services/css/processing/processors/widget-class-processor.php`

```php
// Line 631 - Already updated ✅
$converted = $property_conversion_service->convert_property_with_fallback( $property, $value, $widget_id, $important );

// CHANGE TO:
$converted = $property_conversion_service->convert_property_to_v4_atomic( $property, $value, $widget_id, $important );
```

#### 3.2 Global Classes
**File**: `plugins/elementor-css/modules/css-converter/services/global-classes/unified/global-classes-conversion-service.php`

```php
// Line 62 - Already updated ✅
$converted = $this->property_conversion_service->convert_property_with_fallback( ... );

// CHANGE TO:
$converted = $this->property_conversion_service->convert_property_to_v4_atomic( $property, $value, $class_name, $important );
```

**Note**: For global classes, use the class name as the `widget_id` since custom CSS should be attached to the global class definition.

#### 3.3 Inline Styles
**File**: `plugins/elementor-css/modules/css-converter/services/css/processing/unified-css-processor.php`

```php
// Line 859
return $this->property_converter->convert_property_to_v4_atomic( $property, $value );

// CHANGE TO:
return $this->property_converter->convert_property_to_v4_atomic( $property, $value, $element_id, $important );
```

#### 3.4 ID Selectors
**File**: `plugins/elementor-css/modules/css-converter/services/css/processing/processors/id-selector-processor.php`

```php
// Line 264
return $this->property_converter->convert_property_to_v4_atomic( $property, $value );

// CHANGE TO:
return $this->property_converter->convert_property_to_v4_atomic( $property, $value, $element_id, $important );
```

#### 3.5 Other Processors
Apply similar changes to:
- `style-collection-processor.php` (line 372)
- `reset-styles-processor.php` (line 304)
- `nested-element-selector-processor.php` (line 301)
- `widget-child-element-selector-processor.php` (line 337)

### 4. Remove Duplicate Method

Once `convert_property_to_v4_atomic` has the fallback logic integrated, **delete** `convert_property_with_fallback` method to avoid confusion and duplication.

## Custom CSS Collection Strategy

### Widget Styling
- **Widget ID**: Use the widget's `element_id` (e.g., `element-div-1`)
- **Storage**: Custom CSS stored in `settings.custom_css` (string format for Elementor Pro compatibility)
- **Rendering**: Elementor Pro's custom CSS system renders it in the editor and frontend

### Global Classes
- **Class ID**: Use the class name (e.g., `custom-css-demo`, `text-bold`)
- **Storage**: Custom CSS stored alongside the global class definition
- **Format**:
```php
[
    'classes_created' => [
        [
            'class_name' => 'text-bold',
            'properties' => [...], // Atomic properties
            'custom_css' => 'align-items: initial;', // Unsupported properties
        ]
    ],
    'custom_css_rules' => [
        [
            'selector' => '.text-bold',
            'css' => 'align-items: initial;',
        ]
    ]
]
```

## Implementation Plan

### Phase 1: Core Integration ✅ (This PR)
1. Update `convert_property_to_v4_atomic` signature to accept optional `$widget_id` and `$important` parameters
2. Integrate validation and fallback logic into `convert_property_to_v4_atomic`
3. Ensure backward compatibility (method works with or without widget ID)

### Phase 2: Widget Styling Integration
1. Update `widget-class-processor.php` to pass `element_id`
2. Update `unified-css-processor.php` inline styles to pass `element_id`
3. Update `id-selector-processor.php` to pass `element_id`
4. Test widget styling with unsupported properties

### Phase 3: Global Classes Integration
1. Update `global-classes-conversion-service.php` to pass `class_name` as widget ID
2. Update global classes response format to include `custom_css_rules`
3. Test global classes with unsupported properties

### Phase 4: Cleanup
1. Delete `convert_property_with_fallback` method
2. Remove all references to the old method
3. Update documentation

## Success Criteria

### Test Case 1: Unsupported Property Value (Widget Styling)
**Input**:
```html
<div class="test">Content</div>
```
```css
.test { align-items: initial; display: flex; }
```

**Expected Output**:
```json
{
  "widgets": [{
    "settings": {
      "custom_css": "element.style {\n  align-items: initial;\n}"
    },
    "styles": {
      "e-xxx": {
        "variants": [{
          "props": {
            "display": { "$$type": "string", "value": "flex" }
          }
        }]
      }
    }
  }]
}
```

**Result**: 
- ✅ `display: flex` converted to atomic styling
- ✅ `align-items: initial` added to custom CSS

### Test Case 2: Unsupported Property Value (Global Classes)
**Input**:
```html
<div class="custom-flex">Content</div>
```
```css
.custom-flex { align-items: initial; justify-content: center; }
```

**Expected Output**:
```json
{
  "global_classes": [{
    "class_name": "custom-flex",
    "properties": {
      "justify-content": { "$$type": "string", "value": "center" }
    },
    "custom_css": "align-items: initial;"
  }],
  "custom_css_rules": [{
    "selector": ".custom-flex",
    "css": "align-items: initial;"
  }]
}
```

**Result**:
- ✅ `justify-content: center` converted to atomic styling
- ✅ `align-items: initial` added to global class custom CSS

### Test Case 3: Completely Unsupported Property
**Input**:
```css
.test { -webkit-line-clamp: 3; display: block; }
```

**Expected Output**:
```json
{
  "widgets": [{
    "settings": {
      "custom_css": "element.style {\n  -webkit-line-clamp: 3;\n}"
    },
    "styles": {
      "e-xxx": {
        "variants": [{
          "props": {
            "display": { "$$type": "string", "value": "block" }
          }
        }]
      }
    }
  }]
}
```

**Result**:
- ✅ `display: block` converted to atomic styling
- ✅ `-webkit-line-clamp: 3` added to custom CSS (not in atomic schema)

## Backward Compatibility

### Existing Code
All existing calls to `convert_property_to_v4_atomic` continue to work without changes:

```php
// Old calls still work (no widget ID = no fallback)
$result = $converter->convert_property_to_v4_atomic( 'display', 'flex' );
```

### New Code
New calls can opt-in to the fallback system by providing a widget ID:

```php
// New calls with fallback enabled
$result = $converter->convert_property_to_v4_atomic( 'display', 'flex', $widget_id, $important );
```

## Benefits

1. **Zero Property Loss**: No CSS properties are ever lost - they either convert to atomic styling or fallback to custom CSS
2. **Automatic Everywhere**: Works for all CSS processing paths (widget styling, global classes, inline styles, ID selectors, etc.)
3. **Backward Compatible**: Existing code continues to work without changes
4. **Single Source of Truth**: One method handles all property conversion with fallback logic
5. **Maintainable**: No duplicate code or separate fallback methods
6. **User-Friendly**: Users see all their CSS preserved, either as atomic styling or custom CSS

## Non-Goals

- Expanding the atomic schema to support more properties (out of scope)
- Auto-converting CSS variables (handled by separate processor)
- Handling pseudo-elements/classes in custom CSS (future enhancement)

## Open Questions

1. **Q**: Should custom CSS be scoped to breakpoints?
   **A**: Yes, custom CSS should respect the current breakpoint context

2. **Q**: How to handle `!important` in custom CSS?
   **A**: Preserve the `!important` flag in the custom CSS output

3. **Q**: Should we validate CSS syntax before adding to custom CSS?
   **A**: No, trust the input CSS is valid - let the browser handle invalid CSS

## Timeline

- **Phase 1**: 2 hours (Core integration)
- **Phase 2**: 3 hours (Widget styling integration + testing)
- **Phase 3**: 2 hours (Global classes integration + testing)
- **Phase 4**: 1 hour (Cleanup)

**Total**: ~8 hours

## Rollout Plan

1. Implement behind feature flag initially
2. Test with real-world CSS conversions (OboxThemes, etc.)
3. Enable by default once verified
4. Monitor for any edge cases or issues









