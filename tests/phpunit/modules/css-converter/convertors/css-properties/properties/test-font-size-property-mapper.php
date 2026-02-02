<?php
namespace ElementorCss\Tests\Phpunit\Modules\CssConverter\Convertors\CssProperties\Properties;

use Elementor\Modules\CssConverter\Convertors\CssProperties\Properties\Font_Size_Property_Mapper;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * PHPUnit Tests for Font Size Property Mapper
 * 
 * Tests atomic widget compliance for Size_Prop_Type structure with typography units
 * Validates font-size property with various size formats
 * 
 * @group css-converter
 * @group font-size-mapper
 */
class Test_Font_Size_Property_Mapper extends Elementor_Test_Base {

	private Font_Size_Property_Mapper $mapper;

	public function setUp(): void {
		parent::setUp();
		
		$this->mapper = new Font_Size_Property_Mapper();
	}

	private function assert_atomic_structure( array $result, string $expected_type ): void {
		$this->assertNotNull( $result );
		$this->assertEquals( $expected_type, $result['$$type'] );
		$this->assertArrayHasKey( 'value', $result );
		$this->assertArrayHasKey( 'size', $result['value'] );
		$this->assertArrayHasKey( 'unit', $result['value'] );
	}

	public function test_supports_font_size_property(): void {
		$this->assertTrue( $this->mapper->is_supported_property( 'font-size' ) );
		$this->assertFalse( $this->mapper->is_supported_property( 'font-weight' ) );
		$this->assertFalse( $this->mapper->is_supported_property( 'line-height' ) );
	}

	public function test_get_supported_properties(): void {
		$expected_properties = [
			'font-size',
		];
		
		$this->assertEquals( $expected_properties, $this->mapper->get_supported_properties() );
	}

	public function test_pixel_values(): void {
		$test_cases = [
			'small_font' => ['value' => '12px', 'size' => 12.0, 'unit' => 'px'],
			'medium_font' => ['value' => '16px', 'size' => 16.0, 'unit' => 'px'],
			'large_font' => ['value' => '24px', 'size' => 24.0, 'unit' => 'px'],
			'decimal_pixels' => ['value' => '14.5px', 'size' => 14.5, 'unit' => 'px'],
			'zero_pixels' => ['value' => '0px', 'size' => 0.0, 'unit' => 'px'],
		];

		foreach ( $test_cases as $case_name => $case_data ) {
			$result = $this->mapper->map_to_v4_atomic( 'font-size', $case_data['value'] );
			
			$this->assert_atomic_structure( $result, 'size' );
			$this->assertEquals( $case_data['size'], $result['value']['size'] );
			$this->assertEquals( $case_data['unit'], $result['value']['unit'] );
		}
	}

	public function test_typography_units(): void {
		$test_cases = [
			'em_unit' => ['value' => '1.5em', 'size' => 1.5, 'unit' => 'em'],
			'rem_unit' => ['value' => '1.2rem', 'size' => 1.2, 'unit' => 'rem'],
			'percentage' => ['value' => '120%', 'size' => 120.0, 'unit' => '%'],
			'viewport_width' => ['value' => '4vw', 'size' => 4.0, 'unit' => 'vw'],
			'viewport_height' => ['value' => '3vh', 'size' => 3.0, 'unit' => 'vh'],
			'viewport_min' => ['value' => '2vmin', 'size' => 2.0, 'unit' => 'vmin'],
			'viewport_max' => ['value' => '2vmax', 'size' => 2.0, 'unit' => 'vmax'],
		];

		foreach ( $test_cases as $case_name => $case_data ) {
			$result = $this->mapper->map_to_v4_atomic( 'font-size', $case_data['value'] );
			
			$this->assert_atomic_structure( $result, 'size' );
			$this->assertEquals( $case_data['size'], $result['value']['size'] );
			$this->assertEquals( $case_data['unit'], $result['value']['unit'] );
		}
	}

	public function test_named_font_sizes(): void {
		$named_sizes = [
			'xx-small' => 'xx-small',
			'x-small' => 'x-small',
			'small' => 'small',
			'medium' => 'medium',
			'large' => 'large',
			'x-large' => 'x-large',
			'xx-large' => 'xx-large',
			'xxx-large' => 'xxx-large',
			'smaller' => 'smaller',
			'larger' => 'larger',
		];

		foreach ( $named_sizes as $named_size => $expected_value ) {
			$result = $this->mapper->map_to_v4_atomic( 'font-size', $named_size );
			
			$this->assert_atomic_structure( $result, 'size' );
			$this->assertEquals( $expected_value, $result['value']['size'] );
			$this->assertEquals( 'custom', $result['value']['unit'] );
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
			$result = $this->mapper->map_to_v4_atomic( 'font-size', $keyword );
			
			$this->assert_atomic_structure( $result, 'size' );
			$this->assertEquals( $keyword, $result['value']['size'] );
			$this->assertEquals( 'custom', $result['value']['unit'] );
		}
	}

	public function test_unitless_values(): void {
		$result = $this->mapper->map_to_v4_atomic( 'font-size', '16' );
		
		$this->assert_atomic_structure( $result, 'size' );
		$this->assertEquals( 16.0, $result['value']['size'] );
		$this->assertEquals( 'px', $result['value']['unit'] );
	}

	public function test_whitespace_handling(): void {
		$whitespace_values = [
			'  16px  ',
			"\t1.5em\n",
			' medium ',
			'  120%  ',
		];

		$expected_values = [
			['size' => 16.0, 'unit' => 'px'],
			['size' => 1.5, 'unit' => 'em'],
			['size' => 'medium', 'unit' => 'custom'],
			['size' => 120.0, 'unit' => '%'],
		];

		foreach ( $whitespace_values as $index => $value ) {
			$result = $this->mapper->map_to_v4_atomic( 'font-size', $value );
			
			$this->assert_atomic_structure( $result, 'size' );
			$this->assertEquals( $expected_values[$index]['size'], $result['value']['size'] );
			$this->assertEquals( $expected_values[$index]['unit'], $result['value']['unit'] );
		}
	}

	public function test_invalid_values(): void {
		$invalid_values = [
			'empty_string' => '',
			'whitespace_only' => '   ',
			'invalid_unit' => '16xyz',
			'unit_without_number' => 'px',
			'invalid_keyword' => 'invalid',
			'negative_value' => '-16px',
		];

		foreach ( $invalid_values as $case_name => $value ) {
			$result = $this->mapper->map_to_v4_atomic( 'font-size', $value );
			$this->assertNull( 
				$result, 
				"Should be null for case: $case_name with invalid value: '$value'"
			);
		}
	}

	public function test_unsupported_property(): void {
		$result = $this->mapper->map_to_v4_atomic( 'font-weight', '16px' );
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
			$result = $this->mapper->map_to_v4_atomic( 'font-size', $value );
			$this->assertNull( 
				$result, 
				"Should be null for $type_name type: " . var_export( $value, true )
			);
		}
	}

	public function test_atomic_widget_compliance(): void {
		$result = $this->mapper->map_to_v4_atomic( 'font-size', '18px' );
		
		$this->assert_atomic_structure( $result, 'size' );
		
		// Verify exact atomic widget structure
		$this->assertEquals( 'size', $result['$$type'] );
		$this->assertIsArray( $result['value'] );
		$this->assertArrayHasKey( 'size', $result['value'] );
		$this->assertArrayHasKey( 'unit', $result['value'] );
		$this->assertIsNumeric( $result['value']['size'] );
		$this->assertIsString( $result['value']['unit'] );
		$this->assertEquals( 18.0, $result['value']['size'] );
		$this->assertEquals( 'px', $result['value']['unit'] );
	}

	public function test_typography_unit_support(): void {
		// Test units specifically supported by typography according to Size_Constants::typography()
		$typography_units = [
			'px' => ['value' => '16px', 'size' => 16.0, 'unit' => 'px'],
			'em' => ['value' => '1em', 'size' => 1.0, 'unit' => 'em'],
			'rem' => ['value' => '1rem', 'size' => 1.0, 'unit' => 'rem'],
			'%' => ['value' => '100%', 'size' => 100.0, 'unit' => '%'],
			'vw' => ['value' => '2vw', 'size' => 2.0, 'unit' => 'vw'],
			'vh' => ['value' => '2vh', 'size' => 2.0, 'unit' => 'vh'],
		];

		foreach ( $typography_units as $unit_name => $case_data ) {
			$result = $this->mapper->map_to_v4_atomic( 'font-size', $case_data['value'] );
			
			$this->assertNotNull( $result, "Failed for typography unit: $unit_name" );
			$this->assert_atomic_structure( $result, 'size' );
			$this->assertEquals( $case_data['size'], $result['value']['size'] );
			$this->assertEquals( $case_data['unit'], $result['value']['unit'] );
		}
	}
}
