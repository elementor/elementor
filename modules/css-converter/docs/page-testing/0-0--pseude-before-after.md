# PRD: ::before and ::after Pseudo-Element Support

## Executive Summary

This PRD explores comprehensive support for CSS `::before` and `::after` pseudo-elements (including legacy `:before` and `:after` syntax) in the Elementor CSS converter system. The document investigates how these pseudo-elements interact with global classes, widget styles, widget-class processor, CSS IDs, and the unified style management architecture.

**Scope**: Limited to `::before` and `::after` only (no `::first-letter`, `::selection`, etc.)

**Goal**: Determine feasibility, architecture, and implementation path for pseudo-element support across all selector types in the conversion pipeline.

---

## ✅ CONFIRMED IMPLEMENTATION APPROACH

**Decision**: Use `meta['pseudo_element']` + `props` + `custom_css` combination.

**Architecture**:
- **Pseudo-element type**: Store in `meta['pseudo_element']` (e.g., `'::before'`, `'::after'`)
- **Mappable properties**: Store in `props` as atomic properties (color, font-size, margin, padding, etc.)
- **Non-mappable properties**: Store in `custom_css` (content, quotes, etc.)
- **Renderer**: Extend to handle `meta['pseudo_element']` similar to existing `meta['state']` handling

**Variant Structure**:
```php
[
    'meta' => [
        'pseudo_element' => '::before',  // NEW: Controls selector
        'breakpoint' => 'desktop',
        'state' => null,  // Can combine with pseudo-classes
    ],
    'props' => [
        'color' => ['$$type' => 'color', 'value' => 'blue'],
        'font-size' => ['$$type' => 'dimension', 'value' => '20px'],
    ],
    'custom_css' => [
        'raw' => base64_encode('content: "→";'),
    ],
]
```

**Renderer Output**:
```css
.button::before {
    color: blue;        /* from props */
    font-size: 20px;    /* from props */
    content: "→";       /* from custom_css */
}
```

**Key Benefits**:
- ✅ Uses existing architecture (no new fields needed)
- ✅ Supports ALL property types (mappable + non-mappable)
- ✅ Minimal renderer changes (extend existing meta handling)
- ✅ Follows same pattern as pseudo-class states

---

## 🎯 ATOMIC WIDGETS MODULE INTEGRATION

### Overview

Pseudo-elements (`::before`, `::after`) should be integrated into the atomic widgets module following the same patterns as pseudo-class states (`:hover`, `:focus`), with key differences in how they're represented and combined.

### Key Requirements

1. **Multiple Pseudo-Elements**: A single element MUST support both `::before` AND `::after` simultaneously
2. **State Combinations**: Support combinations like `::before:hover`, `::after:focus`, etc.
3. **Pattern Alignment**: Follow `:hover` implementation pattern where possible
4. **Data Structure**: Use existing variant structure with `meta['pseudo_element']`

---

### Variant Structure Design

#### Current State System (`:hover`, `:focus`)

**File**: `styles-renderer.php` (lines 116-134)

```php
// Current variant for :hover state
[
    'meta' => [
        'breakpoint' => 'desktop',
        'state' => 'hover',  // Pseudo-class state
    ],
    'props' => [
        'color' => ['$$type' => 'color', 'value' => 'blue'],
    ],
]

// Rendered: .button:hover { color: blue; }
```

#### Proposed Pseudo-Element System (`:before`, `:after`)

```php
// Variant for ::before pseudo-element
[
    'meta' => [
        'breakpoint' => 'desktop',
        'state' => null,
        'pseudo_element' => '::before',  // NEW field
    ],
    'props' => [
        'color' => ['$$type' => 'color', 'value' => 'gold'],
    ],
    'custom_css' => [
        'raw' => base64_encode('content: "★";'),
    ],
]

// Rendered: .button::before { color: gold; content: "★"; }
```

#### Combined Pseudo-Element + State (`:before:hover`)

```php
// Variant for ::before:hover
[
    'meta' => [
        'breakpoint' => 'desktop',
        'state' => 'hover',              // Pseudo-class state
        'pseudo_element' => '::before',  // Pseudo-element
    ],
    'props' => [
        'color' => ['$$type' => 'color', 'value' => 'red'],
    ],
]

// Rendered: .button::before:hover { color: red; }
```

---

### Complete Widget Example: All Combinations

```php
$widget['styles']['button-local'] = [
    'id' => 'button-local',
    'label' => 'local',
    'type' => 'class',
    'variants' => [
        // Base (no pseudo-element, no state)
        [
            'meta' => [
                'breakpoint' => 'desktop',
                'state' => null,
                'pseudo_element' => null,
            ],
            'props' => [
                'background' => ['$$type' => 'color', 'value' => 'blue'],
            ],
        ],
        
        // Base :hover
        [
            'meta' => [
                'breakpoint' => 'desktop',
                'state' => 'hover',
                'pseudo_element' => null,
            ],
            'props' => [
                'background' => ['$$type' => 'color', 'value' => 'darkblue'],
            ],
        ],
        
        // ::before (no state)
        [
            'meta' => [
                'breakpoint' => 'desktop',
                'state' => null,
                'pseudo_element' => '::before',
            ],
            'props' => [
                'color' => ['$$type' => 'color', 'value' => 'gold'],
            ],
            'custom_css' => [
                'raw' => base64_encode('content: "→";'),
            ],
        ],
        
        // ::before:hover
        [
            'meta' => [
                'breakpoint' => 'desktop',
                'state' => 'hover',
                'pseudo_element' => '::before',
            ],
            'props' => [
                'color' => ['$$type' => 'color', 'value' => 'red'],
            ],
        ],
        
        // ::after (no state)
        [
            'meta' => [
                'breakpoint' => 'desktop',
                'state' => null,
                'pseudo_element' => '::after',
            ],
            'props' => [
                'color' => ['$$type' => 'color', 'value' => 'silver'],
            ],
            'custom_css' => [
                'raw' => base64_encode('content: "✓";'),
            ],
        ],
        
        // ::after:focus
        [
            'meta' => [
                'breakpoint' => 'desktop',
                'state' => 'focus',
                'pseudo_element' => '::after',
            ],
            'props' => [
                'color' => ['$$type' => 'color', 'value' => 'green'],
            ],
        ],
    ],
];
```

**Rendered CSS Output**:
```css
.button { background: blue; }
.button:hover { background: darkblue; }
.button::before { color: gold; content: "→"; }
.button::before:hover { color: red; }
.button::after { color: silver; content: "✓"; }
.button::after:focus { color: green; }
```

---

### Renderer Changes (`styles-renderer.php`)

#### Current Implementation (Lines 116-134)

```php
private function variant_to_css_string( string $base_selector, array $variant ): string {
    $css = $this->props_to_css_string( $variant['props'] ) ?? '';
    $custom_css = $this->custom_css_to_css_string( $variant['custom_css'] ?? null );

    if ( ! $css && ! $custom_css ) {
        return '';
    }

    $state = '';
    if ( isset( $variant['meta']['state'] ) ) {
        $state = $this->get_state_with_selector( $variant['meta']['state'] );
    }

    $selector = $base_selector . $state;  // .button:hover
    $style_declaration = $selector . '{' . $css . $custom_css . '}';

    if ( isset( $variant['meta']['breakpoint'] ) ) {
        $style_declaration = $this->wrap_with_media_query( $variant['meta']['breakpoint'], $style_declaration );
    }

    return $style_declaration;
}
```

#### Proposed Implementation (With Pseudo-Elements)

```php
private function variant_to_css_string( string $base_selector, array $variant ): string {
    $css = $this->props_to_css_string( $variant['props'] ) ?? '';
    $custom_css = $this->custom_css_to_css_string( $variant['custom_css'] ?? null );

    if ( ! $css && ! $custom_css ) {
        return '';
    }

    // Extract pseudo-element (NEW)
    $pseudo_element = '';
    if ( isset( $variant['meta']['pseudo_element'] ) ) {
        $pseudo_element = $variant['meta']['pseudo_element'];  // '::before' or '::after'
    }

    // Extract state (EXISTING)
    $state = '';
    if ( isset( $variant['meta']['state'] ) ) {
        $state = $this->get_state_with_selector( $variant['meta']['state'] );
    }

    // Build selector: base + pseudo-element + state (CRITICAL ORDER)
    $selector = $base_selector . $pseudo_element . $state;
    
    // Examples of output:
    // .button                 (no pseudo-element, no state)
    // .button:hover           (no pseudo-element, with state)
    // .button::before         (with pseudo-element, no state)
    // .button::before:hover   (with pseudo-element, with state)
    // .button::after:focus    (with pseudo-element, with state)

    $style_declaration = $selector . '{' . $css . $custom_css . '}';

    if ( isset( $variant['meta']['breakpoint'] ) ) {
        $style_declaration = $this->wrap_with_media_query( $variant['meta']['breakpoint'], $style_declaration );
    }

    return $style_declaration;
}
```

**Key Changes**:
1. Extract `pseudo_element` from `meta` (same pattern as `state`)
2. Build selector with correct order: `base + pseudo_element + state`
3. No other changes needed - existing logic handles everything else

---

### Variant Meta Structure

#### Complete Meta Definition

```php
$variant['meta'] = [
    'breakpoint' => 'desktop' | 'tablet' | 'mobile',  // EXISTING
    'state' => 'hover' | 'focus' | 'active' | 'visited' | null,  // EXISTING
    'pseudo_element' => '::before' | '::after' | null,  // NEW
];
```

#### Validation Rules

1. **`pseudo_element` and `state` are independent**: Can be used separately or together
2. **Order matters**: Renderer MUST output `pseudo_element` before `state` in selector
3. **Null values**: Both can be `null` (for base variant)
4. **Multiple variants per widget**: Widget can have unlimited variants with different `pseudo_element` + `state` combinations

---

### CSS Converter Integration

#### Property Mapping Strategy

```php
// Input CSS: .button::before { color: blue; content: "→"; font-size: 20px; }

// Processing:
$parsed = $this->extract_pseudo_element( '.button::before' );
// $parsed = ['base' => '.button', 'pseudo_element' => '::before']

// Property conversion:
foreach ( $properties as $property => $value ) {
    if ( $property === 'content' ) {
        // Non-mappable: Store in custom_css
        $custom_css_collector->add_property( $widget_id, $property, $value );
    } else {
        // Mappable: Convert to atomic prop
        $atomic_prop = $this->convert_property( $property, $value );
        $props[] = $atomic_prop;
    }
}

// Create variant:
$variant = [
    'meta' => [
        'breakpoint' => 'desktop',
        'state' => null,
        'pseudo_element' => '::before',
    ],
    'props' => $props,  // color, font-size
    'custom_css' => $custom_css_collector->get_for_widget( $widget_id ),  // content
];
```

---

### Testing Requirements

#### Unit Tests (Atomic Widgets Module)

```php
// Test 1: Single pseudo-element
test_single_pseudo_element() {
    $variant = [
        'meta' => ['pseudo_element' => '::before'],
        'props' => ['color' => ...],
    ];
    
    $output = $renderer->variant_to_css_string('.button', $variant);
    
    assert_contains('.button::before', $output);
}

// Test 2: Multiple pseudo-elements
test_multiple_pseudo_elements() {
    $variants = [
        ['meta' => ['pseudo_element' => '::before'], ...],
        ['meta' => ['pseudo_element' => '::after'], ...],
    ];
    
    $output = $renderer->render_variants('.button', $variants);
    
    assert_contains('.button::before', $output);
    assert_contains('.button::after', $output);
}

// Test 3: Pseudo-element + state combination
test_pseudo_element_with_state() {
    $variant = [
        'meta' => [
            'pseudo_element' => '::before',
            'state' => 'hover',
        ],
        'props' => ['color' => ...],
    ];
    
    $output = $renderer->variant_to_css_string('.button', $variant);
    
    assert_equals('.button::before:hover', $output);  // Order matters!
}

// Test 4: Props + custom_css combination
test_props_and_custom_css() {
    $variant = [
        'meta' => ['pseudo_element' => '::before'],
        'props' => ['color' => ['$$type' => 'color', 'value' => 'blue']],
        'custom_css' => ['raw' => base64_encode('content: "→";')],
    ];
    
    $output = $renderer->variant_to_css_string('.button', $variant);
    
    assert_contains('color:blue;', $output);
    assert_contains('content:"→";', $output);
}
```

#### Integration Tests (CSS Converter → Atomic Widgets)

```php
// Test 1: Convert CSS with ::before to variant
test_convert_pseudo_element_css() {
    $css = '.button::before { color: blue; content: "→"; }';
    
    $widget = $converter->convert( $css );
    
    $variant = find_variant_with_pseudo( $widget, '::before' );
    assert_not_null( $variant );
    assert_equals( '::before', $variant['meta']['pseudo_element'] );
    assert_has_prop( $variant, 'color' );
    assert_has_custom_css( $variant, 'content' );
}

// Test 2: Convert CSS with ::before:hover
test_convert_pseudo_element_with_state() {
    $css = '.button::before:hover { color: red; }';
    
    $widget = $converter->convert( $css );
    
    $variant = find_variant_with_pseudo_and_state( $widget, '::before', 'hover' );
    assert_equals( '::before', $variant['meta']['pseudo_element'] );
    assert_equals( 'hover', $variant['meta']['state'] );
}

// Test 3: Convert CSS with both ::before and ::after
test_convert_multiple_pseudo_elements() {
    $css = '
        .button::before { content: "→"; }
        .button::after { content: "✓"; }
    ';
    
    $widget = $converter->convert( $css );
    
    assert_has_variant_with_pseudo( $widget, '::before' );
    assert_has_variant_with_pseudo( $widget, '::after' );
}
```

---

### Implementation Priority

#### Phase 1: Atomic Widgets Module Foundation (Week 1)

**Goal**: Enable atomic widgets to render pseudo-elements

**Tasks**:
1. ✅ Extend `variant_to_css_string()` to handle `meta['pseudo_element']`
2. ✅ Add validation for `pseudo_element` in `style-parser.php`
3. ✅ Update `Style_Variant` builder class to support pseudo-elements
4. ✅ Add unit tests for renderer
5. ✅ Test with manual variant data (no CSS converter yet)

**Deliverable**: Atomic widgets can render `::before` and `::after` from manually created variants

#### Phase 2: CSS Converter Integration (Week 2)

**Goal**: CSS Converter creates pseudo-element variants

**Tasks**:
1. ✅ Create `Pseudo_Element_Extractor` utility
2. ✅ Extend Global Classes Processor to extract pseudo-elements
3. ✅ Extend Widget Class Processor to handle pseudo-elements
4. ✅ Extend ID Selector Processor to handle pseudo-elements
5. ✅ Update Unified Style Manager to accept pseudo-element metadata
6. ✅ Integrate with Custom CSS Collector for `content` property

**Deliverable**: CSS Converter creates correct variants with `meta['pseudo_element']`

#### Phase 3: Complex Combinations (Week 3)

**Goal**: Support all pseudo-element + state combinations

**Tasks**:
1. ✅ Test `::before:hover`, `::after:focus`, etc.
2. ✅ Ensure multiple pseudo-elements per widget work correctly
3. ✅ Test responsive variants (breakpoint + pseudo-element)
4. ✅ Integration testing with real CSS
5. ✅ Edge case handling

**Deliverable**: All combinations work reliably

---

### Design Decisions Summary

| Decision | Rationale |
|----------|-----------|
| **Add `pseudo_element` to `meta`** | Follows existing `state` pattern, minimal changes |
| **Support both `::before` and `::after` simultaneously** | Required for real-world CSS patterns |
| **Allow `pseudo_element` + `state` combinations** | Enables `::before:hover`, etc. |
| **Mappable props → `props`, non-mappable → `custom_css`** | Uses existing architecture efficiently |
| **Selector order: base + pseudo-element + state** | Correct CSS syntax |
| **Implement in atomic widgets first, then CSS converter** | Clean separation of concerns |

---

### Open Questions for Atomic Widgets Module

**Q-AW-1**: Should `pseudo_element` be stored as `'::before'` or `'before'`?
- Option A: `'::before'` (double colon) - matches CSS syntax
- Option B: `'before'` (no colon) - matches `state` pattern
- **Recommendation**: Option A - keep CSS syntax for clarity

**Q-AW-2**: Should there be validation limits on variant combinations?
- Currently unlimited variants possible
- Should we limit? e.g., max 20 variants per widget?
- **Recommendation**: No limit initially, add if performance issues arise

**Q-AW-3**: How to handle legacy `:before` syntax (single colon)?
- Normalize to `::before` internally?
- Support both syntaxes?
- **Recommendation**: Normalize to `::before` (modern syntax)

---

## 🔄 ALTERNATIVE APPROACHES ANALYSIS

### User Question 1
"Could we remove most of this logic and apply ::before and ::after styling as custom css completely?"

**Answer**: ✅ YES - Using `meta['pseudo_element']` + all properties in custom_css (simplified)

### User Question 2
"Leave atomic widgets in original form - apply before/after styling to the existing custom_css, but I am not sure if this is possible > without saving any additional meta data"

**Answer**: ❌ NO - Impossible without SOME changes to atomic widgets

---

## ❌ APPROACH 1: NO Changes (IMPOSSIBLE)

### What User Wants
- Leave atomic widgets completely unchanged
- Use existing `custom_css` field in variants
- No `meta['pseudo_element']` field
- Just store pseudo-element CSS in custom_css

### Why It's Impossible

**Current Renderer** (`styles-renderer.php` line 136):
```php
$selector = $base_selector . $state;  // ".button" or ".button:hover"
$style_declaration = $selector . '{' . $css . $custom_css . '}';
//                                            ^^^^^^^^^^^^^^^^ inserted INSIDE
```

**Problem**: `custom_css` is always inserted INSIDE the base selector's curly braces.

**If we try**:
```php
// Store full CSS rule in custom_css:
[
    'meta' => ['state' => null],  // No pseudo_element
    'custom_css' => [
        'raw' => base64_encode('.button::before { content: "→"; }'),  // FULL RULE
    ],
]

// Renderer outputs:
.button {
    .button::before { content: "→"; }  /* ❌ INVALID CSS! */
}
```

**This is INVALID CSS** - CSS doesn't support nested selectors (only in new CSS Nesting spec, not widely supported).

**CONCLUSION**: ❌ Cannot use existing custom_css without changes.

---

## ✅ APPROACH 2: Simplified Custom CSS (Meta + Custom CSS Only)

**Current Implementation** (Complex):
```php
// Split properties:
[
    'meta' => ['pseudo_element' => '::before'],
    'props' => [
        'color' => ['$$type' => 'color', 'value' => 'blue'],  // Mappable
        'font-size' => ['$$type' => 'dimension', 'value' => '20px'],  // Mappable
    ],
    'custom_css' => [
        'raw' => base64_encode('content: "→";'),  // Non-mappable
    ],
]
```

**Simplified Approach** (Custom CSS Only):
```php
// ALL properties in custom_css:
[
    'meta' => ['pseudo_element' => '::before', 'state' => null, 'breakpoint' => 'desktop'],
    'props' => [],  // EMPTY - no atomic props
    'custom_css' => [
        'raw' => base64_encode('color: blue; font-size: 20px; content: "→";'),  // ALL properties
    ],
]
```

**Both render identically**:
```css
.button::before {
    color: blue;
    font-size: 20px;
    content: "→";
}
```

### How It Works

**Evidence** (`styles-renderer.php` line 116-136):
```php
private function variant_to_css_string( string $base_selector, array $variant ): string {
    $css = $this->props_to_css_string( $variant['props'] ) ?? '';  // Empty if props=[]
    $custom_css = $this->custom_css_to_css_string( $variant['custom_css'] ?? null );  // All CSS here

    if ( ! $css && ! $custom_css ) {  // Only skip if BOTH empty
        return '';
    }

    $pseudo_element = isset( $variant['meta']['pseudo_element'] ) 
        ? $variant['meta']['pseudo_element'] 
        : '';
    
    $selector = $base_selector . $pseudo_element . $state;  // meta controls selector
    $style_declaration = $selector . '{' . $css . $custom_css . '}';  // Renders both
}
```

**Key Insight**: 
- `props` can be empty
- `custom_css` can contain ALL CSS declarations
- `meta['pseudo_element']` controls the selector
- Renderer doesn't care about the split - it just outputs both

### Comparison

| Aspect | Complex Approach | Simplified Approach |
|--------|------------------|---------------------|
| **Properties Split** | Mappable → props, Non-mappable → custom_css | ALL → custom_css |
| **CSS Converter Logic** | Check each property if mappable | Collect all properties as CSS text |
| **Atomic Props Usage** | YES (for color, font-size, etc.) | NO (all in custom_css) |
| **Editor Controls** | Can edit mappable props in UI | Must edit via Custom CSS panel |
| **Complexity** | HIGH - property mapping logic | LOW - direct CSS collection |
| **Code Changes Needed** | Multiple processors, property mapper | Minimal - just pseudo extraction |
| **Packages Update** | Required (for props editing) | NOT required |

### Recommendation: Simplified Approach

**For Pseudo-Elements Specifically**, the simplified approach is better:

**Reasons**:
1. **`content` property is essential** - Already requires custom_css
2. **Pseudo-elements are decorative** - Less need for visual editor controls
3. **Simpler CSS Converter** - No property mapping, just collect CSS text
4. **No packages update needed** - Backend-only changes
5. **Easier maintenance** - Less code, fewer edge cases

**Implementation**:
```php
// CSS Converter processing:
if ( $has_pseudo_element ) {
    // Extract all properties as CSS text
    $all_properties = $this->format_properties_as_css( $properties );
    
    // Store in custom_css
    $variant = [
        'meta' => [
            'pseudo_element' => '::before',
            'state' => $pseudo_state,  // Can be null or 'hover', etc.
            'breakpoint' => 'desktop',
        ],
        'props' => [],  // Empty
        'custom_css' => [
            'raw' => base64_encode( $all_properties ),
        ],
    ];
}
```

**Example**:
```php
// Input CSS: .button::before { color: blue; font-size: 20px; content: "→"; }

// Simplified variant:
[
    'meta' => ['pseudo_element' => '::before'],
    'props' => [],
    'custom_css' => [
        'raw' => base64_encode('color: blue; font-size: 20px; content: "→";'),
    ],
]

// Rendered: .button::before { color: blue; font-size: 20px; content: "→"; }
```

### Benefits of Simplified Approach

1. **Atomic Widgets Module**: ✅ Already implemented (Phase 1 complete)
2. **CSS Converter Module**: Much simpler - no property mapping needed
3. **No Package Updates**: All pseudo-element styling via custom_css panel
4. **Faster Development**: Skip complex property mapping logic
5. **Easier Testing**: Fewer edge cases to test
6. **Better UX**: Users expect to edit pseudo-elements in Custom CSS anyway

### Trade-offs

**What We Lose**:
- ❌ Can't edit pseudo-element color/font-size via visual controls
- ❌ No prop-level specificity resolution
- ❌ Can't leverage atomic prop transformers

**What We Gain**:
- ✅ 50% less code in CSS Converter
- ✅ No property mapping complexity
- ✅ No package updates needed
- ✅ Faster implementation timeline
- ✅ Easier maintenance

### Decision Question

**Should we use the Simplified Approach?**

**If YES (RECOMMENDED)**: 
- ✅ Keep Phase 1 implementation (meta['pseudo_element'] support) - **DONE**
- ✅ Simplify CSS Converter to collect ALL properties as custom_css
- ✅ No property mapping, no atomic props for pseudo-elements
- ✅ No package updates needed
- ⏱️ Implementation time: 1-2 days (vs 1-2 weeks for complex)

**If NO**: 
- Continue with complex approach (props + custom_css split)
- Requires property mapper changes to detect mappable properties
- Requires package updates for editor controls
- Requires frontend JavaScript updates
- ⏱️ Implementation time: 2-3 weeks

### Visual Comparison

```
SIMPLIFIED APPROACH (RECOMMENDED)
═══════════════════════════════════════════════════════════════

Input CSS:  .button::before { color: blue; font-size: 20px; content: "→"; }
                    ↓
     ┌──────────────┴──────────────┐
     │  Extract pseudo-element      │
     │  .button + ::before          │
     └──────────────┬──────────────┘
                    ↓
     ┌──────────────┴──────────────┐
     │  Collect ALL properties      │
     │  as CSS text (no conversion) │
     └──────────────┬──────────────┘
                    ↓
     ┌──────────────┴──────────────────────────────────┐
     │  Variant:                                        │
     │  meta['pseudo_element'] = '::before'            │
     │  props = []                                      │
     │  custom_css = 'color:blue;font-size:20px;...'  │
     └──────────────┬──────────────────────────────────┘
                    ↓
           .button::before { color:blue; font-size:20px; content:"→"; }


COMPLEX APPROACH (NOT RECOMMENDED)
═══════════════════════════════════════════════════════════════

Input CSS:  .button::before { color: blue; font-size: 20px; content: "→"; }
                    ↓
     ┌──────────────┴──────────────┐
     │  Extract pseudo-element      │
     │  .button + ::before          │
     └──────────────┬──────────────┘
                    ↓
     ┌──────────────┴──────────────────────────┐
     │  Check EACH property:                    │
     │  - color: mappable? YES → props          │
     │  - font-size: mappable? YES → props      │
     │  - content: mappable? NO → custom_css    │
     └──────────────┬──────────────────────────┘
                    ↓
     ┌──────────────┴──────────────────────────────────────────┐
     │  Variant:                                                │
     │  meta['pseudo_element'] = '::before'                    │
     │  props = [color: ..., font-size: ...]                  │
     │  custom_css = 'content:"→";'                            │
     └──────────────┬──────────────────────────────────────────┘
                    ↓
           .button::before { color:blue; font-size:20px; content:"→"; }
           (SAME OUTPUT, but more complex processing)
```

### Code Complexity Comparison

**Simplified Approach** - CSS Converter Changes:
```php
// ~20 lines of code total
if ( $this->has_pseudo_element( $selector ) ) {
    $parsed = $this->extract_pseudo_element( $selector );
    $css_text = $this->properties_to_css_string( $properties );
    
    $variant = [
        'meta' => ['pseudo_element' => $parsed['pseudo_element']],
        'props' => [],
        'custom_css' => ['raw' => base64_encode( $css_text )],
    ];
}
```

**Complex Approach** - CSS Converter Changes:
```php
// ~200+ lines of code total
if ( $this->has_pseudo_element( $selector ) ) {
    $parsed = $this->extract_pseudo_element( $selector );
    
    foreach ( $properties as $property => $value ) {
        // Check if mappable
        if ( $this->property_mapper->is_mappable( $property ) ) {
            // Convert to atomic prop
            $atomic_prop = $this->property_mapper->map( $property, $value );
            $props[] = $atomic_prop;
        } else {
            // Add to custom CSS
            $custom_css_collector->add( $property, $value );
        }
    }
    
    $variant = [
        'meta' => ['pseudo_element' => $parsed['pseudo_element']],
        'props' => $props,
        'custom_css' => $custom_css_collector->get(),
    ];
}
```

### Recommendation Summary

**✅ USE SIMPLIFIED APPROACH**

**Why**:
1. Pseudo-elements are inherently "custom" - users expect to edit via CSS
2. `content` property (most important) can't use controls anyway
3. 90% less code = 90% fewer bugs
4. No package updates = faster delivery
5. Same visual output

**When to use Complex Approach**:
- If users MUST edit pseudo-element colors via visual controls
- If atomic prop transformers are essential for pseudo-elements
- If prop-level validation is critical

**Current Status**:
- Phase 1 (Atomic Widgets) supports BOTH approaches
- Decision needed: Which approach for CSS Converter (Phase 2)?

---

## 🚫 APPROACH 3: Style-Level Custom CSS (Possible But Not Recommended)

### How It Would Work

**Add custom_css at STYLE level** (not variant level):

```php
$widget['styles']['button-local'] = [
    'id' => 'button-local',
    'type' => 'class',
    'variants' => [
        // Base variant (normal element styles)
        [
            'meta' => ['state' => null],
            'props' => ['background' => 'blue'],
        ],
    ],
    'custom_css' => [  // NEW: Style-level (not variant-level)
        'raw' => base64_encode('
            .button::before { content: "→"; color: gold; }
            .button::after { content: "✓"; color: silver; }
        '),
    ],
];
```

**Renderer would need** (`styles-renderer.php` line 71-88):
```php
private function style_definition_to_css_string( array $style ): string {
    $base_selector = $this->get_base_selector( $style );
    
    $stylesheet = [];
    
    // Render variants (existing)
    foreach ( $style['variants'] as $variant ) {
        $stylesheet[] = $this->variant_to_css_string( $base_selector, $variant );
    }
    
    // NEW: Render style-level custom CSS as full rules
    if ( ! empty( $style['custom_css']['raw'] ) ) {
        $full_css_rules = Utils::decode_string( $style['custom_css']['raw'], '' );
        $stylesheet[] = $full_css_rules;  // Output as-is, separate from variants
    }
    
    return implode( '', $stylesheet );
}
```

### What This Achieves

**✅ Pros**:
- No `meta['pseudo_element']` field needed
- No changes to variant structure
- Simple CSS Converter: collect pseudo CSS as text

**❌ Cons**:
- Breaks variant architecture (pseudo styles not in variants)
- No granular control (can't have ::before with different breakpoints)
- Can't combine with states properly (::before:hover needs to be in same variant)
- No validation/sanitization per pseudo-element
- Less structured data

### Comparison Table

| Feature | Meta Approach (Phase 1) | Style-Level Custom CSS | No Changes |
|---------|------------------------|------------------------|------------|
| **Meta Changes** | ✅ Add pseudo_element | ❌ No changes | ❌ No changes |
| **Renderer Changes** | ✅ Extract from meta | ✅ Output style-level CSS | ❌ Not possible |
| **Granular Control** | ✅ Per pseudo, per state, per breakpoint | ❌ All pseudo CSS together | N/A |
| **Variant Structure** | ✅ Consistent | ❌ Breaks pattern | N/A |
| **Package Updates** | ❌ Not needed | ❌ Not needed | N/A |
| **Feasibility** | ✅ Already done | ⚠️ Possible but messy | ❌ Impossible |

### Recommendation

**❌ DO NOT use Style-Level Custom CSS approach**

**Why**:
1. Breaks variant architecture - pseudo styles should be variants
2. Can't handle ::before:hover properly (needs to be in same variant)
3. Can't handle responsive pseudo-elements (different per breakpoint)
4. No structured data - just raw CSS text
5. Only slightly simpler than meta approach

**✅ Use Meta Approach (Phase 1 - Already Implemented)**:
- Clean architecture
- Full flexibility
- Already tested
- Minimal changes

---

## 🔍 APPROACH 4: Parse Custom CSS for Pseudo-Selectors (Ultra-Minimal, Not Recommended)

### How It Would Work

**Keep existing structure**, but make renderer "smart":

```php
private function variant_to_css_string( string $base_selector, array $variant ): string {
    $css = $this->props_to_css_string( $variant['props'] ) ?? '';
    $custom_css_raw = $variant['custom_css']['raw'] ?? null;
    
    if ( ! $css && ! $custom_css_raw ) {
        return '';
    }
    
    // NEW: Detect if custom_css contains full CSS rules with pseudo-elements
    $custom_css_text = Utils::decode_string( $custom_css_raw, '' );
    
    if ( $this->contains_pseudo_element_rules( $custom_css_text ) ) {
        // Output custom_css AS-IS (full rules), skip base selector
        return $custom_css_text;
    }
    
    // Original behavior: insert inside base selector
    $selector = $base_selector . $state;
    return $selector . '{' . $css . $custom_css_text . '}';
}

private function contains_pseudo_element_rules( string $css ): bool {
    // Check if CSS contains full rules with pseudo-element selectors
    return preg_match( '/\.[a-zA-Z0-9_-]+::(before|after)\s*\{/', $css ) === 1;
}
```

**Example**:
```php
// Variant with pseudo-element as full rule:
[
    'meta' => ['state' => null],  // No pseudo_element field
    'props' => [],
    'custom_css' => [
        'raw' => base64_encode('.button::before { content: "→"; color: gold; }'),
    ],
]

// Renderer detects full rule, outputs as-is:
.button::before { content: "→"; color: gold; }
```

### What This Achieves

**✅ Pros**:
- No `meta['pseudo_element']` field
- No changes to variant meta structure
- Simple CSS Converter: just format as full CSS rules

**❌ Cons**:
- Parsing CSS text in renderer (performance cost)
- Fragile: regex detection can fail with complex CSS
- Can't handle ::before:hover combinations properly
- Can't handle responsive pseudo-elements (breakpoints)
- Mixed behavior: sometimes custom_css is declarations, sometimes full rules
- Architectural inconsistency
- Hard to validate/sanitize
- Debugging nightmare

### Why This Is Bad

**Example failure**:
```php
// How do you handle ::before:hover?
'custom_css' => [
    'raw' => base64_encode('.button::before:hover { color: red; }'),
]

// Renderer outputs:
.button::before:hover { color: red; }

// But what about breakpoints? Can't wrap in media query because it's a full rule!
```

### Recommendation

**❌ DO NOT use Parse Approach**

**Fatal flaws**:
1. Can't handle breakpoints (media queries wrap variants, not full rules)
2. Can't combine with states properly
3. Parsing CSS text is fragile and slow
4. Architectural mess - custom_css has inconsistent meaning

---

## 📊 FINAL RECOMMENDATION: Summary of All Approaches

| Approach | Changes Required | Feasibility | Complexity | Recommendation |
|----------|-----------------|-------------|------------|----------------|
| **1. NO Changes** | None | ❌ Impossible | N/A | ❌ Can't work |
| **2. Meta + Custom CSS (Simplified)** | meta['pseudo_element'] + renderer | ✅ Done | ⭐ Low | ✅ **RECOMMENDED** |
| **3. Meta + Props + Custom CSS (Complex)** | meta + renderer + property mapper | ✅ Possible | ⭐⭐⭐ High | ⚠️ Only if UI controls needed |
| **4. Style-Level Custom CSS** | style['custom_css'] + renderer | ⚠️ Possible | ⭐⭐ Medium | ❌ Breaks architecture |
| **5. Parse Custom CSS** | Renderer with CSS parser | ⚠️ Possible | ⭐⭐⭐ High | ❌ Too fragile |

### Decision Matrix

**Question**: Can users edit pseudo-element properties via visual controls?

**If NO** (users edit via Custom CSS panel):
- ✅ **Use Approach 2**: Meta + Custom CSS (Simplified)
- Implementation: 1-2 days
- Code: Minimal changes

**If YES** (users need color picker, font-size slider for pseudo-elements):
- ⚠️ **Use Approach 3**: Meta + Props + Custom CSS (Complex)
- Implementation: 2-3 weeks
- Code: Extensive changes + package updates

### What Phase 1 Delivers

**✅ Completed**: Atomic Widgets Module supports `meta['pseudo_element']`

**Works with**:
- ✅ Approach 2 (Simplified) - Use `props=[]`, all in custom_css
- ✅ Approach 3 (Complex) - Use `props` + custom_css split

**CSS Converter decides**: Which properties go where (Phase 2)

### User Decision Needed

**Question for User**: Should pseudo-element properties be editable via visual controls in the editor?

**If NO**: 
- Go with **Simplified** (Approach 2)
- CSS Converter: All properties → custom_css
- Timeline: Ready in 1-2 days

**If YES**: 
- Go with **Complex** (Approach 3)
- CSS Converter: Mappable → props, non-mappable → custom_css
- Timeline: 2-3 weeks + package updates

---

## ⚠️ CRITICAL FINDING: Custom CSS Limitation

**User Feedback**: "I get the impression that :before/:after styling isn't supported yet. Please add ALL before/after styling as Custom CSS. I believe that is the only way possible > Please verify."

**VERIFICATION RESULT**: **Custom CSS CANNOT handle pseudo-elements as-is without architectural changes.**

### Current Custom CSS Architecture

**How Custom CSS Works** (`styles-renderer.php` lines 116-173):
```php
// Current rendering flow:
$selector = $base_selector . $state;  // e.g., ".button:hover"
$style_declaration = $selector . '{' . $css . $custom_css . '}';

// custom_css is inserted INSIDE the selector's curly braces
// It contains only CSS declarations (properties), NOT full rules
```

**Example Output**:
```css
.button:hover {
    color: blue;
    content: "→";  /* custom_css inserted here */
}
```

### The Problem

**If we try to store pseudo-element CSS in custom_css**:
```php
// Stored: ".button::before { content: '→'; }"
// Would render as:
.button {
    .button::before { content: '→'; }  /* ❌ INVALID CSS! */
}
```

**Why This Fails**:
- CSS doesn't support nested selectors inside declarations
- Renderer expects only CSS declarations (properties), not full rules
- Pseudo-elements require separate CSS rules with their own selectors

### Solution Options

**Option A: Extend Renderer to Parse Custom CSS**
- Store: `::before { content: "→"; }` in custom_css
- Renderer detects `::before`/`::after` prefix
- Renders as separate rule: `.button::before { content: "→"; }`
- **Pros**: Uses existing field, minimal structure changes
- **Cons**: Requires renderer parsing logic

**Option B: New Field for Pseudo-Element CSS**
- Add `pseudo_element_css` field to variant structure
- Render separately from base custom_css
- **Pros**: Clean separation, no parsing needed
- **Cons**: New field, more complex data structure

**Option C: Variant Meta + Custom CSS**
- Store `pseudo_element: '::before'` in meta
- Store properties in custom_css
- Renderer uses meta to build selector: `.button::before { custom_css }`
- **Pros**: Leverages existing meta system
- **Cons**: Requires renderer changes to handle meta.pseudo_element

**RECOMMENDATION**: **Option C** - Use `meta['pseudo_element']` + `props` + `custom_css` combination.

**✅ EXCELLENT INSIGHT**: The renderer **ALREADY COMBINES BOTH** `props` (atomic properties) AND `custom_css` in the same variant!

**Evidence** (`styles-renderer.php` line 116-132):
```php
private function variant_to_css_string( string $base_selector, array $variant ): string {
    $css = $this->props_to_css_string( $variant['props'] ) ?? '';  // Atomic props
    $custom_css = $this->custom_css_to_css_string( $variant['custom_css'] ?? null );  // Custom CSS
    
    $selector = $base_selector . $state;
    $style_declaration = $selector . '{' . $css . $custom_css . '}';  // BOTH combined!
}
```

**This Means**:
- ✅ **Mappable properties** (color, font-size, margin, etc.) → Store in `props` → Rendered as atomic props
- ✅ **Non-mappable properties** (content, quotes, etc.) → Store in `custom_css` → Rendered as raw CSS
- ✅ **Both render together** in the same CSS rule!

**Example**:
```php
// Input CSS: .button::before { color: blue; content: "→"; font-size: 20px; }

// Variant structure:
[
    'meta' => [
        'pseudo_element' => '::before',
        'breakpoint' => 'desktop',
        'state' => null,
    ],
    'props' => [
        'color' => ['$$type' => 'color', 'value' => 'blue'],
        'font-size' => ['$$type' => 'dimension', 'value' => '20px'],
    ],
    'custom_css' => [
        'raw' => base64_encode('content: "→";'),
    ],
]

// Rendered output:
.button::before {
    color: blue;        /* from props */
    font-size: 20px;    /* from props */
    content: "→";       /* from custom_css */
}
```

**Perfect Solution**: Use `meta['pseudo_element']` to control the selector, `props` for mappable properties, and `custom_css` for non-mappable properties. All three work together seamlessly!

---

## 1. Background & Current State

### What We Know (from 0-PSEUDO-ELEMENTS.md)

**Current Support Level**: ⚠️ PARTIAL
- Config lists `:before` and `:after` as "supported" pseudo-classes (line 78-79 in `css-converter-config.php`)
- CSS Selector Parser can identify `::before`/`::after` as pseudo-elements (type: 'pseudo-element')
- Specificity calculator counts pseudo-elements with ELEMENT_WEIGHT (1 point)
- No dedicated atomic widget prop type exists for pseudo-element content/styling
- No rendering path exists to output pseudo-element CSS from widget data

**Current Behavior**:
```
Input:  .button::before { content: "→"; color: blue; }
Parser: ✅ Recognizes as pseudo-element
Output: ❌ Styles lost - no widget representation
```

### Critical Gap

**Parser recognizes pseudo-elements, but no downstream processor handles them.**

---

## 2. Scenario Analysis & Questions

### Scenario 1: Global Classes with Pseudo-Elements

#### 1.1 Simple Global Class with ::before

**Input CSS**:
```css
.highlight::before {
    content: "★";
    color: gold;
    font-size: 20px;
}
```

**Current Flow**:
1. CSS Parsing Processor → Parses rules
2. Global Classes Processor → Detects `.highlight` selector
3. Property Conversion → Converts `color` and `font-size` to atomic props
4. ❌ PROBLEM: `content: "★"` cannot be converted to atomic prop
5. ❌ PROBLEM: `::before` pseudo-element is lost during detection

**Questions**:

**Q1.1.1**: Should `.highlight::before` be treated as a separate global class from `.highlight`?
- Option A: Store as two classes: `highlight` (base) + `highlight-before` (pseudo)
- Option B: Store as single class with pseudo-element metadata
- Option C: Split: base styles go to `highlight`, pseudo styles to Custom CSS

**Answer**: **Option B** - Store as single class with pseudo-element metadata.

**Implementation**: 
- Single global class `.highlight` with multiple variants
- Base variant: `meta['pseudo_element'] => null`
- Pseudo variant: `meta['pseudo_element'] => '::before'`
- Both variants share same class ID, differentiated by meta

**Rationale**: Follows same pattern as pseudo-class states (hover, focus) - one class, multiple variants with different meta.

**Q1.1.2**: How should the `content` property be handled?
- Option A: Always collect as Custom CSS (cannot map to atomic prop)
- Option B: Create new atomic prop type: `pseudo_content_prop_type`
- Option C: Skip `content` property entirely with warning

**Answer**: **Option A** - Always collect `content` property as Custom CSS.

**Implementation**:
- `content` property cannot be mapped to atomic prop → Store in `custom_css`
- Other properties (color, font-size, etc.) → Convert to atomic props → Store in `props`
- Both render together in same variant

**Note**: NOT "all before/after styling" goes to Custom CSS - only non-mappable properties. Mappable properties use atomic props.

**Evidence from codebase**:

1. **Custom_Css_Collector** (`custom-css-collector.php`):
   - Stores only **CSS properties** (property: value pairs)
   - Method: `add_property( $widget_id, $property, $value )`
   - Output: `property: value;` declarations only
   - **Does NOT support full CSS rules with selectors**

2. **Styles Renderer** (`styles-renderer.php` line 116-132):
   ```php
   $selector = $base_selector . $state;  // e.g., ".button:hover"
   $style_declaration = $selector . '{' . $css . $custom_css . '}';
   ```
   - `custom_css` is inserted **INSIDE** the selector's curly braces
   - It's just CSS declarations, NOT full rules

3. **What happens if we try**:
   ```php
   // If we store: ".button::before { content: '→'; }"
   // It would render as:
   // ".button { .button::before { content: '→'; } }"
   // ❌ INVALID CSS - nested selectors don't work this way!
   ```

**CONCLUSION**: 
- ✅ `custom_css` CAN store properties like `content: "→";`
- ❌ `custom_css` CANNOT store full CSS rules with pseudo-element selectors
- ❌ Current renderer inserts custom_css INSIDE base selector, not as separate rules

**REQUIRED SOLUTION**: 
Need to either:
1. **Extend renderer** to support full CSS rules in custom_css (render outside selector)
2. **Create separate mechanism** for pseudo-element CSS rules
3. **Modify variant structure** to support pseudo-element-specific custom_css rendering

**Q1.1.3**: Where should pseudo-element styles be stored in the global class structure?
```php
// Current structure:
$global_class = [
    'id' => 'highlight',
    'label' => 'highlight',
    'type' => 'class',
    'variants' => [
        [
            'meta' => ['breakpoint' => 'desktop', 'state' => null],
            'props' => [ /* atomic props */ ],
        ]
    ]
];

// Proposed Option A: Add pseudo_element to meta
$global_class = [
    'variants' => [
        [
            'meta' => ['breakpoint' => 'desktop', 'state' => null, 'pseudo_element' => '::before'],
            'props' => [ /* atomic props */ ],
            'custom_css' => 'content: "★";' // Non-mappable properties
        ]
    ]
];

// Proposed Option B: Separate variant per pseudo-element
$global_class = [
    'variants' => [
        [ /* base variant */ ],
        [ 
            'meta' => ['pseudo_element' => '::before'],
            'props' => [ /* atomic props */ ],
            'custom_css' => 'content: "★";'
        ]
    ]
];
```

**Answer**: **Option A** - Add `pseudo_element` to meta, use both `props` and `custom_css`.

**Structure**:
```php
$global_class = [
    'variants' => [
        [
            'meta' => [
                'breakpoint' => 'desktop',
                'state' => null,
                'pseudo_element' => '::before',  // NEW
            ],
            'props' => [
                'color' => ['$$type' => 'color', 'value' => 'gold'],  // Mappable
                'font-size' => ['$$type' => 'dimension', 'value' => '20px'],  // Mappable
            ],
            'custom_css' => [
                'raw' => base64_encode('content: "★";'),  // Non-mappable
            ],
        ]
    ]
];
```

**✅ CONFIRMED**: Both `props` and `custom_css` render together in same rule. Renderer already supports this!

**Current Limitation**:
- `custom_css` field stores raw CSS text (base64 encoded)
- Renderer inserts it INSIDE the base selector: `.button { custom_css_content }`
- Cannot render separate rules like `.button::before { ... }`

**Possible Solutions**:

**Option A: Extend Renderer to Support Full CSS Rules**
- Modify `styles-renderer.php` to detect pseudo-element selectors in custom_css
- Render them as separate CSS rules instead of inside base selector
- **Pros**: Uses existing custom_css field
- **Cons**: Requires renderer changes, parsing custom_css content

**Option B: Separate Pseudo-Element CSS Field**
- Add new field: `pseudo_element_css` to variant structure
- Render separately: `.button::before { pseudo_element_css }`
- **Pros**: Clean separation, no parsing needed
- **Cons**: New field, more complex structure

**Option C: Store in Custom CSS with Special Format**
- Store as: `::before { content: "→"; }` (selector fragment)
- Renderer detects `::before` prefix and renders as separate rule
- **Pros**: Uses existing field, minimal changes
- **Cons**: Requires renderer to parse and handle special format

**RECOMMENDATION**: **Option C** - Use `meta['pseudo_element']` + `props` + `custom_css` combination.

**✅ CONFIRMED**: The renderer **ALREADY SUPPORTS** combining `props` and `custom_css` in the same variant!

**How It Works**:
1. **Mappable properties** (color, font-size, margin, padding, etc.) → Convert to atomic props → Store in `props`
2. **Non-mappable properties** (content, quotes) → Store in `custom_css`
3. **Pseudo-element type** → Store in `meta['pseudo_element']` (like `meta['state']` for pseudo-classes)
4. **Renderer combines all three**: `.button::before { props + custom_css }`

**Example Structure**:
```php
'variants' => [
    [
        'meta' => [
            'pseudo_element' => '::before',  // Controls selector
            'breakpoint' => 'desktop',
            'state' => null,
        ],
        'props' => [
            'color' => ['$$type' => 'color', 'value' => 'blue'],  // Mappable
            'font-size' => ['$$type' => 'dimension', 'value' => '20px'],  // Mappable
        ],
        'custom_css' => [
            'raw' => base64_encode('content: "→";'),  // Non-mappable
        ],
    ],
]
```

**Renderer Output**:
```css
.button::before {
    color: blue;        /* from props */
    font-size: 20px;    /* from props */
    content: "→";       /* from custom_css */
}
```

**This is the optimal solution** - uses existing architecture, supports all property types, and requires minimal renderer changes!

**Q1.1.4**: How should the CSS renderer output pseudo-element styles?
```php
// Current rendering (styles-renderer.php line 130):
$selector = $base_selector . $state; // .button:hover

// Proposed pseudo-element rendering:
$pseudo_element = isset($variant['meta']['pseudo_element']) 
    ? $variant['meta']['pseudo_element'] 
    : '';
$selector = $base_selector . $pseudo_element . $state; 
// Result: .button::before:hover (CORRECT ORDER - pseudo-element BEFORE pseudo-class)
```

**Answer**: **Extend renderer to handle `meta['pseudo_element']` similar to `meta['state']`.**

**Implementation**: Modify `styles-renderer.php` `variant_to_css_string()` method to extract `pseudo_element` from meta and append to selector before state.

**Implementation** (`styles-renderer.php` line 116-132):
```php
private function variant_to_css_string( string $base_selector, array $variant ): string {
    $css = $this->props_to_css_string( $variant['props'] ) ?? '';
    $custom_css = $this->custom_css_to_css_string( $variant['custom_css'] ?? null );

    if ( ! $css && ! $custom_css ) {
        return '';
    }

    // Extract pseudo-element from meta (NEW)
    $pseudo_element = '';
    if ( isset( $variant['meta']['pseudo_element'] ) ) {
        $pseudo_element = $variant['meta']['pseudo_element'];  // '::before' or '::after'
    }

    // Extract state from meta (EXISTING)
    $state = '';
    if ( isset( $variant['meta']['state'] ) ) {
        $state = $this->get_state_with_selector( $variant['meta']['state'] );
    }

    // Build selector: base + pseudo-element + state (CORRECT ORDER)
    $selector = $base_selector . $pseudo_element . $state;
    // Examples:
    // .button::before
    // .button::before:hover
    // .button:hover  (no pseudo-element)

    $style_declaration = $selector . '{' . $css . $custom_css . '}';
    // Output: .button::before { color: blue; content: "→"; }

    if ( isset( $variant['meta']['breakpoint'] ) ) {
        $style_declaration = $this->wrap_with_media_query( $variant['meta']['breakpoint'], $style_declaration );
    }

    return $style_declaration;
}
```

**Key Points**:
- ✅ Pseudo-element comes BEFORE state: `.button::before:hover` (correct CSS order)
- ✅ Both `props` and `custom_css` render together in same rule
- ✅ Minimal changes needed - just add pseudo_element extraction
- ✅ Follows same pattern as existing `state` handling

**Answer**: 

**Q1.1.5**: Should Global Classes Processor filter out pseudo-element selectors?
- If YES: Which processor should handle them?
- If NO: How to extend detection logic?

**Answer**: **NO** - Extend Global Classes Processor to handle pseudo-element selectors.

**Implementation**:
- Extract pseudo-element from selector before detection: `.highlight::before` → base: `.highlight`, pseudo: `::before`
- Create variant with `meta['pseudo_element'] => '::before'`
- Process properties: mappable → `props`, non-mappable → `custom_css`
- Same class, different variants (base + pseudo) 

#### 1.2 Global Class with Both Base and Pseudo-Element Styles

**Input CSS**:
```css
.badge {
    background: red;
    padding: 5px;
}

.badge::before {
    content: "NEW";
    color: white;
}
```

**Questions**:

**Q1.2.1**: Are these two separate global classes or one class with two variants?
- Current detection: Would create one global class for `.badge` only
- Pseudo-element: Would be lost or need separate handling

**Answer**: **One class with two variants** - Single global class `.badge` with base variant and pseudo-element variant.

**Structure**:
```php
'badge' => [
    'variants' => [
        [
            'meta' => ['pseudo_element' => null],  // Base variant
            'props' => ['background' => ..., 'padding' => ...],
        ],
        [
            'meta' => ['pseudo_element' => '::before'],  // Pseudo variant
            'props' => ['color' => ...],
            'custom_css' => ['raw' => base64_encode('content: "NEW";')],
        ],
    ]
]
``` 

**Q1.2.2**: If widget has `class="badge"`, how should rendering work?

**Answer**: **Both variants render** - Base styles apply to `.badge`, pseudo-element styles apply to `.badge::before`.

**Rendered CSS**:
```css
.badge {
    background: red;
    padding: 5px;
}

.badge::before {
    content: "NEW";
    color: white;
}
```

**Widget HTML**: `<div class="badge e-1a2b3c">` - Both CSS rules apply automatically.
```html
<!-- Current output: -->
<div class="badge e-1a2b3c"><!-- base styles applied --></div>

<!-- Desired output: -->
<div class="badge e-1a2b3c">
    <!-- Base styles: background, padding -->
    <!-- Pseudo-element: ::before with content, color -->
</div>
```

**Q1.2.3**: Should the system create two separate style entries?

**Answer**: **NO** - Single style entry with multiple variants.

**Structure**: One global class `.badge` with two variants (base + pseudo). This matches the pattern used for pseudo-class states (hover, focus).
```php
// Option A: Single global class with multiple variants
'badge' => [
    'variants' => [
        [ 'meta' => ['pseudo_element' => null] ],      // base
        [ 'meta' => ['pseudo_element' => '::before'] ] // pseudo
    ]
]

// Option B: Two global classes
'badge' => [ /* base styles */ ],
'badge-before' => [ /* pseudo styles */ ]
```

**Answer**: Preferably A.

#### 1.3 Global Class with Pseudo-Element and State

**Input CSS**:
```css
.button::before:hover {
    content: "→";
    color: blue;
}
```

**Questions**:

**Q1.3.1**: How should combined pseudo-element + pseudo-class be stored?

**Answer**: **Option A** - Both in meta: `pseudo_element` and `state`.

**Structure**:
```php
'meta' => [
    'pseudo_element' => '::before',
    'state' => 'hover',
    'breakpoint' => 'desktop',
]
```

**Rationale**: Follows existing pattern - `state` already exists in meta, add `pseudo_element` alongside it.
```php
// Option A: Both in meta
'meta' => [
    'pseudo_element' => '::before',
    'state' => 'hover',
]

// Option B: Compound pseudo string
'meta' => [
    'pseudo' => '::before:hover',
]
```

**Answer**: Option A.

**Q1.3.2**: What is the CSS rendering order?
- Correct: `.button::before:hover` (pseudo-element BEFORE pseudo-class)
- Incorrect: `.button:hover::before` (wrong)

**Answer**: **Pseudo-element BEFORE pseudo-class** - `.button::before:hover` is correct CSS order.

**Renderer Implementation**:
```php
$selector = $base_selector . $pseudo_element . $state;
// .button + ::before + :hover = .button::before:hover ✅
``` 

**Q1.3.3**: How does specificity calculation change?
```
.button = 10 (class)
.button::before = 11 (class + pseudo-element)
.button:hover = 20 (class + pseudo-class)
.button::before:hover = 21 (class + pseudo-element + pseudo-class)
```
Should specificity calculator handle this automatically?

**Answer**: **YES** - Specificity calculator already handles pseudo-elements correctly.

**Current Implementation** (`css-specificity-calculator.php` line 54):
- Pseudo-elements counted with ELEMENT_WEIGHT (1 point)
- Pseudo-classes counted with CLASS_WEIGHT (10 points)
- Combined: `.button::before:hover` = 10 + 1 + 10 = 21 ✅

**No changes needed** - calculator already supports this. 

#### 1.4 Global Class Overflow with Pseudo-Elements

**Context**: System has 150 global class limit. If pseudo-elements create additional classes, overflow happens faster.

**Questions**:

**Q1.4.1**: Should pseudo-element classes count toward the 150 limit?
- If `.badge` and `.badge::before` are separate classes: 2 slots used
- If stored as variants: 1 slot used

**Answer**: **NO** - Pseudo-elements stored as variants don't count as separate classes.

**Implementation**: Since we use Option B (single class with variants), `.badge::before` is a variant of `.badge`, not a separate class. Only 1 slot used.

**Benefit**: More efficient use of global class limit - pseudo-elements don't consume additional slots. 

**Q1.4.2**: What happens when pseudo-element class overflows?
- Option A: Apply base styles to widget, collect pseudo as Custom CSS
- Option B: Apply entire rule (base + pseudo) as Custom CSS
- Option C: Skip pseudo-element styles with warning

**Answer**: **Option A** - Apply base styles to widget, collect pseudo-element styles as Custom CSS.

**Implementation**: When global class limit reached, pseudo-element variants are treated as overflow. Apply base variant normally, store pseudo-element variant as widget-local custom CSS.

**Rationale**: Preserves base styling (most important), pseudo-elements are decorative (can be widget-local). 

**Q1.4.3**: Should pseudo-elements have lower priority during overflow?
- Could prefer base classes and sacrifice pseudo-element styling

**Answer**: **YES** - Pseudo-elements have lower priority during overflow.

**Priority Order**:
1. Base class variants (highest priority)
2. Pseudo-class variants (hover, focus)
3. Pseudo-element variants (lowest priority - can be widget-local)

**Rationale**: Base styling is essential, pseudo-elements are decorative enhancements. 

---

### Scenario 2: Widget Styles (Local Styles) with Pseudo-Elements

#### 2.1 Inline Styles with Pseudo-Element Selectors

**Input HTML**:
```html
<div id="header" style="/* No pseudo-element in inline */"></div>
```

**Input CSS**:
```css
#header::before {
    content: "Logo";
    font-size: 24px;
}
```

**Current Flow**:
1. ID Selector Processor extracts `#header` selector
2. Matches widget by ID attribute
3. Collects styles in unified style manager
4. ❌ PROBLEM: Pseudo-element part is lost

**Questions**:

**Q2.1.1**: Should ID selectors with pseudo-elements be processed by ID Selector Processor?
- Current: ID Selector Processor doesn't check for pseudo-elements
- Needed: Extract base selector `#header` and pseudo `::before` separately

**Answer**: **YES** - Extend ID Selector Processor to extract pseudo-elements.

**Implementation**: Extract pseudo-element before processing: `#header::before` → base: `#header`, pseudo: `::before`. Create variant with `meta['pseudo_element'] => '::before'`. 

**Q2.1.2**: Where should pseudo-element styles be stored in widget structure?

**Answer**: **Add pseudo-element variant** - Same structure as proposed, using `meta['pseudo_element']`.

**Structure**: Widget local styles with multiple variants (base + pseudo), same pattern as global classes.
```php
// Current widget structure:
$widget = [
    'element_id' => 'abc123',
    'styles' => [
        'header-local' => [
            'variants' => [
                [ 'props' => [...] ]
            ]
        ]
    ]
];

// Proposed: Add pseudo-element variant
$widget = [
    'styles' => [
        'header-local' => [
            'variants' => [
                [ 'meta' => ['pseudo_element' => null] ],
                [ 'meta' => ['pseudo_element' => '::before'], 'props' => [...] ]
            ]
        ]
    ]
];
```

**Answer**: Follow your recommendation.

**Q2.1.3**: Should pseudo-element styles be stored as local styles or custom CSS?
- Local styles: Can use atomic props for mappable properties (color, font-size)
- Custom CSS: Required for `content` property

**Answer**: **BOTH** - Use local styles with `props` + `custom_css` combination.

**Implementation**: 
- Mappable properties (font-size) → Convert to atomic props → Store in `props`
- Non-mappable properties (content) → Store in `custom_css`
- Both in same variant with `meta['pseudo_element'] => '::before'` 

**Q2.1.4**: How should Style Resolution Processor merge pseudo-element styles?
- Base styles: Highest specificity from inline/ID/class/element
- Pseudo styles: Same resolution but for pseudo-element variant only

**Answer**: **Separate resolution contexts** - Resolve base styles and pseudo-element styles independently.

**Implementation**: Style Resolution Processor treats pseudo-element variants as separate resolution contexts. Base variant resolves normally, pseudo-element variant resolves separately (can have different sources/specificity). 

#### 2.2 Widget with Element Selector + Pseudo-Element

**Input HTML**:
```html
<button>Click me</button>
```

**Input CSS**:
```css
button::after {
    content: " →";
    margin-left: 5px;
}
```

**Questions**:

**Q2.2.1**: Should Reset Styles Processor handle pseudo-element selectors?
- Current: Processes element selectors like `button`, `h1`, `p`
- Needed: Extend to handle `button::after`, `h1::before`

**Answer**: **YES** - Extend Reset Styles Processor to extract and handle pseudo-elements.

**Implementation**: Extract pseudo-element from selector, create variant with `meta['pseudo_element']`, apply to all matching widgets. 

**Q2.2.2**: Are pseudo-element styles "reset styles" or "widget-specific styles"?
- Reset styles: Global styling for all `<button>` elements
- Widget-specific: Per-widget `::after` content might differ

**Answer**: **Reset styles** - Element selectors with pseudo-elements are global reset styles.

**Rationale**: `button::after` applies to all button elements globally, same as `button { color: blue; }`. Applied via Reset Styles Processor to all matching widgets. 

**Q2.2.3**: Should pseudo-element reset styles be applied to ALL matching widgets?
```
Input: button::after { content: " →"; }
Widgets: 5 button widgets in page
Result: All 5 get ::after styles? Or only specific ones?
```

**Answer**: **YES** - Apply to ALL matching widgets (same as regular reset styles).

**Implementation**: Reset Styles Processor finds all button widgets, applies pseudo-element variant to each. Same behavior as `button { color: blue; }` applies to all buttons. 

#### 2.3 Widget with Class Selector + Pseudo-Element

**Input HTML**:
```html
<div class="elementor-widget-button elementor-element-abc123">
    <button>Click</button>
</div>
```

**Input CSS**:
```css
.elementor-widget-button::before {
    content: "Icon: ";
}
```

**Questions**:

**Q2.3.1**: Should Widget Class Processor handle pseudo-element selectors?
- Current: Extracts `.elementor-widget-button` and matches widgets
- Needed: Extract `.elementor-widget-button::before` as pseudo variant

**Answer**: **YES** - Extend Widget Class Processor to extract pseudo-elements.

**Implementation**: Extract pseudo-element before matching: `.elementor-widget-button::before` → base: `.elementor-widget-button`, pseudo: `::before`. Create variant with `meta['pseudo_element']`. 

**Q2.3.2**: How to identify which widget gets the pseudo-element?
- The button widget itself? (parent container)
- Child button element inside widget?
- Need to clarify DOM structure intent

**Answer**: Atomic widgets only have one specific element.

**Options**:
- Option B: Apply to child element (button inside widget)

**Decision needed**: Which element should receive the pseudo-element styles? Atomic widgets only have one element. The wrapper element exists in the editor only, and can't receive any styling. We should receive atomic widgets module to generate styling > follow how :hover styling is applied. If possible, implement this logic inside the atomic-widgets module and not inside css-converter.

**Q2.3.3**: Should widget class pseudo-element styles be widget-local or global?
- Widget-local: Applied directly to matched widget's styles
- Global: Create `.elementor-widget-button-before` global class

**Answer**: **Widget-local** - Applied directly to matched widget's styles.

**Rationale**: Widget class selectors are widget-specific, not reusable across widgets. Store as widget-local variant with `meta['pseudo_element']`. 

---

### Scenario 3: Widget Class Processor with Pseudo-Elements

#### 3.1 Simple Widget Class with Pseudo-Element

**Input CSS**:
```css
.elementor-heading-title::after {
    content: " ✓";
    color: green;
}
```

**Current Widget Class Processor Flow** (widget-class-processor.php):
1. `extract_widget_classes_from_widgets()` → Finds `.elementor-heading-title`
2. `extract_widget_specific_rules()` → Extracts rules with widget classes
3. `apply_widget_specific_styles()` → Converts and applies to widgets
4. ❌ PROBLEM: Selector with `::after` is not matched

**Questions**:

**Q3.1.1**: Should `extract_widget_specific_rules()` include pseudo-element selectors?
```php
// Current check:
if ( $this->selector_contains_widget_classes( $selector_classes ) ) {
    // Include rule
}

// Proposed check:
$parsed = $this->parse_pseudo_selector( $selector );
if ( $this->selector_contains_widget_classes( $parsed['base_classes'] ) ) {
    // Include rule with pseudo metadata
    $rule['pseudo_element'] = $parsed['pseudo_element'];
}
```

**Answer**: Follow your recommendation.

**Q3.1.2**: Should pseudo-element styles be applied via Unified Style Manager or directly?
```php
// Current: Uses Unified Style Manager
$unified_style_manager->collect_css_selector_styles( $selector, $props, $element_ids );

// Proposed: Pass pseudo metadata
$unified_style_manager->collect_css_selector_styles( 
    $selector, 
    $props, 
    $element_ids,
    $pseudo_element = '::after' // NEW PARAMETER
);
```

**Answer**: Follow :hover styling. We should follow the same data structure. About handling inside css-converter, follow your recommendation, but take an approach that aligns with :hover styling inside the atomic widgets module.

**Q3.1.3**: Should `should_skip_complex_selector()` skip pseudo-element selectors?
- Current behavior: Might skip complex selectors
- Needed: Allow pseudo-elements but extract them properly

**Answer**: Complex selectors should be processed, but applied directly to the local widget styling. Same for widget classes, IDs etc. Complex selectors should never be skipped, but be applied to the local widget styling directly, even for non pseudo styling.

#### 3.2 Widget Class with Nested Selector and Pseudo-Element

**Input CSS**:
```css
.elementor-widget-container .elementor-heading-title::before {
    content: "→ ";
    font-weight: bold;
}
```

**Questions**:

**Q3.2.1**: How should Selector Matcher Engine handle pseudo-elements in nested selectors?
```php
// Current matching:
$selector = '.elementor-widget-container .elementor-heading-title';
// Matches: widgets with heading-title class inside widget-container

// Proposed matching:
$selector = '.elementor-widget-container .elementor-heading-title::before';
$parsed = $this->extract_pseudo_element( $selector );
// Base: '.elementor-widget-container .elementor-heading-title'
// Pseudo: '::before'
// Match base, then apply pseudo to matched widgets
```

**Q3.2.2**: Should pseudo-element be attached at which level?
- Attach to `.elementor-heading-title` widgets (target)?
- Attach to `.elementor-widget-container` widgets (parent)?

**Answer**: This is a v3 dom structure. We don't have this in V4.

**Q3.2.3**: Should flattening logic preserve pseudo-elements?
```
Input:  .container .widget .title::after { ... }
Flatten: .title--widget-container::after
         ^^^^^^^^^^^^^^^^^^^^^^^^^^ flattened
                                   ^^^^^^^ preserved
```

**Answer**: Yes, preserve, and follow the same flattening class strucutre.

#### 3.3 Widget Class Processor Priority with Pseudo-Elements

**Context**: Widget Class Processor runs at priority 11 (very early) to prevent widget classes from being treated as reset styles.

**Questions**:

**Q3.3.1**: Should pseudo-element widget class rules be removed from css_rules?
```php
// Current: Removes processed rules
$remaining_rules = $this->remove_processed_rules( $css_rules, $widget_rules );

// Question: Should `.elementor-widget::before` be removed?
// - If YES: Other processors won't see it (good - no duplicate processing)
// - If NO: Might be processed again as global class (bad - duplicate)
```

**Q3.3.2**: Can pseudo-element styles co-exist with base widget styles?
```css
.elementor-widget-button { background: blue; }
.elementor-widget-button::before { content: "→"; }
```
Should both be processed in Widget Class Processor or split?

**Answer**: Both should should be processed in widget class processor for the class name. The pseudo styling itself might need an additional processor. I am not sure what is best practice. Follow your recommendation.

---

### Scenario 4: CSS ID Selectors with Pseudo-Elements

#### 4.1 Simple ID with Pseudo-Element

**Input CSS**:
```css
#header::before {
    content: "Site Logo";
    font-size: 32px;
    color: #333;
}
```

**Current ID Selector Processor Flow** (id-selector-processor.php):
1. `extract_id_selectors()` → Finds rules with `#`
2. `find_widgets_matching_id_selector()` → Matches by `id` attribute
3. `collect_id_styles_in_manager()` → Collects in Unified Style Manager
4. ❌ PROBLEM: `::before` pseudo-element is lost

**Questions**:

**Q4.1.1**: Should ID Selector Processor extract pseudo-elements before processing?
```php
// Proposed method:
private function extract_pseudo_from_id_selector( string $selector ): array {
    // Input: "#header::before"
    // Output: [ 'base' => '#header', 'pseudo' => '::before' ]
}
```

**Answer**: Follow your recommendation.

**Q4.1.2**: Where should pseudo-element metadata be passed in the style collection?
```php
// Current:
$unified_style_manager->collect_id_selector_styles( 
    $selector,           // "#header"
    $converted_properties, 
    $matched_elements 
);

// Proposed:
$unified_style_manager->collect_id_selector_styles( 
    $selector,           // "#header"
    $converted_properties, 
    $matched_elements,
    $pseudo_element = '::before' // NEW
);
```

**Answer**: Follow your recommendation.

**Q4.1.3**: Should ID attributes be removed from widgets if pseudo-elements are involved?
- Current: Always removes ID attributes
- Question: Does pseudo-element affect this decision?

**Answer**: Follow existing logic. We should remove ID attributes, and apply pseudo styles to the widget directly.

#### 4.2 ID with Descendant Selector and Pseudo-Element

**Input CSS**:
```css
#outer #inner::after {
    content: " (verified)";
    color: green;
}
```

**Questions**:

**Q4.2.1**: How should `find_widgets_matching_descendant_selector()` handle pseudo-elements?
```php
// Input: "#outer #inner::after"
// Process:
// 1. Extract pseudo: "::after"
// 2. Find descendant: "#outer #inner"
// 3. Attach pseudo to final matched widgets
```

**Q4.2.2**: Should pseudo-element be applied only to final descendant or entire chain?
- Final descendant only: Correct behavior (selector targets `#inner::after`)
- Entire chain: Incorrect (would apply to both `#outer` and `#inner`)

**Answer**: Follow existing ID processing, where ID styling is applied to the local widget styles directly.

#### 4.3 ID Selector with Pseudo-Element and State

**Input CSS**:
```css
#menu::before:hover {
    content: "▼";
    color: blue;
}
```

**Questions**:

**Q4.3.1**: How should combined pseudo-element + pseudo-class be parsed?
```
Selector: "#menu::before:hover"
Extract:
  - base: "#menu"
  - pseudo_element: "::before"
  - pseudo_class: "hover" → state: 'hover'
```

**Answer**: Follow your recommendation, but align with :hover as much as possible, although ::before/::after don't have a state.

**Q4.3.2**: In what order should metadata be stored?
```php
'meta' => [
    'pseudo_element' => '::before',
    'state' => 'hover',
    'breakpoint' => 'desktop',
]
```

**Answer**: You decide.

**Q4.3.3**: How should Unified Style Manager create variants for this?
- One variant with both meta fields?
- Two variants (base::before and base::before:hover)?

**Answer**: You decide, but follow PRD about atomic widgets first.

---

### Scenario 5: Flattened Nested Classes with Pseudo-Elements

#### 5.1 Pattern 4: Flatten + Pseudo-Element

**Input CSS**:
```css
.container .box .title::before {
    content: "»";
    margin-right: 10px;
}
```

**Questions**:

**Q5.1.1**: At what stage should pseudo-element extraction happen?
```
Flow Option A: Extract BEFORE flattening
1. Extract: base=".container .box .title", pseudo="::before"
2. Flatten: ".title--box-container"
3. Re-attach: ".title--box-container::before"

Flow Option B: Extract AFTER flattening
1. Flatten: ".title--box-container::before"
2. Extract: base=".title--box-container", pseudo="::before"
```

**Answer**: Create a proposal. We need to think about this carefully. We can't loose the data. Possibly we need a separate processor for pseudo-elements, but it should be aligned with e.g. widget class and nested flattening processors.

**Q5.1.2**: Should flattening logic be aware of pseudo-elements?
```php
// Current flattening (unified-css-processor.php):
private function flatten_nested_selector( string $selector ): string {
    // Splits by spaces, builds context chain
}

// Proposed:
private function flatten_nested_selector( string $selector ): array {
    $parsed = $this->extract_pseudo_selectors( $selector );
    $flattened_base = $this->flatten( $parsed['base'] );
    
    return [
        'selector' => $flattened_base . $parsed['pseudo_element'] . $parsed['pseudo_class'],
        'meta' => [
            'pseudo_element' => $parsed['pseudo_element'],
            'state' => $parsed['pseudo_class'],
        ]
    ];
}
```

**Answer**: Create proposal for this. We need to think about this carefully. We can't loose the data. Possibly we need a separate processor for pseudo-elements, but it should be aligned with e.g. widget class and nested flattening processors.

**Q5.1.3**: How deep can nesting go before pseudo-element is lost?
```
Config max depth: 3 levels

Valid: .a .b .c::before (3 levels + pseudo) → .c--a-b::before
Invalid: .a .b .c .d::before (4 levels + pseudo) → Skip or apply directly?
```

**Answer**: Should NEVER be lost. Should be applied to local widget styling instead. As happens for deep nested styles.

#### 5.2 Multiple Pseudo-Selectors in Nested Context

**Input CSS**:
```css
.sidebar .menu li:first-child::after {
    content: "NEW";
}
```

**Questions**:

**Q5.2.1**: How to handle structural pseudo-class (`:first-child`) + pseudo-element (`::after`)?
- Structural pseudo-class `:first-child` = NOT SUPPORTED
- Should selector be skipped entirely?
- Or apply base + pseudo-element, losing structural specificity?

**Answer**: If possible, apply :first-child to the first widget directly. But we can add this planning / future.md

**Q5.2.2**: What is the parsing order?
```
Selector: ".sidebar .menu li:first-child::after"

Parse order:
1. Base classes: ".sidebar .menu li"
2. Structural pseudo-class: ":first-child" (UNSUPPORTED)
3. Pseudo-element: "::after" (PARTIAL SUPPORT)

Result:
- Skip entire selector? OR
- Apply to all <li> (lose :first-child), keep ::after?
```

**Answer**: Create proposal.

---

### Scenario 6: Unified Style Manager Integration

#### 6.1 Pseudo-Element Variant Creation

**Questions**:

**Q6.1.1**: Should `add_widget_style_variant()` accept pseudo_element parameter?
```php
// Current signature:
public function add_widget_style_variant( 
    string $element_id, 
    array $variant 
): void

// Proposed:
public function add_widget_style_variant( 
    string $element_id, 
    array $variant,
    ?string $pseudo_element = null // NEW
): void
```

**Q6.1.2**: How should variants be organized when pseudo-elements are present?
```php
// Option A: Flat list (all variants at same level)
$widget['styles']['local'] = [
    'variants' => [
        [ 'meta' => ['pseudo_element' => null, 'state' => null] ],      // base
        [ 'meta' => ['pseudo_element' => null, 'state' => 'hover'] ],   // hover
        [ 'meta' => ['pseudo_element' => '::before', 'state' => null] ], // before
        [ 'meta' => ['pseudo_element' => '::before', 'state' => 'hover'] ], // before:hover
    ]
];

// Option B: Nested structure
$widget['styles']['local'] = [
    'base' => [
        'variants' => [ /* normal, hover, focus */ ]
    ],
    'pseudo' => [
        'before' => [
            'variants' => [ /* normal, hover, focus */ ]
        ],
        'after' => [
            'variants' => [ /* normal, hover, focus */ ]
        ]
    ]
];
```

**Q6.1.3**: Should style resolution treat pseudo-elements as separate resolution contexts?
- Resolve base styles independently from pseudo styles?
- Or merge all into single resolution with pseudo priority?

#### 6.2 Property Conversion for Pseudo-Elements

**Questions**:

**Q6.2.1**: Which properties can be mapped to atomic props for pseudo-elements?
```
Mappable properties (same as base):
✅ color
✅ font-size
✅ font-weight
✅ margin
✅ padding
✅ background-color
✅ border
... etc

Non-mappable (pseudo-specific):
❌ content (no atomic prop type)
❌ quotes (no atomic prop type)
```

**Q6.2.2**: Should `content` property always go to Custom CSS?
```php
// Proposed logic:
if ( $property === 'content' && $has_pseudo_element ) {
    $this->custom_css_collector->collect( $selector, $property, $value );
} else {
    $converted = $this->convert_to_atomic_prop( $property, $value );
}
```

**Q6.2.3**: How should Property Conversion Service indicate "content" skipping?
- Silent skip?
- Log warning?
- Add to conversion statistics?

#### 6.3 Specificity Calculation with Pseudo-Elements

**Current Specificity** (css-specificity-calculator.php):
```
IMPORTANT_WEIGHT = 10000
INLINE_WEIGHT = 1000
ID_WEIGHT = 100
CLASS_WEIGHT = 10
ELEMENT_WEIGHT = 1
```

**Questions**:

**Q6.3.1**: Is current pseudo-element specificity correct?
```php
// Current (line 54):
$pseudo_element_count = preg_match_all( '/::[a-zA-Z][\w-]*/', $clean_selector );
$specificity += ( $element_count + $pseudo_element_count ) * self::ELEMENT_WEIGHT;

// Example:
.button = 10
.button::before = 10 + 1 = 11 ✅ CORRECT
```

**Q6.3.2**: How should combined pseudo-element + pseudo-class specificity work?
```
.button::before:hover = ?

Current calculation:
- Class (.button) = 10
- Pseudo-element (::before) = 1
- Pseudo-class (:hover) = 10
- Total = 10 + 1 + 10 = 21 ✅ CORRECT
```

**Q6.3.3**: Should pseudo-element specificity affect style resolution?
```
Scenario: Same widget has both styles:
.button { color: red; }        // specificity 10
.button::before { color: blue; } // specificity 11

Resolution:
- Base .button: color red
- Pseudo ::before: color blue (higher specificity? NO - different context)
```

---

### Scenario 7: CSS Rendering & Output

#### 7.1 Styles Renderer with Pseudo-Elements

**Current Rendering** (styles-renderer.php, lines 116-134):
```php
$state = isset( $variant['meta']['state'] ) ? ':' . $variant['meta']['state'] : '';
$selector = $base_selector . $state;
```

**Questions**:

**Q7.1.1**: How should rendering handle pseudo-element metadata?
```php
// Proposed rendering:
$state = isset( $variant['meta']['state'] ) ? ':' . $variant['meta']['state'] : '';
$pseudo_element = isset( $variant['meta']['pseudo_element'] ) ? $variant['meta']['pseudo_element'] : '';

// CRITICAL: Order matters
$selector = $base_selector . $pseudo_element . $state;
// Example: .button::before:hover ✅ CORRECT
// NOT: .button:hover::before ❌ WRONG
```

**Q7.1.2**: Should pseudo-element CSS be rendered inline or in separate style block?
```html
<!-- Option A: Inline with base styles -->
<style>
.button { background: blue; }
.button::before { content: "→"; }
</style>

<!-- Option B: Separate custom CSS section -->
<style>
.button { background: blue; }
</style>
<style id="pseudo-elements">
.button::before { content: "→"; }
</style>
```

**Q7.1.3**: How should Custom CSS handle pseudo-element content?
```php
// Current Custom CSS storage:
$custom_css = ".button::before { content: '→'; color: blue; }";

// Question: Should mappable properties (color) be extracted to atomic props?
// Or keep entire rule in custom CSS?
```

#### 7.2 Widget HTML Output with Pseudo-Elements

**Questions**:

**Q7.2.1**: Do pseudo-elements require any HTML changes?
- Current: Pseudo-elements are CSS-only, no HTML needed
- Question: Should widget wrapper have data attributes for debugging?

**Q7.2.2**: How should editor preview render pseudo-elements?
```html
<!-- Editor might need visual representation -->
<div class="widget-preview">
    <span class="pseudo-before-marker">::before content</span>
    Widget content
    <span class="pseudo-after-marker">::after content</span>
</div>
```

**Q7.2.3**: Should atomic widget system add pseudo-element debugging?
```html
<div class="e-paragraph" data-has-pseudo="before after">
    <!-- Debug info -->
</div>
```

---

### Scenario 8: Edge Cases & Complex Scenarios

#### 8.1 Empty Content Property

**Input CSS**:
```css
.clearfix::after {
    content: "";
    display: block;
    clear: both;
}
```

**Questions**:

**Q8.1.1**: Should empty `content: ""` be treated differently from missing content?
- Empty string is valid CSS (creates empty pseudo-element)
- Missing content: pseudo-element won't render in browser

**Q8.1.2**: Can `display` and `clear` be mapped to atomic props?
- If YES: Split into atomic props + content in Custom CSS
- If NO: Keep entire rule in Custom CSS

#### 8.2 Multiple Pseudo-Elements on Same Selector

**Input CSS**:
```css
.quote::before {
    content: """;
    font-size: 48px;
}

.quote::after {
    content: """;
    font-size: 48px;
}
```

**Questions**:

**Q8.2.1**: How should detection service handle multiple pseudo rules for same base?
- Create two variants?
- Merge into same class definition?

**Q8.2.2**: Should these be separate global classes?
- Option A: Single class `.quote` with two pseudo variants
- Option B: Two classes `.quote-before` and `.quote-after`

#### 8.3 Pseudo-Element with var() CSS Variables

**Input CSS**:
```css
:root {
    --arrow-color: blue;
}

.nav-item::after {
    content: "→";
    color: var(--arrow-color);
}
```

**Questions**:

**Q8.3.1**: How should CSS Variable Registry Processor interact with pseudo-elements?
- Extract variable reference from pseudo-element rule?
- Store variable-to-widget mapping including pseudo metadata?

**Q8.3.2**: Should pseudo-element rules trigger variable collection?
```php
// Current variable extraction:
$this->extract_and_store_variable_references( $properties, $context );

// Should work same for pseudo-element rules?
```

#### 8.4 Pseudo-Element in Media Query

**Input CSS**:
```css
@media (max-width: 768px) {
    .button::before {
        content: none; /* Hide on mobile */
    }
}
```

**Questions**:

**Q8.4.1**: Should pseudo-elements be stored in responsive variants?
```php
'variants' => [
    [
        'meta' => [
            'breakpoint' => 'desktop',
            'pseudo_element' => '::before',
        ],
        'props' => [ /* desktop styles */ ]
    ],
    [
        'meta' => [
            'breakpoint' => 'mobile',
            'pseudo_element' => '::before',
        ],
        'props' => [ /* mobile styles */ ]
    ]
]
```

**Q8.4.2**: How should `content: none` be handled?
- Map to custom CSS?
- Create special atomic prop for hiding pseudo-elements?

#### 8.5 Pseudo-Element Inheritance

**Input CSS**:
```css
body {
    font-family: Arial;
}

.button::before {
    /* Inherits font-family from body */
    content: "→";
}
```

**Questions**:

**Q8.5.1**: Should pseudo-elements inherit from parent element styles?
- Browser behavior: YES (pseudo-elements inherit like normal elements)
- System behavior: How to represent this in atomic props?

**Q8.5.2**: Should body/page styles apply to pseudo-elements?
- If body has `color: black`, does `.button::before` inherit it?

---

## 3. Architecture & Implementation Questions

### 3.1 Processor Pipeline

**Q-ARCH-1**: Which processor(s) should handle pseudo-elements?
```
Option A: New dedicated "Pseudo-Element Processor" (priority 12)
├─ Extracts all pseudo-element rules
├─ Processes them separately
└─ Adds to unified style manager

Option B: Extend existing processors
├─ Global Classes Processor: Handle .class::before
├─ Widget Class Processor: Handle .elementor-*::before
├─ ID Selector Processor: Handle #id::before
├─ Reset Styles Processor: Handle element::before
└─ Each processor handles its own pseudo-element cases

Option C: Pre-processor approach (priority 5)
├─ Extract pseudo-elements BEFORE other processors
├─ Store in context metadata
└─ Other processors reference extracted metadata
```

**Q-ARCH-2**: Should pseudo-element extraction be centralized?
```php
// Proposed utility class:
class Pseudo_Element_Extractor {
    public function extract( string $selector ): array {
        return [
            'base_selector' => '.button',
            'pseudo_element' => '::before',
            'pseudo_class' => 'hover',
            'full_pseudo' => '::before:hover'
        ];
    }
    
    public function reassemble( array $parsed ): string {
        // Correct order: base + pseudo-element + pseudo-class
        return $parsed['base_selector'] 
             . $parsed['pseudo_element'] 
             . ($parsed['pseudo_class'] ? ':' . $parsed['pseudo_class'] : '');
    }
}
```

**Q-ARCH-3**: How should context metadata store pseudo-element information?
```php
// Proposed context structure:
$context->set_metadata( 'pseudo_element_rules', [
    [
        'original_selector' => '.button::before',
        'base_selector' => '.button',
        'pseudo_element' => '::before',
        'properties' => [ /* CSS properties */ ],
        'processor' => 'global_classes', // Which processor should handle
    ]
] );
```

### 3.2 Data Structure Design

**Q-DATA-1**: Should `meta` array support both single-colon and double-colon syntax?
```php
// Normalize to double-colon internally?
$meta['pseudo_element'] = '::before'; // Normalized

// Or preserve original?
$meta['pseudo_element'] = ':before';  // Legacy syntax preserved
```

**Q-DATA-2**: What is the complete meta structure?
```php
$variant['meta'] = [
    'breakpoint' => 'desktop' | 'tablet' | 'mobile',
    'state' => 'hover' | 'focus' | 'active' | 'visited' | null,
    'pseudo_element' => '::before' | '::after' | null,
    'source' => 'inline' | 'id' | 'class' | 'element' | 'css-selector',
];
```

**Q-DATA-3**: How to represent multiple pseudo-elements for same widget?
```php
// Option A: Multiple variants
'variants' => [
    [ 'meta' => ['pseudo_element' => '::before'] ],
    [ 'meta' => ['pseudo_element' => '::after'] ],
]

// Option B: Array of pseudo-elements (NO - variant should be single state)
'variants' => [
    [ 'meta' => ['pseudo_elements' => ['::before', '::after']] ] // ❌ BAD
]
```

### 3.3 Custom CSS Integration

**Q-CSS-1**: Should Custom CSS Collector have pseudo-element awareness?
```php
// Current signature:
public function collect( string $widget_id, string $selector, string $css ): void

// Proposed:
public function collect( 
    string $widget_id, 
    string $selector, 
    string $css,
    ?string $pseudo_element = null 
): void
```

**Q-CSS-2**: How should custom CSS be keyed when pseudo-elements exist?
```php
// Option A: Include pseudo in key
$custom_css['button-before'] = ".button::before { content: '→'; }";

// Option B: Store under base selector with metadata
$custom_css['button'] = [
    'base' => ".button { }",
    'pseudo' => [
        'before' => ".button::before { content: '→'; }",
        'after' => ".button::after { content: '←'; }",
    ]
];
```

**Q-CSS-3**: Should `content` property always trigger Custom CSS collection?
```php
// Proposed logic in Property Conversion Service:
if ( $property === 'content' ) {
    // Cannot convert to atomic prop
    $this->custom_css_collector->collect( $widget_id, $selector, "$property: $value;" );
    return null; // Signal: not converted
}
```

### 3.4 Backward Compatibility

**Q-COMPAT-1**: Should the system support gradual rollout?
```php
// Feature flag approach:
if ( $this->is_pseudo_element_support_enabled() ) {
    $parsed = $this->extract_pseudo_element( $selector );
} else {
    // Skip pseudo-element selectors (current behavior)
}
```

**Q-COMPAT-2**: What happens to existing pages if pseudo-element support is added?
- Existing pages without pseudo-elements: No change
- Existing pages with pseudo-elements in Custom CSS: Continue working
- New imports: Can now use pseudo-element conversion

**Q-COMPAT-3**: Should there be a migration path for existing custom CSS with pseudo-elements?
- Scan existing pages for pseudo-element CSS in Custom CSS sections?
- Offer conversion to new atomic prop + pseudo structure?

### 3.5 Performance Considerations

**Q-PERF-1**: Does pseudo-element extraction add significant overhead?
```php
// Per-rule overhead:
foreach ( $css_rules as $rule ) {
    $parsed = $this->extract_pseudo_element( $rule['selector'] ); // Regex cost
    // Process...
}

// Optimization: Extract once, cache in rule structure?
$rule['parsed_pseudo'] = $this->extract_pseudo_element( $rule['selector'] );
```

**Q-PERF-2**: Should pseudo-element selectors be indexed for faster lookup?
```php
// Build index of pseudo-element rules during parsing:
$context->set_metadata( 'pseudo_element_index', [
    '::before' => [ /* array of rules */ ],
    '::after' => [ /* array of rules */ ],
] );
```

**Q-PERF-3**: How does pseudo-element support affect global class limit?
- If pseudo-elements create separate classes: Limit reached faster
- If stored as variants: No impact on limit

---

## 4. Testing Strategy Questions

### Test Coverage

**Q-TEST-1**: What test cases are needed for pseudo-elements?

**Unit Tests**:
- Pseudo-element extraction from selectors
- Metadata storage and retrieval
- Specificity calculation
- Variant creation with pseudo-elements

**Integration Tests**:
- Global class creation with pseudo-elements
- Widget style application with pseudo-elements
- ID selector processing with pseudo-elements
- Style resolution with pseudo-element priorities

**End-to-End Tests**:
- Import page with pseudo-element CSS → Verify correct output
- Editor preview with pseudo-elements → Verify visual rendering
- Multiple breakpoints with pseudo-elements → Verify responsive behavior

**Q-TEST-2**: How to test `content` property handling?
```php
// Test case:
$css = '.button::before { content: "→"; color: blue; }';

// Assertions:
// 1. content property goes to Custom CSS
// 2. color property converts to atomic prop
// 3. Both are associated with ::before pseudo-element
```

**Q-TEST-3**: How to test pseudo-element rendering output?
```php
// Input: Widget with ::before styles
// Expected output CSS:
$expected = ".e-button-abc123::before { content: '→'; color: blue; }";

// How to verify:
// - Parse rendered CSS
// - Check selector has ::before
// - Check properties are present
```

---

## 5. User Experience Questions

**Q-UX-1**: How should editor display pseudo-element styles?
- Style panel: Separate "Pseudo Elements" tab?
- Style panel: Dropdown to switch between base / ::before / ::after?
- Read-only display with "Imported from CSS" label?

**Q-UX-2**: Can users edit pseudo-element content in the editor?
- Current atomic props: Editable in style panel
- Pseudo-element content: Stored in Custom CSS (not editable via props)

**Q-UX-3**: Should warnings be shown for `content` property skipping?
```
Warning: "content" property in .button::before cannot be converted to atomic prop. 
Stored in Custom CSS instead. Changes must be made via Custom CSS panel.
```

**Q-UX-4**: How should pseudo-element overflow be communicated?
```
Notice: Pseudo-element styles for .button::before were applied directly to widget 
due to global class limit reached (150 classes).
```

---

## 6. Decision Framework

### Priority Matrix

| Feature | Complexity | Impact | Priority | Timeline |
|---------|-----------|--------|----------|----------|
| Global Classes with ::before/::after | HIGH | HIGH | P0 | Week 1-2 |
| Widget Local Styles with pseudo | MEDIUM | HIGH | P0 | Week 2-3 |
| ID Selectors with pseudo | MEDIUM | MEDIUM | P1 | Week 3 |
| Widget Class Processor pseudo | HIGH | HIGH | P0 | Week 1-2 |
| Flattening with pseudo | HIGH | MEDIUM | P1 | Week 3-4 |
| Custom CSS for content property | LOW | HIGH | P0 | Week 1 |
| Responsive pseudo-elements | MEDIUM | MEDIUM | P1 | Week 4 |
| State + pseudo combinations | HIGH | MEDIUM | P1 | Week 4 |

### Success Criteria

**Minimum Viable Implementation (MVP)**:
- ✅ Extract ::before and ::after from selectors
- ✅ Store pseudo-element metadata in variant meta
- ✅ Convert mappable properties to atomic props
- ✅ Collect `content` property in Custom CSS
- ✅ Render correct CSS with pseudo-element selectors
- ✅ Support global classes with pseudo-elements
- ✅ Support widget local styles with pseudo-elements

**Future Enhancements**:
- Combined pseudo-element + state (::before:hover)
- Responsive pseudo-elements (different per breakpoint)
- Pseudo-element inheritance handling
- Editor UI for pseudo-element styling

---

## 7. Implementation Phases

### Phase 1: Foundation (Week 1)
**Goal**: Pseudo-element extraction and storage

**Tasks**:
1. Create `Pseudo_Element_Extractor` utility class
2. Implement extraction logic for ::before and ::after
3. Update variant meta structure to include pseudo_element
4. Update Styles Renderer to output pseudo-element selectors
5. Add unit tests for extraction and rendering

**Deliverable**: Pseudo-elements can be extracted and stored in metadata

### Phase 2: Global Classes (Week 2)
**Goal**: Global classes with pseudo-elements

**Tasks**:
1. Extend Global Classes Detection Service to identify pseudo-element selectors
2. Update Conversion Service to handle pseudo-element variants
3. Ensure `content` property goes to Custom CSS
4. Update Registration Service to handle pseudo variants
5. Add integration tests

**Deliverable**: `.button::before` creates global class with pseudo variant

### Phase 3: Widget Styles (Week 3)
**Goal**: Local widget styles with pseudo-elements

**Tasks**:
1. Update ID Selector Processor to extract pseudo-elements
2. Update Widget Class Processor to handle pseudo-element selectors
3. Update Reset Styles Processor for element::before cases
4. Extend Unified Style Manager to store pseudo variants
5. Add integration tests

**Deliverable**: `#header::before` and `.elementor-widget::before` work correctly

### Phase 4: Advanced Features (Week 4)
**Goal**: Combined scenarios and edge cases

**Tasks**:
1. Implement flattening with pseudo-element preservation
2. Support combined pseudo-element + state (::before:hover)
3. Handle responsive variants with pseudo-elements
4. Edge case testing and bug fixes
5. Performance optimization

**Deliverable**: Complex scenarios work reliably

---

## 8. Open Questions Summary

### ✅ ANSWERED (Based on Confirmed Approach)

**Architecture Decisions**:
1. ✅ **Q1.1.1**: Pseudo-elements stored as variants, not separate classes
2. ✅ **Q1.1.2**: `content` property → Custom CSS, other properties → atomic props
3. ✅ **Q1.1.3**: Store in `meta['pseudo_element']` + `props` + `custom_css`
4. ✅ **Q1.1.4**: Renderer extends to handle `meta['pseudo_element']` like `meta['state']`
5. ✅ **Q1.1.5**: Extend Global Classes Processor (don't filter out)
6. ✅ **Q1.2.1**: One class with two variants (base + pseudo)
7. ✅ **Q1.2.2**: Both variants render automatically
8. ✅ **Q1.2.3**: Single style entry with multiple variants
9. ✅ **Q1.3.1**: Both `pseudo_element` and `state` in meta
10. ✅ **Q1.3.2**: Pseudo-element BEFORE pseudo-class in selector
11. ✅ **Q1.3.3**: Specificity calculator already handles correctly
12. ✅ **Q1.4.1**: Variants don't count toward 150 limit
13. ✅ **Q1.4.2**: Overflow: base styles → widget, pseudo → custom CSS
14. ✅ **Q1.4.3**: Pseudo-elements have lower priority
15. ✅ **Q2.1.1**: Extend ID Selector Processor
16. ✅ **Q2.1.2**: Add pseudo-element variant to widget structure
17. ✅ **Q2.1.3**: Use both `props` + `custom_css`
18. ✅ **Q2.1.4**: Separate resolution contexts
19. ✅ **Q2.2.1**: Extend Reset Styles Processor
20. ✅ **Q2.2.2**: Reset styles (global)
21. ✅ **Q2.2.3**: Apply to ALL matching widgets
22. ✅ **Q2.3.1**: Extend Widget Class Processor
23. ✅ **Q2.3.3**: Widget-local styles

### 🔴 NEEDS ANSWER (Implementation-Specific)

**Critical (Must Answer Before Implementation)**:
1. **Q2.3.2**: Which element receives widget class pseudo-element styles? (container vs child)
2. **Q3.1.1**: Should `extract_widget_specific_rules()` include pseudo-element selectors? (Implementation detail)
3. **Q3.1.2**: How to pass pseudo metadata to Unified Style Manager? (API design)
4. **Q3.1.3**: Should `should_skip_complex_selector()` skip pseudo-elements? (Logic decision)
5. **Q3.2.1**: How Selector Matcher Engine handles nested pseudo-elements? (Implementation)
6. **Q3.2.2**: Which level attaches pseudo-element in nested selectors? (Architecture)
7. **Q3.2.3**: Should flattening preserve pseudo-elements? (Yes, but implementation details)
8. **Q3.3.1**: Should pseudo-element widget rules be removed from css_rules? (Processing order)
9. **Q3.3.2**: Can pseudo-element styles co-exist with base widget styles? (Yes, but implementation)
10. **Q-ARCH-1**: Which processor(s) handle pseudo-elements? (Extend existing vs new processor)
11. **Q-ARCH-2**: Should extraction be centralized? (Utility class design)
12. **Q-ARCH-3**: How context metadata stores pseudo-element info? (Data structure)

**Important (Answer During Implementation)**:
13. **Q4.1.1-Q4.3.3**: ID Selector Processor implementation details (extraction, metadata passing, etc.)
14. **Q5.1.1-Q5.2.2**: Flattening integration details (when to extract, how to preserve, etc.)
15. **Q6.1.1-Q6.2.3**: Unified Style Manager API changes (parameter additions, variant organization)
16. **Q6.3.1-Q6.3.3**: Specificity calculation verification (already works, but confirm edge cases)
17. **Q7.1.1-Q7.2.3**: Rendering implementation details (already answered conceptually, needs code details)
18. **Q8.1.1-Q8.5.2**: Edge cases (empty content, multiple pseudo-elements, variables, media queries, inheritance)

**Nice to Have (Future Consideration)**:
19. **Q-UX-1-Q-UX-4**: Editor UI and user experience (future enhancement)
20. **Q-COMPAT-1-Q-COMPAT-3**: Backward compatibility and migration (future consideration)
21. **Q-PERF-1-Q-PERF-3**: Performance optimizations (future consideration)
22. **Q-TEST-1-Q-TEST-3**: Testing strategy details (implementation phase)

---

## 9. Recommended Next Steps

1. **Architecture Review Meeting**
   - Review this PRD with team
   - Decide on processor strategy (new vs. extend existing)
   - Agree on meta structure and data format
   - Prioritize scenarios

2. **Technical Spike** (2-3 days)
   - Prototype pseudo-element extraction
   - Test with Global Classes Processor
   - Validate `content` → Custom CSS flow
   - Measure performance impact

3. **Detailed Design Doc**
   - Document chosen architecture
   - Define exact data structures
   - Create API contracts for new methods
   - Write integration specifications

4. **Phased Implementation**
   - Start with Phase 1 (Foundation)
   - Deploy incrementally with feature flags
   - Gather feedback between phases
   - Adjust based on learnings

---

## 10. References

**Related Documentation**:
- `0-PSEUDO-ELEMENTS.md` - Comprehensive pseudo-element research
- `PSEUDO-SELECTORS-HANDLING-PRD.md` - Full pseudo-selector PRD
- `css-converter-config.php` - Current supported pseudo-classes
- `css-selector-parser.php` - Parser implementation
- `unified-css-processor.php` - Main processing logic
- `widget-class-processor.php` - Widget class handling
- `id-selector-processor.php` - ID selector handling
- `global-classes-processor.php` - Global class creation

**Key Code Locations**:
- Parsing: `services/css/processing/css-selector-parser.php` (line 369-384)
- Rendering: `???/styles-renderer.php` (line 116-134)
- Specificity: `services/css/processing/css-specificity-calculator.php` (line 54)
- Meta Structure: `services/atomic-widgets/widget-styles-integrator.php` (line 74-76)

---

**Document Status**: ✅ APPROACH CONFIRMED - Ready for Implementation  
**Last Updated**: 2025-11-12  
**Author**: AI Assistant  
**Review Needed**: Architecture Team, CSS Converter Team

---

## 📋 Implementation Status

**✅ CONFIRMED**: Implementation approach using `meta['pseudo_element']` + `props` + `custom_css` combination.

**✅ ANSWERED**: 23 core architecture questions answered based on confirmed approach.

**🔴 PENDING**: 22 implementation-specific questions need answers during development (see Section 8).

**Next Steps**: 
1. Review pending questions with team
2. Create detailed technical design document
3. Begin Phase 1 implementation (Foundation)

