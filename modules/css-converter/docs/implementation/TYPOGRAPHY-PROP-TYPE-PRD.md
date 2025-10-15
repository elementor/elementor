# Typography Prop Type Handling - Product Requirements Document

## 📋 **Document Information**

**Version**: 1.0  
**Date**: October 13, 2025  
**Status**: 🎯 **READY FOR IMPLEMENTATION**  
**Priority**: **HIGH** - Step 4 Advanced Prop Types  

---

## 🎯 **Executive Summary**

This PRD defines the implementation requirements for comprehensive Typography prop type handling in the CSS Converter. Currently, typography properties are handled individually (font-size, font-weight, text-transform, etc.), but atomic widgets support a unified Typography prop type that can handle multiple typography properties in a single atomic structure.

### **Current State vs. Target State**

| **Current State** | **Target State** |
|---|---|
| ❌ Individual property mappers (font-size, font-weight, etc.) | ✅ Unified Typography prop type mapper |
| ❌ No font-family support | ✅ Complete font-family handling |
| ❌ Missing text-decoration, line-height mappers | ✅ All typography properties supported |
| ❌ No unified typography object | ✅ Single atomic typography prop |

---

## 🔍 **Current Implementation Analysis**

### **✅ Already Implemented Typography Mappers**
1. **Font_Size_Property_Mapper** - `font-size` → Size_Prop_Type ✅
2. **Font_Weight_Property_Mapper** - `font-weight` → String_Prop_Type ✅  
3. **Text_Transform_Property_Mapper** - `text-transform` → String_Prop_Type ✅
4. **Text_Align_Property_Mapper** - `text-align` → String_Prop_Type ✅
5. **Letter_Spacing_Property_Mapper** - `letter-spacing` → Size_Prop_Type ✅

### **❌ Missing Typography Mappers**
1. **Font_Family_Property_Mapper** - `font-family` → String_Prop_Type ❌
2. **Line_Height_Property_Mapper** - `line-height` → Size_Prop_Type ❌
3. **Text_Decoration_Property_Mapper** - `text-decoration` → String_Prop_Type ❌
4. **Font_Style_Property_Mapper** - `font-style` → String_Prop_Type ❌
5. **Word_Spacing_Property_Mapper** - `word-spacing` → Size_Prop_Type ❌

### **🎯 Future Enhancement: Unified Typography Prop Type**
- **Typography_Property_Mapper** - Multiple properties → Typography_Prop_Type ⏳

---

## 📚 **Atomic Widgets Typography Schema Reference**

Based on `/plugins/elementor/modules/atomic-widgets/styles/style-schema.php`:

```php
private static function get_typography_props() {
    return [
        'font-family' => String_Prop_Type::make(),
        'font-weight' => String_Prop_Type::make()->enum([
            '100', '200', '300', '400', '500', '600', '700', '800', '900',
            'normal', 'bold', 'bolder', 'lighter',
        ]),
        'font-size' => Size_Prop_Type::make()->units( Size_Constants::typography() ),
        'color' => Color_Prop_Type::make(),
        'letter-spacing' => Size_Prop_Type::make()->units( Size_Constants::typography() ),
        'word-spacing' => Size_Prop_Type::make()->units( Size_Constants::typography() ),
        'line-height' => Size_Prop_Type::make()->units( Size_Constants::typography() ),
        'text-align' => String_Prop_Type::make()->enum([
            'start', 'center', 'end', 'justify',
        ]),
        'font-style' => String_Prop_Type::make()->enum([
            'normal', 'italic', 'oblique',
        ]),
        'text-decoration' => String_Prop_Type::make(),
        'text-transform' => String_Prop_Type::make()->enum([
            'none', 'capitalize', 'uppercase', 'lowercase',
        ]),
        'direction' => String_Prop_Type::make()->enum([
            'ltr', 'rtl',
        ]),
    ];
}
```

---

## 🎯 **Implementation Requirements**

### **Phase 1: Complete Individual Property Mappers** (CURRENT SCOPE)

#### **1.1 Font Family Property Mapper**
**File**: `font-family-property-mapper.php`  
**Priority**: HIGH  
**Atomic Source**: String_Prop_Type  

**Requirements**:
- Support CSS font stacks: `"Arial, sans-serif"`
- Handle quoted font names: `"Times New Roman", serif`
- Support web fonts: `"Open Sans", Arial, sans-serif`
- Validate against common font families
- Handle generic families: `serif`, `sans-serif`, `monospace`, `cursive`, `fantasy`

**Expected Structure**:
```php
[
    '$$type' => 'string',
    'value' => 'Arial, sans-serif'
]
```

#### **1.2 Line Height Property Mapper**
**File**: `line-height-property-mapper.php`  
**Priority**: HIGH  
**Atomic Source**: Size_Prop_Type with typography units  

**Requirements**:
- Support unitless values: `1.5` → `{"size": 1.5, "unit": ""}`
- Support size values: `24px`, `1.5em`, `150%`
- Handle `normal` keyword
- Validate against Size_Constants::typography()

**Expected Structure**:
```php
[
    '$$type' => 'size',
    'value' => [
        'size' => 1.5,
        'unit' => '' // unitless for line-height
    ]
]
```

#### **1.3 Text Decoration Property Mapper**
**File**: `text-decoration-property-mapper.php`  
**Priority**: MEDIUM  
**Atomic Source**: String_Prop_Type  

**Requirements**:
- Support basic values: `none`, `underline`, `line-through`, `overline`
- Handle shorthand: `underline solid red`
- Extract decoration line only (ignore style/color for now)
- Validate against atomic widget expectations

**Expected Structure**:
```php
[
    '$$type' => 'string',
    'value' => 'underline'
]
```

#### **1.4 Font Style Property Mapper**
**File**: `font-style-property-mapper.php`  
**Priority**: MEDIUM  
**Atomic Source**: String_Prop_Type with enum validation  

**Requirements**:
- Support enum values: `normal`, `italic`, `oblique`
- Validate against atomic widget enum
- Handle invalid values gracefully

**Expected Structure**:
```php
[
    '$$type' => 'string',
    'value' => 'italic'
]
```

#### **1.5 Word Spacing Property Mapper**
**File**: `word-spacing-property-mapper.php`  
**Priority**: LOW  
**Atomic Source**: Size_Prop_Type with typography units  

**Requirements**:
- Support size values: `2px`, `0.1em`, `normal`
- Handle `normal` keyword → `{"size": 0, "unit": "px"}`
- Validate against Size_Constants::typography()

**Expected Structure**:
```php
[
    '$$type' => 'size',
    'value' => [
        'size' => 2,
        'unit' => 'px'
    ]
]
```

### **Phase 2: Unified Typography Prop Type** (FUTURE SCOPE)

#### **2.1 Typography Property Mapper**
**File**: `typography-property-mapper.php`  
**Priority**: FUTURE  
**Atomic Source**: Typography_Prop_Type (to be researched)  

**Requirements**:
- Handle multiple typography properties in single CSS rule
- Support CSS `font` shorthand property
- Generate unified typography atomic prop
- Maintain backward compatibility with individual mappers

---

## 🧪 **Testing Requirements**

### **Playwright Tests to Create**

#### **1. Font Family Test**
**File**: `font-family-prop-type.test.ts`
```typescript
test('font-family property conversion', async ({ page }) => {
    // Test CSS: font-family: "Arial, sans-serif"
    // Expected: String prop type with font stack
});
```

#### **2. Line Height Test**  
**File**: `line-height-prop-type.test.ts`
```typescript
test('line-height property conversion', async ({ page }) => {
    // Test unitless: line-height: 1.5
    // Test with units: line-height: 24px
    // Test percentage: line-height: 150%
});
```

#### **3. Text Decoration Test**
**File**: `text-decoration-prop-type.test.ts`
```typescript
test('text-decoration property conversion', async ({ page }) => {
    // Test basic: text-decoration: underline
    // Test none: text-decoration: none
    // Test complex: text-decoration: underline solid red
});
```

#### **4. Font Style Test**
**File**: `font-style-prop-type.test.ts`
```typescript
test('font-style property conversion', async ({ page }) => {
    // Test enum values: normal, italic, oblique
});
```

#### **5. Word Spacing Test**
**File**: `word-spacing-prop-type.test.ts`
```typescript
test('word-spacing property conversion', async ({ page }) => {
    // Test normal keyword and size values
});
```

### **PHPUnit Tests to Create**

#### **Property Mapper Unit Tests**
- `Font_Family_Property_Mapper_Test.php`
- `Line_Height_Property_Mapper_Test.php`
- `Text_Decoration_Property_Mapper_Test.php`
- `Font_Style_Property_Mapper_Test.php`
- `Word_Spacing_Property_Mapper_Test.php`

---

## 📋 **Implementation Checklist**

### **Phase 1: Individual Property Mappers**

#### **Font Family Mapper**
- [ ] Create `Font_Family_Property_Mapper` class
- [ ] Implement font stack parsing
- [ ] Handle quoted font names
- [ ] Add to Property_Mapper_Registry
- [ ] Create Playwright test
- [ ] Create PHPUnit test
- [ ] Verify atomic compliance

#### **Line Height Mapper**
- [ ] Create `Line_Height_Property_Mapper` class  
- [ ] Handle unitless values correctly
- [ ] Support size units (px, em, rem, %)
- [ ] Handle `normal` keyword
- [ ] Add to Property_Mapper_Registry
- [ ] Create Playwright test
- [ ] Create PHPUnit test
- [ ] Verify atomic compliance

#### **Text Decoration Mapper**
- [ ] Create `Text_Decoration_Property_Mapper` class
- [ ] Parse decoration shorthand
- [ ] Extract line type only
- [ ] Add to Property_Mapper_Registry
- [ ] Create Playwright test
- [ ] Create PHPUnit test
- [ ] Verify atomic compliance

#### **Font Style Mapper**
- [ ] Create `Font_Style_Property_Mapper` class
- [ ] Implement enum validation
- [ ] Add to Property_Mapper_Registry
- [ ] Create Playwright test
- [ ] Create PHPUnit test
- [ ] Verify atomic compliance

#### **Word Spacing Mapper**
- [ ] Create `Word_Spacing_Property_Mapper` class
- [ ] Handle `normal` keyword
- [ ] Support typography units
- [ ] Add to Property_Mapper_Registry
- [ ] Create Playwright test
- [ ] Create PHPUnit test
- [ ] Verify atomic compliance

### **Integration & Testing**
- [ ] Update Property_Mapper_Registry with all new mappers
- [ ] Run all existing prop-type tests to ensure no regressions
- [ ] Update CSS Converter test plan documentation
- [ ] Add typography examples to test CSS file

---

## 🚨 **Critical Implementation Notes**

### **Atomic-Only Compliance Requirements**
All typography property mappers MUST follow atomic-only compliance:

```php
// ✅ CORRECT: Use atomic prop types directly
return String_Prop_Type::make()
    ->enum(['normal', 'italic', 'oblique'])
    ->generate($font_style_value);

// ❌ WRONG: Never use fallbacks or custom JSON
return $this->create_v4_property($property, $value);
```

### **Font Family Special Considerations**
- **Font stacks**: Must preserve entire stack, not just first font
- **Quoted names**: Handle both single and double quotes
- **Generic families**: Always preserve fallback generics
- **Web fonts**: Support Google Fonts and custom font names

### **Line Height Special Considerations**
- **Unitless values**: Most common, should be preserved as unitless
- **Computed values**: Don't attempt to compute em/rem to px
- **Normal keyword**: Should be handled as special case
- **Percentage values**: Convert to decimal (150% → 1.5) if needed

---

## 📊 **Success Metrics**

### **Completion Criteria**
- ✅ All 5 missing typography property mappers implemented
- ✅ All mappers pass Playwright tests
- ✅ All mappers pass PHPUnit tests  
- ✅ 100% atomic-only compliance
- ✅ Zero regressions in existing tests
- ✅ Documentation updated

### **Quality Gates**
- **Code Coverage**: >90% for all new mappers
- **Atomic Compliance**: 100% - no fallbacks or custom JSON
- **Test Coverage**: Playwright + PHPUnit for each mapper
- **Performance**: No significant impact on conversion speed
- **Compatibility**: Works with all existing CSS Converter features

---

## 🔮 **Future Enhancements (Out of Scope)**

### **Typography Prop Type Research**
- Research if atomic widgets support unified Typography prop type
- Investigate CSS `font` shorthand property support
- Consider typography preset/theme integration
- Explore advanced typography features (text-shadow, text-stroke)

### **Advanced Typography Features**
- Text shadow support
- Text stroke support  
- Advanced text-decoration (style, color, thickness)
- Font variant support
- Font stretch support

---

## 📚 **References**

### **Atomic Widgets Sources**
- `/plugins/elementor/modules/atomic-widgets/styles/style-schema.php` - Typography schema
- `/plugins/elementor/modules/atomic-widgets/prop-types/` - Prop type implementations
- `/plugins/elementor/modules/atomic-widgets/styles/size-constants.php` - Typography units

### **Existing Implementation Examples**
- `Font_Size_Property_Mapper` - Size_Prop_Type usage
- `Font_Weight_Property_Mapper` - String_Prop_Type with enum
- `Text_Transform_Property_Mapper` - String enum validation
- `Letter_Spacing_Property_Mapper` - Size_Prop_Type for typography

### **Testing Examples**
- `font-size-prop-type.test.ts` - Size prop type testing
- `background-prop-type.test.ts` - Complex prop type testing
- `dimensions-prop-type.test.ts` - Multi-value prop testing

---

**This PRD provides a complete roadmap for implementing comprehensive typography support in the CSS Converter, ensuring 100% atomic widget compliance and maintaining the high quality standards established in Step 3.**
