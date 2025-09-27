<?php
namespace ElementorCss\Tests\Phpunit\Modules\CssConverter\Convertors\CssProperties\Properties;

use Elementor\Modules\CssConverter\Convertors\CssProperties\Properties\Max_Width_Property_Mapper;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * PHPUnit Tests for Max Width Property Mapper
 * 
 * Tests atomic widget compliance for Size_Prop_Type structure with size units
 * Validates max-width property with various size formats
 * 
 * @group css-converter
 * @group max-width-mapper
 */
class Test_Max_Width_Property_Mapper extends Elementor_Test_Base {

	private Max_Width_Property_Mapper $mapper;

	public function setUp(): void {
		parent::setUp();
		
		$this->mapper = new Max_Width_Property_Mapper();
	}

	private function assert_atomic_structure( array $result, string $expected_type, float $expected_size, string $expected_unit ): void {
		$this->assertNotNull( $result );
		$this->assertEquals( $expected_type, $result['$$type'] );
		$this->assertArrayHasKey( 'value', $result );
		$this->assertArrayHasKey( 'size', $result['value'] );
		$this->assertArrayHasKey( 'unit', $result['value'] );
		$this->assertEquals( $expected_size, $result['value']['size'] );
		$this->assertEquals( $expected_unit, $result['value']['unit'] );
	}

	public function test_supports_max_width_property(): void {
		$this->assertTrue( $this->mapper->supports( 'max-width' ) );
		$this->assertFalse( $this->mapper->supports( 'width' ) );
		$this->assertFalse( $this->mapper->supports( 'min-width' ) );
	}

	public function test_get_supported_properties(): void {
		$expected_properties = [
			'max-width',
		];
		
		$this->assertEquals( $expected_properties, $this->mapper->get_supported_properties() );
	}

	/**
	 * Test pixel values
	 */
	public function test_pixel_values(): void {
		$test_cases = [
			'100px' => [ 100.0, 'px' ],
			'500px' => [ 500.0, 'px' ],
			'1200px' => [ 1200.0, 'px' ],
			'0px' => [ 0.0, 'px' ],
		];

		foreach ( $test_cases as $input => $expected ) {
			$result = $this->mapper->map_to_v4_atomic( 'max-width', $input );
			$this->assert_atomic_structure( $result, 'size', $expected[0], $expected[1] );
		}
	}

	/**
	 * Test percentage values
	 */
	public function test_percentage_values(): void {
		$test_cases = [
			'50%' => [ 50.0, '%' ],
			'100%' => [ 100.0, '%' ],
			'75.5%' => [ 75.5, '%' ],
			'0%' => [ 0.0, '%' ],
		];

		foreach ( $test_cases as $input => $expected ) {
			$result = $this->mapper->map_to_v4_atomic( 'max-width', $input );
			$this->assert_atomic_structure( $result, 'size', $expected[0], $expected[1] );
		}
	}

	/**
	 * Test em and rem values
	 */
	public function test_em_rem_values(): void {
		$test_cases = [
			'2em' => [ 2.0, 'em' ],
			'1.5rem' => [ 1.5, 'rem' ],
			'10em' => [ 10.0, 'em' ],
			'0.5rem' => [ 0.5, 'rem' ],
		];

		foreach ( $test_cases as $input => $expected ) {
			$result = $this->mapper->map_to_v4_atomic( 'max-width', $input );
			$this->assert_atomic_structure( $result, 'size', $expected[0], $expected[1] );
		}
	}

	/**
	 * Test viewport units
	 */
	public function test_viewport_units(): void {
		$test_cases = [
			'50vw' => [ 50.0, 'vw' ],
			'100vh' => [ 100.0, 'vh' ],
			'25vmin' => [ 25.0, 'vmin' ],
			'75vmax' => [ 75.0, 'vmax' ],
		];

		foreach ( $test_cases as $input => $expected ) {
			$result = $this->mapper->map_to_v4_atomic( 'max-width', $input );
			$this->assert_atomic_structure( $result, 'size', $expected[0], $expected[1] );
		}
	}

	/**
	 * Test character units
	 */
	public function test_character_units(): void {
		$test_cases = [
			'20ch' => [ 20.0, 'ch' ],
			'5ex' => [ 5.0, 'ex' ],
		];

		foreach ( $test_cases as $input => $expected ) {
			$result = $this->mapper->map_to_v4_atomic( 'max-width', $input );
			$this->assert_atomic_structure( $result, 'size', $expected[0], $expected[1] );
		}
	}

	/**
	 * Test unitless numeric values (should default to px)
	 */
	public function test_unitless_numeric_values(): void {
		$test_cases = [
			'100' => [ 100.0, 'px' ],
			'500' => [ 500.0, 'px' ],
			'0' => [ 0.0, 'px' ],
		];

		foreach ( $test_cases as $input => $expected ) {
			$result = $this->mapper->map_to_v4_atomic( 'max-width', $input );
			$this->assert_atomic_structure( $result, 'size', $expected[0], $expected[1] );
		}
	}

	/**
	 * Test decimal values
	 */
	public function test_decimal_values(): void {
		$test_cases = [
			'100.5px' => [ 100.5, 'px' ],
			'50.25%' => [ 50.25, '%' ],
			'1.75em' => [ 1.75, 'em' ],
		];

		foreach ( $test_cases as $input => $expected ) {
			$result = $this->mapper->map_to_v4_atomic( 'max-width', $input );
			$this->assert_atomic_structure( $result, 'size', $expected[0], $expected[1] );
		}
	}

	/**
	 * Test negative values return null (max-width cannot be negative)
	 */
	public function test_negative_values_return_null(): void {
		$negative_values = [
			'-100px',
			'-50%',
			'-1em',
			'-10',
		];

		foreach ( $negative_values as $negative_value ) {
			$result = $this->mapper->map_to_v4_atomic( 'max-width', $negative_value );
			$this->assertNull( $result, "Expected null for negative value: {$negative_value}" );
		}
	}

	/**
	 * Test special values return null
	 */
	public function test_special_values_return_null(): void {
		$special_values = [
			'none',      // max-width: none is valid CSS but we return null
			'inherit',
			'initial',
			'unset',
			'auto',
		];

		foreach ( $special_values as $special_value ) {
			$result = $this->mapper->map_to_v4_atomic( 'max-width', $special_value );
			$this->assertNull( $result, "Expected null for special value: {$special_value}" );
		}
	}

	/**
	 * Test invalid values return null
	 */
	public function test_invalid_values_return_null(): void {
		$invalid_values = [
			'',
			'   ',
			'invalid',
			'100invalid',
			'px100',
			'abc',
		];

		foreach ( $invalid_values as $invalid_value ) {
			$result = $this->mapper->map_to_v4_atomic( 'max-width', $invalid_value );
			$this->assertNull( $result, "Expected null for invalid value: {$invalid_value}" );
		}
	}

	/**
	 * Test whitespace handling
	 */
	public function test_whitespace_handling(): void {
		$test_cases = [
			'  100px  ' => [ 100.0, 'px' ],
			"\t50%\t" => [ 50.0, '%' ],
			"\n2em\n" => [ 2.0, 'em' ],
		];

		foreach ( $test_cases as $input => $expected ) {
			$result = $this->mapper->map_to_v4_atomic( 'max-width', $input );
			$this->assert_atomic_structure( $result, 'size', $expected[0], $expected[1] );
		}
	}

	/**
	 * Test case insensitivity for units
	 */
	public function test_case_insensitive_units(): void {
		$test_cases = [
			'100PX' => [ 100.0, 'px' ],
			'50EM' => [ 50.0, 'em' ],
			'25REM' => [ 25.0, 'rem' ],
			'75VW' => [ 75.0, 'vw' ],
		];

		foreach ( $test_cases as $input => $expected ) {
			$result = $this->mapper->map_to_v4_atomic( 'max-width', $input );
			$this->assert_atomic_structure( $result, 'size', $expected[0], $expected[1] );
		}
	}

	/**
	 * Test atomic widget compliance - Size_Prop_Type structure
	 */
	public function test_atomic_widget_compliance(): void {
		$result = $this->mapper->map_to_v4_atomic( 'max-width', '500px' );
		
		// Must have atomic structure
		$this->assertIsArray( $result );
		$this->assertArrayHasKey( '$$type', $result );
		$this->assertArrayHasKey( 'value', $result );
		
		// Must use size type for max-width
		$this->assertEquals( 'size', $result['$$type'] );
		
		// Value must have size and unit
		$this->assertIsArray( $result['value'] );
		$this->assertArrayHasKey( 'size', $result['value'] );
		$this->assertArrayHasKey( 'unit', $result['value'] );
		
		// Size must be numeric, unit must be string
		$this->assertIsNumeric( $result['value']['size'] );
		$this->assertIsString( $result['value']['unit'] );
	}

	/**
	 * Test that zero values are handled correctly
	 */
	public function test_zero_values(): void {
		$test_cases = [
			'0px' => [ 0.0, 'px' ],
			'0%' => [ 0.0, '%' ],
			'0em' => [ 0.0, 'em' ],
			'0' => [ 0.0, 'px' ],
		];

		foreach ( $test_cases as $input => $expected ) {
			$result = $this->mapper->map_to_v4_atomic( 'max-width', $input );
			$this->assert_atomic_structure( $result, 'size', $expected[0], $expected[1] );
		}
	}
}
