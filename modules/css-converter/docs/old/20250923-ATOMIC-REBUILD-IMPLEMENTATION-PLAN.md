# CSS Properties Atomic Rebuild - Implementation Plan

## 🎯 **Project Execution Plan**

**Based on**: CSS-PROPERTIES-ATOMIC-REBUILD-PRD.md  
**Start Date**: September 23, 2025  
**Target Completion**: October 28, 2025 (5 weeks)  
**Status**: Ready to Execute  

---

## 📋 **Phase 1: Foundation & Atomic Widget Integration**
**Timeline**: Week 1 (Sept 23-29, 2025)  
**Priority**: CRITICAL  

### **1.1 Directory Structure Setup**
```bash
# Create new atomic properties structure
mkdir -p services/atomic-widgets
mkdir -p convertors/atomic-properties/contracts
mkdir -p convertors/atomic-properties/prop-types
mkdir -p convertors/atomic-properties/implementations
mkdir -p tests/phpunit/atomic-widgets
```

### **1.2 Core Service Implementation**
#### **File**: `services/atomic-widgets/atomic-widget-service.php`
```php
<?php
namespace Elementor\Modules\CssConverter\Services\AtomicWidgets;

class Atomic_Widget_Service {
    private $prop_type_registry;
    private $widget_builder_factory;
    
    public function create_widget_with_props( string $widget_type, array $props ): ?array;
    public function validate_prop_structure( array $prop ): bool;
    public function get_supported_prop_types(): array;
    private function convert_to_atomic_prop( string $prop_name, $prop_value ): ?array;
}
```

#### **File**: `services/atomic-widgets/widget-json-generator.php`
```php
<?php
namespace Elementor\Modules\CssConverter\Services\AtomicWidgets;

use Elementor\Modules\AtomicWidgets\Elements\Widget_Builder;

class Widget_JSON_Generator {
    public function generate_widget_json( array $element_data ): ?array;
    public function generate_element_json( array $element_data ): ?array;
    private function apply_props_to_builder( $builder, array $props ): void;
}
```

### **1.3 Atomic Widget Module Research**
#### **Research Tasks**
- [ ] Catalog all prop types in `/plugins/elementor/modules/atomic-widgets/prop-types/`
- [ ] Document `Widget_Builder::make()` API
- [ ] Document `Element_Builder::make()` API
- [ ] Test basic widget creation with atomic widgets

#### **Documentation Output**
- `docs/ATOMIC-WIDGET-PROP-TYPES-CATALOG.md`
- `docs/WIDGET-BUILDER-API-REFERENCE.md`
- `docs/ELEMENT-BUILDER-API-REFERENCE.md`

### **1.4 Phase 1 Validation**
#### **Success Criteria**
- [ ] Atomic widget service can create basic widgets
- [ ] Widget JSON generator produces valid JSON
- [ ] Connection to atomic widgets module established
- [ ] All prop types cataloged and documented

---

## 📋 **Phase 2: Core Prop Type Mappers**
**Timeline**: Week 2 (Sept 30 - Oct 6, 2025)  
**Priority**: HIGH  

### **2.1 Essential Prop Type Mappers**

#### **Size Prop Type Mapper**
**File**: `convertors/atomic-properties/prop-types/size-prop-type-mapper.php`
**Properties**: `font-size`, `width`, `height`, `max-width`, `min-width`
```php
class Size_Prop_Type_Mapper implements Atomic_Prop_Mapper_Interface {
    public function map_css_to_atomic( string $css_value ): ?array {
        // Use actual Size_Prop_Type structure from atomic widgets
        return [
            '$$type' => 'size',
            'value' => [
                'size' => (float) $parsed_size,
                'unit' => $parsed_unit
            ]
        ];
    }
}
```

#### **Color Prop Type Mapper**
**File**: `convertors/atomic-properties/prop-types/color-prop-type-mapper.php`
**Properties**: `color`, `background-color`
```php
class Color_Prop_Type_Mapper implements Atomic_Prop_Mapper_Interface {
    public function map_css_to_atomic( string $css_value ): ?array {
        return [
            '$$type' => 'color',
            'value' => $this->normalize_color_value( $css_value )
        ];
    }
}
```

#### **Dimensions Prop Type Mapper**
**File**: `convertors/atomic-properties/prop-types/dimensions-prop-type-mapper.php`
**Properties**: `margin`, `padding` (shorthand)
```php
class Dimensions_Prop_Type_Mapper implements Atomic_Prop_Mapper_Interface {
    public function map_css_to_atomic( string $css_value ): ?array {
        return [
            '$$type' => 'dimensions',
            'value' => [
                'block-start' => ['$$type' => 'size', 'value' => $top],
                'inline-end' => ['$$type' => 'size', 'value' => $right],
                'block-end' => ['$$type' => 'size', 'value' => $bottom],
                'inline-start' => ['$$type' => 'size', 'value' => $left],
            ]
        ];
    }
}
```

#### **String Prop Type Mapper**
**File**: `convertors/atomic-properties/prop-types/string-prop-type-mapper.php`
**Properties**: `display`, `position`, `flex-direction`, `align-items`
```php
class String_Prop_Type_Mapper implements Atomic_Prop_Mapper_Interface {
    public function map_css_to_atomic( string $css_value ): ?array {
        return [
            '$$type' => 'string',
            'value' => $this->validate_string_value( $css_value )
        ];
    }
}
```

### **2.2 Testing Framework**
#### **File**: `tests/phpunit/atomic-widgets/CorePropTypeTest.php`
```php
class CorePropTypeTest extends TestCase {
    public function test_size_prop_type_creates_valid_atomic_json();
    public function test_color_prop_type_creates_valid_atomic_json();
    public function test_dimensions_prop_type_creates_valid_atomic_json();
    public function test_string_prop_type_creates_valid_atomic_json();
    
    private function validate_with_atomic_widgets( array $json ): bool;
}
```

### **2.3 Phase 2 Validation**
#### **Success Criteria**
- [ ] 4 core prop type mappers implemented
- [ ] All mappers create valid atomic widget JSON
- [ ] JSON passes atomic widget validation
- [ ] Properties render visually in Elementor editor

---

## 📋 **Phase 3: Complex Prop Types**
**Timeline**: Week 3 (Oct 7-13, 2025)  
**Priority**: HIGH  

### **3.1 Advanced Prop Type Mappers**

#### **Box Shadow Prop Type Mapper**
**File**: `convertors/atomic-properties/prop-types/box-shadow-prop-type-mapper.php`
```php
class Box_Shadow_Prop_Type_Mapper implements Atomic_Prop_Mapper_Interface {
    public function map_css_to_atomic( string $css_value ): ?array {
        return [
            '$$type' => 'box-shadow',
            'value' => [
                [
                    '$$type' => 'shadow',
                    'value' => [
                        'hOffset' => ['$$type' => 'size', 'value' => $h_offset],
                        'vOffset' => ['$$type' => 'size', 'value' => $v_offset],
                        'blur' => ['$$type' => 'size', 'value' => $blur],
                        'spread' => ['$$type' => 'size', 'value' => $spread],
                        'color' => ['$$type' => 'color', 'value' => $color],
                        'position' => $position // null or 'inset'
                    ]
                ]
            ]
        ];
    }
}
```

#### **Border Radius Prop Type Mapper**
**File**: `convertors/atomic-properties/prop-types/border-radius-prop-type-mapper.php`
```php
class Border_Radius_Prop_Type_Mapper implements Atomic_Prop_Mapper_Interface {
    public function map_css_to_atomic( string $css_value ): ?array {
        return [
            '$$type' => 'border-radius',
            'value' => [
                'start-start' => ['$$type' => 'size', 'value' => $top_left],
                'start-end' => ['$$type' => 'size', 'value' => $top_right],
                'end-end' => ['$$type' => 'size', 'value' => $bottom_right],
                'end-start' => ['$$type' => 'size', 'value' => $bottom_left],
            ]
        ];
    }
}
```

#### **Background Prop Type Mapper**
**File**: `convertors/atomic-properties/prop-types/background-prop-type-mapper.php`
```php
class Background_Prop_Type_Mapper implements Atomic_Prop_Mapper_Interface {
    public function map_css_to_atomic( string $css_value ): ?array {
        // Handle background shorthand and individual properties
        return [
            '$$type' => 'background',
            'value' => $this->parse_background_value( $css_value )
        ];
    }
}
```

#### **Text Shadow Prop Type Mapper**
**File**: `convertors/atomic-properties/prop-types/text-shadow-prop-type-mapper.php`
```php
class Text_Shadow_Prop_Type_Mapper implements Atomic_Prop_Mapper_Interface {
    public function map_css_to_atomic( string $css_value ): ?array {
        return [
            '$$type' => 'text-shadow',
            'value' => [
                '$$type' => 'shadow',
                'value' => [
                    'hOffset' => ['$$type' => 'size', 'value' => $h_offset],
                    'vOffset' => ['$$type' => 'size', 'value' => $v_offset],
                    'blur' => ['$$type' => 'size', 'value' => $blur],
                    'color' => ['$$type' => 'color', 'value' => $color],
                ]
            ]
        ];
    }
}
```

### **3.2 Integration Testing**
#### **File**: `tests/phpunit/atomic-widgets/ComplexPropTypeTest.php`
```php
class ComplexPropTypeTest extends TestCase {
    public function test_box_shadow_creates_valid_atomic_json();
    public function test_border_radius_creates_valid_atomic_json();
    public function test_background_creates_valid_atomic_json();
    public function test_text_shadow_creates_valid_atomic_json();
    
    public function test_complex_property_combinations();
    public function test_nested_prop_type_structures();
}
```

### **3.3 Phase 3 Validation**
#### **Success Criteria**
- [ ] 4 complex prop type mappers implemented
- [ ] All complex properties render visually
- [ ] Nested prop type structures work correctly
- [ ] Property combinations function properly

---

## 📋 **Phase 4: Complete Property Coverage**
**Timeline**: Week 4 (Oct 14-20, 2025)  
**Priority**: MEDIUM  

### **4.1 Remaining Property Mappers**

#### **Border Properties**
- `border-width-prop-type-mapper.php`
- `border-style-prop-type-mapper.php`
- `border-color-prop-type-mapper.php`
- `border-shorthand-prop-type-mapper.php`

#### **Typography Properties**
- `font-weight-prop-type-mapper.php`
- `line-height-prop-type-mapper.php`
- `text-align-prop-type-mapper.php`
- `text-decoration-prop-type-mapper.php`
- `text-transform-prop-type-mapper.php`

#### **Layout Properties**
- `gap-prop-type-mapper.php`
- `flex-prop-type-mapper.php`

#### **Effects Properties**
- `opacity-prop-type-mapper.php`
- `filter-prop-type-mapper.php`
- `transition-prop-type-mapper.php`

### **4.2 Quality Assurance**
#### **Comprehensive Testing**
- [ ] Test all 32+ properties individually
- [ ] Test property combinations
- [ ] Test edge cases and error conditions
- [ ] Performance optimization

#### **Error Handling**
- [ ] Invalid CSS value handling
- [ ] Unsupported property graceful degradation
- [ ] Atomic widget validation failures

### **4.3 Phase 4 Validation**
#### **Success Criteria**
- [ ] All 32+ properties supported
- [ ] Comprehensive test coverage
- [ ] Performance benchmarks met
- [ ] Error handling robust

---

## 📋 **Phase 5: Integration & Deployment**
**Timeline**: Week 5 (Oct 21-27, 2025)  
**Priority**: CRITICAL  

### **5.1 System Integration**

#### **Update REST API Endpoints**
- Modify `routes/widgets-route.php` to use new atomic widget service
- Update `routes/classes-route.php` for global classes
- Ensure backward compatibility where needed

#### **Update Widget Conversion Service**
- Integrate `Atomic_Widget_Service` into `Widget_Conversion_Service`
- Replace old property mappers with atomic prop type mappers
- Update HTML parser integration

#### **Update CSS Property Conversion Service**
- Replace `Class_Property_Mapper_Factory` with `Atomic_Prop_Mapper_Factory`
- Update property resolution logic
- Ensure proper error handling

### **5.2 Final Testing**

#### **End-to-End Testing**
```php
class EndToEndAtomicIntegrationTest extends TestCase {
    public function test_html_to_atomic_widget_conversion();
    public function test_css_to_atomic_props_conversion();
    public function test_visual_rendering_in_elementor();
    public function test_api_endpoint_responses();
}
```

#### **Performance Testing**
- [ ] Conversion time benchmarks
- [ ] Memory usage optimization
- [ ] Concurrent request handling

#### **Visual Rendering Verification**
- [ ] Test all properties in Elementor editor
- [ ] Verify frontend rendering matches editor
- [ ] Test responsive behavior

### **5.3 Documentation & Cleanup**

#### **Technical Documentation**
- API documentation for new services
- Property mapper development guide
- Troubleshooting guide

#### **Code Cleanup**
- Remove old CSS properties system references
- Clean up temporary files
- Update module initialization

### **5.4 Phase 5 Validation**
#### **Success Criteria**
- [ ] Complete system integration
- [ ] All API endpoints functional
- [ ] Visual rendering verified
- [ ] Performance benchmarks met
- [ ] Documentation complete

---

## 🧪 **Testing Strategy**

### **Unit Tests**
- Individual prop type mapper tests
- Atomic widget service tests
- Widget JSON generator tests

### **Integration Tests**
- Prop type combinations
- Widget builder integration
- API endpoint integration

### **Visual Tests**
- Elementor editor rendering
- Frontend display verification
- Responsive behavior testing

### **Performance Tests**
- Conversion speed benchmarks
- Memory usage monitoring
- Concurrent request handling

---

## 📊 **Success Metrics & Validation**

### **Technical Metrics**
- **100% Atomic Widget Integration**: All JSON created by atomic widgets ✅
- **100% Visual Rendering**: All properties render in Elementor editor ✅
- **100% Schema Compliance**: All JSON passes atomic widget validation ✅
- **32+ Property Support**: Complete CSS property coverage ✅

### **Quality Metrics**
- **Zero Fake JSON**: No pseudo-atomic structures ✅
- **Performance**: < 100ms conversion time per property ✅
- **Reliability**: 99.9% successful conversions ✅
- **Test Coverage**: > 95% code coverage ✅

### **Validation Checklist**
- [ ] All properties create valid atomic widget JSON
- [ ] All properties render visually in Elementor
- [ ] All JSON passes atomic widget schema validation
- [ ] API endpoints return proper responses
- [ ] Performance benchmarks met
- [ ] Error handling robust
- [ ] Documentation complete

---

## 🚀 **Execution Commands**

### **Phase 1 Start**
```bash
cd /Users/janvanvlastuin1981/Local\ Sites/elementor/app/public/wp-content/plugins/elementor-css/modules/css-converter

# Create directory structure
mkdir -p services/atomic-widgets
mkdir -p convertors/atomic-properties/{contracts,prop-types,implementations}
mkdir -p tests/phpunit/atomic-widgets

# Start Phase 1 implementation
echo "Phase 1: Foundation & Atomic Widget Integration - STARTED"
```

### **Progress Tracking**
```bash
# Check progress
find services/atomic-widgets -name "*.php" | wc -l
find convertors/atomic-properties -name "*.php" | wc -l
find tests/phpunit/atomic-widgets -name "*.php" | wc -l
```

---

## 📝 **Risk Mitigation**

### **Technical Risks**
- **Atomic Widget API Changes**: Use documented interfaces, create abstraction layer
- **Complex Prop Types**: Implement incrementally, test thoroughly
- **Performance Impact**: Monitor and optimize, use caching where appropriate

### **Project Risks**
- **Timeline Pressure**: Prioritize core functionality, defer nice-to-have features
- **Quality vs Speed**: Maintain testing standards, automate where possible
- **Integration Complexity**: Plan integration points early, test frequently

---

## 🎯 **Next Actions**

### **Immediate (Today)**
1. **✅ PRD & Plan Created**
2. **🔄 Start Phase 1**: Create directory structure
3. **🔄 Research Atomic Widgets**: Catalog prop types
4. **🔄 Implement Core Service**: `Atomic_Widget_Service`

### **This Week (Phase 1)**
- Complete atomic widget integration foundation
- Document all prop types
- Create widget JSON generator
- Establish testing framework

---

**Plan Version**: 1.0  
**Last Updated**: September 23, 2025  
**Next Review**: September 30, 2025  
**Estimated Completion**: October 28, 2025
