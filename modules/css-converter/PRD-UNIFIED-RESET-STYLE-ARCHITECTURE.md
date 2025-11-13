# PRD: Unified Reset Style Architecture & Design Pattern Consolidation

**Status**: Draft  
**Created**: 2025-01-26  
**Priority**: Medium  
**Impact**: Code Quality, Maintainability, Performance

---

## Executive Summary

Current reset style handling is scattered across 8+ files with duplicated logic, inconsistent patterns, and mixed responsibilities. This PRD proposes consolidating reset style logic into a unified Strategy Pattern architecture within `unified-css-processor.php`, eliminating duplication and establishing clear separation of concerns.

---

## Problem Statement

### Current Architecture Issues

#### 1. **Scattered Reset Logic** (8 Files)
```
unified-css-processor.php
  ├─ collect_reset_styles()                     [427 lines]
  ├─ apply_reset_styles_directly_to_widgets()
  ├─ collect_complex_reset_styles_for_css_file()
  └─ process_element_selector_reset_styles()

unified-style-manager.php
  ├─ collect_reset_styles()                     [609 lines]
  ├─ collect_complex_reset_styles()
  └─ get_reset_styles_stats()

reset-style-detector.php                        [427 lines]
  ├─ extract_element_selector_rules()
  ├─ analyze_element_selector_conflicts()
  └─ can_apply_directly_to_widgets()

unified-widget-conversion-service.php
  └─ extract_styles_by_source_from_widgets()    [reset_element_styles handling]

+ 4 factory/style classes
```

**Total LOC dealing with reset styles: ~2,000+ lines**

#### 2. **Design Pattern Violations**

**Current**: Mixed Responsibilities
```php
// unified-css-processor.php - DOES EVERYTHING
collect_reset_styles()            // Detection
→ process_element_selector()      // Classification  
  → apply_directly()              // Application
  → collect_complex()             // Collection
```

**Problem**: Single class violates Single Responsibility Principle

#### 3. **Code Duplication**

**Example 1**: Element Selector Detection (3 locations)
```php
// unified-css-processor.php:157
private function is_simple_element_selector( string $selector ): bool {
    return preg_match( '/^[a-zA-Z][a-zA-Z0-9]*$/', trim( $selector ) );
}

// reset-style-detector.php:161
public function is_simple_element_selector( string $selector ): bool {
    return in_array( trim( $selector ), $this->supported_simple_selectors, true );
}

// unified-style-manager.php (implicit in filter logic)
```

**Example 2**: HTML Tag to Widget Mapping (2 locations)
```php
// unified-css-processor.php:882
private function get_html_element_to_atomic_widget_mapping(): array {
    return [ 'h1' => 'e-heading', ... ];
}

// reset-style-detector.php:82
private $tag_to_widget_mapping = [ 'h1' => 'e-heading', ... ];
```

#### 4. **Inconsistent Statistics Collection**

```php
// unified-style-manager.php
get_reset_styles_stats()              // Returns array with 4 metrics

// unified-css-processor.php
'reset_styles_detected'               // Boolean only
'reset_styles_stats'                  // Different structure

// statistics-collector.php
collect_reset_styles_stats()          // Yet another format
```

---

## Proposed Solution

### Strategy Pattern Architecture

```
┌─────────────────────────────────────────────────────────────┐
│              Unified_Css_Processor                          │
│                  (Orchestrator)                             │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ├─→ ResetStyleStrategy (Interface)
                     │   ├─ detect_reset_selectors()
                     │   ├─ classify_complexity()
                     │   └─ get_application_method()
                     │
                     ├─→ SimpleResetStrategy
                     │   └─ Direct widget application
                     │
                     ├─→ ComplexResetStrategy  
                     │   └─ CSS file generation
                     │
                     └─→ ResetStyleDetector (Utility)
                         └─ Selector analysis only
```

### Consolidated File Structure

```
services/css/processing/
├─ unified-css-processor.php              [ORCHESTRATOR - 300 lines removed]
│   └─ Uses ResetStyleStrategy
│
├─ strategies/                             [NEW DIRECTORY]
│   ├─ reset-style-strategy-interface.php [NEW]
│   ├─ simple-reset-strategy.php          [NEW]
│   └─ complex-reset-strategy.php         [NEW]
│
├─ reset-style-detector.php               [UTILITY ONLY - 200 lines removed]
│   └─ Selector analysis methods only
│
└─ unified-style-manager.php              [SIMPLIFIED - 100 lines removed]
    └─ Collection methods only (no detection)
```

---

## Implementation Details

### Phase 1: Extract Strategy Interface

**File**: `strategies/reset-style-strategy-interface.php`

```php
<?php
namespace Elementor\Modules\CssConverter\Services\Css\Processing\Strategies;

interface Reset_Style_Strategy_Interface {
	const STRATEGY_TYPE_SIMPLE = 'simple';
	const STRATEGY_TYPE_COMPLEX = 'complex';
	
	public function can_handle( array $element_rules, array $conflict_analysis ): bool;
	
	public function process_reset_styles(
		string $selector,
		array $rules,
		array $widgets,
		array $context
	): array;
	
	public function get_strategy_type(): string;
	
	public function get_statistics(): array;
}
```

### Phase 2: Implement Simple Strategy

**File**: `strategies/simple-reset-strategy.php`

```php
<?php
namespace Elementor\Modules\CssConverter\Services\Css\Processing\Strategies;

use Elementor\Modules\CssConverter\Services\Css\Processing\Reset_Style_Detector;
use Elementor\Modules\CssConverter\Services\Css\Processing\Unified_Style_Manager;

class Simple_Reset_Strategy implements Reset_Style_Strategy_Interface {
	private $detector;
	private $style_manager;
	private $statistics = [
		'selectors_processed' => 0,
		'widgets_affected' => 0,
		'properties_applied' => 0,
	];
	
	public function __construct(
		Reset_Style_Detector $detector,
		Unified_Style_Manager $style_manager
	) {
		$this->detector = $detector;
		$this->style_manager = $style_manager;
	}
	
	public function can_handle( array $element_rules, array $conflict_analysis ): bool {
		foreach ( array_keys( $element_rules ) as $selector ) {
			if ( ! $this->detector->is_simple_element_selector( $selector ) ) {
				return false;
			}
			if ( ! empty( $conflict_analysis[ $selector ]['conflicts'] ) ) {
				return false;
			}
		}
		return true;
	}
	
	public function process_reset_styles(
		string $selector,
		array $rules,
		array $widgets,
		array $context
	): array {
		$matching_widgets = $this->find_matching_widgets_by_element_type( $selector, $widgets );
		
		if ( empty( $matching_widgets ) ) {
			return [
				'widgets_affected' => 0,
				'properties_applied' => 0,
			];
		}
		
		$converted_properties = $this->convert_rules_to_properties( $rules );
		
		$this->style_manager->collect_reset_styles(
			$selector,
			$converted_properties,
			$matching_widgets,
			true // can_apply_directly
		);
		
		++$this->statistics['selectors_processed'];
		$this->statistics['widgets_affected'] += count( $matching_widgets );
		$this->statistics['properties_applied'] += count( $converted_properties );
		
		return [
			'widgets_affected' => count( $matching_widgets ),
			'properties_applied' => count( $converted_properties ),
		];
	}
	
	public function get_strategy_type(): string {
		return self::STRATEGY_TYPE_SIMPLE;
	}
	
	public function get_statistics(): array {
		return $this->statistics;
	}
	
	private function find_matching_widgets_by_element_type( string $selector, array $widgets ): array {
		$widget_type = $this->detector->get_atomic_widget_type( $selector );
		if ( ! $widget_type ) {
			return [];
		}
		
		return $this->find_widgets_by_type_recursive( $widget_type, $widgets );
	}
	
	private function find_widgets_by_type_recursive( string $widget_type, array $widgets ): array {
		$matching_ids = [];
		foreach ( $widgets as $widget ) {
			if ( ( $widget['widget_type'] ?? '' ) === $widget_type ) {
				$matching_ids[] = $widget['element_id'];
			}
			if ( ! empty( $widget['children'] ) ) {
				$child_matches = $this->find_widgets_by_type_recursive( $widget_type, $widget['children'] );
				$matching_ids = array_merge( $matching_ids, $child_matches );
			}
		}
		return $matching_ids;
	}
	
	private function convert_rules_to_properties( array $rules ): array {
		$properties = [];
		foreach ( $rules as $rule ) {
			if ( isset( $rule['properties'] ) && is_array( $rule['properties'] ) ) {
				$properties = array_merge( $properties, $rule['properties'] );
			}
		}
		return $properties;
	}
}
```

### Phase 3: Implement Complex Strategy

**File**: `strategies/complex-reset-strategy.php`

```php
<?php
namespace Elementor\Modules\CssConverter\Services\Css\Processing\Strategies;

use Elementor\Modules\CssConverter\Services\Css\Processing\Unified_Style_Manager;

class Complex_Reset_Strategy implements Reset_Style_Strategy_Interface {
	private $style_manager;
	private $statistics = [
		'selectors_processed' => 0,
		'css_rules_generated' => 0,
	];
	
	public function can_handle( array $element_rules, array $conflict_analysis ): bool {
		return true; // Always can handle (fallback strategy)
	}
	
	public function process_reset_styles(
		string $selector,
		array $rules,
		array $widgets,
		array $context
	): array {
		$conflicts = $context['conflict_analysis'][ $selector ] ?? [];
		$properties = $this->extract_properties_from_rules( $rules );
		
		$this->style_manager->collect_complex_reset_styles(
			$selector,
			$properties,
			$conflicts
		);
		
		++$this->statistics['selectors_processed'];
		$this->statistics['css_rules_generated'] += count( $properties );
		
		return [
			'requires_css_file' => true,
			'css_rules_generated' => count( $properties ),
		];
	}
	
	public function get_strategy_type(): string {
		return self::STRATEGY_TYPE_COMPLEX;
	}
	
	public function get_statistics(): array {
		return $this->statistics;
	}
	
	private function extract_properties_from_rules( array $rules ): array {
		$properties = [];
		foreach ( $rules as $rule ) {
			foreach ( $rule['properties'] ?? [] as $property_data ) {
				$properties[] = [
					'property' => $property_data['property'],
					'value' => $property_data['value'],
					'important' => $property_data['important'] ?? false,
				];
			}
		}
		return $properties;
	}
}
```

### Phase 4: Update Unified CSS Processor

**File**: `unified-css-processor.php` (Updated)

```php
<?php
namespace Elementor\Modules\CssConverter\Services\Css\Processing;

use Elementor\Modules\CssConverter\Services\Css\Processing\Strategies\Reset_Style_Strategy_Interface;
use Elementor\Modules\CssConverter\Services\Css\Processing\Strategies\Simple_Reset_Strategy;
use Elementor\Modules\CssConverter\Services\Css\Processing\Strategies\Complex_Reset_Strategy;

class Unified_Css_Processor {
	private $reset_style_strategies = [];
	private $reset_style_detector;
	
	public function __construct(
		$css_parser,
		$property_converter,
		Css_Specificity_Calculator $specificity_calculator
	) {
		// ... existing initialization ...
		
		$this->reset_style_detector = new Reset_Style_Detector( $specificity_calculator );
		$this->initialize_reset_strategies();
	}
	
	private function initialize_reset_strategies(): void {
		$this->reset_style_strategies = [
			new Simple_Reset_Strategy( 
				$this->reset_style_detector,
				$this->unified_style_manager
			),
			new Complex_Reset_Strategy( 
				$this->unified_style_manager 
			),
		];
	}
	
	// BEFORE: 300 lines of reset logic
	// AFTER: 30 lines using strategy pattern
	private function collect_reset_styles( string $css, array $widgets ): void {
		if ( empty( $css ) ) {
			return;
		}
		
		$all_rules = $this->parse_css_and_extract_rules( $css );
		$element_rules = $this->reset_style_detector->extract_element_selector_rules( $all_rules );
		
		if ( empty( $element_rules ) ) {
			return;
		}
		
		$conflict_analysis = $this->reset_style_detector->analyze_element_selector_conflicts(
			$element_rules,
			$all_rules
		);
		
		foreach ( $element_rules as $selector => $rules ) {
			$this->process_reset_styles_with_strategy( 
				$selector, 
				$rules, 
				$conflict_analysis, 
				$widgets 
			);
		}
	}
	
	private function process_reset_styles_with_strategy(
		string $selector,
		array $rules,
		array $conflict_analysis,
		array $widgets
	): void {
		$context = [
			'conflict_analysis' => $conflict_analysis,
		];
		
		// Try each strategy in order (simple first, complex fallback)
		foreach ( $this->reset_style_strategies as $strategy ) {
			if ( $strategy->can_handle( [ $selector => $rules ], $conflict_analysis ) ) {
				$strategy->process_reset_styles( $selector, $rules, $widgets, $context );
				return;
			}
		}
	}
	
	// REMOVED: 270 lines
	// - apply_reset_styles_directly_to_widgets()
	// - collect_complex_reset_styles_for_css_file()  
	// - process_element_selector_reset_styles()
	// All moved to strategy classes
}
```

### Phase 5: Simplify Reset Style Detector

**File**: `reset-style-detector.php` (Simplified)

```php
<?php
// BEFORE: 427 lines
// AFTER: ~250 lines

// REMOVE:
// - Application logic (moved to strategies)
// - Collection logic (moved to strategies)

// KEEP:
// - Detection methods
// - Classification methods  
// - Conflict analysis
// - Utility methods
```

### Phase 6: Unified Statistics

**File**: `services/stats/reset-style-statistics.php` (NEW)

```php
<?php
namespace Elementor\Modules\CssConverter\Services\Stats;

class Reset_Style_Statistics {
	const FORMAT_VERSION = '1.0';
	
	public static function collect_from_strategies( array $strategies ): array {
		$total_simple = 0;
		$total_complex = 0;
		$total_widgets_affected = 0;
		$total_properties_applied = 0;
		$total_css_rules_generated = 0;
		
		foreach ( $strategies as $strategy ) {
			$stats = $strategy->get_statistics();
			
			if ( $strategy->get_strategy_type() === 'simple' ) {
				$total_simple += $stats['selectors_processed'] ?? 0;
				$total_widgets_affected += $stats['widgets_affected'] ?? 0;
				$total_properties_applied += $stats['properties_applied'] ?? 0;
			} else {
				$total_complex += $stats['selectors_processed'] ?? 0;
				$total_css_rules_generated += $stats['css_rules_generated'] ?? 0;
			}
		}
		
		return [
			'format_version' => self::FORMAT_VERSION,
			'reset_styles_detected' => ( $total_simple + $total_complex ) > 0,
			'reset_styles_stats' => [
				'simple_selectors' => $total_simple,
				'complex_selectors' => $total_complex,
				'widgets_affected' => $total_widgets_affected,
				'properties_applied' => $total_properties_applied,
				'css_rules_generated' => $total_css_rules_generated,
			],
		];
	}
	
	public static function merge_with_unified_stats( array $reset_stats, array $unified_stats ): array {
		return array_merge( $unified_stats, $reset_stats );
	}
}
```

---

## Benefits

### 1. **Code Reduction**
```
BEFORE:
- unified-css-processor.php:      1,902 lines (300 lines reset logic)
- unified-style-manager.php:        609 lines (150 lines reset logic)
- reset-style-detector.php:         427 lines (200 lines application logic)
- Total reset-related code:       ~2,000 lines across 8 files

AFTER:
- unified-css-processor.php:      1,630 lines (-272 lines, -14%)
- unified-style-manager.php:        509 lines (-100 lines, -16%)  
- reset-style-detector.php:         250 lines (-177 lines, -41%)
- strategies/ (new):                ~600 lines (consolidated, organized)
- Total reset code:               ~1,200 lines (-40% overall)
```

### 2. **Maintainability**

**Before**: Change to reset logic requires updating 3+ files
**After**: Change to reset logic updates 1 strategy file

### 3. **Testability**

**Before**: Hard to test reset logic in isolation (tightly coupled)
**After**: Each strategy is independently testable

```php
// Test simple strategy in isolation
$detector = $this->createMock( Reset_Style_Detector::class );
$manager = $this->createMock( Unified_Style_Manager::class );
$strategy = new Simple_Reset_Strategy( $detector, $manager );

$can_handle = $strategy->can_handle( $test_rules, $test_conflicts );
$this->assertTrue( $can_handle );
```

### 4. **Extensibility**

**Add new reset strategy without modifying existing code:**

```php
// Add media query reset strategy
class Media_Query_Reset_Strategy implements Reset_Style_Strategy_Interface {
	public function can_handle( ... ) {
		// Check for @media rules
	}
	
	public function process_reset_styles( ... ) {
		// Handle responsive reset styles
	}
}

// Register in processor
$this->reset_style_strategies[] = new Media_Query_Reset_Strategy( ... );
```

### 5. **Performance**

- **Before**: All reset detection runs on every CSS parse (even if not needed)
- **After**: Strategies only instantiated when reset selectors detected
- **Estimated improvement**: 5-10% faster CSS processing for non-reset stylesheets

---

## Design Pattern Analysis

### Current Patterns (Scattered)

```
unified-css-processor.php
├─ Factory Pattern ✓ (css_processor_factory)
├─ Service Locator ✓ (unified_style_manager)
└─ Strategy Pattern ✗ (implicit, not formalized)

reset-style-detector.php  
├─ Utility Class ✓
└─ Mixed with Application Logic ✗

unified-style-manager.php
├─ Service Pattern ✓  
└─ Mixed Responsibilities ✗
```

### Proposed Patterns (Consolidated)

```
unified-css-processor.php [ORCHESTRATOR]
├─ Strategy Pattern ✓✓ (ResetStyleStrategy)
├─ Factory Pattern ✓  (existing)
└─ Dependency Injection ✓ (constructor)

strategies/
├─ Strategy Pattern ✓✓ (Interface + Implementations)
└─ Single Responsibility ✓✓ (each strategy = 1 concern)

reset-style-detector.php [UTILITY]
└─ Utility Pattern ✓✓ (pure functions, no state)

unified-style-manager.php [SERVICE]
└─ Service Pattern ✓✓ (collection only)
```

---

## Migration Strategy

### Phase 1: Parallel Implementation (Week 1)
- Create strategy interface
- Implement Simple_Reset_Strategy
- Implement Complex_Reset_Strategy
- **No existing code changes**

### Phase 2: Integration (Week 2)
- Add strategy initialization to Unified_Css_Processor
- Route reset calls through strategies
- Keep old methods as fallback
- **Backward compatible**

### Phase 3: Testing (Week 3)
- Run all existing tests (should pass)
- Add strategy-specific tests
- Performance benchmarks
- **Validate equivalence**

### Phase 4: Deprecation (Week 4)
- Mark old methods as @deprecated
- Add migration warnings
- Update documentation
- **Prepare for removal**

### Phase 5: Cleanup (Week 5)
- Remove deprecated methods
- Remove duplicate code
- Update all call sites
- **Breaking change (major version)**

---

## Testing Strategy

### Unit Tests

```php
class Simple_Reset_Strategy_Test extends \WP_UnitTestCase {
	public function test_can_handle_simple_selectors() {
		$detector = new Reset_Style_Detector( new Css_Specificity_Calculator() );
		$manager = new Unified_Style_Manager( new Css_Specificity_Calculator(), null );
		$strategy = new Simple_Reset_Strategy( $detector, $manager );
		
		$element_rules = [
			'h1' => [ [ 'properties' => [ [ 'property' => 'color', 'value' => 'red' ] ] ] ],
		];
		
		$conflict_analysis = [
			'h1' => [ 'conflicts' => [] ],
		];
		
		$this->assertTrue( $strategy->can_handle( $element_rules, $conflict_analysis ) );
	}
	
	public function test_process_reset_styles_applies_to_widgets() {
		// Test actual widget application
	}
	
	public function test_statistics_collection() {
		// Test statistics accuracy
	}
}
```

### Integration Tests

```php
class Reset_Style_Strategy_Integration_Test extends \WP_UnitTestCase {
	public function test_unified_processor_uses_strategies() {
		$processor = new Unified_Css_Processor( ... );
		
		$css = 'h1 { color: red; }';
		$widgets = [ [ 'widget_type' => 'e-heading', 'element_id' => 'heading-1' ] ];
		
		$result = $processor->process_css_and_widgets( $css, $widgets );
		
		$this->assertArrayHasKey( 'reset_styles_stats', $result );
		$this->assertEquals( 1, $result['reset_styles_stats']['simple_selectors'] );
	}
}
```

### Playwright Tests

```typescript
test('reset styles strategy processes element selectors', async ({ page }) => {
  const response = await page.request.post('/wp-json/elementor/v1/css-converter/widgets', {
    data: {
      html: '<h1>Test</h1>',
      css: 'h1 { color: red; }'
    }
  });
  
  const json = await response.json();
  expect(json.reset_styles_detected).toBe(true);
  expect(json.reset_styles_stats.simple_selectors).toBe(1);
});
```

---

## Success Metrics

### Code Quality
- [ ] Reduce reset-related LOC by 40% (2,000 → 1,200 lines)
- [ ] Eliminate all code duplication for reset logic
- [ ] Achieve 100% test coverage for strategies
- [ ] Pass all existing 127 CSS converter tests

### Performance
- [ ] No performance regression (baseline: current speed)
- [ ] 5-10% improvement for non-reset CSS parsing
- [ ] Memory usage unchanged or improved

### Maintainability
- [ ] Single file changes for reset modifications
- [ ] Clear separation of concerns (detection vs application)
- [ ] Self-documenting strategy pattern

---

## Risks & Mitigation

### Risk 1: Breaking Changes
**Mitigation**: Parallel implementation with fallback (Phase 1-2)

### Risk 2: Performance Regression
**Mitigation**: Benchmark at each phase, rollback if needed

### Risk 3: Incomplete Migration
**Mitigation**: Deprecation warnings + documented migration path

### Risk 4: Test Failures
**Mitigation**: 100% backward compatibility during transition

---

## Open Questions

1. Should we support custom reset strategies via plugin API?
2. Should complex strategies differentiate between universal (`*`) vs descendant (`div p`) selectors?
3. Should we cache strategy decisions for repeated selectors?
4. Should statistics be real-time or post-processing?

---

## References

### Related Files
- `unified-css-processor.php` (lines 756-871: reset collection)
- `unified-style-manager.php` (lines 180-253: reset methods)
- `reset-style-detector.php` (full file: 427 lines)
- `unified-widget-conversion-service.php` (lines 186-235: reset extraction)

### Related PRDs
- `PRD-CSS-PROCESSING-DESIGN-PATTERN.md`
- `PRD-UNIFIED-WIDGET-SERVICE-CLEANUP.md`
- `2-RESET-CLASSES.md`

### Design Patterns
- [Strategy Pattern](https://refactoring.guru/design-patterns/strategy)
- [SOLID Principles](https://en.wikipedia.org/wiki/SOLID)

---

## Approval

- [ ] Technical Lead Review
- [ ] Architecture Review  
- [ ] Security Review
- [ ] Performance Review
- [ ] Final Approval

---

**Next Steps**: Review and approve this PRD, then proceed with Phase 1 implementation.

