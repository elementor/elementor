# PRD: ID Styles Integration into Unified CSS Processor

## Executive Summary

**Problem**: ID styles handling is scattered across legacy code instead of being integrated into the unified CSS processor design pattern. This causes:
- Code duplication and maintenance overhead
- Inconsistent processing between inline styles, class styles, and ID styles  
- Test failures due to architectural misalignment
- Violation of the unified processor pattern

**Solution**: Create a dedicated `Id_Selector_Processor` that integrates ID style handling into the existing unified CSS processor registry pattern.

## Current Architecture Analysis

### ✅ Unified Processor Pattern (GOOD)
The CSS converter uses a clean registry pattern with processors executed in priority order:

```php
// Current processors in css-processor-factory.php
$processors = [
    new Css_Parsing_Processor(),                      // 1. Parse CSS (Priority: 100)
    new Css_Variables_Processor(),                    // 2. Extract variables (Priority: 90)  
    new Rule_Classification_Processor(),              // 3. Classify rules (Priority: 80)
    new Nested_Selector_Flattening_Processor(),       // 4. Flatten nested selectors (Priority: 70)
    new Compound_Class_Selector_Processor(),          // 5. Process compound selectors (Priority: 65)
    new Style_Collection_Processor(),                 // 6. Collect styles (Priority: 60)
    new Global_Classes_Processor(),                   // 7. Create global classes (Priority: 50)
    new Html_Class_Modifier_Processor(),              // 8. Modify HTML classes (Priority: 40)
    new Style_Resolution_Processor(),                 // 9. Resolve final styles (Priority: 30)
];
```

### ❌ Legacy ID Handling (BAD)
ID styles are currently handled in scattered locations:
- `unified-css-processor.php` line 454: `if ( strpos( $selector, '#' ) !== false )`
- `unified-style-manager.php` line 88: `collect_id_selector_styles()`
- Various manual ID parsing in multiple files

## Solution Architecture

### New Processor: `Id_Selector_Processor`

**Priority**: 75 (Between Rule Classification and Nested Selector Flattening)

**Responsibilities**:
1. **Extract ID selectors** from parsed CSS rules
2. **Normalize ID selectors** (handle `#id`, `#id.class`, `div#id` patterns)
3. **Match ID selectors** to widgets with corresponding HTML IDs
4. **Convert ID styles to atomic properties** directly applied to widgets
5. **Remove ID attributes** from final widget output (IDs become atomic styles)

### Integration Points

#### Input (from Rule Classification Processor)
```php
$context->get_metadata('css_rules', [
    ['selector' => '#header', 'properties' => [...]],
    ['selector' => '#header.active', 'properties' => [...]],
    ['selector' => 'div#container', 'properties' => [...]]
]);
```

#### Processing
```php
// Extract and process ID selectors
$id_rules = $this->extract_id_selectors($css_rules);
$processed_widgets = $this->apply_id_styles_to_widgets($id_rules, $widgets);
```

#### Output (to Style Collection Processor)
```php
$context->set_widgets($processed_widgets); // Widgets with ID styles applied
$context->set_metadata('id_styles_applied', $id_statistics);
$context->set_metadata('remaining_css_rules', $non_id_rules); // Rules without ID selectors
```

## Implementation Plan

### Phase 1: Create Id_Selector_Processor

**File**: `processors/id-selector-processor.php`

```php
<?php
namespace Elementor\Modules\CssConverter\Services\Css\Processing\Processors;

use Elementor\Modules\CssConverter\Services\Css\Processing\Contracts\Css_Processor_Interface;
use Elementor\Modules\CssConverter\Services\Css\Processing\Contracts\Css_Processing_Context;

class Id_Selector_Processor implements Css_Processor_Interface {
    
    public function get_processor_name(): string {
        return 'id_selector';
    }
    
    public function get_priority(): int {
        return 75; // Between Rule Classification (80) and Nested Flattening (70)
    }
    
    public function supports_context(Css_Processing_Context $context): bool {
        $css_rules = $context->get_metadata('css_rules', []);
        return $this->has_id_selectors($css_rules);
    }
    
    public function process(Css_Processing_Context $context): Css_Processing_Context {
        $css_rules = $context->get_metadata('css_rules', []);
        $widgets = $context->get_widgets();
        
        // 1. Extract ID selectors from CSS rules
        $id_rules = $this->extract_id_selectors($css_rules);
        $remaining_rules = $this->remove_id_selectors($css_rules);
        
        // 2. Process ID styles and apply to widgets
        $processed_widgets = $this->apply_id_styles_to_widgets($id_rules, $widgets);
        
        // 3. Update context
        $context->set_widgets($processed_widgets);
        $context->set_metadata('css_rules', $remaining_rules);
        $context->add_statistic('id_selectors_processed', count($id_rules));
        
        return $context;
    }
    
    private function extract_id_selectors(array $css_rules): array {
        return array_filter($css_rules, function($rule) {
            return strpos($rule['selector'] ?? '', '#') !== false;
        });
    }
    
    private function apply_id_styles_to_widgets(array $id_rules, array $widgets): array {
        foreach ($widgets as &$widget) {
            $widget = $this->process_widget_id_styles($widget, $id_rules);
        }
        return $widgets;
    }
    
    private function process_widget_id_styles(array $widget, array $id_rules): array {
        $html_id = $widget['attributes']['id'] ?? null;
        
        if (!$html_id) {
            return $this->process_children_recursively($widget, $id_rules);
        }
        
        // Find matching ID rules
        $matching_rules = $this->find_matching_id_rules($html_id, $id_rules);
        
        if (empty($matching_rules)) {
            return $this->process_children_recursively($widget, $id_rules);
        }
        
        // Convert ID styles to atomic properties
        $atomic_styles = $this->convert_id_styles_to_atomic($matching_rules);
        
        // Apply atomic styles to widget
        $widget = $this->apply_atomic_styles_to_widget($widget, $atomic_styles);
        
        // Remove ID attribute (ID becomes atomic styles)
        unset($widget['attributes']['id']);
        
        return $this->process_children_recursively($widget, $id_rules);
    }
}
```

### Phase 2: Register Processor in Factory

**File**: `css-processor-factory.php`

```php
private static function register_all_processors(Css_Processor_Registry $registry): void {
    $processors = [
        new Css_Parsing_Processor(),                      // 1. Parse CSS
        new Css_Variables_Processor(),                    // 2. Extract variables  
        new Rule_Classification_Processor(),              // 3. Classify rules
        new Id_Selector_Processor(),                      // 4. Process ID selectors ← NEW
        new Nested_Selector_Flattening_Processor(),       // 5. Flatten nested selectors
        new Compound_Class_Selector_Processor(),          // 6. Process compound selectors
        new Style_Collection_Processor(),                 // 7. Collect styles
        new Global_Classes_Processor(),                   // 8. Create global classes
        new Html_Class_Modifier_Processor(),              // 9. Modify HTML classes
        new Style_Resolution_Processor(),                 // 10. Resolve final styles
    ];
}
```

### Phase 3: Remove Legacy ID Code

**Files to Clean Up**:
- `unified-css-processor.php`: Remove `process_matched_rule()` ID routing logic
- `unified-style-manager.php`: Keep `collect_id_selector_styles()` for backward compatibility but mark deprecated
- `style-collection-processor.php`: Remove ID-specific collection logic

### Phase 4: Update Tests

**Expected Test Behavior**:
```typescript
// Before: ID attribute preserved, styles not applied
<div id="header" class="elementor-widget">Content</div>

// After: ID attribute removed, styles applied as atomic properties  
<div class="elementor-widget e-abc123f" style="background-color: rgb(0, 0, 255); padding: 20px;">Content</div>
```

## Benefits

### ✅ Architectural Consistency
- ID handling follows the same unified processor pattern as other CSS features
- Single responsibility: each processor handles one concern
- Predictable execution order and dependencies

### ✅ Code Quality  
- Eliminates scattered ID handling logic
- Reduces code duplication
- Improves testability and maintainability

### ✅ Performance
- ID processing happens once in the correct pipeline stage
- No redundant ID parsing or matching
- Efficient widget traversal

### ✅ Test Alignment
- Tests expect atomic widget structure with applied styles
- ID styles become atomic properties (matching inline style behavior)
- Consistent behavior across all CSS sources

## Success Metrics

1. **All ID style tests pass** without modification
2. **Zero legacy ID handling code** remains in unified processor
3. **Performance maintained** or improved
4. **Backward compatibility** preserved for existing API consumers

## Risk Mitigation

### Risk: Breaking Changes
**Mitigation**: Keep deprecated methods with clear migration path

### Risk: Performance Regression  
**Mitigation**: Benchmark before/after, optimize widget traversal

### Risk: Complex ID Selectors
**Mitigation**: Handle `#id.class`, `div#id`, `#parent #child` patterns systematically

## Timeline

- **Week 1**: Implement `Id_Selector_Processor` 
- **Week 2**: Register processor and update factory
- **Week 3**: Remove legacy code and update tests
- **Week 4**: Performance testing and documentation

## Conclusion

This PRD aligns ID style handling with the established unified processor architecture, eliminating legacy code while maintaining functionality. The solution follows existing patterns, ensuring consistency and maintainability.

The key insight: **ID styles should be processed like any other CSS source** - parsed, classified, processed, and applied to widgets as atomic properties. This unified approach eliminates architectural inconsistencies and test failures.
