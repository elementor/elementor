# Phase 2: Property Mapper Architecture Design

## 🏗️ **ARCHITECTURAL REDESIGN FOR COMPLEX PROP TYPES**

Based on the comprehensive analysis of 50 atomic prop types, this document outlines the architectural redesign required to support complex prop types including Union, Array, Object structures, and advanced CSS features.

---

## **CURRENT ARCHITECTURE ANALYSIS**

### **✅ Current Strengths**
1. **Single Enhanced Property Mapper** - Centralized logic for basic properties
2. **Registry Pattern** - Clean property mapper registration and resolution
3. **Atomic Structure Generation** - Correct `$$type` wrapper creation
4. **Basic Parsing** - Color, size, string, number prop types working

### **❌ Critical Limitations**
1. **No Union Type Support** - Cannot handle properties with multiple value types
2. **No Array Type Support** - Cannot handle multiple shadows, transform functions
3. **No Complex Object Support** - Cannot handle nested prop type structures
4. **Hardcoded Switch Logic** - Cannot scale to 50+ prop types
5. **No Validation Framework** - No validation against atomic prop type schemas
6. **No Architectural Extensibility** - Cannot add new complex prop types

---

## **NEW ARCHITECTURE DESIGN**

### **Core Architectural Principles**

#### **1. Modular Prop Type System**
- **Dedicated Mapper Classes** for each complex prop type
- **Base Classes** for common functionality
- **Interface Contracts** for consistent behavior
- **Factory Pattern** for mapper instantiation

#### **2. Atomic Widget Integration**
- **Direct Integration** with atomic widget prop type definitions
- **Schema Validation** against actual prop type schemas
- **Type Safety** through proper prop type usage
- **Future Compatibility** with atomic widget evolution

#### **3. Clean Code Principles**
- **Single Responsibility** - One mapper per prop type
- **Self-Documenting Code** - No comments, descriptive method names
- **Small Functions** - Each method does one thing well
- **Defensive Programming** - Early returns, guard clauses

---

## **ARCHITECTURAL COMPONENTS**

### **1. Base Architecture**

#### **Abstract Base Classes**
```php
abstract class Atomic_Property_Mapper_Base {
    abstract public function supports_property( string $property ): bool;
    abstract public function map_to_v4_atomic( string $property, $value ): ?array;
    abstract public function get_atomic_prop_type(): string;
    
    protected function create_v4_property_with_type( string $property, string $type, $value ): array;
    protected function validate_atomic_structure( array $result ): bool;
    protected function parse_css_value( string $property, $value );
}

abstract class Plain_Property_Mapper_Base extends Atomic_Property_Mapper_Base {
    // For simple scalar values (string, number, boolean, color, size)
}

abstract class Object_Property_Mapper_Base extends Atomic_Property_Mapper_Base {
    // For complex object structures (dimensions, shadow, transform)
    abstract protected function define_object_shape(): array;
}

abstract class Array_Property_Mapper_Base extends Atomic_Property_Mapper_Base {
    // For array structures (box-shadow, transform-functions)
    abstract protected function define_item_type(): string;
    abstract protected function parse_array_items( $value ): array;
}

abstract class Union_Property_Mapper_Base extends Atomic_Property_Mapper_Base {
    // For properties that accept multiple types
    abstract protected function define_union_types(): array;
    protected function resolve_value_type( $value ): string;
}
```

#### **Interface Contracts**
```php
interface Atomic_Property_Mapper_Interface {
    public function supports_property( string $property ): bool;
    public function map_to_v4_atomic( string $property, $value ): ?array;
    public function map_to_schema( string $property, $value ): ?array;
    public function get_supported_properties(): array;
    public function get_atomic_prop_type(): string;
    public function validate_output( array $output ): bool;
}

interface CSS_Value_Parser_Interface {
    public function parse( $value );
    public function validate( $value ): bool;
    public function normalize( $value );
}

interface Atomic_Validator_Interface {
    public function validate_against_schema( string $prop_type, array $value ): bool;
    public function get_validation_errors(): array;
}
```

### **2. Prop Type Specific Mappers**

#### **Primitive Type Mappers**
```php
class String_Property_Mapper extends Plain_Property_Mapper_Base {
    public function get_atomic_prop_type(): string {
        return 'string';
    }
    
    public function supports_property( string $property ): bool {
        return in_array( $property, [
            'display', 'position', 'text-align', 'font-style'
        ], true );
    }
}

class Size_Property_Mapper extends Plain_Property_Mapper_Base {
    public function get_atomic_prop_type(): string {
        return 'size';
    }
    
    protected function parse_size_value( $value ): array {
        // Enhanced size parsing with unit validation
    }
}

class Color_Property_Mapper extends Plain_Property_Mapper_Base {
    public function get_atomic_prop_type(): string {
        return 'color';
    }
    
    protected function normalize_color_value( $value ): string {
        // Enhanced color parsing (hex, rgb, rgba, hsl, named)
    }
}
```

#### **Complex Object Type Mappers**
```php
class Dimensions_Property_Mapper extends Object_Property_Mapper_Base {
    public function get_atomic_prop_type(): string {
        return 'dimensions';
    }
    
    public function supports_property( string $property ): bool {
        return in_array( $property, [
            'margin', 'padding', 'margin-top', 'margin-right', 
            'margin-bottom', 'margin-left', 'padding-top', 
            'padding-right', 'padding-bottom', 'padding-left'
        ], true );
    }
    
    protected function define_object_shape(): array {
        return [
            'block-start' => 'size',
            'inline-end' => 'size', 
            'block-end' => 'size',
            'inline-start' => 'size'
        ];
    }
    
    protected function parse_shorthand_values( $value ): array {
        // Parse 1, 2, 3, 4 value syntax
        // Map to logical properties
    }
}

class Shadow_Property_Mapper extends Object_Property_Mapper_Base {
    public function get_atomic_prop_type(): string {
        return 'shadow';
    }
    
    protected function define_object_shape(): array {
        return [
            'hOffset' => 'size',
            'vOffset' => 'size',
            'blur' => 'size', 
            'spread' => 'size',
            'color' => 'color',
            'position' => 'string' // 'inset' or null
        ];
    }
    
    protected function parse_shadow_value( $value ): array {
        // Parse shadow syntax: "2px 2px 4px rgba(0,0,0,0.3)"
        // Handle inset shadows
    }
}

class Border_Radius_Property_Mapper extends Object_Property_Mapper_Base {
    public function get_atomic_prop_type(): string {
        return 'border-radius';
    }
    
    protected function define_object_shape(): array {
        return [
            'start-start' => 'size',
            'start-end' => 'size',
            'end-start' => 'size', 
            'end-end' => 'size'
        ];
    }
}
```

#### **Array Type Mappers**
```php
class Box_Shadow_Property_Mapper extends Array_Property_Mapper_Base {
    public function get_atomic_prop_type(): string {
        return 'box-shadow';
    }
    
    public function supports_property( string $property ): bool {
        return in_array( $property, [ 'box-shadow', 'text-shadow' ], true );
    }
    
    protected function define_item_type(): string {
        return 'shadow';
    }
    
    protected function parse_array_items( $value ): array {
        // Parse comma-separated shadows
        // "0 2px 4px rgba(0,0,0,0.1), inset 0 1px 2px rgba(0,0,0,0.2)"
    }
}

class Transform_Functions_Property_Mapper extends Array_Property_Mapper_Base {
    public function get_atomic_prop_type(): string {
        return 'transform-functions';
    }
    
    protected function define_item_type(): string {
        return 'union'; // Union of move, rotate, scale, skew
    }
    
    protected function parse_array_items( $value ): array {
        // Parse transform functions
        // "rotate(45deg) scale(1.2) translate(10px, 20px)"
    }
}
```

#### **Filter System Mappers**
```php
class Filter_Property_Mapper extends Array_Property_Mapper_Base {
    public function get_atomic_prop_type(): string {
        return 'filter';
    }
    
    protected function define_item_type(): string {
        return 'css-filter-func';
    }
    
    protected function parse_array_items( $value ): array {
        // Parse filter functions
        // "blur(5px) brightness(1.2) contrast(1.1)"
    }
}

class Blur_Property_Mapper extends Object_Property_Mapper_Base {
    public function get_atomic_prop_type(): string {
        return 'blur';
    }
    
    protected function define_object_shape(): array {
        return [ 'size' => 'size' ];
    }
}

class Drop_Shadow_Filter_Property_Mapper extends Object_Property_Mapper_Base {
    public function get_atomic_prop_type(): string {
        return 'drop-shadow';
    }
    
    protected function define_object_shape(): array {
        return [
            'xAxis' => 'size',
            'yAxis' => 'size', 
            'blur' => 'size',
            'color' => 'color'
        ];
    }
}
```

#### **Union Type Mappers**
```php
class Background_Size_Property_Mapper extends Union_Property_Mapper_Base {
    public function get_atomic_prop_type(): string {
        return 'union';
    }
    
    protected function define_union_types(): array {
        return [
            'string' => [ 'auto', 'cover', 'contain' ],
            'background-image-size-scale' => 'object'
        ];
    }
    
    protected function resolve_value_type( $value ): string {
        if ( in_array( $value, [ 'auto', 'cover', 'contain' ], true ) ) {
            return 'string';
        }
        return 'background-image-size-scale';
    }
}
```

### **3. Factory and Registry System**

#### **Enhanced Factory**
```php
class Atomic_Property_Mapper_Factory {
    private array $mapper_classes = [];
    private array $mapper_instances = [];
    
    public function __construct() {
        $this->register_core_mappers();
        $this->register_complex_mappers();
        $this->register_filter_mappers();
        $this->register_transform_mappers();
    }
    
    public function create_mapper( string $property ): ?Atomic_Property_Mapper_Interface {
        foreach ( $this->mapper_classes as $mapper_class ) {
            $instance = $this->get_mapper_instance( $mapper_class );
            if ( $instance->supports_property( $property ) ) {
                return $instance;
            }
        }
        return null;
    }
    
    private function register_core_mappers(): void {
        $this->mapper_classes = array_merge( $this->mapper_classes, [
            String_Property_Mapper::class,
            Size_Property_Mapper::class,
            Color_Property_Mapper::class,
            Dimensions_Property_Mapper::class,
            Shadow_Property_Mapper::class,
            Box_Shadow_Property_Mapper::class,
            Border_Radius_Property_Mapper::class,
            Border_Width_Property_Mapper::class,
        ]);
    }
    
    private function register_filter_mappers(): void {
        $this->mapper_classes = array_merge( $this->mapper_classes, [
            Filter_Property_Mapper::class,
            Backdrop_Filter_Property_Mapper::class,
            Blur_Property_Mapper::class,
            Drop_Shadow_Filter_Property_Mapper::class,
            Hue_Rotate_Property_Mapper::class,
            Intensity_Property_Mapper::class,
            Color_Tone_Property_Mapper::class,
        ]);
    }
}
```

#### **Enhanced Registry**
```php
class Atomic_Property_Mapper_Registry {
    private Atomic_Property_Mapper_Factory $factory;
    private array $cached_mappers = [];
    private array $property_support_cache = [];
    
    public function resolve_mapper( string $property ): ?Atomic_Property_Mapper_Interface {
        if ( isset( $this->cached_mappers[ $property ] ) ) {
            return $this->cached_mappers[ $property ];
        }
        
        $mapper = $this->factory->create_mapper( $property );
        if ( $mapper ) {
            $this->cached_mappers[ $property ] = $mapper;
        }
        
        return $mapper;
    }
    
    public function get_supported_properties(): array {
        if ( empty( $this->property_support_cache ) ) {
            $this->build_property_support_cache();
        }
        return array_keys( $this->property_support_cache );
    }
    
    private function build_property_support_cache(): void {
        // Build comprehensive property support cache
    }
}
```

### **4. Validation Framework**

#### **Atomic Structure Validator**
```php
class Atomic_Structure_Validator implements Atomic_Validator_Interface {
    private array $prop_type_schemas = [];
    private array $validation_errors = [];
    
    public function validate_against_schema( string $prop_type, array $value ): bool {
        $schema = $this->get_prop_type_schema( $prop_type );
        if ( ! $schema ) {
            return false;
        }
        
        return $this->validate_structure( $value, $schema );
    }
    
    private function get_prop_type_schema( string $prop_type ): ?array {
        // Load schema from atomic widget prop type definitions
        // Cache for performance
    }
    
    private function validate_structure( array $value, array $schema ): bool {
        // Validate $$type matches
        // Validate required fields present
        // Validate field types match schema
        // Validate nested structures recursively
    }
}
```

### **5. CSS Value Parsers**

#### **Specialized Parsers**
```php
class Shadow_Value_Parser implements CSS_Value_Parser_Interface {
    public function parse( $value ): array {
        // Parse shadow syntax with all variations
        // Handle multiple shadows
        // Handle inset shadows
        // Extract offset, blur, spread, color
    }
}

class Transform_Value_Parser implements CSS_Value_Parser_Interface {
    public function parse( $value ): array {
        // Parse transform functions
        // Handle 2D and 3D transforms
        // Extract function name and parameters
    }
}

class Filter_Value_Parser implements CSS_Value_Parser_Interface {
    public function parse( $value ): array {
        // Parse filter functions
        // Handle multiple filters
        // Extract function name and parameters
    }
}

class Gradient_Value_Parser implements CSS_Value_Parser_Interface {
    public function parse( $value ): array {
        // Parse linear and radial gradients
        // Extract angle, color stops, positions
        // Handle complex gradient syntax
    }
}
```

---

## **IMPLEMENTATION STRATEGY**

### **Phase 2A: Foundation (Week 1)**
1. **Create Base Classes** - Abstract base classes and interfaces
2. **Implement Factory** - Enhanced factory and registry system
3. **Add Validation Framework** - Atomic structure validation
4. **Create Core Parsers** - CSS value parsing utilities

### **Phase 2B: Critical Mappers (Week 2)**
1. **Fix Dimensions Mapper** - Correct spacing properties implementation
2. **Add Shadow Mappers** - Box shadow and individual shadow support
3. **Add Border Mappers** - Border radius and width support
4. **Test Foundation** - Comprehensive testing of new architecture

### **Phase 2C: Complex Systems (Week 3-4)**
1. **Filter System** - All 9 filter prop type mappers
2. **Transform System** - All 8 transform prop type mappers
3. **Background System** - Complex background overlay support
4. **Union Type Support** - Multi-type property handling

---

## **MIGRATION STRATEGY**

### **Backward Compatibility**
1. **Keep Enhanced Property Mapper** - As fallback for unsupported properties
2. **Gradual Migration** - Move properties to new mappers incrementally
3. **Feature Flags** - Enable new mappers selectively
4. **Comprehensive Testing** - Ensure no regressions

### **Migration Steps**
1. **Week 1**: New architecture alongside existing system
2. **Week 2**: Critical properties migrated (spacing, shadows, borders)
3. **Week 3**: Complex properties migrated (filters, transforms)
4. **Week 4**: Complete migration, remove Enhanced Property Mapper

---

## **TESTING STRATEGY**

### **Unit Testing**
- **Each Mapper Class** - Comprehensive test coverage
- **Parser Classes** - All CSS value variations
- **Validation Framework** - Schema compliance testing
- **Factory/Registry** - Mapper resolution and caching

### **Integration Testing**
- **Atomic Widget Compatibility** - Test against actual atomic widgets
- **Visual Rendering** - Verify styles render correctly in Elementor
- **Performance Testing** - Ensure conversion speed remains acceptable
- **Edge Case Testing** - Unusual CSS values and combinations

### **Validation Testing**
- **Schema Compliance** - All outputs match atomic prop type schemas
- **Type Safety** - Correct `$$type` values for all properties
- **Structure Validation** - Nested objects and arrays properly formed
- **Error Handling** - Graceful degradation for invalid inputs

---

## **PERFORMANCE CONSIDERATIONS**

### **Optimization Strategies**
1. **Mapper Caching** - Cache mapper instances for reuse
2. **Property Support Caching** - Cache property support lookups
3. **Schema Caching** - Cache atomic prop type schemas
4. **Lazy Loading** - Load mappers only when needed
5. **Parser Optimization** - Efficient regex and parsing algorithms

### **Memory Management**
1. **Singleton Registry** - Single registry instance
2. **Weak References** - Prevent memory leaks in caches
3. **Garbage Collection** - Clear caches when appropriate
4. **Resource Limits** - Prevent excessive memory usage

---

## **SUCCESS METRICS**

### **Architecture Quality**
- **Modularity**: Each prop type has dedicated mapper
- **Extensibility**: New prop types can be added easily
- **Maintainability**: Clean, self-documenting code
- **Testability**: 100% unit test coverage

### **Functional Quality**
- **Prop Type Coverage**: 50/50 prop types supported
- **Schema Compliance**: 100% atomic structure accuracy
- **CSS Support**: All common CSS properties supported
- **Visual Accuracy**: 99% rendering match

### **Performance Quality**
- **Conversion Speed**: <100ms for typical CSS files
- **Memory Usage**: <50MB for large documents
- **Cache Hit Rate**: >90% for mapper resolution
- **Error Rate**: <0.1% for valid CSS input

---

## **CONCLUSION**

This architectural redesign provides a solid foundation for supporting all 50 atomic prop types with:

1. **Modular Design** - Dedicated mappers for each prop type
2. **Clean Architecture** - Following SOLID principles and clean code practices
3. **Atomic Integration** - Direct integration with atomic widget prop types
4. **Extensibility** - Easy addition of new prop types
5. **Performance** - Optimized for speed and memory usage
6. **Quality** - Comprehensive testing and validation

The new architecture transforms the CSS Converter from a basic tool to a comprehensive, enterprise-grade solution capable of handling modern CSS with full fidelity to Elementor's atomic widget system.

**Next Steps**: Begin Phase 2A implementation with foundation classes and core infrastructure.
