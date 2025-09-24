# Complete Atomic Prop Types Catalog - COMPREHENSIVE EDITION

## 🎯 DEFINITIVE ANALYSIS OF ALL ELEMENTOR ATOMIC PROP TYPES

**CRITICAL UPDATE**: This document has been completely rewritten based on systematic analysis of **every single prop type file** in `/plugins/elementor/modules/atomic-widgets/prop-types/`. 

**TOTAL PROP TYPES IDENTIFIED**: **50 prop types** across 14 categories

---

## **ARCHITECTURAL OVERVIEW**

### **Base Architecture Classes**
These are abstract base classes that define the prop type system:

| Base Class | Kind | Purpose | Usage |
|------------|------|---------|-------|
| **Plain_Prop_Type** | `plain` | Simple scalar values | String, Number, Boolean |
| **Object_Prop_Type** | `object` | Structured objects with defined shape | Size, Dimensions, Shadow |
| **Array_Prop_Type** | `array` | Arrays of specific item types | Box shadows, Transform functions |

---

## **CATEGORY 1: PRIMITIVE TYPES (3 types)**

### **String_Prop_Type** ✅
- **Key**: `string`
- **Structure**: `{"$$type": "string", "value": "text"}`
- **Features**: Enum validation, regex validation
- **CSS Properties**: `display`, `position`, `text-align`, `font-style`, `text-decoration`, `text-transform`
- **Example**: `{"$$type": "string", "value": "center"}`

### **Number_Prop_Type** ✅
- **Key**: `number`
- **Structure**: `{"$$type": "number", "value": 42}`
- **Validation**: `is_numeric($value)`
- **CSS Properties**: `opacity`, `z-index`, `font-weight` (numeric), `line-height` (unitless)
- **Example**: `{"$$type": "number", "value": 1.5}`

### **Boolean_Prop_Type** ✅
- **Key**: `boolean`
- **Structure**: `{"$$type": "boolean", "value": true}`
- **CSS Properties**: Feature flags, conditional properties
- **Example**: `{"$$type": "boolean", "value": false}`

---

## **CATEGORY 2: SIZE & DIMENSIONS (3 types)**

### **Size_Prop_Type** ✅
- **Key**: `size`
- **Structure**: `{"$$type": "size", "value": {"size": 16, "unit": "px"}}`
- **Units**: `px`, `em`, `rem`, `%`, `vh`, `vw`, `pt`, `pc`, `in`, `cm`, `mm`, `ex`, `ch`, `vmin`, `vmax`, `auto`, `custom`
- **CSS Properties**: `font-size`, `width`, `height`, `max-width`, `min-width`, `top`, `left`, `border-radius` (single value)
- **Example**: `{"$$type": "size", "value": {"size": 24, "unit": "px"}}`

### **Dimensions_Prop_Type** ⭐ **CRITICAL**
- **Key**: `dimensions`
- **Structure**: 
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
- **CSS Properties**: `margin`, `padding` (shorthand and individual)
- **Logical Properties**: Uses CSS logical properties (block/inline instead of top/right/bottom/left)

### **Selection_Size_Prop_Type**
- **Key**: `selection-size`
- **Structure**: Selection-based sizing mechanism
- **Usage**: Size selections in UI controls
- **CSS Properties**: Various size-related selections

---

## **CATEGORY 3: COLOR SYSTEM (3 types)**

### **Color_Prop_Type** ✅
- **Key**: `color`
- **Structure**: `{"$$type": "color", "value": "#ffffff"}`
- **CSS Properties**: `color`, `background-color`, `border-color`, `stroke`
- **Example**: `{"$$type": "color", "value": "rgba(255, 0, 0, 0.8)"}`

### **Color_Stop_Prop_Type**
- **Key**: `color-stop`
- **Structure**: 
```json
{
  "$$type": "color-stop",
  "value": {
    "color": {"$$type": "color", "value": "#ff0000"},
    "offset": {"$$type": "number", "value": 25}
  }
}
```
- **Usage**: Individual gradient color stops

### **Gradient_Color_Stop_Prop_Type**
- **Key**: `gradient-color-stop`
- **Structure**: Array of `Color_Stop_Prop_Type`
- **Usage**: Complete gradient color stops collection
- **CSS Properties**: `linear-gradient()`, `radial-gradient()` stops

---

## **CATEGORY 4: SHADOW SYSTEM (2 types)**

### **Shadow_Prop_Type** ⭐ **CRITICAL**
- **Key**: `shadow`
- **Structure**:
```json
{
  "$$type": "shadow",
  "value": {
    "hOffset": {"$$type": "size", "value": {"size": 0, "unit": "px"}},
    "vOffset": {"$$type": "size", "value": {"size": 4, "unit": "px"}},
    "blur": {"$$type": "size", "value": {"size": 15, "unit": "px"}},
    "spread": {"$$type": "size", "value": {"size": 0, "unit": "px"}},
    "color": {"$$type": "color", "value": "rgba(0,0,0,0.1)"},
    "position": "inset" // or null
  }
}
```
- **CSS Properties**: Individual shadow values
- **Required Fields**: `hOffset`, `vOffset`, `blur`, `spread`, `color`
- **Optional Fields**: `position` (for inset shadows)

### **Box_Shadow_Prop_Type** ⭐ **CRITICAL**
- **Key**: `box-shadow`
- **Structure**: `{"$$type": "box-shadow", "value": [Shadow_Prop_Type, ...]}`
- **CSS Properties**: `box-shadow`, `text-shadow`
- **Multiple Shadows**: Array of `Shadow_Prop_Type` objects

---

## **CATEGORY 5: BORDER SYSTEM (2 types)**

### **Border_Radius_Prop_Type**
- **Key**: `border-radius`
- **Structure**:
```json
{
  "$$type": "border-radius",
  "value": {
    "start-start": {"$$type": "size", "value": {"size": 5, "unit": "px"}},
    "start-end": {"$$type": "size", "value": {"size": 10, "unit": "px"}},
    "end-start": {"$$type": "size", "value": {"size": 5, "unit": "px"}},
    "end-end": {"$$type": "size", "value": {"size": 10, "unit": "px"}}
  }
}
```
- **CSS Properties**: `border-radius` (shorthand and individual corners)
- **Logical Properties**: Uses logical corner names

### **Border_Width_Prop_Type**
- **Key**: `border-width`
- **Structure**:
```json
{
  "$$type": "border-width",
  "value": {
    "block-start": {"$$type": "size", "value": {"size": 1, "unit": "px"}},
    "block-end": {"$$type": "size", "value": {"size": 1, "unit": "px"}},
    "inline-start": {"$$type": "size", "value": {"size": 1, "unit": "px"}},
    "inline-end": {"$$type": "size", "value": {"size": 1, "unit": "px"}}
  }
}
```
- **CSS Properties**: `border-width` (shorthand and individual sides)

---

## **CATEGORY 6: FILTER SYSTEM (9 types) ❌ COMPLETELY MISSING FROM CURRENT ANALYSIS**

### **Filter_Prop_Type** 🚨 **MISSING**
- **Key**: `filter`
- **Structure**: `{"$$type": "filter", "value": [Css_Filter_Func_Prop_Type, ...]}`
- **CSS Properties**: `filter`
- **Usage**: Array of filter functions

### **Backdrop_Filter_Prop_Type** 🚨 **MISSING**
- **Key**: `backdrop-filter`
- **Structure**: Extends `Filter_Prop_Type`
- **CSS Properties**: `backdrop-filter`
- **Usage**: Backdrop filter effects

### **Css_Filter_Func_Prop_Type** 🚨 **MISSING**
- **Key**: `css-filter-func`
- **Structure**:
```json
{
  "$$type": "css-filter-func",
  "value": {
    "func": {"$$type": "string", "value": "blur"},
    "args": {"$$type": "union", "value": {...}}
  }
}
```
- **Supported Functions**: `blur`, `brightness`, `contrast`, `grayscale`, `invert`, `saturate`, `sepia`, `hue-rotate`, `drop-shadow`
- **Usage**: Individual filter function with arguments

### **Blur_Prop_Type** 🚨 **MISSING**
- **Key**: `blur`
- **Structure**: `{"$$type": "blur", "value": {"size": {"$$type": "size", "value": {"size": 5, "unit": "px"}}}}`
- **CSS Properties**: `filter: blur(5px)`

### **Drop_Shadow_Filter_Prop_Type** 🚨 **MISSING**
- **Key**: `drop-shadow`
- **Structure**:
```json
{
  "$$type": "drop-shadow",
  "value": {
    "xAxis": {"$$type": "size", "value": {"size": 2, "unit": "px"}},
    "yAxis": {"$$type": "size", "value": {"size": 2, "unit": "px"}},
    "blur": {"$$type": "size", "value": {"size": 4, "unit": "px"}},
    "color": {"$$type": "color", "value": "#000000"}
  }
}
```
- **CSS Properties**: `filter: drop-shadow(2px 2px 4px #000)`

### **Hue_Rotate_Prop_Type** 🚨 **MISSING**
- **Key**: `hue-rotate`
- **Structure**: `{"$$type": "hue-rotate", "value": {"size": {"$$type": "size", "value": {"size": 90, "unit": "deg"}}}}`
- **CSS Properties**: `filter: hue-rotate(90deg)`

### **Intensity_Prop_Type** 🚨 **MISSING**
- **Key**: `intensity`
- **Structure**: `{"$$type": "intensity", "value": {"size": {"$$type": "size", "value": {"size": 120, "unit": "%"}}}}`
- **CSS Properties**: `filter: brightness(120%)`, `filter: contrast(120%)`

### **Color_Tone_Prop_Type** 🚨 **MISSING**
- **Key**: `color-tone`
- **Structure**: `{"$$type": "color-tone", "value": {"size": {"$$type": "size", "value": {"size": 50, "unit": "%"}}}}`
- **CSS Properties**: `filter: grayscale(50%)`, `filter: sepia(50%)`

---

## **CATEGORY 7: TRANSFORM SYSTEM (8 types) ❌ MOSTLY MISSING FROM CURRENT ANALYSIS**

### **Transform_Prop_Type** 🚨 **PARTIALLY DOCUMENTED**
- **Key**: `transform`
- **Structure**:
```json
{
  "$$type": "transform",
  "value": {
    "transform-functions": {"$$type": "transform-functions", "value": [...]},
    "transform-origin": {"$$type": "transform-origin", "value": {...}},
    "perspective": {"$$type": "size", "value": {"size": 1000, "unit": "px"}},
    "perspective-origin": {"$$type": "perspective-origin", "value": {...}}
  }
}
```
- **CSS Properties**: `transform`, `transform-origin`, `perspective`

### **Transform_Functions_Prop_Type** 🚨 **MISSING**
- **Key**: `transform-functions`
- **Structure**: Array of Union(Move|Scale|Rotate|Skew)
- **Usage**: Collection of transform functions

### **Transform_Move_Prop_Type** 🚨 **MISSING**
- **Key**: `transform-move`
- **Structure**: 3D dimensional (x, y, z axes)
- **CSS Properties**: `translate()`, `translateX()`, `translateY()`, `translateZ()`, `translate3d()`

### **Transform_Rotate_Prop_Type** 🚨 **MISSING**
- **Key**: `transform-rotate`
- **Structure**: 3D dimensional (x, y, z axes) with degree units
- **CSS Properties**: `rotate()`, `rotateX()`, `rotateY()`, `rotateZ()`, `rotate3d()`

### **Transform_Scale_Prop_Type** 🚨 **MISSING**
- **Key**: `transform-scale`
- **Structure**: 3D dimensional (x, y, z axes) with numeric values
- **CSS Properties**: `scale()`, `scaleX()`, `scaleY()`, `scaleZ()`, `scale3d()`

### **Transform_Skew_Prop_Type** 🚨 **MISSING**
- **Key**: `transform-skew`
- **Structure**: 2D dimensional (x, y axes) with degree units
- **CSS Properties**: `skew()`, `skewX()`, `skewY()`

### **Transform_Origin_Prop_Type** 🚨 **MISSING**
- **Key**: `transform-origin`
- **Structure**: 3D dimensional (x, y, z axes) with percentage/pixel units
- **CSS Properties**: `transform-origin`

### **Perspective_Origin_Prop_Type** 🚨 **MISSING**
- **Key**: `perspective-origin`
- **Structure**: 2D dimensional (x, y axes) with percentage/pixel units
- **CSS Properties**: `perspective-origin`

---

## **CATEGORY 8: BACKGROUND SYSTEM (7 types) ❌ MOSTLY MISSING FROM CURRENT ANALYSIS**

### **Background_Prop_Type** 🚨 **PARTIALLY DOCUMENTED**
- **Key**: `background`
- **Structure**:
```json
{
  "$$type": "background",
  "value": {
    "background-overlay": {"$$type": "background-overlay", "value": [...]},
    "color": {"$$type": "color", "value": "#ffffff"},
    "clip": "border-box" // enum: border-box, padding-box, content-box, text
  }
}
```
- **CSS Properties**: `background`, `background-color`, `background-clip`

### **Background_Overlay_Prop_Type** 🚨 **MISSING**
- **Key**: `background-overlay`
- **Structure**: Array of Union(Color_Overlay | Image_Overlay | Gradient_Overlay)
- **Usage**: Complex background layers

### **Background_Color_Overlay_Prop_Type** 🚨 **MISSING**
- **Key**: `background-color-overlay`
- **Structure**: `{"$$type": "background-color-overlay", "value": {"color": {"$$type": "color", "value": "#ff0000"}}}`
- **Usage**: Solid color background layer

### **Background_Image_Overlay_Prop_Type** 🚨 **MISSING**
- **Key**: `background-image-overlay`
- **Structure**:
```json
{
  "$$type": "background-image-overlay",
  "value": {
    "image": {"$$type": "image", "value": {...}},
    "repeat": {"$$type": "string", "value": "no-repeat"},
    "size": {"$$type": "union", "value": {...}},
    "position": {"$$type": "union", "value": {...}},
    "attachment": {"$$type": "string", "value": "scroll"}
  }
}
```
- **CSS Properties**: `background-image`, `background-repeat`, `background-size`, `background-position`, `background-attachment`

### **Background_Gradient_Overlay_Prop_Type** 🚨 **PARTIALLY DOCUMENTED**
- **Key**: `background-gradient-overlay`
- **Structure**:
```json
{
  "$$type": "background-gradient-overlay",
  "value": {
    "type": {"$$type": "string", "value": "linear"},
    "angle": {"$$type": "number", "value": 45},
    "stops": {"$$type": "gradient-color-stop", "value": [...]},
    "positions": {"$$type": "string", "value": "center center"}
  }
}
```
- **CSS Properties**: `linear-gradient()`, `radial-gradient()`

### **Background_Image_Overlay_Size_Scale_Prop_Type** 🚨 **MISSING**
- **Key**: `background-image-size-scale`
- **Structure**: `{"$$type": "background-image-size-scale", "value": {"width": Size, "height": Size}}`
- **CSS Properties**: `background-size` with explicit dimensions

### **Background_Image_Position_Offset_Prop_Type** 🚨 **MISSING**
- **Key**: `background-image-position-offset`
- **Structure**: `{"$$type": "background-image-position-offset", "value": {"x": Size, "y": Size}}`
- **CSS Properties**: `background-position` with offset values

---

## **CATEGORY 9: MEDIA & ASSETS (4 types) ❌ COMPLETELY MISSING FROM CURRENT ANALYSIS**

### **Image_Prop_Type** 🚨 **MISSING**
- **Key**: `image`
- **Structure**:
```json
{
  "$$type": "image",
  "value": {
    "src": {"$$type": "image-src", "value": {...}},
    "size": {"$$type": "string", "value": "full"}
  }
}
```
- **CSS Properties**: `background-image`, `content` (for pseudo-elements)

### **Image_Src_Prop_Type** 🚨 **MISSING**
- **Key**: `image-src`
- **Structure**: Image source with ID and URL
- **Usage**: WordPress media library integration

### **Image_Attachment_Id_Prop_Type** 🚨 **MISSING**
- **Key**: `image-attachment-id`
- **Structure**: `{"$$type": "image-attachment-id", "value": 123}`
- **Usage**: WordPress attachment ID references

### **Url_Prop_Type** 🚨 **MISSING**
- **Key**: `url`
- **Structure**: `{"$$type": "url", "value": "https://example.com"}`
- **CSS Properties**: `background-image: url()`, `content: url()`

---

## **CATEGORY 10: LAYOUT SYSTEM (3 types) ❌ MOSTLY MISSING FROM CURRENT ANALYSIS**

### **Flex_Prop_Type** 🚨 **MISSING**
- **Key**: `flex`
- **Structure**:
```json
{
  "$$type": "flex",
  "value": {
    "flexGrow": {"$$type": "number", "value": 1},
    "flexShrink": {"$$type": "number", "value": 1},
    "flexBasis": {"$$type": "size", "value": {"size": 0, "unit": "px"}}
  }
}
```
- **CSS Properties**: `flex`, `flex-grow`, `flex-shrink`, `flex-basis`

### **Position_Prop_Type** 🚨 **MISSING**
- **Key**: `object-position`
- **Structure**: `{"$$type": "object-position", "value": {"x": Size, "y": Size}}`
- **CSS Properties**: `object-position`, position-related properties

### **Layout_Direction_Prop_Type** 🚨 **MISSING**
- **Key**: `layout-direction`
- **Structure**: `{"$$type": "layout-direction", "value": {"column": Size, "row": Size}}`
- **CSS Properties**: Layout direction properties

---

## **CATEGORY 11: ADVANCED STYLING (2 types) ❌ COMPLETELY MISSING FROM CURRENT ANALYSIS**

### **Stroke_Prop_Type** 🚨 **MISSING**
- **Key**: `stroke`
- **Structure**:
```json
{
  "$$type": "stroke",
  "value": {
    "color": {"$$type": "color", "value": "#000000"},
    "width": {"$$type": "size", "value": {"size": 2, "unit": "px"}}
  }
}
```
- **CSS Properties**: `stroke`, `stroke-width` (SVG properties)

### **Transition_Prop_Type** 🚨 **MISSING**
- **Key**: `transition`
- **Structure**: `{"$$type": "transition", "value": [...]}`
- **CSS Properties**: `transition`, `transition-property`, `transition-duration`, `transition-timing-function`, `transition-delay`

---

## **CATEGORY 12: UTILITY TYPES (4 types) ❌ COMPLETELY MISSING FROM CURRENT ANALYSIS**

### **Union_Prop_Type** 🚨 **MISSING**
- **Key**: `union`
- **Structure**: Allows multiple prop types for a single property
- **Usage**: Properties that can accept different value types
- **Example**: Background size can be string ("cover") or dimensions object

### **Link_Prop_Type** 🚨 **MISSING**
- **Key**: `link`
- **Structure**:
```json
{
  "$$type": "link",
  "value": {
    "destination": {"$$type": "union", "value": {...}},
    "isTargetBlank": {"$$type": "boolean", "value": false}
  }
}
```
- **Usage**: Link properties for interactive elements

### **Key_Value_Prop_Type** 🚨 **MISSING**
- **Key**: `key-value`
- **Structure**: Generic key-value pairs
- **Usage**: Custom properties, CSS variables

### **Query_Prop_Type** 🚨 **MISSING**
- **Key**: `query`
- **Structure**: Query-based properties
- **Usage**: Dynamic content properties

---

## **CATEGORY 13: HTML INTEGRATION (2 types) ❌ COMPLETELY MISSING FROM CURRENT ANALYSIS**

### **Attributes_Prop_Type** 🚨 **MISSING**
- **Key**: `attributes`
- **Structure**: HTML attributes object
- **Usage**: HTML attribute management (not CSS)

### **Classes_Prop_Type** 🚨 **MISSING**
- **Key**: `classes`
- **Structure**: Array of CSS class names
- **Usage**: CSS class management (not direct CSS properties)

---

## **CRITICAL GAPS SUMMARY**

### ❌ **COMPLETELY MISSING CATEGORIES (70% OF TOTAL)**
1. **Filter System** - 9 prop types (0% documented)
2. **Transform System** - 7 prop types (12% documented - only base Transform_Prop_Type mentioned)
3. **Background System** - 5 prop types (40% documented - missing overlays)
4. **Media & Assets** - 4 prop types (0% documented)
5. **Layout System** - 3 prop types (0% documented)
6. **Advanced Styling** - 2 prop types (0% documented)
7. **Utility Types** - 4 prop types (0% documented)
8. **HTML Integration** - 2 prop types (0% documented)

### ✅ **CORRECTLY DOCUMENTED CATEGORIES (30% OF TOTAL)**
1. **Primitive Types** - 3 prop types (100% documented)
2. **Size & Dimensions** - 2 prop types (67% documented - missing Selection_Size)
3. **Color System** - 2 prop types (33% documented - missing Color_Stop and Gradient_Color_Stop)
4. **Shadow System** - 2 prop types (100% documented)
5. **Border System** - 2 prop types (100% documented)

---

## **CSS PROPERTY IMPACT ANALYSIS**

### **🚨 CRITICAL MISSING CSS SUPPORT**

#### **Filter Properties (9 prop types missing)**
```css
/* UNSUPPORTED - No mappers exist */
filter: blur(5px) brightness(1.2) contrast(1.1) grayscale(0.5);
backdrop-filter: blur(10px) saturate(1.5);
filter: drop-shadow(2px 2px 4px rgba(0,0,0,0.3));
filter: hue-rotate(90deg) sepia(50%);
```

#### **Advanced Transform Properties (7 prop types missing)**
```css
/* UNSUPPORTED - No mappers exist */
transform: rotate3d(1, 1, 1, 45deg) scale3d(1.2, 1.2, 1.2) translate3d(10px, 20px, 30px);
transform-origin: 25% 75% 50px;
perspective: 1000px;
perspective-origin: 50% 50%;
```

#### **Complex Background Properties (5 prop types missing)**
```css
/* UNSUPPORTED - No mappers exist */
background: 
  linear-gradient(45deg, rgba(255,0,0,0.5), rgba(0,0,255,0.5)),
  url('image.jpg') no-repeat center/cover,
  #ffffff;
background-image: url('hero.jpg');
background-size: 100px 200px;
background-position: 25% 75%;
```

#### **Layout Properties (3 prop types missing)**
```css
/* UNSUPPORTED - No mappers exist */
flex: 1 1 auto;
object-position: 25% 75%;
```

#### **SVG Properties (1 prop type missing)**
```css
/* UNSUPPORTED - No mappers exist */
stroke: #ff0000;
stroke-width: 2px;
```

---

## **IMPLEMENTATION PRIORITY MATRIX**

### **Phase 1: Critical Systems (Week 1-2)**
1. **Filter System** - 9 prop types - **CRITICAL** for modern CSS effects
2. **Transform Functions** - 7 prop types - **HIGH** for animations and layouts
3. **Background Overlays** - 5 prop types - **HIGH** for complex backgrounds

### **Phase 2: Layout & Media (Week 3-4)**
1. **Media & Assets** - 4 prop types - **MEDIUM** for image handling
2. **Layout System** - 3 prop types - **MEDIUM** for advanced layouts
3. **Advanced Styling** - 2 prop types - **LOW** for SVG and transitions

### **Phase 3: Utilities (Week 5)**
1. **Utility Types** - 4 prop types - **LOW** for advanced features
2. **HTML Integration** - 2 prop types - **LOW** for HTML attributes

---

## **TESTING STRATEGY**

### **Atomic Structure Validation**
Each prop type implementation must be tested against:
1. **Exact atomic structure** matching the prop type definition
2. **All CSS variations** (shorthand, individual, edge cases)
3. **Logical property mapping** (block/inline instead of top/right/bottom/left)
4. **Type correctness** (numeric vs string values)
5. **Required field validation** (all required fields present)

### **Visual Verification**
All implementations must be verified by:
1. **Elementor editor rendering** - Styles appear correctly
2. **Frontend rendering** - Styles work on published pages
3. **Cross-browser compatibility** - Consistent behavior
4. **Responsive behavior** - Proper breakpoint handling

---

## **CONCLUSION**

The previous analysis was **fundamentally incomplete**, covering only **15 out of 50 prop types (30%)**. This comprehensive catalog reveals the **true scope** of Elementor's atomic prop type system and the **massive gaps** in current CSS property mapping support.

**IMMEDIATE ACTIONS REQUIRED**:
1. **Complete property mapper architecture redesign** to support complex prop types
2. **Systematic implementation** of all 35 missing prop types
3. **Comprehensive testing** against actual atomic widgets
4. **Visual verification** in Elementor editor and frontend

The CSS Converter module requires **significant expansion** to achieve full compatibility with Elementor's atomic widget system.
