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

## 📋 **IMPLEMENTATION PRIORITY**

### **High Priority (Atomic Widget Dependent)**
1. **Elliptical Border Radius** - Extends existing `Border_Radius_Prop_Type`
2. **Grid Layout Properties** - High demand CSS feature
3. **Advanced Box Shadow** - Multiple shadows, inset variations

### **Medium Priority**
1. **3D Transforms** - Extends existing `Transform_Prop_Type`
2. **Advanced Filters** - Extends existing filter support
3. **Custom Properties** - CSS variables support

### **Low Priority**
1. **Container Queries** - Requires global context changes
2. **CSS Layers** - Architectural changes needed
3. **CSS Nesting** - Parser complexity

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

