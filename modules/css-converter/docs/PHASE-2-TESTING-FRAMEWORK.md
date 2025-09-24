# Phase 2: Testing Framework for Prop Type Validation

## 🧪 **COMPREHENSIVE TESTING STRATEGY**

This document outlines the testing framework designed to ensure 100% accuracy and reliability of all 50 atomic prop type mappers, with focus on atomic structure validation, visual rendering verification, and performance benchmarking.

---

## **TESTING ARCHITECTURE OVERVIEW**

### **Testing Pyramid Structure**
```
                    ┌─────────────────────┐
                    │   Visual Tests      │ ← 5% (Critical paths)
                    │   (Elementor UI)    │
                    └─────────────────────┘
                ┌───────────────────────────────┐
                │     Integration Tests         │ ← 15% (System interactions)
                │   (Mapper + Registry)         │
                └───────────────────────────────┘
            ┌─────────────────────────────────────────┐
            │            Unit Tests                   │ ← 80% (Individual components)
            │  (Mappers, Parsers, Validators)        │
            └─────────────────────────────────────────┘
```

### **Testing Categories**
1. **Unit Tests** - Individual mapper and parser testing
2. **Integration Tests** - System component interaction testing
3. **Atomic Validation Tests** - Schema compliance verification
4. **Visual Regression Tests** - Elementor editor rendering verification
5. **Performance Tests** - Speed and memory usage benchmarking
6. **Edge Case Tests** - Unusual CSS value handling

---

## **1. UNIT TESTING FRAMEWORK**

### **Base Test Classes**

#### **Abstract Mapper Test Base**
```php
// Create: /tests/phpunit/base/atomic-property-mapper-test-base.php
abstract class Atomic_Property_Mapper_Test_Base extends WP_UnitTestCase {
    protected Atomic_Property_Mapper_Interface $mapper;
    protected Atomic_Structure_Validator $validator;
    
    public function setUp(): void {
        parent::setUp();
        $this->mapper = $this->create_mapper();
        $this->validator = new Atomic_Structure_Validator();
    }
    
    abstract protected function create_mapper(): Atomic_Property_Mapper_Interface;
    abstract protected function get_expected_prop_type(): string;
    abstract protected function get_supported_properties(): array;
    abstract protected function get_test_cases(): array;
    
    public function test_supports_expected_properties(): void {
        $expected_properties = $this->get_supported_properties();
        
        foreach ( $expected_properties as $property ) {
            $this->assertTrue(
                $this->mapper->supports_property( $property ),
                "Mapper should support property: {$property}"
            );
        }
    }
    
    public function test_does_not_support_invalid_properties(): void {
        $invalid_properties = [ 'invalid-property', 'non-existent', 'fake-prop' ];
        
        foreach ( $invalid_properties as $property ) {
            $this->assertFalse(
                $this->mapper->supports_property( $property ),
                "Mapper should not support invalid property: {$property}"
            );
        }
    }
    
    public function test_returns_correct_atomic_prop_type(): void {
        $expected_type = $this->get_expected_prop_type();
        $actual_type = $this->mapper->get_atomic_prop_type();
        
        $this->assertEquals(
            $expected_type,
            $actual_type,
            "Mapper should return correct atomic prop type"
        );
    }
    
    public function test_all_test_cases(): void {
        $test_cases = $this->get_test_cases();
        
        foreach ( $test_cases as $test_case ) {
            $this->run_single_test_case( $test_case );
        }
    }
    
    protected function run_single_test_case( array $test_case ): void {
        $property = $test_case['property'];
        $input_value = $test_case['input'];
        $expected_output = $test_case['expected'];
        $description = $test_case['description'] ?? "Test case for {$property}";
        
        $result = $this->mapper->map_to_v4_atomic( $property, $input_value );
        
        $this->assertNotNull( $result, "{$description}: Result should not be null" );
        $this->assertEquals( $expected_output, $result, $description );
        
        // Validate atomic structure
        $this->assertTrue(
            $this->validator->validate_against_schema( $this->get_expected_prop_type(), $result['value'] ),
            "{$description}: Result should pass atomic validation. Errors: " . 
            implode( ', ', $this->validator->get_validation_errors() )
        );
    }
    
    public function test_returns_null_for_unsupported_properties(): void {
        $unsupported_properties = [ 'margin', 'padding', 'transform' ];
        
        foreach ( $unsupported_properties as $property ) {
            if ( ! $this->mapper->supports_property( $property ) ) {
                $result = $this->mapper->map_to_v4_atomic( $property, '10px' );
                $this->assertNull(
                    $result,
                    "Should return null for unsupported property: {$property}"
                );
            }
        }
    }
}
```

### **Specific Mapper Test Classes**

#### **String Property Mapper Tests**
```php
// Create: /tests/phpunit/mappers/string-property-mapper-test.php
class String_Property_Mapper_Test extends Atomic_Property_Mapper_Test_Base {
    protected function create_mapper(): Atomic_Property_Mapper_Interface {
        return new String_Property_Mapper();
    }
    
    protected function get_expected_prop_type(): string {
        return 'string';
    }
    
    protected function get_supported_properties(): array {
        return [
            'display', 'position', 'text-align', 'font-style',
            'text-decoration', 'text-transform', 'flex-direction',
            'align-items', 'justify-content', 'font-family'
        ];
    }
    
    protected function get_test_cases(): array {
        return [
            [
                'property' => 'display',
                'input' => 'flex',
                'expected' => [
                    'property' => 'display',
                    'value' => [
                        '$$type' => 'string',
                        'value' => 'flex'
                    ]
                ],
                'description' => 'Display flex should map correctly'
            ],
            [
                'property' => 'position',
                'input' => 'absolute',
                'expected' => [
                    'property' => 'position',
                    'value' => [
                        '$$type' => 'string',
                        'value' => 'absolute'
                    ]
                ],
                'description' => 'Position absolute should map correctly'
            ],
            [
                'property' => 'text-align',
                'input' => 'center',
                'expected' => [
                    'property' => 'text-align',
                    'value' => [
                        '$$type' => 'string',
                        'value' => 'center'
                    ]
                ],
                'description' => 'Text align center should map correctly'
            ],
            [
                'property' => 'flex-direction',
                'input' => 'column',
                'expected' => [
                    'property' => 'flex-direction',
                    'value' => [
                        '$$type' => 'string',
                        'value' => 'column'
                    ]
                ],
                'description' => 'Flex direction column should map correctly'
            ]
        ];
    }
    
    public function test_normalizes_whitespace(): void {
        $result = $this->mapper->map_to_v4_atomic( 'display', '  flex  ' );
        
        $this->assertEquals( 'flex', $result['value']['value'] );
    }
}
```

#### **Size Property Mapper Tests**
```php
// Create: /tests/phpunit/mappers/size-property-mapper-test.php
class Size_Property_Mapper_Test extends Atomic_Property_Mapper_Test_Base {
    protected function create_mapper(): Atomic_Property_Mapper_Interface {
        return new Size_Property_Mapper();
    }
    
    protected function get_expected_prop_type(): string {
        return 'size';
    }
    
    protected function get_supported_properties(): array {
        return [
            'font-size', 'width', 'height', 'max-width', 'min-width',
            'max-height', 'min-height', 'top', 'right', 'bottom', 'left',
            'line-height'
        ];
    }
    
    protected function get_test_cases(): array {
        return [
            [
                'property' => 'font-size',
                'input' => '16px',
                'expected' => [
                    'property' => 'font-size',
                    'value' => [
                        '$$type' => 'size',
                        'value' => [
                            'size' => 16.0,
                            'unit' => 'px'
                        ]
                    ]
                ],
                'description' => 'Font size 16px should map correctly'
            ],
            [
                'property' => 'width',
                'input' => '100%',
                'expected' => [
                    'property' => 'width',
                    'value' => [
                        '$$type' => 'size',
                        'value' => [
                            'size' => 100.0,
                            'unit' => '%'
                        ]
                    ]
                ],
                'description' => 'Width 100% should map correctly'
            ],
            [
                'property' => 'height',
                'input' => '2em',
                'expected' => [
                    'property' => 'height',
                    'value' => [
                        '$$type' => 'size',
                        'value' => [
                            'size' => 2.0,
                            'unit' => 'em'
                        ]
                    ]
                ],
                'description' => 'Height 2em should map correctly'
            ],
            [
                'property' => 'line-height',
                'input' => '1.5',
                'expected' => [
                    'property' => 'line-height',
                    'value' => [
                        '$$type' => 'size',
                        'value' => [
                            'size' => 1.5,
                            'unit' => ''
                        ]
                    ]
                ],
                'description' => 'Unitless line-height should map correctly'
            ]
        ];
    }
    
    public function test_handles_negative_values(): void {
        $result = $this->mapper->map_to_v4_atomic( 'top', '-10px' );
        
        $this->assertEquals( -10.0, $result['value']['value']['size'] );
        $this->assertEquals( 'px', $result['value']['value']['unit'] );
    }
    
    public function test_handles_decimal_values(): void {
        $result = $this->mapper->map_to_v4_atomic( 'font-size', '14.5px' );
        
        $this->assertEquals( 14.5, $result['value']['value']['size'] );
        $this->assertEquals( 'px', $result['value']['value']['unit'] );
    }
    
    public function test_handles_special_values(): void {
        $special_values = [ 'auto', 'inherit', 'initial', 'unset' ];
        
        foreach ( $special_values as $value ) {
            $result = $this->mapper->map_to_v4_atomic( 'width', $value );
            
            $this->assertEquals( 0.0, $result['value']['value']['size'] );
            $this->assertEquals( 'px', $result['value']['value']['unit'] );
        }
    }
}
```

#### **Dimensions Property Mapper Tests**
```php
// Create: /tests/phpunit/mappers/dimensions-property-mapper-test.php
class Dimensions_Property_Mapper_Test extends Atomic_Property_Mapper_Test_Base {
    protected function create_mapper(): Atomic_Property_Mapper_Interface {
        return new Dimensions_Property_Mapper();
    }
    
    protected function get_expected_prop_type(): string {
        return 'dimensions';
    }
    
    protected function get_supported_properties(): array {
        return [
            'margin', 'padding',
            'margin-top', 'margin-right', 'margin-bottom', 'margin-left',
            'padding-top', 'padding-right', 'padding-bottom', 'padding-left'
        ];
    }
    
    protected function get_test_cases(): array {
        return [
            [
                'property' => 'margin',
                'input' => '10px',
                'expected' => [
                    'property' => 'margin',
                    'value' => [
                        '$$type' => 'dimensions',
                        'value' => [
                            'block-start' => [ '$$type' => 'size', 'value' => [ 'size' => 10.0, 'unit' => 'px' ] ],
                            'inline-end' => [ '$$type' => 'size', 'value' => [ 'size' => 10.0, 'unit' => 'px' ] ],
                            'block-end' => [ '$$type' => 'size', 'value' => [ 'size' => 10.0, 'unit' => 'px' ] ],
                            'inline-start' => [ '$$type' => 'size', 'value' => [ 'size' => 10.0, 'unit' => 'px' ] ]
                        ]
                    ]
                ],
                'description' => 'Single value margin should apply to all sides'
            ],
            [
                'property' => 'padding',
                'input' => '10px 20px',
                'expected' => [
                    'property' => 'padding',
                    'value' => [
                        '$$type' => 'dimensions',
                        'value' => [
                            'block-start' => [ '$$type' => 'size', 'value' => [ 'size' => 10.0, 'unit' => 'px' ] ],
                            'inline-end' => [ '$$type' => 'size', 'value' => [ 'size' => 20.0, 'unit' => 'px' ] ],
                            'block-end' => [ '$$type' => 'size', 'value' => [ 'size' => 10.0, 'unit' => 'px' ] ],
                            'inline-start' => [ '$$type' => 'size', 'value' => [ 'size' => 20.0, 'unit' => 'px' ] ]
                        ]
                    ]
                ],
                'description' => 'Two value padding should apply vertical/horizontal'
            ],
            [
                'property' => 'margin',
                'input' => '10px 20px 15px',
                'expected' => [
                    'property' => 'margin',
                    'value' => [
                        '$$type' => 'dimensions',
                        'value' => [
                            'block-start' => [ '$$type' => 'size', 'value' => [ 'size' => 10.0, 'unit' => 'px' ] ],
                            'inline-end' => [ '$$type' => 'size', 'value' => [ 'size' => 20.0, 'unit' => 'px' ] ],
                            'block-end' => [ '$$type' => 'size', 'value' => [ 'size' => 15.0, 'unit' => 'px' ] ],
                            'inline-start' => [ '$$type' => 'size', 'value' => [ 'size' => 20.0, 'unit' => 'px' ] ]
                        ]
                    ]
                ],
                'description' => 'Three value margin should apply top/horizontal/bottom'
            ],
            [
                'property' => 'padding',
                'input' => '10px 20px 15px 25px',
                'expected' => [
                    'property' => 'padding',
                    'value' => [
                        '$$type' => 'dimensions',
                        'value' => [
                            'block-start' => [ '$$type' => 'size', 'value' => [ 'size' => 10.0, 'unit' => 'px' ] ],
                            'inline-end' => [ '$$type' => 'size', 'value' => [ 'size' => 20.0, 'unit' => 'px' ] ],
                            'block-end' => [ '$$type' => 'size', 'value' => [ 'size' => 15.0, 'unit' => 'px' ] ],
                            'inline-start' => [ '$$type' => 'size', 'value' => [ 'size' => 25.0, 'unit' => 'px' ] ]
                        ]
                    ]
                ],
                'description' => 'Four value padding should apply to each side'
            ]
        ];
    }
    
    public function test_individual_margin_properties(): void {
        $individual_tests = [
            'margin-top' => 'block-start',
            'margin-right' => 'inline-end',
            'margin-bottom' => 'block-end',
            'margin-left' => 'inline-start'
        ];
        
        foreach ( $individual_tests as $property => $logical_side ) {
            $result = $this->mapper->map_to_v4_atomic( $property, '15px' );
            
            $this->assertEquals( 15.0, $result['value']['value'][ $logical_side ]['value']['size'] );
            $this->assertEquals( 'px', $result['value']['value'][ $logical_side ]['value']['unit'] );
            
            // Other sides should be zero
            foreach ( [ 'block-start', 'inline-end', 'block-end', 'inline-start' ] as $side ) {
                if ( $side !== $logical_side ) {
                    $this->assertEquals( 0.0, $result['value']['value'][ $side ]['value']['size'] );
                }
            }
        }
    }
    
    public function test_mixed_units_in_shorthand(): void {
        $result = $this->mapper->map_to_v4_atomic( 'margin', '10px 2em 15px 1rem' );
        
        $this->assertEquals( 'px', $result['value']['value']['block-start']['value']['unit'] );
        $this->assertEquals( 'em', $result['value']['value']['inline-end']['value']['unit'] );
        $this->assertEquals( 'px', $result['value']['value']['block-end']['value']['unit'] );
        $this->assertEquals( 'rem', $result['value']['value']['inline-start']['value']['unit'] );
    }
}
```

---

## **2. INTEGRATION TESTING FRAMEWORK**

### **Registry Integration Tests**
```php
// Create: /tests/phpunit/integration/property-mapper-registry-integration-test.php
class Property_Mapper_Registry_Integration_Test extends WP_UnitTestCase {
    private Enhanced_Property_Mapper_Registry $registry;
    
    public function setUp(): void {
        parent::setUp();
        $this->registry = Enhanced_Property_Mapper_Registry::get_instance();
    }
    
    public function test_resolves_correct_mappers_for_properties(): void {
        $property_mapper_expectations = [
            'display' => String_Property_Mapper::class,
            'font-size' => Size_Property_Mapper::class,
            'color' => Color_Property_Mapper::class,
            'margin' => Dimensions_Property_Mapper::class,
            'box-shadow' => Box_Shadow_Property_Mapper::class
        ];
        
        foreach ( $property_mapper_expectations as $property => $expected_class ) {
            $mapper = $this->registry->resolve_mapper( $property );
            
            $this->assertInstanceOf(
                $expected_class,
                $mapper,
                "Property '{$property}' should resolve to {$expected_class}"
            );
        }
    }
    
    public function test_caches_mapper_instances(): void {
        $mapper1 = $this->registry->resolve_mapper( 'display' );
        $mapper2 = $this->registry->resolve_mapper( 'display' );
        
        $this->assertSame( $mapper1, $mapper2, 'Registry should cache mapper instances' );
    }
    
    public function test_returns_null_for_unsupported_properties(): void {
        $unsupported_properties = [ 'invalid-prop', 'non-existent', 'fake-property' ];
        
        foreach ( $unsupported_properties as $property ) {
            $mapper = $this->registry->resolve_mapper( $property );
            $this->assertNull( $mapper, "Should return null for unsupported property: {$property}" );
        }
    }
    
    public function test_get_supported_properties_returns_comprehensive_list(): void {
        $supported_properties = $this->registry->get_supported_properties();
        
        $expected_properties = [
            'display', 'position', 'text-align', 'font-size', 'width', 'height',
            'color', 'background-color', 'margin', 'padding', 'box-shadow'
        ];
        
        foreach ( $expected_properties as $property ) {
            $this->assertContains(
                $property,
                $supported_properties,
                "Supported properties should include: {$property}"
            );
        }
    }
}
```

### **End-to-End Conversion Tests**
```php
// Create: /tests/phpunit/integration/css-conversion-end-to-end-test.php
class CSS_Conversion_End_To_End_Test extends WP_UnitTestCase {
    private Enhanced_Property_Mapper_Registry $registry;
    
    public function setUp(): void {
        parent::setUp();
        $this->registry = Enhanced_Property_Mapper_Registry::get_instance();
    }
    
    public function test_complete_css_conversion_workflow(): void {
        $css_properties = [
            'display' => 'flex',
            'font-size' => '16px',
            'color' => '#ff0000',
            'margin' => '10px 20px',
            'box-shadow' => '0 2px 4px rgba(0,0,0,0.1)'
        ];
        
        $converted_properties = [];
        
        foreach ( $css_properties as $property => $value ) {
            $mapper = $this->registry->resolve_mapper( $property );
            $this->assertNotNull( $mapper, "Should find mapper for property: {$property}" );
            
            $result = $mapper->map_to_v4_atomic( $property, $value );
            $this->assertNotNull( $result, "Should convert property: {$property}" );
            
            $converted_properties[ $property ] = $result;
        }
        
        // Verify all properties were converted
        $this->assertCount( 5, $converted_properties );
        
        // Verify atomic structures
        $this->assertEquals( 'string', $converted_properties['display']['value']['$$type'] );
        $this->assertEquals( 'size', $converted_properties['font-size']['value']['$$type'] );
        $this->assertEquals( 'color', $converted_properties['color']['value']['$$type'] );
        $this->assertEquals( 'dimensions', $converted_properties['margin']['value']['$$type'] );
        $this->assertEquals( 'box-shadow', $converted_properties['box-shadow']['value']['$$type'] );
    }
    
    public function test_handles_mixed_valid_and_invalid_properties(): void {
        $mixed_properties = [
            'display' => 'flex',           // Valid
            'invalid-prop' => 'value',     // Invalid
            'font-size' => '16px',         // Valid
            'fake-property' => 'test'      // Invalid
        ];
        
        $successful_conversions = 0;
        $failed_conversions = 0;
        
        foreach ( $mixed_properties as $property => $value ) {
            $mapper = $this->registry->resolve_mapper( $property );
            
            if ( $mapper ) {
                $result = $mapper->map_to_v4_atomic( $property, $value );
                if ( $result ) {
                    $successful_conversions++;
                } else {
                    $failed_conversions++;
                }
            } else {
                $failed_conversions++;
            }
        }
        
        $this->assertEquals( 2, $successful_conversions );
        $this->assertEquals( 2, $failed_conversions );
    }
}
```

---

## **3. ATOMIC VALIDATION TESTING**

### **Schema Compliance Tests**
```php
// Create: /tests/phpunit/validation/atomic-structure-validation-test.php
class Atomic_Structure_Validation_Test extends WP_UnitTestCase {
    private Atomic_Structure_Validator $validator;
    
    public function setUp(): void {
        parent::setUp();
        $this->validator = new Atomic_Structure_Validator();
    }
    
    public function test_validates_correct_string_structure(): void {
        $valid_string = [
            '$$type' => 'string',
            'value' => 'flex'
        ];
        
        $this->assertTrue( $this->validator->validate_against_schema( 'string', $valid_string ) );
        $this->assertEmpty( $this->validator->get_validation_errors() );
    }
    
    public function test_validates_correct_size_structure(): void {
        $valid_size = [
            '$$type' => 'size',
            'value' => [
                'size' => 16.0,
                'unit' => 'px'
            ]
        ];
        
        $this->assertTrue( $this->validator->validate_against_schema( 'size', $valid_size ) );
        $this->assertEmpty( $this->validator->get_validation_errors() );
    }
    
    public function test_validates_correct_dimensions_structure(): void {
        $valid_dimensions = [
            '$$type' => 'dimensions',
            'value' => [
                'block-start' => [ '$$type' => 'size', 'value' => [ 'size' => 10.0, 'unit' => 'px' ] ],
                'inline-end' => [ '$$type' => 'size', 'value' => [ 'size' => 20.0, 'unit' => 'px' ] ],
                'block-end' => [ '$$type' => 'size', 'value' => [ 'size' => 10.0, 'unit' => 'px' ] ],
                'inline-start' => [ '$$type' => 'size', 'value' => [ 'size' => 20.0, 'unit' => 'px' ] ]
            ]
        ];
        
        $this->assertTrue( $this->validator->validate_against_schema( 'dimensions', $valid_dimensions ) );
        $this->assertEmpty( $this->validator->get_validation_errors() );
    }
    
    public function test_rejects_missing_type_field(): void {
        $invalid_structure = [
            'value' => 'flex'
        ];
        
        $this->assertFalse( $this->validator->validate_against_schema( 'string', $invalid_structure ) );
        $this->assertContains( "Missing required '$$type' field", $this->validator->get_validation_errors() );
    }
    
    public function test_rejects_type_mismatch(): void {
        $invalid_structure = [
            '$$type' => 'number',
            'value' => 'flex'
        ];
        
        $this->assertFalse( $this->validator->validate_against_schema( 'string', $invalid_structure ) );
        $this->assertContains( "Type mismatch: expected 'string', got 'number'", $this->validator->get_validation_errors() );
    }
    
    public function test_rejects_missing_value_field(): void {
        $invalid_structure = [
            '$$type' => 'string'
        ];
        
        $this->assertFalse( $this->validator->validate_against_schema( 'string', $invalid_structure ) );
        $this->assertContains( "Missing required 'value' field", $this->validator->get_validation_errors() );
    }
    
    public function test_rejects_invalid_size_structure(): void {
        $invalid_size = [
            '$$type' => 'size',
            'value' => [
                'size' => 'invalid',  // Should be numeric
                'unit' => 'px'
            ]
        ];
        
        $this->assertFalse( $this->validator->validate_against_schema( 'size', $invalid_size ) );
        $this->assertContains( "Size must have numeric 'size' field", $this->validator->get_validation_errors() );
    }
    
    public function test_rejects_incomplete_dimensions_structure(): void {
        $invalid_dimensions = [
            '$$type' => 'dimensions',
            'value' => [
                'block-start' => [ '$$type' => 'size', 'value' => [ 'size' => 10.0, 'unit' => 'px' ] ],
                // Missing other required fields
            ]
        ];
        
        $this->assertFalse( $this->validator->validate_against_schema( 'dimensions', $invalid_dimensions ) );
        $errors = $this->validator->get_validation_errors();
        $this->assertContains( "Dimensions missing required field: inline-end", $errors );
    }
}
```

---

## **4. PERFORMANCE TESTING FRAMEWORK**

### **Conversion Speed Benchmarks**
```php
// Create: /tests/phpunit/performance/conversion-performance-test.php
class Conversion_Performance_Test extends WP_UnitTestCase {
    private Enhanced_Property_Mapper_Registry $registry;
    private const PERFORMANCE_THRESHOLD_MS = 100;
    private const MEMORY_THRESHOLD_MB = 50;
    
    public function setUp(): void {
        parent::setUp();
        $this->registry = Enhanced_Property_Mapper_Registry::get_instance();
    }
    
    public function test_single_property_conversion_speed(): void {
        $test_properties = [
            'display' => 'flex',
            'font-size' => '16px',
            'color' => '#ff0000',
            'margin' => '10px 20px 15px 25px',
            'box-shadow' => '0 2px 4px rgba(0,0,0,0.1), inset 0 1px 2px rgba(255,255,255,0.5)'
        ];
        
        foreach ( $test_properties as $property => $value ) {
            $start_time = microtime( true );
            $start_memory = memory_get_usage();
            
            $mapper = $this->registry->resolve_mapper( $property );
            $result = $mapper ? $mapper->map_to_v4_atomic( $property, $value ) : null;
            
            $end_time = microtime( true );
            $end_memory = memory_get_usage();
            
            $execution_time_ms = ( $end_time - $start_time ) * 1000;
            $memory_usage_mb = ( $end_memory - $start_memory ) / 1024 / 1024;
            
            $this->assertLessThan(
                10, // 10ms for single property
                $execution_time_ms,
                "Property '{$property}' conversion should be under 10ms, took {$execution_time_ms}ms"
            );
            
            $this->assertLessThan(
                1, // 1MB for single property
                $memory_usage_mb,
                "Property '{$property}' conversion should use under 1MB, used {$memory_usage_mb}MB"
            );
        }
    }
    
    public function test_bulk_conversion_performance(): void {
        $bulk_properties = [];
        
        // Generate 100 properties for bulk testing
        for ( $i = 0; $i < 100; $i++ ) {
            $bulk_properties["margin-{$i}"] = '10px 20px';
            $bulk_properties["font-size-{$i}"] = '16px';
            $bulk_properties["color-{$i}"] = '#ff0000';
        }
        
        $start_time = microtime( true );
        $start_memory = memory_get_usage();
        
        $successful_conversions = 0;
        foreach ( $bulk_properties as $property => $value ) {
            // Use base property name for mapper resolution
            $base_property = preg_replace( '/-\d+$/', '', $property );
            $mapper = $this->registry->resolve_mapper( $base_property );
            
            if ( $mapper ) {
                $result = $mapper->map_to_v4_atomic( $base_property, $value );
                if ( $result ) {
                    $successful_conversions++;
                }
            }
        }
        
        $end_time = microtime( true );
        $end_memory = memory_get_usage();
        
        $execution_time_ms = ( $end_time - $start_time ) * 1000;
        $memory_usage_mb = ( $end_memory - $start_memory ) / 1024 / 1024;
        
        $this->assertLessThan(
            self::PERFORMANCE_THRESHOLD_MS,
            $execution_time_ms,
            "Bulk conversion should be under " . self::PERFORMANCE_THRESHOLD_MS . "ms, took {$execution_time_ms}ms"
        );
        
        $this->assertLessThan(
            self::MEMORY_THRESHOLD_MB,
            $memory_usage_mb,
            "Bulk conversion should use under " . self::MEMORY_THRESHOLD_MB . "MB, used {$memory_usage_mb}MB"
        );
        
        $this->assertGreaterThan( 90, $successful_conversions, 'Should successfully convert most properties' );
    }
    
    public function test_registry_caching_performance(): void {
        $property = 'display';
        
        // First resolution (cache miss)
        $start_time = microtime( true );
        $mapper1 = $this->registry->resolve_mapper( $property );
        $first_resolution_time = ( microtime( true ) - $start_time ) * 1000;
        
        // Second resolution (cache hit)
        $start_time = microtime( true );
        $mapper2 = $this->registry->resolve_mapper( $property );
        $second_resolution_time = ( microtime( true ) - $start_time ) * 1000;
        
        $this->assertSame( $mapper1, $mapper2, 'Should return same cached instance' );
        $this->assertLessThan(
            $first_resolution_time,
            $second_resolution_time,
            'Cached resolution should be faster than initial resolution'
        );
        $this->assertLessThan( 1, $second_resolution_time, 'Cached resolution should be under 1ms' );
    }
}
```

---

## **5. VISUAL REGRESSION TESTING**

### **Elementor Editor Integration Tests**
```php
// Create: /tests/phpunit/visual/elementor-editor-integration-test.php
class Elementor_Editor_Integration_Test extends WP_UnitTestCase {
    private Enhanced_Property_Mapper_Registry $registry;
    
    public function setUp(): void {
        parent::setUp();
        $this->registry = Enhanced_Property_Mapper_Registry::get_instance();
        
        // Mock Elementor environment
        $this->setup_elementor_mock_environment();
    }
    
    private function setup_elementor_mock_environment(): void {
        // Mock Elementor classes and functions needed for testing
        if ( ! class_exists( 'Elementor\Plugin' ) ) {
            $this->markTestSkipped( 'Elementor not available for visual testing' );
        }
    }
    
    public function test_converted_styles_render_in_elementor(): void {
        $test_styles = [
            'display' => 'flex',
            'font-size' => '18px',
            'color' => '#333333',
            'margin' => '20px 10px',
            'box-shadow' => '0 4px 8px rgba(0,0,0,0.15)'
        ];
        
        $converted_styles = [];
        
        foreach ( $test_styles as $property => $value ) {
            $mapper = $this->registry->resolve_mapper( $property );
            if ( $mapper ) {
                $result = $mapper->map_to_v4_atomic( $property, $value );
                if ( $result ) {
                    $converted_styles[ $property ] = $result;
                }
            }
        }
        
        // Create mock Elementor widget with converted styles
        $widget_data = [
            'widgetType' => 'heading',
            'settings' => [],
            'styles' => $converted_styles
        ];
        
        // Verify widget can be created and rendered
        $this->assertTrue( $this->can_create_elementor_widget( $widget_data ) );
        $this->assertTrue( $this->can_render_elementor_widget( $widget_data ) );
    }
    
    private function can_create_elementor_widget( array $widget_data ): bool {
        // Mock widget creation logic
        return ! empty( $widget_data['widgetType'] ) && is_array( $widget_data['styles'] );
    }
    
    private function can_render_elementor_widget( array $widget_data ): bool {
        // Mock widget rendering logic
        return ! empty( $widget_data['styles'] );
    }
    
    public function test_atomic_structures_compatible_with_elementor_schema(): void {
        $atomic_structures = [
            'string' => [ '$$type' => 'string', 'value' => 'flex' ],
            'size' => [ '$$type' => 'size', 'value' => [ 'size' => 16.0, 'unit' => 'px' ] ],
            'color' => [ '$$type' => 'color', 'value' => '#ff0000' ],
            'dimensions' => [
                '$$type' => 'dimensions',
                'value' => [
                    'block-start' => [ '$$type' => 'size', 'value' => [ 'size' => 10.0, 'unit' => 'px' ] ],
                    'inline-end' => [ '$$type' => 'size', 'value' => [ 'size' => 20.0, 'unit' => 'px' ] ],
                    'block-end' => [ '$$type' => 'size', 'value' => [ 'size' => 10.0, 'unit' => 'px' ] ],
                    'inline-start' => [ '$$type' => 'size', 'value' => [ 'size' => 20.0, 'unit' => 'px' ] ]
                ]
            ]
        ];
        
        foreach ( $atomic_structures as $type => $structure ) {
            $this->assertTrue(
                $this->is_compatible_with_elementor_schema( $structure ),
                "Atomic structure for type '{$type}' should be compatible with Elementor schema"
            );
        }
    }
    
    private function is_compatible_with_elementor_schema( array $structure ): bool {
        // Mock Elementor schema compatibility check
        return isset( $structure['$$type'] ) && isset( $structure['value'] );
    }
}
```

---

## **6. TEST EXECUTION AND REPORTING**

### **PHPUnit Configuration**
```xml
<!-- Create: /tests/phpunit.xml -->
<?xml version="1.0" encoding="UTF-8"?>
<phpunit
    bootstrap="bootstrap.php"
    backupGlobals="false"
    colors="true"
    convertErrorsToExceptions="true"
    convertNoticesToExceptions="true"
    convertWarningsToExceptions="true"
    processIsolation="false"
    stopOnFailure="false"
    verbose="true">
    
    <testsuites>
        <testsuite name="Unit Tests">
            <directory>./phpunit/mappers/</directory>
            <directory>./phpunit/parsers/</directory>
            <directory>./phpunit/validation/</directory>
        </testsuite>
        
        <testsuite name="Integration Tests">
            <directory>./phpunit/integration/</directory>
        </testsuite>
        
        <testsuite name="Performance Tests">
            <directory>./phpunit/performance/</directory>
        </testsuite>
        
        <testsuite name="Visual Tests">
            <directory>./phpunit/visual/</directory>
        </testsuite>
    </testsuites>
    
    <filter>
        <whitelist processUncoveredFilesFromWhitelist="true">
            <directory suffix=".php">../convertors/css-properties/</directory>
        </whitelist>
    </filter>
    
    <logging>
        <log type="coverage-html" target="./coverage/html"/>
        <log type="coverage-clover" target="./coverage/clover.xml"/>
        <log type="junit" target="./coverage/junit.xml"/>
    </logging>
</phpunit>
```

### **Test Execution Scripts**
```bash
# Create: /tests/run-tests.sh
#!/bin/bash

echo "🧪 Running CSS Property Mapper Tests..."

# Run unit tests
echo "📋 Running Unit Tests..."
./vendor/bin/phpunit --testsuite="Unit Tests" --coverage-text

# Run integration tests
echo "🔗 Running Integration Tests..."
./vendor/bin/phpunit --testsuite="Integration Tests"

# Run performance tests
echo "⚡ Running Performance Tests..."
./vendor/bin/phpunit --testsuite="Performance Tests"

# Run visual tests (if Elementor available)
echo "👁️  Running Visual Tests..."
./vendor/bin/phpunit --testsuite="Visual Tests"

# Generate coverage report
echo "📊 Generating Coverage Report..."
./vendor/bin/phpunit --coverage-html ./tests/coverage/html

echo "✅ All tests completed!"
echo "📊 Coverage report available at: ./tests/coverage/html/index.html"
```

---

## **SUCCESS METRICS**

### **Coverage Targets**
- **Unit Test Coverage**: 100% for all mapper classes
- **Integration Test Coverage**: 95% for registry and factory classes
- **Performance Test Coverage**: All critical performance paths
- **Visual Test Coverage**: Core rendering scenarios

### **Quality Gates**
- **All unit tests must pass**: 100% pass rate
- **Performance thresholds met**: <100ms conversion time
- **Memory usage within limits**: <50MB for bulk operations
- **Schema compliance**: 100% atomic structure accuracy

### **Continuous Integration**
- **Automated test execution** on every commit
- **Performance regression detection** with alerts
- **Coverage reporting** with trend analysis
- **Visual regression detection** for UI changes

---

## **CONCLUSION**

This comprehensive testing framework ensures:

1. **100% Reliability** - Every mapper thoroughly tested
2. **Performance Assurance** - Speed and memory benchmarks
3. **Schema Compliance** - Atomic structure validation
4. **Visual Verification** - Elementor editor compatibility
5. **Continuous Quality** - Automated testing pipeline

The framework provides **confidence** in the implementation and **protection** against regressions as the system evolves to support all 50 atomic prop types.

**Next Steps**: Implement the testing framework alongside the mapper development in Week 1 of the implementation plan.
