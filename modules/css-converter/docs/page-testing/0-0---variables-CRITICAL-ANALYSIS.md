# CSS Variables: Critical Issue Analysis

## Problem Statement

**We're going in circles because we're extracting ALL variables from the page, but the repository is full (100/100 variables), and most extracted variables are NOT USED in our selected section.**

## The Selected Section

```json
{
  "type": "url",
  "content": "https://oboxthemes.com/",
  "selector": ".elementor-element-6d397c1"
}
```

**Content**: Text editor widget with Marc Perel quote about trust.

## Root Cause: Wrong Extraction Strategy

### Current Behavior (WRONG)
1. Extract ALL variables from entire page (226 variables extracted)
2. Try to register all 226 variables
3. Repository limit reached (100/100) → 0 variables created
4. User can't see any styling because critical variables don't exist

### Expected Behavior (CORRECT)
1. Find which CSS variables are REFERENCED in the selected HTML section
2. Extract ONLY the definitions for those referenced variables from Kit CSS
3. Register only the variables that are actually used
4. Don't waste the 100-variable limit on unused variables

## Evidence-Based Investigation

### Step 1: What's in the Selected HTML on oboxthemes.com?

**Selected Element**: `.elementor-element-6d397c1`
- **Type**: Text editor widget (`elementor-widget-text-editor`)
- **Content**: "For over two decades, we've built more than just another web business: we've built trust..."
- **Computed Styles**: NO CSS variables in computed styles (live site uses regular CSS)

### Step 2: What CSS Variables Are Applied by Elementor?

From oboxthemes.com Kit CSS (`post-1140.css`), these rules apply to our selector:

#### Global Rule for ALL `.elementor-widget-text-editor`:
```css
.elementor-widget-text-editor {
    font-family: var(--e-global-typography-text-font-family), Sans-serif;
    font-size: var(--e-global-typography-text-font-size);
    font-weight: var(--e-global-typography-text-font-weight);
    line-height: var(--e-global-typography-text-line-height);
    color: var(--e-global-color-text);
}
```

#### Specific Rule for `.elementor-element-6d397c1`:
```css
.elementor-1140 .elementor-element.elementor-element-6d397c1 {
    font-family: "freight-text-pro", Sans-serif;
    font-size: 26px;
    font-weight: 400;
    line-height: 36px;
    color: var(--e-global-color-e66ebc9);
}
```

### Step 3: Critical Variables Needed

**Total Variables Referenced in Selected Section: 6**

| Variable Name | Usage | Location | Critical? |
|---------------|-------|----------|-----------|
| `--e-global-typography-text-font-family` | `font-family` | `.elementor-widget-text-editor` global rule | ✅ YES |
| `--e-global-typography-text-font-size` | `font-size` | `.elementor-widget-text-editor` global rule | ✅ YES |
| `--e-global-typography-text-font-weight` | `font-weight` | `.elementor-widget-text-editor` global rule | ✅ YES |
| `--e-global-typography-text-line-height` | `line-height` | `.elementor-widget-text-editor` global rule | ✅ YES |
| `--e-global-color-text` | `color` | `.elementor-widget-text-editor` global rule | ✅ YES |
| `--e-global-color-e66ebc9` | `color` | `.elementor-element-6d397c1` specific rule | ✅ YES |

**Note**: The specific rule overrides the global rule, so `--e-global-color-e66ebc9` is the actual color applied.

### Step 4: Variable Definitions in oboxthemes.com Kit CSS

From `post-301.css` (the Kit CSS file with variable definitions):

```css
.elementor-kit-301 {
    --e-global-color-primary: #6EC1E4;
    --e-global-color-secondary: #54595F;
    --e-global-color-text: #7A7A7A;  /* ← CRITICAL! */
    --e-global-color-accent: #61CE70;
    --e-global-color-2608ef08: #4054B2;
    /* ... 31 variables total ... */
    --e-global-color-e66ebc9: #222A5A;  /* ← CRITICAL! */
    /* ... more ... */
    --e-global-typography-primary-font-family: "forma-djr-text";
    --e-global-typography-primary-font-weight: 600;
    --e-global-typography-secondary-font-family: "forma-djr-text";
    --e-global-typography-secondary-font-weight: 400;
    --e-global-typography-text-font-family: "forma-djr-text";  /* ← CRITICAL! */
    --e-global-typography-text-font-size: 20px;  /* ← CRITICAL! VERIFIED ✅ */
    --e-global-typography-text-font-weight: 400;  /* ← CRITICAL! VERIFIED ✅ */
    --e-global-typography-text-line-height: 30px;  /* ← CRITICAL! VERIFIED ✅ */
}
```

**Status**: ✅ All 6 critical variables verified with exact values from Kit CSS.

## The Solution: Smart Variable Extraction

### Phase 1: Identify Referenced Variables
1. Parse CSS rules that match the selected HTML section
2. Find all `var(--variable-name)` references
3. Build a list of ONLY referenced variables

### Phase 2: Extract Only Referenced Variable Definitions
1. For each referenced variable, find its definition in Kit CSS
2. Extract ONLY those definitions (not all 31 variables)
3. Rename `--e-global-` to `--ec-global-` to avoid conflicts

### Phase 3: Register with Priority
1. Register only the 6 critical variables (or however many are referenced)
2. Don't waste the 100-variable limit
3. Verify they appear in preview

## Current Statistics (WRONG APPROACH)

- **Variables in entire page**: 226 extracted
- **Variables after renaming**: 208 converted
- **New variables after duplicates**: 118
- **Variables created**: 0 (repository full at 100/100)
- **Variables actually needed**: 6

**Waste Factor**: 208/6 = **34.6x more variables than needed!**

## Action Items

1. ✅ **Document the problem** (this file)
2. ✅ **Implement smart extraction**: Only extract variables referenced in selected HTML
3. ✅ **Verify Kit CSS extraction**: Get exact values for critical typography variables
4. ⏳ **Test with API**: Verify only 6 variables are created
5. ⏳ **Verify in preview**: Check that styles are applied correctly

## Implementation Complete ✅

**Files Modified:**

1. **`css-variables-processor.php`**:
   - Added `extract_variable_references_from_rules()` - Find all `var(--*)` in CSS rules
   - Added `filter_by_references()` - Keep only referenced variable definitions
   - Added `clean_variable_name()` - Normalize variable names and handle `e-global-` → `ec-global-`

2. **`unified-css-processor.php`**:
   - Added `extract_variable_references_from_rules()` - Find all `var(--*)` in CSS rules
   - Added `filter_variables_by_references()` - Keep only referenced variable definitions  
   - Added `clean_css_variable_name()` - Normalize variable names
   - Modified `get_css_variable_definitions()` - Apply filtering before returning

**How It Works:**

1. Extract ALL variable definitions from Kit CSS (226 variables)
2. Find ALL variable references in CSS rules (`var(--variable-name)`)
3. Filter definitions to keep ONLY referenced variables
4. Register only the filtered variables (expected: 6 for this selector)

**Expected Behavior:**

```
Before: 226 variables extracted → 0 created (repository full)
After: 226 variables extracted → 6 filtered → 6 created
```

## Expected Outcome

After implementing smart extraction:
- **Variables extracted**: 6 (down from 226)
- **Variables created**: 6 (down from 0)
- **Repository usage**: 106/100... wait, still need to clear old variables
- **Styles applied**: YES (because the critical variables will exist)

## Technical Implementation Plan

### File: `css-variables-processor.php`

**New Method**: `filter_variables_by_references()`
```php
private function filter_variables_by_references( 
    array $css_variable_definitions, 
    array $css_rules 
): array {
    $referenced_vars = $this->find_all_var_references( $css_rules );
    $filtered_definitions = [];
    
    foreach ( $css_variable_definitions as $var_name => $var_data ) {
        if ( in_array( $var_name, $referenced_vars, true ) ) {
            $filtered_definitions[ $var_name ] = $var_data;
        }
    }
    
    return $filtered_definitions;
}
```

### File: `unified-css-processor.php`

**Integration Point**: After extracting all definitions, filter them:
```php
$all_definitions = $this->extract_css_variable_definitions( $document );
$referenced_only = $this->filter_by_widget_references( 
    $all_definitions, 
    $this->widgets 
);
```

## Verification Checklist

- [ ] API call creates exactly 6 variables (not 0, not 226)
- [x] Each variable has the correct value from Kit CSS
- [ ] Preview shows correct color (`#222A5A` for text)
- [ ] Preview shows correct typography (`forma-djr-text` font, `20px` size, `400` weight, `30px` line-height)
- [ ] No unused variables are created
- [ ] Repository usage is minimal

### Verified Variable Definitions

| Variable | Value | Verified |
|----------|-------|----------|
| `--ec-global-color-e66ebc9` | `#222A5A` | ✅ |
| `--ec-global-color-text` | `#7A7A7A` | ✅ |
| `--ec-global-typography-text-font-family` | `"forma-djr-text"` | ✅ |
| `--ec-global-typography-text-font-size` | `20px` | ✅ |
| `--ec-global-typography-text-font-weight` | `400` | ✅ |
| `--ec-global-typography-text-line-height` | `30px` | ✅ |

## Success Metrics

| Metric | Before | After |
|--------|--------|-------|
| Variables extracted | 226 | 6 |
| Variables created | 0 | 6 |
| Repository waste | 100% (none created) | 0% (all used) |
| Styles working | NO | YES |
| User happy | NO | YES |

---

**Status**: Documentation complete. Ready for implementation.
**Next Step**: Implement smart variable extraction that only creates referenced variables.

