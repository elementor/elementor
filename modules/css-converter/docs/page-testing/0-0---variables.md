postman
http://elementor.local:10003/wp-json/elementor/v2/widget-converter

{
  "type": "url",
  "content": "https://oboxthemes.com/",
  "selector": ".elementor-element-089b111"
}


.e-parent
obox: align-self: normal; > reality:  align-self: initial;



.e-con-inner
 align-self: auto > > reality:  align-self: initial;


div.elementor-widget
text-align: left > text-align: center

img


...

div inner wrapper issues:

width
Specifies the width of the content area, padding area or border area (depending on 'box-sizing') of certain boxes.

Widely available across major browsers (Baseline since January 2018)
Learn more

Don't show
: 100%;
    height: 100%;
    padding-block-start: 0px;
    padding-block-end: 0px;
    padding-inline-start: 0px;
    padding-inline-end: 0px;
    margin-block-start: 0px;
    margin-block-end: 0px;
    margin-inline-start: auto;
    margin-inline-end: auto;
    background-color: transparent;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    align-self: auto;
    padding-block-end: var(--padding-bottom);
    padding-block-start: var(--padding-top);
    text-align: initial;
    align-content: initial;
    flex-wrap: initial;
    gap: var(--widgets-spacing-row, 20px) var(--widgets-spacing-column, 20px);
    max-width: min(100%, var(--container-max-width, 1140px));

Issue 1:

  most of the css variables should be applied as variables.
  This shouldn't be added as custom css.

Issue 2: We have css propoerty duplication. E.g. padding-block-start receives styles twice.

## Comprehensive Styling Properties Analysis

| Property | Expected | Received | Status |
|----------|----------|----------|---------|
| **Container Properties** |
| width | 100% | 100% | ✅ Match |
| height | 100% | 100% | ✅ Match |
| max-width | min(100%, var(--container-max-width, 1140px)) | min(100%, var(--container-max-width, 1140px)) | ✅ Match |
| **Padding Properties** |
| padding-block-start | var(--padding-top) | 0px + var(--padding-top) | ❌ Duplication |
| padding-block-end | var(--padding-bottom) | 0px + var(--padding-bottom) | ❌ Duplication |
| padding-inline-start | 0px | 0px | ✅ Match |
| padding-inline-end | 0px | 0px | ✅ Match |
| **Margin Properties** |
| margin-block-start | 0px | 0px | ✅ Match |
| margin-block-end | 0px | 0px | ✅ Match |
| margin-inline-start | auto | auto | ✅ Match |
| margin-inline-end | auto | auto | ✅ Match |
| **Background Properties** |
| background-color | transparent | transparent | ✅ Match |
| **Display & Layout Properties** |
| display | flex | flex | ✅ Match |
| flex-direction | row | row | ✅ Match |
| justify-content | space-between | space-between | ✅ Match |
| align-items | center | center | ✅ Match |
| align-self | initial | auto | ❌ Mismatch |
| align-content | initial | initial | ✅ Match |
| flex-wrap | initial | initial | ✅ Match |
| **Text Properties** |
| text-align | initial | initial | ✅ Match |
| **Spacing Properties** |
| gap | var(--widgets-spacing-row, 20px) var(--widgets-spacing-column, 20px) | var(--widgets-spacing-row, 20px) var(--widgets-spacing-column, 20px) | ✅ Match |

## Element-Specific Issues

### .e-parent
| Property | Expected | Received | Status |
|----------|----------|----------|---------|
| align-self | normal | initial | ❌ Mismatch |

### .e-con-inner
| Property | Expected | Received | Status |
|----------|----------|----------|---------|
| align-self | auto | initial | ❌ Mismatch |

### div.elementor-widget
| Property | Expected | Received | Status |
|----------|----------|----------|---------|
| text-align | left | center | ❌ Mismatch |

## Critical Issues Summary

### 1. CSS Variable Handling
- **Issue**: CSS variables should be preserved as variables, not converted to custom CSS
- **Affected Properties**: 
  - `--padding-top`
  - `--padding-bottom`
  - `--container-max-width`
  - `--widgets-spacing-row`
  - `--widgets-spacing-column`

### 2. Property Duplication
- **Issue**: Some properties receive styles twice causing conflicts
- **Affected Properties**:
  - `padding-block-start`: Gets both `0px` and `var(--padding-top)`
  - `padding-block-end`: Gets both `0px` and `var(--padding-bottom)`

### 3. Align-Self Inconsistencies
- **Issue**: Different elements show inconsistent `align-self` values
- **Pattern**: Expected values (`normal`, `auto`) being converted to `initial`

### 4. Text Alignment Override
- **Issue**: Widget text alignment being overridden from expected value
- **Impact**: Layout changes from intended design

## Recommendations

1. **Preserve CSS Variables**: Implement variable detection to maintain CSS custom properties
2. **Fix Property Duplication**: Ensure single source of truth for each CSS property
3. **Standardize Align-Self**: Create consistent handling of alignment properties
4. **Protect Widget Styles**: Prevent unintended overrides of widget-specific styling

## Complete Element Styling Mapping

### 1. .e-parent (Original Container)

#### Original Styling
```css
.elementor-element-089b111.e-parent {
  --display: flex;
  --flex-direction: column;
  --justify-content: normal;
  --align-items: normal;
  width: 640px;
  height: 44.4688px;
}
```

#### Converted Version (e-div-block)
```css
.e-[generated-class] {
  display: flex;           /* ✅ Preserved */
  flex-direction: column;  /* ✅ Preserved */
  justify-content: normal; /* ✅ Preserved */
  align-items: normal;     /* ✅ Preserved */
  width: 640px;           /* ✅ Preserved */
  height: 44.4688px;      /* ✅ Preserved */
  position: relative;     /* ✅ Added for positioning context */
}
```

| Property | Original | Converted | Status | Notes |
|----------|----------|-----------|---------|-------|
| display | flex | flex | ✅ Match | Proper flex container |
| flex-direction | column | column | ✅ Match | Vertical stacking |
| justify-content | normal | normal | ✅ Match | Browser default |
| align-items | normal | normal | ✅ Match | Browser default |
| width | 640px | 640px | ✅ Match | Container width |
| height | 44.4688px | 44.4688px | ✅ Match | Content height |
| position | static | relative | ⚠️ Enhanced | Added for atomic widgets |

### 2. .e-con-inner (Inner Container)

#### Original Styling
```css
.e-con-inner {
  display: var(--display);           /* → flex */
  flex-direction: var(--flex-direction); /* → row */
  justify-content: var(--justify-content); /* → space-between */
  align-items: var(--align-items);   /* → center */
  gap: var(--gap);                   /* → 20px */
  width: 100%;
  height: 100%;
  margin: 0px auto;
  max-width: min(100%, var(--container-max-width, 1140px));
}
```

#### Converted Version (e-div-block inner)
```css
.e-[generated-class]-inner {
  display: flex;                     /* ✅ Variable resolved */
  flex-direction: row;               /* ✅ Variable resolved */
  justify-content: space-between;    /* ✅ Variable resolved */
  align-items: center;               /* ✅ Variable resolved */
  gap: 20px;                        /* ✅ Variable resolved */
  width: 100%;                      /* ✅ Preserved */
  height: 100%;                     /* ✅ Preserved */
  margin: 0px auto;                 /* ✅ Preserved */
  max-width: min(100%, 1140px);     /* ✅ Variable resolved */
}
```

| Property | Original | Converted | Status | Notes |
|----------|----------|-----------|---------|-------|
| display | var(--display) → flex | flex | ✅ Match | CSS variable resolved |
| flex-direction | var(--flex-direction) → row | row | ✅ Match | CSS variable resolved |
| justify-content | var(--justify-content) → space-between | space-between | ✅ Match | CSS variable resolved |
| align-items | var(--align-items) → center | center | ✅ Match | CSS variable resolved |
| gap | var(--gap) → 20px | 20px | ✅ Match | CSS variable resolved |
| width | 100% | 100% | ✅ Match | Full width |
| height | 100% | 100% | ✅ Match | Full height |
| margin | 0px auto | 0px auto | ✅ Match | Centered |
| max-width | min(100%, var(--container-max-width, 1140px)) | min(100%, 1140px) | ✅ Match | Variable resolved |

### 3. div.elementor-widget (Widget Container)

#### Original Styling
```css
.elementor-element-a431a3a.elementor-widget {
  display: block;
  padding: 0px;
  margin: 0px;
  width: auto;
  height: auto;
  text-align: left;
  position: relative;
}
```

#### Converted Version (e-div-block wrapper)
```css
.e-[generated-class]-widget {
  display: block;          /* ✅ Preserved */
  padding: 0px;           /* ✅ Preserved */
  margin: 0px;            /* ✅ Preserved */
  width: auto;            /* ✅ Preserved */
  height: auto;           /* ✅ Preserved */
  text-align: center;     /* ❌ Changed from left */
  position: relative;     /* ✅ Preserved */
}
```

| Property | Original | Converted | Status | Notes |
|----------|----------|-----------|---------|-------|
| display | block | block | ✅ Match | Block element |
| padding | 0px | 0px | ✅ Match | No padding |
| margin | 0px | 0px | ✅ Match | No margin |
| width | auto | auto | ✅ Match | Content width |
| height | auto | auto | ✅ Match | Content height |
| text-align | left | center | ❌ Mismatch | Alignment override |
| position | relative | relative | ✅ Match | Positioned context |

### 4. div.elementor-widget img (Image Element)

#### Original Styling
```css
.elementor-widget-image img {
  display: inline-block;
  width: 300px;              /* Original size */
  height: 133px;             /* Original size */
  max-width: 100%;
  object-fit: fill;
  vertical-align: middle;
  border: none;
}

/* Higher specificity rule */
.elementor-1140 .elementor-element.elementor-element-a431a3a img {
  width: 100px;              /* Scaled down */
  height: 44.47px;           /* Proportional */
}
```

#### Converted Version (e-image widget)
```css
.e-[generated-class]-image {
  display: inline-block;     /* ✅ Preserved */
  width: 48px;              /* ❌ Wrong specificity applied */
  height: auto;             /* ❌ Lost proportional scaling */
  max-width: 100%;          /* ✅ Preserved */
  object-fit: fill;         /* ✅ Preserved */
  vertical-align: middle;   /* ✅ Preserved */
  border: none;             /* ✅ Preserved */
}
```

| Property | Original (High Specificity) | Original (Low Specificity) | Converted | Status | Notes |
|----------|----------------------------|---------------------------|-----------|---------|-------|
| display | inline-block | inline-block | inline-block | ✅ Match | Inline block |
| width | 100px | 48px | 48px | ❌ Wrong Rule | Lower specificity won |
| height | 44.47px | auto | auto | ❌ Lost Scaling | Proportional scaling lost |
| max-width | 100% | 100% | 100% | ✅ Match | Responsive constraint |
| object-fit | fill | fill | fill | ✅ Match | Fill container |
| vertical-align | middle | middle | middle | ✅ Match | Vertical alignment |
| border | none | none | none | ✅ Match | No border |

## Conversion Issues Summary

### Critical Issues Found

1. **CSS Variable Duplication** (padding-block-start/end)
   - **Problem**: Properties get both `0px` and `var(--padding-top)`
   - **Impact**: Conflicting values cause layout issues
   - **Solution**: Ensure single source of truth for each property

2. **Align-Self Inconsistencies**
   - **Problem**: `normal`/`auto` values converted to `initial`
   - **Elements Affected**: `.e-parent`, `.e-con-inner`
   - **Impact**: Flex alignment behavior changes

3. **Text Alignment Override**
   - **Problem**: Widget text-align changed from `left` to `center`
   - **Element**: `div.elementor-widget`
   - **Impact**: Layout differs from original design

4. **CSS Specificity Resolution Failure**
   - **Problem**: Lower specificity rules override higher specificity
   - **Example**: `width: 48px` (0,1,3) beats `width: 100px` (0,3,1)
   - **Impact**: Wrong styles applied to images

### Successful Conversions

1. **CSS Variable Resolution** ✅
   - Variables like `var(--display)` properly resolve to `flex`
   - Container layout properties preserved

2. **Flex Layout Properties** ✅
   - `display: flex`, `justify-content: space-between` working
   - Gap and alignment properties converted correctly

3. **Basic Element Properties** ✅
   - Display, padding, margin values preserved
   - Position and dimension properties maintained
