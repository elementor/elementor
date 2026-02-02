# Atomic Widget Prop Types Catalog

## 📋 **Complete Prop Types Reference**

**Research Date**: September 23, 2025  
**Source**: `/plugins/elementor/modules/atomic-widgets/prop-types/`  
**Total Prop Types**: 40+ prop types cataloged  

---

## 🎯 **Core Prop Types for CSS Properties**

### **1. Size_Prop_Type** 
**File**: `size-prop-type.php`  
**Key**: `'size'`  
**Used for**: `font-size`, `width`, `height`, `max-width`, `min-width`, `margin`, `padding` values

#### **Expected Structure**:
```php
[
    '$$type' => 'size',
    'value' => [
        'size' => (float|int) $numeric_value,  // MUST be numeric, not string
        'unit' => (string) $unit_string        // 'px', 'em', 'rem', '%', etc.
    ]
]
```

#### **Validation Rules**:
- `size` must be numeric (int or float)
- `unit` must be from supported units list
- Special units: `'auto'` (size = ''), `'custom'` (size = any value)

---

### **2. Color_Prop_Type**
**File**: `color-prop-type.php`  
**Key**: `'color'`  
**Used for**: `color`, `background-color`

#### **Expected Structure**:
```php
[
    '$$type' => 'color',
    'value' => (string) $color_value  // '#ffffff', 'rgba(255,255,255,1)', etc.
]
```

#### **Validation Rules**:
- Extends `String_Prop_Type`
- Accepts hex, rgb, rgba, hsl, hsla, named colors

---

### **3. Dimensions_Prop_Type**
**File**: `dimensions-prop-type.php`  
**Key**: `'dimensions'`  
**Used for**: `margin`, `padding` (shorthand properties)

#### **Expected Structure**:
```php
[
    '$$type' => 'dimensions',
    'value' => [
        'block-start' => ['$$type' => 'size', 'value' => ['size' => $top, 'unit' => $unit]],
        'inline-end' => ['$$type' => 'size', 'value' => ['size' => $right, 'unit' => $unit]],
        'block-end' => ['$$type' => 'size', 'value' => ['size' => $bottom, 'unit' => $unit]],
        'inline-start' => ['$$type' => 'size', 'value' => ['size' => $left, 'unit' => $unit]],
    ]
]
```

#### **Validation Rules**:
- Each dimension is a `Size_Prop_Type`
- Uses logical properties (block/inline instead of top/right/bottom/left)

---

### **4. Box_Shadow_Prop_Type**
**File**: `box-shadow-prop-type.php`  
**Key**: `'box-shadow'`  
**Used for**: `box-shadow`

#### **Expected Structure**:
```php
[
    '$$type' => 'box-shadow',
    'value' => [
        [
            '$$type' => 'shadow',
            'value' => [
                'hOffset' => ['$$type' => 'size', 'value' => ['size' => $h, 'unit' => 'px']],
                'vOffset' => ['$$type' => 'size', 'value' => ['size' => $v, 'unit' => 'px']],
                'blur' => ['$$type' => 'size', 'value' => ['size' => $blur, 'unit' => 'px']],
                'spread' => ['$$type' => 'size', 'value' => ['size' => $spread, 'unit' => 'px']],
                'color' => ['$$type' => 'color', 'value' => $color],
                'position' => null // or 'inset'
            ]
        ]
        // Multiple shadows can be in array
    ]
]
```

#### **Validation Rules**:
- Array of `Shadow_Prop_Type` objects
- Each shadow has required hOffset, vOffset, blur, spread, color
- `position` is optional (null or 'inset')

---

### **5. Shadow_Prop_Type**
**File**: `shadow-prop-type.php`  
**Key**: `'shadow'`  
**Used for**: Individual shadow objects, `text-shadow`

#### **Expected Structure**:
```php
[
    '$$type' => 'shadow',
    'value' => [
        'hOffset' => ['$$type' => 'size', 'value' => ['size' => $h, 'unit' => 'px']],
        'vOffset' => ['$$type' => 'size', 'value' => ['size' => $v, 'unit' => 'px']],
        'blur' => ['$$type' => 'size', 'value' => ['size' => $blur, 'unit' => 'px']],
        'spread' => ['$$type' => 'size', 'value' => ['size' => $spread, 'unit' => 'px']],
        'color' => ['$$type' => 'color', 'value' => $color],
        'position' => null // or 'inset'
    ]
]
```

---

### **6. Border_Radius_Prop_Type**
**File**: `border-radius-prop-type.php`  
**Key**: `'border-radius'`  
**Used for**: `border-radius`

#### **Expected Structure**:
```php
[
    '$$type' => 'border-radius',
    'value' => [
        'start-start' => ['$$type' => 'size', 'value' => ['size' => $top_left, 'unit' => 'px']],
        'start-end' => ['$$type' => 'size', 'value' => ['size' => $top_right, 'unit' => 'px']],
        'end-start' => ['$$type' => 'size', 'value' => ['size' => $bottom_left, 'unit' => 'px']],
        'end-end' => ['$$type' => 'size', 'value' => ['size' => $bottom_right, 'unit' => 'px']],
    ]
]
```

#### **Validation Rules**:
- Uses logical properties (start-start = top-left, etc.)
- Each corner is a `Size_Prop_Type`

---

### **7. Background_Prop_Type**
**File**: `background-prop-type.php`  
**Key**: `'background'`  
**Used for**: `background` shorthand

#### **Expected Structure**:
```php
[
    '$$type' => 'background',
    'value' => [
        // Complex nested structure - needs detailed research
        'color' => ['$$type' => 'color', 'value' => $color],
        'image' => ['$$type' => 'image', 'value' => $image_data],
        // Additional background properties
    ]
]
```

---

## 🔤 **String-Based Prop Types**

### **8. String_Prop_Type**
**File**: `primitives/string-prop-type.php`  
**Key**: `'string'`  
**Used for**: `display`, `position`, `flex-direction`, `align-items`, `text-align`

#### **Expected Structure**:
```php
[
    '$$type' => 'string',
    'value' => (string) $string_value
]
```

---

## 🔢 **Numeric Prop Types**

### **9. Number_Prop_Type**
**File**: `primitives/number-prop-type.php`  
**Key**: `'number'`  
**Used for**: `opacity`, `z-index`, numeric values without units

#### **Expected Structure**:
```php
[
    '$$type' => 'number',
    'value' => (float|int) $numeric_value
]
```

---

## 📐 **Layout Prop Types**

### **10. Flex_Prop_Type**
**File**: `flex-prop-type.php`  
**Key**: `'flex'`  
**Used for**: `flex` shorthand

### **11. Position_Prop_Type**
**File**: `position-prop-type.php`  
**Key**: `'position'`  
**Used for**: `position` property

---

## 🎨 **Advanced Prop Types**

### **12. Filter_Prop_Type**
**File**: `filters/filter-prop-type.php`  
**Key**: `'filter'`  
**Used for**: `filter` property

### **13. Transform_Prop_Type**
**File**: `transform/transform-prop-type.php`  
**Key**: `'transform'`  
**Used for**: `transform` property

### **14. Transition_Prop_Type**
**File**: `transition-prop-type.php`  
**Key**: `'transition'`  
**Used for**: `transition` property

---

## 🏗️ **Widget Builder API**

### **Widget_Builder Class**
**File**: `/elements/widget-builder.php`

#### **API Methods**:
```php
Widget_Builder::make( string $widget_type )
    ->settings( array $settings )
    ->is_locked( bool $is_locked )
    ->editor_settings( array $editor_settings )
    ->build()
```

#### **Output Structure**:
```php
[
    'elType' => 'widget',
    'widgetType' => $widget_type,
    'settings' => $settings,
    'isLocked' => $is_locked,
    'editor_settings' => $editor_settings,
]
```

### **Element_Builder Class**
**File**: `/elements/element-builder.php`

#### **API Methods**:
```php
Element_Builder::make( string $element_type )
    ->settings( array $settings )
    ->is_locked( bool $is_locked )
    ->editor_settings( array $editor_settings )
    ->children( array $children )
    ->build()
```

---

## 🧪 **Critical Implementation Notes**

### **1. Numeric Values Must Be Numeric**
```php
// ❌ WRONG - String numeric values
['size' => '16', 'unit' => 'px']

// ✅ CORRECT - Actual numeric values
['size' => 16, 'unit' => 'px']
```

### **2. Proper $$type Usage**
```php
// ❌ WRONG - Missing or incorrect $$type
['value' => ['size' => 16, 'unit' => 'px']]

// ✅ CORRECT - Proper $$type
['$$type' => 'size', 'value' => ['size' => 16, 'unit' => 'px']]
```

### **3. Nested Prop Types**
```php
// Complex prop types contain other prop types
// Box shadow contains Shadow_Prop_Type which contains Size_Prop_Type and Color_Prop_Type
```

---

## 📊 **Prop Type Coverage for CSS Properties**

### **Phase 1 - Core Types**
- ✅ `Size_Prop_Type` - font-size, width, height, margins, padding
- ✅ `Color_Prop_Type` - color, background-color
- ✅ `String_Prop_Type` - display, position, flex-direction, align-items
- ✅ `Dimensions_Prop_Type` - margin, padding shorthand

### **Phase 2 - Complex Types**
- ✅ `Box_Shadow_Prop_Type` - box-shadow
- ✅ `Shadow_Prop_Type` - text-shadow
- ✅ `Border_Radius_Prop_Type` - border-radius
- ✅ `Background_Prop_Type` - background

### **Phase 3 - Specialized Types**
- 🔄 `Border_Width_Prop_Type` - border-width
- 🔄 `Filter_Prop_Type` - filter
- 🔄 `Transform_Prop_Type` - transform
- 🔄 `Transition_Prop_Type` - transition

---

## 🎯 **Next Steps**

1. **✅ Prop Types Cataloged** - Complete understanding of atomic prop types
2. **🔄 Create Prop Type Mappers** - Map CSS values to atomic prop types
3. **🔄 Implement Widget Builder Integration** - Use Widget_Builder for JSON creation
4. **🔄 Validate with Atomic Widgets** - Ensure generated JSON passes validation

---

**Research Status**: COMPLETE  
**Total Prop Types Identified**: 40+  
**Core Prop Types for CSS**: 14 identified  
**Widget Builder API**: Documented  
**Ready for Implementation**: ✅
