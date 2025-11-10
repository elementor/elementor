# Color Variable Resolution Debug PRD

## Problem Statement

CSS variable `var(--e-global-color-e66ebc9)` is resolving to `rgb(51, 51, 51)` (#333333) instead of the expected `rgb(34, 42, 90)` (#222A5A).

**Current Status:**
- fontSize: 36px ✓
- lineHeight: 46px ✓
- color: rgb(51, 51, 51) ✗ (expected: rgb(34, 42, 90))

## Expected Flow

```
Source CSS (oboxthemes.com):
.elementor-1140 .elementor-element.elementor-element-14c0aa4 .elementor-heading-title {
    color: var(--e-global-color-e66ebc9);
}

.elementor-kit-301 {
    --e-global-color-e66ebc9: #222A5A;
}

↓ Variable Extraction (CSS Variable Registry Processor)
Store: e-global-color-e66ebc9 = #222A5A

↓ Variable Resolution (CSS Variable Resolver)
Resolve: var(--e-global-color-e66ebc9) → #222A5A

↓ Property Conversion
Convert: #222A5A → rgb(34, 42, 90)

↓ Final Result
color: rgb(34, 42, 90) ✓
```

## Actual Flow (Debug Needed)

```
Source CSS:
color: var(--e-global-color-e66ebc9);

↓ ???
color: rgb(51, 51, 51) ✗
```

## Investigation Steps

### Step 1: Verify Variable Extraction
**Question**: Is `--e-global-color-e66ebc9: #222A5A` being extracted from Kit CSS?

**Check**:
- `css-variable-registry-processor.php` - extraction patterns
- Verify generic pattern `--[a-zA-Z0-9-]+` matches `--e-global-color-e66ebc9`
- Check if value `#222A5A` is captured correctly

**Expected**: `css_variable_definitions['e-global-color-e66ebc9'] = { value: '#222A5A', ... }`

### Step 2: Verify Variable Resolution
**Question**: Is `var(--e-global-color-e66ebc9)` being resolved to `#222A5A`?

**Check**:
- `css-variable-resolver.php` - `resolve_variable_reference()`
- Verify `clean_variable_name('--e-global-color-e66ebc9')` returns `'e-global-color-e66ebc9'`
- Check if variable is found in definitions

**Expected**: Resolution logs show: `RESOLVED (definitions): var(--e-global-color-e66ebc9) → #222A5A`

### Step 3: Verify Property Conversion
**Question**: Is `#222A5A` being converted to `rgb(34, 42, 90)`?

**Check**:
- Color property mappers
- CSS value normalizers
- Hex-to-RGB conversion

**Expected**: `#222A5A` → `rgb(34, 42, 90)`

### Step 4: Check for Overrides
**Question**: Is another CSS rule overriding the color?

**Check**:
- Specificity ordering
- Kit CSS selectors (`.elementor-kit-301 h2`)
- Widget class processor rule filtering

**Expected**: Only the most specific rule applies

## Debugging Actions

1. **Enable detailed logging**:
   - Variable extraction: Log all extracted variables from Kit CSS
   - Variable resolution: Log lookup attempts for `e-global-color-e66ebc9`
   - Property conversion: Log color value transformations

2. **Check variable definitions**:
   ```php
   // In CSS Variable Registry Processor
   file_put_contents($log, "Extracted variables: " . print_r($css_variable_definitions, true));
   ```

3. **Check resolution attempts**:
   ```php
   // In CSS Variable Resolver
   file_put_contents($log, "Looking for: e-global-color-e66ebc9");
   file_put_contents($log, "Available keys: " . implode(', ', array_keys($variable_definitions)));
   ```

4. **Check applied styles**:
   ```php
   // In Widget Class Processor
   file_put_contents($log, "Applied color: " . $color_value);
   ```

## Possible Root Causes

### Hypothesis 1: Variable Not Extracted
- Generic pattern doesn't match `--e-global-color-e66ebc9`
- Kit CSS selector is filtered out before extraction
- Value is extracted but stored incorrectly

### Hypothesis 2: Variable Not Found During Resolution
- Key mismatch: looking for `e-global-color-e66ebc9` but stored differently
- Variable definitions not passed to resolver
- Resolver runs before extraction

### Hypothesis 3: Value Overridden
- Kit CSS rule applies after specific rule
- Specificity calculation incorrect
- Wrong selector wins

### Hypothesis 4: Default Value Used
- Variable resolution fails silently
- Fallback to default color (#333333)
- `get_global_variable_default()` returns #333333

## Success Criteria

- Variable `--e-global-color-e66ebc9: #222A5A` extracted from Kit CSS
- Variable reference `var(--e-global-color-e66ebc9)` resolved to `#222A5A`
- Color `#222A5A` converted to `rgb(34, 42, 90)`
- Final widget has `color: rgb(34, 42, 90)`
- Test passes: `expect(styles.color).toBe('rgb(34, 42, 90)')`

## Files to Investigate

1. `css-variable-registry-processor.php` - Variable extraction
2. `css-variable-resolver.php` - Variable resolution
3. `css-variables-processor.php` - Kit CSS extraction
4. `widget-class-processor.php` - Rule filtering
5. Color property mappers - Value conversion


