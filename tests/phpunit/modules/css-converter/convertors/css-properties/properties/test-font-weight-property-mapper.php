<?php
namespace ElementorCss\Tests\Phpunit\Modules\CssConverter\Convertors\CssProperties\Properties;

use Elementor\Modules\CssConverter\Convertors\CssProperties\Properties\Font_Weight_Property_Mapper;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * PHPUnit Tests for Font Weight Property Mapper
 * 
 * Tests atomic widget compliance for String_Prop_Type structure with font-weight enum values
 * Validates font-weight property with various weight formats and aliases
 * 
 * @group css-converter
 * @group font-weight-mapper
 */
class Test_Font_Weight_Property_Mapper extends Elementor_Test_Base {

	private Font_Weight_Property_Mapper $mapper;

	public function setUp(): void {
		parent::setUp();
		
		$this->mapper = new Font_Weight_Property_Mapper();
	}

	private function assert_atomic_structure( array $result, string $expected_type, string $expected_value ): void {
		$this->assertNotNull( $result );
		$this->assertEquals( $expected_type, $result['$$type'] );
		$this->assertArrayHasKey( 'value', $result );
		$this->assertEquals( $expected_value, $result['value'] );
	}

	public function test_supports_font_weight_property(): void {
		$this->assertTrue( $this->mapper->supports( 'font-weight' ) );
		$this->assertFalse( $this->mapper->supports( 'font-size' ) );
		$this->assertFalse( $this->mapper->supports( 'font-family' ) );
	}

	public function test_get_supported_properties(): void {
		$expected_properties = [
			'font-weight',
		];
		
		$this->assertEquals( $expected_properties, $this->mapper->get_supported_properties() );
	}

	/**
	 * Test numeric font weight values (100-900)
	 */
	public function test_numeric_font_weights(): void {
		$test_cases = [
			'100' => '100',
			'200' => '200',
			'300' => '300',
			'400' => '400',
			'500' => '500',
			'600' => '600',
			'700' => '700',
			'800' => '800',
			'900' => '900',
		];

		foreach ( $test_cases as $input => $expected ) {
			$result = $this->mapper->map_to_v4_atomic( 'font-weight', $input );
			$this->assert_atomic_structure( $result, 'string', $expected );
		}
	}

	/**
	 * Test keyword font weight values
	 */
	public function test_keyword_font_weights(): void {
		$test_cases = [
			'normal' => 'normal',
			'bold' => 'bold',
			'bolder' => 'bolder',
			'lighter' => 'lighter',
		];

		foreach ( $test_cases as $input => $expected ) {
			$result = $this->mapper->map_to_v4_atomic( 'font-weight', $input );
			$this->assert_atomic_structure( $result, 'string', $expected );
		}
	}

	/**
	 * Test font weight aliases that map to numeric values
	 */
	public function test_font_weight_aliases(): void {
		$test_cases = [
			'thin' => '100',
			'extra-light' => '200',
			'ultra-light' => '200',
			'light' => '300',
			'regular' => '400',
			'medium' => '500',
			'semi-bold' => '600',
			'demi-bold' => '600',
			'extra-bold' => '800',
			'ultra-bold' => '800',
			'black' => '900',
			'heavy' => '900',
		];

		foreach ( $test_cases as $input => $expected ) {
			$result = $this->mapper->map_to_v4_atomic( 'font-weight', $input );
			$this->assert_atomic_structure( $result, 'string', $expected );
		}
	}

	/**
	 * Test numeric values that need rounding
	 */
	public function test_numeric_rounding(): void {
		$test_cases = [
			'150' => '200',  // Rounds to nearest 100
			'250' => '300',
			'350' => '400',
			'450' => '500',
			'550' => '600',
			'650' => '700',
			'750' => '800',
			'850' => '900',
		];

		foreach ( $test_cases as $input => $expected ) {
			$result = $this->mapper->map_to_v4_atomic( 'font-weight', $input );
			$this->assert_atomic_structure( $result, 'string', $expected );
		}
	}

	/**
	 * Test edge cases for numeric values
	 */
	public function test_numeric_edge_cases(): void {
		// Values below 100 should map to 100
		$result = $this->mapper->map_to_v4_atomic( 'font-weight', '50' );
		$this->assert_atomic_structure( $result, 'string', '100' );

		// Values above 900 should map to 900
		$result = $this->mapper->map_to_v4_atomic( 'font-weight', '1000' );
		$this->assert_atomic_structure( $result, 'string', '900' );

		// Exact multiples of 100 should remain unchanged
		$result = $this->mapper->map_to_v4_atomic( 'font-weight', '400' );
		$this->assert_atomic_structure( $result, 'string', '400' );
	}

	/**
	 * Test case insensitivity
	 */
	public function test_case_insensitivity(): void {
		$test_cases = [
			'BOLD' => 'bold',
			'Bold' => 'bold',
			'NORMAL' => 'normal',
			'Normal' => 'normal',
			'THIN' => '100',
			'Thin' => '100',
		];

		foreach ( $test_cases as $input => $expected ) {
			$result = $this->mapper->map_to_v4_atomic( 'font-weight', $input );
			$this->assert_atomic_structure( $result, 'string', $expected );
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
			'1000px',
			'auto',
			'none',
		];

		foreach ( $invalid_values as $invalid_value ) {
			$result = $this->mapper->map_to_v4_atomic( 'font-weight', $invalid_value );
			$this->assertNull( $result, "Expected null for invalid value: {$invalid_value}" );
		}
	}

	/**
	 * Test whitespace handling
	 */
	public function test_whitespace_handling(): void {
		$test_cases = [
			'  bold  ' => 'bold',
			"\tbold\t" => 'bold',
			"\n400\n" => '400',
			'  thin  ' => '100',
		];

		foreach ( $test_cases as $input => $expected ) {
			$result = $this->mapper->map_to_v4_atomic( 'font-weight', $input );
			$this->assert_atomic_structure( $result, 'string', $expected );
		}
	}

	/**
	 * Test atomic widget compliance - String_Prop_Type structure
	 */
	public function test_atomic_widget_compliance(): void {
		$result = $this->mapper->map_to_v4_atomic( 'font-weight', 'bold' );
		
		// Must have atomic structure
		$this->assertIsArray( $result );
		$this->assertArrayHasKey( '$$type', $result );
		$this->assertArrayHasKey( 'value', $result );
		
		// Must use string type for font-weight
		$this->assertEquals( 'string', $result['$$type'] );
		
		// Value must be a string (not numeric)
		$this->assertIsString( $result['value'] );
		$this->assertEquals( 'bold', $result['value'] );
	}

	/**
	 * Test that numeric inputs produce string outputs (atomic compliance)
	 */
	public function test_numeric_input_string_output(): void {
		$result = $this->mapper->map_to_v4_atomic( 'font-weight', '700' );
		
		$this->assertIsArray( $result );
		$this->assertEquals( 'string', $result['$$type'] );
		$this->assertIsString( $result['value'] );
		$this->assertEquals( '700', $result['value'] );
	}
}
