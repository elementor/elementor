# PRD: ::before and ::after Pseudo-Element Support

## Executive Summary

This PRD explores comprehensive support for CSS `::before` and `::after` pseudo-elements (including legacy `:before` and `:after` syntax) in the Elementor CSS converter system. The document investigates how these pseudo-elements interact with global classes, widget styles, widget-class processor, CSS IDs, and the unified style management architecture.

**Scope**: Limited to `::before` and `::after` only (no `::first-letter`, `::selection`, etc.)

**Goal**: Determine feasibility, architecture, and implementation path for pseudo-element support across all selector types in the conversion pipeline.

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

**Q1.1.2**: How should the `content` property be handled?
- Option A: Always collect as Custom CSS (cannot map to atomic prop)
- Option B: Create new atomic prop type: `pseudo_content_prop_type`
- Option C: Skip `content` property entirely with warning

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

**Q1.1.4**: How should the CSS renderer output pseudo-element styles?
```php
// Current rendering (styles-renderer.php):
$selector = $base_selector . $state; // .button:hover

// Proposed pseudo-element rendering:
$selector = $base_selector . $pseudo_element . $state; // .button::before:hover
// OR
$selector = $base_selector . $state . $pseudo_element; // .button:hover::before (WRONG ORDER)
```

**Q1.1.5**: Should Global Classes Processor filter out pseudo-element selectors?
- If YES: Which processor should handle them?
- If NO: How to extend detection logic?

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

**Q1.2.2**: If widget has `class="badge"`, how should rendering work?
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

**Q1.3.2**: What is the CSS rendering order?
- Correct: `.button::before:hover` (pseudo-element BEFORE pseudo-class)
- Incorrect: `.button:hover::before` (wrong)

**Q1.3.3**: How does specificity calculation change?
```
.button = 10 (class)
.button::before = 11 (class + pseudo-element)
.button:hover = 20 (class + pseudo-class)
.button::before:hover = 21 (class + pseudo-element + pseudo-class)
```
Should specificity calculator handle this automatically?

#### 1.4 Global Class Overflow with Pseudo-Elements

**Context**: System has 150 global class limit. If pseudo-elements create additional classes, overflow happens faster.

**Questions**:

**Q1.4.1**: Should pseudo-element classes count toward the 150 limit?
- If `.badge` and `.badge::before` are separate classes: 2 slots used
- If stored as variants: 1 slot used

**Q1.4.2**: What happens when pseudo-element class overflows?
- Option A: Apply base styles to widget, collect pseudo as Custom CSS
- Option B: Apply entire rule (base + pseudo) as Custom CSS
- Option C: Skip pseudo-element styles with warning

**Q1.4.3**: Should pseudo-elements have lower priority during overflow?
- Could prefer base classes and sacrifice pseudo-element styling

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

**Q2.1.2**: Where should pseudo-element styles be stored in widget structure?
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

**Q2.1.3**: Should pseudo-element styles be stored as local styles or custom CSS?
- Local styles: Can use atomic props for mappable properties (color, font-size)
- Custom CSS: Required for `content` property

**Q2.1.4**: How should Style Resolution Processor merge pseudo-element styles?
- Base styles: Highest specificity from inline/ID/class/element
- Pseudo styles: Same resolution but for pseudo-element variant only

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

**Q2.2.2**: Are pseudo-element styles "reset styles" or "widget-specific styles"?
- Reset styles: Global styling for all `<button>` elements
- Widget-specific: Per-widget `::after` content might differ

**Q2.2.3**: Should pseudo-element reset styles be applied to ALL matching widgets?
```
Input: button::after { content: " →"; }
Widgets: 5 button widgets in page
Result: All 5 get ::after styles? Or only specific ones?
```

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

**Q2.3.2**: How to identify which widget gets the pseudo-element?
- The button widget itself? (parent container)
- Child button element inside widget?
- Need to clarify DOM structure intent

**Q2.3.3**: Should widget class pseudo-element styles be widget-local or global?
- Widget-local: Applied directly to matched widget's styles
- Global: Create `.elementor-widget-button-before` global class

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

**Q3.1.3**: Should `should_skip_complex_selector()` skip pseudo-element selectors?
- Current behavior: Might skip complex selectors
- Needed: Allow pseudo-elements but extract them properly

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

**Q3.2.3**: Should flattening logic preserve pseudo-elements?
```
Input:  .container .widget .title::after { ... }
Flatten: .title--widget-container::after
         ^^^^^^^^^^^^^^^^^^^^^^^^^^ flattened
                                   ^^^^^^^ preserved
```

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

**Q4.1.3**: Should ID attributes be removed from widgets if pseudo-elements are involved?
- Current: Always removes ID attributes
- Question: Does pseudo-element affect this decision?

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

**Q4.3.2**: In what order should metadata be stored?
```php
'meta' => [
    'pseudo_element' => '::before',
    'state' => 'hover',
    'breakpoint' => 'desktop',
]
```

**Q4.3.3**: How should Unified Style Manager create variants for this?
- One variant with both meta fields?
- Two variants (base::before and base::before:hover)?

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

**Q5.1.3**: How deep can nesting go before pseudo-element is lost?
```
Config max depth: 3 levels

Valid: .a .b .c::before (3 levels + pseudo) → .c--a-b::before
Invalid: .a .b .c .d::before (4 levels + pseudo) → Skip or apply directly?
```

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

**Critical (Must Answer Before Implementation)**:
1. Should pseudo-elements be separate global classes or variants? [Q1.1.1]
2. Which processor(s) handle pseudo-elements? [Q-ARCH-1]
3. How is `content` property stored? [Q1.1.2]
4. What is the complete meta structure? [Q-DATA-2]
5. How should CSS rendering order work? [Q7.1.1]

**Important (Answer During Implementation)**:
6. Should pseudo-element rules be removed from css_rules? [Q3.3.1]
7. How does style resolution treat pseudo-elements? [Q6.1.3]
8. Should there be a dedicated processor? [Q-ARCH-1]
9. How to handle empty content? [Q8.1.1]
10. What about pseudo-element inheritance? [Q8.5.1]

**Nice to Have (Future Consideration)**:
11. Editor UI for pseudo-element editing [Q-UX-1]
12. Migration for existing Custom CSS [Q-COMPAT-3]
13. Performance indexing [Q-PERF-2]
14. Multiple pseudo-elements optimization [Q8.2.1]

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

**Document Status**: 🟡 DRAFT - Ready for Review  
**Last Updated**: 2025-11-12  
**Author**: AI Assistant  
**Review Needed**: Architecture Team, CSS Converter Team

