# Container Variable Resolution Feature

**Date:** 2025-11-05  
**Status:** ✅ IMPLEMENTED  
**Priority:** 9.7 (runs after CSS Variable Resolver)

## Problem Statement

When converting CSS from external sites or Elementor pages, CSS properties often use Elementor container variables like:

```css
.elementor .e-f027cd0-35370d0 {
    padding-block-end: var(--padding-bottom);
    padding-block-start: var(--padding-top);
    gap: var(--widgets-spacing-row, 20px) var(--widgets-spacing-column, 20px);
    max-width: min(100%, var(--container-max-width, 1140px));
}
```

**Issue**: These variables remain unresolved in the converted atomic widget CSS, preventing proper styling.

## Solution

Created a new processor `Container_Variable_Resolver` that:

1. **Resolves CSS variable references** to their actual values
2. **Handles fallback values** like `var(--widgets-spacing-row, 20px)`
3. **Provides default values** for common Elementor container variables
4. **Recursively resolves** nested variable references

## How It Works

### Processing Order

```
Priority 9    → CSS Variable Registry      (extracts variable definitions)
Priority 9.5  → CSS Variable Resolver      (resolves general CSS variables)
Priority 9.7  → Container Variable Resolver ← NEW! (resolves container-specific variables)
Priority 11   → Widget Class Processor     (processes widget styles)
```

### Resolution Strategy

The processor resolves variables using a **3-tier fallback strategy**:

#### Tier 1: Variable Definitions (Highest Priority)
```css
/* If this exists in the source CSS: */
.elementor-element-089b111 {
    --padding-bottom: 30px;
}

/* Then var(--padding-bottom) resolves to: 30px */
```

#### Tier 2: Fallback Values
```css
/* If variable not defined, use fallback: */
gap: var(--widgets-spacing-row, 20px);  /* → 20px */
```

#### Tier 3: Default Values (Elementor Standards)
```php
// If no definition and no fallback, use Elementor defaults:
'--padding-bottom' => '10px'      // Container default padding
'--widgets-spacing' => '20px'     // Widget spacing default
'--container-max-width' => '1140px'  // Container max width
```

### Supported Container Variables

The processor includes defaults for **26 common Elementor container variables**:

**Padding:**
- `--padding-top`, `--padding-right`, `--padding-bottom`, `--padding-left` → `10px`

**Margin:**
- `--margin-top`, `--margin-right`, `--margin-bottom`, `--margin-left` → `0px`

**Spacing:**
- `--widgets-spacing`, `--widgets-spacing-row`, `--widgets-spacing-column` → `20px`
- `--gap`, `--row-gap`, `--column-gap` → `20px`

**Layout:**
- `--container-max-width` → `1140px`
- `--width` → `100%`
- `--height` → `auto`
- `--min-height` → `initial`

**Border:**
- `--border-radius` → `0`
- `--border-top-width`, `--border-right-width`, `--border-bottom-width`, `--border-left-width` → `0px`

**Positioning:**
- `--position` → `relative`
- `--z-index` → `revert`
- `--overflow` → `visible`
- `--text-align` → `initial`

## Code Example

### Before Resolution
```css
.elementor .e-f027cd0-35370d0 {
    padding-block-end: var(--padding-bottom);
    gap: var(--widgets-spacing-row, 20px) var(--widgets-spacing-column, 20px);
    max-width: min(100%, var(--container-max-width, 1140px));
}
```

### After Resolution

**Case 1: Variable Defined in Source CSS**
```css
/* If source has: --padding-bottom: 30px; */
.elementor .e-f027cd0-35370d0 {
    padding-block-end: 30px;  /* ✅ Resolved from definition */
    gap: 25px 15px;           /* ✅ Resolved from definition */
    max-width: min(100%, 1200px);  /* ✅ Resolved from definition */
}
```

**Case 2: Using Fallback Values**
```css
/* If no definition found: */
.elementor .e-f027cd0-35370d0 {
    padding-block-end: 10px;  /* ✅ Elementor default */
    gap: 20px 20px;           /* ✅ Fallback values */
    max-width: min(100%, 1140px);  /* ✅ Fallback value */
}
```

## Implementation Details

### File Created
- `modules/css-converter/services/css/processing/processors/container-variable-resolver.php`

### File Modified
- `modules/css-converter/services/css/processing/css-processor-factory.php`  
  Added processor registration at priority 9.7

### Key Methods

#### `resolve_container_variables($value, $variable_definitions)`
- Parses `var()` references using regex
- Extracts variable name and fallback value
- Resolves recursively for nested variables
- Returns resolved value or original if unresolvable

**Example:**
```php
// Input: "var(--padding-bottom)"
// Output: "30px" (if defined) or "10px" (default)

// Input: "var(--widgets-spacing-row, 20px)"
// Output: "25px" (if defined) or "20px" (fallback)

// Input: "var(--padding-top, var(--container-default-padding-top, 10px))"
// Output: Recursively resolves nested variables
```

## Benefits

### 1. **Cleaner CSS Output**
- ✅ No CSS variables in atomic widget styles
- ✅ All values resolved to actual measurements
- ✅ Better browser compatibility

### 2. **Consistent Styling**
- ✅ Uses Elementor's standard container defaults
- ✅ Respects element-specific variable overrides
- ✅ Honors CSS cascade and specificity

### 3. **Better Debugging**
- ✅ Logs all variable resolutions
- ✅ Clear fallback chain
- ✅ Easy to trace value origins

## Logging

The processor logs all resolution activities to `/wp-content/css-property-tracking.log`:

```
--------------------------------------------------------------------------------
[14:23:45] CONTAINER_VARIABLE_RESOLVER: Started
[14:23:45]   Resolved: var(--padding-bottom) → 30px
[14:23:45]   Resolved: var(--widgets-spacing-row, 20px) → 25px
[14:23:45]   Resolved: var(--container-max-width, 1140px) → 1200px
[14:23:45] CONTAINER_VARIABLE_RESOLVER: Resolved 3 container variables
```

## Testing

### Test Case 1: Variable Definitions Present
**Input CSS:**
```css
.elementor-element-089b111 {
    --padding-top: 50px;
    --padding-bottom: 30px;
}

.e-class {
    padding-block-start: var(--padding-top);
    padding-block-end: var(--padding-bottom);
}
```

**Expected Output:**
```css
.e-class {
    padding-block-start: 50px;
    padding-block-end: 30px;
}
```

### Test Case 2: Using Fallback Values
**Input CSS:**
```css
.e-class {
    gap: var(--widgets-spacing-row, 25px) var(--widgets-spacing-column, 15px);
}
```

**Expected Output:**
```css
.e-class {
    gap: 25px 15px;
}
```

### Test Case 3: Using Elementor Defaults
**Input CSS:**
```css
.e-class {
    padding-block-end: var(--padding-bottom);
    max-width: var(--container-max-width);
}
```

**Expected Output:**
```css
.e-class {
    padding-block-end: 10px;    /* Elementor default */
    max-width: 1140px;           /* Elementor default */
}
```

### Test Case 4: Nested Variables
**Input CSS:**
```css
.e-con {
    --padding-top: var(--container-default-padding-top, 10px);
}

.e-class {
    padding-block-start: var(--padding-top);
}
```

**Expected Output:**
```css
.e-class {
    padding-block-start: 10px;  /* Resolved recursively */
}
```

## Future Enhancements

### Potential Additions
1. **Dynamic defaults** from Elementor Kit settings
2. **Responsive variable values** for different breakpoints  
3. **Variable scope tracking** for better parent/child resolution
4. **Variable usage statistics** for optimization

### Configuration Options
```php
// Could add configuration for custom defaults:
Container_Variable_Resolver::set_custom_defaults([
    '--custom-spacing' => '15px',
    '--custom-width' => '1200px',
]);
```

## Related Documentation

- **Transform Validation Fix**: `TRANSFORM-VALIDATION-FIX.md` - Related floating point precision fix
- **CSS Variables Test**: `docs/page-testing/0-0---variables.md` - Original variables test case
- **CSS Processing Design**: `docs/page-testing/done/PRD-CSS-PROCESSING-DESIGN-PATTERN.md` - Overall architecture

---

**Last Updated:** 2025-11-05  
**Author:** CSS Converter Team  
**Status:** ✅ PRODUCTION READY


