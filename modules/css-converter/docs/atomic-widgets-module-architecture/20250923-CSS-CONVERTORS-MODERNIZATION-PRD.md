# CSS Convertors Modernization - Product Requirements Document

## 📋 **Executive Summary**

This PRD outlines the comprehensive modernization of the CSS Convertors system to align with the newly implemented Atomic Widgets V2 architecture. The current CSS property mappers in `@css-properties/` require significant updates to integrate with the new atomic widget approach and eliminate architectural inconsistencies.

---

## 🎯 **Problem Statement**

### **Current State Analysis**
- **32 CSS property mappers** exist in `@css-properties/properties/` folder
- **Legacy architecture** using old property mapping patterns
- **Inconsistent atomic widget integration** - mappers don't follow atomic widget reverse engineering principles
- **Outdated base classes** and interfaces not aligned with Atomic Widgets V2
- **No integration** with the new `Atomic_Widgets_Orchestrator` system
- **Missing validation** against real atomic widget schemas

### **Critical Issues Identified**
1. **Architectural Mismatch**: Current mappers don't follow the "Atomic Widgets Module creates JSON" principle
2. **Type Confusion**: Many mappers use generic `string` types instead of specific atomic types
3. **Missing Atomic Widget Research**: Mappers weren't derived from actual atomic widget prop types
4. **Inconsistent Base Methods**: Using `create_v4_property()` instead of `create_v4_property_with_type()`
5. **No Schema Validation**: No validation against actual atomic widget schemas
6. **Legacy Interfaces**: Using old interfaces not compatible with Atomic Widgets V2

---

## 🎯 **Objectives**

### **Primary Goals**
1. **Modernize all 32 CSS property mappers** to follow Atomic Widgets V2 principles
2. **Implement proper atomic widget reverse engineering** for each property
3. **Integrate with new orchestration system** seamlessly
4. **Ensure 100% compatibility** with real atomic widget schemas
5. **Establish comprehensive testing** for all property mappers
6. **Create migration path** from legacy to modern approach

### **Success Metrics**
- ✅ **100% of property mappers** follow atomic widget reverse engineering
- ✅ **Zero type confusion** - all mappers use correct atomic types
- ✅ **Complete schema validation** against real atomic widgets
- ✅ **Full integration** with Atomic Widgets V2 orchestrator
- ✅ **Comprehensive test coverage** (>95%) for all mappers
- ✅ **Performance improvement** of 30%+ in conversion speed

---

## 🏗️ **Technical Requirements**

### **1. Atomic Widget Reverse Engineering (MANDATORY)**

#### **For Each Property Mapper:**
- [ ] **Research actual atomic widget** that uses the property
- [ ] **Study the prop type implementation** in `/atomic-widgets/prop-types/`
- [ ] **Document expected `$$type` and `value` structure**
- [ ] **Implement exact atomic widget structure**
- [ ] **Validate against real atomic widget schema**

#### **Research Process Template:**
```php
/**
 * [Property Name] Property Mapper
 * 
 * ATOMIC WIDGET RESEARCH:
 * - Used by: [specific atomic widget file]
 * - Prop Type: [specific prop type class]
 * - Expected Structure: [exact $$type and value format]
 * - Validation Rules: [from prop type definition]
 * - Special Cases: [edge cases and constraints]
 */
```

### **2. Base Class Modernization**

#### **New Base Class Requirements:**
```php
abstract class Modern_Property_Mapper_Base {
    // MANDATORY: Use specific type methods
    protected function create_atomic_property_with_type( string $property, string $type, $value ): array;
    
    // MANDATORY: Validate against atomic widget schema
    protected function validate_against_atomic_schema( string $property, array $result ): bool;
    
    // MANDATORY: Support both v3 and v4 formats
    abstract public function map_to_v4_atomic( string $property, $value ): ?array;
    abstract public function map_to_schema( string $property, $value ): ?array;
    
    // MANDATORY: Atomic widget integration
    protected function get_atomic_widget_for_property( string $property ): ?string;
    protected function get_prop_type_for_property( string $property ): ?string;
}
```

### **3. Interface Standardization**

#### **Updated Interface Requirements:**
```php
interface Atomic_Property_Mapper_Interface {
    public function supports_property( string $property ): bool;
    public function map_to_v4_atomic( string $property, $value ): ?array;
    public function map_to_schema( string $property, $value ): ?array;
    public function validate_atomic_output( array $output ): bool;
    public function get_supported_atomic_widgets(): array;
    public function get_required_prop_types(): array;
}
```

### **4. Factory Pattern Modernization**

#### **Updated Factory Requirements:**
- **Integration with Atomic Widgets V2 orchestrator**
- **Dynamic mapper registration** based on atomic widget availability
- **Schema validation** for all created mappers
- **Performance optimization** with caching
- **Error handling** following clean code principles

---

## 📊 **Property Mapper Modernization Plan**

### **Phase 1: Core Layout Properties (Week 1)**
**Priority: HIGH** - Most commonly used properties

| Property | Current Status | Atomic Widget | Prop Type | Complexity |
|----------|---------------|---------------|-----------|------------|
| `align-items` | ❌ Legacy | `e-flexbox` | `String_Prop_Type` | Low |
| `flex-direction` | ❌ Legacy | `e-flexbox` | `String_Prop_Type` | Low |
| `gap` | ❌ Legacy | `e-flexbox` | `Size_Prop_Type` | Medium |
| `display` | ❌ Legacy | Multiple | `String_Prop_Type` | Medium |
| `position` | ❌ Legacy | Multiple | `String_Prop_Type` | Low |

### **Phase 2: Spacing & Sizing (Week 2)**
**Priority: HIGH** - Critical for layout

| Property | Current Status | Atomic Widget | Prop Type | Complexity |
|----------|---------------|---------------|-----------|------------|
| `margin` | ❌ Legacy | Multiple | `Dimensions_Prop_Type` | High |
| `padding` | ❌ Legacy | Multiple | `Dimensions_Prop_Type` | High |
| `font-size` | ❌ Legacy | `e-heading`, `e-paragraph` | `Size_Prop_Type` | Medium |
| `line-height` | ❌ Legacy | Text widgets | `Size_Prop_Type` | Medium |

### **Phase 3: Visual Properties (Week 3)**
**Priority: MEDIUM** - Styling and appearance

| Property | Current Status | Atomic Widget | Prop Type | Complexity |
|----------|---------------|---------------|-----------|------------|
| `color` | ❌ Legacy | Text widgets | `Color_Prop_Type` | Low |
| `background-color` | ❌ Legacy | Multiple | `Color_Prop_Type` | Low |
| `background` | ❌ Legacy | Multiple | `Background_Prop_Type` | High |
| `border-radius` | ❌ Legacy | Multiple | `Border_Radius_Prop_Type` | High |
| `box-shadow` | ❌ Legacy | Multiple | `Box_Shadow_Prop_Type` | High |

### **Phase 4: Advanced Properties (Week 4)**
**Priority: MEDIUM** - Complex styling

| Property | Current Status | Atomic Widget | Prop Type | Complexity |
|----------|---------------|---------------|-----------|------------|
| `border` | ❌ Legacy | Multiple | `Border_Prop_Type` | High |
| `transition` | ❌ Legacy | Multiple | `Transition_Prop_Type` | High |
| `filter` | ❌ Legacy | Multiple | `Filter_Prop_Type` | High |
| `opacity` | ❌ Legacy | Multiple | `Number_Prop_Type` | Low |

### **Phase 5: Text Properties (Week 5)**
**Priority: LOW** - Text-specific styling

| Property | Current Status | Atomic Widget | Prop Type | Complexity |
|----------|---------------|---------------|-----------|------------|
| `text-align` | ❌ Legacy | Text widgets | `String_Prop_Type` | Low |
| `text-decoration` | ❌ Legacy | Text widgets | `String_Prop_Type` | Low |
| `text-transform` | ❌ Legacy | Text widgets | `String_Prop_Type` | Low |
| `font-weight` | ❌ Legacy | Text widgets | `String_Prop_Type` | Low |

---

## 🧪 **Testing Strategy**

### **1. Comprehensive PHPUnit Test Suite**

#### **Test Structure:**
```
tests/phpunit/css-properties-v2/
├── PropertyMapperV2TestCase.php          # Base test class
├── AtomicWidgetIntegrationTest.php       # Real atomic widget tests
├── SchemaValidationTest.php              # Schema compliance tests
├── PerformanceTest.php                   # Performance benchmarks
├── EdgeCaseTest.php                      # Edge cases and error handling
└── properties/
    ├── AlignItemsPropertyMapperTest.php
    ├── FlexDirectionPropertyMapperTest.php
    ├── MarginPropertyMapperTest.php
    └── [... one test per mapper]
```

#### **Test Requirements for Each Mapper:**
- ✅ **Atomic widget integration test** - Real atomic widget validation
- ✅ **Schema compliance test** - Output matches atomic widget schema exactly
- ✅ **CSS variation test** - All CSS shorthand and longhand variations
- ✅ **Edge case test** - Invalid values, edge cases, error conditions
- ✅ **Performance test** - Conversion speed and memory usage
- ✅ **Type validation test** - Correct atomic types (not strings)

### **2. Automated Validation Pipeline**

#### **Pre-Commit Validation:**
```bash
# Atomic widget research validation
./scripts/validate-atomic-research.php

# Schema compliance check
./scripts/validate-schema-compliance.php

# Performance benchmark
./scripts/benchmark-property-mappers.php

# Type safety validation
./scripts/validate-atomic-types.php
```

---

## 🔧 **Implementation Guidelines**

### **1. Atomic Widget Research Protocol (MANDATORY)**

#### **For Each Property Mapper:**
```bash
# Step 1: Find atomic widget usage
grep -r "align-items" /plugins/elementor/modules/atomic-widgets/elements/

# Step 2: Identify prop type
grep -r "Align_Items_Prop_Type" /plugins/elementor/modules/atomic-widgets/

# Step 3: Study prop type implementation
cat /plugins/elementor/modules/atomic-widgets/prop-types/align-items-prop-type.php

# Step 4: Test with real atomic widget
php test-atomic-widget-integration.php align-items
```

### **2. Implementation Template**

#### **Modern Property Mapper Template:**
```php
<?php
namespace Elementor\Modules\CssConverter\Convertors\CssProperties\Properties;

use Elementor\Modules\CssConverter\Convertors\CssProperties\Implementations\Modern_Property_Mapper_Base;

/**
 * [Property Name] Property Mapper
 * 
 * ATOMIC WIDGET RESEARCH:
 * Based on: [atomic widget file] uses [prop type class]
 * Prop Type: /atomic-widgets/prop-types/[prop-type-file]
 * Expected: {"$$type": "[type]", "value": [structure]}
 * 
 * REQUIREMENTS:
 * - [List all requirements from prop type]
 * - [Include validation rules]
 * - [Note special cases]
 */
class [Property_Name]_Property_Mapper extends Modern_Property_Mapper_Base {
    
    private const SUPPORTED_PROPERTIES = ['property-name'];
    private const ATOMIC_WIDGET = 'e-widget-name';
    private const PROP_TYPE = 'Property_Prop_Type';
    
    public function supports_property( string $property ): bool {
        return in_array( $property, self::SUPPORTED_PROPERTIES, true );
    }
    
    public function map_to_v4_atomic( string $property, $value ): ?array {
        if ( ! $this->supports_property( $property ) ) {
            return null;
        }
        
        $parsed_value = $this->parse_css_value( $value );
        if ( null === $parsed_value ) {
            return null;
        }
        
        $atomic_value = $this->create_atomic_property_with_type( 
            $property, 
            'atomic-type', 
            $parsed_value 
        );
        
        return $this->validate_against_atomic_schema( $property, $atomic_value ) 
            ? $atomic_value 
            : null;
    }
    
    public function map_to_schema( string $property, $value ): ?array {
        // Legacy v3 support
        return $this->convert_v4_to_v3_schema( 
            $this->map_to_v4_atomic( $property, $value ) 
        );
    }
    
    private function parse_css_value( $value ): ?array {
        // Property-specific CSS parsing logic
        // Handle all CSS variations (shorthand, longhand, edge cases)
    }
}
```

### **3. Clean Code Requirements**

#### **Error Handling:**
- ✅ **No excessive try/catch** - Use defensive programming
- ✅ **Early returns** for invalid input
- ✅ **Guard clauses** for preconditions
- ✅ **Nullable return types** instead of exceptions
- ✅ **Meaningful error context** in logs

#### **Performance:**
- ✅ **Lazy loading** of atomic widget schemas
- ✅ **Caching** of expensive operations
- ✅ **Memory optimization** for large CSS files
- ✅ **Benchmarking** for all mappers

---

## 📈 **Migration Strategy**

### **1. Clean Slate Approach**
**Since this is a test project, we can implement a complete replacement strategy:**

#### **Backup Strategy:**
```bash
# Create backup folder for existing implementation
mkdir -p backup-schematic-approach/

# Backup existing CSS property mappers
mv convertors/css-properties/ backup-schematic-approach/css-properties/

# Backup related PHPUnit tests
mv tests/phpunit/css-properties/ backup-schematic-approach/tests-css-properties/

# Backup any related configuration files
mv convertors/css-properties-config/ backup-schematic-approach/css-properties-config/
```

#### **Fresh Implementation:**
- **No legacy support needed** - implement modern approach directly
- **Clean interfaces** - only implement new Atomic_Property_Mapper_Interface
- **Direct integration** - build for Atomic Widgets V2 from start
- **Simplified architecture** - no dual compatibility layers

#### **Files to Backup:**
```bash
# CSS Property Mappers (32 files)
backup-schematic-approach/css-properties/properties/
├── align-items-property-mapper.php
├── background-color-property-mapper.php
├── background-gradient-property-mapper.php
├── [... all 32 existing mappers]

# Base Classes and Interfaces
backup-schematic-approach/css-properties/implementations/
├── abstract-css-property-convertor.php
├── property-mapper-base.php
├── class-property-mapper-factory.php
└── class-property-mapper-registry.php

# Configuration Files
backup-schematic-approach/css-properties/
├── css-property-convertor-config.php
└── config/

# Related PHPUnit Tests
backup-schematic-approach/tests-css-properties/
└── [existing CSS property tests]
```

### **2. Simplified Deployment**

#### **Direct Implementation:**
- **No feature flags** - implement new system directly
- **No gradual rollout** - replace entire system at once
- **No backward compatibility** - focus on modern approach only
- **Clean codebase** - no legacy code maintenance

---

## 🚀 **Deployment Plan**

### **Week 1: Foundation**
- [ ] **Backup existing implementation** to `backup-schematic-approach/` folder
- [ ] **Create new base classes and interfaces** for modern mappers
- [ ] **Set up comprehensive test framework** aligned with Atomic Widgets V2
- [ ] **Implement atomic widget research tooling** for property analysis

### **Week 2-6: Property Mapper Implementation**
- [ ] **Week 2**: Phase 1 - Core layout properties
- [ ] **Week 3**: Phase 2 - Spacing & sizing properties
- [ ] **Week 4**: Phase 3 - Visual properties
- [ ] **Week 5**: Phase 4 - Advanced properties
- [ ] **Week 6**: Phase 5 - Text properties

### **Week 7: Integration & Testing**
- [ ] Full integration with Atomic Widgets V2 orchestrator
- [ ] Performance optimization and benchmarking
- [ ] Comprehensive testing and validation
- [ ] Documentation and examples

### **Week 8: Production Deployment**
- [ ] **Direct deployment** of new CSS convertors system
- [ ] **Performance monitoring** and optimization
- [ ] **Error tracking** and resolution
- [ ] **Documentation finalization**

---

## 📊 **Success Criteria**

### **Technical Metrics**
- ✅ **100% atomic widget compliance** - All mappers follow reverse engineering
- ✅ **Zero type confusion** - No generic string types where specific types expected
- ✅ **Complete schema validation** - All outputs validate against atomic widgets
- ✅ **Performance improvement** - 30%+ faster conversion
- ✅ **Test coverage >95%** - Comprehensive testing for all mappers

### **Quality Metrics**
- ✅ **Zero production errors** related to property mapping
- ✅ **Clean architecture** - No legacy code or compatibility layers
- ✅ **Clean code compliance** - No excessive try/catch, defensive programming
- ✅ **Documentation completeness** - All mappers fully documented
- ✅ **Developer experience** - Easy to add new property mappers

### **Business Metrics**
- ✅ **Faster development** - New property mappers easier to implement
- ✅ **Reduced bugs** - Atomic widget validation prevents errors
- ✅ **Future-proof architecture** - Automatic adaptation to atomic widget changes
- ✅ **Improved maintainability** - Clear patterns and consistent structure

---

## 🔍 **Risk Assessment**

### **High Risk Items**
1. **Complex Property Types** - Background, box-shadow, border properties
   - **Mitigation**: Extra research time, comprehensive testing
2. **Performance Impact** - Schema validation overhead
   - **Mitigation**: Caching, lazy loading, benchmarking
3. **Complete System Replacement** - No fallback to legacy system
   - **Mitigation**: Comprehensive testing, backup strategy, rollback plan


### **Medium Risk Items**
1. **Atomic Widget Changes** - Elementor updates affecting schemas
   - **Mitigation**: Version pinning, automated validation
2. **Developer Adoption** - Team learning new patterns
   - **Mitigation**: Training, documentation, examples

### **Low Risk Items**
1. **Simple Property Types** - Text alignment, colors
   - **Mitigation**: Start with these for quick wins

---

## 📚 **Documentation Requirements**

### **Developer Documentation**
- [ ] **Atomic Widget Research Guide** - How to research atomic widgets
- [ ] **Property Mapper Creation Guide** - Step-by-step implementation
- [ ] **Testing Guide** - How to test property mappers
- [ ] **Migration Guide** - How to migrate from legacy mappers

### **API Documentation**
- [ ] **Interface Documentation** - All public interfaces
- [ ] **Base Class Documentation** - Available methods and patterns
- [ ] **Factory Documentation** - How to register and use mappers
- [ ] **Configuration Documentation** - All configuration options

### **Examples and Tutorials**
- [ ] **Simple Property Mapper Example** - Basic implementation
- [ ] **Complex Property Mapper Example** - Advanced implementation
- [ ] **Testing Example** - How to write comprehensive tests
- [ ] **Integration Example** - How to integrate with orchestrator

---

## 🎯 **Next Steps**

### **Immediate Actions (This Week)**
1. **Approve this PRD** and confirm clean slate approach
2. **Execute backup strategy** - move existing files to `backup-schematic-approach/`
3. **Set up fresh development environment** with new folder structure
4. **Create modern base classes and interfaces** for atomic widget integration
5. **Implement atomic widget research tooling** for property analysis

### **Short Term (Next 2 Weeks)**
1. **Implement Phase 1 properties** (align-items, flex-direction, gap, display, position)
2. **Create comprehensive test framework**
3. **Validate integration with Atomic Widgets V2**
4. **Performance baseline establishment**

### **Medium Term (Next 6 Weeks)**
1. **Complete all property mapper modernization**
2. **Full integration testing**
3. **Performance optimization**
4. **Documentation completion**

### **Long Term (Next 8 Weeks)**
1. **Production deployment**
2. **Monitoring and optimization**
3. **Legacy mapper deprecation**
4. **Future property mapper additions**

---

## 📞 **Stakeholders & Responsibilities**

### **Development Team**
- **Lead Developer**: Overall architecture and complex mappers
- **Junior Developers**: Simple mappers and testing
- **QA Engineer**: Test framework and validation

### **Product Team**
- **Product Manager**: Requirements validation and prioritization
- **UX Designer**: User impact assessment

### **DevOps Team**
- **DevOps Engineer**: Deployment pipeline and monitoring

---

**This PRD provides a comprehensive roadmap for modernizing the CSS Convertors system to align with Atomic Widgets V2 architecture, ensuring future-proof, maintainable, and performant property mapping.**
