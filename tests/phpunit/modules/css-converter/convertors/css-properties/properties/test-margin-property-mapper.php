<?php
namespace ElementorCss\Tests\Phpunit\Modules\CssConverter\Convertors\CssProperties\Properties;

use Elementor\Modules\CssConverter\Convertors\CssProperties\Properties\Margin_Property_Mapper;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * PHPUnit Tests for Margin Property Mapper
 * 
 * Tests comprehensive margin property support including:
 * - Negative values: margin: -20px, margin-top: -10px
 * - Shorthand syntax: margin: 20px 30px, margin: 10px 20px 30px 40px
 * - Logical properties: margin-inline: 10px, margin-block: 15px
 * - Logical shorthand: margin-inline: 10px 30px, margin-block: 10px 25px
 * - Individual logical: margin-inline-start: -20px, margin-block-end: -25px
 * - CSS keywords: margin: auto, margin-top: inherit
 * - Mixed units: margin: 1em 2rem 3% 4vw
 * - Atomic widget compliance with Dimensions_Prop_Type structure
 * 
 * @group css-converter
 * @group margin-mapper
 */
class Test_Margin_Property_Mapper extends Elementor_Test_Base {

	private Margin_Property_Mapper $mapper;

	public function setUp(): void {
		parent::setUp();
		
		$this->mapper = new Margin_Property_Mapper();
	}

	private function assert_dimensions_structure( array $result ): void {
		$this->assertNotNull( $result );
		$this->assertEquals( 'dimensions', $result['$$type'] );
		$this->assertArrayHasKey( 'value', $result );
		
		$dimensions = $result['value'];
		$this->assertArrayHasKey( 'block-start', $dimensions );
		$this->assertArrayHasKey( 'inline-end', $dimensions );
		$this->assertArrayHasKey( 'block-end', $dimensions );
		$this->assertArrayHasKey( 'inline-start', $dimensions );
		
		// Each dimension should be a Size_Prop_Type structure
		foreach ( $dimensions as $dimension ) {
			$this->assertEquals( 'size', $dimension['$$type'] );
			$this->assertArrayHasKey( 'value', $dimension );
			$this->assertArrayHasKey( 'size', $dimension['value'] );
			$this->assertArrayHasKey( 'unit', $dimension['value'] );
		}
	}

	private function assert_size_value( array $dimension, $expected_size, string $expected_unit ): void {
		$this->assertEquals( 'size', $dimension['$$type'] );
		$this->assertEquals( $expected_size, $dimension['value']['size'] );
		$this->assertEquals( $expected_unit, $dimension['value']['unit'] );
	}

	public function test_supports_all_margin_properties(): void {
		$expected_properties = [
			'margin',
			'margin-top',
			'margin-right',
			'margin-bottom',
			'margin-left',
			'margin-block',
			'margin-block-start',
			'margin-block-end',
			'margin-inline',
			'margin-inline-start',
			'margin-inline-end',
		];

		foreach ( $expected_properties as $property ) {
			$this->assertTrue( $this->mapper->is_supported_property( $property ), "Property $property should be supported" );
		}

		$this->assertFalse( $this->mapper->is_supported_property( 'padding' ) );
		$this->assertFalse( $this->mapper->is_supported_property( 'margin-invalid' ) );
	}

	public function test_get_supported_properties(): void {
		$expected_properties = [
			'margin',
			'margin-top',
			'margin-right',
			'margin-bottom',
			'margin-left',
			'margin-block',
			'margin-block-start',
			'margin-block-end',
			'margin-inline',
			'margin-inline-start',
			'margin-inline-end',
		];
		
		$this->assertEquals( $expected_properties, $this->mapper->get_supported_properties() );
	}

	/**
	 * Test negative margin values - Critical for margin (unlike padding)
	 */
	public function test_negative_margin_single_value(): void {
		$result = $this->mapper->map_to_v4_atomic( 'margin', '-20px' );
		$this->assert_dimensions_structure( $result );
		
		// All dimensions should have -20px
		$this->assert_size_value( $result['value']['block-start'], -20.0, 'px' );
		$this->assert_size_value( $result['value']['inline-end'], -20.0, 'px' );
		$this->assert_size_value( $result['value']['block-end'], -20.0, 'px' );
		$this->assert_size_value( $result['value']['inline-start'], -20.0, 'px' );
	}

	public function test_negative_individual_margin(): void {
		$result = $this->mapper->map_to_v4_atomic( 'margin-top', '-10px' );
		$this->assert_dimensions_structure( $result );
		
		// Only block-start should have -10px, others should be 0
		$this->assert_size_value( $result['value']['block-start'], -10.0, 'px' );
		$this->assert_size_value( $result['value']['inline-end'], 0.0, 'px' );
		$this->assert_size_value( $result['value']['block-end'], 0.0, 'px' );
		$this->assert_size_value( $result['value']['inline-start'], 0.0, 'px' );
	}

	/**
	 * Test margin shorthand with 2 values
	 */
	public function test_margin_shorthand_two_values(): void {
		$result = $this->mapper->map_to_v4_atomic( 'margin', '20px 30px' );
		$this->assert_dimensions_structure( $result );
		
		// Vertical: 20px, Horizontal: 30px
		$this->assert_size_value( $result['value']['block-start'], 20.0, 'px' );
		$this->assert_size_value( $result['value']['inline-end'], 30.0, 'px' );
		$this->assert_size_value( $result['value']['block-end'], 20.0, 'px' );
		$this->assert_size_value( $result['value']['inline-start'], 30.0, 'px' );
	}

	/**
	 * Test margin shorthand with 3 values
	 */
	public function test_margin_shorthand_three_values(): void {
		$result = $this->mapper->map_to_v4_atomic( 'margin', '10px 20px 30px' );
		$this->assert_dimensions_structure( $result );
		
		// Top: 10px, Horizontal: 20px, Bottom: 30px
		$this->assert_size_value( $result['value']['block-start'], 10.0, 'px' );
		$this->assert_size_value( $result['value']['inline-end'], 20.0, 'px' );
		$this->assert_size_value( $result['value']['block-end'], 30.0, 'px' );
		$this->assert_size_value( $result['value']['inline-start'], 20.0, 'px' );
	}

	/**
	 * Test margin shorthand with 4 values including negatives
	 */
	public function test_margin_shorthand_four_values_mixed(): void {
		$result = $this->mapper->map_to_v4_atomic( 'margin', '10px -20px 30px -40px' );
		$this->assert_dimensions_structure( $result );
		
		// Top: 10px, Right: -20px, Bottom: 30px, Left: -40px
		$this->assert_size_value( $result['value']['block-start'], 10.0, 'px' );
		$this->assert_size_value( $result['value']['inline-end'], -20.0, 'px' );
		$this->assert_size_value( $result['value']['block-end'], 30.0, 'px' );
		$this->assert_size_value( $result['value']['inline-start'], -40.0, 'px' );
	}

	/**
	 * Test margin-inline single value
	 */
	public function test_margin_inline_single_value(): void {
		$result = $this->mapper->map_to_v4_atomic( 'margin-inline', '10px' );
		$this->assert_dimensions_structure( $result );
		
		// Only inline dimensions should have 10px, block dimensions should be 0
		$this->assert_size_value( $result['value']['block-start'], 0.0, 'px' );
		$this->assert_size_value( $result['value']['inline-end'], 10.0, 'px' );
		$this->assert_size_value( $result['value']['block-end'], 0.0, 'px' );
		$this->assert_size_value( $result['value']['inline-start'], 10.0, 'px' );
	}

	/**
	 * Test margin-inline with 2 values
	 */
	public function test_margin_inline_two_values(): void {
		$result = $this->mapper->map_to_v4_atomic( 'margin-inline', '10px 30px' );
		$this->assert_dimensions_structure( $result );
		
		// inline-start: 10px, inline-end: 30px, block dimensions: 0
		$this->assert_size_value( $result['value']['block-start'], 0.0, 'px' );
		$this->assert_size_value( $result['value']['inline-end'], 30.0, 'px' );
		$this->assert_size_value( $result['value']['block-end'], 0.0, 'px' );
		$this->assert_size_value( $result['value']['inline-start'], 10.0, 'px' );
	}

	/**
	 * Test margin-block single value
	 */
	public function test_margin_block_single_value(): void {
		$result = $this->mapper->map_to_v4_atomic( 'margin-block', '15px' );
		$this->assert_dimensions_structure( $result );
		
		// Only block dimensions should have 15px, inline dimensions should be 0
		$this->assert_size_value( $result['value']['block-start'], 15.0, 'px' );
		$this->assert_size_value( $result['value']['inline-end'], 0.0, 'px' );
		$this->assert_size_value( $result['value']['block-end'], 15.0, 'px' );
		$this->assert_size_value( $result['value']['inline-start'], 0.0, 'px' );
	}

	/**
	 * Test margin-block with 2 values
	 */
	public function test_margin_block_two_values(): void {
		$result = $this->mapper->map_to_v4_atomic( 'margin-block', '10px 25px' );
		$this->assert_dimensions_structure( $result );
		
		// block-start: 10px, block-end: 25px, inline dimensions: 0
		$this->assert_size_value( $result['value']['block-start'], 10.0, 'px' );
		$this->assert_size_value( $result['value']['inline-end'], 0.0, 'px' );
		$this->assert_size_value( $result['value']['block-end'], 25.0, 'px' );
		$this->assert_size_value( $result['value']['inline-start'], 0.0, 'px' );
	}

	/**
	 * Test individual logical properties with negative values
	 */
	public function test_margin_inline_start_negative(): void {
		$result = $this->mapper->map_to_v4_atomic( 'margin-inline-start', '-20px' );
		$this->assert_dimensions_structure( $result );
		
		// Only inline-start should have -20px
		$this->assert_size_value( $result['value']['block-start'], 0.0, 'px' );
		$this->assert_size_value( $result['value']['inline-end'], 0.0, 'px' );
		$this->assert_size_value( $result['value']['block-end'], 0.0, 'px' );
		$this->assert_size_value( $result['value']['inline-start'], -20.0, 'px' );
	}

	public function test_margin_block_end_negative(): void {
		$result = $this->mapper->map_to_v4_atomic( 'margin-block-end', '-25px' );
		$this->assert_dimensions_structure( $result );
		
		// Only block-end should have -25px
		$this->assert_size_value( $result['value']['block-start'], 0.0, 'px' );
		$this->assert_size_value( $result['value']['inline-end'], 0.0, 'px' );
		$this->assert_size_value( $result['value']['block-end'], -25.0, 'px' );
		$this->assert_size_value( $result['value']['inline-start'], 0.0, 'px' );
	}

	/**
	 * Test CSS keywords - Critical for margin: auto centering
	 */
	public function test_margin_auto_keyword(): void {
		$result = $this->mapper->map_to_v4_atomic( 'margin', 'auto' );
		$this->assert_dimensions_structure( $result );
		
		// All dimensions should have 'auto' with 'custom' unit
		$this->assert_size_value( $result['value']['block-start'], 'auto', 'custom' );
		$this->assert_size_value( $result['value']['inline-end'], 'auto', 'custom' );
		$this->assert_size_value( $result['value']['block-end'], 'auto', 'custom' );
		$this->assert_size_value( $result['value']['inline-start'], 'auto', 'custom' );
	}

	public function test_individual_margin_auto(): void {
		$result = $this->mapper->map_to_v4_atomic( 'margin-top', 'auto' );
		$this->assert_dimensions_structure( $result );
		
		// Only block-start should have 'auto'
		$this->assert_size_value( $result['value']['block-start'], 'auto', 'custom' );
		$this->assert_size_value( $result['value']['inline-end'], 0.0, 'px' );
		$this->assert_size_value( $result['value']['block-end'], 0.0, 'px' );
		$this->assert_size_value( $result['value']['inline-start'], 0.0, 'px' );
	}

	/**
	 * Test different units
	 */
	public function test_margin_different_units(): void {
		$result = $this->mapper->map_to_v4_atomic( 'margin', '1em 2rem 3% 4vw' );
		$this->assert_dimensions_structure( $result );
		
		// Each dimension should have different units
		$this->assert_size_value( $result['value']['block-start'], 1.0, 'em' );
		$this->assert_size_value( $result['value']['inline-end'], 2.0, 'rem' );
		$this->assert_size_value( $result['value']['block-end'], 3.0, '%' );
		$this->assert_size_value( $result['value']['inline-start'], 4.0, 'vw' );
	}

	/**
	 * Test logical properties with negative values
	 */
	public function test_margin_inline_negative_values(): void {
		$result = $this->mapper->map_to_v4_atomic( 'margin-inline', '-10px -30px' );
		$this->assert_dimensions_structure( $result );
		
		// inline-start: -10px, inline-end: -30px
		$this->assert_size_value( $result['value']['block-start'], 0.0, 'px' );
		$this->assert_size_value( $result['value']['inline-end'], -30.0, 'px' );
		$this->assert_size_value( $result['value']['block-end'], 0.0, 'px' );
		$this->assert_size_value( $result['value']['inline-start'], -10.0, 'px' );
	}

	public function test_margin_block_negative_values(): void {
		$result = $this->mapper->map_to_v4_atomic( 'margin-block', '-15px -25px' );
		$this->assert_dimensions_structure( $result );
		
		// block-start: -15px, block-end: -25px
		$this->assert_size_value( $result['value']['block-start'], -15.0, 'px' );
		$this->assert_size_value( $result['value']['inline-end'], 0.0, 'px' );
		$this->assert_size_value( $result['value']['block-end'], -25.0, 'px' );
		$this->assert_size_value( $result['value']['inline-start'], 0.0, 'px' );
	}

	/**
	 * Test CSS keywords for individual properties
	 */
	public function test_css_keywords_support(): void {
		$keywords = [ 'auto', 'inherit', 'initial', 'unset', 'revert', 'revert-layer' ];
		
		foreach ( $keywords as $keyword ) {
			$result = $this->mapper->map_to_v4_atomic( 'margin-left', $keyword );
			$this->assert_dimensions_structure( $result );
			
			// Only inline-start should have the keyword
			$this->assert_size_value( $result['value']['inline-start'], $keyword, 'custom' );
			$this->assert_size_value( $result['value']['block-start'], 0.0, 'px' );
		}
	}

	/**
	 * Test invalid values are properly rejected
	 */
	public function test_invalid_values_rejected(): void {
		$invalid_cases = [
			[ 'property' => 'margin', 'value' => '1px 2px 3px 4px 5px' ], // Too many values
			[ 'property' => 'margin', 'value' => 'invalid' ], // Invalid value
			[ 'property' => 'margin', 'value' => '' ], // Empty value
			[ 'property' => 'margin-inline', 'value' => '1px 2px 3px' ], // Too many values for logical
			[ 'property' => 'margin-block', 'value' => '1px 2px 3px' ], // Too many values for logical
			[ 'property' => 'unsupported', 'value' => '10px' ], // Unsupported property
		];

		foreach ( $invalid_cases as $case ) {
			$result = $this->mapper->map_to_v4_atomic( $case['property'], $case['value'] );
			$this->assertNull( $result, "Should reject: {$case['property']}: {$case['value']}" );
		}
	}

	/**
	 * Test edge cases
	 */
	public function test_zero_values(): void {
		$result = $this->mapper->map_to_v4_atomic( 'margin', '0' );
		$this->assert_dimensions_structure( $result );
		
		// All dimensions should be 0px
		$this->assert_size_value( $result['value']['block-start'], 0.0, 'px' );
		$this->assert_size_value( $result['value']['inline-end'], 0.0, 'px' );
		$this->assert_size_value( $result['value']['block-end'], 0.0, 'px' );
		$this->assert_size_value( $result['value']['inline-start'], 0.0, 'px' );
	}

	public function test_decimal_negative_values(): void {
		$result = $this->mapper->map_to_v4_atomic( 'margin', '-1.5px' );
		$this->assert_dimensions_structure( $result );
		
		// All dimensions should be -1.5px
		$this->assert_size_value( $result['value']['block-start'], -1.5, 'px' );
		$this->assert_size_value( $result['value']['inline-end'], -1.5, 'px' );
		$this->assert_size_value( $result['value']['block-end'], -1.5, 'px' );
		$this->assert_size_value( $result['value']['inline-start'], -1.5, 'px' );
	}

	/**
	 * Test comprehensive unit support
	 */
	public function test_comprehensive_unit_support(): void {
		$units = [ 'px', 'em', 'rem', '%', 'vh', 'vw', 'pt', 'pc', 'in', 'cm', 'mm', 'ex', 'ch', 'vmin', 'vmax' ];
		
		foreach ( $units as $unit ) {
			$result = $this->mapper->map_to_v4_atomic( 'margin-top', "10{$unit}" );
			$this->assert_dimensions_structure( $result );
			$this->assert_size_value( $result['value']['block-start'], 10.0, $unit );
		}
	}

	/**
	 * Test atomic widget compliance
	 */
	public function test_atomic_widget_compliance(): void {
		$result = $this->mapper->map_to_v4_atomic( 'margin', '10px 20px' );
		
		// Must be Dimensions_Prop_Type structure
		$this->assertEquals( 'dimensions', $result['$$type'] );
		$this->assertArrayHasKey( 'value', $result );
		
		// Each dimension must be Size_Prop_Type structure
		foreach ( $result['value'] as $dimension_key => $dimension ) {
			$this->assertEquals( 'size', $dimension['$$type'], "Dimension $dimension_key should be Size_Prop_Type" );
			$this->assertArrayHasKey( 'value', $dimension );
			$this->assertArrayHasKey( 'size', $dimension['value'] );
			$this->assertArrayHasKey( 'unit', $dimension['value'] );
			$this->assertIsNumeric( $dimension['value']['size'] ) || $this->assertIsString( $dimension['value']['size'] );
			$this->assertIsString( $dimension['value']['unit'] );
		}
	}
}
