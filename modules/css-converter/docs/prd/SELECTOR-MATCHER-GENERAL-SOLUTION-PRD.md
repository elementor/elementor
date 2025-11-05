# PRD: General Selector Matching Solution

**Version:** 1.0  
**Date:** 2025-01-16  
**Status:** Draft  
**Priority:** P0 - Critical Architecture Refactor  

---

## Executive Summary

The current `Selector_Matcher_Engine` relies on `Elementor_Selector_Pattern_Detector` which hardcodes Elementor-specific logic, creating unnecessary complexity and violating the general-purpose design principle. This PRD proposes removing Elementor-specific pattern detection and implementing a pure, general CSS selector matching solution that works for any CSS selector pattern.

---

## Problem Statement

### Current Issues

1. **Hardcoded Elementor Logic**: `Elementor_Selector_Pattern_Detector` contains hardcoded patterns for:
   - `.elementor-NNNN` (page IDs)
   - `.elementor-element-XXXXXX` (element IDs)
   - `.elementor-kit-NNNN` (kit IDs)
   
2. **Special-Case Handling**: The engine has multiple code paths:
   - Standard matching
   - Elementor-specific pattern matching
   - Partial matching fallback
   - Descendant chain matching (Elementor-specific)
   
3. **Complexity Layer**: Adds an unnecessary abstraction that:
   - Increases maintenance burden
   - Creates coupling to Elementor-specific naming conventions
   - Hides the real problem (general selector matching)

4. **Architectural Violation**: Hardcoding Elementor patterns violates the principle that CSS conversion should be general-purpose.

### Example Problem

**Current approach**:
```php
// Hardcoded detection
if ( $this->pattern_detector->is_elementor_specific_selector( $selector ) ) {
    if ( $this->pattern_detector->is_multi_part_descendant_selector( $selector ) ) {
        $matches = $this->find_widgets_by_descendant_chain( $selector, $widgets );
    }
}
```

**Problem**: This treats `.elementor-element-14c0aa4 .elementor-heading-title` differently from `.container .heading.title`, when they should follow the same matching rules.

---

## Goals

### Primary Goals

1. **Remove Elementor-Specific Hardcoding**: Delete or minimize `Elementor_Selector_Pattern_Detector`
2. **General Selector Matching**: Implement pure CSS selector matching that works for any selector pattern
3. **Preserve Functionality**: Maintain current matching accuracy while simplifying the codebase
4. **Single Code Path**: One unified matching algorithm, not multiple special cases

### Secondary Goals

1. **Improve Maintainability**: Easier to understand and modify
2. **Better Testability**: General selectors are easier to test than Elementor-specific ones
3. **Extensibility**: Easy to add new selector features without special cases

---

## Requirements

### Functional Requirements

#### FR1: General Descendant Selector Matching

**Requirement**: The engine must correctly match complex descendant selectors like:

```css
.one .two.three .four > a
```

**Example HTML Structure**:
```html
<div class="one">
  <div class="something">
    <div class="three four">
      <a id="this">Match this</a>
      <div><a id="that">Don't match</a></div>
    </div>
    <div class="three">
      <!-- No match -->
    </div>
  </div>
</div>
```

**Expected Behavior**:
- `.one .two.three .four > a` should match `#this` (direct child of `.three.four`)
- Should NOT match `#that` (not direct child)
- Should follow standard CSS specificity and combinator rules

#### FR2: Compound Selector Matching

**Requirement**: Correctly handle compound selectors (multiple classes on same element):

```css
.elementor-element.elementor-widget-heading
```

**Expected Behavior**:
- Match only widgets that have BOTH classes
- Treat as single element selector, not descendant

#### FR3: Combinator Support

**Requirement**: Support all CSS combinators:

- **Descendant** (` `): `.parent .child`
- **Direct child** (`>`): `.parent > .child`
- **Adjacent sibling** (`+`): `.prev + .next`
- **General sibling** (`~`): `.prev ~ .next`

#### FR4: Specificity Calculation

**Requirement**: Calculate CSS specificity correctly for any selector:

```css
.elementor-1140 .elementor-element.elementor-element-14c0aa4 .elementor-heading-title
```

**Specificity**: 
- 1 ID (`.elementor-1140` - treated as ID in Elementor context) = 100
- 2 classes (`.elementor-element`, `.elementor-element-14c0aa4`) = 20
- 1 class (`.elementor-heading-title`) = 10
- **Total**: 130

#### FR5: Widget Class Filtering (Concession)

**Requirement**: Elementor widget classes (`.elementor-*`, `.e-con*`) may be filtered out and converted to atomic styles, but selector matching should still work based on widget structure.

**Implementation Note**: Matching should work even if classes are removed, by using:
- Widget type (`widget_type`)
- Element hierarchy (`children` relationships)
- Widget attributes that remain after filtering

### Non-Functional Requirements

#### NFR1: Performance

- Matching should complete in < 10ms for typical page (100 widgets, 1000 CSS rules)
- Use caching for parsed selectors (already implemented)

#### NFR2: Code Quality

- Single responsibility: Match CSS selectors to widgets
- No hardcoded Elementor patterns
- General-purpose, reusable code

#### NFR3: Backward Compatibility

- Must produce same or better matching results as current implementation
- No breaking changes to API (`find_matching_widgets()` signature)

---

## Proposed Solution

### Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│           CSS Selector (any pattern)                     │
│   .one .two.three .four > a                             │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────┐
│         CSS_Selector_Parser (already exists)            │
│   - Parse selector into AST                             │
│   - Handle combinators, compound selectors, etc.        │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────┐
│      Selector_Matcher_Engine (refactored)                │
│   - Standard CSS matching algorithm                     │
│   - No Elementor-specific logic                         │
│   - Works for any selector pattern                      │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────┐
│      Widget_Tree_Navigator (already exists)             │
│   - Traverse widget tree                                │
│   - Find ancestors, siblings, children                 │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ▼
            Matched Widget IDs
```

### Solution Components

#### Component 1: Remove Elementor_Selector_Pattern_Detector

**Action**: Delete or minimize to only widget class detection (for filtering concession)

**Current Responsibilities** (to be removed):
- `is_elementor_specific_selector()` - REMOVE (use general matching)
- `extract_element_ids_from_selector()` - REMOVE (not needed)
- `is_multi_part_descendant_selector()` - REMOVE (all descendants handled generically)
- `extract_descendant_chain()` - REMOVE (parser handles this)
- `remove_page_wrapper_classes()` - REMOVE (not needed)

**Remaining Responsibilities** (if kept):
- `is_page_wrapper_class()` - KEEP (for widget class filtering concession)
- Helper for identifying Elementor widget classes to filter

#### Component 2: Refactor Selector_Matcher_Engine

**Current Flow** (simplified):
```php
1. Try standard matching
2. If Elementor-specific → try Elementor pattern matching
3. If multi-part descendant → try descendant chain matching
4. Fallback to partial matching
```

**New Flow**:
```php
1. Parse selector (CSS_Selector_Parser)
2. Match using standard CSS algorithm:
   - Match last part first (target element)
   - Validate parent chain (ancestors)
   - Check combinators (>, +, ~)
   - Calculate specificity
3. Return matches (no special cases)
```

#### Component 3: Enhanced Standard Matching

**Current**: `find_matching_widgets_standard()` exists but may not handle all cases correctly.

**Enhancement**: Ensure it handles:
- Complex descendant chains: `.one .two.three .four`
- Compound selectors: `.class1.class2.class3`
- Direct child combinators: `.parent > .child`
- Sibling combinators: `.prev + .next`, `.prev ~ .next`
- Multiple classes on same element: `.elementor-element.elementor-widget-heading`

**Implementation Strategy**:
1. Parse selector into AST (already done by `CSS_Selector_Parser`)
2. Extract target part (last part of selector)
3. Find widgets matching target part
4. For each match, validate parent chain:
   - Traverse up widget tree
   - Check each ancestor matches corresponding selector part
   - Respect combinator rules (`>`, `+`, `~`)

#### Component 4: Widget Matching Logic

**Current Issue**: Matching relies on classes that may be filtered out.

**Solution**: Multi-faceted matching approach:

1. **Class-based matching** (primary):
   - Match widgets by classes in `attributes['class']`
   - Works when classes are preserved

2. **Type-based matching** (fallback):
   - If class not found, match by `widget_type`
   - `.elementor-heading-title` → `e-heading` widget type
   - `.elementor-widget-image` → `e-image` widget type

3. **Structure-based matching** (fallback):
   - Use widget hierarchy (`children` relationships)
   - Match by position in tree

**Implementation**:
```php
private function widget_matches_selector_part( array $widget, array $selector_part ): bool {
    // Try class matching first
    if ( $selector_part['type'] === 'class' ) {
        $classes = $widget['attributes']['class'] ?? '';
        if ( $this->widget_has_class( $widget, $selector_part['value'] ) ) {
            return true;
        }
        
        // Fallback: Try widget type matching
        $widget_type = $this->map_class_to_widget_type( $selector_part['value'] );
        if ( $widget_type && ( $widget['widget_type'] ?? '' ) === $widget_type ) {
            return true;
        }
    }
    
    // Element type matching
    if ( $selector_part['type'] === 'element' ) {
        return $this->widget_matches_element( $widget, $selector_part['value'] );
    }
    
    return false;
}
```

---

## Implementation Plan

### Phase 1: Analysis & Testing (Week 1)

**Tasks**:
1. Audit current matching behavior
   - Create test cases for all current Elementor-specific patterns
   - Document what currently works vs. what doesn't
   - Identify edge cases

2. Test general selector matching
   - Test complex selectors: `.one .two.three .four > a`
   - Test compound selectors: `.class1.class2.class3`
   - Test combinators: `>`, `+`, `~`
   - Verify specificity calculation

3. Document current failures
   - What selectors fail to match?
   - Why do they fail?
   - What's the root cause?

**Deliverables**:
- Test suite with current behavior documented
- List of breaking changes (if any)
- Performance benchmarks

### Phase 2: Refactor Core Matching (Week 2)

**Tasks**:
1. Enhance `find_matching_widgets_standard()`
   - Ensure it handles all combinator types
   - Fix compound selector matching
   - Improve descendant chain validation

2. Remove Elementor-specific code paths
   - Remove calls to `Elementor_Selector_Pattern_Detector`
   - Remove `find_widgets_by_element_id_pattern()`
   - Remove `find_widgets_by_descendant_chain()` (merge into standard matching)

3. Update `find_matching_widgets_intelligently()`
   - Single code path: standard matching only
   - Remove Elementor-specific branching
   - Keep fallback logic minimal (if needed)

**Deliverables**:
- Refactored `Selector_Matcher_Engine`
- All tests passing
- Performance maintained or improved

### Phase 3: Remove Pattern Detector (Week 3)

**Tasks**:
1. Minimize `Elementor_Selector_Pattern_Detector`
   - Keep only widget class identification (for filtering concession)
   - Remove all selector matching logic
   - Rename to `Widget_Class_Identifier` (if kept)

2. Update all callers
   - Remove references to pattern detector methods
   - Update `Widget_Class_Processor` if needed

3. Delete unused code
   - Remove methods that are no longer called
   - Clean up dead code

**Deliverables**:
- Minimized or deleted pattern detector
- No breaking changes to API
- Clean codebase

### Phase 4: Testing & Validation (Week 4)

**Tasks**:
1. Comprehensive testing
   - Test all current use cases
   - Test new general selectors
   - Edge case testing

2. Performance validation
   - Benchmark matching performance
   - Ensure no regressions

3. Integration testing
   - Test with real-world CSS
   - Test with Elementor sites
   - Test with non-Elementor CSS

**Deliverables**:
- Complete test suite
- Performance benchmarks
- Validation report

---

## Success Criteria

### Must Have

1. ✅ **General Selector Support**: `.one .two.three .four > a` matches correctly
2. ✅ **No Elementor Hardcoding**: No special cases for `.elementor-element-*` patterns
3. ✅ **Backward Compatibility**: All current matching behavior preserved
4. ✅ **Code Simplification**: Reduced complexity, single code path
5. ✅ **Performance**: No performance regression

### Nice to Have

1. ⭐ **Better Error Messages**: Clear errors when matching fails
2. ⭐ **Matching Diagnostics**: Debug info for why selectors match/don't match
3. ⭐ **Selector Validation**: Validate selectors before matching

---

## Risks & Mitigations

### Risk 1: Breaking Existing Functionality

**Risk**: Removing Elementor-specific logic might break current matching.

**Mitigation**:
- Comprehensive test suite before refactoring
- Incremental refactoring (one piece at a time)
- Keep old code until new code is validated

### Risk 2: Performance Regression

**Risk**: General matching might be slower than optimized Elementor-specific paths.

**Mitigation**:
- Benchmark before and after
- Optimize hot paths
- Use caching (already implemented)

### Risk 3: Missing Edge Cases

**Risk**: General solution might miss edge cases that Elementor-specific code handled.

**Mitigation**:
- Thorough testing with real-world CSS
- Keep tests for edge cases
- Iterative improvement

---

## Open Questions

1. **Widget Class Filtering**: How do we match selectors when classes are filtered out?
   - **Option A**: Match before filtering (preserve classes during matching phase)
   - **Option B**: Match by widget type/attributes after filtering
   - **Option C**: Hybrid approach

2. **Page Wrapper Classes**: Should `.elementor-1140` be treated specially?
   - **Current**: Yes, removed during matching
   - **Proposed**: No, treat as regular class

3. **Specificity Calculation**: How to handle Elementor's custom specificity rules?
   - **Option A**: Use standard CSS specificity
   - **Option B**: Keep Elementor-specific rules (if any)

---

## Appendix

### Current Code Dependencies

**Files that use `Elementor_Selector_Pattern_Detector`**:
- `selector-matcher-engine.php` (primary user)
- Possibly others (need to audit)

**Files that might need updates**:
- `widget-class-processor.php` (uses selector matching)
- `unified-css-processor.php` (orchestrates matching)
- Tests

### Related Documentation

- `docs/IMPLEMENTATION-COMPLETE-selector-fix.md` - Previous selector fixes
- `docs/PRD-Complex-Selector-Mapping-Improvements.md` - Related PRD
- `docs/architecture/UNIFIED-STYLE-ARCHITECTURE-ANALYSIS.md` - Architecture context

---

**Document Version**: 1.0  
**Last Updated**: 2025-01-16  
**Next Review**: After Phase 1 completion

