# Proposal: Nested Selector Flattening Processor

**Date**: October 24, 2025  
**Status**: Proposal  
**Priority**: High (First processor to extract)  
**Pattern**: CSS Processor Registry

---

## 🎯 **Executive Summary**

Extract the nested selector flattening logic from `Unified_Css_Processor` into a standalone `Nested_Selector_Flattening_Processor` that:
- ✅ Implements the `Css_Processor_Interface`
- ✅ Processes CSS rules independently
- ✅ Updates the processor registry with results
- ✅ Fixes existing bugs in the current implementation
- ✅ Maintains backward compatibility

---

## 🐛 **Current Problems**

### **1. Tight Coupling**
The flattening logic is tightly coupled to `Unified_Css_Processor`:
- 106 references to flattening in unified processor
- Mixed with other processing concerns
- Hard to test independently
- Hard to debug issues

### **2. State Management Issues**
```php
// CURRENT: Flattening service has mutable state
class Nested_Selector_Flattening_Service {
    private $flattened_classes = [];  // ❌ Mutable state
    private $existing_global_class_names = [];  // ❌ Mutable state
    
    public function set_existing_class_names( array $existing_names ): void {
        $this->existing_global_class_names = $existing_names;  // ❌ Side effects
    }
}

// PROBLEM: State can become inconsistent
$service->set_existing_class_names( $names1 );
$service->flatten_css_rule( $rule1 );  // Uses $names1
$service->set_existing_class_names( $names2 );  // ❌ State changed
$service->flatten_css_rule( $rule2 );  // Uses $names2 - inconsistent!
```

### **3. Unclear Responsibilities**
Current code mixes multiple concerns:
- Parsing nested selectors
- Generating flattened names
- Tracking class mappings
- Building global class data
- Filtering core Elementor selectors

### **4. Bugs Identified**

#### **Bug 1: Name Collision Potential**
```php
// Line 50-54: Merges existing names but doesn't validate uniqueness
$existing_names = array_merge( 
    $this->existing_global_class_names, 
    array_keys( $this->flattened_classes ) 
);
$flattened_class_name = $this->name_generator->generate_flattened_class_name( 
    $parsed_selector, 
    $existing_names 
);

// PROBLEM: If generator fails to avoid collision, no error is raised
```

#### **Bug 2: Stateful Processing**
```php
// Lines 1410-1412: State set once for all rules
$existing_global_class_names = $this->get_existing_global_class_names();
$this->flattening_service->set_existing_class_names( $existing_global_class_names );

foreach ( $css_rules as $rule ) {
    // PROBLEM: All rules share same state
    // If one rule modifies state, affects others
}
```

#### **Bug 3: Missing Validation**
```php
// Line 1447: No validation that flattening succeeded
$flattened_rule = $this->flattening_service->flatten_css_rule( $rule );
$flattened_rules[] = $flattened_rule;

// PROBLEM: What if flattening failed?
// What if flattened_rule is invalid?
// No error handling
```

#### **Bug 4: Inconsistent Class Mapping**
```php
// Lines 1450-1465: Complex mapping logic with multiple edge cases
if ( $parsed && ! empty( $parsed['target_class'] ) && ! empty( $flattened_rule['global_class_id'] ) ) {
    $mapping_key = $parsed['target_class'];
    if ( $this->is_element_tag( $parsed['target_class'] ) ) {
        $mapping_key = '.' . $parsed['target_class'];  // ❌ Inconsistent format
    }
    $class_mappings[ $mapping_key ] = $flattened_rule['global_class_id'];
}

// PROBLEM: Mapping key format varies (with/without dot prefix)
// Makes it hard to look up mappings later
```

---

## ✅ **Proposed Solution: Standalone Processor**

### **Architecture**

```
┌─────────────────────────────────────────────────────────────┐
│         Nested_Selector_Flattening_Processor                 │
├─────────────────────────────────────────────────────────────┤
│  Implements: Css_Processor_Interface                         │
│  Priority: 15 (after CSS fetching, before main processing)   │
│                                                              │
│  Responsibilities:                                           │
│  1. Parse nested selectors                                   │
│  2. Generate flattened class names                           │
│  3. Create flattened rules                                   │
│  4. Build class mappings                                     │
│  5. Store results in context                                 │
│  6. Validate all operations                                  │
└─────────────────────────────────────────────────────────────┘
```

---

## 📝 **Implementation**

### **1. Processor Interface Implementation**

**File**: `services/css/processing/processors/nested-selector-flattening-processor.php`

```php
<?php
namespace Elementor\Modules\CssConverter\Services\Css\Processing\Processors;

use Elementor\Modules\CssConverter\Services\Css\Processing\Contracts\Css_Processor_Interface;
use Elementor\Modules\CssConverter\Services\Css\Processing\Css_Processing_Context;
use Elementor\Modules\CssConverter\Services\Css\Nested_Selector_Parser;
use Elementor\Modules\CssConverter\Services\Css\Flattened_Class_Name_Generator;

class Nested_Selector_Flattening_Processor implements Css_Processor_Interface {
    
    private const PRIORITY = 15;
    private const PROCESSOR_NAME = 'nested_selector_flattening';
    
    private $parser;
    private $name_generator;
    
    public function __construct(
        Nested_Selector_Parser $parser = null,
        Flattened_Class_Name_Generator $name_generator = null
    ) {
        $this->parser = $parser ?: Nested_Selector_Parser::make();
        $this->name_generator = $name_generator ?: Flattened_Class_Name_Generator::make();
    }
    
    public function get_processor_name(): string {
        return self::PROCESSOR_NAME;
    }
    
    public function get_priority(): int {
        return self::PRIORITY;
    }
    
    public function supports_context( Css_Processing_Context $context ): bool {
        $css_rules = $context->get_metadata( 'css_rules' );
        return ! empty( $css_rules ) && is_array( $css_rules );
    }
    
    public function process( Css_Processing_Context $context ): Css_Processing_Context {
        $css_rules = $context->get_metadata( 'css_rules', [] );
        
        if ( empty( $css_rules ) ) {
            return $context;
        }
        
        // Get existing global class names to prevent collisions
        $existing_class_names = $this->get_existing_class_names( $context );
        
        // Process all rules
        $result = $this->flatten_nested_selectors( $css_rules, $existing_class_names );
        
        // Validate result
        $this->validate_flattening_result( $result );
        
        // Store results in context
        $context->set_metadata( 'flattened_rules', $result['flattened_rules'] );
        $context->set_metadata( 'flattened_classes', $result['flattened_classes'] );
        $context->set_metadata( 'class_mappings', $result['class_mappings'] );
        $context->set_metadata( 'classes_with_direct_styles', $result['classes_with_direct_styles'] );
        $context->set_metadata( 'classes_only_in_nested', $result['classes_only_in_nested'] );
        
        // Add statistics
        $context->add_statistic( 'nested_selectors_flattened', count( $result['flattened_classes'] ) );
        $context->add_statistic( 'class_mappings_created', count( $result['class_mappings'] ) );
        
        return $context;
    }
    
    public function get_statistics_keys(): array {
        return [
            'nested_selectors_flattened',
            'class_mappings_created',
        ];
    }
    
    private function flatten_nested_selectors( array $css_rules, array $existing_class_names ): array {
        $flattened_rules = [];
        $flattened_classes = [];
        $class_mappings = [];
        $classes_with_direct_styles = [];
        $classes_only_in_nested = [];
        
        // Track used names to prevent collisions within this processing session
        $used_names = $existing_class_names;
        
        foreach ( $css_rules as $rule ) {
            $selector = $rule['selector'] ?? '';
            
            if ( empty( $selector ) ) {
                $flattened_rules[] = $rule;
                continue;
            }
            
            // Track classes with direct styles (e.g., ".first { ... }")
            if ( $this->is_direct_class_selector( $selector ) ) {
                $class_name = $this->extract_class_name_from_selector( $selector );
                if ( $class_name ) {
                    $classes_with_direct_styles[] = $class_name;
                }
            }
            
            // Check if this selector should be flattened
            if ( ! $this->should_flatten_selector( $selector ) ) {
                $flattened_rules[] = $rule;
                continue;
            }
            
            // Skip compound class selectors (handled by different processor)
            if ( $this->is_compound_class_selector( $selector ) ) {
                $flattened_rules[] = $rule;
                continue;
            }
            
            // Flatten the selector
            $flatten_result = $this->flatten_single_selector( $rule, $used_names );
            
            if ( null === $flatten_result ) {
                // Flattening failed, keep original rule
                $flattened_rules[] = $rule;
                continue;
            }
            
            // Add flattened rule
            $flattened_rules[] = $flatten_result['rule'];
            
            // Store flattened class data
            $flattened_class_name = $flatten_result['class_name'];
            $flattened_classes[ $flattened_class_name ] = $flatten_result['class_data'];
            
            // Track used name
            $used_names[] = $flattened_class_name;
            
            // Build class mapping
            if ( ! empty( $flatten_result['mapping'] ) ) {
                $mapping_key = $flatten_result['mapping']['key'];
                $mapping_value = $flatten_result['mapping']['value'];
                $class_mappings[ $mapping_key ] = $mapping_value;
                $classes_only_in_nested[] = $mapping_key;
            }
        }
        
        // Remove duplicates and exclude classes that have direct styles
        $classes_only_in_nested = array_diff(
            array_unique( $classes_only_in_nested ),
            $classes_with_direct_styles
        );
        
        return [
            'flattened_rules' => $flattened_rules,
            'flattened_classes' => $flattened_classes,
            'class_mappings' => $class_mappings,
            'classes_with_direct_styles' => array_unique( $classes_with_direct_styles ),
            'classes_only_in_nested' => array_values( $classes_only_in_nested ),
        ];
    }
    
    private function flatten_single_selector( array $rule, array $used_names ): ?array {
        $selector = $rule['selector'];
        $properties = $rule['properties'] ?? [];
        
        // Parse the nested selector
        $parsed_selector = $this->parser->parse_nested_selector( $selector );
        
        if ( null === $parsed_selector ) {
            return null;
        }
        
        // Generate flattened class name
        $flattened_class_name = $this->name_generator->generate_flattened_class_name(
            $parsed_selector,
            $used_names
        );
        
        // Validate generated name
        if ( empty( $flattened_class_name ) || in_array( $flattened_class_name, $used_names, true ) ) {
            // Name generation failed or collision detected
            return null;
        }
        
        // Create flattened rule
        $flattened_rule = [
            'selector' => '.' . $flattened_class_name,
            'properties' => $properties,
            'original_selector' => $selector,
            'flattened' => true,
            'global_class_id' => $flattened_class_name,
        ];
        
        // Create class data for global classes
        $class_data = [
            'id' => $flattened_class_name,
            'label' => $flattened_class_name,
            'original_selector' => $selector,
            'flattened_selector' => '.' . $flattened_class_name,
            'properties' => $properties,
            'specificity' => $parsed_selector['specificity'],
            'css_converter_specificity' => $parsed_selector['specificity'],
            'css_converter_original_selector' => $selector,
        ];
        
        // Build class mapping
        $mapping = $this->build_class_mapping( $parsed_selector, $flattened_class_name );
        
        return [
            'rule' => $flattened_rule,
            'class_name' => $flattened_class_name,
            'class_data' => $class_data,
            'mapping' => $mapping,
        ];
    }
    
    private function build_class_mapping( array $parsed_selector, string $flattened_class_name ): ?array {
        $target_class = $parsed_selector['target_class'] ?? null;
        
        if ( empty( $target_class ) ) {
            return null;
        }
        
        // Normalize mapping key format (always use dot prefix for consistency)
        $mapping_key = $this->normalize_mapping_key( $target_class );
        
        return [
            'key' => $mapping_key,
            'value' => $flattened_class_name,
        ];
    }
    
    private function normalize_mapping_key( string $class_name ): string {
        // Always use dot prefix for consistency
        if ( $this->is_element_tag( $class_name ) ) {
            return '.' . $class_name;
        }
        
        // If it already has a dot, return as-is
        if ( 0 === strpos( $class_name, '.' ) ) {
            return $class_name;
        }
        
        // Add dot prefix
        return '.' . $class_name;
    }
    
    private function should_flatten_selector( string $selector ): bool {
        // Never flatten selectors containing ID components
        if ( false !== strpos( $selector, '#' ) ) {
            return false;
        }
        
        // Never flatten core Elementor selectors
        if ( $this->is_core_elementor_selector( $selector ) ) {
            return false;
        }
        
        return $this->parser->is_nested_selector( $selector );
    }
    
    private function is_direct_class_selector( string $selector ): bool {
        // Direct class selector: ".classname" (no spaces, no combinators)
        $trimmed = trim( $selector );
        
        if ( 0 !== strpos( $trimmed, '.' ) ) {
            return false;
        }
        
        // Check for spaces or combinators
        if ( preg_match( '/[\s>+~]/', $trimmed ) ) {
            return false;
        }
        
        return true;
    }
    
    private function extract_class_name_from_selector( string $selector ): string {
        $trimmed = trim( $selector );
        
        // Remove leading dot
        if ( 0 === strpos( $trimmed, '.' ) ) {
            $trimmed = substr( $trimmed, 1 );
        }
        
        // Remove pseudo-classes and pseudo-elements
        $trimmed = preg_replace( '/:[a-z-]+(\([^)]*\))?/i', '', $trimmed );
        
        return $trimmed;
    }
    
    private function is_compound_class_selector( string $selector ): bool {
        // Compound class: ".class1.class2" (multiple classes without spaces)
        $trimmed = trim( $selector );
        
        // Count dots (more than one = compound)
        $dot_count = substr_count( $trimmed, '.' );
        
        if ( $dot_count < 2 ) {
            return false;
        }
        
        // Check if dots are consecutive (no spaces between)
        if ( preg_match( '/\.[a-zA-Z_-]+\.[a-zA-Z_-]+/', $trimmed ) ) {
            return true;
        }
        
        return false;
    }
    
    private function is_element_tag( string $name ): bool {
        $html_tags = [
            'div', 'span', 'p', 'a', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
            'ul', 'ol', 'li', 'table', 'tr', 'td', 'th', 'thead', 'tbody',
            'section', 'article', 'header', 'footer', 'nav', 'main', 'aside',
            'button', 'input', 'form', 'label', 'select', 'textarea',
            'img', 'video', 'audio', 'canvas', 'svg',
        ];
        
        return in_array( strtolower( $name ), $html_tags, true );
    }
    
    private function is_core_elementor_selector( string $selector ): bool {
        $core_patterns = [
            '/\.elementor-element\.elementor-/',
            '/\.elementor-widget\.elementor-/',
            '/\.elementor-container\.elementor-/',
            '/\.elementor-section\.elementor-/',
            '/\.elementor-column\.elementor-/',
            '/\.e-con\.e-/',
            '/\.e-flex\.e-/',
        ];
        
        foreach ( $core_patterns as $pattern ) {
            if ( preg_match( $pattern, $selector ) ) {
                return true;
            }
        }
        
        return false;
    }
    
    private function get_existing_class_names( Css_Processing_Context $context ): array {
        // Get existing global class names from context
        $existing_classes = $context->get_metadata( 'existing_global_class_names', [] );
        
        return is_array( $existing_classes ) ? $existing_classes : [];
    }
    
    private function validate_flattening_result( array $result ): void {
        $required_keys = [
            'flattened_rules',
            'flattened_classes',
            'class_mappings',
            'classes_with_direct_styles',
            'classes_only_in_nested',
        ];
        
        foreach ( $required_keys as $key ) {
            if ( ! isset( $result[ $key ] ) ) {
                throw new \Exception(
                    "Flattening result missing required key: {$key}"
                );
            }
            
            if ( ! is_array( $result[ $key ] ) ) {
                throw new \Exception(
                    "Flattening result key '{$key}' must be an array"
                );
            }
        }
    }
}
```

---

### **2. Register the Processor**

**File**: `services/css/processing/css-processor-registry.php`

```php
private function initialize_default_processors(): void {
    // Register flattening processor
    require_once __DIR__ . '/processors/nested-selector-flattening-processor.php';
    $this->register( new \Elementor\Modules\CssConverter\Services\Css\Processing\Processors\Nested_Selector_Flattening_Processor() );
}
```

---

### **3. Update Unified CSS Processor**

**Remove flattening logic** and use processor registry instead:

```php
// BEFORE (lines 1403-1484): 82 lines of flattening logic
private function flatten_all_nested_selectors( array $css_rules ): array {
    // ... 82 lines of code ...
}

// AFTER: Use processor registry
public function process_css_and_widgets( string $css, array $widgets ): array {
    $css_rules = $this->parse_css_and_extract_rules( $css );
    
    // Create processing context
    $context = new Css_Processing_Context();
    $context->set_metadata( 'css_rules', $css_rules );
    $context->set_metadata( 'existing_global_class_names', $this->get_existing_global_class_names() );
    
    // Execute processor pipeline (includes flattening)
    $context = Css_Processor_Factory::execute_css_processing( $context );
    
    // Get flattening results from context
    $flattening_results = [
        'flattened_rules' => $context->get_metadata( 'flattened_rules', [] ),
        'flattened_classes' => $context->get_metadata( 'flattened_classes', [] ),
        'class_mappings' => $context->get_metadata( 'class_mappings', [] ),
        'classes_with_direct_styles' => $context->get_metadata( 'classes_with_direct_styles', [] ),
        'classes_only_in_nested' => $context->get_metadata( 'classes_only_in_nested', [] ),
    ];
    
    // Continue with rest of processing...
}
```

---

## ✅ **Benefits of Standalone Processor**

### **1. Clear Separation of Concerns**
- ✅ Flattening logic isolated
- ✅ Single responsibility
- ✅ Easy to understand

### **2. Stateless Processing**
```php
// OLD: Stateful (buggy)
$service->set_existing_class_names( $names );  // ❌ Mutable state
$service->flatten_css_rule( $rule );

// NEW: Stateless (clean)
$context->set_metadata( 'existing_global_class_names', $names );
$context = $processor->process( $context );  // ✅ Immutable processing
```

### **3. Better Error Handling**
```php
// Validate all operations
$this->validate_flattening_result( $result );

// Validate generated names
if ( empty( $flattened_class_name ) || in_array( $flattened_class_name, $used_names, true ) ) {
    return null;  // ✅ Explicit failure handling
}
```

### **4. Consistent Mapping Keys**
```php
// Always normalize mapping keys
private function normalize_mapping_key( string $class_name ): string {
    // Always use dot prefix for consistency
    if ( $this->is_element_tag( $class_name ) ) {
        return '.' . $class_name;
    }
    return 0 === strpos( $class_name, '.' ) ? $class_name : '.' . $class_name;
}
```

### **5. Independent Testing**
```php
class Nested_Selector_Flattening_Processor_Test extends TestCase {
    public function test_flattens_nested_selector() {
        $processor = new Nested_Selector_Flattening_Processor();
        $context = new Css_Processing_Context();
        $context->set_metadata( 'css_rules', [
            [ 'selector' => '.parent .child', 'properties' => [ /* ... */ ] ],
        ]);
        
        $result = $processor->process( $context );
        
        $flattened_classes = $result->get_metadata( 'flattened_classes' );
        $this->assertNotEmpty( $flattened_classes );
    }
    
    public function test_prevents_name_collisions() {
        // Test collision prevention
    }
    
    public function test_skips_core_elementor_selectors() {
        // Test core selector filtering
    }
    
    public function test_handles_compound_classes() {
        // Test compound class handling
    }
}
```

### **6. Easy to Debug**
```php
// Clear processor execution
$context = $processor->process( $context );

// Check statistics
$stats = $context->get_statistics();
echo "Nested selectors flattened: " . $stats['nested_selectors_flattened'];
echo "Class mappings created: " . $stats['class_mappings_created'];

// Inspect results
$flattened_classes = $context->get_metadata( 'flattened_classes' );
var_dump( $flattened_classes );
```

---

## 📊 **Impact Analysis**

### **Before: Unified CSS Processor**
- 106 references to flattening
- 82 lines of flattening logic
- Mixed concerns
- Stateful processing
- Hard to test
- Hard to debug

### **After: Standalone Processor**
- 0 references in unified processor
- ~300 lines in dedicated processor
- Single responsibility
- Stateless processing
- Easy to test
- Easy to debug

---

## 🧪 **Testing Strategy**

### **Unit Tests**
```php
// Test flattening logic
test_flattens_simple_nested_selector()
test_flattens_complex_nested_selector()
test_preserves_non_nested_selectors()
test_prevents_name_collisions()
test_validates_generated_names()

// Test filtering
test_skips_id_selectors()
test_skips_core_elementor_selectors()
test_skips_compound_class_selectors()

// Test mapping
test_creates_correct_class_mappings()
test_normalizes_mapping_keys()
test_handles_element_tags()

// Test error handling
test_handles_invalid_selectors()
test_handles_parsing_failures()
test_validates_result_structure()
```

### **Integration Tests**
```php
// Test with unified processor
test_processor_integrates_with_registry()
test_flattening_results_available_in_context()
test_statistics_tracked_correctly()

// Test with real CSS
test_processes_actual_nested_css()
test_handles_complex_page_css()
test_maintains_specificity_correctly()
```

---

## 📋 **Implementation Checklist**

### **Phase 1: Create Processor** (2-3 hours)
- [ ] Create `Nested_Selector_Flattening_Processor` class
- [ ] Implement `Css_Processor_Interface`
- [ ] Extract flattening logic from unified processor
- [ ] Add validation and error handling
- [ ] Write unit tests
- [ ] Verify tests pass

### **Phase 2: Register Processor** (1 hour)
- [ ] Register processor in registry
- [ ] Set priority to 15
- [ ] Verify processor executes in pipeline
- [ ] Test processor with context
- [ ] Verify results stored correctly

### **Phase 3: Update Unified Processor** (2 hours)
- [ ] Remove `flatten_all_nested_selectors()` method
- [ ] Remove flattening service initialization
- [ ] Update to use processor registry
- [ ] Extract results from context
- [ ] Run all existing tests
- [ ] Verify all tests pass ✅

### **Phase 4: Integration Testing** (2 hours)
- [ ] Test with real CSS files
- [ ] Test with complex nested selectors
- [ ] Test name collision prevention
- [ ] Test core selector filtering
- [ ] Verify backward compatibility
- [ ] Run Playwright tests ✅

### **Total Time**: 7-8 hours (1 day)

---

## ✅ **Recommendation**

**Implement Nested Selector Flattening Processor as the first processor** because:

1. ✅ **High Impact**: Fixes multiple bugs in current implementation
2. ✅ **Clear Scope**: Well-defined responsibility
3. ✅ **Good Example**: Sets pattern for other processors
4. ✅ **Testable**: Easy to write comprehensive tests
5. ✅ **Low Risk**: Can be tested thoroughly before deployment

**Next Steps**:
1. Create the processor class
2. Write unit tests
3. Register in registry
4. Update unified processor
5. Run integration tests
6. Deploy and monitor

This will serve as the **template** for extracting other processors (CSS fetching, preprocessing, etc.).

