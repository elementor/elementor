<?php
namespace ElementorCss\Tests\Phpunit\Modules\CssConverter\Convertors\CssProperties\Properties;

use Elementor\Modules\CssConverter\Convertors\CssProperties\Properties\Border_Width_Property_Mapper;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * PHPUnit Tests for Border Width Property Mapper
 * 
 * Tests atomic widget compliance for Size_Prop_Type and Border_Width_Prop_Type structures
 * Validates border-width properties with various formats and shorthand values
 * 
 * @group css-converter
 * @group border-width-mapper
 */
class Test_Border_Width_Property_Mapper extends Elementor_Test_Base {

	private Border_Width_Property_Mapper $mapper;

	public function setUp(): void {
		parent::setUp();
		
		$this->mapper = new Border_Width_Property_Mapper();
	}

	private function assert_size_atomic_structure( array $result, string $expected_type, float $expected_size, string $expected_unit ): void {
		$this->assertNotNull( $result );
		$this->assertEquals( $expected_type, $result['$$type'] );
		$this->assertArrayHasKey( 'value', $result );
		$this->assertArrayHasKey( 'size', $result['value'] );
		$this->assertArrayHasKey( 'unit', $result['value'] );
		$this->assertEquals( $expected_size, $result['value']['size'] );
		$this->assertEquals( $expected_unit, $result['value']['unit'] );
	}

	private function assert_border_width_atomic_structure( array $result, string $expected_type ): void {
		$this->assertNotNull( $result );
		$this->assertEquals( $expected_type, $result['$$type'] );
		$this->assertArrayHasKey( 'value', $result );
		$this->assertIsArray( $result['value'] );
	}

	public function test_supports_border_width_properties(): void {
		$supported_properties = [
			'border-width',
			'border-top-width',
			'border-right-width',
			'border-bottom-width',
			'border-left-width',
		];

		foreach ( $supported_properties as $property ) {
			$this->assertTrue( $this->mapper->supports( $property ), "Should support {$property}" );
		}

		$unsupported_properties = [
			'border-color',
			'border-style',
			'width',
			'margin',
		];

		foreach ( $unsupported_properties as $property ) {
			$this->assertFalse( $this->mapper->supports( $property ), "Should not support {$property}" );
		}
	}

	public function test_get_supported_properties(): void {
		$expected_properties = [
			'border-width',
			'border-top-width',
			'border-right-width',
			'border-bottom-width',
			'border-left-width',
		];
		
		$this->assertEquals( $expected_properties, $this->mapper->get_supported_properties() );
	}

	/**
	 * Test single value border-width (should return Size_Prop_Type)
	 */
	public function test_single_value_border_width(): void {
		$test_cases = [
			'2px' => [ 2.0, 'px' ],
			'1em' => [ 1.0, 'em' ],
			'0.5rem' => [ 0.5, 'rem' ],
			'5' => [ 5.0, 'px' ],
		];

		foreach ( $test_cases as $input => $expected ) {
			$result = $this->mapper->map_to_v4_atomic( 'border-width', $input );
			$this->assert_size_atomic_structure( $result, 'size', $expected[0], $expected[1] );
		}
	}

	/**
	 * Test keyword values for border-width
	 */
	public function test_keyword_values(): void {
		$test_cases = [
			'thin' => [ 1.0, 'px' ],
			'medium' => [ 3.0, 'px' ],
			'thick' => [ 5.0, 'px' ],
		];

		foreach ( $test_cases as $input => $expected ) {
			$result = $this->mapper->map_to_v4_atomic( 'border-width', $input );
			$this->assert_size_atomic_structure( $result, 'size', $expected[0], $expected[1] );
		}
	}

	/**
	 * Test shorthand border-width with 2 values (should return Border_Width_Prop_Type)
	 */
	public function test_shorthand_two_values(): void {
		$result = $this->mapper->map_to_v4_atomic( 'border-width', '2px 4px' );
		
		$this->assert_border_width_atomic_structure( $result, 'border-width' );
		
		// Check directional values
		$value = $result['value'];
		$this->assertArrayHasKey( 'block-start', $value );
		$this->assertArrayHasKey( 'inline-end', $value );
		$this->assertArrayHasKey( 'block-end', $value );
		$this->assertArrayHasKey( 'inline-start', $value );
		
		// Verify the pattern: top/bottom = 2px, left/right = 4px
		$this->assertEquals( 'size', $value['block-start']['$$type'] );
		$this->assertEquals( 2.0, $value['block-start']['value']['size'] );
		$this->assertEquals( 'px', $value['block-start']['value']['unit'] );
		
		$this->assertEquals( 'size', $value['inline-end']['$$type'] );
		$this->assertEquals( 4.0, $value['inline-end']['value']['size'] );
		$this->assertEquals( 'px', $value['inline-end']['value']['unit'] );
	}

	/**
	 * Test shorthand border-width with 3 values
	 */
	public function test_shorthand_three_values(): void {
		$result = $this->mapper->map_to_v4_atomic( 'border-width', '1px 2px 3px' );
		
		$this->assert_border_width_atomic_structure( $result, 'border-width' );
		
		$value = $result['value'];
		
		// Verify the pattern: top=1px, left/right=2px, bottom=3px
		$this->assertEquals( 1.0, $value['block-start']['value']['size'] );
		$this->assertEquals( 2.0, $value['inline-end']['value']['size'] );
		$this->assertEquals( 3.0, $value['block-end']['value']['size'] );
		$this->assertEquals( 2.0, $value['inline-start']['value']['size'] );
	}

	/**
	 * Test shorthand border-width with 4 values
	 */
	public function test_shorthand_four_values(): void {
		$result = $this->mapper->map_to_v4_atomic( 'border-width', '1px 2px 3px 4px' );
		
		$this->assert_border_width_atomic_structure( $result, 'border-width' );
		
		$value = $result['value'];
		
		// Verify the pattern: top=1px, right=2px, bottom=3px, left=4px
		$this->assertEquals( 1.0, $value['block-start']['value']['size'] );
		$this->assertEquals( 2.0, $value['inline-end']['value']['size'] );
		$this->assertEquals( 3.0, $value['block-end']['value']['size'] );
		$this->assertEquals( 4.0, $value['inline-start']['value']['size'] );
	}

	/**
	 * Test individual border width properties
	 */
	public function test_individual_border_width_properties(): void {
		$test_cases = [
			'border-top-width' => 'block-start',
			'border-right-width' => 'inline-end',
			'border-bottom-width' => 'block-end',
			'border-left-width' => 'inline-start',
		];

		foreach ( $test_cases as $property => $expected_direction ) {
			$result = $this->mapper->map_to_v4_atomic( $property, '2px' );
			
			$this->assert_border_width_atomic_structure( $result, 'border-width' );
			
			$value = $result['value'];
			$this->assertArrayHasKey( $expected_direction, $value );
			$this->assertEquals( 'size', $value[$expected_direction]['$$type'] );
			$this->assertEquals( 2.0, $value[$expected_direction]['value']['size'] );
			$this->assertEquals( 'px', $value[$expected_direction]['value']['unit'] );
		}
	}

	/**
	 * Test mixed units in shorthand
	 */
	public function test_mixed_units_shorthand(): void {
		$result = $this->mapper->map_to_v4_atomic( 'border-width', '1px 2em 3% 4rem' );
		
		$this->assert_border_width_atomic_structure( $result, 'border-width' );
		
		$value = $result['value'];
		
		// Verify different units are preserved
		$this->assertEquals( 'px', $value['block-start']['value']['unit'] );
		$this->assertEquals( 'em', $value['inline-end']['value']['unit'] );
		$this->assertEquals( '%', $value['block-end']['value']['unit'] );
		$this->assertEquals( 'rem', $value['inline-start']['value']['unit'] );
	}

	/**
	 * Test negative values return null
	 */
	public function test_negative_values_return_null(): void {
		$negative_values = [
			'-1px',
			'2px -1px',
			'-1px 2px 3px 4px',
		];

		foreach ( $negative_values as $negative_value ) {
			$result = $this->mapper->map_to_v4_atomic( 'border-width', $negative_value );
			$this->assertNull( $result, "Expected null for negative value: {$negative_value}" );
		}
	}

	/**
	 * Test invalid values return null
	 */
	public function test_invalid_values_return_null(): void {
		$invalid_values = [
			'',
			'   ',
			'inherit',
			'initial',
			'unset',
			'invalid',
			'1px invalid',
			'auto',
		];

		foreach ( $invalid_values as $invalid_value ) {
			$result = $this->mapper->map_to_v4_atomic( 'border-width', $invalid_value );
			$this->assertNull( $result, "Expected null for invalid value: {$invalid_value}" );
		}
	}

	/**
	 * Test whitespace handling in shorthand
	 */
	public function test_whitespace_handling(): void {
		$test_cases = [
			'  1px  2px  ' => 'border-width',
			"\t1px\t2px\t3px\t" => 'border-width',
			"\n1px\n" => 'size',  // Single value
		];

		foreach ( $test_cases as $input => $expected_type ) {
			$result = $this->mapper->map_to_v4_atomic( 'border-width', $input );
			$this->assertNotNull( $result );
			$this->assertEquals( $expected_type, $result['$$type'] );
		}
	}

	/**
	 * Test atomic widget compliance for Size_Prop_Type (single values)
	 */
	public function test_size_atomic_widget_compliance(): void {
		$result = $this->mapper->map_to_v4_atomic( 'border-width', '2px' );
		
		// Must have atomic structure
		$this->assertIsArray( $result );
		$this->assertArrayHasKey( '$$type', $result );
		$this->assertArrayHasKey( 'value', $result );
		
		// Must use size type for single values
		$this->assertEquals( 'size', $result['$$type'] );
		
		// Value must have size and unit
		$this->assertIsArray( $result['value'] );
		$this->assertArrayHasKey( 'size', $result['value'] );
		$this->assertArrayHasKey( 'unit', $result['value'] );
	}

	/**
	 * Test atomic widget compliance for Border_Width_Prop_Type (multiple values)
	 */
	public function test_border_width_atomic_widget_compliance(): void {
		$result = $this->mapper->map_to_v4_atomic( 'border-width', '1px 2px' );
		
		// Must have atomic structure
		$this->assertIsArray( $result );
		$this->assertArrayHasKey( '$$type', $result );
		$this->assertArrayHasKey( 'value', $result );
		
		// Must use border-width type for multiple values
		$this->assertEquals( 'border-width', $result['$$type'] );
		
		// Value must have directional properties
		$this->assertIsArray( $result['value'] );
		$expected_directions = [ 'block-start', 'inline-end', 'block-end', 'inline-start' ];
		
		foreach ( $expected_directions as $direction ) {
			$this->assertArrayHasKey( $direction, $result['value'] );
			$this->assertEquals( 'size', $result['value'][$direction]['$$type'] );
			$this->assertArrayHasKey( 'value', $result['value'][$direction] );
		}
	}

	/**
	 * Test zero values are handled correctly
	 */
	public function test_zero_values(): void {
		$test_cases = [
			'0' => [ 0.0, 'px' ],
			'0px' => [ 0.0, 'px' ],
			'0em' => [ 0.0, 'em' ],
		];

		foreach ( $test_cases as $input => $expected ) {
			$result = $this->mapper->map_to_v4_atomic( 'border-width', $input );
			$this->assert_size_atomic_structure( $result, 'size', $expected[0], $expected[1] );
		}
	}
}
