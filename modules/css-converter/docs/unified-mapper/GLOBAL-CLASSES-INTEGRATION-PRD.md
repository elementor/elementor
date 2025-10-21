# Global Classes Integration PRD

**Document Type**: Product Requirements Document  
**Version**: 1.0  
**Date**: October 21, 2025  
**Status**: 📋 **DRAFT**  
**Priority**: 🔴 **HIGH**  
**Related**: UNIFIED-PROCESS-DEVIATIONS-ANALYSIS.md (Deviation #3)

---

## 📋 **Executive Summary**

### **Problem Statement**
The CSS Converter is currently generating and storing global classes manually, bypassing Elementor's native Global Classes Module. This creates:
- Duplicate functionality
- Missed optimization opportunities (no caching, no minification)
- Manual CSS injection that violates separation of concerns
- Code that doesn't leverage Elementor's existing infrastructure

### **Proposed Solution**
Refactor CSS Converter to detect CSS class selectors and register them with Elementor's Global Classes Module, letting the native `Global_Classes_Repository` and `Atomic_Styles_Manager` handle storage, caching, and CSS injection.

### **Success Metrics**
- ✅ Zero manual global class storage in CSS Converter
- ✅ All global classes registered through `Global_Classes_Repository`
- ✅ All CSS injection handled by `Atomic_Styles_Manager`
- ✅ 100% test coverage for global class detection and registration
- ✅ No performance regression (ideally improvement due to caching)

---

## 🎯 **Goals and Objectives**

### **Primary Goals**
1. **Eliminate Duplicate Functionality**: Remove manual global class generation and storage
2. **Leverage Native Infrastructure**: Use Elementor's Global Classes Module for all global class handling
3. **Follow Separation of Concerns**: CSS Converter detects and converts, Elementor manages and renders
4. **Maintain Compatibility**: Ensure existing global classes continue working

### **Non-Goals**
- ❌ Modifying Elementor's Global Classes Module internals
- ❌ Changing global class data format (use existing atomic prop format)
- ❌ Building new global class UI (use existing Elementor UI)
- ❌ Supporting legacy global class formats

---

## 🔍 **Current Implementation Analysis**

### **Current Flow**
```
HTML/CSS Input
    ↓
CSS Converter detects .class selectors
    ↓
generate_global_classes_from_css_rules()
    ↓
Manual storage in custom data structure
    ↓
Manual CSS generation
    ↓
Manual injection via wp_add_inline_style
```

### **Current Code Location**
**File**: `unified-widget-conversion-service.php`  
**Lines**: 523-648

### **Current Implementation Problems**

#### **1. Manual Storage**
```php
$global_classes[ $class_name ] = [
    'selector' => $selector,
    'properties' => $converted_properties,
    'source' => 'css-class-rule',
];
```
**Problem**: Custom storage bypasses `Global_Classes_Repository`

#### **2. Manual CSS Generation**
```php
private function generate_global_classes_css( array $global_classes ): string {
    $css_rules = [];
    foreach ( $global_classes as $class_name => $class_data ) {
        $selector = $class_data['selector'] ?? '.' . $class_name;
        $properties = $class_data['properties'] ?? [];
        // Manual CSS generation...
    }
    return implode( "\n", $css_rules );
}
```
**Problem**: Duplicates `Atomic_Styles_Manager` functionality

#### **3. Manual CSS Injection**
```php
private function inject_global_classes_css( string $css ) {
    add_action( 'wp_head', function() use ( $css ) {
        echo '<style id="elementor-global-classes">' . $css . '</style>';
    }, 10 );
}
```
**Problem**: Bypasses Elementor's caching and optimization

---

## 🏗️ **Proposed Architecture**

### **New Flow**
```
HTML/CSS Input
    ↓
CSS Converter detects .class selectors
    ↓
Global_Classes_Integration_Service
    ↓
Convert CSS to atomic prop format
    ↓
Register with Global_Classes_Repository
    ↓
Atomic_Styles_Manager handles CSS injection
    (with caching, minification, optimization)
```

### **Separation of Concerns**

#### **CSS Converter Responsibilities** ✅
- Detect CSS class selectors (`.my-class`)
- Parse CSS properties
- Convert to atomic prop format
- Register with Global Classes Module

#### **Elementor Global Classes Module Responsibilities** ✅
- Store global classes in `Global_Classes_Repository`
- Generate CSS via `Atomic_Styles_Manager`
- Handle caching and invalidation
- Inject CSS to pages
- Manage global class UI

---

## 🔧 **Technical Requirements**

### **1. Global Classes Detection Service**

#### **Purpose**
Detect CSS class selectors from parsed CSS rules and prepare them for registration.

#### **Implementation**
```php
namespace ElementorCss\Modules\CssConverter\Services\GlobalClasses;

class Global_Classes_Detection_Service {
    
    const FLATTENED_CLASS_PREFIX = 'e-con-';
    const ELEMENTOR_CLASS_PREFIXES = [ 'e-con-', 'elementor-' ];
    
    public function detect_css_class_selectors( array $css_rules ): array {
        $detected_classes = [];
        
        foreach ( $css_rules as $rule ) {
            $selector = $rule['selector'] ?? '';
            
            if ( ! $this->is_valid_class_selector( $selector ) ) {
                continue;
            }
            
            if ( $this->should_skip_selector( $selector ) ) {
                continue;
            }
            
            $class_name = $this->extract_class_name( $selector );
            $detected_classes[ $class_name ] = [
                'selector' => $selector,
                'properties' => $rule['properties'] ?? [],
                'source' => 'css-converter',
            ];
        }
        
        return $detected_classes;
    }
    
    private function is_valid_class_selector( string $selector ): bool {
        return 0 === strpos( $selector, '.' ) && 
               ! empty( trim( $selector, '.' ) );
    }
    
    private function should_skip_selector( string $selector ): bool {
        foreach ( self::ELEMENTOR_CLASS_PREFIXES as $prefix ) {
            if ( 0 === strpos( ltrim( $selector, '.' ), $prefix ) ) {
                return true;
            }
        }
        return false;
    }
    
    private function extract_class_name( string $selector ): string {
        return ltrim( $selector, '.' );
    }
}
```

### **2. Global Classes Conversion Service**

#### **Purpose**
Convert detected CSS classes to atomic prop format required by Global Classes Module.

#### **Implementation**
```php
namespace ElementorCss\Modules\CssConverter\Services\GlobalClasses;

use ElementorCss\Modules\CssConverter\Services\Css\Processing\Unified_Css_Processor;

class Global_Classes_Conversion_Service {
    
    private Unified_Css_Processor $css_processor;
    
    public function __construct( Unified_Css_Processor $css_processor ) {
        $this->css_processor = $css_processor;
    }
    
    public function convert_to_atomic_props( array $detected_classes ): array {
        $converted_classes = [];
        
        foreach ( $detected_classes as $class_name => $class_data ) {
            $atomic_props = $this->convert_properties_to_atomic(
                $class_data['properties']
            );
            
            if ( empty( $atomic_props ) ) {
                continue;
            }
            
            $converted_classes[ $class_name ] = [
                'atomic_props' => $atomic_props,
                'source' => $class_data['source'],
            ];
        }
        
        return $converted_classes;
    }
    
    private function convert_properties_to_atomic( array $properties ): array {
        $atomic_props = [];
        
        foreach ( $properties as $property_data ) {
            $property = $property_data['property'] ?? '';
            $value = $property_data['value'] ?? '';
            
            if ( empty( $property ) || empty( $value ) ) {
                continue;
            }
            
            $converted = $this->css_processor->convert_property_if_needed(
                $property,
                $value
            );
            
            if ( $converted && isset( $converted['$$type'] ) ) {
                $atomic_props[ $property ] = $converted;
            }
        }
        
        return $atomic_props;
    }
}
```

### **3. Global Classes Registration Service**

#### **Purpose**
Register converted classes with Elementor's Global Classes Repository.

#### **Implementation**
```php
namespace ElementorCss\Modules\CssConverter\Services\GlobalClasses;

class Global_Classes_Registration_Service {
    
    const SOURCE_CSS_CONVERTER = 'css-converter';
    const LABEL_CSS_IMPORTED = 'CSS Imported';
    
    public function register_with_elementor( array $converted_classes ): array {
        if ( ! $this->is_global_classes_available() ) {
            return [
                'registered' => 0,
                'skipped' => count( $converted_classes ),
                'error' => 'Global Classes Module not available',
            ];
        }
        
        $registered = 0;
        $skipped = 0;
        
        foreach ( $converted_classes as $class_name => $class_data ) {
            $result = $this->register_single_class(
                $class_name,
                $class_data['atomic_props']
            );
            
            if ( $result ) {
                $registered++;
            } else {
                $skipped++;
            }
        }
        
        return [
            'registered' => $registered,
            'skipped' => $skipped,
        ];
    }
    
    private function register_single_class( 
        string $class_name, 
        array $atomic_props 
    ): bool {
        $repository = $this->get_global_classes_repository();
        
        if ( ! $repository ) {
            return false;
        }
        
        $class_config = $this->create_class_config(
            $class_name,
            $atomic_props
        );
        
        try {
            $repository->create( $class_config );
            return true;
        } catch ( \Exception $e ) {
            return false;
        }
    }
    
    private function create_class_config( 
        string $class_name, 
        array $atomic_props 
    ): array {
        return [
            'id' => $this->generate_class_id( $class_name ),
            'label' => $class_name,
            'type' => 'class',
            'variants' => [
                [
                    'meta' => [
                        'breakpoint' => 'desktop',
                        'state' => null,
                    ],
                    'props' => $atomic_props,
                ],
            ],
            'meta' => [
                'source' => self::SOURCE_CSS_CONVERTER,
                'imported_at' => time(),
            ],
        ];
    }
    
    private function generate_class_id( string $class_name ): string {
        return 'css-' . sanitize_key( $class_name );
    }
    
    private function is_global_classes_available(): bool {
        return defined( 'ELEMENTOR_VERSION' ) && 
               class_exists( '\Elementor\Core\Kits\Documents\Kit' );
    }
    
    private function get_global_classes_repository() {
        if ( ! defined( 'ELEMENTOR_VERSION' ) ) {
            return null;
        }
        
        $kit = \Elementor\Plugin::$instance->kits_manager->get_active_kit();
        
        if ( ! $kit ) {
            return null;
        }
        
        return $kit->get_global_classes_repository();
    }
}
```

### **4. Integration Service (Facade)**

#### **Purpose**
Provide simple interface for CSS Converter to use global classes integration.

#### **Implementation**
```php
namespace ElementorCss\Modules\CssConverter\Services\GlobalClasses;

class Global_Classes_Integration_Service {
    
    private Global_Classes_Detection_Service $detection_service;
    private Global_Classes_Conversion_Service $conversion_service;
    private Global_Classes_Registration_Service $registration_service;
    
    public function __construct(
        Global_Classes_Detection_Service $detection_service,
        Global_Classes_Conversion_Service $conversion_service,
        Global_Classes_Registration_Service $registration_service
    ) {
        $this->detection_service = $detection_service;
        $this->conversion_service = $conversion_service;
        $this->registration_service = $registration_service;
    }
    
    public function process_css_rules( array $css_rules ): array {
        $detected = $this->detection_service->detect_css_class_selectors( 
            $css_rules 
        );
        
        if ( empty( $detected ) ) {
            return [
                'detected' => 0,
                'converted' => 0,
                'registered' => 0,
            ];
        }
        
        $converted = $this->conversion_service->convert_to_atomic_props( 
            $detected 
        );
        
        if ( empty( $converted ) ) {
            return [
                'detected' => count( $detected ),
                'converted' => 0,
                'registered' => 0,
            ];
        }
        
        $result = $this->registration_service->register_with_elementor( 
            $converted 
        );
        
        return [
            'detected' => count( $detected ),
            'converted' => count( $converted ),
            'registered' => $result['registered'],
            'skipped' => $result['skipped'],
        ];
    }
}
```

---

## 🔄 **Migration Strategy**

### **Phase 1: Add New Services (No Breaking Changes)**
1. Create new service classes
2. Add dependency injection configuration
3. Add unit tests for each service
4. Verify services work independently

### **Phase 2: Integrate with Existing Code (Parallel Running)**
1. Call new services alongside existing code
2. Compare results in logs (detection differences)
3. Verify no regressions in existing functionality
4. Add integration tests

### **Phase 3: Switch to New Implementation**
1. Remove manual global class generation code
2. Remove manual CSS injection code
3. Keep only new service calls
4. Verify all tests pass

### **Phase 4: Cleanup**
1. Remove deprecated methods
2. Remove manual storage code
3. Update documentation
4. Remove debugging code

---

## 🧪 **Testing Requirements**

### **Unit Tests**

#### **Global_Classes_Detection_Service_Test**
```php
class Global_Classes_Detection_Service_Test extends WP_UnitTestCase {
    
    public function test_detects_valid_class_selectors() {
        $css_rules = [
            [
                'selector' => '.my-class',
                'properties' => [ [ 'property' => 'color', 'value' => 'red' ] ],
            ],
        ];
        
        $result = $this->service->detect_css_class_selectors( $css_rules );
        
        $this->assertArrayHasKey( 'my-class', $result );
    }
    
    public function test_skips_elementor_prefixed_classes() {
        $css_rules = [
            [
                'selector' => '.e-con-12345',
                'properties' => [ [ 'property' => 'color', 'value' => 'red' ] ],
            ],
        ];
        
        $result = $this->service->detect_css_class_selectors( $css_rules );
        
        $this->assertEmpty( $result );
    }
    
    public function test_skips_non_class_selectors() {
        $css_rules = [
            [ 'selector' => 'p', 'properties' => [] ],
            [ 'selector' => '#id', 'properties' => [] ],
            [ 'selector' => '[data-attr]', 'properties' => [] ],
        ];
        
        $result = $this->service->detect_css_class_selectors( $css_rules );
        
        $this->assertEmpty( $result );
    }
}
```

#### **Global_Classes_Conversion_Service_Test**
```php
class Global_Classes_Conversion_Service_Test extends WP_UnitTestCase {
    
    public function test_converts_css_properties_to_atomic_props() {
        $detected_classes = [
            'my-class' => [
                'properties' => [
                    [ 'property' => 'color', 'value' => '#ff0000' ],
                    [ 'property' => 'font-size', 'value' => '16px' ],
                ],
                'source' => 'css-converter',
            ],
        ];
        
        $result = $this->service->convert_to_atomic_props( $detected_classes );
        
        $this->assertArrayHasKey( 'my-class', $result );
        $this->assertArrayHasKey( 'atomic_props', $result['my-class'] );
        $this->assertArrayHasKey( 'color', $result['my-class']['atomic_props'] );
    }
    
    public function test_skips_classes_with_no_convertible_properties() {
        $detected_classes = [
            'my-class' => [
                'properties' => [
                    [ 'property' => 'unknown-prop', 'value' => 'value' ],
                ],
                'source' => 'css-converter',
            ],
        ];
        
        $result = $this->service->convert_to_atomic_props( $detected_classes );
        
        $this->assertArrayNotHasKey( 'my-class', $result );
    }
}
```

#### **Global_Classes_Registration_Service_Test**
```php
class Global_Classes_Registration_Service_Test extends WP_UnitTestCase {
    
    public function test_registers_classes_with_elementor() {
        $converted_classes = [
            'my-class' => [
                'atomic_props' => [
                    'color' => [ '$$type' => 'color', 'value' => '#ff0000' ],
                ],
                'source' => 'css-converter',
            ],
        ];
        
        $result = $this->service->register_with_elementor( $converted_classes );
        
        $this->assertEquals( 1, $result['registered'] );
        $this->assertEquals( 0, $result['skipped'] );
    }
    
    public function test_handles_elementor_not_available() {
        $converted_classes = [
            'my-class' => [
                'atomic_props' => [ 'color' => [ '$$type' => 'color' ] ],
            ],
        ];
        
        $result = $this->service->register_with_elementor( $converted_classes );
        
        $this->assertEquals( 0, $result['registered'] );
        $this->assertArrayHasKey( 'error', $result );
    }
}
```

### **Integration Tests**

```php
class Global_Classes_Integration_Test extends WP_UnitTestCase {
    
    public function test_full_integration_flow() {
        $css_rules = [
            [
                'selector' => '.custom-button',
                'properties' => [
                    [ 'property' => 'background-color', 'value' => '#007bff' ],
                    [ 'property' => 'color', 'value' => '#ffffff' ],
                    [ 'property' => 'padding', 'value' => '10px 20px' ],
                ],
            ],
        ];
        
        $result = $this->integration_service->process_css_rules( $css_rules );
        
        $this->assertEquals( 1, $result['detected'] );
        $this->assertEquals( 1, $result['converted'] );
        $this->assertEquals( 1, $result['registered'] );
        
        $kit = \Elementor\Plugin::$instance->kits_manager->get_active_kit();
        $repository = $kit->get_global_classes_repository();
        $class_config = $repository->get( 'css-custom-button' );
        
        $this->assertNotNull( $class_config );
        $this->assertEquals( 'custom-button', $class_config['label'] );
    }
}
```

### **Playwright E2E Tests**

```typescript
test('global classes from CSS are registered and applied', async ({ page }) => {
    const html = `
        <div class="custom-container">
            <p class="custom-text">Hello World</p>
        </div>
    `;
    
    const css = `
        .custom-container {
            background-color: #f0f0f0;
            padding: 20px;
        }
        .custom-text {
            color: #333333;
            font-size: 18px;
        }
    `;
    
    await page.goto('/wp-admin/post-new.php?post_type=page');
    await page.click('[data-testid="convert-html-button"]');
    await page.fill('[data-testid="html-input"]', html);
    await page.fill('[data-testid="css-input"]', css);
    await page.click('[data-testid="convert-button"]');
    
    await page.waitForSelector('.custom-container');
    
    const containerBg = await page.evaluate(() => {
        const el = document.querySelector('.custom-container');
        return getComputedStyle(el).backgroundColor;
    });
    
    expect(containerBg).toBe('rgb(240, 240, 240)');
    
    const textColor = await page.evaluate(() => {
        const el = document.querySelector('.custom-text');
        return getComputedStyle(el).color;
    });
    
    expect(textColor).toBe('rgb(51, 51, 51)');
});
```

---

## 📊 **Success Criteria**

### **Functional Requirements** ✅
- [ ] CSS Converter detects all valid CSS class selectors
- [ ] Elementor-prefixed classes are correctly skipped
- [ ] CSS properties are converted to atomic prop format
- [ ] Classes are registered with Global_Classes_Repository
- [ ] Atomic_Styles_Manager injects CSS automatically
- [ ] Global classes work with breakpoints
- [ ] Global classes work with states (hover, etc.)

### **Non-Functional Requirements** ✅
- [ ] No manual global class storage code remains
- [ ] No manual CSS generation code remains
- [ ] No manual CSS injection code remains
- [ ] Performance is maintained or improved
- [ ] 100% test coverage for new services
- [ ] All existing tests pass
- [ ] Documentation is updated

### **Code Quality** ✅
- [ ] No debugging code (error_log) in new services
- [ ] Follows WordPress coding standards
- [ ] Follows project coding standards (snake_case, Yoda conditions)
- [ ] No magic numbers
- [ ] Self-documenting code (no comments needed)
- [ ] Proper dependency injection

---

## 🚧 **Implementation Plan**

### **Week 1: Foundation**
- [ ] Create service class structure
- [ ] Add dependency injection configuration
- [ ] Write unit tests for detection service
- [ ] Implement detection service

### **Week 2: Conversion**
- [ ] Write unit tests for conversion service
- [ ] Implement conversion service
- [ ] Test integration with Unified_Css_Processor

### **Week 3: Registration**
- [ ] Research Elementor Global Classes Module API
- [ ] Write unit tests for registration service
- [ ] Implement registration service
- [ ] Test with live Elementor instance

### **Week 4: Integration**
- [ ] Create integration service (facade)
- [ ] Write integration tests
- [ ] Test parallel running with existing code
- [ ] Compare results and fix discrepancies

### **Week 5: Migration**
- [ ] Switch to new implementation
- [ ] Remove old code
- [ ] Run full test suite
- [ ] Fix any regressions

### **Week 6: Cleanup & Documentation**
- [ ] Remove deprecated methods
- [ ] Clean up debugging code
- [ ] Update documentation
- [ ] Write migration guide

---

## 📚 **Documentation Requirements**

### **Technical Documentation**
1. **Architecture Decision Record (ADR)**
   - Why we're using Global Classes Module
   - Trade-offs and alternatives considered

2. **API Documentation**
   - Each service's public methods
   - Parameters and return types
   - Usage examples

3. **Integration Guide**
   - How to use Global_Classes_Integration_Service
   - Configuration options
   - Troubleshooting

### **Migration Guide**
1. **For Developers**
   - What's changing
   - How to update custom code
   - Deprecated methods list

2. **For Users**
   - What will happen to existing global classes
   - Any UI changes
   - Expected behavior changes

---

## 🔍 **Risk Assessment**

### **Technical Risks**

| Risk | Severity | Mitigation |
|------|----------|-----------|
| Elementor Global Classes API changes | 🟡 MEDIUM | Version compatibility checks, fallback handling |
| Performance degradation | 🟢 LOW | Leverage Elementor's caching, benchmark before/after |
| Data loss during migration | 🔴 HIGH | Parallel running phase, backup strategy |
| Breaking existing integrations | 🟡 MEDIUM | Deprecation warnings, migration period |

### **Business Risks**

| Risk | Severity | Mitigation |
|------|----------|-----------|
| User confusion about changes | 🟢 LOW | Clear communication, documentation |
| Development timeline overrun | 🟡 MEDIUM | Phased approach, clear milestones |
| Regression in production | 🔴 HIGH | Comprehensive testing, staged rollout |

---

## 📝 **Open Questions**

### **✅ RESOLVED** (See GLOBAL-CLASSES-API-ANALYSIS.md)

1. **Elementor Global Classes Module API**
   - ✅ Does Global_Classes_Repository support bulk creation? **YES - All operations are bulk**
   - ✅ How does it handle duplicate class names? **Automatic with DUP_ prefix**
   - ✅ What's the caching strategy? **Multi-layer with auto invalidation**

2. **Migration Strategy**
   - ✅ Do we need to migrate existing global classes? **NO - New detection only**
   - ✅ Can old and new systems run in parallel? **YES - Phase 2 parallel running**
   - ✅ What's the rollback plan? **Feature flag + keep old code until phase 4**

3. **Performance**
   - ✅ What's the performance impact of registration? **Minimal (~1-2ms cached)**
   - ✅ Should we batch register classes? **YES - Already batched by design**
   - ✅ Do we need additional caching? **NO - Elementor's is sufficient**

---

## ✅ **Approval Checklist**

- [x] Technical approach reviewed by architecture team
- [x] API research completed for Elementor Global Classes Module
- [x] Performance benchmarking plan approved
- [ ] Testing strategy approved
- [ ] Migration plan approved
- [ ] Documentation requirements approved
- [ ] Timeline approved by stakeholders

---

**Document Status**: 📋 **READY FOR IMPLEMENTATION**  
**Next Step**: Begin Phase 1 - Create service class structure  
**API Research**: Complete (see GLOBAL-CLASSES-API-ANALYSIS.md)  
**Assigned To**: TBD  
**Target Completion**: 6 weeks from approval


