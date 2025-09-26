<?php
namespace ElementorCss\Tests\Phpunit\Modules\CssConverter\Convertors\CssProperties\Properties;

use Elementor\Modules\CssConverter\Convertors\CssProperties\Properties\Padding_Property_Mapper;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * PHPUnit Tests for Padding Property Mapper
 * 
 * Tests atomic widget compliance for Dimensions_Prop_Type structure
 * Validates CSS shorthand parsing and logical property mapping
 * 
 * @group css-converter
 * @group padding-mapper
 */
class Test_Padding_Property_Mapper extends Elementor_Test_Base {

	private Padding_Property_Mapper $mapper;

	public function setUp(): void {
		parent::setUp();
		
		$this->mapper = new Padding_Property_Mapper();
	}

	private function create_expected_size_value( $size, string $unit ): array {
		return [
			'$$type' => 'size',
			'value' => [
				'size' => $size,
				'unit' => $unit,
			],
		];
	}

	private function create_expected_dimensions_result( array $dimensions ): array {
		return [
			'block-start' => $dimensions['top'] ?? $dimensions['all'],
			'inline-end' => $dimensions['right'] ?? $dimensions['horizontal'] ?? $dimensions['all'],
			'block-end' => $dimensions['bottom'] ?? $dimensions['top'] ?? $dimensions['all'],
			'inline-start' => $dimensions['left'] ?? $dimensions['horizontal'] ?? $dimensions['all'],
		];
	}

	private function assert_atomic_structure( array $result, string $property, string $expected_type ): void {
		$this->assertNotNull( $result );
		$this->assertEquals( $property, $result['property'] );
		$this->assertEquals( $expected_type, $result['value']['$$type'] );
		$this->assertArrayHasKey( 'value', $result['value'] );
	}

	private function assert_dimensions_values( array $dimensions, array $expected_dimensions, string $message = '' ): void {
		$logical_properties = ['block-start', 'inline-end', 'block-end', 'inline-start'];
		
		foreach ( $logical_properties as $property ) {
			$this->assertArrayHasKey( $property, $dimensions, $message );
			$this->assertEquals( $expected_dimensions[$property], $dimensions[$property], $message );
		}
	}

	public function test_supports_padding_property(): void {
		$this->assertTrue( $this->mapper->supports_property( 'padding' ) );
		$this->assertFalse( $this->mapper->supports_property( 'margin' ) );
		$this->assertFalse( $this->mapper->supports_property( 'border' ) );
	}

	public function test_get_supported_properties(): void {
		$expected_properties = [
			'padding',
		];
		
		$this->assertEquals( $expected_properties, $this->mapper->get_supported_properties() );
	}

	public function test_supports_v4_conversion(): void {
		$valid_cases = [
			'single_value' => ['property' => 'padding', 'value' => '10px'],
			'two_values' => ['property' => 'padding', 'value' => '10px 20px'],
		];
		
		$invalid_cases = [
			'empty_string' => ['property' => 'padding', 'value' => ''],
			'whitespace_only' => ['property' => 'padding', 'value' => '   '],
			'wrong_property' => ['property' => 'margin', 'value' => '10px'],
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

	public function test_single_value_shorthand(): void {
		$result = $this->mapper->map_to_v4_atomic( 'padding', '10px' );
		
		$this->assert_atomic_structure( $result, 'padding', 'dimensions' );
		
		$expected_dimensions = $this->create_expected_dimensions_result([
			'all' => $this->create_expected_size_value( 10.0, 'px' ),
		]);
		
		$this->assert_dimensions_values( $result['value']['value'], $expected_dimensions );
	}

	public function test_two_value_shorthand(): void {
		$result = $this->mapper->map_to_v4_atomic( 'padding', '10px 20px' );
		
		$this->assert_atomic_structure( $result, 'padding', 'dimensions' );
		
		$expected_dimensions = $this->create_expected_dimensions_result([
			'top' => $this->create_expected_size_value( 10.0, 'px' ),
			'horizontal' => $this->create_expected_size_value( 20.0, 'px' ),
		]);
		
		$this->assert_dimensions_values( $result['value']['value'], $expected_dimensions );
	}

	public function test_three_value_shorthand(): void {
		$result = $this->mapper->map_to_v4_atomic( 'padding', '10px 20px 30px' );
		
		$this->assert_atomic_structure( $result, 'padding', 'dimensions' );
		
		$expected_dimensions = $this->create_expected_dimensions_result([
			'top' => $this->create_expected_size_value( 10.0, 'px' ),
			'horizontal' => $this->create_expected_size_value( 20.0, 'px' ),
			'bottom' => $this->create_expected_size_value( 30.0, 'px' ),
		]);
		
		$this->assert_dimensions_values( $result['value']['value'], $expected_dimensions );
	}

	public function test_four_value_shorthand(): void {
		$result = $this->mapper->map_to_v4_atomic( 'padding', '10px 20px 30px 40px' );
		
		$this->assert_atomic_structure( $result, 'padding', 'dimensions' );
		
		$expected_dimensions = $this->create_expected_dimensions_result([
			'top' => $this->create_expected_size_value( 10.0, 'px' ),
			'right' => $this->create_expected_size_value( 20.0, 'px' ),
			'bottom' => $this->create_expected_size_value( 30.0, 'px' ),
			'left' => $this->create_expected_size_value( 40.0, 'px' ),
		]);
		
		$this->assert_dimensions_values( $result['value']['value'], $expected_dimensions );
	}

	public function test_different_units(): void {
		$test_cases = [
			'em_unit' => ['value' => '10em', 'size' => 10.0, 'unit' => 'em'],
			'rem_unit' => ['value' => '1.5rem', 'size' => 1.5, 'unit' => 'rem'],
			'percentage' => ['value' => '50%', 'size' => 50.0, 'unit' => '%'],
			'viewport_height' => ['value' => '100vh', 'size' => 100.0, 'unit' => 'vh'],
			'viewport_width' => ['value' => '25vw', 'size' => 25.0, 'unit' => 'vw'],
			'points' => ['value' => '12pt', 'size' => 12.0, 'unit' => 'pt'],
			'inches' => ['value' => '0.5in', 'size' => 0.5, 'unit' => 'in'],
		];

		foreach ( $test_cases as $case_name => $case_data ) {
			$result = $this->mapper->map_to_v4_atomic( 'padding', $case_data['value'] );
			
			$this->assert_atomic_structure( $result, 'padding', 'dimensions' );
			
			$expected_dimensions = $this->create_expected_dimensions_result([
				'all' => $this->create_expected_size_value( $case_data['size'], $case_data['unit'] ),
			]);
			
			$this->assert_dimensions_values( 
				$result['value']['value'], 
				$expected_dimensions, 
				"Failed for case: $case_name with value: {$case_data['value']}"
			);
		}
	}

	public function test_zero_values(): void {
		$test_cases = [
			'unitless_zero' => '0',
			'zero_pixels' => '0px',
			'zero_em' => '0em',
			'zero_rem' => '0rem',
		];

		foreach ( $test_cases as $case_name => $value ) {
			$result = $this->mapper->map_to_v4_atomic( 'padding', $value );
			
			$this->assert_atomic_structure( $result, 'padding', 'dimensions' );
			
			$expected_dimensions = $this->create_expected_dimensions_result([
				'all' => $this->create_expected_size_value( 0.0, 'px' ),
			]);
			
			$this->assert_dimensions_values( 
				$result['value']['value'], 
				$expected_dimensions, 
				"Failed for case: $case_name with value: $value"
			);
		}
	}

	public function test_css_keywords(): void {
		$keywords = [
			'auto_keyword' => 'auto',
			'inherit_keyword' => 'inherit',
			'initial_keyword' => 'initial',
			'unset_keyword' => 'unset',
			'revert_keyword' => 'revert',
			'revert_layer_keyword' => 'revert-layer',
		];

		foreach ( $keywords as $case_name => $keyword ) {
			$result = $this->mapper->map_to_v4_atomic( 'padding', $keyword );
			
			$this->assert_atomic_structure( $result, 'padding', 'dimensions' );
			
			$expected_dimensions = $this->create_expected_dimensions_result([
				'all' => $this->create_expected_size_value( $keyword, 'custom' ),
			]);
			
			$this->assert_dimensions_values( 
				$result['value']['value'], 
				$expected_dimensions, 
				"Failed for case: $case_name with keyword: $keyword"
			);
		}
	}

	public function test_negative_values(): void {
		$result = $this->mapper->map_to_v4_atomic( 'padding', '-10px' );
		
		$this->assert_atomic_structure( $result, 'padding', 'dimensions' );
		
		$expected_dimensions = $this->create_expected_dimensions_result([
			'all' => $this->create_expected_size_value( -10.0, 'px' ),
		]);
		
		$this->assert_dimensions_values( $result['value']['value'], $expected_dimensions );
	}

	public function test_decimal_values(): void {
		$result = $this->mapper->map_to_v4_atomic( 'padding', '1.5px 2.75em' );
		
		$this->assert_atomic_structure( $result, 'padding', 'dimensions' );
		
		$expected_dimensions = $this->create_expected_dimensions_result([
			'top' => $this->create_expected_size_value( 1.5, 'px' ),
			'horizontal' => $this->create_expected_size_value( 2.75, 'em' ),
		]);
		
		$this->assert_dimensions_values( $result['value']['value'], $expected_dimensions );
	}

	public function test_whitespace_handling(): void {
		$test_cases = [
			'leading_trailing_spaces' => '  10px  ',
			'multiple_spaces_between' => '10px   20px',
			'spaces_around_three_values' => '  10px  20px  30px  ',
			'mixed_whitespace_chars' => "\t10px\n20px\r30px\t40px\n",
		];

		foreach ( $test_cases as $case_name => $value ) {
			$result = $this->mapper->map_to_v4_atomic( 'padding', $value );
			$this->assertNotNull( 
				$result, 
				"Failed for case: $case_name with whitespace value: '$value'"
			);
		}
	}

	public function test_invalid_values(): void {
		$invalid_values = [
			'empty_string' => '',
			'whitespace_only' => '   ',
			'invalid_keyword' => 'invalid',
			'number_without_unit' => '10',
			'unit_without_number' => 'px',
			'too_many_values' => '10px 20px 30px 40px 50px',
			'mixed_keyword_value_1' => 'auto 10px',
			'mixed_keyword_value_2' => '10px auto 20px',
		];

		foreach ( $invalid_values as $case_name => $value ) {
			$result = $this->mapper->map_to_v4_atomic( 'padding', $value );
			$this->assertNull( 
				$result, 
				"Should be null for case: $case_name with invalid value: '$value'"
			);
		}
	}

	public function test_unsupported_property(): void {
		$result = $this->mapper->map_to_v4_atomic( 'margin', '10px' );
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
			$result = $this->mapper->map_to_v4_atomic( 'padding', $value );
			$this->assertNull( 
				$result, 
				"Should be null for $type_name type: " . var_export( $value, true )
			);
		}
	}

	public function test_map_to_schema(): void {
		$result = $this->mapper->map_to_schema( 'padding', '10px 20px' );
		
		$this->assertNotNull( $result );
		$this->assertArrayHasKey( 'padding', $result );
		$this->assertEquals( 'dimensions', $result['padding']['$$type'] );
		
		$expected_dimensions = $this->create_expected_dimensions_result([
			'top' => $this->create_expected_size_value( 10.0, 'px' ),
			'horizontal' => $this->create_expected_size_value( 20.0, 'px' ),
		]);
		
		$this->assert_dimensions_values( $result['padding']['value'], $expected_dimensions );
	}

	public function test_get_v4_property_name(): void {
		$this->assertEquals( 'padding', $this->mapper->get_v4_property_name( 'padding' ) );
	}

	public function test_atomic_widget_compliance(): void {
		$result = $this->mapper->map_to_v4_atomic( 'padding', '10px 20px 30px 40px' );
		
		$this->assert_atomic_structure( $result, 'padding', 'dimensions' );
		
		$dimensions = $result['value']['value'];
		$required_logical_properties = [
			'block-start',
			'inline-end', 
			'block-end',
			'inline-start',
		];
		
		foreach ( $required_logical_properties as $logical_property ) {
			$this->assertArrayHasKey( $logical_property, $dimensions );
			$this->assertArrayHasKey( '$$type', $dimensions[$logical_property] );
			$this->assertArrayHasKey( 'value', $dimensions[$logical_property] );
			$this->assertEquals( 'size', $dimensions[$logical_property]['$$type'] );
			
			$size_value = $dimensions[$logical_property]['value'];
			$this->assertArrayHasKey( 'size', $size_value );
			$this->assertArrayHasKey( 'unit', $size_value );
			$this->assertIsNumeric( $size_value['size'] );
			$this->assertIsString( $size_value['unit'] );
		}
		
		$expected_size_values = [
			'block-start' => ['size' => 10.0, 'unit' => 'px'],
			'inline-end' => ['size' => 20.0, 'unit' => 'px'],
			'block-end' => ['size' => 30.0, 'unit' => 'px'],
			'inline-start' => ['size' => 40.0, 'unit' => 'px'],
		];
		
		foreach ( $expected_size_values as $logical_property => $expected_size ) {
			$this->assertEquals( 
				$expected_size, 
				$dimensions[$logical_property]['value'],
				"Failed atomic compliance for logical property: $logical_property"
			);
		}
	}

	public function test_mixed_units_shorthand(): void {
		$result = $this->mapper->map_to_v4_atomic( 'padding', '10px 2em 30% 1.5rem' );
		
		$this->assert_atomic_structure( $result, 'padding', 'dimensions' );
		
		$expected_dimensions = $this->create_expected_dimensions_result([
			'top' => $this->create_expected_size_value( 10.0, 'px' ),
			'right' => $this->create_expected_size_value( 2.0, 'em' ),
			'bottom' => $this->create_expected_size_value( 30.0, '%' ),
			'left' => $this->create_expected_size_value( 1.5, 'rem' ),
		]);
		
		$this->assert_dimensions_values( $result['value']['value'], $expected_dimensions );
	}
}
