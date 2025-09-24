# Phase 2: Detailed Implementation Plan

## 🚀 **STRATEGIC IMPLEMENTATION ROADMAP**

Based on the architectural design and priority matrix analysis, this document provides a detailed, week-by-week implementation plan for transforming the CSS Converter to support all 50 atomic prop types.

---

## **IMPLEMENTATION OVERVIEW**

### **Timeline**: 8 weeks total
### **Team Size**: 2-3 developers (1 senior, 1-2 mid-level)
### **Approach**: Incremental development with continuous testing
### **Risk Mitigation**: Parallel development with existing system

---

## **WEEK 1: FOUNDATION ARCHITECTURE**

### **Objectives**
- Establish new architectural foundation
- Create base classes and interfaces
- Implement factory and registry system
- Set up validation framework

### **Day 1: Base Classes and Interfaces**

#### **Morning (4 hours)**
```php
// Create: /convertors/css-properties/base/atomic-property-mapper-base.php
abstract class Atomic_Property_Mapper_Base {
    abstract public function supports_property( string $property ): bool;
    abstract public function map_to_v4_atomic( string $property, $value ): ?array;
    abstract public function get_atomic_prop_type(): string;
    
    protected function create_v4_property_with_type( string $property, string $type, $value ): array {
        return [
            'property' => $property,
            'value' => [
                '$$type' => $type,
                'value' => $value
            ]
        ];
    }
}

// Create: /convertors/css-properties/base/plain-property-mapper-base.php
abstract class Plain_Property_Mapper_Base extends Atomic_Property_Mapper_Base {
    protected function create_plain_value( $value ) {
        return $this->normalize_value( $value );
    }
    
    abstract protected function normalize_value( $value );
}

// Create: /convertors/css-properties/base/object-property-mapper-base.php
abstract class Object_Property_Mapper_Base extends Atomic_Property_Mapper_Base {
    abstract protected function define_object_shape(): array;
    abstract protected function parse_object_value( $value ): array;
}

// Create: /convertors/css-properties/base/array-property-mapper-base.php
abstract class Array_Property_Mapper_Base extends Atomic_Property_Mapper_Base {
    abstract protected function define_item_type(): string;
    abstract protected function parse_array_items( $value ): array;
}
```

#### **Afternoon (4 hours)**
```php
// Create: /convertors/css-properties/contracts/atomic-property-mapper-interface.php
interface Atomic_Property_Mapper_Interface {
    public function supports_property( string $property ): bool;
    public function map_to_v4_atomic( string $property, $value ): ?array;
    public function map_to_schema( string $property, $value ): ?array;
    public function get_supported_properties(): array;
    public function get_atomic_prop_type(): string;
}

// Create: /convertors/css-properties/contracts/css-value-parser-interface.php
interface CSS_Value_Parser_Interface {
    public function parse( $value );
    public function validate( $value ): bool;
    public function normalize( $value );
}

// Create: /convertors/css-properties/contracts/atomic-validator-interface.php
interface Atomic_Validator_Interface {
    public function validate_against_schema( string $prop_type, array $value ): bool;
    public function get_validation_errors(): array;
}
```

### **Day 2: Factory and Registry System**

#### **Morning (4 hours)**
```php
// Create: /convertors/css-properties/factory/atomic-property-mapper-factory.php
class Atomic_Property_Mapper_Factory {
    private array $mapper_classes = [];
    private array $mapper_instances = [];
    
    public function __construct() {
        $this->register_core_mappers();
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
    
    private function get_mapper_instance( string $mapper_class ): Atomic_Property_Mapper_Interface {
        if ( ! isset( $this->mapper_instances[ $mapper_class ] ) ) {
            $this->mapper_instances[ $mapper_class ] = new $mapper_class();
        }
        return $this->mapper_instances[ $mapper_class ];
    }
    
    private function register_core_mappers(): void {
        $this->mapper_classes = [
            String_Property_Mapper::class,
            Size_Property_Mapper::class,
            Color_Property_Mapper::class,
            Number_Property_Mapper::class,
            Boolean_Property_Mapper::class,
        ];
    }
    
    public function register_mapper( string $mapper_class ): void {
        if ( ! in_array( $mapper_class, $this->mapper_classes, true ) ) {
            $this->mapper_classes[] = $mapper_class;
        }
    }
}
```

#### **Afternoon (4 hours)**
```php
// Update: /convertors/css-properties/implementations/class_property_mapper_registry.php
class Enhanced_Property_Mapper_Registry {
    private Atomic_Property_Mapper_Factory $factory;
    private array $cached_mappers = [];
    private array $property_support_cache = [];
    private static ?self $instance = null;
    
    public function __construct() {
        $this->factory = new Atomic_Property_Mapper_Factory();
        $this->build_property_support_cache();
    }
    
    public static function get_instance(): self {
        if ( null === self::$instance ) {
            self::$instance = new self();
        }
        return self::$instance;
    }
    
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
        return array_keys( $this->property_support_cache );
    }
    
    private function build_property_support_cache(): void {
        // Build comprehensive property support cache
        $all_mappers = $this->factory->get_all_mapper_classes();
        foreach ( $all_mappers as $mapper_class ) {
            $instance = new $mapper_class();
            $supported = $instance->get_supported_properties();
            foreach ( $supported as $property ) {
                $this->property_support_cache[ $property ] = $mapper_class;
            }
        }
    }
}
```

### **Day 3: Validation Framework**

#### **Morning (4 hours)**
```php
// Create: /convertors/css-properties/validation/atomic-structure-validator.php
class Atomic_Structure_Validator implements Atomic_Validator_Interface {
    private array $prop_type_schemas = [];
    private array $validation_errors = [];
    
    public function validate_against_schema( string $prop_type, array $value ): bool {
        $this->validation_errors = [];
        
        if ( ! $this->has_required_type_field( $value ) ) {
            $this->validation_errors[] = "Missing required '$$type' field";
            return false;
        }
        
        if ( $value['$$type'] !== $prop_type ) {
            $this->validation_errors[] = "Type mismatch: expected '{$prop_type}', got '{$value['$$type']}'";
            return false;
        }
        
        if ( ! $this->has_required_value_field( $value ) ) {
            $this->validation_errors[] = "Missing required 'value' field";
            return false;
        }
        
        return $this->validate_value_structure( $prop_type, $value['value'] );
    }
    
    public function get_validation_errors(): array {
        return $this->validation_errors;
    }
    
    private function has_required_type_field( array $value ): bool {
        return isset( $value['$$type'] ) && is_string( $value['$$type'] );
    }
    
    private function has_required_value_field( array $value ): bool {
        return array_key_exists( 'value', $value );
    }
    
    private function validate_value_structure( string $prop_type, $value ): bool {
        switch ( $prop_type ) {
            case 'string':
                return is_string( $value );
            case 'number':
                return is_numeric( $value );
            case 'boolean':
                return is_bool( $value );
            case 'color':
                return is_string( $value ) && $this->is_valid_color( $value );
            case 'size':
                return $this->validate_size_structure( $value );
            case 'dimensions':
                return $this->validate_dimensions_structure( $value );
            default:
                return true; // Unknown types pass for now
        }
    }
    
    private function validate_size_structure( $value ): bool {
        if ( ! is_array( $value ) ) {
            $this->validation_errors[] = "Size value must be an array";
            return false;
        }
        
        if ( ! isset( $value['size'] ) || ! is_numeric( $value['size'] ) ) {
            $this->validation_errors[] = "Size must have numeric 'size' field";
            return false;
        }
        
        if ( ! isset( $value['unit'] ) || ! is_string( $value['unit'] ) ) {
            $this->validation_errors[] = "Size must have string 'unit' field";
            return false;
        }
        
        return true;
    }
    
    private function validate_dimensions_structure( $value ): bool {
        if ( ! is_array( $value ) ) {
            $this->validation_errors[] = "Dimensions value must be an array";
            return false;
        }
        
        $required_fields = [ 'block-start', 'inline-end', 'block-end', 'inline-start' ];
        foreach ( $required_fields as $field ) {
            if ( ! isset( $value[ $field ] ) ) {
                $this->validation_errors[] = "Dimensions missing required field: {$field}";
                return false;
            }
            
            if ( ! $this->validate_against_schema( 'size', $value[ $field ] ) ) {
                return false;
            }
        }
        
        return true;
    }
    
    private function is_valid_color( string $value ): bool {
        // Basic color validation
        return preg_match( '/^#[0-9a-fA-F]{3,6}$|^rgba?\(|^[a-zA-Z]+$/', $value );
    }
}
```

#### **Afternoon (4 hours)**
```php
// Create: /convertors/css-properties/parsers/css-value-parser-base.php
abstract class CSS_Value_Parser_Base implements CSS_Value_Parser_Interface {
    protected array $validation_errors = [];
    
    public function get_validation_errors(): array {
        return $this->validation_errors;
    }
    
    protected function add_validation_error( string $error ): void {
        $this->validation_errors[] = $error;
    }
    
    protected function clear_validation_errors(): void {
        $this->validation_errors = [];
    }
}

// Create: /convertors/css-properties/parsers/size-value-parser.php
class Size_Value_Parser extends CSS_Value_Parser_Base {
    private const VALID_UNITS = [
        'px', 'em', 'rem', '%', 'vh', 'vw', 'pt', 'pc', 
        'in', 'cm', 'mm', 'ex', 'ch', 'vmin', 'vmax'
    ];
    
    public function parse( $value ): array {
        $this->clear_validation_errors();
        $value = trim( (string) $value );
        
        if ( preg_match( '/^(-?\d*\.?\d+)(px|em|rem|%|vh|vw|pt|pc|in|cm|mm|ex|ch|vmin|vmax)?$/i', $value, $matches ) ) {
            $size = (float) $matches[1];
            $unit = strtolower( $matches[2] ?? 'px' );
            
            return [
                'size' => $size,
                'unit' => $unit
            ];
        }
        
        if ( in_array( strtolower( $value ), [ 'auto', 'inherit', 'initial', 'unset' ], true ) ) {
            return [
                'size' => 0.0,
                'unit' => 'px'
            ];
        }
        
        $this->add_validation_error( "Invalid size value: {$value}" );
        return [
            'size' => 0.0,
            'unit' => 'px'
        ];
    }
    
    public function validate( $value ): bool {
        $parsed = $this->parse( $value );
        return empty( $this->validation_errors );
    }
    
    public function normalize( $value ): string {
        $parsed = $this->parse( $value );
        return $parsed['size'] . $parsed['unit'];
    }
}
```

### **Day 4-5: Core Property Mappers**

#### **Day 4: Primitive Mappers**
```php
// Create: /convertors/css-properties/mappers/string-property-mapper.php
class String_Property_Mapper extends Plain_Property_Mapper_Base {
    private const SUPPORTED_PROPERTIES = [
        'display', 'position', 'text-align', 'font-style', 
        'text-decoration', 'text-transform', 'flex-direction',
        'align-items', 'justify-content', 'font-family'
    ];
    
    public function supports_property( string $property ): bool {
        return in_array( $property, self::SUPPORTED_PROPERTIES, true );
    }
    
    public function get_atomic_prop_type(): string {
        return 'string';
    }
    
    public function get_supported_properties(): array {
        return self::SUPPORTED_PROPERTIES;
    }
    
    public function map_to_v4_atomic( string $property, $value ): ?array {
        if ( ! $this->supports_property( $property ) ) {
            return null;
        }
        
        $normalized_value = $this->normalize_value( $value );
        return $this->create_v4_property_with_type( $property, 'string', $normalized_value );
    }
    
    public function map_to_schema( string $property, $value ): ?array {
        $atomic_result = $this->map_to_v4_atomic( $property, $value );
        if ( ! $atomic_result ) {
            return null;
        }
        
        return [ $property => $atomic_result['value'] ];
    }
    
    protected function normalize_value( $value ): string {
        return trim( (string) $value );
    }
}

// Create: /convertors/css-properties/mappers/size-property-mapper.php
class Size_Property_Mapper extends Plain_Property_Mapper_Base {
    private Size_Value_Parser $parser;
    
    private const SUPPORTED_PROPERTIES = [
        'font-size', 'width', 'height', 'max-width', 'min-width',
        'max-height', 'min-height', 'top', 'right', 'bottom', 'left',
        'line-height'
    ];
    
    public function __construct() {
        $this->parser = new Size_Value_Parser();
    }
    
    public function supports_property( string $property ): bool {
        return in_array( $property, self::SUPPORTED_PROPERTIES, true );
    }
    
    public function get_atomic_prop_type(): string {
        return 'size';
    }
    
    public function get_supported_properties(): array {
        return self::SUPPORTED_PROPERTIES;
    }
    
    public function map_to_v4_atomic( string $property, $value ): ?array {
        if ( ! $this->supports_property( $property ) ) {
            return null;
        }
        
        $parsed_value = $this->normalize_value( $value );
        return $this->create_v4_property_with_type( $property, 'size', $parsed_value );
    }
    
    public function map_to_schema( string $property, $value ): ?array {
        $atomic_result = $this->map_to_v4_atomic( $property, $value );
        if ( ! $atomic_result ) {
            return null;
        }
        
        return [ $property => $atomic_result['value'] ];
    }
    
    protected function normalize_value( $value ): array {
        return $this->parser->parse( $value );
    }
}

// Create: /convertors/css-properties/mappers/color-property-mapper.php
class Color_Property_Mapper extends Plain_Property_Mapper_Base {
    private const SUPPORTED_PROPERTIES = [
        'color', 'background-color', 'border-color', 'outline-color'
    ];
    
    private const NAMED_COLORS = [
        'red' => '#ff0000', 'blue' => '#0000ff', 'green' => '#008000',
        'black' => '#000000', 'white' => '#ffffff', 'transparent' => 'transparent'
    ];
    
    public function supports_property( string $property ): bool {
        return in_array( $property, self::SUPPORTED_PROPERTIES, true );
    }
    
    public function get_atomic_prop_type(): string {
        return 'color';
    }
    
    public function get_supported_properties(): array {
        return self::SUPPORTED_PROPERTIES;
    }
    
    public function map_to_v4_atomic( string $property, $value ): ?array {
        if ( ! $this->supports_property( $property ) ) {
            return null;
        }
        
        $normalized_value = $this->normalize_value( $value );
        return $this->create_v4_property_with_type( $property, 'color', $normalized_value );
    }
    
    public function map_to_schema( string $property, $value ): ?array {
        $atomic_result = $this->map_to_v4_atomic( $property, $value );
        if ( ! $atomic_result ) {
            return null;
        }
        
        return [ $property => $atomic_result['value'] ];
    }
    
    protected function normalize_value( $value ): string {
        $value = trim( (string) $value );
        
        if ( preg_match( '/^#[0-9a-fA-F]{3,6}$/', $value ) ) {
            return strtolower( $value );
        }
        
        if ( preg_match( '/^rgba?\(/', $value ) ) {
            return $value;
        }
        
        return self::NAMED_COLORS[ strtolower( $value ) ] ?? $value;
    }
}
```

#### **Day 5: Testing Foundation**
```php
// Create: /tests/phpunit/mappers/string-property-mapper-test.php
class String_Property_Mapper_Test extends WP_UnitTestCase {
    private String_Property_Mapper $mapper;
    
    public function setUp(): void {
        parent::setUp();
        $this->mapper = new String_Property_Mapper();
    }
    
    public function test_supports_display_property(): void {
        $this->assertTrue( $this->mapper->supports_property( 'display' ) );
    }
    
    public function test_does_not_support_unsupported_property(): void {
        $this->assertFalse( $this->mapper->supports_property( 'margin' ) );
    }
    
    public function test_maps_display_to_v4_atomic(): void {
        $result = $this->mapper->map_to_v4_atomic( 'display', 'flex' );
        
        $expected = [
            'property' => 'display',
            'value' => [
                '$$type' => 'string',
                'value' => 'flex'
            ]
        ];
        
        $this->assertEquals( $expected, $result );
    }
    
    public function test_returns_null_for_unsupported_property(): void {
        $result = $this->mapper->map_to_v4_atomic( 'margin', '10px' );
        $this->assertNull( $result );
    }
}
```

---

## **WEEK 2: CRITICAL PROPERTY FIXES**

### **Objectives**
- Fix critical spacing properties bug
- Implement shadow properties
- Add border properties
- Comprehensive testing

### **Day 1: Dimensions Property Mapper (CRITICAL FIX)**

#### **Morning (4 hours)**
```php
// Create: /convertors/css-properties/mappers/dimensions-property-mapper.php
class Dimensions_Property_Mapper extends Object_Property_Mapper_Base {
    private const SUPPORTED_PROPERTIES = [
        'margin', 'padding',
        'margin-top', 'margin-right', 'margin-bottom', 'margin-left',
        'padding-top', 'padding-right', 'padding-bottom', 'padding-left'
    ];
    
    private const LOGICAL_PROPERTY_MAP = [
        'margin-top' => 'block-start',
        'margin-right' => 'inline-end', 
        'margin-bottom' => 'block-end',
        'margin-left' => 'inline-start',
        'padding-top' => 'block-start',
        'padding-right' => 'inline-end',
        'padding-bottom' => 'block-end', 
        'padding-left' => 'inline-start'
    ];
    
    private Size_Value_Parser $size_parser;
    
    public function __construct() {
        $this->size_parser = new Size_Value_Parser();
    }
    
    public function supports_property( string $property ): bool {
        return in_array( $property, self::SUPPORTED_PROPERTIES, true );
    }
    
    public function get_atomic_prop_type(): string {
        return 'dimensions';
    }
    
    public function get_supported_properties(): array {
        return self::SUPPORTED_PROPERTIES;
    }
    
    public function map_to_v4_atomic( string $property, $value ): ?array {
        if ( ! $this->supports_property( $property ) ) {
            return null;
        }
        
        $dimensions_value = $this->parse_object_value( $property, $value );
        return $this->create_v4_property_with_type( $property, 'dimensions', $dimensions_value );
    }
    
    protected function define_object_shape(): array {
        return [
            'block-start' => 'size',
            'inline-end' => 'size',
            'block-end' => 'size', 
            'inline-start' => 'size'
        ];
    }
    
    protected function parse_object_value( string $property, $value ): array {
        if ( $this->is_shorthand_property( $property ) ) {
            return $this->parse_shorthand_value( $value );
        }
        
        return $this->parse_individual_property( $property, $value );
    }
    
    private function is_shorthand_property( string $property ): bool {
        return in_array( $property, [ 'margin', 'padding' ], true );
    }
    
    private function parse_shorthand_value( $value ): array {
        $value = trim( (string) $value );
        $parts = preg_split( '/\s+/', $value );
        
        switch ( count( $parts ) ) {
            case 1:
                // margin: 10px -> all sides
                $size = $this->create_size_value( $parts[0] );
                return [
                    'block-start' => $size,
                    'inline-end' => $size,
                    'block-end' => $size,
                    'inline-start' => $size
                ];
                
            case 2:
                // margin: 10px 20px -> vertical horizontal
                $vertical = $this->create_size_value( $parts[0] );
                $horizontal = $this->create_size_value( $parts[1] );
                return [
                    'block-start' => $vertical,
                    'inline-end' => $horizontal,
                    'block-end' => $vertical,
                    'inline-start' => $horizontal
                ];
                
            case 3:
                // margin: 10px 20px 15px -> top horizontal bottom
                $top = $this->create_size_value( $parts[0] );
                $horizontal = $this->create_size_value( $parts[1] );
                $bottom = $this->create_size_value( $parts[2] );
                return [
                    'block-start' => $top,
                    'inline-end' => $horizontal,
                    'block-end' => $bottom,
                    'inline-start' => $horizontal
                ];
                
            case 4:
                // margin: 10px 20px 15px 25px -> top right bottom left
                return [
                    'block-start' => $this->create_size_value( $parts[0] ),
                    'inline-end' => $this->create_size_value( $parts[1] ),
                    'block-end' => $this->create_size_value( $parts[2] ),
                    'inline-start' => $this->create_size_value( $parts[3] )
                ];
                
            default:
                // Invalid, return zero dimensions
                $zero_size = $this->create_size_value( '0px' );
                return [
                    'block-start' => $zero_size,
                    'inline-end' => $zero_size,
                    'block-end' => $zero_size,
                    'inline-start' => $zero_size
                ];
        }
    }
    
    private function parse_individual_property( string $property, $value ): array {
        $logical_side = self::LOGICAL_PROPERTY_MAP[ $property ] ?? null;
        if ( ! $logical_side ) {
            return [];
        }
        
        $size_value = $this->create_size_value( $value );
        $zero_size = $this->create_size_value( '0px' );
        
        return [
            'block-start' => $logical_side === 'block-start' ? $size_value : $zero_size,
            'inline-end' => $logical_side === 'inline-end' ? $size_value : $zero_size,
            'block-end' => $logical_side === 'block-end' ? $size_value : $zero_size,
            'inline-start' => $logical_side === 'inline-start' ? $size_value : $zero_size
        ];
    }
    
    private function create_size_value( $value ): array {
        $parsed = $this->size_parser->parse( $value );
        return [
            '$$type' => 'size',
            'value' => $parsed
        ];
    }
}
```

#### **Afternoon (4 hours)**
- Update Enhanced_Property_Mapper_Registry to register Dimensions_Property_Mapper
- Update Enhanced_Property_Mapper_Factory to include new mapper
- Create comprehensive tests for all shorthand variations
- Test individual property mappings

### **Day 2-3: Shadow Properties Implementation**

#### **Day 2: Shadow_Property_Mapper**
```php
// Create: /convertors/css-properties/parsers/shadow-value-parser.php
class Shadow_Value_Parser extends CSS_Value_Parser_Base {
    private Size_Value_Parser $size_parser;
    private Color_Property_Mapper $color_mapper;
    
    public function __construct() {
        $this->size_parser = new Size_Value_Parser();
        $this->color_mapper = new Color_Property_Mapper();
    }
    
    public function parse( $value ): array {
        $this->clear_validation_errors();
        $value = trim( (string) $value );
        
        // Handle multiple shadows separated by commas
        $shadows = $this->split_shadow_values( $value );
        $parsed_shadows = [];
        
        foreach ( $shadows as $shadow ) {
            $parsed_shadow = $this->parse_single_shadow( $shadow );
            if ( $parsed_shadow ) {
                $parsed_shadows[] = $parsed_shadow;
            }
        }
        
        return $parsed_shadows;
    }
    
    private function split_shadow_values( string $value ): array {
        // Split by comma, but be careful of rgba() values
        $shadows = [];
        $current_shadow = '';
        $paren_count = 0;
        
        for ( $i = 0; $i < strlen( $value ); $i++ ) {
            $char = $value[ $i ];
            
            if ( $char === '(' ) {
                $paren_count++;
            } elseif ( $char === ')' ) {
                $paren_count--;
            } elseif ( $char === ',' && $paren_count === 0 ) {
                $shadows[] = trim( $current_shadow );
                $current_shadow = '';
                continue;
            }
            
            $current_shadow .= $char;
        }
        
        if ( ! empty( $current_shadow ) ) {
            $shadows[] = trim( $current_shadow );
        }
        
        return $shadows;
    }
    
    private function parse_single_shadow( string $shadow ): ?array {
        $shadow = trim( $shadow );
        
        // Check for inset
        $is_inset = false;
        if ( strpos( $shadow, 'inset' ) === 0 ) {
            $is_inset = true;
            $shadow = trim( substr( $shadow, 5 ) );
        }
        
        // Parse shadow components: h-offset v-offset blur spread color
        // Regex to match shadow syntax
        $pattern = '/^(-?\d+(?:\.\d+)?(?:px|em|rem|%)?)\s+(-?\d+(?:\.\d+)?(?:px|em|rem|%)?)\s*(?:(-?\d+(?:\.\d+)?(?:px|em|rem|%)?)?\s*(?:(-?\d+(?:\.\d+)?(?:px|em|rem|%)?)?\s*)?)?(.+)?$/';
        
        if ( preg_match( $pattern, $shadow, $matches ) ) {
            $h_offset = $this->size_parser->parse( $matches[1] );
            $v_offset = $this->size_parser->parse( $matches[2] );
            $blur = isset( $matches[3] ) && $matches[3] !== '' ? 
                $this->size_parser->parse( $matches[3] ) : 
                [ 'size' => 0, 'unit' => 'px' ];
            $spread = isset( $matches[4] ) && $matches[4] !== '' ? 
                $this->size_parser->parse( $matches[4] ) : 
                [ 'size' => 0, 'unit' => 'px' ];
            $color = isset( $matches[5] ) && $matches[5] !== '' ? 
                trim( $matches[5] ) : 
                '#000000';
            
            return [
                'hOffset' => [ '$$type' => 'size', 'value' => $h_offset ],
                'vOffset' => [ '$$type' => 'size', 'value' => $v_offset ],
                'blur' => [ '$$type' => 'size', 'value' => $blur ],
                'spread' => [ '$$type' => 'size', 'value' => $spread ],
                'color' => [ '$$type' => 'color', 'value' => $this->color_mapper->normalize_value( $color ) ],
                'position' => $is_inset ? 'inset' : null
            ];
        }
        
        $this->add_validation_error( "Invalid shadow syntax: {$shadow}" );
        return null;
    }
    
    public function validate( $value ): bool {
        $parsed = $this->parse( $value );
        return empty( $this->validation_errors );
    }
    
    public function normalize( $value ): string {
        return trim( (string) $value );
    }
}

// Create: /convertors/css-properties/mappers/shadow-property-mapper.php
class Shadow_Property_Mapper extends Object_Property_Mapper_Base {
    private Shadow_Value_Parser $parser;
    
    public function __construct() {
        $this->parser = new Shadow_Value_Parser();
    }
    
    public function supports_property( string $property ): bool {
        // This mapper handles individual shadow objects, not the CSS properties directly
        return false;
    }
    
    public function get_atomic_prop_type(): string {
        return 'shadow';
    }
    
    public function get_supported_properties(): array {
        return [];
    }
    
    protected function define_object_shape(): array {
        return [
            'hOffset' => 'size',
            'vOffset' => 'size',
            'blur' => 'size',
            'spread' => 'size', 
            'color' => 'color',
            'position' => 'string'
        ];
    }
    
    protected function parse_object_value( $value ): array {
        // This is used internally by Box_Shadow_Property_Mapper
        return [];
    }
    
    public function create_shadow_from_parsed( array $parsed_shadow ): array {
        return [
            '$$type' => 'shadow',
            'value' => $parsed_shadow
        ];
    }
}
```

#### **Day 3: Box_Shadow_Property_Mapper**
```php
// Create: /convertors/css-properties/mappers/box-shadow-property-mapper.php
class Box_Shadow_Property_Mapper extends Array_Property_Mapper_Base {
    private const SUPPORTED_PROPERTIES = [ 'box-shadow', 'text-shadow' ];
    
    private Shadow_Value_Parser $parser;
    private Shadow_Property_Mapper $shadow_mapper;
    
    public function __construct() {
        $this->parser = new Shadow_Value_Parser();
        $this->shadow_mapper = new Shadow_Property_Mapper();
    }
    
    public function supports_property( string $property ): bool {
        return in_array( $property, self::SUPPORTED_PROPERTIES, true );
    }
    
    public function get_atomic_prop_type(): string {
        return 'box-shadow';
    }
    
    public function get_supported_properties(): array {
        return self::SUPPORTED_PROPERTIES;
    }
    
    public function map_to_v4_atomic( string $property, $value ): ?array {
        if ( ! $this->supports_property( $property ) ) {
            return null;
        }
        
        $shadow_array = $this->parse_array_items( $value );
        return $this->create_v4_property_with_type( $property, 'box-shadow', $shadow_array );
    }
    
    protected function define_item_type(): string {
        return 'shadow';
    }
    
    protected function parse_array_items( $value ): array {
        $parsed_shadows = $this->parser->parse( $value );
        $shadow_objects = [];
        
        foreach ( $parsed_shadows as $parsed_shadow ) {
            $shadow_objects[] = $this->shadow_mapper->create_shadow_from_parsed( $parsed_shadow );
        }
        
        return $shadow_objects;
    }
}
```

### **Day 4-5: Border Properties and Testing**

#### **Day 4: Border Property Mappers**
```php
// Create: /convertors/css-properties/mappers/border-radius-property-mapper.php
class Border_Radius_Property_Mapper extends Object_Property_Mapper_Base {
    private const SUPPORTED_PROPERTIES = [ 'border-radius' ];
    
    private Size_Value_Parser $size_parser;
    
    public function __construct() {
        $this->size_parser = new Size_Value_Parser();
    }
    
    public function supports_property( string $property ): bool {
        return in_array( $property, self::SUPPORTED_PROPERTIES, true );
    }
    
    public function get_atomic_prop_type(): string {
        return 'border-radius';
    }
    
    public function get_supported_properties(): array {
        return self::SUPPORTED_PROPERTIES;
    }
    
    protected function define_object_shape(): array {
        return [
            'start-start' => 'size',
            'start-end' => 'size',
            'end-start' => 'size',
            'end-end' => 'size'
        ];
    }
    
    protected function parse_object_value( $value ): array {
        $value = trim( (string) $value );
        $parts = preg_split( '/\s+/', $value );
        
        switch ( count( $parts ) ) {
            case 1:
                // border-radius: 10px -> all corners
                $size = $this->create_size_value( $parts[0] );
                return [
                    'start-start' => $size,
                    'start-end' => $size,
                    'end-start' => $size,
                    'end-end' => $size
                ];
                
            case 2:
                // border-radius: 10px 20px -> top-left/bottom-right top-right/bottom-left
                $first = $this->create_size_value( $parts[0] );
                $second = $this->create_size_value( $parts[1] );
                return [
                    'start-start' => $first,
                    'start-end' => $second,
                    'end-start' => $second,
                    'end-end' => $first
                ];
                
            case 3:
                // border-radius: 10px 20px 15px -> top-left top-right/bottom-left bottom-right
                $first = $this->create_size_value( $parts[0] );
                $second = $this->create_size_value( $parts[1] );
                $third = $this->create_size_value( $parts[2] );
                return [
                    'start-start' => $first,
                    'start-end' => $second,
                    'end-start' => $second,
                    'end-end' => $third
                ];
                
            case 4:
                // border-radius: 10px 20px 15px 25px -> top-left top-right bottom-right bottom-left
                return [
                    'start-start' => $this->create_size_value( $parts[0] ),
                    'start-end' => $this->create_size_value( $parts[1] ),
                    'end-end' => $this->create_size_value( $parts[2] ),
                    'end-start' => $this->create_size_value( $parts[3] )
                ];
                
            default:
                $zero_size = $this->create_size_value( '0px' );
                return [
                    'start-start' => $zero_size,
                    'start-end' => $zero_size,
                    'end-start' => $zero_size,
                    'end-end' => $zero_size
                ];
        }
    }
    
    private function create_size_value( $value ): array {
        $parsed = $this->size_parser->parse( $value );
        return [
            '$$type' => 'size',
            'value' => $parsed
        ];
    }
}
```

#### **Day 5: Comprehensive Testing**
- Create test suites for all new mappers
- Integration tests with Enhanced_Property_Mapper_Registry
- Visual tests in Elementor editor
- Performance benchmarking

---

## **SUCCESS METRICS FOR WEEK 2**

### **Functional Metrics**
- **Spacing Properties**: 100% correct Dimensions_Prop_Type usage
- **Shadow Properties**: Support for single and multiple shadows
- **Border Properties**: Complete border-radius shorthand support
- **Test Coverage**: 100% for all new mappers

### **Performance Metrics**
- **Conversion Speed**: <50ms for typical CSS with shadows
- **Memory Usage**: <25MB for complex CSS files
- **Cache Hit Rate**: >95% for mapper resolution

### **Quality Metrics**
- **Schema Compliance**: 100% atomic structure accuracy
- **Visual Accuracy**: 99% rendering match in Elementor
- **Error Handling**: Graceful degradation for invalid CSS

---

## **WEEKS 3-8: CONTINUATION PLAN**

### **Week 3-4: Filter System Implementation**
- All 9 filter prop type mappers
- Complex filter function parsing
- Backdrop filter support

### **Week 5-6: Transform System Implementation**
- All 8 transform prop type mappers
- 3D transform support
- Transform origin and perspective

### **Week 7-8: Advanced Features**
- Background overlay system
- Media and layout prop types
- Final testing and optimization

---

## **CONCLUSION**

This detailed implementation plan provides a systematic approach to implementing all 50 atomic prop types with:

1. **Week-by-week breakdown** with specific deliverables
2. **Code examples** for critical implementations
3. **Testing strategy** for quality assurance
4. **Performance targets** for optimization
5. **Success metrics** for validation

The plan ensures **incremental progress** with **continuous testing** and **backward compatibility** throughout the implementation process.

**Next Steps**: Begin Week 1 implementation with foundation architecture and base classes.
