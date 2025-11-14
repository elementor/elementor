# PRD: Custom CSS Fallback for Unsupported Properties

## Executive Summary

When converting CSS to atomic widgets, many CSS properties and values are not supported by the atomic widget schema. Atomic Widgets now support custom CSS, so we need to implement a fallback mechanism that applies unsupported properties/values as custom CSS instead of dropping them.

## Problem Statement

### Current Behavior
When the CSS Converter encounters:
1. **Unsupported CSS properties** (e.g., `clip-path`, `mask`, `scroll-behavior`)
2. **Unsupported CSS values** (e.g., `align-items: initial`, `display: table`)
3. **Complex CSS values** (e.g., `calc()` expressions not supported by atomic schema)

These properties are **silently dropped**, resulting in visual differences between the original and converted widgets.

### Example Issue
**Original CSS:**
```css
.elementor-element-a431a3a {
    align-items: initial;  /* Not in atomic enum */
    clip-path: polygon(...); /* Not supported property */
}
```

**Current Conversion:**
```json
{
  "props": {
    // Properties are dropped - no custom CSS fallback
  }
}
```

**Expected Conversion:**
```json
{
  "props": {
    "custom-css": {
      "$$type": "string",
      "value": "align-items: initial;\nclip-path: polygon(...);"
    }
  }
}
```

## Goals

1. ✅ **Preserve Visual Fidelity**: No CSS properties should be silently dropped
2. ✅ **Automatic Fallback**: Unsupported properties automatically go to custom CSS
3. ✅ **Clean Separation**: Supported properties use atomic schema, unsupported use custom CSS
4. ✅ **Developer Experience**: Clear logging of what went to custom CSS and why

## Non-Goals

1. ❌ Expanding atomic widget schema to support all CSS properties
2. ❌ Validating custom CSS syntax
3. ❌ Converting custom CSS back to atomic properties

## Technical Design

### Architecture Overview

```
CSS Property → Property Mapper
                    ↓
            [Is Supported?]
                    ↓
        ┌───────────┴───────────┐
        ↓                       ↓
   [Supported]            [Unsupported]
        ↓                       ↓
  Atomic Props          Custom CSS Buffer
        ↓                       ↓
        └───────────┬───────────┘
                    ↓
            Final Widget Props
```

### Component Changes

#### 1. Property Validation Layer

**New File:** `plugins/elementor-css/modules/css-converter/services/css/atomic-property-validator.php`

```php
class Atomic_Property_Validator {
    
    private $supported_properties = [
        'display' => ['block', 'inline', 'flex', 'grid', ...],
        'align-items' => ['normal', 'stretch', 'center', 'start', ...],
        // ... from style-schema.php
    ];
    
    public function is_property_supported( string $property ): bool;
    
    public function is_value_supported( string $property, string $value ): bool;
    
    public function get_unsupported_reason( string $property, string $value ): string;
}
```

**Responsibilities:**
- Check if property exists in atomic schema
- Check if value is in enum (for enum properties)
- Return reason for unsupported status

#### 2. Custom CSS Collector

**New File:** `plugins/elementor-css/modules/css-converter/services/css/custom-css-collector.php`

```php
class Custom_Css_Collector {
    
    private $custom_css_buffer = [];
    
    public function add_property( string $widget_id, string $property, string $value, bool $important = false ): void;
    
    public function get_custom_css_for_widget( string $widget_id ): string;
    
    public function has_custom_css( string $widget_id ): bool;
    
    public function clear_widget_buffer( string $widget_id ): void;
}
```

**Responsibilities:**
- Collect unsupported properties per widget
- Format as valid CSS string
- Handle `!important` flags
- Group by widget ID

#### 3. Property Mapper Enhancement

**Modified File:** `plugins/elementor-css/modules/css-converter/services/css/atomic-property-mapper.php`

```php
class Atomic_Property_Mapper {
    
    private Atomic_Property_Validator $validator;
    private Custom_Css_Collector $custom_css_collector;
    
    public function map_property( string $property, string $value, bool $important, string $widget_id ): ?array {
        
        // Check if property is supported
        if ( ! $this->validator->is_property_supported( $property ) ) {
            $this->log_unsupported( $property, $value, 'Property not in atomic schema' );
            $this->custom_css_collector->add_property( $widget_id, $property, $value, $important );
            return null;
        }
        
        // Check if value is supported
        if ( ! $this->validator->is_value_supported( $property, $value ) ) {
            $reason = $this->validator->get_unsupported_reason( $property, $value );
            $this->log_unsupported( $property, $value, $reason );
            $this->custom_css_collector->add_property( $widget_id, $property, $value, $important );
            return null;
        }
        
        // Map to atomic property
        return $this->map_to_atomic_format( $property, $value, $important );
    }
}
```

#### 4. Widget Data Formatter Enhancement

**Modified File:** `plugins/elementor-css/modules/css-converter/services/widgets/atomic-widget-data-formatter.php`

```php
class Atomic_Widget_Data_Formatter {
    
    private Custom_Css_Collector $custom_css_collector;
    
    public function format_widget_data( array $widget ): array {
        
        $formatted = [
            'id' => $widget['id'],
            'elType' => $widget['widget_type'],
            'settings' => $this->format_settings( $widget ),
            'styles' => $this->format_styles( $widget ),
        ];
        
        // Add custom CSS if present
        if ( $this->custom_css_collector->has_custom_css( $widget['id'] ) ) {
            $custom_css = $this->custom_css_collector->get_custom_css_for_widget( $widget['id'] );
            $formatted['settings']['custom-css'] = [
                '$$type' => 'string',
                'value' => $custom_css,
            ];
        }
        
        return $formatted;
    }
}
```

### Property Support Matrix

#### Supported Properties (from atomic schema)

| Category | Properties | Status |
|----------|-----------|--------|
| **Layout** | `display`, `flex-direction`, `gap`, `flex-wrap`, `flex` | ✅ Supported |
| **Alignment** | `justify-content`, `align-content`, `align-items`, `align-self`, `order` | ✅ Supported |
| **Sizing** | `width`, `height`, `min-*`, `max-*`, `overflow`, `aspect-ratio`, `object-fit` | ✅ Supported |
| **Spacing** | `margin-*`, `padding-*` | ✅ Supported |
| **Position** | `position`, `inset-*`, `z-index` | ✅ Supported |
| **Typography** | `font-*`, `text-*`, `line-height`, `letter-spacing`, `word-spacing` | ✅ Supported |
| **Border** | `border-*`, `border-radius` | ✅ Supported |
| **Background** | `background-color`, `background-image`, `background-*` | ✅ Supported |
| **Effects** | `opacity`, `box-shadow`, `filter`, `backdrop-filter`, `transform`, `transition` | ✅ Supported |

#### Unsupported Properties (→ Custom CSS)

| Category | Properties | Reason |
|----------|-----------|--------|
| **Clipping** | `clip-path`, `mask`, `mask-*` | Not in atomic schema |
| **Tables** | `table-layout`, `border-collapse`, `border-spacing` | Not in atomic schema |
| **Columns** | `column-*`, `break-*` | Not in atomic schema |
| **Scroll** | `scroll-behavior`, `scroll-snap-*`, `overscroll-behavior` | Not in atomic schema |
| **Writing** | `writing-mode`, `text-orientation` | Not in atomic schema |
| **Lists** | `list-style-*` | Not in atomic schema |
| **Outlines** | `outline-*` | Not in atomic schema |
| **Cursors** | `cursor`, `pointer-events` | Not in atomic schema |
| **Content** | `content`, `quotes` | Not in atomic schema |

#### Unsupported Values (→ Custom CSS)

| Property | Unsupported Values | Reason |
|----------|-------------------|--------|
| `display` | `table`, `table-cell`, `table-row`, `list-item` | Not in enum |
| `align-items` | `initial`, `inherit`, `unset`, `revert`, `baseline` | Not in enum |
| `justify-content` | `initial`, `inherit`, `unset`, `revert` | Not in enum |
| `position` | `initial`, `inherit`, `unset`, `revert` | Not in enum |
| `overflow` | `initial`, `inherit`, `unset`, `revert`, `scroll`, `clip` | Not in enum |

### CSS Keywords Handling

**Global CSS Keywords** (should go to custom CSS):
- `initial` - Resets to initial value
- `inherit` - Inherits from parent
- `unset` - Resets to inherited or initial
- `revert` - Reverts to browser default
- `revert-layer` - Reverts to previous cascade layer

**Rationale:** Atomic widgets don't support CSS inheritance/cascade keywords, so these must be preserved as custom CSS.

## Implementation Plan

### Phase 1: Validation Infrastructure (Week 1)

**Tasks:**
1. ✅ Create `Atomic_Property_Validator` class
2. ✅ Extract property/value enums from `style-schema.php`
3. ✅ Implement `is_property_supported()` method
4. ✅ Implement `is_value_supported()` method
5. ✅ Add unit tests for validator

**Deliverables:**
- Working validator that can check any property/value pair
- 100% test coverage for validation logic

### Phase 2: Custom CSS Collection (Week 1)

**Tasks:**
1. ✅ Create `Custom_Css_Collector` class
2. ✅ Implement buffer management per widget
3. ✅ Implement CSS string formatting
4. ✅ Handle `!important` flags
5. ✅ Add unit tests for collector

**Deliverables:**
- Working collector that buffers unsupported properties
- Proper CSS formatting with semicolons and newlines

### Phase 3: Property Mapper Integration (Week 2)

**Tasks:**
1. ✅ Inject validator and collector into property mapper
2. ✅ Update `map_property()` to check support
3. ✅ Route unsupported properties to custom CSS
4. ✅ Add logging for unsupported properties
5. ✅ Update existing tests

**Deliverables:**
- Property mapper automatically routes to custom CSS
- Clear logs showing what went to custom CSS

### Phase 4: Widget Formatter Integration (Week 2)

**Tasks:**
1. ✅ Inject collector into widget formatter
2. ✅ Add custom CSS to widget settings
3. ✅ Format custom CSS property correctly
4. ✅ Test with real conversions
5. ✅ Update integration tests

**Deliverables:**
- Widgets include `custom-css` setting when needed
- Custom CSS renders correctly in editor

### Phase 5: Testing & Documentation (Week 3)

**Tasks:**
1. ✅ Test with oboxthemes.com conversion
2. ✅ Verify `align-items: initial` goes to custom CSS
3. ✅ Test complex properties (clip-path, mask, etc.)
4. ✅ Update conversion statistics
5. ✅ Document custom CSS usage

**Deliverables:**
- All unsupported properties preserved
- Documentation for developers
- Updated PRD with results

## Success Metrics

### Quantitative Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| **Property Preservation** | 100% | No properties dropped |
| **Visual Fidelity** | 95%+ | Visual diff score |
| **Performance Impact** | <5% | Conversion time increase |
| **Custom CSS Usage** | <20% | % of properties in custom CSS |

### Qualitative Metrics

- ✅ Developers understand when/why custom CSS is used
- ✅ Converted widgets look identical to originals
- ✅ Custom CSS is readable and maintainable
- ✅ Clear error messages for unsupported features

## Edge Cases & Considerations

### 1. CSS Variable References in Custom CSS

**Issue:** Custom CSS might contain `var(--custom-variable)`

**Solution:** Preserve as-is in custom CSS. Variables will resolve at runtime.

```css
/* Custom CSS */
clip-path: var(--my-clip-path);
```

### 2. Vendor Prefixes

**Issue:** Properties like `-webkit-mask`, `-moz-appearance`

**Solution:** Preserve in custom CSS with prefixes intact.

```css
/* Custom CSS */
-webkit-mask: linear-gradient(...);
-moz-appearance: none;
```

### 3. Shorthand Properties

**Issue:** Shorthand like `border: 1px solid red` might be partially supported

**Solution:** 
- If ALL parts supported → expand and use atomic props
- If ANY part unsupported → entire shorthand to custom CSS

### 4. Important Flags

**Issue:** `!important` must be preserved

**Solution:** Custom CSS collector handles `!important` flag:

```css
/* Custom CSS */
clip-path: polygon(...) !important;
```

### 5. Multiple Breakpoints

**Issue:** Custom CSS might need different values per breakpoint

**Solution:** Phase 2 feature - for now, desktop only.

## Logging & Debugging

### Log Format

```
[CSS_CONVERTER] Property 'clip-path' not supported in atomic schema → Custom CSS
[CSS_CONVERTER] Value 'initial' not supported for 'align-items' (allowed: normal, stretch, center, start, end, flex-start, flex-end, self-start, self-end, anchor-center) → Custom CSS
[CSS_CONVERTER] Widget 'abc123' has 3 properties in custom CSS
```

### Statistics Tracking

Add to conversion statistics:

```json
{
  "custom_css_usage": {
    "widgets_with_custom_css": 5,
    "total_custom_css_properties": 12,
    "most_common_unsupported": {
      "clip-path": 4,
      "align-items: initial": 3,
      "mask": 2
    }
  }
}
```

## Future Enhancements

### Phase 2: Breakpoint Support

Custom CSS per breakpoint:

```json
{
  "custom-css": {
    "$$type": "string",
    "value": {
      "desktop": "clip-path: polygon(...);",
      "tablet": "clip-path: polygon(...);",
      "mobile": "clip-path: none;"
    }
  }
}
```

### Phase 3: Custom CSS Optimization

- Detect duplicate custom CSS across widgets
- Extract to global classes
- Minify custom CSS strings

### Phase 4: Smart Fallbacks

For common unsupported values, provide smart fallbacks:

| Unsupported | Fallback |
|-------------|----------|
| `align-items: initial` | `align-items: normal` |
| `display: table` | `display: block` (with warning) |
| `overflow: scroll` | `overflow: auto` |

## Open Questions

1. **Q:** Should we attempt to convert `initial` to the CSS initial value equivalent?
   **A:** No - preserve as custom CSS for accuracy. Phase 4 can add smart fallbacks.

2. **Q:** What about CSS that's invalid or has syntax errors?
   **A:** Pass through to custom CSS as-is. Browser will handle errors.

3. **Q:** Should custom CSS be editable in the editor?
   **A:** Yes - atomic widgets support custom CSS editing in the UI.

4. **Q:** How do we handle specificity conflicts between atomic props and custom CSS?
   **A:** Custom CSS is applied after atomic props, so it wins. Document this behavior.

## References

- [Elementor Atomic Widgets Style Schema](../../../elementor/modules/atomic-widgets/styles/style-schema.php)
- [CSS Variable Resolution PRD](./PRD-CSS-VARIABLE-RESOLUTION.md)
- [Property Mapper Documentation](../services/css/atomic-property-mapper.php)

## Approval

- [ ] Engineering Lead
- [ ] Product Manager
- [ ] UX Designer
- [ ] QA Lead

---

**Document Version:** 1.0  
**Last Updated:** 2025-11-02  
**Author:** AI Assistant  
**Status:** Draft → Ready for Review






