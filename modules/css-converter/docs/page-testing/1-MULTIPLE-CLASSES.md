# PRD: Compound Class Selector Support (Multiple Classes)

**Document Type**: Product Requirements Document  
**Status**: 📋 SPECIFICATION PHASE  
**Priority**: Medium  
**Date**: October 16, 2025  
**Version**: 1.0

---

## 📑 Table of Contents

1. [Executive Summary](#executive-summary)
2. [Requirements Overview](#requirements-overview)
3. [System Architecture](#system-architecture)
4. [Data Flow & Specifications](#data-flow--specifications)
5. [Functional Requirements](#functional-requirements)
6. [Technical Specifications](#technical-specifications)
7. [Implementation Phases](#implementation-phases)
8. [Test Cases](#test-cases)
9. [Success Criteria](#success-criteria)
10. [Risk Assessment](#risk-assessment)

---

## 🎯 Executive Summary

### Problem Statement

The CSS Converter currently **does not handle compound class selectors** (e.g., `.first.second{}`) where CSS targets elements with multiple classes simultaneously. This causes styles to be lost when processing real-world CSS that uses compound selectors—a common pattern in modern CSS frameworks.

### Solution Overview

Implement compound selector detection, flattening, and registration to create global classes that properly apply styles to elements with multiple class requirements.

### Business Impact

- **Current Loss**: Styles on compound selectors are completely ignored
- **Target State**: All compound selector styles properly applied
- **Scope**: CSS Converter, Global Classes system, HTML modifier
- **Effort**: ~12 hours (1.5 days)

---

## 📋 Requirements Overview

### Functional Requirements

| ID | Requirement | Priority | Status |
|---|---|---|---|
| FR-1 | Detect compound class selectors | P0 | ⏳ TODO |
| FR-2 | Extract individual classes from compounds | P0 | ⏳ TODO |
| FR-3 | Generate flattened class names | P0 | ⏳ TODO |
| FR-4 | Apply flattened classes to HTML | P0 | ⏳ TODO |
| FR-5 | Store in global classes (Kit meta) | P0 | ⏳ TODO |
| FR-6 | Calculate specificity correctly | P0 | ⏳ TODO |
| FR-7 | Handle multi-class compounds (3+) | P1 | ⏳ TODO |
| FR-8 | Support element + class compounds | P1 | ⏳ TODO |
| FR-9 | Support pseudo-class compounds | P2 | ⏳ TODO |
| FR-10 | Normalize class order | P1 | ⏳ TODO |

### Non-Functional Requirements

| ID | Requirement | Measure | Target |
|---|---|---|---|
| NF-1 | Performance | Detection time per selector | < 1ms |
| NF-2 | Maintainability | Code complexity | Low (self-documenting) |
| NF-3 | Compatibility | Existing selectors | No regression |
| NF-4 | Test Coverage | Unit tests | > 80% |

---

## 🏗️ System Architecture

### Current Architecture (Before)

```
┌─────────────────────────────────────────────────────────────────┐
│ CSS INPUT                                                       │
│ .first.second { color: red; }                                 │
└────────────┬────────────────────────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────────────────────────┐
│ CSS PARSER                                                      │
│ • Extract rules                                                 │
│ • Identify selectors                                            │
│ ❌ NO COMPOUND DETECTION                                        │
└────────────┬────────────────────────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────────────────────────┐
│ SELECTOR ROUTING                                                │
│ • Simple selectors → direct processing                         │
│ • Nested selectors → flatten                                    │
│ ❌ Compound → SKIPPED or MISHANDLED                            │
└────────────┬────────────────────────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────────────────────────┐
│ RESULT                                                          │
│ ❌ Styles Lost - No global class created                        │
│ ❌ No HTML modification                                         │
└─────────────────────────────────────────────────────────────────┘
```

### Proposed Architecture (After)

```
┌─────────────────────────────────────────────────────────────────┐
│ CSS INPUT                                                       │
│ .first.second { color: red; }                                 │
└────────────┬────────────────────────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────────────────────────┐
│ CSS PARSER                                                      │
│ • Extract rules                                                 │
│ • Identify selectors                                            │
└────────────┬────────────────────────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────────────────────────┐
│ SELECTOR CLASSIFICATION ✅ NEW                                   │
│ ┌───────────────────────────────────────────────────────────┐  │
│ │ is_simple_selector(.first)?        → NO                  │  │
│ │ is_nested_selector(.first .second)? → NO                 │  │
│ │ is_compound_selector(.first.second)? → ✅ YES            │  │
│ └───────────────────────────────────────────────────────────┘  │
└────────────┬────────────────────────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────────────────────────┐
│ COMPOUND SELECTOR PROCESSOR ✅ NEW                               │
│ ┌───────────────────────────────────────────────────────────┐  │
│ │ 1. Extract classes: ['first', 'second']                  │  │
│ │ 2. Sort alphabetically (normalize): ['first', 'second']  │  │
│ │ 3. Generate flattened: 'first-and-second'                │  │
│ │ 4. Calculate specificity: 20 (2 × 10)                    │  │
│ └───────────────────────────────────────────────────────────┘  │
└────────────┬────────────────────────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────────────────────────┐
│ GLOBAL CLASS CREATION ✅ ENHANCED                                │
│ ┌───────────────────────────────────────────────────────────┐  │
│ │ {                                                         │  │
│ │   id: 'g-abc123',                                         │  │
│ │   label: 'first-and-second',                             │  │
│ │   type: 'class',                                         │  │
│ │   requires: ['first', 'second'],  ✅ NEW                 │  │
│ │   specificity: 20,                ✅ NEW                 │  │
│ │   original_selector: '.first.second',                    │  │
│ │   properties: { color: 'red' },                          │  │
│ │ }                                                        │  │
│ └───────────────────────────────────────────────────────────┘  │
└────────────┬────────────────────────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────────────────────────┐
│ HTML CLASS MODIFIER ✅ ENHANCED                                  │
│ • Check each widget's classes                                   │
│ • IF all required classes present: add flattened class         │
│ • ELSE: skip                                                    │
└────────────┬────────────────────────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────────────────────────┐
│ RESULT ✅                                                        │
│ ✅ Global class created in Kit meta                             │
│ ✅ HTML modified: class="first second first-and-second"        │
│ ✅ Styles properly applied                                      │
└─────────────────────────────────────────────────────────────────┘
```

### Component Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    UNIFIED_CSS_PROCESSOR                        │
│                   (Main Coordinator)                            │
└──────────────────┬──────────────────────────────────────────────┘
                   │
        ┌──────────┼──────────┐
        │          │          │
        ▼          ▼          ▼
   ┌────────┐  ┌────────────┐  ┌──────────────────┐
   │ CSS    │  │  SELECTOR  │  │ COMPOUND SELECTOR│
   │ PARSER │  │CLASSIFIER  │  │    PROCESSOR     │
   │        │  │ ✅ NEW     │  │   ✅ NEW MODULE  │
   └────────┘  └────────────┘  └──────────────────┘
        │          │          │
        └──────────┼──────────┘
                   │
                   ▼
        ┌─────────────────────────┐
        │   CSS_SELECTOR_UTILS    │
        │ ✅ ENHANCED             │
        │ • is_compound_selector()│
        │ • extract_classes()     │
        │ • build_flattened_name()│
        └────────┬────────────────┘
                 │
        ┌────────┴────────┐
        │                 │
        ▼                 ▼
   ┌────────────────┐ ┌──────────────────────────┐
   │ GLOBAL_CLASSES│ │ HTML_CLASS_MODIFIER      │
   │ REPOSITORY    │ │ ✅ ENHANCED              │
   │               │ │ • apply_compound_classes │
   │ (Kit meta)    │ │ • check_requirements()   │
   └────────────────┘ └──────────────────────────┘
```

---

## 📊 Data Flow & Specifications

### Data Flow Diagram

```
INPUT:
  {
    css: '.first.second { color: red; }',
    html: '<div class="first second">Text</div>'
  }

PROCESSING PIPELINE:

Step 1: DETECTION
  Selector: '.first.second'
  ├─ Check: Simple? NO
  ├─ Check: Nested? NO
  ├─ Check: Compound? YES ✅
  └─ Route to: COMPOUND_PROCESSOR

Step 2: EXTRACTION
  Input: '.first.second'
  ├─ Remove leading dot: 'first.second'
  ├─ Split by dots: ['first', 'second']
  ├─ Filter/validate: ['first', 'second'] ✅
  └─ Output: { classes: ['first', 'second'] }

Step 3: NORMALIZATION
  Input: ['first', 'second']
  ├─ Sort alphabetically: ['first', 'second']
  └─ Output: ['first', 'second']

Step 4: FLATTENING
  Input: ['first', 'second']
  ├─ Generate name: 'first-and-second'
  ├─ Calculate specificity: 2 × 10 = 20
  └─ Output: {
       flattened_class: 'first-and-second',
       specificity: 20,
       requires: ['first', 'second']
     }

Step 5: GLOBAL CLASS CREATION
  Input: {
    flattened_class: 'first-and-second',
    properties: { color: 'red' },
    specificity: 20
  }
  └─ Output: {
       id: 'g-abc123',
       label: 'first-and-second',
       type: 'class',
       requires: ['first', 'second'],
       specificity: 20,
       properties: { color: 'red' },
       variants: [{ meta: {...}, props: {...} }]
     }

Step 6: HTML MODIFICATION
  Input: {
    widget: { classes: ['first', 'second'] },
    compounds: { 'first-and-second': { requires: ['first', 'second'] } }
  }
  ├─ Check: Has 'first'? YES
  ├─ Check: Has 'second'? YES
  ├─ All required present? YES ✅
  └─ Add class: 'first-and-second'
  └─ Output: { classes: ['first', 'second', 'first-and-second'] }

OUTPUT:
  {
    html: '<div class="first second first-and-second">Text</div>',
    global_classes: {
      'first-and-second': {...}
    },
    flattened_classes_created: 1
  }
```

### State Data Structures

```php
// INPUT SELECTOR
$selector = '.first.second';
// Type: string
// Pattern: /^\.([a-zA-Z0-9_-]+(?:\.[a-zA-Z0-9_-]+)+)$/

// EXTRACTED COMPOUND
$compound = [
    'original_selector' => '.first.second',
    'classes' => ['first', 'second'],
    'properties' => [
        'color' => 'red',
        'font-size' => '16px',
    ],
];
// Type: array
// Keys: original_selector, classes, properties

// FLATTENED COMPOUND
$flattened = [
    'flattened_class' => 'first-and-second',
    'specificity' => 20,
    'requires' => ['first', 'second'],
    'original_selector' => '.first.second',
    'properties' => [...],
];
// Type: array
// Specificity calculation: count(classes) × 10

// GLOBAL CLASS (Kit meta)
$global_class = [
    'id' => 'g-abc123',
    'label' => 'first-and-second',
    'type' => 'class',
    'original_selector' => '.first.second',
    'compound_classes' => ['first', 'second'],
    'specificity' => 20,
    'variants' => [
        [
            'meta' => [
                'breakpoint' => 'desktop',
                'state' => null,
            ],
            'props' => [
                'color' => ['$$type' => 'color', 'value' => 'red'],
                'font-size' => ['$$type' => 'font-size', 'value' => '16px'],
            ],
        ],
    ],
];
// Type: array (Elementor atomic format)
// Stored in: Kit meta _elementor_global_classes['items']

// WIDGET CLASS MAPPING
$compound_mappings = [
    'first-and-second' => [
        'requires' => ['first', 'second'],
        'specificity' => 20,
        'global_class_id' => 'g-abc123',
    ],
];
// Type: array
// Used to check: Does widget have all required classes?
```

---

## 🔧 Functional Requirements

### FR-1: Detect Compound Class Selectors

**Description**: System must identify and classify CSS selectors that contain multiple classes without spaces.

**Acceptance Criteria**:
- ✅ `.first.second` detected as compound
- ✅ `.btn.primary.large` detected as compound
- ✅ `.first` NOT detected as compound
- ✅ `.first .second` NOT detected as compound

**Implementation**:
```php
public static function is_compound_class_selector( string $selector ): bool {
    $trimmed = trim( $selector );
    $pattern = '/^\.([a-zA-Z0-9_-]+(?:\.[a-zA-Z0-9_-]+)+)$/';
    return preg_match( $pattern, $trimmed ) === 1;
}
```

### FR-2: Extract Individual Classes

**Description**: From a compound selector, extract all individual class names.

**Acceptance Criteria**:
- ✅ `.first.second` → `['first', 'second']`
- ✅ `.btn.primary.large` → `['btn', 'primary', 'large']`
- ✅ Validate all extracted classes are valid CSS class names
- ✅ Handle hyphenated class names: `.btn-primary.lg-button`

**Implementation**:
```php
public static function extract_compound_classes( string $selector ): array {
    $selector = trim( $selector );
    if ( empty( $selector ) || $selector[0] !== '.' ) {
        return [];
    }
    $selector = substr( $selector, 1 );
    $classes = explode( '.', $selector );
    return array_filter( array_map( 'trim', $classes ) );
}
```

### FR-3: Generate Flattened Class Names

**Description**: Create a single flattened class name from multiple classes.

**Acceptance Criteria**:
- ✅ `.first.second` → `first-and-second`
- ✅ `.second.first` → `first-and-second` (normalized)
- ✅ Alphabetical sorting for order independence
- ✅ No duplicate names for different orderings

**Implementation**:
```php
public static function build_compound_flattened_name( array $classes ): string {
    sort( $classes );
    return implode( '-and-', $classes );
}
```

### FR-4: Apply Flattened Classes to HTML

**Description**: Add flattened compound class to HTML elements that have all required classes.

**Acceptance Criteria**:
- ✅ Element with all required classes gets flattened class added
- ✅ Element missing any class does NOT get flattened class
- ✅ No duplicate class names
- ✅ Maintains original class order

**Implementation Location**: `Html_Class_Modifier_Service::apply_compound_classes()`

### FR-5: Store in Global Classes

**Description**: Store compound-derived global classes in Elementor's Kit meta using atomic format.

**Acceptance Criteria**:
- ✅ Stored in `_elementor_global_classes` Kit meta
- ✅ Uses Elementor atomic props format
- ✅ Includes specificity metadata
- ✅ Includes original selector metadata
- ✅ Compatible with `Global_Classes_Repository`

### FR-6: Calculate Specificity

**Description**: Correctly calculate CSS specificity for compound selectors.

**Formula**: `specificity = count(classes) × 10`

**Acceptance Criteria**:
- ✅ `.first.second` = 20 specificity
- ✅ `.btn.primary.large` = 30 specificity
- ✅ Stored in global class metadata
- ✅ Used for conflict resolution

---

## 💻 Technical Specifications

### File Changes Required

#### 1. css-converter-config.php

```php
const REGEX_PATTERNS = [
    // ... existing patterns ...
    'compound_class' => '/^\.([a-zA-Z0-9_-]+(?:\.[a-zA-Z0-9_-]+)+)$/',
];
```

#### 2. css-selector-utils.php

**New Methods**:
- `is_compound_class_selector( string $selector ): bool`
- `extract_compound_classes( string $selector ): array`
- `build_compound_flattened_name( array $classes ): string`

#### 3. unified-css-processor.php

**New Methods**:
- `process_compound_selectors( array $rules ): array`
- `create_global_class_from_compound( array $compound_rule ): array`

**Modified Methods**:
- `process_css_and_widgets()` - Add compound processing step

#### 4. html-class-modifier-service.php

**New Methods**:
- `apply_compound_classes( array $widgets ): array`
- `check_compound_requirements( array $widget_classes, array $compound ): bool`

#### 5. global-classes-converter.php (if exists)

**Enhancement**: Support compound class format in global class storage

### Integration Points

```
Unified_Css_Processor
├─ process_css_and_widgets()
│  ├─ parse_css_and_extract_rules()
│  ├─ flatten_all_nested_selectors()
│  ├─ process_compound_selectors()  ✅ NEW STEP
│  ├─ apply_html_class_modifications()
│  ├─ resolve_styles_recursively()
│  └─ return results
│
Html_Class_Modifier_Service
├─ initialize_with_flattening_results()
├─ apply_html_class_modifications()
├─ apply_compound_classes()  ✅ NEW
└─ modify_widget_classes()
```

---

## 🚀 Implementation Phases

### Phase 1: Detection & Extraction (Day 1)

**Deliverables**:
- ✅ Regex pattern added to config
- ✅ `is_compound_class_selector()` method
- ✅ `extract_compound_classes()` method
- ✅ Unit tests for detection
- ✅ Test coverage: > 90%

**Files**:
- `css-converter-config.php`
- `css-selector-utils.php`
- Tests

**Effort**: 2-3 hours

### Phase 2: Processor Implementation (Day 2)

**Deliverables**:
- ✅ `process_compound_selectors()` method
- ✅ Compound rule structure defined
- ✅ Flattened class generation
- ✅ Specificity calculation
- ✅ Integration into main processor

**Files**:
- `unified-css-processor.php`
- Tests

**Effort**: 3-4 hours

### Phase 3: HTML Modification (Day 2)

**Deliverables**:
- ✅ `apply_compound_classes()` method
- ✅ Requirement checking logic
- ✅ Class application to widgets
- ✅ Integration testing

**Files**:
- `html-class-modifier-service.php`
- Tests

**Effort**: 2-3 hours

### Phase 4: Testing & Validation (Day 3)

**Deliverables**:
- ✅ All scenarios passing
- ✅ Edge cases handled
- ✅ Playwright tests passing
- ✅ Performance validated
- ✅ No regressions

**Files**:
- Test files
- Documentation updates

**Effort**: 2-3 hours

---

## 🧪 Test Cases

### Scenario 1: Simple Compound Selector

**Input HTML**:
```html
<style>
  .first.second {
    color: red;
    font-size: 16px;
  }
</style>
<div class="first second">
  Compound Element
</div>
```

**Expected Output HTML**:
```html
<div class="first second first-and-second">
  Compound Element
</div>
```

**Global Class Created**:
```php
'first-and-second' => [
  'id' => 'g-XXXXX',
  'label' => 'first-and-second',
  'requires' => ['first', 'second'],
  'specificity' => 20,
  'properties' => ['color' => 'red', 'font-size' => '16px']
]
```

**Status**: ❌ NOT WORKING

---

### Scenario 2: Multiple Compound Selectors

**Input HTML**:
```html
<style>
  .btn.primary { background: blue; color: white; }
  .btn.secondary { background: gray; color: black; }
</style>
<button class="btn primary">Primary</button>
<button class="btn secondary">Secondary</button>
```

**Expected Output**:
```html
<button class="btn primary btn-and-primary">Primary</button>
<button class="btn secondary btn-and-secondary">Secondary</button>
```

**Global Classes Created**: 2 (`btn-and-primary`, `btn-and-secondary`)

**Status**: ❌ NOT WORKING

---

### Scenario 3: Three-Class Compound

**Input HTML**:
```html
<style>
  .btn.primary.large {
    padding: 20px;
  }
</style>
<button class="btn primary large">Large Primary</button>
```

**Expected Output**:
```html
<button class="btn primary large btn-and-large-and-primary">Large Primary</button>
```

**Specificity**: 30 (3 × 10)

**Status**: ❌ NOT WORKING

---

### Scenario 4: Class Missing

**Input HTML**:
```html
<style>
  .first.second { color: red; }
</style>
<div class="first">Only first</div>
<div class="second">Only second</div>
<div class="first second">Both</div>
```

**Expected Output**:
```html
<div class="first">Only first</div>
<div class="second">Only second</div>
<div class="first second first-and-second">Both</div>
```

**Status**: ❌ NOT WORKING

---

### Scenario 5: Order Independence

**Input HTML**:
```html
<style>
  .first.second { color: red; }
  .second.first { color: blue; }
</style>
<div class="first second">Text</div>
```

**Expected Behavior**:
- Both `.first.second` and `.second.first` normalize to `first-and-second`
- Last rule wins: `color: blue;`
- Only ONE global class created

**Status**: ❌ NOT IMPLEMENTED

---

### Scenario 6: Element + Compound

**Input HTML**:
```html
<style>
  button.primary.large {
    padding: 20px;
  }
</style>
<button class="primary large">Button</button>
```

**Expected Output**:
```html
<button class="primary large btn-and-large-and-primary">Button</button>
```

**Status**: ❌ NOT WORKING

---

### Scenario 7: Compound with Pseudo-Class

**Input HTML**:
```html
<style>
  .btn.primary:hover {
    background: darkblue;
  }
</style>
<button class="btn primary">Hover Me</button>
```

**Expected Behavior**:
- Detect compound with pseudo-class
- Create variant for hover state
- Store with breakpoint/state metadata

**Status**: ❌ NOT WORKING

---

### Scenario 8: Specificity Conflict

**Input HTML**:
```html
<style>
  .first .second { color: blue; }
  .first.second { color: red; }
</style>
<div class="first second">Text</div>
```

**Expected Result**:
- Both have 20 specificity
- Compound wins (later in CSS)
- Color is red

**Status**: ❌ NOT APPLICABLE

---

## ✅ Success Criteria

### Functional Success

- [ ] All 8 test scenarios passing
- [ ] Compound selectors detected correctly
- [ ] Individual classes extracted
- [ ] Flattened names generated correctly
- [ ] HTML modified appropriately
- [ ] Global classes stored in Kit meta
- [ ] Specificity calculated: count(classes) × 10
- [ ] Element with missing classes doesn't get flattened class
- [ ] Multiple compounds handled independently
- [ ] Class order normalized (alphabetical)

### Code Quality Success

- [ ] No magic numbers (all constants defined)
- [ ] Self-documenting function names
- [ ] Test coverage > 90%
- [ ] ESLint passing
- [ ] PHP lint passing (`composer run lint:fix`)
- [ ] No regressions in existing tests

### Performance Success

- [ ] Detection < 1ms per selector
- [ ] Processing scales linearly with CSS rules
- [ ] No memory leaks
- [ ] No infinite loops

### Documentation Success

- [ ] Code comments explain why, not what
- [ ] README updated with examples
- [ ] API documentation updated
- [ ] Troubleshooting guide added

---

## ⚠️ Risk Assessment

### Technical Risks

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Regex complexity | Low | Low | Use proven pattern, extensive testing |
| Performance impact | Very Low | Medium | Benchmark before/after |
| Regressions | Low | High | Comprehensive test suite |
| Order conflicts | Medium | Medium | Sort alphabetically to normalize |
| Three+ classes | Low | Low | Extend pattern, test edge cases |

### Mitigation Strategies

1. **Comprehensive Testing**
   - Unit tests for each component
   - Integration tests for full flow
   - Playwright tests for end-to-end

2. **Code Review**
   - Self-review before PR
   - Peer review for quality
   - Architecture review

3. **Incremental Implementation**
   - Phase-based approach
   - Test after each phase
   - Deploy when stable

4. **Documentation**
   - Keep PRD updated
   - Document decisions
   - Create troubleshooting guide

---

## 📊 Effort & Timeline

| Phase | Task | Effort | Status |
|---|---|---|---|
| 1 | Detection & Extraction | 2-3h | 🟡 Planned |
| 2 | Processor Implementation | 3-4h | 🟡 Planned |
| 3 | HTML Modification | 2-3h | 🟡 Planned |
| 4 | Testing & Validation | 2-3h | 🟡 Planned |
| **Total** | | **~12 hours** | |

**Timeline**: 1.5 days (concentrated work)

---

## 📚 Related Documentation

- `COMPOUND-SELECTOR-ANALYSIS.md` - Technical analysis
- `COMPOUND-SELECTOR-COMPARISON.md` - Quick reference
- `COMPOUND-IMPLEMENTATION-ROADMAP.md` - Implementation guide

---

## 🎯 Sign-Off

**Document Status**: 📋 Ready for Implementation Review  
**Version**: 1.0  
**Last Updated**: October 16, 2025  
**Next Review**: After Phase 1 completion
