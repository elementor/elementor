<?php
namespace ElementorCss\Tests\Phpunit\Modules\CssConverter\Convertors\CssProperties\Properties;

use Elementor\Modules\CssConverter\Convertors\CssProperties\Properties\Opacity_Property_Mapper;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * PHPUnit Tests for Opacity Property Mapper
 * 
 * Tests atomic widget compliance for Size_Prop_Type structure with percentage units
 * Validates opacity property with decimal and percentage values
 * 
 * @group css-converter
 * @group opacity-mapper
 */
class Test_Opacity_Property_Mapper extends Elementor_Test_Base {

	private Opacity_Property_Mapper $mapper;

	public function setUp(): void {
		parent::setUp();
		
		$this->mapper = new Opacity_Property_Mapper();
	}

	private function assert_atomic_structure( array $result, string $expected_type ): void {
		$this->assertNotNull( $result );
		$this->assertEquals( $expected_type, $result['$$type'] );
		$this->assertArrayHasKey( 'value', $result );
		$this->assertArrayHasKey( 'size', $result['value'] );
		$this->assertArrayHasKey( 'unit', $result['value'] );
	}

	public function test_supports_opacity_property(): void {
		$this->assertTrue( $this->mapper->is_supported_property( 'opacity' ) );
		$this->assertFalse( $this->mapper->is_supported_property( 'visibility' ) );
		$this->assertFalse( $this->mapper->is_supported_property( 'filter' ) );
	}

	public function test_get_supported_properties(): void {
		$expected_properties = [
			'opacity',
		];
		
		$this->assertEquals( $expected_properties, $this->mapper->get_supported_properties() );
	}

	public function test_decimal_values(): void {
		$test_cases = [
			'full_opacity' => ['value' => '1', 'size' => 100.0, 'unit' => '%'],
			'half_opacity' => ['value' => '0.5', 'size' => 50.0, 'unit' => '%'],
			'quarter_opacity' => ['value' => '0.25', 'size' => 25.0, 'unit' => '%'],
			'three_quarters' => ['value' => '0.75', 'size' => 75.0, 'unit' => '%'],
			'zero_opacity' => ['value' => '0', 'size' => 0.0, 'unit' => '%'],
			'decimal_precision' => ['value' => '0.123', 'size' => 12.3, 'unit' => '%'],
		];

		foreach ( $test_cases as $case_name => $case_data ) {
			$result = $this->mapper->map_to_v4_atomic( 'opacity', $case_data['value'] );
			
			$this->assert_atomic_structure( $result, 'size' );
			$this->assertEquals( $case_data['size'], $result['value']['size'] );
			$this->assertEquals( $case_data['unit'], $result['value']['unit'] );
		}
	}

	public function test_percentage_values(): void {
		$test_cases = [
			'full_percentage' => ['value' => '100%', 'size' => 100.0, 'unit' => '%'],
			'half_percentage' => ['value' => '50%', 'size' => 50.0, 'unit' => '%'],
			'quarter_percentage' => ['value' => '25%', 'size' => 25.0, 'unit' => '%'],
			'zero_percentage' => ['value' => '0%', 'size' => 0.0, 'unit' => '%'],
			'decimal_percentage' => ['value' => '33.5%', 'size' => 33.5, 'unit' => '%'],
		];

		foreach ( $test_cases as $case_name => $case_data ) {
			$result = $this->mapper->map_to_v4_atomic( 'opacity', $case_data['value'] );
			
			$this->assert_atomic_structure( $result, 'size' );
			$this->assertEquals( $case_data['size'], $result['value']['size'] );
			$this->assertEquals( $case_data['unit'], $result['value']['unit'] );
		}
	}

	public function test_edge_case_values(): void {
		$test_cases = [
			'over_one' => ['value' => '1.5', 'size' => 150.0, 'unit' => '%'],
			'negative' => ['value' => '-0.5', 'size' => -50.0, 'unit' => '%'],
			'very_small' => ['value' => '0.001', 'size' => 0.1, 'unit' => '%'],
			'integer_zero' => ['value' => '0', 'size' => 0.0, 'unit' => '%'],
			'integer_one' => ['value' => '1', 'size' => 100.0, 'unit' => '%'],
		];

		foreach ( $test_cases as $case_name => $case_data ) {
			$result = $this->mapper->map_to_v4_atomic( 'opacity', $case_data['value'] );
			
			$this->assert_atomic_structure( $result, 'size' );
			$this->assertEquals( $case_data['size'], $result['value']['size'] );
			$this->assertEquals( $case_data['unit'], $result['value']['unit'] );
		}
	}

	public function test_css_keywords(): void {
		$keywords = [
			'inherit',
			'initial',
			'unset',
			'revert',
		];

		foreach ( $keywords as $keyword ) {
			$result = $this->mapper->map_to_v4_atomic( 'opacity', $keyword );
			
			$this->assert_atomic_structure( $result, 'size' );
			$this->assertEquals( $keyword, $result['value']['size'] );
			$this->assertEquals( 'custom', $result['value']['unit'] );
		}
	}

	public function test_whitespace_handling(): void {
		$whitespace_values = [
			'  1  ',
			"\t0.5\n",
			' 50% ',
			'  0.75  ',
		];

		$expected_values = [
			['size' => 100.0, 'unit' => '%'],
			['size' => 50.0, 'unit' => '%'],
			['size' => 50.0, 'unit' => '%'],
			['size' => 75.0, 'unit' => '%'],
		];

		foreach ( $whitespace_values as $index => $value ) {
			$result = $this->mapper->map_to_v4_atomic( 'opacity', $value );
			
			$this->assert_atomic_structure( $result, 'size' );
			$this->assertEquals( $expected_values[$index]['size'], $result['value']['size'] );
			$this->assertEquals( $expected_values[$index]['unit'], $result['value']['unit'] );
		}
	}

	public function test_invalid_values(): void {
		$invalid_values = [
			'empty_string' => '',
			'whitespace_only' => '   ',
			'invalid_unit' => '50px',
			'invalid_format' => 'opacity',
			'invalid_keyword' => 'visible',
			'text_value' => 'half',
		];

		foreach ( $invalid_values as $case_name => $value ) {
			$result = $this->mapper->map_to_v4_atomic( 'opacity', $value );
			$this->assertNull( 
				$result, 
				"Should be null for case: $case_name with invalid value: '$value'"
			);
		}
	}

	public function test_unsupported_property(): void {
		$result = $this->mapper->map_to_v4_atomic( 'visibility', '0.5' );
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
			$result = $this->mapper->map_to_v4_atomic( 'opacity', $value );
			$this->assertNull( 
				$result, 
				"Should be null for $type_name type: " . var_export( $value, true )
			);
		}
	}

	public function test_atomic_widget_compliance(): void {
		$result = $this->mapper->map_to_v4_atomic( 'opacity', '0.8' );
		
		$this->assert_atomic_structure( $result, 'size' );
		
		// Verify exact atomic widget structure
		$this->assertEquals( 'size', $result['$$type'] );
		$this->assertIsArray( $result['value'] );
		$this->assertArrayHasKey( 'size', $result['value'] );
		$this->assertArrayHasKey( 'unit', $result['value'] );
		$this->assertIsNumeric( $result['value']['size'] );
		$this->assertIsString( $result['value']['unit'] );
		$this->assertEquals( 80.0, $result['value']['size'] );
		$this->assertEquals( '%', $result['value']['unit'] );
	}

	public function test_decimal_to_percentage_conversion(): void {
		$conversion_cases = [
			'0' => 0.0,
			'0.1' => 10.0,
			'0.25' => 25.0,
			'0.5' => 50.0,
			'0.75' => 75.0,
			'1' => 100.0,
			'1.5' => 150.0,
		];

		foreach ( $conversion_cases as $decimal_input => $expected_percentage ) {
			$result = $this->mapper->map_to_v4_atomic( 'opacity', $decimal_input );
			
			$this->assert_atomic_structure( $result, 'size' );
			$this->assertEquals( $expected_percentage, $result['value']['size'] );
			$this->assertEquals( '%', $result['value']['unit'] );
		}
	}

	public function test_percentage_passthrough(): void {
		$percentage_cases = [
			'0%' => 0.0,
			'25%' => 25.0,
			'50%' => 50.0,
			'75%' => 75.0,
			'100%' => 100.0,
			'150%' => 150.0,
		];

		foreach ( $percentage_cases as $percentage_input => $expected_value ) {
			$result = $this->mapper->map_to_v4_atomic( 'opacity', $percentage_input );
			
			$this->assert_atomic_structure( $result, 'size' );
			$this->assertEquals( $expected_value, $result['value']['size'] );
			$this->assertEquals( '%', $result['value']['unit'] );
		}
	}
}
