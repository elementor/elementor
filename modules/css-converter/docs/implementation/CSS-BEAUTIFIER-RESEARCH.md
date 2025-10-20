# CSS Beautifier Research: PHP Libraries

## 🎯 Goal

Instead of aggressively replacing CSS functions, **beautify/unminify the CSS first** to make it parseable, then parse it cleanly without destroying values.

## 💡 Key Insight

**The real problem isn't the CSS functions (`var()`, `calc()`) - it's the minified/malformed format.**

If we beautify the CSS first:
- Newlines are added properly
- Indentation is fixed
- Malformed expressions become visible
- Parser can handle it naturally

## 📚 PHP CSS Beautifier Libraries

### Option 1: Sabberworm CSS Parser (Already Installed! ✅)

**We're already using this library** - and it has a built-in formatter!

**Location**: `includes/libraries/sabberworm-css-parser/`

**Capabilities**:
```php
use Sabberworm\CSS\Parser;
use Sabberworm\CSS\OutputFormat;

// Parse minified CSS
$parser = new Parser($minified_css);
$document = $parser->parse();

// Output beautified CSS
$beautified = $document->render(OutputFormat::createPretty());
```

**OutputFormat Options**:
- `OutputFormat::createPretty()` - Human-readable with indentation
- `OutputFormat::createCompact()` - Minified
- `OutputFormat::create()` - Custom formatting

**Advantages**:
- ✅ Already installed and loaded
- ✅ No additional dependencies
- ✅ Same library doing parse + format
- ✅ Handles CSS correctly (won't break values)
- ✅ Zero cost to implement

**Disadvantages**:
- ❌ If it can't parse the CSS, it can't beautify it (chicken-and-egg problem)

---

### Option 2: CSSTidy (PHP Native)

**Package**: Not a Composer package, needs manual installation

**Capabilities**:
- Optimizes and beautifies CSS
- Fixes common CSS errors
- Removes invalid properties

**Advantages**:
- ✅ Mature library (15+ years old)
- ✅ Can fix some malformed CSS

**Disadvantages**:
- ❌ Not actively maintained
- ❌ Requires manual installation
- ❌ Not available via Composer

---

### Option 3: PHP-CSS-Parser (Different from Sabberworm)

**Package**: `sabberworm/php-css-parser` (This is what we have!)

Actually, this IS the Sabberworm parser we're already using.

---

### Option 4: Custom Regex-Based Beautifier

**Approach**: Write our own simple beautifier using regex

```php
private function beautify_css_simple( string $css ): string {
    // Remove all newlines first
    $css = str_replace(["\r\n", "\r", "\n"], '', $css);
    
    // Add newlines after closing braces
    $css = str_replace('}', "}\n", $css);
    
    // Add newlines after opening braces
    $css = str_replace('{', "{\n", $css);
    
    // Add newlines after semicolons (but not inside parentheses)
    $css = preg_replace('/;(?![^(]*\))/', ";\n", $css);
    
    // Add indentation
    $lines = explode("\n", $css);
    $indent_level = 0;
    $formatted = [];
    
    foreach ($lines as $line) {
        $line = trim($line);
        if (empty($line)) continue;
        
        // Decrease indent before closing brace
        if ('}' === $line[0]) {
            --$indent_level;
        }
        
        $formatted[] = str_repeat('    ', $indent_level) . $line;
        
        // Increase indent after opening brace
        if (false !== strpos($line, '{')) {
            ++$indent_level;
        }
    }
    
    return implode("\n", $formatted);
}
```

**Advantages**:
- ✅ Simple and fast
- ✅ No dependencies
- ✅ Full control

**Disadvantages**:
- ❌ May not handle all edge cases
- ❌ Could break CSS with complex selectors

---

## 🎯 Recommended Solution

### Two-Phase Approach

**Phase 1: Try Sabberworm's Built-in Beautifier**

```php
private function parse_css_sources_safely( array $css_sources ): string {
    $successful_css = '';
    
    foreach ( $css_sources as $source ) {
        $content = $source['content'];
        
        try {
            // Try parsing directly first
            $parsed = $this->css_parser->parse( $content );
            $successful_css .= $content . "\n";
        } catch ( \Exception $e ) {
            // Parsing failed, try beautifying first
            try {
                $parsed = $this->css_parser->parse( $content );
                $beautified = $parsed->render( \Sabberworm\CSS\OutputFormat::createPretty() );
                
                // Now try parsing the beautified version
                $reparsed = $this->css_parser->parse( $beautified );
                $successful_css .= $beautified . "\n";
            } catch ( \Exception $e2 ) {
                // Still failing, log and skip
                error_log( 'Failed to parse even after beautifying: ' . $e2->getMessage() );
            }
        }
    }
    
    return $successful_css;
}
```

**Problem**: This won't work because if parsing fails initially, we can't beautify it.

---

**Phase 2: Minimal Cleaning + Sabberworm Beautifier**

```php
private function parse_css_sources_safely( array $css_sources ): string {
    $successful_css = '';
    
    foreach ( $css_sources as $source ) {
        $content = $source['content'];
        
        try {
            // Step 1: Try parsing directly
            $parsed = $this->css_parser->parse( $content );
            
            // Step 2: Beautify the parsed CSS (this preserves all values!)
            $beautified = $parsed->render( \Sabberworm\CSS\OutputFormat::createPretty() );
            
            $successful_css .= $beautified . "\n";
        } catch ( \Exception $e ) {
            // Step 3: Apply minimal cleaning for parser-breaking patterns only
            $cleaned = $this->minimal_clean_for_parser( $content );
            
            try {
                $parsed = $this->css_parser->parse( $cleaned );
                $beautified = $parsed->render( \Sabberworm\CSS\OutputFormat::createPretty() );
                $successful_css .= $beautified . "\n";
            } catch ( \Exception $e2 ) {
                error_log( 'Failed to parse: ' . $e2->getMessage() );
            }
        }
    }
    
    return $successful_css;
}

private function minimal_clean_for_parser( string $css ): string {
    // Only fix patterns that actually break the parser
    
    // Fix 1: Remove newlines within property values
    $css = preg_replace( '/:\s*([^;{}\n]+)\n+\s*;/', ': $1;', $css );
    
    // Fix 2: Remove IE hacks
    $css = preg_replace( '/\*[a-zA-Z_-]+\s*:\s*[^;]+;/', '', $css );
    
    // Fix 3: Fix bare arithmetic expressions (the actual parser-breaking pattern)
    // Pattern: (2 - 1) without calc() wrapper
    $css = preg_replace( '/\(\s*\d+\s*[-+*\/]\s*\d+\s*\)/', '0', $css );
    
    // Fix 4: Remove empty rules
    $css = preg_replace( '/\{\s*\}/', '', $css );
    
    return $css;
}
```

---

## 🎯 Benefits of This Approach

1. **Preserves CSS Values**: Sabberworm's beautifier won't change `var()`, `calc()`, colors, etc.
2. **Handles Minification**: Automatically adds proper newlines and indentation
3. **Uses Existing Library**: No new dependencies
4. **Minimal Cleaning**: Only fix actual parser-breaking patterns
5. **Consistent Output**: All CSS formatted the same way

---

## 🧪 Test Case

### Input (Minified)
```css
.test{font-family:var(--font-primary),Sans-serif;color:var(--color-primary);margin:calc(100% - 20px);}
```

### After Sabberworm Beautifier
```css
.test {
    font-family: var(--font-primary), Sans-serif;
    color: var(--color-primary);
    margin: calc(100% - 20px);
}
```

### Result
✅ All values preserved
✅ Properly formatted
✅ Parser can handle it

---

## 🚀 Implementation Plan

### Step 1: Remove Aggressive Replacements (15 minutes)
Delete lines 290-298 in `replace_calc_expressions()` that destroy CSS values.

### Step 2: Add Sabberworm Beautifier (30 minutes)
Modify `parse_css_sources_safely()` to use `OutputFormat::createPretty()` after successful parsing.

### Step 3: Keep Only Minimal Cleaning (15 minutes)
Replace `replace_calc_expressions()` with `minimal_clean_for_parser()` that only fixes:
- Newlines in property values
- IE hacks
- Bare arithmetic expressions
- Empty rules

### Step 4: Test (30 minutes)
Run typography preservation test and verify visual output.

---

## 📊 Expected Results

### Before
```css
font-family: 0, Sans-serif;  /* ❌ BROKEN */
color: 0;  /* ❌ BROKEN */
```

### After
```css
font-family: var(--e-global-typography-primary-font-family), Sans-serif;  /* ✅ PRESERVED */
color: var(--e-global-color-e66ebc9);  /* ✅ PRESERVED */
```

---

## ✅ Conclusion

**Use Sabberworm's built-in beautifier** - it's already installed, preserves all CSS values, and solves the minification issues that make CSS hard to parse.

The key is: **Parse → Beautify → Use beautified CSS** instead of **Destroy values → Parse broken CSS**.

