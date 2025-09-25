<?php
namespace Elementor\Testing\Modules\CssConverter;

use ElementorEditorTesting\Elementor_Test_Base;
use Elementor\Modules\CssConverter\Convertors\CssProperties\Class_Property_Mapper_Factory;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * @group css-converter
 * @group css-converter-v4-unified
 */
class Test_V4_Unified_Mappers extends Elementor_Test_Base {

	public function test_all_mappers_support_unified_interface() {
		$registry = Class_Property_Mapper_Factory::get_registry();
		
		// Test key properties that should be supported
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
		];

		foreach ( $test_cases as [ $property, $value ] ) {
			$mapper = $registry->resolve( $property, $value );
			
			if ( $mapper ) {
				// Test unified interface methods exist
				$this->assertTrue( method_exists( $mapper, 'map_to_v4_atomic' ), "Mapper for {$property} should have map_to_v4_atomic method" );
				$this->assertTrue( method_exists( $mapper, 'supports_v4_conversion' ), "Mapper for {$property} should have supports_v4_conversion method" );
				$this->assertTrue( method_exists( $mapper, 'get_v4_property_name' ), "Mapper for {$property} should have get_v4_property_name method" );

				// Test v4 conversion works
				if ( $mapper->supports_v4_conversion( $property, $value ) ) {
					$v4_result = $mapper->map_to_v4_atomic( $property, $value );
					$this->assertNotNull( $v4_result, "Mapper for {$property} should return v4 result" );
					$this->assertArrayHasKey( 'property', $v4_result );
					$this->assertArrayHasKey( 'value', $v4_result );
					$this->assertArrayHasKey( '$$type', $v4_result['value'] );
				}

				// Test backward compatibility
				$class_result = $mapper->map_to_schema( $property, $value );
				$this->assertNotEmpty( $class_result, "Mapper for {$property} should return class result for backward compatibility" );
			}
		}
	}

	public function test_type_wrappers_correctness() {
		$expected_types = [
			'color' => 'color',
			'background-color' => 'color', // In class format
			'font-size' => 'size',
			'margin-top' => 'size',
			'text-align' => 'string',
			'border-width' => 'size',
			'border-style' => 'string',
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
		for ( $i = 0; $i < 50; $i++ ) {
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

		// Should complete 200 conversions (50 * 4 properties) in reasonable time
		$this->assertLessThan( 1.0, $execution_time, 'Unified system should perform conversions efficiently' );
	}

	public function test_specific_v4_conversions() {
		$registry = Class_Property_Mapper_Factory::get_registry();

		// Test color conversion
		$color_mapper = $registry->resolve( 'color', '#ff0000' );
		if ( $color_mapper ) {
			$v4_result = $color_mapper->map_to_v4_atomic( 'color', '#ff0000' );
			$this->assertEquals( 'color', $v4_result['property'] );
			$this->assertEquals( 'color', $v4_result['value']['$$type'] );
			$this->assertEquals( '#ff0000', $v4_result['value']['value'] );
		}

		// Test background-color conversion
		$bg_mapper = $registry->resolve( 'background-color', '#00ff00' );
		if ( $bg_mapper ) {
			$v4_result = $bg_mapper->map_to_v4_atomic( 'background-color', '#00ff00' );
			$this->assertEquals( 'background', $v4_result['property'] );
			$this->assertEquals( 'background', $v4_result['value']['$$type'] );
			$this->assertArrayHasKey( 'color', $v4_result['value']['value'] );
		}

		// Test font-size conversion
		$font_mapper = $registry->resolve( 'font-size', '16px' );
		if ( $font_mapper ) {
			$v4_result = $font_mapper->map_to_v4_atomic( 'font-size', '16px' );
			$this->assertEquals( 'font-size', $v4_result['property'] );
			$this->assertEquals( 'size', $v4_result['value']['$$type'] );
			$this->assertArrayHasKey( 'size', $v4_result['value']['value'] );
			$this->assertArrayHasKey( 'unit', $v4_result['value']['value'] );
		}
	}

	public function test_all_mappers_extend_unified_base() {
		$mappers_to_test = [
			'color-property-mapper.php',
			'background-color-property-mapper.php',
			'font-size-property-mapper.php',
			'margin-property-mapper.php',
			'padding-property-mapper.php',
			'text-align-property-mapper.php',
			'border-width-property-mapper.php',
			'border-color-property-mapper.php',
			'border-style-property-mapper.php',
		];

		foreach ( $mappers_to_test as $mapper_file ) {
			$file_path = ELEMENTOR_CSS_PATH . 'modules/css-converter/convertors/css-properties/' . $mapper_file;
			if ( file_exists( $file_path ) ) {
				$content = file_get_contents( $file_path );
				$extends_unified = strpos( $content, 'extends Unified_Property_Mapper_Base' ) !== false;
				$this->assertTrue( $extends_unified, "Mapper {$mapper_file} should extend Unified_Property_Mapper_Base" );
			}
		}
	}

	private function get_test_value_for_property( string $property ): string {
		$test_values = [
			'color' => '#ff0000',
			'background-color' => '#00ff00',
			'font-size' => '16px',
			'margin' => '10px',
			'margin-top' => '10px',
			'padding' => '5px',
			'text-align' => 'center',
			'border-width' => '2px',
			'border-color' => '#0000ff',
			'border-style' => 'solid',
			'width' => '100px',
		];

		return $test_values[ $property ] ?? '10px';
	}
}
