# PRD: Unified Widget Conversion Service Architectural Cleanup

**Status**: Draft  
**Priority**: High  
**Complexity**: Medium  
**Estimated Effort**: 5 days (incremental implementation)  
**Approach**: 🎯 **Registry Pattern** (Inspired by existing Property Mapper Registry)

---

## 🎯 **Executive Summary**

The `Unified_Widget_Conversion_Service` currently violates separation of concerns by handling CSS extraction, parsing, cleaning, and processing - responsibilities that belong in the CSS processor layer. 

### **Solution: Registry-Based Processor Pattern** ✅

Following the **existing Property Mapper Registry pattern**, we'll implement a **CSS Processor Registry** that allows:
- ✅ **Incremental extraction** of CSS processing logic (one processor at a time)
- ✅ **Zero breaking changes** (each phase maintains backward compatibility)
- ✅ **Independent testing** (each processor tested separately)
- ✅ **Easy rollback** (can pause or revert at any phase)
- ✅ **Future extensibility** (trivial to add new processors)

### **Key Innovation** 💡

Instead of a big-bang refactoring, we extract CSS processing **incrementally** using a registry pattern:

```
Phase 0: Create registry infrastructure (nothing uses it yet)
Phase 1: Extract CSS fetching → tests pass ✅
Phase 2: Extract CSS preprocessing → tests pass ✅
Phase 3: Extract media query filtering → tests pass ✅
Phase 4: Extract calc() processing → tests pass ✅
Phase 5: Extract CSS value fixing → tests pass ✅
Phase 6-9: Cleanup and consolidation
```

After each phase, **all tests pass** and the system works exactly as before.

---

## 📋 **Problem Statement**

### **Current Architecture Violations**

#### **1. Widget Service Doing CSS Processing Work**
The `Unified_Widget_Conversion_Service` currently handles:
- ❌ CSS extraction from HTML (`extract_all_css()`)
- ❌ CSS parsing and validation (`parse_css_sources_safely()`)
- ❌ CSS cleaning and preprocessing (`clean_css_for_parser()`)
- ❌ CSS filtering (`filter_out_media_queries()`)
- ❌ CSS transformation (`replace_calc_expressions()`)
- ❌ HTTP requests for external CSS files
- ❌ CSS import resolution

**Impact**: The widget service has 465+ lines of CSS processing code that doesn't belong there.

#### **2. Widget Service Aware of CSS Processing Internals**
The service extracts and passes through CSS-specific statistics:
- ❌ `compound_classes` / `compound_classes_created` (lines 87-88)
- ❌ `flattened_classes_count` (line 73)
- ❌ `reset_styles_detected` / `reset_styles_stats` / `complex_reset_styles` (lines 75-77)
- ❌ `reset_css_file_generated` (line 114)

**Impact**: Widget service is coupled to CSS processing implementation details.

#### **3. Widget Service Re-Processing Resolved Styles**
The service extracts styles by source type from already-resolved widgets:
- ❌ `extract_styles_by_source_from_widgets()` (lines 546-595)
- ❌ Reconstructing CSS processing data for widget creator compatibility

**Impact**: Unnecessary processing layer that reverses work already done by CSS processor.

#### **4. Duplicate Widget Conversion Services**
Two separate widget conversion services exist:
- `Unified_Widget_Conversion_Service` (598 lines)
- `Widget_Conversion_Service` (686 lines)

**Impact**: Code duplication, maintenance burden, architectural confusion.

---

## 🎯 **Goals**

### **Primary Goals**
1. **Establish Clear Separation of Concerns**: Widget service only creates widgets, CSS processor handles all CSS
2. **Remove CSS Processing from Widget Service**: Move all CSS logic to appropriate layers
3. **Eliminate Statistics Pass-Through**: CSS processor returns complete statistics
4. **Simplify Widget Creator Interface**: Remove legacy CSS processing data reconstruction
5. **Consolidate Widget Conversion Services**: Single service following unified architecture

### **Success Metrics**
- ✅ Zero CSS processing code in widget service
- ✅ Widget service reduced to <200 lines
- ✅ All CSS statistics handled by CSS processor
- ✅ Single widget conversion service
- ✅ All tests passing

---

## 🏗️ **Proposed Architecture**

### **Registry-Based Processor Pattern** 🎯

Following the existing **Property Mapper Registry** pattern, we'll implement a **CSS Processor Registry** that allows incremental addition of processors without breaking existing functionality.

```
┌─────────────────────────────────────────────────────────────┐
│                    INPUT LAYER                               │
├─────────────────────────────────────────────────────────────┤
│  HTML Parser                                                 │
│  - Extract HTML elements                                     │
│  - Extract CSS from <style> tags                            │
│  - Extract inline styles from elements                       │
│  - Validate HTML structure                                   │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│              CSS PROCESSOR REGISTRY (NEW) 🎯                 │
├─────────────────────────────────────────────────────────────┤
│  Css_Processor_Registry                                      │
│  - Register CSS processors dynamically                       │
│  - Execute processors in order                               │
│  - Validate processor interfaces                             │
│  - Support incremental addition                              │
│                                                              │
│  Registered Processors:                                      │
│  ├─ Css_Fetcher_Processor (NEW)                             │
│  │  - Fetch external CSS files                              │
│  │  - Follow @import statements                             │
│  │  - Handle HTTP requests                                  │
│  │                                                           │
│  ├─ Css_Preprocessor_Processor (NEW)                        │
│  │  - Clean CSS for parsing                                 │
│  │  - Filter media queries                                  │
│  │  - Replace calc() expressions                            │
│  │  - Fix broken CSS values                                 │
│  │                                                           │
│  └─ Unified_Css_Processor (EXISTING - REFACTORED)           │
│     - Parse CSS                                              │
│     - Process compound selectors                             │
│     - Flatten nested selectors                               │
│     - Detect reset styles                                    │
│     - Create global classes                                  │
│     - Resolve styles to widgets                              │
│     - Generate complete statistics                           │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                  WIDGET MAPPING LAYER                        │
├─────────────────────────────────────────────────────────────┤
│  Widget Mapper                                               │
│  - Map HTML elements to widget types                         │
│  - Handle element-to-widget conversion                       │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                  WIDGET CREATION LAYER                       │
├─────────────────────────────────────────────────────────────┤
│  Unified Widget Conversion Service                           │
│  - Orchestrate conversion flow                               │
│  - Coordinate between layers                                 │
│  - Collect conversion logs                                   │
│  - Return final results                                      │
│                                                              │
│  Widget Creator                                              │
│  - Create Elementor widgets from resolved data               │
│  - Apply global classes                                      │
│  - Format widget data                                        │
│  - Save to WordPress                                         │
└─────────────────────────────────────────────────────────────┘
```

### **Key Benefits of Registry Pattern** ✅

1. **Incremental Implementation**: Add processors one at a time
2. **No Breaking Changes**: Existing code continues to work
3. **Testable**: Each processor can be tested independently
4. **Extensible**: Easy to add new processors in the future
5. **Consistent**: Follows existing Property Mapper Registry pattern

---

## 🎯 **Registry Pattern Implementation**

### **Inspired by Existing Property Mapper Registry**

The codebase already uses a successful registry pattern for property mappers:

```php
// EXISTING: Property Mapper Registry Pattern
class Class_Property_Mapper_Registry {
    private array $mappers = [];
    
    public function register( string $property, object $mapper ): void {
        $this->mappers[ $property ] = $mapper;
    }
    
    public function resolve( string $property, $value = null ): ?object {
        return $this->mappers[ $property ] ?? null;
    }
}

// Usage
$registry = Class_Property_Mapper_Registry::get_instance();
$registry->register( 'color', new Color_Property_Mapper() );
$registry->register( 'font-size', new Font_Size_Property_Mapper() );
```

### **New: CSS Processor Registry Pattern**

We'll apply the same pattern to CSS processors:

```php
// NEW: CSS Processor Registry Pattern
interface Css_Processor_Interface {
    public function get_processor_name(): string;
    public function get_priority(): int;
    public function process( Css_Processing_Context $context ): Css_Processing_Context;
    public function supports_context( Css_Processing_Context $context ): bool;
}

class Css_Processor_Registry {
    private array $processors = [];
    private static ?self $instance = null;
    
    public static function get_instance(): self {
        if ( null === self::$instance ) {
            self::$instance = new self();
        }
        return self::$instance;
    }
    
    public function register( Css_Processor_Interface $processor ): void {
        $this->processors[ $processor->get_processor_name() ] = $processor;
    }
    
    public function execute_pipeline( Css_Processing_Context $context ): Css_Processing_Context {
        // Sort processors by priority
        $sorted_processors = $this->get_sorted_processors();
        
        // Execute each processor in order
        foreach ( $sorted_processors as $processor ) {
            if ( $processor->supports_context( $context ) ) {
                $context = $processor->process( $context );
            }
        }
        
        return $context;
    }
    
    private function get_sorted_processors(): array {
        $processors = $this->processors;
        usort( $processors, function( $a, $b ) {
            return $a->get_priority() <=> $b->get_priority();
        });
        return $processors;
    }
}
```

### **Processor Context Object**

```php
class Css_Processing_Context {
    private string $raw_css = '';
    private string $processed_css = '';
    private array $elements = [];
    private array $widgets = [];
    private array $statistics = [];
    private array $metadata = [];
    
    // Getters and setters...
    public function get_raw_css(): string;
    public function set_processed_css( string $css ): void;
    public function add_statistic( string $key, $value ): void;
    public function get_statistics(): array;
}
```

### **Incremental Implementation Strategy** 🎯

#### **Step 1: Create Registry Infrastructure (No Breaking Changes)**
```php
// 1. Create interface
interface Css_Processor_Interface { ... }

// 2. Create context
class Css_Processing_Context { ... }

// 3. Create registry
class Css_Processor_Registry { ... }

// 4. Create factory
class Css_Processor_Factory { ... }

// Result: New infrastructure exists but nothing uses it yet
```

#### **Step 2: Wrap Existing Code in Processors (No Breaking Changes)**
```php
// Wrap existing Unified_Css_Processor methods as individual processors

class Existing_Css_Parser_Processor implements Css_Processor_Interface {
    public function get_processor_name(): string {
        return 'existing_css_parser';
    }
    
    public function get_priority(): int {
        return 100; // Execute first
    }
    
    public function process( Css_Processing_Context $context ): Css_Processing_Context {
        // Call existing Unified_Css_Processor methods
        $css = $context->get_raw_css();
        $parsed = $this->unified_css_processor->parse_css( $css );
        $context->set_processed_css( $parsed );
        return $context;
    }
}

// Result: Existing code wrapped, still works exactly the same
```

#### **Step 3: Extract One Method at a Time (Incremental)**
```php
// Extract CSS fetching first
class Css_Fetcher_Processor implements Css_Processor_Interface {
    public function get_processor_name(): string {
        return 'css_fetcher';
    }
    
    public function get_priority(): int {
        return 10; // Execute very early
    }
    
    public function process( Css_Processing_Context $context ): Css_Processing_Context {
        $css_urls = $context->get_metadata( 'css_urls' );
        $fetched_css = $this->fetch_css_from_urls( $css_urls );
        
        $existing_css = $context->get_raw_css();
        $context->set_raw_css( $existing_css . "\n" . $fetched_css );
        
        $context->add_statistic( 'css_files_fetched', count( $css_urls ) );
        return $context;
    }
    
    private function fetch_css_from_urls( array $urls ): string {
        // Move logic from Unified_Widget_Conversion_Service here
    }
}

// Register the new processor
$registry = Css_Processor_Registry::get_instance();
$registry->register( new Css_Fetcher_Processor() );

// Remove old code from Unified_Widget_Conversion_Service
// Result: One method extracted, tests still pass
```

#### **Step 4: Repeat for Each Processor (One by One)**
- Extract CSS preprocessing → `Css_Preprocessor_Processor`
- Extract media query filtering → `Media_Query_Filter_Processor`
- Extract calc() replacement → `Calc_Expression_Processor`
- etc.

Each extraction:
1. ✅ Maintains backward compatibility
2. ✅ Can be tested independently
3. ✅ Can be deployed separately
4. ✅ Doesn't break existing functionality

---

## 📝 **Detailed Requirements**

### **Phase 0: Registry Infrastructure (Day 1) 🎯 NEW**

#### **0.1 Create Processor Interface**
**File**: `services/css/processing/contracts/css-processor-interface.php`

```php
<?php
namespace Elementor\Modules\CssConverter\Services\Css\Processing\Contracts;

interface Css_Processor_Interface {
    public function get_processor_name(): string;
    public function get_priority(): int;
    public function process( Css_Processing_Context $context ): Css_Processing_Context;
    public function supports_context( Css_Processing_Context $context ): bool;
    public function get_statistics_keys(): array;
}
```

---

#### **0.2 Create Processing Context**
**File**: `services/css/processing/css-processing-context.php`

```php
<?php
namespace Elementor\Modules\CssConverter\Services\Css\Processing;

class Css_Processing_Context {
    private string $raw_css = '';
    private string $processed_css = '';
    private array $elements = [];
    private array $widgets = [];
    private array $statistics = [];
    private array $metadata = [];
    
    public function get_raw_css(): string {
        return $this->raw_css;
    }
    
    public function set_raw_css( string $css ): void {
        $this->raw_css = $css;
    }
    
    public function get_processed_css(): string {
        return $this->processed_css;
    }
    
    public function set_processed_css( string $css ): void {
        $this->processed_css = $css;
    }
    
    public function get_elements(): array {
        return $this->elements;
    }
    
    public function set_elements( array $elements ): void {
        $this->elements = $elements;
    }
    
    public function get_widgets(): array {
        return $this->widgets;
    }
    
    public function set_widgets( array $widgets ): void {
        $this->widgets = $widgets;
    }
    
    public function add_statistic( string $key, $value ): void {
        $this->statistics[ $key ] = $value;
    }
    
    public function get_statistics(): array {
        return $this->statistics;
    }
    
    public function set_metadata( string $key, $value ): void {
        $this->metadata[ $key ] = $value;
    }
    
    public function get_metadata( string $key, $default = null ) {
        return $this->metadata[ $key ] ?? $default;
    }
    
    public function get_all_metadata(): array {
        return $this->metadata;
    }
}
```

---

#### **0.3 Create Processor Registry**
**File**: `services/css/processing/css-processor-registry.php`

```php
<?php
namespace Elementor\Modules\CssConverter\Services\Css\Processing;

use Elementor\Modules\CssConverter\Services\Css\Processing\Contracts\Css_Processor_Interface;

class Css_Processor_Registry {
    private array $processors = [];
    private static ?self $instance = null;
    
    public static function get_instance(): self {
        if ( null === self::$instance ) {
            self::$instance = new self();
        }
        return self::$instance;
    }
    
    private function __construct() {
        // Initialize with default processors
        $this->initialize_default_processors();
    }
    
    private function initialize_default_processors(): void {
        // Will be populated incrementally
    }
    
    public function register( Css_Processor_Interface $processor ): void {
        $name = $processor->get_processor_name();
        $this->processors[ $name ] = $processor;
    }
    
    public function unregister( string $processor_name ): void {
        unset( $this->processors[ $processor_name ] );
    }
    
    public function get_processor( string $name ): ?Css_Processor_Interface {
        return $this->processors[ $name ] ?? null;
    }
    
    public function get_all_processors(): array {
        return $this->processors;
    }
    
    public function execute_pipeline( Css_Processing_Context $context ): Css_Processing_Context {
        $sorted_processors = $this->get_sorted_processors();
        
        foreach ( $sorted_processors as $processor ) {
            if ( $processor->supports_context( $context ) ) {
                $context = $processor->process( $context );
            }
        }
        
        return $context;
    }
    
    private function get_sorted_processors(): array {
        $processors = array_values( $this->processors );
        usort( $processors, function( $a, $b ) {
            return $a->get_priority() <=> $b->get_priority();
        });
        return $processors;
    }
    
    public function get_statistics(): array {
        return [
            'total_processors' => count( $this->processors ),
            'processor_names' => array_keys( $this->processors ),
        ];
    }
    
    public static function reset_instance(): void {
        self::$instance = null;
    }
}
```

---

#### **0.4 Create Processor Factory**
**File**: `services/css/processing/css-processor-factory.php`

```php
<?php
namespace Elementor\Modules\CssConverter\Services\Css\Processing;

class Css_Processor_Factory {
    private static ?Css_Processor_Registry $registry = null;
    
    public static function get_registry(): Css_Processor_Registry {
        if ( null === self::$registry ) {
            self::$registry = Css_Processor_Registry::get_instance();
        }
        return self::$registry;
    }
    
    public static function execute_css_processing( Css_Processing_Context $context ): Css_Processing_Context {
        return self::get_registry()->execute_pipeline( $context );
    }
    
    public static function register_processor( Css_Processor_Interface $processor ): void {
        self::get_registry()->register( $processor );
    }
    
    public static function get_statistics(): array {
        return self::get_registry()->get_statistics();
    }
    
    public static function reset(): void {
        self::$registry = null;
        Css_Processor_Registry::reset_instance();
    }
}
```

---

### **Phase 1: Extract CSS Processing to New Services**

#### **1.1 Create CSS Fetcher Service**
**File**: `services/css/fetching/css-fetcher-service.php`

```php
class Css_Fetcher_Service {
    public function fetch_css_from_urls( array $css_urls, bool $follow_imports = false ): array;
    public function fetch_css_from_url( string $url ): string;
    private function resolve_relative_url( string $relative_url, string $base_url ): string;
    private function follow_import_statements( string $css, string $base_url ): array;
}
```

**Responsibilities**:
- Fetch external CSS files via HTTP
- Handle CSS @import statements
- Resolve relative URLs
- Error handling for failed requests

**Move from `Unified_Widget_Conversion_Service`**:
- `extract_all_css()` - lines 130-193 (CSS fetching parts)
- `resolve_relative_url()` - lines 474-484

---

#### **1.2 Create CSS Preprocessor Service**
**File**: `services/css/preprocessing/css-preprocessor-service.php`

```php
class Css_Preprocessor_Service {
    public function preprocess_css( string $css ): string;
    public function clean_css_for_parser( string $css ): string;
    public function filter_out_media_queries( string $css ): string;
    public function replace_calc_expressions( string $css ): string;
    public function fix_broken_property_values( string $css ): string;
    public function fix_broken_css_values( string $css ): string;
    public function add_newlines_to_minified_css( string $css ): string;
    private function preserve_elementor_variables( string $css ): string;
    private function should_preserve_css_variable( string $var_name ): bool;
}
```

**Responsibilities**:
- Clean CSS before parsing
- Filter out media queries (desktop-only)
- Replace calc() and CSS functions
- Fix broken CSS syntax
- Preserve Elementor variables

**Move from `Unified_Widget_Conversion_Service`**:
- `parse_css_sources_safely()` - lines 195-231 (cleaning parts)
- `clean_css_for_parser()` - lines 233-290
- `filter_out_media_queries()` - lines 292-359
- `replace_calc_expressions()` - lines 361-388
- `preserve_elementor_variables()` - lines 390-410
- `should_preserve_css_variable()` - lines 412-428
- `fix_broken_css_values()` - lines 430-447
- `fix_broken_property_values()` - lines 449-458
- `add_newlines_to_minified_css()` - lines 460-472

---

#### **1.3 Update HTML Parser**
**File**: `services/css/parsing/html-parser.php`

**Add Methods**:
```php
public function extract_css_from_html( string $html ): string;
public function extract_inline_styles_as_css( array $elements ): string;
```

**Responsibilities**:
- Extract CSS from `<style>` tags
- Convert inline styles to CSS rules
- Generate class names for inline styles

**Move from `Unified_Widget_Conversion_Service`**:
- `extract_all_css()` - lines 130-193 (HTML extraction parts)

---

### **Phase 2: Update Unified CSS Processor**

#### **2.1 Integrate New Services**
**File**: `services/css/processing/unified-css-processor.php`

**Add Dependencies**:
```php
private $css_fetcher;
private $css_preprocessor;

public function __construct(
    $css_parser,
    $property_converter,
    Css_Specificity_Calculator $specificity_calculator,
    Css_Fetcher_Service $css_fetcher,
    Css_Preprocessor_Service $css_preprocessor
) {
    // ...
}
```

---

#### **2.2 Add Complete CSS Processing Method**
```php
public function process_css_from_sources(
    string $html,
    array $css_urls,
    bool $follow_imports,
    array $elements
): string {
    // Extract CSS from HTML
    $html_css = $this->html_parser->extract_css_from_html( $html );
    
    // Extract inline styles as CSS
    $inline_css = $this->html_parser->extract_inline_styles_as_css( $elements );
    
    // Fetch external CSS
    $external_css = $this->css_fetcher->fetch_css_from_urls( $css_urls, $follow_imports );
    
    // Combine all CSS
    $all_css = $html_css . "\n" . $inline_css . "\n" . $external_css;
    
    // Preprocess CSS
    return $this->css_preprocessor->preprocess_css( $all_css );
}
```

---

#### **2.3 Return Complete Statistics**
```php
public function process_css_and_widgets( string $css, array $widgets ): array {
    // ... existing processing ...
    
    return [
        'widgets' => $resolved_widgets,
        'global_classes' => $global_classes,
        'css_variable_definitions' => $css_variable_definitions,
        'class_name_mappings' => $class_name_mappings,
        'stats' => [
            'rules_processed' => $rules_count,
            'properties_converted' => $properties_count,
            'global_classes_created' => count( $global_classes ),
            'css_variables_extracted' => count( $css_variable_definitions ),
            
            // CSS-specific statistics (not exposed to widget service)
            'compound_classes_created' => count( $compound_results['compound_global_classes'] ),
            'flattened_classes_created' => count( $flattening_results['flattened_classes'] ),
            'reset_styles_detected' => $reset_styles_stats['reset_element_styles'] > 0,
            'element_selectors_processed' => $reset_styles_stats['reset_element_styles'],
            'direct_widget_styles_applied' => $reset_styles_stats['direct_applicable_styles'],
            'complex_reset_styles_count' => count( $complex_reset_styles ),
        ],
    ];
}
```

---

### **Phase 3: Simplify Unified Widget Conversion Service**

#### **3.1 Remove All CSS Processing Code**

**Delete Methods**:
- `extract_all_css()` - lines 130-193
- `parse_css_sources_safely()` - lines 195-231
- `clean_css_for_parser()` - lines 233-290
- `filter_out_media_queries()` - lines 292-359
- `replace_calc_expressions()` - lines 361-388
- `preserve_elementor_variables()` - lines 390-410
- `should_preserve_css_variable()` - lines 412-428
- `fix_broken_css_values()` - lines 430-447
- `fix_broken_property_values()` - lines 449-458
- `add_newlines_to_minified_css()` - lines 460-472
- `resolve_relative_url()` - lines 474-484
- `extract_styles_by_source_from_widgets()` - lines 546-595

**Delete Properties**:
- `$css_parser` - line 19
- `$css_output_optimizer` - line 20
- `$property_converter` - line 21

**Delete Methods from Constructor**:
- `initialize_css_parser()` - lines 39-42

**Total Lines Removed**: ~465 lines

---

#### **3.2 Simplify convert_from_html() Method**

**Current (Wrong)**:
```php
public function convert_from_html( $html, $css_urls = [], $follow_imports = false, $options = [] ): array {
    // Parse HTML
    $elements = $this->html_parser->parse( $html );
    
    // Extract CSS (WRONG - CSS processing in widget service)
    $all_css = $this->extract_all_css( $html, $css_urls, $follow_imports, $elements );
    
    // Map widgets
    $mapped_widgets = $this->widget_mapper->map_elements( $elements );
    
    // Process CSS (delegates to CSS processor)
    $unified_processing_result = $this->unified_css_processor->process_css_and_widgets( $all_css, $mapped_widgets );
    
    // Extract CSS statistics (WRONG - aware of CSS internals)
    $compound_classes = $unified_processing_result['compound_classes'] ?? [];
    $flattened_classes_count = $unified_processing_result['flattened_classes_count'] ?? 0;
    $reset_styles_detected = $unified_processing_result['reset_styles_detected'] ?? false;
    
    // Create widgets
    $creation_result = $this->create_widgets_with_resolved_styles( ... );
    
    // Return with CSS statistics (WRONG - exposing CSS internals)
    return [
        'compound_classes_created' => ...,
        'flattened_classes_created' => ...,
        'reset_styles_detected' => ...,
    ];
}
```

**Proposed (Correct)**:
```php
public function convert_from_html( $html, $css_urls = [], $follow_imports = false, $options = [] ): array {
    $conversion_log = $this->initialize_conversion_log( $html, $css_urls, $options );
    
    try {
        // Phase 1: Parse HTML
        $elements = $this->html_parser->parse( $html );
        $conversion_log['parsed_elements'] = count( $elements );
        
        // Phase 2: Validate HTML
        $validation_issues = $this->html_parser->validate_html_structure( $elements, 20 );
        if ( ! empty( $validation_issues ) ) {
            $conversion_log['warnings'] = array_merge( $conversion_log['warnings'], $validation_issues );
        }
        
        // Phase 3: Map elements to widgets
        $mapped_widgets = $this->widget_mapper->map_elements( $elements );
        $conversion_log['mapping_stats'] = $this->widget_mapper->get_mapping_stats( $elements );
        
        // Phase 4: Process CSS and resolve styles (CSS processor handles everything)
        $css_processing_result = $this->unified_css_processor->process_css_from_html_and_widgets(
            $html,
            $css_urls,
            $follow_imports,
            $elements,
            $mapped_widgets
        );
        
        $conversion_log['css_processing'] = $css_processing_result['stats'];
        
        // Phase 5: Create widgets with resolved styles
        $creation_result = $this->create_widgets(
            $css_processing_result['widgets'],
            $css_processing_result['global_classes'],
            $css_processing_result['css_variable_definitions'],
            $options
        );
        
        $conversion_log['widget_creation'] = $creation_result['stats'];
        $conversion_log['end_time'] = microtime( true );
        $conversion_log['total_time'] = $conversion_log['end_time'] - $conversion_log['start_time'];
        
        return [
            'success' => true,
            'widgets_created' => $creation_result['widgets_created'],
            'global_classes_created' => $creation_result['global_classes_created'],
            'global_classes' => $css_processing_result['global_classes'],
            'class_name_mappings' => $css_processing_result['class_name_mappings'],
            'variables_created' => $creation_result['variables_created'],
            'post_id' => $creation_result['post_id'],
            'edit_url' => $creation_result['edit_url'],
            'conversion_log' => $conversion_log,
            'warnings' => $conversion_log['warnings'],
            'errors' => $creation_result['errors'] ?? [],
        ];
        
    } catch ( \Exception $e ) {
        $conversion_log['errors'][] = [
            'message' => esc_html( $e->getMessage() ),
            'trace' => esc_html( $e->getTraceAsString() ),
        ];
        throw new Class_Conversion_Exception(
            'Widget conversion failed: ' . esc_html( $e->getMessage() ),
            0
        );
    }
}
```

---

#### **3.3 Simplify create_widgets() Method**

**Current (Wrong)**:
```php
private function create_widgets_with_resolved_styles(
    array $widgets,
    array $options,
    array $global_classes,
    array $compound_classes = [],      // WRONG - CSS internal
    int $compound_classes_created = 0, // WRONG - CSS internal
    array $css_variable_definitions = []
): array {
    // ... create post ...
    
    // WRONG - Re-processing resolved styles by source
    $extracted_styles = $this->extract_styles_by_source_from_widgets( $widgets );
    
    // WRONG - Reconstructing CSS processing data
    $css_processing_result = [
        'global_classes' => $global_classes,
        'css_variable_definitions' => $css_variable_definitions,
        'widget_styles' => array_merge( $extracted_styles['css_selector_styles'], ... ),
        'element_styles' => $extracted_styles['element_styles'],
        'id_styles' => $extracted_styles['id_styles'],
        'direct_widget_styles' => $extracted_styles['inline_styles'],
        'stats' => [ ... ],
    ];
    
    $creation_result = $this->widget_creator->create_widgets( $widgets, $css_processing_result, $options );
    
    return [
        'compound_classes_created' => $compound_classes_created, // WRONG
        'compound_classes' => $compound_classes,                 // WRONG
        // ...
    ];
}
```

**Proposed (Correct)**:
```php
private function create_widgets(
    array $widgets_with_resolved_styles,
    array $global_classes,
    array $css_variable_definitions,
    array $options
): array {
    // Create or get post
    $post_id = $this->get_or_create_post( $options );
    
    // Create widgets (widgets already have resolved styles)
    $creation_result = $this->widget_creator->create_widgets(
        $widgets_with_resolved_styles,
        $global_classes,
        $css_variable_definitions,
        $post_id,
        $options
    );
    
    return [
        'widgets_created' => $creation_result['widgets_created'],
        'global_classes_created' => count( $global_classes ),
        'variables_created' => $creation_result['variables_created'],
        'post_id' => $creation_result['post_id'],
        'edit_url' => $creation_result['edit_url'],
        'errors' => $creation_result['errors'] ?? [],
        'stats' => $creation_result['stats'] ?? [],
    ];
}
```

---

### **Phase 4: Update Widget Creator Interface**

#### **4.1 Simplify Widget Creator Constructor**

**Current**:
```php
public function create_widgets( $widgets, $css_processing_result, $options )
```

**Proposed**:
```php
public function create_widgets(
    array $widgets_with_resolved_styles,
    array $global_classes,
    array $css_variable_definitions,
    int $post_id,
    array $options
): array
```

**Rationale**: 
- Widgets already have `resolved_styles` - no need to reconstruct CSS data
- Global classes needed for class application
- CSS variable definitions needed for variable creation
- Remove legacy `$css_processing_result` parameter

---

#### **4.2 Remove Style Source Extraction**

The widget creator should work directly with `resolved_styles` on each widget, not extract styles by source type.

**Current (Wrong)**:
```php
// Widget creator receives reconstructed CSS data
$css_processing_result = [
    'widget_styles' => [...],
    'element_styles' => [...],
    'id_styles' => [...],
    'direct_widget_styles' => [...],
];
```

**Proposed (Correct)**:
```php
// Widget creator uses resolved_styles directly
foreach ( $widgets as $widget ) {
    $resolved_styles = $widget['resolved_styles']; // Already resolved by CSS processor
    $formatted_data = $this->data_formatter->format_widget_data( $resolved_styles );
    // ...
}
```

---

### **Phase 5: Consolidate Widget Conversion Services**

#### **5.1 Analysis: Widget_Conversion_Service vs Unified_Widget_Conversion_Service**

**Comparison**:

| Aspect | Widget_Conversion_Service | Unified_Widget_Conversion_Service |
|--------|---------------------------|-----------------------------------|
| **Lines of Code** | 686 | 598 |
| **CSS Processing** | Yes (lines 238-532) | Yes (lines 130-484) |
| **Uses Unified CSS Processor** | Yes | Yes |
| **Has convert_from_url()** | Yes | No |
| **Has convert_from_css()** | Yes | No |
| **Architectural Violations** | Same as unified | Same as unified |

**Conclusion**: Both services have the same architectural problems and use the same unified CSS processor. The only difference is that `Widget_Conversion_Service` has additional entry points (`convert_from_url()`, `convert_from_css()`).

---

#### **5.2 Recommendation: Merge into Single Service**

**Proposed**: Keep `Unified_Widget_Conversion_Service` and add missing entry points.

**Rationale**:
1. **Single Source of Truth**: One service following unified architecture
2. **Eliminate Duplication**: Both services do the same thing
3. **Clear Naming**: "Unified" indicates the architectural approach
4. **Easier Maintenance**: One service to maintain and test

---

#### **5.3 Add Missing Entry Points**

**Add to `Unified_Widget_Conversion_Service`**:

```php
public function convert_from_url( string $url, array $css_urls = [], bool $follow_imports = false, array $options = [] ): array {
    $timeout = apply_filters( 'elementor_widget_converter_timeout', 30 );
    
    $response = wp_remote_get( $url, [
        'timeout' => $timeout,
        'user-agent' => 'Elementor Widget Converter/1.0',
    ] );
    
    if ( is_wp_error( $response ) ) {
        throw new Class_Conversion_Exception(
            'Failed to fetch URL: ' . $response->get_error_message(),
            [ 'url' => $url ]
        );
    }
    
    $status_code = wp_remote_retrieve_response_code( $response );
    if ( 200 !== $status_code ) {
        throw new Class_Conversion_Exception(
            'HTTP error: ' . $status_code,
            [ 'url' => $url, 'status_code' => $status_code ]
        );
    }
    
    $html = wp_remote_retrieve_body( $response );
    
    if ( empty( $css_urls ) ) {
        $css_urls = $this->html_parser->extract_linked_css( $html );
    }
    
    return $this->convert_from_html( $html, $css_urls, $follow_imports, $options );
}

public function convert_from_css( string $css, array $css_urls = [], bool $follow_imports = false, array $options = [] ): array {
    // CSS-only conversion creates global classes without widgets
    $conversion_log = $this->initialize_conversion_log( $css, $css_urls, $options );
    
    try {
        // Process CSS through unified processor
        $css_processing_result = $this->unified_css_processor->process_css_only(
            $css,
            $css_urls,
            $follow_imports
        );
        
        $conversion_log['css_processing'] = $css_processing_result['stats'];
        $conversion_log['end_time'] = microtime( true );
        $conversion_log['total_time'] = $conversion_log['end_time'] - $conversion_log['start_time'];
        
        return [
            'success' => true,
            'widgets_created' => [],
            'global_classes_created' => count( $css_processing_result['global_classes'] ),
            'global_classes' => $css_processing_result['global_classes'],
            'css_rules_processed' => $css_processing_result['stats']['rules_processed'],
            'conversion_log' => $conversion_log,
            'warnings' => $conversion_log['warnings'],
        ];
        
    } catch ( \Exception $e ) {
        $conversion_log['errors'][] = [
            'message' => esc_html( $e->getMessage() ),
            'trace' => esc_html( $e->getTraceAsString() ),
        ];
        throw new Class_Conversion_Exception(
            'CSS conversion failed: ' . esc_html( $e->getMessage() ),
            0
        );
    }
}
```

---

#### **5.4 Deprecate Widget_Conversion_Service**

**File**: `services/widgets/widget-conversion-service.php`

**Action**: Add deprecation notice and redirect to unified service.

```php
/**
 * @deprecated Use Unified_Widget_Conversion_Service instead
 */
class Widget_Conversion_Service {
    private $unified_service;
    
    public function __construct( $use_zero_defaults = false ) {
        _deprecated_function(
            __CLASS__,
            '1.0.0',
            'Unified_Widget_Conversion_Service'
        );
        
        // Redirect to unified service
        $this->unified_service = new Unified_Widget_Conversion_Service(
            new Html_Parser(),
            new Widget_Mapper(),
            new Unified_Css_Processor( /* ... */ ),
            new Widget_Creator( $use_zero_defaults ),
            $use_zero_defaults
        );
    }
    
    public function convert_from_url( $url, $css_urls = [], $follow_imports = false, $options = [] ) {
        return $this->unified_service->convert_from_url( $url, $css_urls, $follow_imports, $options );
    }
    
    public function convert_from_html( $html, $css_urls = [], $follow_imports = false, $options = [] ) {
        return $this->unified_service->convert_from_html( $html, $css_urls, $follow_imports, $options );
    }
    
    public function convert_from_css( $css, $css_urls = [], $follow_imports = false, $options = [] ) {
        return $this->unified_service->convert_from_css( $css, $css_urls, $follow_imports, $options );
    }
}
```

**Timeline**: Remove completely in version 2.0.0 after one release cycle.

---

## 📊 **Expected Results**

### **Before Cleanup**

| File | Lines | Responsibilities |
|------|-------|------------------|
| `Unified_Widget_Conversion_Service` | 598 | Widget creation + CSS extraction + CSS parsing + CSS preprocessing |
| `Widget_Conversion_Service` | 686 | Widget creation + CSS extraction + CSS parsing + CSS preprocessing |
| **Total** | **1,284** | **Duplicated responsibilities** |

### **After Cleanup**

| File | Lines | Responsibilities |
|------|-------|------------------|
| `Unified_Widget_Conversion_Service` | ~180 | Widget creation orchestration only |
| `Css_Fetcher_Service` | ~100 | CSS fetching from external sources |
| `Css_Preprocessor_Service` | ~250 | CSS cleaning and preprocessing |
| `Unified_Css_Processor` (updated) | ~1,750 | All CSS processing |
| `Html_Parser` (updated) | ~150 | HTML + CSS extraction from HTML |
| **Total** | **~2,430** | **Clear separation of concerns** |

**Benefits**:
- ✅ 1,146 lines reduction through elimination of duplication
- ✅ Clear architectural boundaries
- ✅ Easier to test individual components
- ✅ Easier to maintain and extend

---

## 🧪 **Testing Strategy**

### **Unit Tests**

#### **New Services**
1. **Css_Fetcher_Service**
   - Test fetching single CSS file
   - Test following @import statements
   - Test relative URL resolution
   - Test error handling for failed requests

2. **Css_Preprocessor_Service**
   - Test media query filtering
   - Test calc() expression replacement
   - Test CSS variable preservation
   - Test broken CSS fixing
   - Test minified CSS formatting

#### **Updated Services**
3. **Unified_Css_Processor**
   - Test complete CSS processing from sources
   - Test statistics generation
   - Verify no statistics leakage to widget service

4. **Unified_Widget_Conversion_Service**
   - Test orchestration flow
   - Test convert_from_html()
   - Test convert_from_url()
   - Test convert_from_css()
   - Verify no CSS processing code

---

### **Integration Tests**

1. **End-to-End Conversion**
   - Test HTML with inline styles → widgets
   - Test HTML with external CSS → widgets
   - Test HTML with @import statements → widgets
   - Test CSS-only conversion → global classes

2. **Statistics Verification**
   - Verify CSS statistics in CSS processor result
   - Verify widget statistics in widget service result
   - Verify no CSS internals exposed to widget service

3. **Backward Compatibility**
   - Test deprecated Widget_Conversion_Service still works
   - Test all existing API endpoints still function

---

### **Playwright Tests**

1. **Verify Existing Tests Pass**
   - Run all existing Playwright tests
   - Ensure no regressions in widget creation
   - Ensure no regressions in global class creation

2. **Add New Tests**
   - Test CSS fetching from external URLs
   - Test CSS preprocessing edge cases
   - Test architectural boundaries (widget service doesn't process CSS)

---

## 📋 **Implementation Checklist (Registry Pattern Approach)** 🎯

### **Phase 0: Registry Infrastructure** (Day 1) - **NO BREAKING CHANGES**
- [ ] Create `Css_Processor_Interface`
- [ ] Create `Css_Processing_Context`
- [ ] Create `Css_Processor_Registry`
- [ ] Create `Css_Processor_Factory`
- [ ] Write unit tests for registry infrastructure
- [ ] Verify infrastructure works independently
- [ ] **Result**: New infrastructure exists, nothing uses it yet ✅

### **Phase 1: Extract CSS Fetching** (Day 1-2) - **INCREMENTAL**
- [ ] Create `Css_Fetcher_Processor` implementing `Css_Processor_Interface`
- [ ] Move CSS fetching logic from `Unified_Widget_Conversion_Service`
- [ ] Register processor with priority 10 (early execution)
- [ ] Write unit tests for CSS fetcher processor
- [ ] Run all existing tests - should still pass ✅
- [ ] Remove old CSS fetching code from widget service
- [ ] **Result**: CSS fetching extracted, tests pass ✅

### **Phase 2: Extract CSS Preprocessing** (Day 2) - **INCREMENTAL**
- [ ] Create `Css_Preprocessor_Processor` implementing `Css_Processor_Interface`
- [ ] Move CSS cleaning logic from `Unified_Widget_Conversion_Service`
- [ ] Register processor with priority 20
- [ ] Write unit tests for CSS preprocessor
- [ ] Run all existing tests - should still pass ✅
- [ ] Remove old CSS preprocessing code from widget service
- [ ] **Result**: CSS preprocessing extracted, tests pass ✅

### **Phase 3: Extract Media Query Filtering** (Day 2) - **INCREMENTAL**
- [ ] Create `Media_Query_Filter_Processor` implementing `Css_Processor_Interface`
- [ ] Move media query filtering logic
- [ ] Register processor with priority 25
- [ ] Write unit tests
- [ ] Run all existing tests - should still pass ✅
- [ ] Remove old code from widget service
- [ ] **Result**: Media query filtering extracted, tests pass ✅

### **Phase 4: Extract Calc Expression Processing** (Day 3) - **INCREMENTAL**
- [ ] Create `Calc_Expression_Processor` implementing `Css_Processor_Interface`
- [ ] Move calc() replacement logic
- [ ] Register processor with priority 30
- [ ] Write unit tests
- [ ] Run all existing tests - should still pass ✅
- [ ] Remove old code from widget service
- [ ] **Result**: Calc processing extracted, tests pass ✅

### **Phase 5: Extract CSS Value Fixing** (Day 3) - **INCREMENTAL**
- [ ] Create `Css_Value_Fixer_Processor` implementing `Css_Processor_Interface`
- [ ] Move CSS value fixing logic
- [ ] Register processor with priority 35
- [ ] Write unit tests
- [ ] Run all existing tests - should still pass ✅
- [ ] Remove old code from widget service
- [ ] **Result**: CSS value fixing extracted, tests pass ✅

### **Phase 6: Simplify Widget Service** (Day 4) - **CLEANUP**
- [ ] Verify all CSS processing code removed
- [ ] Remove CSS processing properties (`$css_parser`, `$css_output_optimizer`, `$property_converter`)
- [ ] Simplify `convert_from_html()` to use processor registry
- [ ] Simplify `create_widgets()` method
- [ ] Remove CSS statistics extraction
- [ ] Add `convert_from_url()` method
- [ ] Add `convert_from_css()` method
- [ ] Verify widget service <200 lines ✅
- [ ] Write unit tests for simplified service
- [ ] Run all existing tests - should still pass ✅

### **Phase 7: Update Widget Creator** (Day 4) - **SIMPLIFY**
- [ ] Update `create_widgets()` interface
- [ ] Remove style source extraction logic
- [ ] Work directly with `resolved_styles`
- [ ] Write unit tests for updated creator
- [ ] Run all existing tests - should still pass ✅
- [ ] Verify widget creation still works ✅

### **Phase 8: Consolidate Services** (Day 5) - **DEPRECATION**
- [ ] Deprecate `Widget_Conversion_Service`
- [ ] Update all references to use `Unified_Widget_Conversion_Service`
- [ ] Add deprecation notices
- [ ] Update documentation
- [ ] Run all integration tests ✅
- [ ] Run all Playwright tests ✅

### **Phase 9: Documentation & Cleanup** (Day 5) - **FINALIZE**
- [ ] Update architecture documentation
- [ ] Update API documentation
- [ ] Add migration guide
- [ ] Document registry pattern usage
- [ ] Add examples of creating custom processors
- [ ] Remove debug code
- [ ] Final code review
- [ ] Merge to main branch

---

## 🎯 **Key Advantages of Registry Approach**

### **1. Zero Breaking Changes**
Each phase maintains backward compatibility:
- Phase 0: Infrastructure added, nothing uses it
- Phases 1-5: Extract one processor at a time, tests pass after each
- Phase 6: Remove old code only after all processors extracted
- Phases 7-9: Final cleanup and consolidation

### **2. Incremental Testing**
After each processor extraction:
```bash
# Run tests after each phase
composer run test
npm run test:playwright

# All tests should pass ✅
```

### **3. Easy Rollback**
If any phase fails:
- Rollback is simple (one processor at a time)
- Can pause at any phase
- Can deploy partial implementation

### **4. Clear Progress Tracking**
```
Phase 0: ✅ Infrastructure ready
Phase 1: ✅ CSS fetching extracted (20% complete)
Phase 2: ✅ CSS preprocessing extracted (40% complete)
Phase 3: ✅ Media query filtering extracted (60% complete)
Phase 4: ✅ Calc processing extracted (80% complete)
Phase 5: ✅ CSS value fixing extracted (100% extraction complete)
Phase 6-9: Cleanup and consolidation
```

### **5. Future Extensibility**
Adding new processors is trivial:
```php
// Create new processor
class Custom_Css_Processor implements Css_Processor_Interface {
    public function get_processor_name(): string {
        return 'custom_processor';
    }
    
    public function get_priority(): int {
        return 50; // Execute after standard processors
    }
    
    public function process( Css_Processing_Context $context ): Css_Processing_Context {
        // Custom processing logic
        return $context;
    }
    
    public function supports_context( Css_Processing_Context $context ): bool {
        return true;
    }
    
    public function get_statistics_keys(): array {
        return [ 'custom_stat_1', 'custom_stat_2' ];
    }
}

// Register it
Css_Processor_Factory::register_processor( new Custom_Css_Processor() );

// Done! No other code changes needed
```

---

## 🚨 **Risk Assessment**

### **High Risk**
- **Breaking Changes**: Widget creator interface changes
  - **Mitigation**: Maintain backward compatibility layer for one release cycle

### **Medium Risk**
- **CSS Processing Bugs**: Moving CSS logic might introduce bugs
  - **Mitigation**: Comprehensive unit and integration tests
  
- **Performance Impact**: Additional service layers
  - **Mitigation**: Profile before/after, optimize if needed

### **Low Risk**
- **Service Consolidation**: Deprecating Widget_Conversion_Service
  - **Mitigation**: Deprecation wrapper maintains compatibility

---

## 📚 **Documentation Updates**

### **Architecture Documentation**
- Update `docs/README.md` with new architecture diagram
- Document new services and their responsibilities
- Document clean separation of concerns

### **API Documentation**
- Update `Unified_Widget_Conversion_Service` API docs
- Add migration guide from `Widget_Conversion_Service`
- Document new service interfaces

### **Developer Guide**
- Add guide on extending CSS preprocessing
- Add guide on adding new CSS fetching sources
- Add guide on widget service orchestration

---

## ✅ **Success Criteria**

### **Code Quality**
- [ ] Widget service has zero CSS processing code
- [ ] Widget service is under 200 lines
- [ ] Clear separation of concerns established
- [ ] No code duplication between services
- [ ] All linting passes

### **Functionality**
- [ ] All existing tests pass
- [ ] All new tests pass
- [ ] No regressions in widget creation
- [ ] No regressions in global class creation
- [ ] CSS statistics properly handled by CSS processor

### **Architecture**
- [ ] Widget service only orchestrates conversion
- [ ] CSS processor handles all CSS concerns
- [ ] Widget creator works with resolved data only
- [ ] Single widget conversion service
- [ ] Clean dependency graph

---

## 🎯 **Conclusion**

This refactoring establishes proper architectural boundaries by:

1. **Moving CSS processing out of widget service** - 465+ lines of CSS code moved to appropriate layers
2. **Eliminating statistics pass-through** - CSS processor returns complete statistics
3. **Simplifying widget creator interface** - Works directly with resolved styles
4. **Consolidating widget conversion services** - Single service following unified architecture
5. **Establishing clear separation of concerns** - Each service has a single, well-defined responsibility

The result is a cleaner, more maintainable architecture that follows SOLID principles and makes the codebase easier to understand, test, and extend.

