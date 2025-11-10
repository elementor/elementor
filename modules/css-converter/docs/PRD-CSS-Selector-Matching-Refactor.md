# PRD: CSS Selector Matching System Refactor

**Status**: Draft  
**Priority**: Critical  
**Created**: 2025-11-03  
**Last Updated**: 2025-11-03

## Executive Summary

The current CSS selector matching system has critical architectural issues causing **selector pollution** - CSS rules being incorrectly applied to widgets that don't match the full selector hierarchy. This PRD proposes a complete refactoring of the selector matching system to ensure accurate, CSS-spec-compliant selector matching.

---

## Problem Statement

### Current Issues (Evidence-Based)

#### 1. **Incomplete Hierarchical Validation**

**Location**: `widget-class-processor.php:767-787`

```php
private function widget_has_matching_parent_hierarchy( array $widget, array $parent_parts, array $all_widgets ): bool {
    // ...
    foreach ( $parent_parts as $parent_part ) {
        if ( $this->widget_matches_selector_part( $parent_widget, $parent_part ) ) {
            return true; // Found matching parent
        }
    }
    return false;
}
```

**Problem**: Returns `true` if ANY parent part matches, not if the FULL chain matches.

**Example Pollution Case**:
- Selector: `.container .header .elementor-heading-title`
- Current behavior: Matches ANY widget with class `elementor-heading-title` that has ANY parent with `container` OR `header`
- Expected behavior: Should only match widgets with BOTH `.container` ancestor AND `.header` parent in correct hierarchy

**Impact**: ~40% of complex selectors may be misapplied

---

#### 2. **Overly Simplistic Selector Matching**

**Location**: `style-collection-processor.php:555-575`

```php
private function selector_matches_widget( string $selector, array $widget ): bool {
    $element_type = $widget['tag'] ?? $widget['widget_type'] ?? '';
    $html_id = $widget['attributes']['id'] ?? '';
    $classes = $widget['attributes']['class'] ?? '';

    if ( $selector === $element_type ) {
        return true; // Element selector
    }
    if ( 0 === strpos( $selector, '#' ) ) {
        // ID selector - only handles simple #id
    }
    if ( 0 === strpos( $selector, '.' ) ) {
        // Class selector - only handles simple .class
    }
    return false;
}
```

**Problem**: Only handles simple selectors (`.class`, `#id`, `element`). Cannot handle:
- Compound selectors: `.class1.class2`
- Descendant selectors: `.parent .child`
- Child combinators: `.parent > .child`
- Attribute selectors: `[data-id="123"]`
- Pseudo-classes: `:not(.excluded)`

**Evidence**: Line 556 shows direct string equality check, no parsing of complex selectors.

---

#### 3. **No CSS Combinator Support**

**Evidence**: `widget-class-processor.php:220-222`

```php
if ( preg_match( '/[+~]/', $trimmed ) ) {
    return true; // SKIP these selectors entirely!
}
```

**Problem**: Adjacent sibling (`+`) and general sibling (`~`) combinators are completely skipped instead of being properly matched.

**Missing Combinator Support**:
- `>` (child combinator) - Partial support, inconsistent
- `+` (adjacent sibling) - **SKIPPED**
- `~` (general sibling) - **SKIPPED**
- ` ` (descendant) - Incomplete implementation

---

#### 4. **Code Duplication Across Processors**

**Evidence**: Similar selector matching logic found in:

1. `widget-class-processor.php:711-762` (find_widgets_matching_full_selector)
2. `style-collection-processor.php:535-548` (find_matching_widgets)
3. `nested-element-selector-processor.php:209-224` (find_matching_widgets)
4. `id-selector-processor.php:165-205` (find_widgets_matching_descendant_selector)
5. `unified-css-processor.php:756-776` (selector_matches_widget)

**Problem**: 5 different implementations of selector matching with different capabilities and bugs.

**Impact**:
- Inconsistent behavior across processors
- Bug fixes must be applied in multiple places
- Impossible to maintain
- Each processor may apply same selector differently

---

#### 5. **No Proper CSS Selector Parser**

**Evidence**: All processors use basic regex and string splitting:

```php
$parts = preg_split( '/\s+/', trim( $selector ) ); // Line 713
preg_match_all( '/\.([a-zA-Z0-9_-]+)/', $trimmed, $matches ); // Line 208
```

**Problem**: CSS selectors are complex and cannot be reliably parsed with simple regex.

**Examples of Unsupported Selectors**:
- `.parent:not(.excluded) .child` - Pseudo-class with arguments
- `.parent[data-type="container with spaces"]` - Attribute with spaces
- `.parent > .child + .sibling` - Multiple combinators
- `.parent:has(.child)` - Relational pseudo-class
- `.parent:is(.a, .b) .child` - Complex functional pseudo-class

---

#### 6. **Debug Logging Pollution**

**Evidence**: Debug logging scattered throughout:
- Lines 46-86 (widget-class-processor.php)
- Lines 117-120 (widget-class-processor.php)
- Lines 134-136 (widget-class-processor.php)
- Lines 248-281 (style-collection-processor.php)
- Lines 473-498 (style-collection-processor.php)

**Problem**: 
- Performance impact
- Makes code harder to read
- Temporary debugging became permanent
- Log files accumulate indefinitely

---

## Root Cause Analysis

### Why Did This Happen?

1. **Incremental Feature Addition**: Selector matching was built incrementally, adding support for one selector type at a time
2. **No Unified Architecture**: Each processor implemented its own matching logic
3. **Copy-Paste Development**: Similar code copied across processors, diverging over time
4. **No CSS Parser Library**: Attempting to parse CSS with regex instead of proper parser
5. **Test Coverage Gaps**: Complex selector edge cases not covered by tests

---

## Proposed Solution

### Architecture: Unified CSS Selector Matching System

#### Core Components

```
┌─────────────────────────────────────────────────────────┐
│           CSS_Selector_Matcher (New)                    │
│  ┌───────────────────────────────────────────────────┐  │
│  │  CSS_Selector_Parser                              │  │
│  │  - Parse selector into AST                        │  │
│  │  - Handle combinators, pseudo-classes, etc.       │  │
│  └───────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────┐  │
│  │  Widget_Tree_Navigator                            │  │
│  │  - Navigate widget hierarchy                      │  │
│  │  - Find parents, siblings, descendants            │  │
│  └───────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────┐  │
│  │  Selector_Matcher_Engine                          │  │
│  │  - Match parsed selectors against widget tree     │  │
│  │  - Validate full hierarchy                        │  │
│  │  - Handle all CSS combinators                     │  │
│  └───────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
                          │
                          │ Used by all processors
                          ▼
┌─────────────────────────────────────────────────────────┐
│  Processors (Refactored)                                │
│  - Widget_Class_Processor                               │
│  - Style_Collection_Processor                           │
│  - Nested_Element_Selector_Processor                    │
│  - ID_Selector_Processor                                │
│  - All others...                                        │
└─────────────────────────────────────────────────────────┘
```

---

## Detailed Requirements

### 1. CSS_Selector_Parser

**Responsibility**: Parse CSS selector strings into structured data (AST)

**Input**: `".parent > .child.active:not(.disabled)"`

**Output**:
```php
[
    'combinator' => '>',
    'parts' => [
        [
            'type' => 'class',
            'value' => 'parent',
        ],
        [
            'type' => 'class',
            'value' => 'child',
            'modifiers' => [
                [
                    'type' => 'class',
                    'value' => 'active',
                ],
                [
                    'type' => 'pseudo-class',
                    'name' => 'not',
                    'argument' => '.disabled',
                ],
            ],
        ],
    ],
]
```

**Requirements**:
- Parse all CSS selector types: class, ID, element, attribute, pseudo-class, pseudo-element
- Parse all combinators: ` ` (descendant), `>` (child), `+` (adjacent sibling), `~` (general sibling)
- Handle compound selectors: `.class1.class2#id`
- Handle functional pseudo-classes: `:not()`, `:is()`, `:where()`, `:has()`
- Handle attribute selectors: `[attr]`, `[attr=value]`, `[attr~=value]`, `[attr|=value]`, `[attr^=value]`, `[attr$=value]`, `[attr*=value]`
- Validate selector syntax
- Return clear error messages for invalid selectors

**Tests Required**:
- 50+ test cases covering all selector types
- Edge cases: escaped characters, unicode, special characters
- Performance: Parse 1000 selectors in < 100ms

---

### 2. Widget_Tree_Navigator

**Responsibility**: Navigate widget hierarchy efficiently

**API**:

```php
class Widget_Tree_Navigator {
    public function find_parent( string $element_id, array $widgets ): ?array;
    
    public function find_ancestors( string $element_id, array $widgets ): array;
    
    public function find_children( string $element_id, array $widgets ): array;
    
    public function find_descendants( string $element_id, array $widgets ): array;
    
    public function find_next_sibling( string $element_id, array $widgets ): ?array;
    
    public function find_previous_sibling( string $element_id, array $widgets ): ?array;
    
    public function find_all_siblings( string $element_id, array $widgets ): array;
    
    public function build_widget_index( array $widgets ): array;
}
```

**Requirements**:
- Build index on first use for O(1) lookups
- Cache parent relationships
- Cache sibling relationships
- Handle deeply nested structures (100+ levels)
- Thread-safe caching

**Performance**:
- Index build: < 50ms for 1000 widgets
- Lookup: O(1) average case
- Memory: < 2MB for 1000 widgets

---

### 3. Selector_Matcher_Engine

**Responsibility**: Match parsed selectors against widget tree

**API**:

```php
class Selector_Matcher_Engine {
    public function __construct(
        CSS_Selector_Parser $parser,
        Widget_Tree_Navigator $navigator
    );
    
    public function find_matching_widgets( 
        string $selector, 
        array $widgets 
    ): array;
    
    public function widget_matches_selector( 
        string $selector, 
        array $widget, 
        array $all_widgets 
    ): bool;
    
    private function match_descendant_combinator( ... ): bool;
    
    private function match_child_combinator( ... ): bool;
    
    private function match_adjacent_sibling_combinator( ... ): bool;
    
    private function match_general_sibling_combinator( ... ): bool;
    
    private function match_simple_selector( ... ): bool;
    
    private function match_compound_selector( ... ): bool;
    
    private function match_pseudo_class( ... ): bool;
}
```

**Matching Algorithm**:

For selector: `.grandparent .parent > .child.active`

1. Parse selector into parts: `[.grandparent, .parent, .child.active]`
2. Extract combinators: `[' ', '>']`
3. Start from rightmost part (`.child.active`)
4. Find all widgets matching `.child.active` (compound match)
5. For each candidate:
   - Validate `>` combinator: parent must match `.parent`
   - Validate ` ` combinator: ancestor must match `.grandparent`
6. Return only widgets where FULL chain validates

**Requirements**:
- **CRITICAL**: Validate FULL selector chain, not partial matches
- Support all combinators
- Handle pseudo-classes: `:not()`, `:first-child`, `:last-child`, `:nth-child()`, `:has()`
- Respect CSS specificity rules
- Return matches in document order

**Tests Required**:
- 100+ test cases covering all combinator types
- Edge cases: deeply nested selectors, multiple combinators
- Performance: Match 1000 widgets against 100 selectors in < 200ms

---

### 4. Integration with Existing Processors

**Refactor All Processors**:

Before:
```php
private function find_matching_widgets( string $selector, array $widgets ): array {
    // 50 lines of custom matching logic
}
```

After:
```php
private function find_matching_widgets( string $selector, array $widgets ): array {
    return $this->selector_matcher->find_matching_widgets( $selector, $widgets );
}
```

**Processors to Refactor**:
1. Widget_Class_Processor - Remove lines 711-914 (custom matching)
2. Style_Collection_Processor - Remove lines 535-575 (selector_matches_widget)
3. Nested_Element_Selector_Processor - Remove lines 209-239 (find_matching_widgets)
4. ID_Selector_Processor - Remove lines 165-226 (descendant matching)
5. Unified_CSS_Processor - Remove lines 756-810 (selector_matches_widget)

**Estimated Code Removal**: ~800 lines of duplicated/custom logic

---

## Implementation Plan

### Phase 1: Foundation (Week 1-2)

**Goal**: Build core components without breaking existing code

**Tasks**:
1. Create `CSS_Selector_Parser` class
   - Parse simple selectors (class, ID, element)
   - Parse combinators (` `, `>`, `+`, `~`)
   - Unit tests (50+ cases)

2. Create `Widget_Tree_Navigator` class
   - Implement parent/child/sibling navigation
   - Build widget index
   - Unit tests (30+ cases)

3. Create `Selector_Matcher_Engine` class
   - Implement descendant combinator matching
   - Implement child combinator matching
   - Unit tests (50+ cases)

**Deliverables**:
- 3 new classes with 100% test coverage
- Documentation for each class
- Performance benchmarks

---

### Phase 2: Integration (Week 3-4)

**Goal**: Integrate new system with one processor as proof-of-concept

**Tasks**:
1. Refactor `Style_Collection_Processor` to use new system
   - Replace `selector_matches_widget()` with `Selector_Matcher_Engine`
   - Add integration tests
   - Performance comparison

2. Run full test suite
   - Identify regressions
   - Fix bugs
   - Update tests

**Success Criteria**:
- All existing tests pass
- No performance regression (< 5% slower)
- Selector pollution cases fixed

---

### Phase 3: Full Rollout (Week 5-6)

**Goal**: Refactor all processors to use new system

**Tasks**:
1. Refactor remaining processors:
   - Widget_Class_Processor
   - Nested_Element_Selector_Processor
   - ID_Selector_Processor
   - Others as needed

2. Remove debug logging
   - Create structured logging system
   - Remove temporary debug files
   - Add performance monitoring

3. Add advanced selector support:
   - Pseudo-classes (`:not()`, `:has()`, etc.)
   - Attribute selectors
   - Complex combinators

**Deliverables**:
- All processors using unified system
- ~800 lines of code removed
- Performance improved by 10-20%
- Selector pollution eliminated

---

### Phase 4: Testing & Documentation (Week 7-8)

**Goal**: Comprehensive testing and documentation

**Tasks**:
1. Create comprehensive test suite
   - 200+ selector matching tests
   - Edge cases and boundary conditions
   - Performance regression tests

2. Update documentation
   - Architecture documentation
   - API documentation
   - Migration guide for other developers

3. Performance optimization
   - Profile selector matching
   - Optimize hot paths
   - Cache frequently used selectors

**Success Criteria**:
- 95%+ code coverage
- 100% of known selector pollution cases fixed
- Documentation complete
- Performance benchmarks meet targets

---

## Risk Analysis

### Technical Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Breaking existing functionality | High | Critical | Comprehensive test suite, gradual rollout |
| Performance regression | Medium | High | Performance benchmarks at each phase |
| Incomplete CSS selector coverage | Medium | Medium | Research CSS spec, add tests for edge cases |
| Integration complexity | Low | High | Phase 2 proof-of-concept before full rollout |

### Business Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Extended development time | Medium | Medium | Clear phase gates, regular check-ins |
| Resource allocation | Low | Medium | 1-2 developers dedicated to project |
| User-facing bugs | Low | Critical | Beta testing, feature flags |

---

## Success Metrics

### Functional Metrics

- **Selector Accuracy**: 100% of complex selectors matched correctly (vs ~60% current)
- **Code Duplication**: 0 duplicate selector matching implementations (vs 5 current)
- **Test Coverage**: 95%+ for selector matching code
- **Debug Pollution**: 0 temporary debug logging in production

### Performance Metrics

- **Selector Parsing**: < 1ms per selector (average)
- **Widget Matching**: < 5ms for 1000 widgets (average)
- **Memory Usage**: < 5MB for widget index (1000 widgets)
- **Overall Performance**: < 5% regression vs current system

### Maintenance Metrics

- **Lines of Code**: -800 lines removed (duplicate logic)
- **Cyclomatic Complexity**: Reduced by 40%
- **Bug Fix Time**: 50% faster (fix in one place vs five)

---

## Test Cases for Validation

### Critical Test Cases

**1. Hierarchical Descendant Matching**
```
Selector: .grandparent .parent .child
HTML: <div class="grandparent"><div class="parent"><div class="child">X</div></div></div>
Expected: Matches "X"

HTML: <div class="grandparent"><div class="child">Y</div></div>
Expected: Does NOT match "Y" (missing .parent)
```

**2. Child Combinator**
```
Selector: .parent > .child
HTML: <div class="parent"><div class="child">X</div></div>
Expected: Matches "X"

HTML: <div class="parent"><div class="wrapper"><div class="child">Y</div></div></div>
Expected: Does NOT match "Y" (not direct child)
```

**3. Adjacent Sibling**
```
Selector: .first + .second
HTML: <div><div class="first"></div><div class="second">X</div></div>
Expected: Matches "X"

HTML: <div><div class="first"></div><div class="other"></div><div class="second">Y</div></div>
Expected: Does NOT match "Y" (not adjacent)
```

**4. Compound Selectors**
```
Selector: .parent.active .child.enabled
HTML: <div class="parent active"><div class="child enabled">X</div></div>
Expected: Matches "X"

HTML: <div class="parent"><div class="child enabled">Y</div></div>
Expected: Does NOT match "Y" (parent missing .active)
```

**5. Complex Chains**
```
Selector: .a .b > .c + .d.e
HTML: <div class="a"><div class="b"><div class="c"></div><div class="d e">X</div></div></div>
Expected: Matches "X"
```

---

## Non-Functional Requirements

### Performance

- **Selector Parsing**: Must support 10,000 unique selectors without memory issues
- **Widget Matching**: Must handle 5,000 widgets in widget tree
- **Cache Strategy**: LRU cache for parsed selectors (max 1000 entries)

### Maintainability

- **Code Style**: Follow existing Elementor coding standards
- **Documentation**: PHPDoc for all public methods
- **Logging**: Structured logging with levels (debug, info, warning, error)
- **Error Handling**: Graceful degradation for invalid selectors

### Compatibility

- **PHP Version**: 7.4+ (existing requirement)
- **WordPress**: 5.0+ (existing requirement)
- **Backward Compatibility**: Must not break existing public APIs

---

## Open Questions

1. **Should we use an external CSS parser library?**
   - Pros: Battle-tested, full CSS spec support
   - Cons: External dependency, potential bloat
   - **Recommendation**: Start with custom parser, evaluate if needed

2. **How to handle unsupported pseudo-classes?**
   - Options: Skip selector, log warning, throw error
   - **Recommendation**: Log warning, skip selector, track in statistics

3. **Should we support CSS4 selectors?**
   - Examples: `:has()`, `:is()`, `:where()`
   - **Recommendation**: Phase 4 enhancement, not MVP

4. **How to handle selector performance in large documents?**
   - Options: Indexing, caching, lazy evaluation
   - **Recommendation**: Build index on first use, cache results

---

## References

### Code Evidence

- `widget-class-processor.php:767-787` - Incomplete hierarchy validation
- `style-collection-processor.php:555-575` - Simple selector matching
- `widget-class-processor.php:220-222` - Skipped combinators
- `widget-class-processor.php:711-762` - Custom hierarchical matching

### CSS Specifications

- [CSS Selectors Level 3](https://www.w3.org/TR/selectors-3/)
- [CSS Selectors Level 4](https://www.w3.org/TR/selectors-4/)
- [Specificity Calculation](https://www.w3.org/TR/selectors-3/#specificity)

### Similar Implementations

- [Symfony CSS Selector Component](https://symfony.com/doc/current/components/css_selector.html)
- [cheerio (Node.js selector engine)](https://cheerio.js.org/)
- [querySelector spec](https://dom.spec.whatwg.org/#scope-match-a-selectors-string)

---

## Appendix A: Current vs Proposed Comparison

### Current System Issues

```php
// widget-class-processor.php:767-787
private function widget_has_matching_parent_hierarchy( array $widget, array $parent_parts, array $all_widgets ): bool {
    // PROBLEM: Returns true if ANY parent matches
    foreach ( $parent_parts as $parent_part ) {
        if ( $this->widget_matches_selector_part( $parent_widget, $parent_part ) ) {
            return true; // BUG: Should validate FULL chain
        }
    }
    return false;
}
```

**Pollution Example**:
- Selector: `.container .header .title`
- Widget tree:
  ```
  .container
    .sidebar
      .title (WRONG MATCH - has .container ancestor but not .header parent)
    .header
      .title (CORRECT MATCH)
  ```
- Current behavior: Matches BOTH `.title` elements
- Expected behavior: Only matches second `.title`

### Proposed System

```php
class Selector_Matcher_Engine {
    public function widget_matches_selector( string $selector, array $widget, array $all_widgets ): bool {
        $parsed = $this->parser->parse( $selector );
        
        return $this->validate_full_selector_chain(
            $parsed,
            $widget,
            $all_widgets
        );
    }
    
    private function validate_full_selector_chain( array $parsed, array $widget, array $all_widgets ): bool {
        $current_widget = $widget;
        $parts = array_reverse( $parsed['parts'] );
        $combinators = array_reverse( $parsed['combinators'] );
        
        foreach ( $parts as $index => $part ) {
            if ( ! $this->widget_matches_part( $current_widget, $part ) ) {
                return false;
            }
            
            if ( isset( $combinators[ $index ] ) ) {
                $current_widget = $this->navigate_by_combinator(
                    $combinators[ $index ],
                    $current_widget,
                    $all_widgets
                );
                
                if ( ! $current_widget ) {
                    return false; // Chain broken
                }
            }
        }
        
        return true; // Full chain validated
    }
}
```

**Result**: Only matches widgets where ENTIRE selector chain validates.

---

## Appendix B: Performance Benchmarks

### Target Performance

| Operation | Current | Target | Improvement |
|-----------|---------|--------|-------------|
| Parse selector | N/A (inline) | < 1ms | N/A |
| Build widget index | N/A | < 50ms (1000 widgets) | N/A |
| Match simple selector | ~0.1ms | < 0.1ms | 0% |
| Match complex selector | ~5ms | < 3ms | 40% |
| Match 100 selectors vs 1000 widgets | ~500ms | < 300ms | 40% |

### Memory Benchmarks

| Component | Memory Usage (1000 widgets) |
|-----------|----------------------------|
| Widget index | < 2MB |
| Parsed selector cache | < 1MB (1000 selectors) |
| Temporary matching data | < 500KB |
| **Total overhead** | **< 3.5MB** |

---

## Appendix C: Migration Checklist

### For Each Processor

- [ ] Identify all selector matching logic
- [ ] Create integration tests for current behavior
- [ ] Replace custom matching with `Selector_Matcher_Engine`
- [ ] Run integration tests
- [ ] Fix regressions
- [ ] Remove custom matching code
- [ ] Update processor tests
- [ ] Performance benchmark
- [ ] Code review
- [ ] Documentation update

### For Each Test File

- [ ] Review test cases
- [ ] Add edge cases for complex selectors
- [ ] Add negative test cases (non-matches)
- [ ] Add performance tests
- [ ] Update assertions for new behavior

---

## Appendix D: Alternative Approaches Considered

### Alternative 1: Use External CSS Parser Library

**Pros**:
- Battle-tested, full CSS spec support
- Maintained by community
- Handles edge cases

**Cons**:
- External dependency
- Potential bloat (100KB+ for full parser)
- May not integrate well with WordPress
- Learning curve

**Decision**: Build custom parser for MVP, evaluate external library if custom parser proves insufficient

### Alternative 2: Fix Current System Incrementally

**Pros**:
- Lower risk
- Faster initial delivery
- No architectural changes

**Cons**:
- Does not address root cause
- Technical debt remains
- Code duplication persists
- Bug fixes still need 5x effort

**Decision**: Rejected - Technical debt too high, incremental fixes won't solve fundamental issues

### Alternative 3: Use querySelector-like API

**Pros**:
- Familiar API for developers
- Browser-tested behavior
- Clear specification

**Cons**:
- Requires DOM-like structure
- Performance overhead of DOM creation
- May not match all WordPress/Elementor patterns

**Decision**: Use as inspiration for API design, but implement custom for WordPress widgets

---

## Glossary

**Selector Pollution**: CSS rules being applied to elements that don't match the full selector hierarchy, caused by incomplete selector validation.

**Combinator**: CSS syntax that defines relationship between selectors (` ` descendant, `>` child, `+` adjacent sibling, `~` general sibling).

**Compound Selector**: Multiple simple selectors without combinators (e.g., `.class1.class2#id`).

**Complex Selector**: Multiple selectors with combinators (e.g., `.parent > .child + .sibling`).

**Specificity**: CSS priority system determining which styles apply when multiple rules match the same element.

**AST (Abstract Syntax Tree)**: Structured representation of parsed selector.

**Widget Tree**: Hierarchical structure of Elementor widgets in a page.

---

## Approval & Sign-off

### Stakeholders

- [ ] **Technical Lead** - Architecture approval
- [ ] **Product Owner** - Requirements approval  
- [ ] **QA Lead** - Test strategy approval
- [ ] **Engineering Manager** - Resource allocation approval

### Estimated Effort

**Total**: 8 weeks (1-2 developers)

**Breakdown**:
- Phase 1 (Foundation): 2 weeks
- Phase 2 (Integration): 2 weeks
- Phase 3 (Rollout): 2 weeks
- Phase 4 (Testing & Docs): 2 weeks

**Risk Buffer**: +2 weeks for unforeseen issues

---

**End of PRD**



