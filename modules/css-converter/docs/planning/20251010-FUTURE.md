# CSS Converter - Future Enhancements

This document tracks CSS features that are not currently supported due to atomic widget limitations, but could be implemented when atomic widgets are enhanced.

## 🚫 **UNSUPPORTED CSS FEATURES**

### **Border Radius - Elliptical Syntax**

#### **Not Supported:**
- `border-radius: 50px / 20px` (horizontal/vertical syntax)
- `border-radius: 50px 20px / 10px 40px` (complex elliptical)
- `border-top-left-radius: 30px / 15px` (individual corner elliptical)

#### **Atomic Widget Limitation:**
- `Border_Radius_Prop_Type` only supports single `Size_Prop_Type` per corner
- No support for separate horizontal/vertical radii in atomic widgets
- Current structure: `{"$$type":"size","value":{"size":10,"unit":"px"}}`
- Required structure: `{"horizontal":{"$$type":"size",...},"vertical":{"$$type":"size",...}}`

#### **Workaround:**
- Use single radius values: `border-radius: 50px` instead of `border-radius: 50px / 20px`
- Elliptical syntax is automatically rejected and returns `null`

#### **Future Implementation Requirements:**
1. **Atomic Widget Enhancement**: Extend `Border_Radius_Prop_Type` to support elliptical structure
2. **Prop Type Update**: Add horizontal/vertical radius support to atomic widgets
3. **CSS Parser Enhancement**: Parse `/` separator syntax in border-radius values
4. **Transformer Update**: Update `Multi_Props_Transformer` for elliptical CSS output

---

### **Grid Layout Properties**

#### **Not Supported:**
- `grid-template-columns`, `grid-template-rows`
- `grid-gap`, `grid-column-gap`, `grid-row-gap`
- `grid-area`, `grid-column`, `grid-row`

#### **Atomic Widget Limitation:**
- No atomic prop types for grid layout properties
- `display: grid` is supported, but grid-specific properties are not

#### **Future Implementation Requirements:**
1. **New Prop Types**: Create `Grid_Template_Prop_Type`, `Grid_Gap_Prop_Type`
2. **Atomic Widget Support**: Add grid properties to `style-schema.php`
3. **CSS Parser**: Implement grid-specific value parsing

---

### **Advanced Transform Properties**

#### **Not Supported:**
- 3D transforms: `transform: rotateX(45deg) rotateY(30deg)`
- Complex transform functions: `transform: perspective(1000px) rotateX(45deg)`
- Transform-style: `transform-style: preserve-3d`

#### **Atomic Widget Limitation:**
- Current `Transform_Prop_Type` supports basic 2D transforms only
- No 3D transform support in atomic widgets

---

### **Pseudo-Classes and Pseudo-Elements**

#### **Not Supported:**
- `:hover` - hover state styling
- `:focus` - focus state styling
- `:active` - active state styling
- `:before` and `:after` - pseudo-elements
- `:first-child`, `:last-child` - structural pseudo-classes
- `:nth-child()` - complex selectors

#### **Atomic Widget Limitation:**
- Atomic widgets currently focus on base state styling only
- No prop types exist for state-based or pseudo-element styling
- State management handled separately in Elementor's style system
- Pseudo-classes require selector context not available in atomic prop types

#### **Future Implementation Requirements:**
1. **Atomic Widget Enhancement**: Add state-based styling support to atomic widgets
2. **New Prop Types**: Create `State_Styles_Prop_Type` for hover/focus/active states
3. **CSS Parser Enhancement**: Parse pseudo-class selectors and group styles by state
4. **Style System Integration**: Connect to Elementor's existing state management
5. **Selector Context**: Maintain selector-to-state relationships during conversion

#### **Workaround:**
- Apply hover styles manually in Elementor editor's "Style" tab
- Use Elementor's built-in hover state controls for widgets
- State styling not preserved during HTML/CSS import

---

### **Modern CSS Features**

#### **Not Supported:**
- Container queries: `@container (min-width: 300px)`
- CSS layers: `@layer base, components, utilities`
- CSS nesting: `.parent { .child { color: red; } }`
- Custom properties with fallbacks: `var(--color, blue)`

#### **Atomic Widget Limitation:**
- Atomic widgets focus on component-level styling
- No support for advanced CSS features that require global context

---

### **Text Shadow Property**

#### **Not Supported:**
- `text-shadow: 2px 2px 4px rgba(0,0,0,0.3)` - Text shadow effects
- All text-shadow variations (single and multiple shadows)

#### **Atomic Widget Limitation:**
- `Shadow_Prop_Type` exists in atomic widgets for box shadows
- Atomic style schema (`style-schema.php`) only supports `box-shadow`, not `text-shadow`
- No `text-shadow` property in typography props or effects props
- The atomic widget renderer doesn't apply text-shadow styles

#### **Current Status:**
- ✅ Text-shadow property mapper exists in CSS Converter (`text-shadow-property-mapper.php`)
- ✅ Mapper converts text-shadow to correct atomic format using `Shadow_Prop_Type`
- ✅ Mapper is registered and will process text-shadow values
- ✅ **Debugging added** - Comprehensive logging to track text-shadow processing
- ❌ **CONFIRMED**: Atomic widgets cannot render text-shadow (missing from `style-schema.php`)
- ❌ **VERIFIED**: Text-shadow is NOT in `get_typography_props()` in atomic widgets
- ❌ Text-shadow styles are processed but rejected by atomic widget renderer

#### **Future Implementation Requirements:**
1. **Atomic Widget Schema Update**: Add `text-shadow` to `get_typography_props()` or `get_effects_props()` in `style-schema.php`
2. **Use Existing Prop Type**: Reuse `Shadow_Prop_Type` (already supports the correct structure)
3. **CSS Converter Ready**: Property mapper already implemented and waiting for atomic widget support
4. **Renderer Update**: Ensure atomic widget renderer outputs text-shadow CSS

#### **Implementation Example:**
```php
// In plugins/elementor/modules/atomic-widgets/styles/style-schema.php
private static function get_typography_props() {
    return [
        // ... existing typography props
        'text-shadow' => Shadow_Prop_Type::make(), // Add this line
    ];
}
```

---

## 📋 **IMPLEMENTATION PRIORITY**

### **High Priority (Atomic Widget Dependent)**
1. **Text Shadow** - ✅ Mapper ready, only needs schema update in atomic widgets
2. **Pseudo-Classes (`:hover`, `:focus`, `:active`)** - High user demand for interactive states
3. **Elliptical Border Radius** - Extends existing `Border_Radius_Prop_Type`
4. **Grid Layout Properties** - High demand CSS feature
5. **Advanced Box Shadow** - Multiple shadows, inset variations

### **Medium Priority**
1. **Pseudo-Elements (`:before`, `:after`)** - Content generation and decoration
2. **3D Transforms** - Extends existing `Transform_Prop_Type`
3. **Advanced Filters** - Extends existing filter support
4. **Custom Properties** - CSS variables support

### **Low Priority**
1. **Structural Pseudo-Classes** - `:first-child`, `:last-child`, `:nth-child()`
2. **Container Queries** - Requires global context changes
3. **CSS Layers** - Architectural changes needed
4. **CSS Nesting** - Parser complexity

---

## 🔮 **DEFERRED FEATURES**

### **Border-Width Keyword Values**

#### **Not Yet Supported:**
- `border-width: thin` (maps to 1px)
- `border-width: medium` (maps to 3px - default)
- `border-width: thick` (maps to 5px)

#### **Current Status:**
- All numeric border-width values work correctly
- Keyword values (thin/medium/thick) not yet implemented
- Requires simple keyword-to-px mapping in `Border_Width_Property_Mapper`

#### **Future Implementation:**
```php
// In border-width-property-mapper.php
private function parse_border_width_value( $value ): ?array {
    // Handle keyword values
    $keywords = [
        'thin' => '1px',
        'medium' => '3px',
        'thick' => '5px',
    ];
    
    if ( isset( $keywords[$value] ) ) {
        $value = $keywords[$value];
    }
    
    // Continue with existing logic...
}
```

---

### **Margin Auto for Centering**

#### **Not Yet Supported:**
- `margin: auto` - for centering elements
- `margin-left: auto` - right alignment
- `margin-right: auto` - left alignment
- `margin-inline: auto` - horizontal centering

#### **Testing Challenge:**
- Playwright difficulty in testing auto margin behavior
- Auto margins depend on parent container context
- Centering behavior requires specific layout setup
- Hard to assert computed values reliably

#### **Current Workaround:**
- Use explicit pixel/percentage values for margins
- Test skipped due to Playwright testing complexity

#### **Future Implementation Needs:**
1. **CSS Parser Enhancement**: Support `auto` keyword for margin values
2. **Atomic Widget Verification**: Check if `Dimensions_Prop_Type` supports `auto` values
3. **Testing Strategy**: Develop reliable Playwright assertions for auto margin behavior
4. **Edge Case Handling**: Handle mixed values (e.g., `margin: 10px auto`)

---

---

### **HTML Attribute Styling Conversion**

#### **Research Needed:**
- Convert HTML attribute-based styling to atomic widget properties or global classes
- Examples: `id="header"` → widget ID or global class, `data-*` → custom properties
- Semantic attributes: `aria-*`, `role` → accessibility properties

#### **Current Status:**
- ✅ **DECISION**: HTML attributes are NOT processed in CSS converter (removed for simplicity)
- ✅ **RATIONALE**: CSS IDs not needed (styling applied directly to widgets)
- ✅ **RATIONALE**: Data attributes not needed (no JavaScript functionality added)
- ❌ **LIMITATION**: Semantic attributes (aria-*, role) are lost during conversion

#### **Research Areas:**
1. **ID Attribute Conversion**: Research converting CSS `#id` selectors to:
   - Atomic widget ID properties (if supported)
   - Global classes with ID-based naming
   - Custom CSS classes for targeting

2. **Semantic Attribute Preservation**: Research preserving accessibility attributes:
   - `aria-label`, `aria-describedby`, `role` attributes
   - Integration with Elementor's accessibility features
   - Atomic widget accessibility prop types

3. **Data Attribute Conversion**: Research converting `data-*` attributes to:
   - Custom properties in atomic widgets
   - Global CSS custom properties (`--data-*`)
   - Widget metadata for JavaScript hooks

4. **Performance vs. Fidelity Trade-offs**: Research impact of attribute processing:
   - Conversion speed with attribute processing
   - Editor performance with preserved attributes
   - Maintenance complexity vs. feature completeness

#### **Implementation Considerations:**
- **Atomic Widget Support**: Check if atomic widgets support custom attributes
- **Global Classes Integration**: Use existing global classes system for attribute-based styling
- **Accessibility Compliance**: Ensure semantic attributes are preserved for screen readers
- **JavaScript Compatibility**: Consider data attributes for frontend interactions

#### **Future Implementation Requirements:**
1. **Atomic Widget Research**: Study `Attributes_Prop_Type` and custom attribute support
2. **Global Classes Extension**: Extend global classes to handle ID-based styling
3. **Accessibility Mapping**: Create semantic attribute to atomic property mappings
4. **Performance Testing**: Measure impact of attribute processing on conversion speed
5. **User Research**: Determine if attribute preservation is needed for real-world use cases

#### **Priority:** Low (Research Phase)
- Current CSS conversion works perfectly without attributes
- Attribute preservation is a nice-to-have, not essential for CSS styling
- Research needed to determine if the complexity is worth the benefits

---

## 🎯 **ATOMIC-ONLY COMPLIANCE**

All future implementations MUST:

1. **Derive from atomic widgets** - No custom JSON structures
2. **Use atomic prop types** - Extend existing or create new atomic prop types
3. **Zero fallback mechanisms** - Fail fast for unsupported features
4. **100% atomic validation** - All JSON validated by atomic widgets
5. **Document atomic source** - Reference specific atomic widget files

---

## 📝 **CONTRIBUTION GUIDELINES**

When atomic widgets add support for new features:

1. **Research atomic implementation** first
2. **Study prop type structure** and validation rules
3. **Create atomic-compliant mapper** using existing patterns
4. **Add comprehensive tests** (PHPUnit + Playwright)
5. **Update documentation** and remove from this FUTURE.md
6. **Verify 100% atomic compliance** - no custom JSON generation

---

**Remember: This CSS converter is atomic-widget-driven. We implement what atomic widgets support, not what CSS specifications allow.**

