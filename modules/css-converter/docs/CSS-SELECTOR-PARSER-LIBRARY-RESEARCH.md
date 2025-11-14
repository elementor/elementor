# CSS Selector Parser Library Research

**Date:** 2025-11-05  
**Goal:** Find PHP library that can parse CSS selector structure (parts, combinators, parent/child)

## Research Summary

### ❌ No Dedicated PHP CSS Selector Parser Found

After extensive research, **there is no PHP library specifically designed to parse CSS selector structure** (extracting parent/child parts, combinators, etc.).

Most PHP CSS libraries focus on:
- **CSS parsing** (stylesheets, rules, properties) ✅ Available
- **DOM selection** (using selectors to find elements) ✅ Available  
- **Selector structure parsing** (extracting selector components) ❌ NOT Available

## PHP Libraries Evaluated

### 1. Sabberworm/PHP-CSS-Parser ✅ Already Using

**What It Does:**
- Parses CSS stylesheets into AST
- Extracts selectors as strings
- Calculates specificity

**What It Doesn't Do:**
- ❌ Parse selector structure (parent/child parts)
- ❌ Extract combinators
- ❌ Tokenize selector components

**Evidence:**
```php
// Sabberworm\CSS\Property\Selector
class Selector {
    private $sSelector;  // Just stores: ".parent .child"
    // No methods to get parts, combinators, etc.
}
```

**Verdict:** ✅ Good for CSS parsing, ❌ Not for selector structure

---

### 2. Symfony CSS Selector (`symfony/css-selector`)

**Purpose:** Match CSS selectors against DOM elements (XPath conversion)

**What It Does:**
- Converts CSS selectors to XPath
- Matches selectors against DOMDocument
- Supports complex selectors (combinators, pseudo-classes)

**What It Doesn't Do:**
- ❌ Parse selector structure (doesn't expose parts)
- ❌ Extract selector components
- ❌ Designed for matching, not parsing

**Example:**
```php
use Symfony\Component\CssSelector\CssSelectorConverter;

$converter = new CssSelectorConverter();
$xpath = $converter->toXPath('.parent .child');
// Returns XPath, not selector structure
```

**Verdict:** ✅ Good for DOM matching, ❌ Not for selector parsing

---

### 3. Wikimedia CSS Parser & Sanitizer (`wikimedia/css-sanitizer`)

**Purpose:** CSS sanitization for security

**What It Does:**
- Tokenizes CSS
- Parses CSS grammar
- Sanitizes CSS for safe output

**What It Doesn't Do:**
- ❌ Parse selector structure
- ❌ Extract selector components
- Focused on sanitization, not selector analysis

**Verdict:** ✅ Good for sanitization, ❌ Not for selector parsing

---

### 4. soloproyectos-php/css-parser

**Purpose:** CSS selector evaluation and DOM element selection

**What It Does:**
- Evaluates CSS selectors
- Selects elements from DOMDocument
- Supports pseudo-filters

**What It Doesn't Do:**
- ❌ Parse selector structure
- ❌ Extract selector components
- Focused on element selection

**Verdict:** ✅ Good for DOM selection, ❌ Not for selector parsing

---

## JavaScript Libraries (Reference)

These libraries DO parse selector structure, but are **JavaScript only**:

### Parsel (JavaScript) ✅ Has What We Need

**Features:**
- Tokenizes CSS selectors
- Parses into AST
- Extracts combinator types
- Calculates specificity

**Example:**
```javascript
import { parse } from 'parsel-js';

const ast = parse('.parent .child');
// Returns:
// {
//   type: 'complex',
//   combinator: ' ',
//   left: { type: 'class', name: 'parent' },
//   right: { type: 'class', name: 'child' }
// }
```

**Verdict:** ✅ Perfect for selector parsing, but **JavaScript only**

---

## Conclusion

### The Reality

**PHP Ecosystem Gap:**
- ❌ No PHP library exists specifically for CSS selector structure parsing
- ✅ CSS parsing libraries exist (Sabberworm)
- ✅ DOM selection libraries exist (Symfony CSS Selector)
- ❌ Selector component extraction: **Not available**

### Why This Matters

Our current manual parsing approach is **actually the standard approach** in PHP because:
1. No library provides selector structure parsing
2. Everyone in PHP manually parses selectors
3. Our regex-based approach is common practice

### Recommendation

**Option 1: Improve Our Parser** ⭐ Recommended

**Why:**
- No library dependency needed
- Full control over parsing logic
- Can optimize for our specific use case
- Avoids external dependencies

**How:**
1. Create proper tokenizer (replace fragile regex)
2. Implement combinator detection properly
3. Handle edge cases (pseudo-classes, attributes, etc.)
4. Use Sabberworm's specificity (easy win)

**Implementation:**
```php
class Selector_Tokenizer {
    public function tokenize(string $selector): array {
        // Proper CSS selector tokenization
        // Handles:
        // - Combinators: space, >, +, ~
        // - Classes: .class1.class2
        // - IDs: #id
        // - Elements: div, span
        // - Pseudo-classes: :hover, :nth-child(2)
        // - Attributes: [data-id="value"]
    }
    
    public function extract_parts(string $selector): array {
        $tokens = $this->tokenize($selector);
        return [
            'parts' => $this->group_by_combinators($tokens),
            'combinators' => $this->extract_combinators($tokens),
            'parent' => $this->get_parent_part($tokens),
            'child' => $this->get_child_part($tokens),
        ];
    }
}
```

**Option 2: Use JavaScript Library** ⚠️ Complex

**How:**
- Use Node.js/exec to call JavaScript parser
- Parse in JS, return JSON to PHP
- Use V8JS or similar PHP extension

**Why Not Recommended:**
- ❌ Requires Node.js runtime
- ❌ Performance overhead (process spawning)
- ❌ Additional infrastructure complexity
- ❌ Not suitable for WordPress environment

**Option 3: Port JavaScript Library** ⚠️ High Effort

**How:**
- Port Parsel.js to PHP
- Maintain CSS selector grammar compliance

**Why Not Recommended:**
- ❌ Significant development effort
- ❌ Maintenance burden
- ❌ Reinventing the wheel

---

## Specific Libraries Comparison

| Library | Language | CSS Parsing | Selector Parsing | DOM Selection | Our Use Case |
|---------|----------|-------------|------------------|---------------|--------------|
| **Sabberworm** | PHP | ✅ | ❌ | ❌ | ✅ Using |
| **Symfony CSS Selector** | PHP | ❌ | ❌ | ✅ | ❌ Wrong tool |
| **Wikimedia CSS Sanitizer** | PHP | ✅ | ❌ | ❌ | ❌ Wrong tool |
| **soloproyectos/css-parser** | PHP | ❌ | ❌ | ✅ | ❌ Wrong tool |
| **Parsel** | JavaScript | ❌ | ✅ | ❌ | ⚠️ Wrong language |

---

## Final Recommendation

### ✅ **Improve Our Selector Parser**

**Rationale:**
1. **No PHP library exists** for selector structure parsing
2. **Our manual approach is standard** in PHP ecosystem
3. **We can make it robust** with proper tokenization
4. **No external dependencies** needed
5. **Full control** over parsing logic

### Implementation Priority

**Phase 1: Easy Wins** ✅ Quick
1. Use Sabberworm's `getSpecificity()` instead of our calculator
2. Remove duplicate specificity code

**Phase 2: Improve Tokenization** ⚠️ Medium Effort
1. Create proper `Selector_Tokenizer` class
2. Replace fragile `explode(' ', $selector)` approach
3. Proper combinator detection
4. Handle edge cases (pseudo-classes, attributes)

**Phase 3: Optimize** ⚠️ Low Priority
1. Cache parsed selectors
2. Optimize tokenization performance
3. Add comprehensive tests

---

## Alternative: Manual Parser Best Practices

Since no library exists, here's how to build a robust parser:

### CSS Selector Grammar Reference

**Combinators:**
- ` ` (space) - Descendant selector
- `>` - Child selector  
- `+` - Adjacent sibling
- `~` - General sibling

**Components:**
- Element: `div`, `span`, `h1`
- Class: `.class-name`
- ID: `#id-name`
- Attribute: `[attr="value"]`
- Pseudo-class: `:hover`, `:nth-child(2)`
- Pseudo-element: `::before`, `::after`

### Tokenization Strategy

```php
class Selector_Tokenizer {
    private function tokenize(string $selector): array {
        $tokens = [];
        $length = strlen($selector);
        $i = 0;
        
        while ($i < $length) {
            // Skip whitespace
            if (ctype_space($selector[$i])) {
                $i++;
                continue;
            }
            
            // Combinator detection
            if ($selector[$i] === '>') {
                $tokens[] = ['type' => 'combinator', 'value' => '>'];
                $i++;
                continue;
            }
            
            // Class detection
            if ($selector[$i] === '.') {
                $class = $this->read_class($selector, $i);
                $tokens[] = ['type' => 'class', 'value' => $class];
                $i += strlen($class) + 1;
                continue;
            }
            
            // ... handle other token types
        }
        
        return $tokens;
    }
}
```

---

**Last Updated:** 2025-11-05  
**Status:** Research Complete  
**Recommendation:** Improve our parser - no suitable PHP library exists






