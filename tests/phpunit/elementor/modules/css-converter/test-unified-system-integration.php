<?php
namespace Elementor\Testing\Modules\CssConverter;

use ElementorEditorTesting\Elementor_Test_Base;
use Elementor\Modules\CssConverter\Convertors\CssProperties\Class_Property_Mapper_Factory;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * @group css-converter
 * @group css-converter-integration
 * @group css-converter-unified
 */
class Test_Unified_System_Integration extends Elementor_Test_Base {

	public function test_all_property_mappers_support_unified_interface() {
		$registry = Class_Property_Mapper_Factory::get_registry();
		
		// Test properties that should be supported
		$test_cases = [
			[ 'color', '#ff0000' ],
			[ 'background-color', '#00ff00' ],
			[ 'font-size', '16px' ],
			[ 'margin', '10px' ],
			[ 'padding', '5px 10px' ],
			[ 'text-align', 'center' ],
			[ 'border-width', '2px' ],
			[ 'border-color', '#0000ff' ],
			[ 'border-style', 'solid' ],
			[ 'width', '100px' ],
			[ 'height', '200px' ],
		];

		foreach ( $test_cases as [ $property, $value ] ) {
			$mapper = $registry->resolve( $property, $value );
			
			if ( $mapper ) {
				// Verify unified interface methods exist
				$this->assertTrue( method_exists( $mapper, 'map_to_v4_atomic' ), "Mapper for {$property} should have map_to_v4_atomic method" );
				$this->assertTrue( method_exists( $mapper, 'supports_v4_conversion' ), "Mapper for {$property} should have supports_v4_conversion method" );
				$this->assertTrue( method_exists( $mapper, 'get_v4_property_name' ), "Mapper for {$property} should have get_v4_property_name method" );

				// Verify v4 conversion works
				$v4_result = $mapper->map_to_v4_atomic( $property, $value );
				if ( $mapper->supports_v4_conversion( $property, $value ) ) {
					$this->assertNotNull( $v4_result, "Mapper for {$property} should return v4 result" );
					$this->assertArrayHasKey( 'property', $v4_result, "v4 result should have property key" );
					$this->assertArrayHasKey( 'value', $v4_result, "v4 result should have value key" );
					$this->assertArrayHasKey( '$$type', $v4_result['value'], "v4 value should have $$type wrapper" );
				}

				// Verify backward compatibility
				$class_result = $mapper->map_to_schema( $property, $value );
				$this->assertNotEmpty( $class_result, "Mapper for {$property} should return class result for backward compatibility" );
			}
		}
	}

	public function test_type_wrappers_are_correct_for_all_mappers() {
		$expected_types = [
			'color' => 'color',
			'background-color' => 'color', // In class format, background-color uses color type
			'font-size' => 'size',
			'margin-top' => 'size',
			'padding-left' => 'size',
			'text-align' => 'string',
			'border-width' => 'size',
			'border-color' => 'color',
			'border-style' => 'string',
			'width' => 'size',
			'height' => 'size',
		];

		$registry = Class_Property_Mapper_Factory::get_registry();

		foreach ( $expected_types as $property => $expected_type ) {
			$test_value = $this->get_test_value_for_property( $property );
			$mapper = $registry->resolve( $property, $test_value );

			if ( $mapper && $mapper->supports( $property, $test_value ) ) {
				$class_result = $mapper->map_to_schema( $property, $test_value );
				$this->assertNotEmpty( $class_result, "Mapper should support {$property}" );

				// Get the first value from class result
				$first_value = reset( $class_result );
				if ( is_array( $first_value ) && isset( $first_value['$$type'] ) ) {
					$this->assertEquals( $expected_type, $first_value['$$type'], "Property {$property} should have type {$expected_type}" );
				}
			}
		}
	}

	public function test_v4_property_name_mapping() {
		$property_mappings = [
			'color' => 'color',
			'background-color' => 'background', // Maps to background in v4
			'font-size' => 'font-size',
			'margin' => 'margin',
			'text-align' => 'text-align',
			'border-width' => 'border-width',
		];

		$registry = Class_Property_Mapper_Factory::get_registry();

		foreach ( $property_mappings as $css_property => $expected_v4_property ) {
			$test_value = $this->get_test_value_for_property( $css_property );
			$mapper = $registry->resolve( $css_property, $test_value );

			if ( $mapper && method_exists( $mapper, 'get_v4_property_name' ) ) {
				$v4_property = $mapper->get_v4_property_name( $css_property );
				$this->assertEquals( $expected_v4_property, $v4_property, "CSS property {$css_property} should map to {$expected_v4_property} in v4" );
			}
		}
	}

	public function test_unified_mappers_handle_edge_cases() {
		$registry = Class_Property_Mapper_Factory::get_registry();

		// Test invalid values
		$invalid_cases = [
			[ 'color', 'invalid-color' ],
			[ 'font-size', 'invalid-size' ],
			[ 'margin', 'invalid-margin' ],
		];

		foreach ( $invalid_cases as [ $property, $invalid_value ] ) {
			$mapper = $registry->resolve( $property, $invalid_value );
			
			if ( $mapper ) {
				$this->assertFalse( $mapper->supports( $property, $invalid_value ), "Mapper should not support invalid value for {$property}" );
				$this->assertFalse( $mapper->supports_v4_conversion( $property, $invalid_value ), "Mapper should not support v4 conversion for invalid value" );
				$this->assertNull( $mapper->map_to_v4_atomic( $property, $invalid_value ), "Mapper should return null for invalid v4 conversion" );
			}
		}

		// Test unsupported properties
		$unsupported_cases = [
			[ 'color', 'background-color', '#ff0000' ], // Color mapper with background-color property
			[ 'font-size', 'line-height', '16px' ], // Font-size mapper with line-height property
		];

		foreach ( $unsupported_cases as [ $mapper_type, $wrong_property, $value ] ) {
			$mapper = $registry->resolve( $mapper_type, $value );
			
			if ( $mapper ) {
				$this->assertFalse( $mapper->supports( $wrong_property, $value ), "Mapper should not support wrong property" );
				$this->assertNull( $mapper->map_to_v4_atomic( $wrong_property, $value ), "Mapper should return null for unsupported property" );
			}
		}
	}

	public function test_performance_of_unified_system() {
		$registry = Class_Property_Mapper_Factory::get_registry();
		$test_properties = [
			[ 'color', '#ff0000' ],
			[ 'background-color', '#00ff00' ],
			[ 'font-size', '16px' ],
			[ 'margin', '10px 20px' ],
		];

		$start_time = microtime( true );

		// Perform many conversions to test performance
		for ( $i = 0; $i < 100; $i++ ) {
			foreach ( $test_properties as [ $property, $value ] ) {
				$mapper = $registry->resolve( $property, $value );
				if ( $mapper ) {
					$mapper->map_to_schema( $property, $value );
					if ( method_exists( $mapper, 'map_to_v4_atomic' ) ) {
						$mapper->map_to_v4_atomic( $property, $value );
					}
				}
			}
		}

		$end_time = microtime( true );
		$execution_time = $end_time - $start_time;

		// Should complete 400 conversions (100 * 4 properties) in reasonable time
		$this->assertLessThan( 1.0, $execution_time, 'Unified system should perform conversions efficiently' );
	}

	private function get_test_value_for_property( string $property ): string {
		$test_values = [
			'color' => '#ff0000',
			'background-color' => '#00ff00',
			'font-size' => '16px',
			'margin' => '10px',
			'margin-top' => '10px',
			'padding' => '5px',
			'padding-left' => '5px',
			'text-align' => 'center',
			'border-width' => '2px',
			'border-color' => '#0000ff',
			'border-style' => 'solid',
			'width' => '100px',
			'height' => '200px',
		];

		return $test_values[ $property ] ?? '10px';
	}
}
