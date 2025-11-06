# PRD: CSS Selector Parsing and Matching Fix

## Problem Statement

CSS selectors with descendant combinators are being incorrectly parsed as compound selectors, causing selector matching to fail completely. This prevents element-specific styles from being applied to widgets.

### Root Cause

The `CSS_Selector_Parser` is incorrectly parsing:
```css
.elementor-1140 .elementor-element.elementor-element-9856e95 .elementor-heading-title
```

**Current (Incorrect) Parsing:**
```json
{
  "type": "complex",
  "parts": [
    {
      "type": "compound",
      "parts": [
        {"type": "class", "value": "elementor-1140"},
        {"type": "class", "value": "elementor-element"},
        {"type": "class", "value": "elementor-element-9856e95"},
        {"type": "class", "value": "elementor-heading-title"}
      ]
    }
  ]
}
```
This treats it as: `.elementor-1140.elementor-element.elementor-element-9856e95.elementor-heading-title` (single element with all classes)

**Expected (Correct) Parsing:**
```json
{
  "type": "complex",
  "parts": [
    {"type": "class", "value": "elementor-1140"},
    {
      "type": "compound",
      "parts": [
        {"type": "class", "value": "elementor-element"},
        {"type": "class", "value": "elementor-element-9856e95"}
      ]
    },
    {"type": "class", "value": "elementor-heading-title"}
  ],
  "combinators": [" ", " "]
}
```
This correctly represents: `.elementor-1140` → (descendant) → `.elementor-element.elementor-element-9856e95` → (descendant) → `.elementor-heading-title`

### Impact

**Affected Selectors:**
- `.elementor-1140 .elementor-element.elementor-element-14c0aa4 .elementor-heading-title` ❌ 0 matches (should match h2 widgets)
- `.elementor-1140 .elementor-element.elementor-element-9856e95 .elementor-heading-title` ❌ 0 matches (should match h2 widgets)
- All descendant selectors with Elementor-specific classes

**Symptoms:**
- Element-specific styles not applied
- Widgets receive default styles instead of actual styles
- CSS matching returns 0 results for valid selectors

### Evidence

**Debug Output:**
```
[10:15:48] PARSING_DEBUG: Selector '.elementor-1140 .elementor-element.elementor-element-9856e95 .elementor-heading-title'
  Parsed structure: {
    "type": "complex",
    "parts": [{
      "type": "compound",
      "parts": [
        {"type": "class", "value": "elementor-1140"},
        {"type": "class", "value": "elementor-element"},
        {"type": "class", "value": "elementor-element-9856e95"},
        {"type": "class", "value": "elementor-heading-title"}
      ]
    }]
  }
```

**Selector Matching:**
```
[10:14:41] SELECTOR_MATCHING: '.elementor-1140 .elementor-element.elementor-element-14c0aa4 .elementor-heading-title'
  Matched element IDs: []
  Count: 0
```

**Virtual Ancestor Exists:**
```
[10:14:02] NAVIGATOR_DEBUG: Virtual ancestor found in index with classes: 'elementor elementor-1140 home page-template ...'
```

## Goals

1. **Fix CSS Selector Parsing**: Correctly identify descendant combinators (spaces) vs compound selectors (no spaces)
2. **Enable Selector Matching**: Ensure descendant selectors match widgets correctly
3. **Preserve Virtual Ancestor Context**: Virtual ancestors must be available during CSS matching
4. **Maintain Performance**: Don't degrade performance with complex selector matching

## Proposed Solution

### Phase 1: Fix CSS_Selector_Parser

**File:** `plugins/elementor-css/modules/css-converter/services/css/processing/css-selector-parser.php`

**Issue:** Parser is collapsing all class selectors separated by spaces into a single compound selector.

**Fix:** Properly detect descendant combinators (spaces) and split selector parts:

```php
private function split_by_combinators( string $selector ): array {
    $parts = [];
    $current_part = '';
    $prev_char = '';
    
    for ( $i = 0; $i < strlen( $selector ); $i++ ) {
        $char = $selector[$i];
        
        // Check if this is a combinator
        if ( in_array( $char, [' ', '>', '+', '~'] ) ) {
            // Skip if we're continuing a space sequence
            if ( $char === ' ' && $prev_char === ' ' ) {
                continue;
            }
            
            // Save current part if not empty
            if ( ! empty( trim( $current_part ) ) ) {
                $parts[] = [
                    'selector' => trim( $current_part ),
                    'combinator' => $char === ' ' ? ' ' : $char
                ];
                $current_part = '';
            }
        } else {
            $current_part .= $char;
        }
        
        $prev_char = $char;
    }
    
    // Add final part
    if ( ! empty( trim( $current_part ) ) ) {
        $parts[] = [
            'selector' => trim( $current_part ),
            'combinator' => null
        ];
    }
    
    return $parts;
}
```

### Phase 2: Update Selector Matcher Engine

**File:** `plugins/elementor-css/modules/css-converter/services/css/processing/selector-matcher-engine.php`

**Current State:**
- ✅ Virtual ancestors are indexed correctly
- ✅ `Widget_Tree_Navigator` can find ancestors
- ❌ Parser provides wrong structure to match against

**No changes needed** - once parser is fixed, matcher will work correctly.

### Phase 3: Widget Class Filtering Strategy

**Current Approach:**
```php
// All widget classes removed after CSS matching
$widget_classes_to_remove = array_filter(
    $widget_classes, function ( $class ) {
        return $this->is_widget_class( $class );
    }
);
```

**Verification Needed:**
- Are element-specific classes (`elementor-element-XXXXX`) needed after CSS matching?
- Should page wrapper classes (`elementor-1140`) be available during matching but removed from HTML?

**Recommendation:**
Keep current approach - all widget classes removed after CSS matching, but available during matching phase.

## Implementation Plan

### Step 1: Investigate CSS_Selector_Parser
- [ ] Read `css-selector-parser.php` to understand current parsing logic
- [ ] Identify where spaces are being collapsed into compound selectors
- [ ] Create test cases for descendant vs compound selectors

### Step 2: Fix Parser Logic
- [ ] Implement proper combinator detection
- [ ] Split selector by combinators correctly
- [ ] Parse each part as compound or simple selector
- [ ] Preserve combinator information in parsed structure

### Step 3: Comprehensive Testing
- [ ] Test simple selectors: `.class`
- [ ] Test compound selectors: `.class1.class2`
- [ ] Test descendant selectors: `.parent .child`
- [ ] Test complex selectors: `.a .b.c .d`
- [ ] Test all combinators: `>`, `+`, `~`

### Step 4: Integration Testing
- [ ] Test with real-world selectors from oboxthemes.com
- [ ] Verify `.elementor-1140 .elementor-element-14c0aa4 .elementor-heading-title` matches correctly
- [ ] Verify styles are applied to correct widgets
- [ ] Verify no cross-contamination between elements

## Success Criteria

### Functional Requirements
1. **Correct Parsing:**
   - `.a .b` → descendant selector (2 parts, 1 combinator)
   - `.a.b` → compound selector (1 part with 2 classes)
   - `.a .b.c .d` → complex selector (3 parts, 2 combinators)

2. **Correct Matching:**
   - `.elementor-1140 .elementor-element-14c0aa4 .elementor-heading-title` → matches h2 widgets
   - Virtual ancestor provides context for matching
   - No cross-contamination between different `elementor-element-*` IDs

3. **Correct Style Application:**
   - `font-size: 36px` applied (not 32px)
   - `color: rgb(34, 42, 90)` applied (not rgb(255, 255, 255))
   - `line-height: 46px` applied (not 32px)

### Technical Requirements
- Backward compatibility maintained
- Performance not degraded
- All existing tests still pass
- New tests added for selector parsing

## Test Cases

### Selector Parsing Tests
```php
// Test 1: Simple class selector
'.elementor-heading-title' → {type: 'class', value: 'elementor-heading-title'}

// Test 2: Compound selector (no spaces)
'.elementor-element.elementor-element-123' → {
  type: 'compound',
  parts: [
    {type: 'class', value: 'elementor-element'},
    {type: 'class', value: 'elementor-element-123'}
  ]
}

// Test 3: Descendant selector (with spaces)
'.parent .child' → {
  type: 'complex',
  parts: [
    {type: 'class', value: 'parent'},
    {type: 'class', value: 'child'}
  ],
  combinators: [' ']
}

// Test 4: Mixed (compound + descendant)
'.a.b .c' → {
  type: 'complex',
  parts: [
    {type: 'compound', parts: [{type: 'class', value: 'a'}, {type: 'class', value: 'b'}]},
    {type: 'class', value: 'c'}
  ],
  combinators: [' ']
}
```

### Selector Matching Tests
```php
// Given widget tree:
// - virtual-ancestor (class: 'elementor-1140')
//   - widget-1 (class: 'elementor-element elementor-element-14c0aa4')
//     - widget-2 (class: 'elementor-heading-title', type: 'e-heading')

// Test 1: Should match widget-2
selector: '.elementor-1140 .elementor-element-14c0aa4 .elementor-heading-title'
expected: ['widget-2']

// Test 2: Should match widget-1
selector: '.elementor-1140 .elementor-element-14c0aa4'
expected: ['widget-1']

// Test 3: Should not match anything (no widget has all classes)
selector: '.elementor-1140.elementor-element-14c0aa4'
expected: []
```

## Risk Assessment

### High Risk
- CSS parser changes affect all selector processing
- Regression risk for existing functionality

### Medium Risk
- Performance impact if parsing becomes more complex
- Edge cases with pseudo-selectors and attribute selectors

### Low Risk
- Virtual ancestor logic is isolated and working
- Widget class filtering is independent

### Mitigation
- Comprehensive unit tests for CSS parser
- Integration tests with real-world selectors
- Performance benchmarking before/after
- Feature flag for gradual rollout

## Priority

**CRITICAL** - This is blocking all CSS selector matching for element-specific selectors, which is a core functionality of the widget converter.

## Dependencies

- Virtual ancestor context preservation (✅ COMPLETE)
- Widget class filtering (✅ COMPLETE)
- CSS_Selector_Parser (❌ BROKEN - needs fix)
- Selector_Matcher_Engine (✅ WORKING - waiting for correct parser input)

## Next Steps

1. Investigate `CSS_Selector_Parser::parse()` method
2. Identify where spaces are being collapsed
3. Fix parser to properly handle descendant combinators
4. Add comprehensive parser tests
5. Verify selector matching works correctly
6. Run Playwright tests to confirm styles are applied

