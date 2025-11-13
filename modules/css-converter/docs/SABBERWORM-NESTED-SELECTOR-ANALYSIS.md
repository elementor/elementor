# Sabberworm Nested Selector Analysis

**Date:** 2025-11-05  
**Question:** Can Sabberworm handle nested selector mapping better than our current manual approach?

## Current Situation

### What We're Doing Manually

**1. Nested Selector Parsing** (`Nested_Selector_Parser`)
```php
// Manual parsing of: ".parent .child"
$parts = explode(' ', $selector);  // ['parent', 'child']
$target = end($parts);              // 'child'
$context = array_slice($parts, 0, -1); // ['parent']
```

**2. Selector Flattening** (`Nested_Selector_Flattening_Processor`)
```php
// Converting: ".parent .child" → ".parent-and-child"
$flattened = $this->generate_flattened_class_name($parts);
```

**3. Widget Matching** (`Nested_Element_Selector_Processor`)
```php
// Finding widgets that match parent context
$parent_widgets = $this->find_matching_widgets($parent_selector, $widgets);
// Then applying styles to children
```

### Problems We're Having

1. **Regex parsing is fragile** - handles edge cases poorly
2. **Combinator detection** - manual detection of `>`, `+`, `~`
3. **Specificity calculation** - we have our own calculator
4. **Selector structure** - no understanding of selector parts

## What Sabberworm Provides

### ✅ Current Usage

**1. CSS Parsing** (`CssParser`)
```php
$parser = new \Sabberworm\CSS\Parser($css);
$document = $parser->parse();
$ruleSets = $document->getAllRuleSets();
```

**2. Selector Extraction** (`Css_Parsing_Processor`)
```php
foreach ($ruleSet->getSelectors() as $selector) {
    $selector_string = (string) $selector;  // ".parent .child"
    // We then manually parse this string
}
```

**3. Specificity** (`Selector::getSpecificity()`)
```php
$specificity = $selector->getSpecificity();  // Already calculated!
```

### ❌ What Sabberworm DOESN'T Provide

**1. Selector Structure Parsing**
- Sabberworm's `Selector` class only stores the selector as a **string**
- No methods to get parent/child parts
- No combinator detection
- No selector component extraction

**Evidence:**
```php
// Sabberworm\CSS\Property\Selector.php
class Selector {
    private $sSelector;  // Just a string!
    
    public function getSelector() {
        return $this->sSelector;  // Returns: ".parent .child"
    }
    
    // No methods like:
    // - getParentSelector()
    // - getChildSelector()
    // - getCombinator()
    // - getParts()
}
```

**2. Selector AST**
- Sabberworm doesn't parse selectors into component parts
- The selector string is kept as-is from CSS input

## Analysis: Can Sabberworm Help?

### ❌ **NO** - For Selector Structure Parsing

**Reason:** Sabberworm's `Selector` class is intentionally simple - it only stores the selector string. It doesn't parse selector components.

**What This Means:**
- We still need to manually parse `.parent .child` into parts
- We still need to detect combinators (`>`, `+`, `~`, space)
- We still need to extract parent/child relationships

### ✅ **YES** - For Better CSS Document Structure

**What We CAN Leverage:**

**1. Use Sabberworm's Specificity (Already Available)**
```php
// Instead of our own calculator:
$specificity = $this->specificity_calculator->calculate_specificity($selector);

// Use Sabberworm's built-in:
$specificity = $selector->getSpecificity();
```

**2. Leverage AST Structure for CSS Nesting**
```php
// Sabberworm preserves CSS structure:
$document->getContents();  // Top-level rules
$ruleSet->getParent();     // Parent container (e.g., @media)
$atRule->getContents();    // Nested rules

// We can use this to understand CSS nesting:
// @media (max-width: 768px) {
//   .parent { ... }
//   .parent .child { ... }
// }
```

**3. Use SelectorList for Comma-Separated Selectors**
```php
// Sabberworm already handles commas:
$selectors = $ruleSet->getSelectors();  // Array of Selector objects
// Each selector is separate: ".a, .b, .c" → [Selector(".a"), Selector(".b"), Selector(".c")]
```

## Recommendation: Hybrid Approach

### Keep Manual Parsing BUT Improve It

**Why:**
- Sabberworm doesn't parse selector structure
- We need selector component parts for widget matching
- Manual parsing is unavoidable

**How to Improve:**

**1. Use Sabberworm's Specificity**
```php
// Before (our calculator):
$specificity = $this->specificity_calculator->calculate_specificity($selector);

// After (Sabberworm):
$selector_obj = new \Sabberworm\CSS\Property\Selector($selector);
$specificity = $selector_obj->getSpecificity();
```

**2. Better Selector Parsing Library**

Instead of manual regex, consider using a dedicated CSS selector parser:

**Option A: CSS Selector Parser Library**
```php
// Example: Use a CSS selector parser library
$parser = new \SebastianBergmann\CSS\Parser();
$selector_list = $parser->parseSelector('.parent .child');
$parts = $selector_list->getParts();  // ['parent', 'child']
$combinators = $selector_list->getCombinators();  // [' ']
```

**Option B: Improve Our Parser**
```php
// Use proper CSS selector grammar parsing
// Instead of: explode(' ', $selector)
// Use: Proper tokenization with combinator detection
```

**3. Leverage Sabberworm's Document Structure**

For CSS nesting (not selector nesting):
```php
// Use Sabberworm's AST to understand CSS structure
$parent = $ruleSet->getParent();
if ($parent instanceof \Sabberworm\CSS\AtRuleBlockList) {
    // This rule is inside @media, @supports, etc.
    $media_query = $parent->atRuleName();
}
```

## Current Problems & Solutions

### Problem 1: Fragile Regex Parsing

**Current:**
```php
$parts = explode(' ', $selector);  // Breaks on complex selectors
```

**Solution:** Use proper CSS selector tokenization
```php
// Tokenize selector properly handling:
// - Combinators: space, >, +, ~
// - Pseudo-classes: :hover, :nth-child()
// - Attributes: [data-id="value"]
// - Classes: .class1.class2
```

### Problem 2: Combinator Detection

**Current:**
```php
// Manual detection:
if (strpos($selector, '>') !== false) { /* child combinator */ }
if (strpos($selector, '+') !== false) { /* adjacent sibling */ }
```

**Solution:** Parse combinators during tokenization
```php
$tokens = $this->tokenize_selector($selector);
// Returns: [
//   ['type' => 'class', 'value' => 'parent'],
//   ['type' => 'combinator', 'value' => ' '],
//   ['type' => 'class', 'value' => 'child']
// ]
```

### Problem 3: Specificity Calculation

**Current:**
```php
// Our own calculator
$specificity = $this->specificity_calculator->calculate_specificity($selector);
```

**Solution:** Use Sabberworm's built-in
```php
$selector_obj = new \Sabberworm\CSS\Property\Selector($selector);
$specificity = $selector_obj->getSpecificity();
```

## Proposed Implementation

### Phase 1: Use Sabberworm's Specificity ✅ Easy Win

**File:** `nested-selector-parser.php`

```php
private function calculate_specificity_using_sabberworm(string $selector): int {
    try {
        $selector_obj = new \Sabberworm\CSS\Property\Selector($selector);
        return $selector_obj->getSpecificity();
    } catch (\Exception $e) {
        // Fallback to our calculator
        return $this->specificity_calculator->calculate_specificity($selector);
    }
}
```

**Benefit:**
- ✅ Remove duplicate specificity calculation code
- ✅ Use battle-tested Sabberworm implementation
- ✅ Consistent with CSS spec

### Phase 2: Improve Selector Tokenization ⚠️ Medium Effort

**Create:** `selector-tokenizer.php`

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
        return $this->group_by_combinators($tokens);
    }
}
```

**Benefit:**
- ✅ More robust parsing
- ✅ Handles edge cases
- ✅ Clear structure

### Phase 3: Leverage Document Structure ⚠️ Low Priority

**File:** `css-parsing-processor.php`

```php
private function extract_rules_with_context($document): array {
    foreach ($document->getAllRuleSets() as $ruleSet) {
        $parent_context = $this->get_parent_context($ruleSet);
        // parent_context: '@media (max-width: 768px)' or null
        
        $rules[] = [
            'selector' => $selector_string,
            'properties' => $properties,
            'context' => $parent_context,  // NEW: CSS nesting context
        ];
    }
}
```

**Benefit:**
- ✅ Understand CSS nesting (@media, @supports)
- ✅ Better context for style resolution

## Conclusion

### Can Sabberworm Handle Nested Selectors Better?

**Short Answer:** **NO** - Sabberworm doesn't parse selector structure.

**Long Answer:** **PARTIALLY** - We can leverage:
1. ✅ **Specificity calculation** - Use Sabberworm's built-in
2. ✅ **Document structure** - Use AST for CSS nesting
3. ❌ **Selector parsing** - Still need manual parsing, but can improve it

### Recommended Actions

**Immediate (Easy Win):**
1. Replace our specificity calculator with Sabberworm's `getSpecificity()`
2. Remove duplicate specificity calculation code

**Short-term (Medium Effort):**
1. Create proper selector tokenizer
2. Replace fragile regex parsing
3. Better combinator detection

**Long-term (Optional):**
1. Leverage Sabberworm's document AST for CSS nesting
2. Understand @media/@supports context

---

**Last Updated:** 2025-11-05  
**Status:** Analysis Complete  
**Recommendation:** Use Sabberworm for specificity, improve our selector parser


