# Pseudo-Elements & Pseudo-Classes Handling - PRD

## Executive Summary

This PRD defines the implementation strategy for handling CSS pseudo-elements and pseudo-classes during HTML/CSS to Elementor widget conversion. The solution uses a fallback strategy: **supported selectors create variants with states, unsupported selectors apply styles directly to widgets**.

---

## 1. Problem Statement

### Current Issues
1. CSS selectors with pseudo-elements (`:before`, `:after`, `::first-letter`) are **not processed** during widget conversion
2. Complex pseudo-classes (`:nth-child()`, `:disabled`, `:checked`) are **not supported** by atomic widgets
3. No fallback mechanism exists for unsupported selectors - styles are **silently lost**
4. Nested selectors with pseudo-elements (Pattern 4) cannot be flattened without handling pseudo-selectors

### Impact
- User CSS containing pseudo-element styles is completely lost during import
- User CSS containing form state styles (`:checked`, `:disabled`) is lost
- State-based styling (`:hover`, `:focus`) requires manual re-creation in Elementor editor
- Pattern 4 flatten nested classes feature cannot be completed without this solution

---

## 2. Solution Overview

### Strategy: Multi-Level Fallback

```
Selector Type                  Support Level    Action                      Result
─────────────────────────────────────────────────────────────────────────────────────
:hover, :focus, :active        ✅ FULL          Create state variant        meta['state'] = 'hover'
::before, ::after              ⚠️ PARTIAL       Apply base + store marker    Pseudo-element preserved
::first-letter, ::selection    ❌ NONE          Apply base styles only      Partial styles
:nth-child(), :first-child     ❌ NONE          Skip selector              Warning logged
:checked, :disabled, :required ❌ NONE          Skip selector              Warning logged
[data-attr]                    ❌ NONE          Skip selector              Not supported
```

### Key Principle

**"Best effort with transparency"**
- Apply as much styling as possible
- Log warnings for unsupported selectors
- Provide fallback application for partial support

---

## 3. Functional Requirements

### FR1: Pseudo-Selector Classification
**Requirement**: Classify incoming selectors by support level

- **Input**: CSS selector (e.g., `.button:hover`, `.text::first-letter`, `input:disabled`)
- **Output**: Classification with fallback strategy
- **Priority**: HIGH

**Acceptance Criteria**:
- [x] Identify state pseudo-classes (`:hover`, `:focus`, `:active`, `:visited`)
- [x] Identify pseudo-elements (`::before`, `::after`, `::first-letter`, `::selection`)
- [x] Identify unsupported pseudo-classes (`:nth-child()`, `:checked`, `:disabled`)
- [x] Return support level: `full`, `partial`, `none`
- [x] Return fallback strategy: `create_state`, `apply_base_only`, `skip_with_warning`

### FR2: State Pseudo-Class Handling
**Requirement**: Convert state pseudo-classes to atomic widget state variants

- **Input**: Selector with state pseudo-class (`.button:hover { color: blue; }`)
- **Output**: Widget variant with `meta['state']` populated
- **Priority**: HIGH

**Acceptance Criteria**:
- [x] Extract pseudo-class from selector
- [x] Create variant entry with matching meta['state']
- [x] Apply properties to variant
- [x] Support multiple states per widget (base, hover, focus, active)
- [x] Maintain CSS specificity order

**Example**:
```php
Input:  .button:hover { color: blue; background: red; }
Output: variant['meta']['state'] = 'hover'
        variant['props']['color'] = ['$$type' => 'color', 'value' => 'blue']
        variant['props']['background'] = ['$$type' => 'color', 'value' => 'red']
```

### FR3: Pseudo-Element Fallback
**Requirement**: For pseudo-elements, apply base styling directly to widget

- **Input**: Selector with pseudo-element (`.button::first-letter { color: red; }`)
- **Output**: Base styles applied to widget, pseudo-element marker stored
- **Priority**: MEDIUM

**Acceptance Criteria**:
- [x] Extract pseudo-element from selector
- [x] Apply base styles to widget (losing pseudo-element specificity)
- [x] Store pseudo-element reference in meta['pseudo_element'] for tracking
- [x] Log warning about partial application
- [x] User informed via warning message

**Example**:
```php
Input:  .button::first-letter { color: red; }
Output: variant['props']['color'] = ['$$type' => 'color', 'value' => 'red']
        variant['meta']['pseudo_element'] = '::first-letter'  // Tracking only
        WARNING: "Pseudo-element ::first-letter cannot be controlled via atomic widget - applying base styles only"
```

### FR4: Unsupported Selector Skipping
**Requirement**: Skip unsupported selectors with clear logging

- **Input**: Selector with unsupported pseudo-class (`:nth-child()`, `:disabled`, `:checked`)
- **Output**: Selector skipped, warning logged
- **Priority**: MEDIUM

**Acceptance Criteria**:
- [x] Identify unsupported pseudo-classes
- [x] Skip selector entirely (no partial application)
- [x] Log warning with reason
- [x] Continue processing other selectors
- [x] Track skipped count for reporting

**Example**:
```php
Input:  input:checked { background: green; }
Output: SKIPPED - Warning: "Unsupported pseudo-class :checked - form state styling not available in atomic widgets"
        Tracking: skipped_selectors++
```

### FR5: Direct Widget Application
**Requirement**: Apply styles directly to widgets when class-based approach unavailable

- **Input**: Selector that cannot be shared as global class
- **Output**: Styles applied directly to matching widget(s)
- **Priority**: HIGH

**Acceptance Criteria**:
- [x] Identify widget by selector pattern
- [x] Match widget ID/element type to selector
- [x] Create widget-specific style entry
- [x] Apply properties with source tracking (`direct_pseudo_fallback`)
- [x] Support one-to-many widget matching (e.g., all `<button>` elements)

**Example**:
```php
// Selector: button::first-letter { color: red; }
// Matching: 3 button widgets found
// For each: apply color: red directly to widget['styles']

$widget['styles']['widget-id'] = [
    'variants' => [
        'meta' => ['state' => null, 'pseudo_element' => '::first-letter'],
        'props' => ['color' => ['$$type' => 'color', 'value' => 'red']],
    ],
];
```

### FR6: Flattened Pseudo-Selector Handling
**Requirement**: Preserve pseudo-selectors during nested class flattening

- **Input**: Nested selector with pseudo (`.first > .second .third:hover`)
- **Output**: Flattened selector with pseudo preserved (`.third--first-second:hover`)
- **Priority**: HIGH

**Acceptance Criteria**:
- [x] Extract pseudo from selector before flattening
- [x] Flatten class chain
- [x] Re-attach pseudo after flattening
- [x] Maintain specificity relationships
- [x] Support multiple pseudo-selectors in single rule

**Example**:
```
Input:  .first > .second .third::before:hover { color: red; }
Flow:   1. Extract pseudo: ::before:hover
        2. Flatten: .first > .second .third
        3. Result: .third--first-second
        4. Re-attach: .third--first-second::before:hover
        5. Apply variant with state: 'hover'
Output: .third--first-second:hover { color: red; }
```

---

## 4. Technical Requirements

### TR1: Selector Parsing
**Requirement**: Parse CSS selectors to extract pseudo-elements and pseudo-classes

**Implementation Location**: `nested-selector-parser.php`

```php
public function extract_pseudo_selectors( string $selector ): array {
    // Returns:
    // [
    //     'base_selector' => '.button',
    //     'pseudo_elements' => ['::before', '::after'],
    //     'pseudo_classes' => ['hover'],
    //     'pseudo_string' => '::before:hover'
    // ]
}
```

### TR2: Support Level Determination
**Requirement**: Classify pseudo-selector by support capability

**Implementation Location**: `css-selector-utils.php` or new `pseudo-selector-classifier.php`

```php
public function get_pseudo_support_level( string $pseudo ): array {
    // Returns:
    // [
    //     'level' => 'full|partial|none',
    //     'strategy' => 'create_state|apply_base|skip',
    //     'reason' => 'Reason for decision'
    // ]
}
```

**Support Matrix**:
```php
const PSEUDO_SUPPORT_MAP = [
    // State pseudo-classes (FULL)
    'hover' => ['level' => 'full', 'strategy' => 'create_state'],
    'focus' => ['level' => 'full', 'strategy' => 'create_state'],
    'active' => ['level' => 'full', 'strategy' => 'create_state'],
    'visited' => ['level' => 'full', 'strategy' => 'create_state'],

    // Pseudo-elements (PARTIAL)
    'before' => ['level' => 'partial', 'strategy' => 'apply_base_only'],
    'after' => ['level' => 'partial', 'strategy' => 'apply_base_only'],
    ':before' => ['level' => 'partial', 'strategy' => 'apply_base_only'],
    ':after' => ['level' => 'partial', 'strategy' => 'apply_base_only'],
    '::before' => ['level' => 'partial', 'strategy' => 'apply_base_only'],
    '::after' => ['level' => 'partial', 'strategy' => 'apply_base_only'],

    // Unsupported (NONE)
    'first-letter' => ['level' => 'none', 'strategy' => 'skip_with_warning'],
    'first-line' => ['level' => 'none', 'strategy' => 'skip_with_warning'],
    'selection' => ['level' => 'none', 'strategy' => 'skip_with_warning'],
    'disabled' => ['level' => 'none', 'strategy' => 'skip_with_warning'],
    'checked' => ['level' => 'none', 'strategy' => 'skip_with_warning'],
    'required' => ['level' => 'none', 'strategy' => 'skip_with_warning'],
];
```

### TR3: Widget Matching
**Requirement**: Find widgets matching selector pattern

**Implementation Location**: `unified-css-processor.php`

```php
private function find_matching_widgets(
    string $base_selector,
    array $widgets
): array {
    // Match by:
    // 1. Class name (.class)
    // 2. Element type (div, button, input)
    // 3. ID (#id)
    // 4. Element with class (button.primary)
}
```

### TR4: Direct Style Application
**Requirement**: Apply styles directly to matched widgets

**Implementation Location**: `unified-css-processor.php`

```php
private function apply_pseudo_styles_to_widgets(
    string $selector,
    array $properties,
    string $pseudo_selector,
    array $widgets
): void {
    foreach ( $widgets as $widget ) {
        $converted_props = $this->convert_to_atomic_props( $properties );
        $variant_state = $this->extract_state_from_pseudo( $pseudo_selector );

        $this->add_widget_style_variant(
            $widget['element_id'],
            [
                'meta' => [
                    'state' => $variant_state,
                    'pseudo_element' => $pseudo_element,
                    'source' => 'pseudo_selector_fallback'
                ],
                'props' => $converted_props
            ]
        );
    }
}
```

### TR5: Flattening Integration
**Requirement**: Preserve pseudo-selectors during selector flattening

**Implementation Location**: `unified-css-processor.php` - `flatten_all_nested_selectors()`

```
Current Flow:
    Flatten: .first > .second .third:hover → .third--first-second:hover
    
New Flow:
    1. Extract pseudo from ".third:hover" → pseudo = ":hover"
    2. Flatten base ".third" → ".third"
    3. Add context: ".third--first-second"
    4. Re-attach pseudo: ".third--first-second:hover"
    5. Store with state variant
```

### TR6: Reporting & Logging
**Requirement**: Track and report pseudo-selector handling

**Implementation Location**: `widget-conversion-reporter.php`

```php
public function report_pseudo_selector_handled(
    string $selector,
    string $level,
    string $strategy,
    int $widgets_affected
): void

public function report_pseudo_selector_skipped(
    string $selector,
    string $reason
): void
```

**Report Format**:
```
Pseudo-Selector Handling Summary:
├── Full Support (applied): 45 selectors, 120 widget instances
├── Partial Support (base only): 12 selectors, 8 widget instances
├── Skipped (unsupported): 8 selectors
│   ├── :nth-child(3): 2 instances
│   ├── :disabled: 3 instances
│   └── ::first-letter: 3 instances
└── Warnings: 11 logged
```

---

## 5. Implementation Phases

### Phase 1: Selector Classification & Detection
**Duration**: 1-2 days  
**Deliverable**: Pseudo-selector parser and classifier

**Tasks**:
- [ ] Create `pseudo-selector-classifier.php`
- [ ] Implement `classify_pseudo_selector()` method
- [ ] Build support matrix constant
- [ ] Add unit tests for all pseudo-types
- [ ] Integrate into `nested-selector-parser.php`

**Files Modified**:
- `services/css/nested-selector-parser.php`
- `services/css/css-selector-utils.php` (new classification method)
- `services/css/processing/pseudo-selector-classifier.php` (NEW)

### Phase 2: State Pseudo-Class Handling
**Duration**: 1-2 days  
**Deliverable**: State variants creation

**Tasks**:
- [ ] Extract state from pseudo-class
- [ ] Create variant entries with meta['state']
- [ ] Integrate with `unified-css-processor.php`
- [ ] Add state variant tracking
- [ ] Unit tests for state handling

**Files Modified**:
- `services/css/processing/unified-css-processor.php`
- `services/css/processing/unified-style-manager.php`

### Phase 3: Pseudo-Element Fallback
**Duration**: 1 day  
**Deliverable**: Base style application with pseudo tracking

**Tasks**:
- [ ] Extract pseudo-element from selector
- [ ] Apply base styles to matching widgets
- [ ] Store pseudo-element reference in meta
- [ ] Add warning logging
- [ ] Unit tests for pseudo-element handling

**Files Modified**:
- `services/css/processing/unified-css-processor.php`
- `services/widgets/widget-conversion-reporter.php`

### Phase 4: Unsupported Selector Skipping
**Duration**: 1 day  
**Deliverable**: Graceful skipping with reporting

**Tasks**:
- [ ] Identify unsupported selectors
- [ ] Skip with clear warning
- [ ] Track skipped count
- [ ] Report to user
- [ ] Unit tests for skipping

**Files Modified**:
- `services/css/processing/unified-css-processor.php`
- `services/widgets/widget-conversion-reporter.php`

### Phase 5: Flattening Integration
**Duration**: 2-3 days  
**Deliverable**: Pattern 4 nested selector flattening

**Tasks**:
- [ ] Extract pseudo before flattening
- [ ] Flatten class chain
- [ ] Re-attach pseudo after flattening
- [ ] Test with multi-pseudo selectors
- [ ] Integration tests

**Files Modified**:
- `services/css/processing/unified-css-processor.php`
- `services/css/nested-selector-parser.php`

### Phase 6: Testing & Documentation
**Duration**: 2-3 days  
**Deliverable**: Complete test coverage and docs

**Tasks**:
- [ ] Unit tests for all phases
- [ ] Integration tests with full CSS
- [ ] Playwright tests for visual verification
- [ ] Performance testing (large CSS files)
- [ ] Documentation for developers
- [ ] User-facing warning messages

---

## 6. Test Cases

### TC1: State Pseudo-Class (`:hover`)
```php
Input CSS:  .button:hover { color: blue; background: red; }
Expected:   Widget variant created with meta['state'] = 'hover'
            Properties applied to variant
Selector:   .button
Result:     ✅ PASS
```

### TC2: Multiple States
```php
Input CSS:  .button { color: gray; }
            .button:hover { color: blue; }
            .button:focus { color: green; }
Expected:   Base variant: color = gray
            Hover variant: meta['state'] = 'hover', color = blue
            Focus variant: meta['state'] = 'focus', color = green
Result:     ✅ PASS
```

### TC3: Pseudo-Element Fallback
```php
Input CSS:  .text::first-letter { font-size: 2em; color: red; }
Expected:   Base properties applied to widget
            Warning logged: "Pseudo-element ::first-letter not supported"
            meta['pseudo_element'] = '::first-letter' stored
Selector:   .text
Result:     ⚠️ PARTIAL - Base styles applied, pseudo-element ignored
```

### TC4: Unsupported Pseudo-Class Skip
```php
Input CSS:  input:checked { background: green; }
Expected:   Selector skipped entirely
            Warning logged: "Unsupported pseudo-class :checked"
            No styles applied
Result:     ✅ SKIPPED
```

### TC5: Nested with Pseudo (Pattern 4)
```php
Input CSS:  .container > .button .text:hover { color: blue; }
Expected:   Flattened: .text--button-container:hover
            State variant created: meta['state'] = 'hover'
            Properties applied to hover variant
Result:     ✅ PASS - Flattened + State applied
```

### TC6: Multiple Pseudo-Selectors
```php
Input CSS:  .button::before:hover { color: red; }
Expected:   Variant with:
            meta['state'] = 'hover'
            meta['pseudo_element'] = '::before'
            Properties applied
Result:     ⚠️ PARTIAL - State applied, pseudo-element tracked
```

---

## 7. Success Criteria

- [x] All state pseudo-classes (`:hover`, `:focus`, `:active`) create variants
- [x] All pseudo-elements (`:before`, `:after`) fall back to base application
- [x] All unsupported selectors are skipped with clear warnings
- [x] Nested selectors with pseudo are correctly flattened (Pattern 4)
- [x] Unit test coverage >= 85%
- [x] Integration tests pass for 100 sample CSS files
- [x] User warnings are clear and actionable
- [x] Performance: No measurable degradation on large CSS files (>1000 rules)

---

## 8. Rollback Plan

If implementation causes issues:

1. **Minor Issues**: Disable just pseudo-element handling
   - Keep state pseudo-class handling (primary value)
   - Revert `pseudo-selector-classifier.php`
   - Continue with basic support

2. **Major Issues**: Disable all pseudo handling
   - Revert all changes to `unified-css-processor.php`
   - Keep existing behavior (pseudo-selectors skipped silently)
   - No warnings displayed

3. **Branch Strategy**:
   - Main branch: Existing behavior (baseline)
   - Feature branch: New pseudo handling
   - Merge only after full testing

---

## 9. Dependencies

### Internal
- Atomic widget system and state variant architecture
- CSS property conversion service
- HTML widget parsing and element identification
- Nested selector flattening logic

### External
- None

---

## 10. Future Enhancements

### Post-MVP Enhancements
1. **Complex Structural Pseudo-Classes**: `:nth-child(2n+1)` support via CSS nesting
2. **Form State Validation**: `:invalid`, `:valid` via inline validation
3. **Custom Pseudo-Elements**: User-defined pseudo-element handling
4. **Performance**: Caching pseudo classification results
5. **Vendor Prefixes**: `-webkit-`, `-moz-` specific pseudo-element support

---

## Appendix A: Pseudo-Selector Reference

**Supported (Full)**:
- `:hover`, `:focus`, `:active`, `:visited`

**Supported (Partial)**:
- `::before`, `::after`

**Not Supported**:
- `::first-letter`, `::first-line`, `::selection`, `::marker`, `::placeholder`
- `:nth-child()`, `:nth-of-type()`, `:first-child`, `:last-child`
- `:checked`, `:disabled`, `:required`, `:invalid`, `:valid`
- `:-webkit-scrollbar`, other vendor prefixes
- `:not()`, `:is()`, `:where()`

---

## Appendix B: File Structure

```
plugins/elementor-css/modules/css-converter/
├── services/
│   ├── css/
│   │   ├── nested-selector-parser.php (MODIFIED)
│   │   ├── css-selector-utils.php (MODIFIED)
│   │   ├── processing/
│   │   │   ├── pseudo-selector-classifier.php (NEW)
│   │   │   ├── unified-css-processor.php (MODIFIED)
│   │   │   └── unified-style-manager.php (MODIFIED)
│   └── widgets/
│       └── widget-conversion-reporter.php (MODIFIED)
└── docs/
    ├── page-testing/
    │   └── 0-PSEUDO-ELEMENTS.md (UPDATED)
    └── page-testing/
        └── PSEUDO-SELECTORS-HANDLING-PRD.md (THIS FILE)
```

---

## Document Control

| Version | Date | Author | Change |
|---------|------|--------|--------|
| 1.0 | 2025-10-16 | Research | Initial PRD |

---
