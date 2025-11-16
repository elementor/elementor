# CSS Selector Parser Library Recommendation

**Date:** 2025-11-05  
**Status:** Research Complete

## Executive Summary

**Finding:** ❌ **No PHP library exists** that parses CSS selector structure (extracting parent/child parts, combinators).

**Recommendation:** ✅ **Improve our own parser** - this is the standard approach in PHP.

## Detailed Findings

### PHP Libraries Evaluated

| Library | Purpose | Selector Parsing? | Verdict |
|--------|---------|-------------------|---------|
| **Sabberworm** | CSS stylesheet parsing | ❌ No | ✅ Already using, but doesn't parse selector structure |
| **Symfony CSS Selector** | DOM element selection | ❌ No | Converts selectors to XPath, doesn't expose structure |
| **Wikimedia CSS Sanitizer** | CSS sanitization | ❌ No | Focused on security, not selector analysis |
| **soloproyectos/css-parser** | DOM selection | ❌ No | Evaluates selectors, doesn't parse them |

### JavaScript Libraries (Reference)

| Library | Purpose | Selector Parsing? | Verdict |
|--------|---------|-------------------|---------|
| **Parsel** | Selector parsing | ✅ Yes | Perfect for our needs, but JavaScript only |
| **CSSTree** | CSS parsing | ✅ Partial | Has selector AST, but JavaScript only |

**Key Insight:** JavaScript ecosystem has selector parsers, PHP does not.

## Why No PHP Library?

**Possible Reasons:**
1. **Lower demand** - PHP is typically server-side, less need for selector parsing
2. **Different use cases** - PHP focuses on CSS parsing (Sabberworm) and DOM selection (Symfony)
3. **Manual parsing is common** - Most PHP projects parse selectors manually

## Our Current Approach Analysis

### What We're Doing

```php
// Current: Fragile regex-based parsing
$parts = explode(' ', $selector);  // Breaks on complex selectors
$target = end($parts);
$context = array_slice($parts, 0, -1);
```

### Problems

1. **Breaks on complex selectors:**
   - `.class1.class2 .child` → `['.class1.class2', '.child']` ✅ Works
   - `.parent :hover .child` → `['.parent', ':hover', '.child']` ⚠️ Wrong
   - `.parent[data-id="value"] .child` → Issues with quotes

2. **No combinator detection:**
   - Can't distinguish `>` (child) from ` ` (descendant)
   - Can't handle `+` (adjacent) or `~` (sibling)

3. **Edge cases fail:**
   - Pseudo-classes: `:nth-child(2)`, `:not(.class)`
   - Attributes: `[data-id="value"]`, `[data-id*="test"]`
   - Pseudo-elements: `::before`, `::after`

## Recommended Solution: Improve Our Parser

### Phase 1: Use Sabberworm's Specificity ✅ Easy Win

**Change:**
```php
// Before
$specificity = $this->specificity_calculator->calculate_specificity($selector);

// After  
$selector_obj = new \Sabberworm\CSS\Property\Selector($selector);
$specificity = $selector_obj->getSpecificity();
```

**Benefit:**
- ✅ Remove duplicate code
- ✅ Use battle-tested implementation
- ✅ CSS spec compliant

### Phase 2: Create Proper Tokenizer ⚠️ Medium Effort

**New Class:** `Selector_Tokenizer`

**Purpose:** Replace fragile regex with proper tokenization

**Features:**
```php
class Selector_Tokenizer {
    public function tokenize(string $selector): array {
        // Returns:
        // [
        //   ['type' => 'class', 'value' => 'parent'],
        //   ['type' => 'combinator', 'value' => ' '],
        //   ['type' => 'class', 'value' => 'child']
        // ]
    }
    
    public function parse(string $selector): array {
        $tokens = $this->tokenize($selector);
        return [
            'parts' => $this->extract_parts($tokens),
            'combinators' => $this->extract_combinators($tokens),
            'parent' => $this->get_parent($tokens),
            'child' => $this->get_child($tokens),
            'type' => $this->get_combinator_type($tokens),
        ];
    }
}
```

**Handles:**
- ✅ Combinators: ` `, `>`, `+`, `~`
- ✅ Multiple classes: `.class1.class2`
- ✅ Pseudo-classes: `:hover`, `:nth-child(2)`
- ✅ Attributes: `[data-id="value"]`
- ✅ Pseudo-elements: `::before`

### Phase 3: Integration

**Update Files:**
1. `nested-selector-parser.php` - Use new tokenizer
2. `nested-selector-flattening-processor.php` - Use parsed structure
3. `nested-element-selector-processor.php` - Use combinator info

## Implementation Example

### Current (Fragile)
```php
private function extract_selector_parts(string $selector): array {
    $parts = explode(' ', trim($selector));  // ❌ Breaks easily
    return array_filter($parts);
}
```

### Improved (Robust)
```php
private function extract_selector_parts(string $selector): array {
    $tokenizer = new Selector_Tokenizer();
    $parsed = $tokenizer->parse($selector);
    
    return [
        'parts' => $parsed['parts'],
        'combinators' => $parsed['combinators'],
        'parent' => $parsed['parent'],
        'child' => $parsed['child'],
        'type' => $parsed['type'],  // 'descendant', 'child', 'adjacent', 'sibling'
    ];
}
```

## Benefits of Improving Our Parser

### ✅ Advantages

1. **No External Dependencies**
   - Works within WordPress environment
   - No composer dependencies
   - No runtime requirements

2. **Full Control**
   - Optimize for our specific use case
   - Handle edge cases as needed
   - No library limitations

3. **Performance**
   - Optimized for our widget matching needs
   - Can cache parsed results
   - No external process overhead

4. **Maintainability**
   - Own the code
   - Understand every detail
   - Easy to debug

### ⚠️ Disadvantages

1. **Development Effort**
   - Need to implement tokenizer
   - Need to handle edge cases
   - Need comprehensive tests

2. **Maintenance**
   - Must maintain CSS selector grammar compliance
   - Must handle new CSS features

## Alternative: Check Symfony CSS Selector Internals

**Potential Discovery:** Symfony CSS Selector might have internal tokenization we could leverage.

**Investigation Needed:**
```php
// Check if Symfony exposes tokenizer/parser:
use Symfony\Component\CssSelector\Parser\Tokenizer\Tokenizer;
use Symfony\Component\CssSelector\Parser\Parser;

$tokenizer = new Tokenizer('.parent .child');
$tokens = $tokenizer->tokenize();  // Might expose structure?

$parser = new Parser();
$ast = $parser->parse('.parent .child');  // Might expose AST?
```

**If Available:**
- ✅ Could use Symfony's tokenizer
- ✅ Well-tested and maintained
- ⚠️ Would add dependency
- ⚠️ Might not expose structure we need

**Next Step:** Investigate Symfony CSS Selector source code to see if it exposes tokenization.

---

## Next Steps

1. **Immediate:** Use Sabberworm's specificity (Phase 1)
2. **Investigate:** Check Symfony CSS Selector internals
3. **If No Library:** Implement proper tokenizer (Phase 2)
4. **Test:** Comprehensive test suite for edge cases

---

**Last Updated:** 2025-11-05  
**Status:** Research Complete - No suitable library found  
**Recommendation:** Improve our parser OR investigate Symfony internals









