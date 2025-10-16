# Pseudo-Elements & Pseudo-Classes Research

## Current Implementation Status

### Supported Pseudo-Classes (Config)
**File**: `css-converter-config.php` (lines 69-80)

Currently supported pseudo-classes in CSS converter:
- `:hover` - State pseudo-class
- `:focus` - State pseudo-class
- `:active` - State pseudo-class
- `:visited` - State pseudo-class
- `:first-child` - Structural pseudo-class
- `:last-child` - Structural pseudo-class
- `:nth-child` - Structural pseudo-class
- `:not` - Functional pseudo-class
- `:before` (old syntax for `::before`) - Pseudo-element
- `:after` (old syntax for `::after`) - Pseudo-element

**Note**: Both old single-colon (`:before`, `:after`) and new double-colon syntax (`::before`, `::after`) should be supported.

### Not Currently Supported
**File**: `20251010-FUTURE.md` (lines 63-90)

#### Pseudo-Elements
- `::first-letter` - Not supported
- `::first-line` - Not supported
- `::selection` - Not supported
- `::marker` - Not supported
- `::placeholder` - Not supported
- Vendor-prefixed: `::-webkit-scrollbar`, etc. - Not supported

#### Pseudo-Classes
- `:checked`, `:disabled`, `:required` - Form pseudo-classes not supported
- `:visited` - While listed as supported, may not be fully integrated
- Complex structural: `:nth-child(2n+1)` - Parametric variants not supported

**Reason**: Atomic widgets focus on base state styling only. No prop types exist for state-based or pseudo-element styling.

---

## Atomic Widgets Architecture & State Support

### Current State System
**File**: `styles-renderer.php` (lines 116-134)

```php
$state = isset( $variant['meta']['state'] ) ? ':' . $variant['meta']['state'] : '';
$selector = $base_selector . $state;
```

**How it works**:
1. Atomic widgets store `meta['state']` in style variants
2. State is appended as pseudo-class to selector during rendering
3. Example: `.button` + `state: 'hover'` = `.button:hover`
4. Only single state per variant currently supported

### Atomic Widget Base Structure
**Files**: 
- `atomic-widget-base.php` (lines 12-65)
- `atomic-element-base.php` (lines 15-68)

**Props System**:
- Atomic widgets use prop schema (`define_props_schema()`)
- Prop types include: color, dimension, typography, transform, etc.
- No `State_Styles_Prop_Type` exists yet for hover/focus/active states
- Only base state styling currently supported

---

## Question 1: Pseudo-Element Support in Atomic Widgets

### Answer: Limited Support

**Current Capability**:
- ✅ Basic pseudo-element preservation: Pseudo-elements can be stored in CSS during parsing
- ✅ Rendered in output: `::before` and `::after` can be included in final CSS
- ❌ **Widget-level control missing**: Atomic widgets cannot manage pseudo-element content or styling
- ❌ **No dedicated prop type**: No way to control pseudo-element via widget props

**Examples**:
- ✅ `.button::before { content: "→"; }` - Can be preserved in global CSS
- ❌ `.button::before { width: 20px; }` - Cannot control via atomic widget

### Supported Pseudo-Elements
1. `::before` - Can be used in CSS rules (widget cannot control content)
2. `::after` - Can be used in CSS rules (widget cannot control content)

### NOT Supported for Widget Control
- `::first-letter` - Text styling pseudo-element
- `::first-line` - Line-based styling
- `::selection` - User selection styling
- `::marker` - List marker styling
- `::placeholder` - Input placeholder styling
- Custom/vendor-prefixed

**Why**: These require complex property mapping and don't fit current atomic prop types model.

---

## Question 2: Pseudo-Class Support

### Answer: Partial Support, State-Based Architecture

**State Pseudo-Classes** (✅ Supported):
- `:hover` - Full support via `meta['state'] = 'hover'`
- `:focus` - Full support via `meta['state'] = 'focus'`
- `:active` - Listed as supported but requires verification
- `:visited` - Listed as supported but rarely used

**Structural Pseudo-Classes** (⚠️ Limited):
- `:first-child` - Can be extracted and stored
- `:last-child` - Can be extracted and stored
- `:nth-child(n)` - Basic support, complex formulas not supported

**Form Pseudo-Classes** (❌ Not Supported):
- `:checked` - Requires form state management
- `:disabled` - Requires form state management
- `:required` - Requires form validation state
- `:invalid` - Requires form validation state

**How Flattening Handles Pseudo-Classes**:
- **State pseudo-classes** (`:hover`, `:focus`): Extracted and stored in metadata
- **Structural pseudo-classes** (`:first-child`): Can be part of selector but affect specificity
- **Combined with flattening**: `.first .second:hover` → `.second--first:hover` (state preserved)

---

## Question 3: Combined Pseudo-Selectors

### Answer: Sequential Preservation

**Current Behavior**:
```css
.class::before:hover → .class:before:hover
/* Pseudo-element comes first, pseudo-class comes second */

.class:hover::after → .class:hover::after
/* Order is important in CSS */
```

**In Atomic Widget System**:
- Only one meta['state'] supported per variant
- Multiple pseudo-selectors not yet tested/implemented
- Example: `.button:hover::before` would need separate implementation

**Flattening Order**:
1. Extract target class
2. Extract context classes
3. Preserve pseudo-element (e.g., `::before`)
4. Preserve pseudo-class state (e.g., `:hover`)
5. Result: `.target--context::before:hover`

---

## Implementation Requirements for Pattern 4 (Flatten + Pseudo)

### Phase 1: Parser Enhancement
**Location**: `nested-selector-parser.php`, `css-selector-utils.php`

- [x] Extract pseudo-element from selector during parsing
- [x] Extract pseudo-class from selector during parsing
- [ ] Store pseudo information separately from class names
- [ ] Validate pseudo-syntax (`:` vs `::`)

### Phase 2: Flattening Enhancement
**Location**: `unified-css-processor.php`

- [ ] Update flattening algorithm to preserve pseudo-element
- [ ] Update flattening algorithm to preserve pseudo-class
- [ ] Test with nested selectors: `.first > .second .third::after:hover`
- [ ] Result: `.third--first-second::after:hover`

### Phase 3: Atomic Widget Enhancement
**Location**: `atomic-widgets/prop-types/`

- [ ] Enhance `State_Styles_Prop_Type` for multiple states
- [ ] Document pseudo-element limitations
- [ ] Add validation for supported pseudo-selectors

### Phase 4: Testing
- [ ] Unit tests for pseudo-element extraction
- [ ] Unit tests for pseudo-class extraction
- [ ] Integration tests for flattened pseudo-selectors
- [ ] Edge case: Multiple pseudo-selectors
- [ ] Edge case: Vendor-prefixed pseudo-elements

---

## Architectural Decision Points

### 1. Pseudo-Elements vs Pseudo-Classes: Different Handling?
**Answer**: YES

- **Pseudo-classes**: Part of selector specificity, can vary per variant (state)
- **Pseudo-elements**: Part of selector structure, typically static

**Implementation**:
```
Selector: .first .second:hover::after
├── Base Class: .second
├── Context: .first
├── Pseudo-Class: :hover (stored in meta['state'])
└── Pseudo-Element: ::after (stored in meta['pseudo_element'])
```

### 2. Maximum Chain Depth for Flattening
**From Config**: Maximum 3 levels (per HVV notes in 6-FLATTEN-NESTED-CLASSES.md)

```
Support: .a .b .c (3 levels) → .c--a-b ✅
Skip: .a .b .c .d (4+ levels) → Apply style directly ❌
```

### 3. Character Limits for Generated Class Names
**Consideration**: CSS class names have practical limits
- Browser support: Most allow 255+ characters
- Best practice: Keep under 50 characters
- Current naming: `.target--context1-context2`

### 4. Namespace Collisions
**Risk**: `.first .second` and `.other .second` both generate `.second--*`

**Mitigation Options**:
1. Include hash suffix: `.second--{hash}`
2. Include all context: `.second--first--other`
3. Check for collisions during generation

---

## Workaround Until Full Support

### Current Limitation
Atomic widgets cannot import/preserve pseudo-class and pseudo-element styling from external CSS during conversion.

### Workaround Steps
1. **Manual state styling** in Elementor editor:
   - Select element
   - Use "Style" tab
   - Switch to `:hover` state using state selector
   - Apply styles manually

2. **For pseudo-elements**:
   - Use Global CSS in Elementor
   - Write custom CSS for `::before` and `::after`
   - Cannot be controlled via atomic widget props

3. **For complex selectors**:
   - Extract styles manually
   - Apply via widget-specific controls if available

---

## Direct Widget Application Strategy for Non-Supported Types

### Overview
For pseudo-selectors that cannot be supported by atomic widgets (e.g., `::first-letter`, `:nth-child()`, `:disabled`), **apply styles directly to the widget instead of creating global classes**.

### Architecture

#### Current Pattern (ID & Element Selectors)
**File**: `unified-css-processor.php` (lines 260-288)

```php
private function apply_direct_element_styles_to_widgets( array $rule, array $widgets ): void {
    $selector = $rule['selector'];
    $property = $rule['property'];
    $value = $rule['value'];
    $important = $rule['important'] ?? false;

    $matching_widgets = $this->find_widgets_by_element_type( $selector, $widgets );

    foreach ( $matching_widgets as $widget_id ) {
        $converted_property = $this->convert_css_property_to_atomic_widget_format( $property, $value );

        if ( $converted_property ) {
            $this->apply_direct_element_style_with_higher_priority(
                $widget_id,
                $selector,
                [
                    $property => [
                        'value' => $value,
                        'important' => $important,
                        'converted_property' => $converted_property,
                        'source' => 'direct_element_reset',
                    ],
                ]
            );
        }
    }
}
```

**Key Points**:
1. Find widgets by element type/selector
2. Convert CSS property to atomic format
3. Apply directly to widget with source tracking
4. No global class creation

### For Pseudo-Selectors

#### Strategy: Fallback to Direct Widget Application

**Selector**: `.first::first-letter`  
**Current**: ❌ Not supported  
**Solution**: Apply to widget directly

```
Input CSS:   .button::first-letter { color: red; }
           ┌─────────────────────────────────────
           │ Extract pseudo-element: ::first-letter
           │ Cannot create atomic prop for pseudo-element content
           │ → Fallback: Apply to widget directly
           │
Result:      widget['styles']['element-id'] = [
                 'variants' => [
                     'meta' => ['state' => null],  // No pseudo-element support
                     'props' => [
                         'color' => ['$$type' => 'color', 'value' => 'red']
                     ]
                 ]
             ]
           └─ Base styles applied, pseudo-element ignored
```

#### Strategy: State Pseudo-Classes → Variant States

**Selector**: `.button:hover`  
**Current**: ✅ Supported via meta['state']  
**Implementation**:

```
Input CSS:   .button:hover { background: blue; }
           ┌─────────────────────────────
           │ Extract pseudo-class: :hover
           │ Create variant with state
           │
Result:      widget['styles']['element-id'] = [
                 'variants' => [
                     'meta' => ['state' => 'hover'],
                     'props' => [
                         'background' => ['$$type' => 'color', 'value' => 'blue']
                     ]
                 ]
             ]
           └─ State-based variant created
```

#### Strategy: Unsupported → Skip or Warn

**Selector**: `input:disabled`  
**Current**: ❌ Not supported  
**Decision Matrix**:

| Pseudo-Type | Can Match Widget | Action | Result |
|---|---|---|---|
| `:hover` | ✅ Yes | Create variant with state | Applied via meta['state'] |
| `:focus` | ✅ Yes | Create variant with state | Applied via meta['state'] |
| `:active` | ✅ Yes | Create variant with state | Applied via meta['state'] |
| `::first-letter` | ❌ No | Apply base styles only | Partial application |
| `:disabled` | ❌ No | Skip selector | Warning logged |
| `:nth-child()` | ❌ No | Skip selector | Structural not supported |
| `:checked` | ❌ No | Skip selector | Form state not supported |

### Implementation Steps

#### Phase 1: Selector Classification
**Location**: `nested-selector-parser.php`

```
classify_selector( string $selector ): array
├── Extract pseudo-element (if present)
├── Extract pseudo-class (if present)
├── Determine support level
└── Return classification:
    [
        'base_selector' => '.button',
        'pseudo_element' => '::first-letter',
        'pseudo_class' => 'none',
        'support_level' => 'partial',  // full | partial | none
        'fallback_strategy' => 'apply_base_only'
    ]
```

#### Phase 2: Widget Matching
**Location**: `unified-css-processor.php`

```
find_widgets_for_unsupported_selector( string $selector ): array
├── Remove pseudo-selectors from selector
├── Match remaining selector pattern (.class, #id, element)
└── Return matching widget IDs
```

#### Phase 3: Direct Application
**Location**: `unified-css-processor.php`

```
apply_unsupported_pseudo_styles( array $rule, array $widgets ): void
├── Classify pseudo-selector
├── If partial support:
│   └── Extract base styles
│       └── Apply to matching widgets directly
└── If no support:
    └── Log warning
        └── Skip selector
```

### Fallback Decision Logic

```
IF pseudo-class in [:hover, :focus, :active, :visited]
    → Create variant with meta['state']
ELSEIF pseudo-element in [::before, ::after]
    → Store in styles with pseudo-element marker
ELSEIF pseudo-class is structural (nth-child, first-child)
    → Apply base styles only (lose structural specificity)
ELSE
    → Log warning and skip selector
    → Reason: Form states, vendor-specific, etc.
```

### Widget Style Application Format

**Direct Widget Styles** (No Global Classes):

```php
$widget['styles'] = [
    'element-id' => [
        'id' => 'element-id',
        'label' => 'local',
        'type' => 'class',
        'variants' => [
            [
                'meta' => [
                    'breakpoint' => 'desktop',
                    'state' => null,  // OR 'hover', 'focus', etc.
                    'pseudo_element' => '::first-letter',  // NEW (optional)
                ],
                'props' => [
                    'color' => ['$$type' => 'color', 'value' => '#ff0000'],
                    'background' => ['$$type' => 'color', 'value' => '#ffffff'],
                ],
            ],
        ],
    ],
];
```

### Comparison: Global Classes vs Direct Application

| Aspect | Global Classes | Direct Application |
|---|---|---|
| **Reusability** | ✅ High (shared across elements) | ❌ Low (per-widget) |
| **Complexity** | ⚠️ Medium (class storage, mapping) | ✅ Low (direct assignment) |
| **Performance** | ✅ Fewer CSS rules | ❌ More CSS rules |
| **Non-Supported Pseudo** | ❌ Cannot handle | ✅ Handled via fallback |
| **Maintenance** | ⚠️ Requires extraction logic | ✅ Simpler tracking |

### For Non-Supported Pseudo-Selectors: Use Direct Application

**When to Use Direct Widget Application**:
- ❌ Pseudo-selector has no atomic prop type
- ❌ Selector cannot be converted to reusable class
- ❌ Widget-specific styling only
- ✅ Simple mapping between selector and widget
- ✅ Lower CSS rule count acceptable

**When to Use Global Classes**:
- ✅ Selector shared across multiple widgets
- ✅ Class is reusable pattern
- ✅ Performance is critical
- ✅ Pseudo-selector is supported (`:hover`, `:focus`)

---

## Status
✅ **RESEARCH COMPLETE** - Direct application strategy documented and ready for Phase 2 flattening implementation
