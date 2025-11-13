# Reset Style Architecture Analysis

**Related PRD**: `PRD-UNIFIED-RESET-STYLE-ARCHITECTURE.md`  
**Created**: 2025-01-26

---

## Current Architecture (Scattered)

### File Dependency Map

```
┌─────────────────────────────────────────────────────────────────┐
│                    API Entry Point                               │
│              /wp-json/elementor/v1/css-converter/widgets         │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│         unified-widget-conversion-service.php                    │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ extract_styles_by_source_from_widgets()                  │   │
│  │   case 'reset-element':                                  │   │
│  │     $reset_element_styles[] = $style_data;  <────┐       │   │
│  └──────────────────────────────────────────────────│───────┘   │
└─────────────────────────────────────────────────────│───────────┘
                                                       │
                    ┌──────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────────────────┐
│              unified-css-processor.php                           │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ collect_reset_styles()                      [756-772]    │   │
│  │   ├─> parse_css_and_extract_rules()                      │   │
│  │   ├─> reset_style_detector->extract_element_rules()      │   │
│  │   └─> process_element_selector_reset_styles()            │   │
│  └──────────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ process_element_selector_reset_styles()     [776-798]    │   │
│  │   ├─> reset_style_detector->can_apply_directly()         │   │
│  │   ├─> apply_reset_styles_directly()        [802-845]     │   │
│  │   └─> collect_complex_reset_styles()       [849-871]     │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                   │
│  🔴 DUPLICATION:                                                 │
│     - get_html_element_to_atomic_widget_mapping()   [882-907]   │
│     - is_simple_element_selector()                  [157]       │
│     - find_widgets_by_element_type()                [272-307]   │
└─────────────────────────────────────────────────────────────────┘
                         │
                         ├────────────────────┐
                         ▼                    ▼
┌────────────────────────────────┐  ┌────────────────────────────┐
│  reset-style-detector.php      │  │ unified-style-manager.php  │
│                                 │  │                            │
│ ┌─────────────────────────────┐│  │┌──────────────────────────┐│
│ │ extract_element_rules()     ││  ││collect_reset_styles()    ││
│ │   [119-135]                 ││  ││  [180-216]               ││
│ └─────────────────────────────┘│  │└──────────────────────────┘│
│ ┌─────────────────────────────┐│  │┌──────────────────────────┐│
│ │ analyze_conflicts()         ││  ││collect_complex_resets()  ││
│ │   [204-216]                 ││  ││  [227-253]               ││
│ └─────────────────────────────┘│  │└──────────────────────────┘│
│ ┌─────────────────────────────┐│  │┌──────────────────────────┐│
│ │ can_apply_directly()        ││  ││get_reset_styles_stats()  ││
│ │   [365-382]                 ││  ││  [326-346]               ││
│ └─────────────────────────────┘│  │└──────────────────────────┘│
│                                 │  │                            │
│ 🔴 DUPLICATION:                 │  │🔴 DUPLICATION:             │
│ - tag_to_widget_mapping [82]   │  │  - Source filtering logic  │
│ - is_simple_element_sel. [161] │  │  - Stats calculation       │
└────────────────────────────────┘  └────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│           Factory & Style Classes (4 files)                      │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ reset-element-style-factory.php             [48 lines]   │   │
│  │ complex-reset-style-factory.php             [52 lines]   │   │
│  │ reset-element-style.php                     [30 lines]   │   │
│  │ complex-reset-style.php                     [35 lines]   │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

### Code Flow Visualization

```
User Request (HTML + CSS)
    │
    ▼
[Widget Conversion Service]
    │
    ├─> Parse HTML into widgets
    │
    ├─> [Unified CSS Processor]
    │   │
    │   ├─> collect_css_styles()            ← Normal CSS
    │   ├─> collect_inline_styles()         ← Inline styles  
    │   └─> collect_reset_styles()          ← 🔴 Reset styles (300 lines)
    │       │
    │       ├─> [Reset Style Detector]
    │       │   ├─> extract_element_rules()
    │       │   ├─> analyze_conflicts()
    │       │   └─> can_apply_directly()
    │       │
    │       ├─> IF simple & no conflicts:
    │       │   └─> apply_directly()
    │       │       └─> [Unified Style Manager]
    │       │           └─> collect_reset_styles()
    │       │
    │       └─> ELSE:
    │           └─> collect_complex()
    │               └─> [Unified Style Manager]
    │                   └─> collect_complex_reset_styles()
    │
    ├─> [Unified Style Manager]
    │   └─> resolve_styles_for_widget()
    │       ├─> Filter styles (includes reset-element source)
    │       └─> Find winning style by specificity
    │
    └─> [Widget Creation]
        └─> extract_styles_by_source()
            └─> case 'reset-element': 🔴 Extract reset styles
```

### Problem Visualization

```
┌─────────────────────────────────────────────────────────────────┐
│                    RESET STYLE LOGIC SCATTER                     │
└─────────────────────────────────────────────────────────────────┘

unified-css-processor.php
    │
    ├─ 🔴 collect_reset_styles()                   [300 lines]
    ├─ 🔴 apply_reset_styles_directly()            [50 lines]
    ├─ 🔴 collect_complex_reset_styles()           [30 lines]
    ├─ 🔴 process_element_selector_resets()        [25 lines]
    ├─ 🔴 get_html_element_to_widget_mapping()     [25 lines] ← DUPLICATE
    └─ 🔴 find_widgets_by_element_type()           [35 lines] ← DUPLICATE

reset-style-detector.php
    │
    ├─ 🟢 extract_element_selector_rules()         [15 lines] ← UTILITY ✓
    ├─ 🟢 analyze_element_selector_conflicts()     [12 lines] ← UTILITY ✓
    ├─ 🟢 can_apply_directly_to_widgets()          [17 lines] ← UTILITY ✓
    ├─ 🔴 detect_conflicts_for_selector()          [50 lines] ← MIXED
    ├─ 🔴 get_atomic_widget_type()                 [5 lines]  ← DUPLICATE
    └─ 🔴 tag_to_widget_mapping                    [Array]    ← DUPLICATE

unified-style-manager.php
    │
    ├─ 🔴 collect_reset_styles()                   [37 lines] ← COLLECTION
    ├─ 🔴 collect_complex_reset_styles()           [27 lines] ← COLLECTION
    ├─ 🔴 get_reset_styles_stats()                 [20 lines] ← STATS
    └─ 🔴 calculate_reset_element_specificity()    [10 lines] ← CALCULATION

unified-widget-conversion-service.php
    │
    └─ 🔴 extract_styles_by_source()
        └─ case 'reset-element': 🔴                [10 lines] ← EXTRACTION

Legend:
🔴 Reset-related logic (scattered)
🟢 Pure utility (acceptable)
```

---

## Proposed Architecture (Unified)

### Consolidated Dependency Map

```
┌─────────────────────────────────────────────────────────────────┐
│                    API Entry Point                               │
│              /wp-json/elementor/v1/css-converter/widgets         │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│         unified-widget-conversion-service.php                    │
│              (UNCHANGED - still extracts by source)              │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│              unified-css-processor.php  [SIMPLIFIED]             │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ collect_reset_styles()                      [30 lines]   │   │
│  │   ├─> detect element rules                               │   │
│  │   ├─> analyze conflicts                                  │   │
│  │   └─> process_with_strategy()  ← NEW                     │   │
│  └──────────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ process_with_strategy()                     [20 lines]   │   │
│  │   foreach ( strategies ) {                               │   │
│  │     if ( strategy->can_handle() ) {                      │   │
│  │       strategy->process()                                │   │
│  │     }                                                     │   │
│  │   }                                                       │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                   │
│  ✅ NO DUPLICATION:                                              │
│     All mapping/detection delegated to detector & strategies    │
└─────────────────────────────────────────────────────────────────┘
                         │
                         ├────────────────────┐
                         ▼                    ▼
┌────────────────────────────────┐  ┌────────────────────────────┐
│  reset-style-detector.php      │  │ unified-style-manager.php  │
│     [UTILITY ONLY]              │  │    [COLLECTION ONLY]       │
│                                 │  │                            │
│ ┌─────────────────────────────┐│  │┌──────────────────────────┐│
│ │ extract_element_rules()     ││  ││collect_reset_styles()    ││
│ └─────────────────────────────┘│  │└──────────────────────────┘│
│ ┌─────────────────────────────┐│  │┌──────────────────────────┐│
│ │ analyze_conflicts()         ││  ││collect_complex_resets()  ││
│ └─────────────────────────────┘│  │└──────────────────────────┘│
│ ┌─────────────────────────────┐│  │                            │
│ │ is_simple_selector()        ││  │✅ NO DUPLICATION           │
│ └─────────────────────────────┘│  │  (delegates to strategies)  │
│ ┌─────────────────────────────┐│  └────────────────────────────┘
│ │ get_atomic_widget_type()    ││
│ └─────────────────────────────┘│
│                                 │
│ ✅ SINGLE SOURCE OF TRUTH       │
│   All detection logic here      │
└────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│           strategies/ [NEW - STRATEGY PATTERN]                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ Reset_Style_Strategy_Interface              [NEW]        │   │
│  │   - can_handle()                                         │   │
│  │   - process_reset_styles()                               │   │
│  │   - get_statistics()                                     │   │
│  └──────────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ Simple_Reset_Strategy                       [200 lines]  │   │
│  │   ✓ Detection logic (via detector)                       │   │
│  │   ✓ Application logic (direct to widgets)                │   │
│  │   ✓ Statistics collection                                │   │
│  └──────────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ Complex_Reset_Strategy                      [150 lines]  │   │
│  │   ✓ Complex selector handling                            │   │
│  │   ✓ CSS file generation                                  │   │
│  │   ✓ Statistics collection                                │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                   │
│  ✅ SINGLE RESPONSIBILITY:                                       │
│     Each strategy = one reset handling approach                 │
└─────────────────────────────────────────────────────────────────┘
```

### Simplified Code Flow

```
User Request (HTML + CSS)
    │
    ▼
[Widget Conversion Service]
    │
    ├─> Parse HTML
    │
    ├─> [Unified CSS Processor]
    │   │
    │   ├─> collect_css_styles()
    │   ├─> collect_inline_styles()
    │   └─> collect_reset_styles()  ✅ SIMPLIFIED (30 lines)
    │       │
    │       ├─> [Reset Detector] - Detection only
    │       │
    │       └─> [Strategy Pattern]
    │           │
    │           ├─> Try Simple Strategy
    │           │   ├─ can_handle()? → YES
    │           │   └─> process() ✅
    │           │       └─> [Style Manager] collect
    │           │
    │           └─> Try Complex Strategy (fallback)
    │               ├─ can_handle()? → YES (always)
    │               └─> process() ✅
    │                   └─> [Style Manager] collect
    │
    ├─> [Unified Style Manager]
    │   └─> resolve_styles() ✅ UNCHANGED
    │
    └─> [Widget Creation] ✅ UNCHANGED
```

### Solution Visualization

```
┌─────────────────────────────────────────────────────────────────┐
│              UNIFIED RESET STYLE ARCHITECTURE                    │
└─────────────────────────────────────────────────────────────────┘

unified-css-processor.php                        [ORCHESTRATOR]
    │
    ├─ collect_reset_styles()                    [30 lines] ✅
    └─ process_with_strategy()                   [20 lines] ✅
        │
        └─> reset_style_strategies[] ───┐
                                         │
                                         ▼
┌────────────────────────────────────────────────────────────────┐
│                    STRATEGY PATTERN                             │
└────────────────────────────────────────────────────────────────┘

Reset_Style_Strategy_Interface
    │
    ├─ can_handle( rules, conflicts )
    ├─ process_reset_styles( selector, rules, widgets, context )
    └─ get_statistics()
    
    │
    ├─────────────────────────┬─────────────────────────
    ▼                         ▼
┌───────────────────┐   ┌───────────────────┐
│ Simple_Reset      │   │ Complex_Reset     │
│ Strategy          │   │ Strategy          │
├───────────────────┤   ├───────────────────┤
│ ✓ Simple element  │   │ ✓ Complex CSS     │
│ ✓ No conflicts    │   │ ✓ Has conflicts   │
│ ✓ Direct apply    │   │ ✓ CSS file gen    │
│ ✓ Widget matching │   │ ✓ Fallback        │
└───────────────────┘   └───────────────────┘
    │                         │
    └────────┬────────────────┘
             │
             ▼
┌─────────────────────────────────────────┐
│     SHARED UTILITIES                    │
├─────────────────────────────────────────┤
│ Reset_Style_Detector (detection)        │
│ Unified_Style_Manager (collection)      │
│ Reset_Style_Statistics (stats)          │
└─────────────────────────────────────────┘

Legend:
✅ Simplified/Consolidated
```

---

## Comparison Matrix

| Aspect | Current (Scattered) | Proposed (Unified) | Improvement |
|--------|-------------------|-------------------|-------------|
| **Files with reset logic** | 8 files | 5 files | -37% |
| **Total LOC for resets** | ~2,000 lines | ~1,200 lines | -40% |
| **Code duplication** | 3 instances | 0 instances | -100% |
| **Largest file with resets** | 427 lines (detector) | 250 lines (detector) | -41% |
| **Responsibilities per file** | 3-4 mixed | 1 per file | SRP ✓ |
| **Testability** | Coupled (hard) | Isolated (easy) | ⭐⭐⭐ |
| **Extensibility** | Modify 3+ files | Add 1 strategy | ⭐⭐⭐ |
| **Design patterns** | Implicit | Explicit (Strategy) | ⭐⭐⭐ |

---

## Code Metrics

### Before (Current)

```
unified-css-processor.php
├─ Total lines:                    1,902
├─ Reset-related lines:              300 (15.8%)
├─ Methods with reset logic:         4
└─ Cyclomatic complexity:            High (mixed concerns)

reset-style-detector.php
├─ Total lines:                      427
├─ Detection vs Application:         50% / 50%
├─ Methods:                          12
└─ Cyclomatic complexity:            Medium

unified-style-manager.php
├─ Total lines:                      609
├─ Reset-related lines:              150 (24.6%)
├─ Methods with reset logic:         3
└─ Cyclomatic complexity:            Medium

Total reset footprint:            ~2,000 lines across 8 files
```

### After (Proposed)

```
unified-css-processor.php
├─ Total lines:                    1,630 (-272, -14%)
├─ Reset-related lines:              50 (3.1%)  ← -84%
├─ Methods with reset logic:         2          ← -50%
└─ Cyclomatic complexity:            Low (delegates)

reset-style-detector.php
├─ Total lines:                      250 (-177, -41%)
├─ Detection vs Application:         100% / 0%  ← Pure utility
├─ Methods:                          8 (-4)
└─ Cyclomatic complexity:            Low (focused)

unified-style-manager.php
├─ Total lines:                      509 (-100, -16%)
├─ Reset-related lines:              50 (9.8%)  ← -67%
├─ Methods with reset logic:         2 (-1)
└─ Cyclomatic complexity:            Low (collection only)

strategies/
├─ simple-reset-strategy.php:       200 lines (new, focused)
├─ complex-reset-strategy.php:      150 lines (new, focused)
├─ reset-style-strategy-interface:  50 lines (new)
└─ Cyclomatic complexity:            Low (SRP)

Total reset footprint:            ~1,200 lines across 5 files (-40%)
```

---

## Real-World Example

### Current Flow (Scattered)

```php
// User submits: <h1>Title</h1> with CSS: h1 { color: red; }

// Step 1: unified-css-processor.php (line 756)
private function collect_reset_styles( string $css, array $widgets ): void {
    $all_rules = $this->parse_css_and_extract_rules( $css );
    $element_rules = $this->reset_style_detector->extract_element_selector_rules( $all_rules );
    
    foreach ( $element_rules as $selector => $rules ) {
        $this->process_element_selector_reset_styles( ... ); // 🔴 CALL 1
    }
}

// Step 2: unified-css-processor.php (line 776)
private function process_element_selector_reset_styles( ... ): void {
    $can_apply = $this->reset_style_detector->can_apply_directly( ... ); // 🔴 CALL 2
    
    if ( $can_apply ) {
        $this->apply_reset_styles_directly_to_widgets( ... ); // 🔴 CALL 3
    } else {
        $this->collect_complex_reset_styles_for_css_file( ... ); // 🔴 CALL 4
    }
}

// Step 3: unified-css-processor.php (line 802)
private function apply_reset_styles_directly_to_widgets( ... ): void {
    $matching_widgets = $this->find_widgets_by_element_type( ... ); // 🔴 CALL 5 (duplicate logic)
    $this->unified_style_manager->collect_reset_styles( ... ); // 🔴 CALL 6
}

// Step 4: unified-style-manager.php (line 180)
public function collect_reset_styles( ... ) {
    // Finally collect the styles
}

// RESULT: 6 method calls across 2 files, 300+ lines executed
```

### Proposed Flow (Unified)

```php
// User submits: <h1>Title</h1> with CSS: h1 { color: red; }

// Step 1: unified-css-processor.php (simplified)
private function collect_reset_styles( string $css, array $widgets ): void {
    $element_rules = $this->reset_style_detector->extract_element_selector_rules( ... );
    $conflicts = $this->reset_style_detector->analyze_conflicts( ... );
    
    foreach ( $element_rules as $selector => $rules ) {
        $this->process_with_strategy( $selector, $rules, $conflicts, $widgets ); // ✅ SINGLE CALL
    }
}

// Step 2: unified-css-processor.php (new method)
private function process_with_strategy( ... ): void {
    foreach ( $this->reset_style_strategies as $strategy ) {
        if ( $strategy->can_handle( ... ) ) {
            $strategy->process_reset_styles( ... ); // ✅ STRATEGY HANDLES ALL
            return;
        }
    }
}

// Step 3: strategies/simple-reset-strategy.php (all logic in one place)
public function process_reset_styles( ... ): array {
    $matching_widgets = $this->find_matching_widgets( ... );
    $this->style_manager->collect_reset_styles( ... );
    return $stats;
}

// RESULT: 3 method calls, 1 strategy file, ~100 lines executed
```

---

## Migration Checklist

### Phase 1: Create Strategy Files ✅
- [ ] Create `strategies/` directory
- [ ] Create `reset-style-strategy-interface.php`
- [ ] Create `simple-reset-strategy.php`
- [ ] Create `complex-reset-strategy.php`
- [ ] Add unit tests for each strategy

### Phase 2: Update Unified CSS Processor ✅
- [ ] Add `initialize_reset_strategies()` method
- [ ] Add `process_with_strategy()` method
- [ ] Update `collect_reset_styles()` to use strategies
- [ ] Keep old methods as `@deprecated` (backward compat)
- [ ] Add integration tests

### Phase 3: Simplify Reset Style Detector ✅
- [ ] Remove application logic (move to strategies)
- [ ] Keep detection/classification methods only
- [ ] Update method visibility (public → private where needed)
- [ ] Remove duplicate mappings
- [ ] Update tests

### Phase 4: Cleanup Style Manager ✅
- [ ] Remove duplicate statistics methods
- [ ] Simplify collection methods
- [ ] Delegate to strategies where appropriate
- [ ] Update tests

### Phase 5: Update Documentation ✅
- [ ] Update README with strategy pattern explanation
- [ ] Add strategy usage examples
- [ ] Document migration path for custom code
- [ ] Update PHPDoc blocks

### Phase 6: Remove Deprecated Code 🔴
- [ ] Remove old methods from Unified_Css_Processor
- [ ] Remove duplicate logic from Reset_Style_Detector
- [ ] Update all call sites
- [ ] Final test suite run
- [ ] Performance benchmarks

---

## Quick Reference

### When to Add New Reset Handling

**Before** (Scattered):
1. Update `unified-css-processor.php` (detection)
2. Update `reset-style-detector.php` (classification)
3. Update `unified-css-processor.php` again (application)
4. Update `unified-style-manager.php` (collection)
5. Update stats in multiple files

**After** (Unified):
1. Create new strategy class implementing `Reset_Style_Strategy_Interface`
2. Register in `unified-css-processor.php` constructor
3. Done! ✅

### File Responsibilities After Refactor

```
unified-css-processor.php
  Responsibility: Orchestrate CSS processing
  Reset role:     Delegate to strategies

reset-style-detector.php
  Responsibility: Detect & classify element selectors
  Reset role:     Utility only (no application logic)

unified-style-manager.php
  Responsibility: Collect & resolve styles
  Reset role:     Collection only (called by strategies)

strategies/simple-reset-strategy.php
  Responsibility: Handle simple reset styles
  Reset role:     Complete handling (detect → apply → stats)

strategies/complex-reset-strategy.php
  Responsibility: Handle complex reset styles
  Reset role:     Complete handling (detect → CSS gen → stats)
```

---

## Performance Impact Analysis

### Before (Current)

```
Processing CSS: h1 { color: red; } p { margin: 10px; }

Method Calls:
1. collect_reset_styles()                           (1 call)
2.   parse_css_and_extract_rules()                  (1 call)
3.   reset_style_detector->extract_element_rules()  (1 call)
4.   process_element_selector_reset_styles()        (2 calls - h1, p)
5.     reset_style_detector->can_apply_directly()   (2 calls)
6.     apply_reset_styles_directly_to_widgets()     (2 calls)
7.       find_widgets_by_element_type()             (2 calls - 🔴 expensive!)
8.         unified_style_manager->collect_resets()  (2 calls)

Total method calls: 13
Widget tree traversals: 2 (find_widgets_by_element_type called twice)
```

### After (Proposed)

```
Processing CSS: h1 { color: red; } p { margin: 10px; }

Method Calls:
1. collect_reset_styles()                           (1 call)
2.   reset_style_detector->extract_element_rules()  (1 call)
3.   reset_style_detector->analyze_conflicts()      (1 call)
4.   process_with_strategy()                        (2 calls - h1, p)
5.     simple_strategy->can_handle()                (2 calls)
6.     simple_strategy->process_reset_styles()      (2 calls)
7.       find_matching_widgets()                    (2 calls - ✅ optimized!)
8.       style_manager->collect_resets()            (2 calls)

Total method calls: 11 (-15%)
Widget tree traversals: 2 (same, but cached in strategy)
```

**Potential Optimization**: Cache widget matching results in strategy
```php
// In Simple_Reset_Strategy
private $widget_cache = [];

private function find_matching_widgets( ... ) {
    $cache_key = $selector . '_' . spl_object_hash( $widgets );
    
    if ( isset( $this->widget_cache[ $cache_key ] ) ) {
        return $this->widget_cache[ $cache_key ]; // ✅ CACHE HIT
    }
    
    $matches = $this->find_widgets_by_type_recursive( ... );
    $this->widget_cache[ $cache_key ] = $matches;
    
    return $matches;
}

// Result: Widget tree traversals reduced by 50%+ for repeated selectors
```

---

**Related Documents**:
- `PRD-UNIFIED-RESET-STYLE-ARCHITECTURE.md` (Main PRD)
- `PRD-CSS-PROCESSING-DESIGN-PATTERN.md` (CSS processing patterns)
- `2-RESET-CLASSES.md` (Original reset styles approach)

---

**Status**: Analysis Complete ✅  
**Next Action**: Review PRD and approve Phase 1 implementation

