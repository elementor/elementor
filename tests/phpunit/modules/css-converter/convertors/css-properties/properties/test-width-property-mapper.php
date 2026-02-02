<?php
namespace ElementorCss\Tests\Phpunit\Modules\CssConverter\Convertors\CssProperties\Properties;

use Elementor\Modules\CssConverter\Convertors\CssProperties\Properties\Width_Property_Mapper;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * PHPUnit Tests for Width Property Mapper
 * 
 * Tests atomic widget compliance for Size_Prop_Type structure
 * Validates width, min-width, max-width properties
 * 
 * @group css-converter
 * @group width-mapper
 */
class Test_Width_Property_Mapper extends Elementor_Test_Base {

	private Width_Property_Mapper $mapper;

	public function setUp(): void {
		parent::setUp();
		
		$this->mapper = new Width_Property_Mapper();
	}

	private function assert_atomic_structure( array $result, string $expected_type ): void {
		$this->assertNotNull( $result );
		$this->assertEquals( $expected_type, $result['$$type'] );
		$this->assertArrayHasKey( 'value', $result );
		$this->assertArrayHasKey( 'size', $result['value'] );
		$this->assertArrayHasKey( 'unit', $result['value'] );
	}

	public function test_supports_width_properties(): void {
		$this->assertTrue( $this->mapper->supports( 'width' ) );
		$this->assertTrue( $this->mapper->supports( 'min-width' ) );
		$this->assertTrue( $this->mapper->supports( 'max-width' ) );
		$this->assertFalse( $this->mapper->supports( 'height' ) );
		$this->assertFalse( $this->mapper->supports( 'padding' ) );
	}

	public function test_get_supported_properties(): void {
		$expected_properties = [
			'width',
			'min-width',
			'max-width',
		];
		
		$this->assertEquals( $expected_properties, $this->mapper->get_supported_properties() );
	}

	public function test_pixel_values(): void {
		$test_cases = [
			'integer_pixels' => ['value' => '300px', 'size' => 300.0, 'unit' => 'px'],
			'decimal_pixels' => ['value' => '250.5px', 'size' => 250.5, 'unit' => 'px'],
			'zero_pixels' => ['value' => '0px', 'size' => 0.0, 'unit' => 'px'],
		];

		foreach ( $test_cases as $case_name => $case_data ) {
			$result = $this->mapper->map_to_v4_atomic( 'width', $case_data['value'] );
			
			$this->assert_atomic_structure( $result, 'size' );
			$this->assertEquals( $case_data['size'], $result['value']['size'] );
			$this->assertEquals( $case_data['unit'], $result['value']['unit'] );
		}
	}

	public function test_different_units(): void {
		$test_cases = [
			'em_unit' => ['value' => '20em', 'size' => 20.0, 'unit' => 'em'],
			'rem_unit' => ['value' => '15.5rem', 'size' => 15.5, 'unit' => 'rem'],
			'percentage' => ['value' => '50%', 'size' => 50.0, 'unit' => '%'],
			'viewport_width' => ['value' => '100vw', 'size' => 100.0, 'unit' => 'vw'],
			'viewport_height' => ['value' => '75vh', 'size' => 75.0, 'unit' => 'vh'],
			'viewport_min' => ['value' => '30vmin', 'size' => 30.0, 'unit' => 'vmin'],
			'viewport_max' => ['value' => '40vmax', 'size' => 40.0, 'unit' => 'vmax'],
		];

		foreach ( $test_cases as $case_name => $case_data ) {
			$result = $this->mapper->map_to_v4_atomic( 'width', $case_data['value'] );
			
			$this->assert_atomic_structure( $result, 'size' );
			$this->assertEquals( $case_data['size'], $result['value']['size'] );
			$this->assertEquals( $case_data['unit'], $result['value']['unit'] );
		}
	}

	public function test_special_values(): void {
		$special_values = [
			'auto' => 'auto',
			'inherit' => 'inherit',
			'initial' => 'initial',
			'unset' => 'unset',
		];

		foreach ( $special_values as $case_name => $value ) {
			$result = $this->mapper->map_to_v4_atomic( 'width', $value );
			
			$this->assert_atomic_structure( $result, 'size' );
			$this->assertEquals( '', $result['value']['size'] );
			$this->assertEquals( 'auto', $result['value']['unit'] );
		}
	}

	public function test_unitless_values(): void {
		$result = $this->mapper->map_to_v4_atomic( 'width', '500' );
		
		$this->assert_atomic_structure( $result, 'size' );
		$this->assertEquals( 500.0, $result['value']['size'] );
		$this->assertEquals( 'px', $result['value']['unit'] );
	}

	public function test_all_supported_properties(): void {
		$properties = ['width', 'min-width', 'max-width'];
		
		foreach ( $properties as $property ) {
			$result = $this->mapper->map_to_v4_atomic( $property, '400px' );
			
			$this->assert_atomic_structure( $result, 'size' );
			$this->assertEquals( 400.0, $result['value']['size'] );
			$this->assertEquals( 'px', $result['value']['unit'] );
		}
	}

	public function test_supports_v4_conversion(): void {
		$valid_cases = [
			'pixel_value' => ['property' => 'width', 'value' => '300px'],
			'percentage_value' => ['property' => 'width', 'value' => '50%'],
			'auto_value' => ['property' => 'width', 'value' => 'auto'],
		];
		
		$invalid_cases = [
			'empty_string' => ['property' => 'width', 'value' => ''],
			'whitespace_only' => ['property' => 'width', 'value' => '   '],
			'wrong_property' => ['property' => 'height', 'value' => '300px'],
		];
		
		foreach ( $valid_cases as $case_name => $case_data ) {
			$this->assertTrue( 
				$this->mapper->supports_v4_conversion( $case_data['property'], $case_data['value'] ),
				"Should support case: $case_name"
			);
		}
		
		foreach ( $invalid_cases as $case_name => $case_data ) {
			$this->assertFalse( 
				$this->mapper->supports_v4_conversion( $case_data['property'], $case_data['value'] ),
				"Should not support case: $case_name"
			);
		}
	}

	public function test_invalid_values(): void {
		$invalid_values = [
			'empty_string' => '',
			'whitespace_only' => '   ',
			'invalid_unit' => '300xyz',
			'unit_without_number' => 'px',
			'invalid_keyword' => 'invalid',
		];

		foreach ( $invalid_values as $case_name => $value ) {
			$result = $this->mapper->map_to_v4_atomic( 'width', $value );
			$this->assertNull( 
				$result, 
				"Should be null for case: $case_name with invalid value: '$value'"
			);
		}
	}

	public function test_unsupported_property(): void {
		$result = $this->mapper->map_to_v4_atomic( 'height', '300px' );
		$this->assertNull( $result );
	}

	public function test_non_string_value(): void {
		$invalid_types = [
			'integer' => 123,
			'array' => [],
			'null' => null,
			'boolean' => true,
			'float' => 12.5,
		];

		foreach ( $invalid_types as $type_name => $value ) {
			$result = $this->mapper->map_to_v4_atomic( 'width', $value );
			$this->assertNull( 
				$result, 
				"Should be null for $type_name type: " . var_export( $value, true )
			);
		}
	}

	public function test_atomic_widget_compliance(): void {
		$result = $this->mapper->map_to_v4_atomic( 'width', '600px' );
		
		$this->assert_atomic_structure( $result, 'size' );
		
		// Verify exact atomic widget structure
		$this->assertEquals( 'size', $result['$$type'] );
		$this->assertIsArray( $result['value'] );
		$this->assertArrayHasKey( 'size', $result['value'] );
		$this->assertArrayHasKey( 'unit', $result['value'] );
		$this->assertIsNumeric( $result['value']['size'] );
		$this->assertIsString( $result['value']['unit'] );
		$this->assertEquals( 600.0, $result['value']['size'] );
		$this->assertEquals( 'px', $result['value']['unit'] );
	}

	public function test_get_v4_property_name(): void {
		$this->assertEquals( 'width', $this->mapper->get_v4_property_name( 'width' ) );
		$this->assertEquals( 'min-width', $this->mapper->get_v4_property_name( 'min-width' ) );
		$this->assertEquals( 'max-width', $this->mapper->get_v4_property_name( 'max-width' ) );
	}
}
