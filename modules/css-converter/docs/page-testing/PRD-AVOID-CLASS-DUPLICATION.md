# PRD: Smart Duplicate Detection for Global Classes and Variables

**Status**: 🚧 Draft for Review  
**Date**: 2025-10-16  
**Priority**: High  
**Estimated Effort**: 3-5 days

---

## 📋 Executive Summary

Implement intelligent duplicate detection for global classes and CSS variables during import. Instead of blindly skipping duplicates, the system will:
1. Detect if styling is **identical** → reuse existing class/variable
2. Detect if styling **differs** → create new class/variable with incremental suffix
3. Apply same logic to both classes and variables for consistency

---

## 🎯 Problem Statement

### Current Behavior (Lines 68-76 in `class-conversion-service.php`)
```php
if ( in_array( $label, $existing_labels, true ) || in_array( $label, $seen_labels, true ) ) {
    $this->add_warning( "Skipped duplicate class: {$css_class['selector']}" );
    $results['skipped_classes'][] = [
        'selector' => $css_class['selector'],
        'reason' => 'duplicate',
    ];
    ++$results['stats']['classes_skipped'];
    continue;
}
```

**Problem**: The system only checks if the **label** exists, not if the **styling** is identical. This causes two critical issues:

### Issue 1: False Positives (Same Name, Different Styles)
```css
/* Existing in database */
.button {
    background-color: blue;
    padding: 10px;
}

/* New import */
.button {
    background-color: red;
    padding: 20px;
    border-radius: 5px;
}
```
**Current Behavior**: Skips import → CSS mismatch  
**Desired Behavior**: Creates `.button-1` with different styles

### Issue 2: Unnecessary Duplicates (Same Name, Same Styles)
```css
/* Existing in database */
.banner-title {
    font-size: 24px;
    color: #333;
}

/* New import (identical) */
.banner-title {
    font-size: 24px;
    color: #333;
}
```
**Current Behavior**: Skips import, but could have reused existing  
**Desired Behavior**: Returns existing class reference for reuse in HTML

---

## 🔍 CRITICAL QUESTIONS

### 1. **Comparison Methodology: Deep Equality vs Normalized Comparison**

**Question**: How do we determine if two classes have "identical styling"?

**Option A: Exact Property Match (Strict)**
```php
// Two classes are identical if:
// 1. Same properties (keys)
// 2. Same values (exact string match)
// 3. Same order (maybe?)

$class_a = ['color' => '#ff0000', 'padding' => '10px'];
$class_b = ['color' => '#ff0000', 'padding' => '10px'];
// → IDENTICAL
```

**Option B: Semantic Equivalence (Normalized)**
```php
// Two classes are identical if normalized values match:
// - #f00 === #ff0000 === rgb(255,0,0)
// - 10px === 0.625rem (if base 16px)
// - 1em === 16px (if base 16px)

$class_a = ['color' => '#f00', 'padding' => '10px'];
$class_b = ['color' => '#ff0000', 'padding' => '0.625rem'];
// → IDENTICAL? or DIFFERENT?
```

**My Opinion**: Start with **Option A (Strict)** for MVP because:
- Simpler implementation
- Fewer edge cases
- Normalizing CSS values is complex (context-dependent)
- We can enhance later if users complain

**Your Opinion Needed**: Which approach? Any hybrid options?

---

### 2. **Property Order Matters?**

**Question**: Should property order affect equality?

```php
$class_a = [
    'color' => '#ff0000',
    'padding' => '10px',
    'margin' => '5px'
];

$class_b = [
    'margin' => '5px',
    'color' => '#ff0000',
    'padding' => '10px'
];
```

**My Opinion**: Property order should **NOT** matter. CSS doesn't care about order (except specificity), so we shouldn't either. Sort keys before comparison.

**Disagreement Point**: The original request says "check if styling is identical" but doesn't define "identical" precisely.

**Your Opinion Needed**: Should order matter? Why/why not?

---

### 3. **Atomic Property Comparison: Raw CSS vs Converted Format**

**Question**: Should we compare classes at the **CSS level** or **atomic property level**?

**Scenario**:
```css
/* Class A: Original CSS */
.button {
    background-color: blue;
}

/* Class B: Imported CSS */
.button {
    background-color: blue;
}
```

Both convert to:
```php
// Atomic format
[
    'background_color' => [
        '$$type' => 'color',
        'value' => '#0000ff'
    ]
]
```

**Option A: Compare Raw CSS Properties**
- Pro: Simpler, faster
- Pro: No dependency on conversion logic
- Con: Doesn't detect if conversion differs (edge case)

**Option B: Compare Converted Atomic Properties**
- Pro: More accurate (what actually gets stored)
- Pro: Handles conversion edge cases
- Con: More complex
- Con: Performance overhead (must convert before comparing)

**My Recommendation**: **Option B** (Compare atomic properties) because:
1. That's what actually gets stored/rendered
2. Catches conversion inconsistencies
3. Future-proof if CSS parsing changes

**Disagreement**: This wasn't in the original spec, but seems critical for correctness.

**Your Opinion Needed**: Which comparison point?

---

### 4. **Breakpoint & State Variants: Single Breakpoint or All?**

**Question**: The original spec only mentions basic classes, but global classes support breakpoints (desktop/tablet/mobile) and states (hover/active/focus).

**Scenario**:
```php
// Existing class
$class_a = [
    'variants' => [
        ['meta' => ['breakpoint' => 'desktop', 'state' => null], 'props' => [...]],
        ['meta' => ['breakpoint' => 'tablet', 'state' => null], 'props' => [...]]
    ]
];

// New class (only desktop)
$class_b = [
    'variants' => [
        ['meta' => ['breakpoint' => 'desktop', 'state' => null], 'props' => [...]]
    ]
];
```

Are these identical? Should we:
1. Compare only matching variants (desktop vs desktop)?
2. Require ALL variants to match?
3. Treat missing variants as different?

**My Opinion**: For MVP, only import classes with **single desktop variant, no state**. Multi-breakpoint comparison is complex and can be Phase 2.

**Your Opinion Needed**: Should we support multi-breakpoint comparison now or defer?

---

### 5. **Variables: Same Questions Apply**

The spec says "Implement the same approach to the variables" but variables have different considerations:

**Question**: For CSS variables, what constitutes "identical"?

```css
:root {
    --primary-color: #ff0000;
}

:root {
    --primary-color: #ff0000; /* Identical? */
}

:root {
    --primary-color: rgb(255, 0, 0); /* Identical? */
}
```

**Current Variable Logic** (lines 341-346 in `variables-route.php`):
```php
if ( isset( $label_to_id[ $lower_label ] ) ) {
    $repository->update( $label_to_id[ $lower_label ], [
        'label' => $label,
        'value' => $value,  // ⚠️ ALWAYS updates value, even if identical
    ] );
    ++$updated;
}
```

**Problem**: Variables are **ALWAYS updated** when label matches, even if value is identical. Should we:
- Keep this behavior (update = overwrite)?
- Add identity check (skip update if value identical)?
- Add versioning (create -1, -2 if values differ)?

**My Strong Opinion**: Variables should follow **SAME logic as classes**:
- If name + value identical → skip (or return reference)
- If name exists but value differs → create `--primary-color-1`

**Disagreement**: Current variable behavior conflicts with proposed class behavior. We need consistency.

**Your Opinion Needed**: Should variables update-in-place or use incremental naming?

---

### 6. **Suffix Naming Strategy: `-1` or `-2` Start?**

**Question**: The spec says:
> "E.g. .first-class exists already and has identical styling, then create a new class name .first-class-1"

**Wait, that's confusing!** The spec says:
- If styling is **identical** → use existing (no suffix)
- If styling **differs** → create with suffix

But the example says "has identical styling, then create .first-class-1" which contradicts the rule!

**My Interpretation**: This is a typo. The example should read:
> "E.g. .first-class exists already and has **DIFFERENT** styling, then create a new class name .first-class-1"

**Clarification Needed**: Is my interpretation correct?

---

### 7. **Suffix Collision Resolution**

**Scenario**:
```
Existing classes in DB:
- .button (background: blue)
- .button-1 (background: red)
- .button-2 (background: green)

New import:
- .button (background: yellow)
```

**Question**: Should we:
- **Option A**: Create `.button-3` (next available integer)
- **Option B**: Check if `.button-1` or `.button-2` match styling first, reuse if so
- **Option C**: Something else?

**My Opinion**: **Option B** for maximum deduplication. Check all existing variants before creating new suffix.

**Algorithm**:
```php
function find_or_create_class($new_class) {
    $base_label = extract_base_label($new_class['label']); // 'button'
    $existing_variants = get_all_variants($base_label); // ['button', 'button-1', 'button-2']
    
    foreach ($existing_variants as $variant) {
        if (styles_are_identical($new_class, $variant)) {
            return $variant; // Reuse existing
        }
    }
    
    // No match found, create new suffix
    $next_suffix = find_next_available_suffix($base_label);
    return create_class_with_suffix($new_class, $next_suffix);
}
```

**Disagreement**: The spec doesn't mention checking existing suffixed variants. This adds complexity but maximizes reuse.

**Your Opinion Needed**: Should we check suffixed variants or always increment?

---

### 8. **Return Value: New Class ID or Existing Class ID?**

**Question**: When we detect an identical class and reuse it, what should the API return?

**Current Behavior**:
```php
return [
    'converted_classes' => [...],
    'skipped_classes' => [...]
];
```

**Proposed Behavior**:
```php
return [
    'converted_classes' => [...],     // NEW classes created
    'skipped_classes' => [...],       // Classes skipped (no props)
    'reused_classes' => [             // NEW: Classes reused
        [
            'original_selector' => '.button',
            'matched_class_id' => 'g-abc123',
            'matched_class_label' => 'button',
            'reason' => 'identical_styling'
        ]
    ]
];
```

**Why Important**: Caller needs to know which existing classes to reference in HTML.

**My Opinion**: We MUST return reused class references, otherwise the caller can't update HTML correctly.

**Your Opinion Needed**: Agreed? Any alternative structure?

---

### 9. **Performance: Comparison Cost**

**Question**: Comparing every new class against all existing classes could be O(n×m) where:
- n = number of new classes
- m = number of existing classes

For large imports (100 new classes vs 1000 existing), that's 100,000 comparisons.

**Optimization Options**:
- **Option A**: Hash-based lookup (hash props → quick equality check)
- **Option B**: Limit comparison to same-name variants only
- **Option C**: No optimization for MVP (premature optimization?)

**My Opinion**: Start with **Option C** (no optimization). Profile later if slow.

**Your Opinion Needed**: Any performance concerns?

---

### 10. **Database Consistency: What if DB State Changes Mid-Import?**

**Scenario**:
```php
// Step 1: Read existing classes from DB
$existing = get_existing_classes();

// Step 2: Import 100 new classes (takes time)
foreach ($new_classes as $class) {
    compare_and_maybe_create($class, $existing);
}

// Problem: What if another request creates classes during Step 2?
// The in-memory $existing is now stale!
```

**Question**: Should we:
- **Option A**: Lock DB during import (performance hit)
- **Option B**: Re-fetch existing classes on each comparison (performance hit)
- **Option C**: Accept race condition (rare edge case)
- **Option D**: Batch import in transaction (best practice?)

**My Opinion**: **Option C** for MVP. Race condition is unlikely and consequences are minor (extra class created).

**Your Opinion Needed**: Is race condition acceptable?

---

## 🏗️ Proposed Architecture

### Component 1: `Class_Comparison_Service`

**New service** for comparing classes:

```php
class Class_Comparison_Service {
    public function compare_global_classes(array $class_a, array $class_b): bool;
    public function normalize_for_comparison(array $class): array;
    private function compare_variants(array $variants_a, array $variants_b): bool;
    private function compare_atomic_props(array $props_a, array $props_b): bool;
}
```

### Component 2: `Duplicate_Detection_Service`

**New service** for finding/creating classes:

```php
class Duplicate_Detection_Service {
    public function find_or_create_global_class(array $new_class): array;
    public function find_matching_class(string $base_label, array $new_class): ?string;
    private function get_all_label_variants(string $base_label): array;
    private function find_next_available_suffix(string $base_label): int;
}
```

### Component 3: Modified `Class_Conversion_Service`

**Update existing** service to use new components:

```php
class Class_Conversion_Service {
    private $duplicate_detector;
    private $class_comparator;
    
    private function process_classes(array $classes): array {
        foreach ($classes as $css_class) {
            $result = $this->duplicate_detector->find_or_create_global_class($converted);
            
            if ($result['action'] === 'reused') {
                $results['reused_classes'][] = $result;
            } elseif ($result['action'] === 'created') {
                $results['converted_classes'][] = $result;
            }
        }
    }
}
```

---

## 📊 Data Flow

```
┌─────────────────────────────────────────────────────────────────┐
│ 1. Parse CSS → Extract Classes                                  │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│ 2. Convert CSS Props → Atomic Format                            │
│    .button { background: blue } → { background_color: {...} }   │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│ 3. Fetch Existing Classes from DB (base label + all suffixes)   │
│    Input: "button"                                               │
│    Output: ["button", "button-1", "button-2"]                   │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│ 4. Compare New Class vs Each Existing Variant                   │
│    → Compare atomic props (sorted, normalized)                  │
│    → If match found → Return existing class ID                  │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│ 5. No Match Found → Create New Class with Suffix                │
│    → Find next available suffix (.button-3)                     │
│    → Create new class in DB                                     │
│    → Return new class ID                                        │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🧪 Test Scenarios

### Test 1: Identical Class - Reuse Existing
```css
/* Existing DB */
.banner-title { font-size: 24px; color: #333; }

/* Import */
.banner-title { font-size: 24px; color: #333; }

/* Expected */
→ Reuse existing, return class ID
→ No new class created
```

### Test 2: Same Name, Different Styles - Create Suffix
```css
/* Existing DB */
.button { background: blue; }

/* Import */
.button { background: red; }

/* Expected */
→ Create .button-1 with red background
→ Return new class ID
```

### Test 3: Multiple Collisions - Incremental Suffixes
```css
/* Existing DB */
.button { background: blue; }
.button-1 { background: red; }

/* Import */
.button { background: green; }

/* Expected */
→ Create .button-2 with green background
```

### Test 4: Match Suffixed Variant - Reuse
```css
/* Existing DB */
.button { background: blue; }
.button-1 { background: red; }

/* Import */
.button { background: red; } /* Matches button-1! */

/* Expected */
→ Reuse .button-1, return its class ID
→ No new class created
```

### Test 5: Property Order Irrelevant
```css
/* Existing DB */
.box { margin: 10px; padding: 5px; }

/* Import */
.box { padding: 5px; margin: 10px; }

/* Expected */
→ Reuse existing (properties are identical)
```

### Test 6: Variables - Same Logic
```css
/* Existing DB */
--primary-color: #ff0000;

/* Import */
--primary-color: #ff0000;

/* Expected */
→ Reuse existing variable
→ Return variable ID for reference
```

### Test 7: Variables - Different Values
```css
/* Existing DB */
--primary-color: #ff0000;

/* Import */
--primary-color: #00ff00;

/* Expected */
→ Create --primary-color-1 with green value
```

---

## 🚧 Out of Scope (Phase 2)

1. **Semantic CSS equivalence** (e.g., `#f00` === `#ff0000`)
2. **Unit conversion** (e.g., `10px` === `0.625rem`)
3. **Multi-breakpoint comparison** (desktop vs tablet vs mobile)
4. **State variants** (:hover, :active, :focus)
5. **Batch optimization** (hash-based lookups)
6. **Database locking** for concurrent imports
7. **Custom CSS comparison** (comparing `custom_css` field)
8. **Shorthand expansion** (e.g., `margin: 10px` vs individual sides)

---

## ⚠️ Risks & Mitigations

### Risk 1: Performance Degradation
- **Impact**: High (100 new classes × 1000 existing = 100k comparisons)
- **Mitigation**: Profile first, optimize later. Start simple.

### Risk 2: False Positives (Different Classes Marked Identical)
- **Impact**: High (wrong CSS applied)
- **Mitigation**: Thorough testing, strict comparison logic

### Risk 3: False Negatives (Identical Classes Marked Different)
- **Impact**: Medium (extra classes created, bloat)
- **Mitigation**: Acceptable for MVP, enhance comparison later

### Risk 4: Breaking Change for Existing Users
- **Impact**: High (behavior changes for existing imports)
- **Mitigation**: Feature flag or opt-in parameter?

---

## 💬 DISAGREEMENTS WITH ORIGINAL SPEC

### 1. **Example Contradiction**
The spec says "identical styling → use existing" but the example says "identical styling → create .first-class-1". This seems like a typo.

**My Fix**: Clarify that suffix is created ONLY when styling differs.

### 2. **Missing Return Values**
Spec doesn't mention how to communicate reused classes back to caller. This is critical for HTML updates.

**My Addition**: New `reused_classes` array in response.

### 3. **Variables Behavior Unclear**
Spec says "same approach to variables" but doesn't define what that means given variables currently update-in-place.

**My Interpretation**: Variables should use incremental naming like classes, NOT update-in-place.

### 4. **No Mention of Atomic Property Comparison**
Spec implies comparing "styling" but doesn't clarify at what level (raw CSS vs converted atomic props).

**My Decision**: Compare at atomic property level for accuracy.

### 5. **No Suffixed Variant Checking**
Spec doesn't mention checking if `.button-1` already matches before creating `.button-2`.

**My Enhancement**: Check all suffixed variants for maximum reuse.

---

## 🎯 Success Criteria

### Functional Requirements
- ✅ Identical classes are detected and reused (no new class created)
- ✅ Different classes with same name get incremental suffixes
- ✅ Suffixes start at `-1` and increment sequentially
- ✅ Variables follow same duplicate detection logic
- ✅ API returns both new and reused class references

### Technical Requirements
- ✅ Comparison works with atomic property format
- ✅ Property order doesn't affect equality
- ✅ Performance acceptable for typical imports (< 100 classes)
- ✅ No breaking changes to existing API structure

### Testing Requirements
- ✅ Unit tests for comparison service (15+ test cases)
- ✅ Integration tests for duplicate detection (8+ scenarios)
- ✅ End-to-end tests for full import flow (5+ tests)
- ✅ Performance benchmark (1000 classes in < 2 seconds)

---

## 📝 Implementation Estimate

### Phase 1: Core Comparison Logic (1 day)
- Create `Class_Comparison_Service`
- Implement atomic property comparison
- Unit tests

### Phase 2: Duplicate Detection (1 day)
- Create `Duplicate_Detection_Service`
- Implement suffix generation
- Variant matching logic

### Phase 3: Integration (1 day)
- Update `Class_Conversion_Service`
- Update API response format
- Integration tests

### Phase 4: Variables (0.5 days)
- Apply same logic to variables
- Update `variables-route.php`

### Phase 5: Testing & Refinement (1.5 days)
- End-to-end tests
- Performance testing
- Edge case handling

**Total**: 5 days

---

## ❓ REQUIRED DECISIONS

Before implementation begins, we need answers to:

1. ✅ **Comparison level**: Raw CSS or atomic properties? (Recommendation: Atomic)
2. ✅ **Property order**: Should it matter? (Recommendation: No)
3. ✅ **Breakpoints**: Support multi-breakpoint or MVP single-desktop? (Recommendation: Single-desktop MVP)
4. ✅ **Variables behavior**: Incremental naming or update-in-place? (Recommendation: Incremental like classes)
5. ✅ **Suffix matching**: Check all variants or just base? (Recommendation: Check all)
6. ✅ **Performance**: Optimize now or later? (Recommendation: Later)
7. ✅ **Race conditions**: Accept or prevent? (Recommendation: Accept for MVP)
8. ✅ **Spec clarification**: Is the "identical styling → create -1" example a typo? (Needs confirmation)

---

## 📌 Next Steps

1. **Review this PRD** and provide feedback
2. **Answer critical questions** (especially #1-5 and #8)
3. **Approve/modify architecture** proposal
4. **Clarify any disagreements** I've raised
5. **Approve implementation estimate**
6. **Kick off Phase 1** implementation

---

## 🤔 Final Thoughts

This feature seems simple on the surface but has significant complexity:
- **Comparison logic** needs to be robust
- **API changes** affect downstream consumers
- **Performance** could be problematic at scale
- **Edge cases** are numerous

I recommend starting with the **simplest viable implementation**:
- Strict property comparison (no normalization)
- Single desktop breakpoint only
- No performance optimization
- Clear documentation of limitations

We can always enhance later based on real usage patterns.

**Do you agree with this conservative MVP approach, or do you want a more comprehensive initial implementation?**




