# CSS Cleaning PRD: Fix Broken Property Values

## 🎯 Objective

Fix the CSS cleaning logic to achieve 100% parser success rate **without breaking CSS property values**. Current implementation destroys legitimate CSS values, making styling unusable.

## 📊 Current Status

### Parser Success Rate
- **37/38 files parse successfully (97%)**
- **1 file fails**: `jet-engine/assets/css/frontend.css`

### Visual Output Quality
- **BROKEN ❌**: CSS values are destroyed during cleaning
- **Examples of broken values**:
  - `font-family: 0, Sans-serif` (should be `"freight-text-pro", Sans-serif`)
  - `font-size: 15.rem` (invalid unit)
  - `position: fixed` (wrong value applied)
  - `line-height: 0` (should preserve original value)

## 🧪 Real Test Case

### Source CSS (oboxthemes.com)
```css
.elementor-1140 .elementor-element.elementor-element-6d397c1 {
    font-family: "freight-text-pro", Sans-serif;
    font-size: 26px;
    font-weight: 400;
    line-height: 36px;
    color: var(--e-global-color-e66ebc9);
}
```

### API Request
```json
{
    "type": "url",
    "content": "https://oboxthemes.com/",
    "selector": ".elementor-element-6d397c1"
}
```

**Endpoint**: `http://elementor.local/wp-json/elementor/v2/widget-converter/`

### Expected Output
After conversion, the widget should have these exact styles:
- `font-family: "freight-text-pro", Sans-serif`
- `font-size: 26px`
- `font-weight: 400`
- `line-height: 36px`
- `color: var(--e-global-color-e66ebc9)`

### Current Output
❌ **BROKEN**: CSS cleaning destroys these values:
- `font-family: 0, Sans-serif` (var() replaced with 0)
- Other properties may be missing or incorrect

---

## 🔍 Root Cause Analysis

### Problem 1: Overly Aggressive `var()` Replacement
```php
// CURRENT (BROKEN):
$css = preg_replace('/var\s*\([^()]*\)/', '0', $css);

// RESULT:
font-family: var(--e-global-typography-primary-font-family), Sans-serif
→ font-family: 0, Sans-serif ❌
```

**Impact**: Destroys all CSS variables, including Elementor global variables that should be preserved.

### Problem 2: Indiscriminate `calc()` Replacement
```php
// CURRENT (BROKEN):
$css = preg_replace('/calc\s*\([^()]*\)/', '100%', $css);

// RESULT:
margin: calc(100% - 20px) → margin: 100% ❌
width: calc(50% + 10px) → width: 100% ❌
```

**Impact**: Loses calculation context and units, breaking layout.

### Problem 3: No Context Awareness
The cleaning logic doesn't distinguish between:
- **Critical properties** (font-family, font-size, color) - should never be modified
- **Layout properties** (margin, padding) - can be simplified if needed
- **Complex expressions** that break parser vs. **simple expressions** that work fine

## 🎯 Success Criteria

1. ✅ **Parser Success**: 100% of CSS files parse without errors
2. ✅ **Visual Fidelity**: Converted styling matches original appearance
3. ✅ **Typography Preserved**: Font families, sizes, colors remain intact
4. ✅ **Layout Maintained**: Positioning, spacing similar to original
5. ✅ **Variables Work**: Elementor global variables render correctly

## 📋 Implementation Plan

### Phase 1: Identify Parser-Breaking Patterns (Research)
**Goal**: Understand exactly what CSS patterns cause the parser to fail.

**Tasks**:
1. Analyze the single failing file: `jet-engine/assets/css/frontend.css`
2. Extract the specific line causing the error: `Identifier expected. Got "(2 - "`
3. Document the minimal CSS pattern that breaks the parser
4. Test if simple `calc()`, `var()`, `min()`, `max()` expressions actually break the parser
5. Create test cases for each pattern

**Deliverable**: `CSS-PARSER-BREAKING-PATTERNS.md` with exact patterns that fail

**Estimated Time**: 2 hours

---

### Phase 2: Categorize CSS Properties (Classification)
**Goal**: Classify properties by how they should be handled during cleaning.

**Categories**:
```php
const NEVER_MODIFY_PROPERTIES = [
    'font-family',
    'font-size',
    'font-weight',
    'font-style',
    'color',
    'background-color',
    'border-color',
];

const PRESERVE_VARIABLES_PROPERTIES = [
    'font-family',
    'font-size',
    'color',
    'background',
    'background-color',
    'border-color',
];

const SIMPLIFY_IF_COMPLEX_PROPERTIES = [
    'margin',
    'padding',
    'width',
    'height',
    'top',
    'left',
    'right',
    'bottom',
];
```

**Tasks**:
1. Create property classification constants
2. Document rationale for each category
3. Add examples of what should/shouldn't be modified

**Deliverable**: Property classification constants in code

**Estimated Time**: 1 hour

---

### Phase 3: Smart Variable Preservation (Implementation)
**Goal**: Preserve Elementor global variables and variables in critical properties.

**Strategy**:
```php
private function should_preserve_css_variable( string $var_name, string $property_name ): bool {
    // Always preserve Elementor global variables
    if ( false !== strpos( $var_name, '--e-global-' ) ) {
        return true;
    }
    
    if ( false !== strpos( $var_name, '--elementor-' ) ) {
        return true;
    }
    
    // Preserve variables in critical properties
    if ( in_array( $property_name, self::PRESERVE_VARIABLES_PROPERTIES, true ) ) {
        return true;
    }
    
    return false;
}
```

**Tasks**:
1. Implement `should_preserve_css_variable()` method
2. Modify `replace_calc_expressions()` to check before replacing `var()`
3. Add property-aware variable replacement
4. Test with Elementor global variables

**Test Cases**:
- `color: var(--e-global-color-primary)` → PRESERVE
- `font-family: var(--e-global-typography-primary-font-family), Sans-serif` → PRESERVE
- `margin: var(--some-custom-var)` → Can replace if needed

**Deliverable**: Working variable preservation logic

**Estimated Time**: 3 hours

---

### Phase 4: Context-Aware calc() Handling (Implementation)
**Goal**: Only replace `calc()` expressions that actually break the parser.

**Strategy**:
```php
private function should_simplify_calc( string $calc_content, string $property_name ): bool {
    // Never simplify calc in critical properties
    if ( in_array( $property_name, self::NEVER_MODIFY_PROPERTIES, true ) ) {
        return false;
    }
    
    // Only simplify deeply nested expressions (3+ levels of parentheses)
    $nesting_level = substr_count( $calc_content, '(' );
    if ( $nesting_level >= 3 ) {
        return true;
    }
    
    // Check if it contains problematic arithmetic patterns
    if ( preg_match( '/\(\s*\d+\s*[-+]\s*\d+\s*\)/', $calc_content ) ) {
        return true; // Pattern like "(2 - 1)" that breaks parser
    }
    
    return false;
}
```

**Tasks**:
1. Implement `should_simplify_calc()` method
2. Parse CSS property-by-property to maintain context
3. Only replace calc() when necessary
4. Test with simple and complex calc() expressions

**Test Cases**:
- `font-size: calc(16px + 2px)` → PRESERVE (simple, in critical property)
- `margin: calc(100% - 20px)` → PRESERVE (simple)
- `width: calc(100% - calc(50px + calc(10px * 2)))` → SIMPLIFY (deeply nested)
- `padding: min(100%, calc(2 - 1))` → SIMPLIFY (contains problematic arithmetic)

**Deliverable**: Context-aware calc() replacement

**Estimated Time**: 4 hours

---

### Phase 5: Property-Aware CSS Cleaning (Implementation)
**Goal**: Rewrite cleaning logic to be property-aware, not line-aware.

**Current Approach** (Line-by-line):
```php
foreach ( $lines as $line ) {
    $line = preg_replace('/var\s*\([^()]*\)/', '0', $line); // ❌ No context
}
```

**New Approach** (Property-aware):
```php
private function clean_css_property_aware( string $css ): string {
    // Parse CSS into structured format
    $properties = $this->extract_properties_from_css( $css );
    
    foreach ( $properties as $property ) {
        $property_name = $property['name'];
        $property_value = $property['value'];
        
        // Apply context-aware cleaning
        if ( in_array( $property_name, self::NEVER_MODIFY_PROPERTIES, true ) ) {
            continue; // Skip critical properties
        }
        
        // Clean based on property type
        $cleaned_value = $this->clean_property_value( $property_name, $property_value );
        $property['value'] = $cleaned_value;
    }
    
    return $this->reconstruct_css_from_properties( $properties );
}
```

**Tasks**:
1. Implement property extraction from CSS string
2. Create property-aware cleaning logic
3. Reconstruct CSS from cleaned properties
4. Maintain original formatting where possible

**Deliverable**: Property-aware CSS cleaning system

**Estimated Time**: 6 hours

---

### Phase 6: Minimal Cleaning Strategy (Implementation)
**Goal**: Only clean what's absolutely necessary to make the parser work.

**Philosophy**: 
- **Don't fix what isn't broken**
- **Preserve > Simplify**
- **Test before cleaning**

**Strategy**:
```php
private function clean_css_minimally( string $css ): string {
    // Step 1: Try parsing without any cleaning
    try {
        $this->css_parser->parse( $css );
        return $css; // It works! Don't touch it.
    } catch ( \Exception $e ) {
        // Parser failed, need to clean
    }
    
    // Step 2: Apply only essential cleaning
    $css = $this->remove_comments( $css );
    $css = $this->fix_newlines_in_values( $css );
    
    // Step 3: Try parsing again
    try {
        $this->css_parser->parse( $css );
        return $css; // Fixed with minimal cleaning
    } catch ( \Exception $e ) {
        // Still failing, need more aggressive cleaning
    }
    
    // Step 4: Apply targeted cleaning based on error message
    $css = $this->clean_based_on_error( $css, $e->getMessage() );
    
    return $css;
}
```

**Tasks**:
1. Implement progressive cleaning strategy
2. Add error-based targeted cleaning
3. Test each cleaning step independently
4. Measure impact on visual output

**Deliverable**: Minimal cleaning implementation

**Estimated Time**: 4 hours

---

### Phase 7: Visual Validation (Testing)
**Goal**: Ensure cleaned CSS produces visually identical output to original.

**Test Strategy**:
1. **Screenshot Comparison**: Compare original vs. converted pages
2. **Computed Styles**: Check computed CSS values in browser
3. **Typography Check**: Verify fonts, sizes, colors match
4. **Layout Check**: Verify positioning, spacing match

**Test Cases**:
```typescript
test('Typography preserved after cleaning', async () => {
    const original = await page.evaluate(() => {
        const h2 = document.querySelector('h2');
        return {
            fontFamily: getComputedStyle(h2).fontFamily,
            fontSize: getComputedStyle(h2).fontSize,
            color: getComputedStyle(h2).color,
        };
    });
    
    // Convert and check
    const converted = await convertAndGetStyles();
    
    expect(converted.fontFamily).toBe(original.fontFamily);
    expect(converted.fontSize).toBe(original.fontSize);
    expect(converted.color).toBe(original.color);
});
```

**Tasks**:
1. Create visual comparison test suite
2. Test with oboxthemes.com conversion
3. Document any visual differences
4. Fix issues found during testing

**Deliverable**: Passing visual validation tests

**Estimated Time**: 5 hours

---

### Phase 8: Performance Optimization (Optional)
**Goal**: Ensure cleaning doesn't significantly slow down conversion.

**Metrics**:
- Cleaning time per CSS file
- Total conversion time impact
- Memory usage

**Tasks**:
1. Benchmark current cleaning performance
2. Optimize regex patterns
3. Cache cleaning results if possible
4. Profile and optimize bottlenecks

**Deliverable**: Performance report and optimizations

**Estimated Time**: 3 hours

---

## 📊 Implementation Timeline

| Phase | Task | Time | Status |
|-------|------|------|--------|
| 1 | Identify Parser-Breaking Patterns | 2h | ⏳ Pending |
| 2 | Categorize CSS Properties | 1h | ⏳ Pending |
| 3 | Smart Variable Preservation | 3h | ⏳ Pending |
| 4 | Context-Aware calc() Handling | 4h | ⏳ Pending |
| 5 | Property-Aware CSS Cleaning | 6h | ⏳ Pending |
| 6 | Minimal Cleaning Strategy | 4h | ⏳ Pending |
| 7 | Visual Validation | 5h | ⏳ Pending |
| 8 | Performance Optimization | 3h | ⏳ Optional |

**Total Estimated Time**: 25-28 hours

---

## 🚀 Quick Wins (Priority Order)

### 1. **Stop Breaking Font Properties** (Highest Priority)
- Add `NEVER_MODIFY_PROPERTIES` constant
- Skip cleaning for these properties
- **Impact**: Fixes typography immediately
- **Time**: 30 minutes

### 2. **Preserve Elementor Variables**
- Check for `--e-global-` and `--elementor-` prefixes
- Don't replace these variables
- **Impact**: Fixes colors and global styling
- **Time**: 1 hour

### 3. **Fix Newlines in Property Values**
- Already implemented but needs refinement
- **Impact**: Fixes parser errors without breaking values
- **Time**: 30 minutes

### 4. **Remove IE Hacks**
- Already implemented (`*zoom:1`)
- **Impact**: Reduces parser errors
- **Time**: Done ✅

---

## 🎯 Definition of Done

- [ ] 100% CSS files parse successfully (38/38)
- [ ] Typography matches original (fonts, sizes, colors)
- [ ] Layout matches original (positioning, spacing)
- [ ] Elementor global variables work correctly
- [ ] No "drunk" styling or broken values
- [ ] Visual validation tests pass
- [ ] Documentation updated
- [ ] Code reviewed and approved

---

## 📝 Notes

### Current Cleaning Methods to Review
1. `clean_css_for_parser()` - Main cleaning entry point
2. `replace_calc_expressions()` - Replaces CSS functions
3. `fix_broken_property_values()` - Fixes newlines
4. `add_newlines_to_minified_css()` - Adds structure

### Files to Modify
- `plugins/elementor-css/modules/css-converter/services/widgets/unified-widget-conversion-service.php`

### Testing Files
- `plugins/elementor-css/tests/playwright/sanity/modules/css-converter/per-file-parsing.test.ts`

---

## ❓ Open Questions

### Question 1: Unnecessary DIV Wrapper Elements

**Observation**: The original DOM structure has:
```html
<div>
  <p>Content 1</p>
  <p>Content 2</p>
</div>
```

But the converted atomic widgets have additional DIV elements:
```html
<div>
  <div>
    <p>Content 1</p>
  </div>
  <div>
    <p>Content 2</p>
  </div>
</div>
```

**Questions**:
1. Why are extra DIV wrappers being added during conversion?
2. Is this intentional for Elementor's widget structure?
3. Could this be simplified to match the original DOM structure?
4. Does this affect styling or layout?

**Investigation Needed**:
- Study the widget creation logic in `unified-widget-conversion-service.php`
- Check if DIV wrappers are required for Elementor's atomic widget system
- Determine if this is a bug or intentional design
- Test if removing extra DIVs breaks functionality

**Priority**: Medium (affects DOM structure but may not affect visual output)

---

## 🔗 Related Documents
- `CSS-REPLACEMENT-ISSUES-ANALYSIS.md` - Problem analysis
- `CSS-PARSER-SOLUTION-COMPLETE.md` - Current parser solution
- `PER-FILE-PARSING-IMPLEMENTATION-COMPLETE.md` - Per-file parsing approach

