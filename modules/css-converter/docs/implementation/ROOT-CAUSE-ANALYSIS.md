# Root Cause Analysis: CSS Value Destruction

## 🎯 The Real Problem

All the failing test cases are **symptoms of one root cause**:

**The CSS cleaning logic replaces CSS functions (`var()`, `calc()`, `min()`, `max()`) globally without understanding what property they're in or whether they're actually breaking the parser.**

## 🔍 Single Root Cause

### The Problematic Code
**Location**: `plugins/elementor-css/modules/css-converter/services/widgets/unified-widget-conversion-service.php`

**Method**: `replace_calc_expressions()`

```php
private function replace_calc_expressions( string $css ): string {
    // Lines 1229-1234: Replace ALL var() with 0
    for ( $i = 0; $i < 5; ++$i ) {
        $css = preg_replace( '/var\s*\([^()]*\)/', '0', $css );  // ❌ ROOT CAUSE
        $css = preg_replace( '/env\s*\([^()]*\)/', '0', $css );
        $css = preg_replace( '/min\s*\([^()]*\)/', '0', $css );
        $css = preg_replace( '/max\s*\([^()]*\)/', '100%', $css );
        $css = preg_replace( '/clamp\s*\([^()]*\)/', '50%', $css );
    }
    
    // Lines 1237-1239: Replace ALL calc() with 100%
    for ( $i = 0; $i < 5; ++$i ) {
        $css = preg_replace( '/calc\s*\([^()]*\)/', '100%', $css );  // ❌ ROOT CAUSE
    }
}
```

### Why This Is Wrong

1. **No Context Awareness**: Replaces functions in ALL properties, including critical ones like `font-family`, `color`
2. **Blanket Replacement**: Doesn't check if the function is actually breaking the parser
3. **Wrong Assumptions**: Assumes all CSS functions need to be removed for parser to work
4. **Destroys Semantic Meaning**: `var(--e-global-color-primary)` has meaning, `0` does not

## 📊 How One Bug Creates Multiple Symptoms

### Symptom 1: "freight-text-pro" becomes "0, Sans-serif"
```css
/* ORIGINAL */
font-family: var(--e-global-typography-primary-font-family), Sans-serif;

/* AFTER replace_calc_expressions() */
font-family: 0, Sans-serif;  /* ❌ var() replaced with 0 */
```

**Root Cause**: Line 1230 replaces `var()` without checking property name

---

### Symptom 2: Color variables become "0"
```css
/* ORIGINAL */
color: var(--e-global-color-e66ebc9);

/* AFTER replace_calc_expressions() */
color: 0;  /* ❌ Invalid color value */
```

**Root Cause**: Same line 1230, same blind replacement

---

### Symptom 3: Layout calc() expressions oversimplified
```css
/* ORIGINAL */
margin: calc(100% - 20px);

/* AFTER replace_calc_expressions() */
margin: 100%;  /* ❌ Lost the "- 20px" part */
```

**Root Cause**: Line 1238 replaces `calc()` without checking if it's actually problematic

---

## 🎯 The Real Question

**Why are we replacing these functions at all?**

Let's investigate:

### Question 1: Does `var()` actually break the parser?
```php
// TEST CASE 1: Simple var()
$css = "color: var(--primary-color);";
$result = $parser->parse($css);  // Does this fail?
```

**Hypothesis**: `var()` does NOT break the parser. We're removing it unnecessarily.

---

### Question 2: Does `calc()` actually break the parser?
```php
// TEST CASE 2: Simple calc()
$css = "margin: calc(100% - 20px);";
$result = $parser->parse($css);  // Does this fail?

// TEST CASE 3: Complex nested calc()
$css = "width: calc(100% - calc(50px + calc(10px * 2)));";
$result = $parser->parse($css);  // Does THIS fail?
```

**Hypothesis**: Simple `calc()` works fine. Only deeply nested or malformed `calc()` breaks the parser.

---

### Question 3: What ACTUALLY breaks the parser?
Looking at the error from `jet-engine/frontend.css`:
```
Identifier expected. Got "(2 - "
```

This suggests the parser fails on **malformed arithmetic expressions**, not on `var()` or `calc()` themselves.

**Example of what breaks**:
```css
/* This breaks the parser: */
width: min(100%, (2 - 1));  /* Bare arithmetic without calc() */

/* This probably works: */
width: min(100%, calc(2 - 1));  /* Arithmetic wrapped in calc() */
```

---

## ✅ The Real Fix

### Strategy: Test Before Cleaning

```php
private function clean_css_safely( string $css ): string {
    // Step 1: Try parsing without ANY cleaning
    try {
        $this->css_parser->parse( $css );
        return $css;  // ✅ It works! Don't touch it.
    } catch ( \Exception $e ) {
        // Parser failed, need targeted cleaning
    }
    
    // Step 2: Only fix what's actually broken
    $css = $this->fix_malformed_arithmetic( $css, $e->getMessage() );
    
    // Step 3: Try again
    try {
        $this->css_parser->parse( $css );
        return $css;  // ✅ Fixed with minimal changes
    } catch ( \Exception $e ) {
        // Still failing, need more investigation
        error_log( 'CSS still failing after cleaning: ' . $e->getMessage() );
        return $css;
    }
}

private function fix_malformed_arithmetic( string $css, string $error_message ): string {
    // Only fix the specific pattern that breaks the parser
    if ( false !== strpos( $error_message, 'Identifier expected' ) ) {
        // Fix bare arithmetic expressions like "(2 - 1)"
        // But preserve valid calc(), var(), min(), max()
        $css = preg_replace(
            '/\(\s*\d+\s*[-+*\/]\s*\d+\s*\)/',  // Match: (2 - 1)
            '0',                                  // Replace with: 0
            $css
        );
    }
    
    return $css;
}
```

---

## 🚀 Implementation Plan (Simplified)

### Phase 1: Remove Blind Replacements (30 minutes)
1. Comment out lines 1229-1239 in `replace_calc_expressions()`
2. Run tests to see what actually breaks
3. Document which specific patterns cause parser failures

### Phase 2: Implement Targeted Fixes (2 hours)
1. Only fix patterns that actually break the parser
2. Preserve `var()`, `calc()`, `min()`, `max()` in all other cases
3. Add property-specific logic only if needed

### Phase 3: Validate (1 hour)
1. Run the typography preservation test
2. Verify visual output matches original
3. Confirm parser still succeeds on all files

---

## 🎯 Expected Results

### Before Fix
```css
font-family: var(--e-global-typography-primary-font-family), Sans-serif;
→ font-family: 0, Sans-serif;  /* ❌ BROKEN */

color: var(--e-global-color-e66ebc9);
→ color: 0;  /* ❌ BROKEN */

margin: calc(100% - 20px);
→ margin: 100%;  /* ❌ BROKEN */
```

### After Fix
```css
font-family: var(--e-global-typography-primary-font-family), Sans-serif;
→ font-family: var(--e-global-typography-primary-font-family), Sans-serif;  /* ✅ PRESERVED */

color: var(--e-global-color-e66ebc9);
→ color: var(--e-global-color-e66ebc9);  /* ✅ PRESERVED */

margin: calc(100% - 20px);
→ margin: calc(100% - 20px);  /* ✅ PRESERVED */
```

---

## 📝 Key Insight

**We've been treating the symptom (parser errors) instead of understanding the disease (specific malformed patterns).**

The fix is not to replace more aggressively, but to **replace less and more intelligently**.

---

## 🔬 Next Steps

1. **Experiment**: Comment out `replace_calc_expressions()` entirely
2. **Observe**: See which CSS files actually fail to parse
3. **Analyze**: Identify the exact patterns causing failures
4. **Fix**: Only replace those specific patterns
5. **Validate**: Ensure visual output is preserved

---

## 🎯 Recommended Immediate Action

### Step 1: Disable Aggressive Replacement (5 minutes)

**File**: `plugins/elementor-css/modules/css-converter/services/widgets/unified-widget-conversion-service.php`

**Change**: Comment out the destructive replacements in `replace_calc_expressions()`:

```php
private function replace_calc_expressions( string $css ): string {
    // COMMENTED OUT: These destroy legitimate CSS values
    // for ( $i = 0; $i < 5; ++$i ) {
    //     $css = preg_replace( '/var\s*\([^()]*\)/', '0', $css );
    //     $css = preg_replace( '/env\s*\([^()]*\)/', '0', $css );
    //     $css = preg_replace( '/min\s*\([^()]*\)/', '0', $css );
    //     $css = preg_replace( '/max\s*\([^()]*\)/', '100%', $css );
    //     $css = preg_replace( '/clamp\s*\([^()]*\)/', '50%', $css );
    // }
    
    // for ( $i = 0; $i < 5; ++$i ) {
    //     $css = preg_replace( '/calc\s*\([^()]*\)/', '100%', $css );
    // }
    
    // Keep only the fixes for actual parser-breaking patterns:
    
    // Remove custom properties with calc (these can cause issues)
    $css = preg_replace( '/--[^:]+:\s*[^;]*calc[^;]*;/', '', $css );
    
    // Remove IE hacks
    $css = preg_replace( '/\*[a-zA-Z_-]+\s*:\s*[^;]+;/', '', $css );
    
    // Remove empty rules
    $css = preg_replace( '/\{\s*\}/', '', $css );
    
    // Fix malformed percentage values
    $css = preg_replace( '/:\s*100%([^;}]+)/', ': 100%;', $css );
    
    // Normalize whitespace
    $css = preg_replace( '/\s+/', ' ', $css );
    
    // Fix percentage followed by closing brace/selector
    $css = str_replace( '%)}', '%; }', $css );
    $css = str_replace( '%).',  '%; .', $css );
    $css = str_replace( '%)#',  '%; #', $css );
    
    return $css;
}
```

### Step 2: Test the Impact (10 minutes)

Run the typography preservation test:
```bash
npx playwright test typography-preservation.test.ts
```

**Expected Results**:
- ✅ Font properties should now be preserved
- ✅ Color variables should work
- ❌ Some CSS files might fail to parse (that's OK, we'll fix those specifically)

### Step 3: Identify What Actually Breaks (15 minutes)

Check the debug log for parsing errors:
```bash
tail -f debug.log | grep "CSS PARSING"
```

Document which specific CSS patterns cause parser failures.

### Step 4: Add Targeted Fixes (30 minutes)

Only fix the patterns that actually break the parser, not all CSS functions globally.

