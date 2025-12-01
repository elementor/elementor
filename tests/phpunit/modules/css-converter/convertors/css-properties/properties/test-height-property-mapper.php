<?php
namespace ElementorCss\Tests\Phpunit\Modules\CssConverter\Convertors\CssProperties\Properties;

use Elementor\Modules\CssConverter\Convertors\CssProperties\Properties\Height_Property_Mapper;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * PHPUnit Tests for Height Property Mapper
 * 
 * Tests atomic widget compliance for Size_Prop_Type structure
 * Validates height, min-height, max-height properties
 * 
 * @group css-converter
 * @group height-mapper
 */
class Test_Height_Property_Mapper extends Elementor_Test_Base {

	private Height_Property_Mapper $mapper;

	public function setUp(): void {
		parent::setUp();
		
		$this->mapper = new Height_Property_Mapper();
	}

	private function create_expected_size_result( $size, string $unit ): array {
		return [
			'$$type' => 'size',
			'value' => [
				'size' => $size,
				'unit' => $unit,
			],
		];
	}

	private function assert_atomic_structure( array $result, string $expected_type ): void {
		$this->assertNotNull( $result );
		$this->assertEquals( $expected_type, $result['$$type'] );
		$this->assertArrayHasKey( 'value', $result );
		$this->assertArrayHasKey( 'size', $result['value'] );
		$this->assertArrayHasKey( 'unit', $result['value'] );
	}

	public function test_supports_height_properties(): void {
		$this->assertTrue( $this->mapper->is_supported_property( 'height' ) );
		$this->assertTrue( $this->mapper->is_supported_property( 'min-height' ) );
		$this->assertTrue( $this->mapper->is_supported_property( 'max-height' ) );
		$this->assertFalse( $this->mapper->is_supported_property( 'width' ) );
		$this->assertFalse( $this->mapper->is_supported_property( 'padding' ) );
	}

	public function test_get_supported_properties(): void {
		$expected_properties = [
			'height',
			'min-height',
			'max-height',
		];
		
		$this->assertEquals( $expected_properties, $this->mapper->get_supported_properties() );
	}

	public function test_pixel_values(): void {
		$test_cases = [
			'integer_pixels' => ['value' => '200px', 'size' => 200.0, 'unit' => 'px'],
			'decimal_pixels' => ['value' => '150.5px', 'size' => 150.5, 'unit' => 'px'],
			'zero_pixels' => ['value' => '0px', 'size' => 0.0, 'unit' => 'px'],
		];

		foreach ( $test_cases as $case_name => $case_data ) {
			$result = $this->mapper->map_to_v4_atomic( 'height', $case_data['value'] );
			
			$this->assert_atomic_structure( $result, 'size' );
			$this->assertEquals( $case_data['size'], $result['value']['size'] );
			$this->assertEquals( $case_data['unit'], $result['value']['unit'] );
		}
	}

	public function test_different_units(): void {
		$test_cases = [
			'em_unit' => ['value' => '10em', 'size' => 10.0, 'unit' => 'em'],
			'rem_unit' => ['value' => '1.5rem', 'size' => 1.5, 'unit' => 'rem'],
			'percentage' => ['value' => '100%', 'size' => 100.0, 'unit' => '%'],
			'viewport_height' => ['value' => '50vh', 'size' => 50.0, 'unit' => 'vh'],
			'viewport_width' => ['value' => '25vw', 'size' => 25.0, 'unit' => 'vw'],
			'viewport_min' => ['value' => '30vmin', 'size' => 30.0, 'unit' => 'vmin'],
			'viewport_max' => ['value' => '40vmax', 'size' => 40.0, 'unit' => 'vmax'],
		];

		foreach ( $test_cases as $case_name => $case_data ) {
			$result = $this->mapper->map_to_v4_atomic( 'height', $case_data['value'] );
			
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
			$result = $this->mapper->map_to_v4_atomic( 'height', $value );
			
			$this->assert_atomic_structure( $result, 'size' );
			$this->assertEquals( '', $result['value']['size'] );
			$this->assertEquals( 'auto', $result['value']['unit'] );
		}
	}

	public function test_unitless_values(): void {
		$result = $this->mapper->map_to_v4_atomic( 'height', '100' );
		
		$this->assert_atomic_structure( $result, 'size' );
		$this->assertEquals( 100.0, $result['value']['size'] );
		$this->assertEquals( 'px', $result['value']['unit'] );
	}

	public function test_all_supported_properties(): void {
		$properties = ['height', 'min-height', 'max-height'];
		
		foreach ( $properties as $property ) {
			$result = $this->mapper->map_to_v4_atomic( $property, '200px' );
			
			$this->assert_atomic_structure( $result, 'size' );
			$this->assertEquals( 200.0, $result['value']['size'] );
			$this->assertEquals( 'px', $result['value']['unit'] );
		}
	}

	public function test_invalid_values(): void {
		$invalid_values = [
			'empty_string' => '',
			'whitespace_only' => '   ',
			'invalid_unit' => '100xyz',
			'unit_without_number' => 'px',
			'invalid_keyword' => 'invalid',
		];

		foreach ( $invalid_values as $case_name => $value ) {
			$result = $this->mapper->map_to_v4_atomic( 'height', $value );
			$this->assertNull( 
				$result, 
				"Should be null for case: $case_name with invalid value: '$value'"
			);
		}
	}

	public function test_unsupported_property(): void {
		$result = $this->mapper->map_to_v4_atomic( 'width', '200px' );
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
			$result = $this->mapper->map_to_v4_atomic( 'height', $value );
			$this->assertNull( 
				$result, 
				"Should be null for $type_name type: " . var_export( $value, true )
			);
		}
	}

	public function test_atomic_widget_compliance(): void {
		$result = $this->mapper->map_to_v4_atomic( 'height', '300px' );
		
		$this->assert_atomic_structure( $result, 'size' );
		
		// Verify exact atomic widget structure
		$this->assertEquals( 'size', $result['$$type'] );
		$this->assertIsArray( $result['value'] );
		$this->assertArrayHasKey( 'size', $result['value'] );
		$this->assertArrayHasKey( 'unit', $result['value'] );
		$this->assertIsNumeric( $result['value']['size'] );
		$this->assertIsString( $result['value']['unit'] );
		$this->assertEquals( 300.0, $result['value']['size'] );
		$this->assertEquals( 'px', $result['value']['unit'] );
	}
}
