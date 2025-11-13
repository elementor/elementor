<?php
namespace ElementorCss\Tests\Phpunit\Modules\CssConverter\Convertors\CssProperties\Properties;

use Elementor\Modules\CssConverter\Convertors\CssProperties\Properties\Flex_Properties_Mapper;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * PHPUnit Tests for Flex Properties Mapper (including Gap Properties)
 * 
 * Tests atomic widget compliance for flex properties including:
 * - gap, row-gap, column-gap (Size_Prop_Type and Layout_Direction_Prop_Type)
 * - justify-content, align-items, align-content, align-self (String_Prop_Type with enums)
 * - flex-wrap (String_Prop_Type with enum)
 * - flex shorthand, flex-grow, flex-shrink, flex-basis
 * - order (Number_Prop_Type)
 * 
 * @group css-converter
 * @group flex-properties-mapper
 * @group gap-properties
 */
class Test_Flex_Properties_Mapper extends Elementor_Test_Base {

	private Flex_Properties_Mapper $mapper;

	public function setUp(): void {
		parent::setUp();
		
		$this->mapper = new Flex_Properties_Mapper();
	}

	private function assert_size_prop_type_structure( array $result, float $expected_size, string $expected_unit ): void {
		$this->assertNotNull( $result );
		$this->assertEquals( 'size', $result['$$type'] );
		$this->assertIsArray( $result['value'] );
		$this->assertEquals( $expected_size, $result['value']['size'] );
		$this->assertEquals( $expected_unit, $result['value']['unit'] );
	}

	private function assert_string_prop_type_structure( array $result, string $expected_value ): void {
		$this->assertNotNull( $result );
		$this->assertEquals( 'string', $result['$$type'] );
		$this->assertEquals( $expected_value, $result['value'] );
	}

	private function assert_layout_direction_prop_type_structure( array $result, array $expected_row, array $expected_column ): void {
		$this->assertNotNull( $result );
		$this->assertEquals( 'layout-direction', $result['$$type'] );
		$this->assertIsArray( $result['value'] );
		$this->assertArrayHasKey( 'row', $result['value'] );
		$this->assertArrayHasKey( 'column', $result['value'] );
		$this->assertEquals( $expected_row, $result['value']['row'] );
		$this->assertEquals( $expected_column, $result['value']['column'] );
	}

	public function test_supports_gap_properties(): void {
		$this->assertTrue( $this->mapper->is_supported_property( 'gap' ) );
		$this->assertTrue( $this->mapper->is_supported_property( 'row-gap' ) );
		$this->assertTrue( $this->mapper->is_supported_property( 'column-gap' ) );
	}

	public function test_supports_flex_properties(): void {
		$this->assertTrue( $this->mapper->is_supported_property( 'justify-content' ) );
		$this->assertTrue( $this->mapper->is_supported_property( 'align-items' ) );
		$this->assertTrue( $this->mapper->is_supported_property( 'align-content' ) );
		$this->assertTrue( $this->mapper->is_supported_property( 'align-self' ) );
		$this->assertTrue( $this->mapper->is_supported_property( 'flex-wrap' ) );
		$this->assertTrue( $this->mapper->is_supported_property( 'flex' ) );
		$this->assertTrue( $this->mapper->is_supported_property( 'flex-grow' ) );
		$this->assertTrue( $this->mapper->is_supported_property( 'flex-shrink' ) );
		$this->assertTrue( $this->mapper->is_supported_property( 'flex-basis' ) );
		$this->assertTrue( $this->mapper->is_supported_property( 'order' ) );
	}

	public function test_get_supported_properties(): void {
		$expected_properties = [
			'justify-content',
			'align-items',
			'align-content',
			'align-self',
			'flex-wrap',
			'gap',
			'row-gap',
			'column-gap',
			'flex',
			'flex-grow',
			'flex-shrink',
			'flex-basis',
			'order',
		];
		
		$this->assertEquals( $expected_properties, $this->mapper->get_supported_properties() );
	}

	// ===== GAP PROPERTIES TESTS =====

	public function test_single_gap_value(): void {
		$test_cases = [
			'10px' => [ 10.0, 'px' ],
			'1.5em' => [ 1.5, 'em' ],
			'2rem' => [ 2.0, 'rem' ],
			'5%' => [ 5.0, '%' ],
			'0' => [ 0.0, 'px' ],
			'0px' => [ 0.0, 'px' ],
		];

		foreach ( $test_cases as $input => $expected ) {
			$result = $this->mapper->map_to_v4_atomic( 'gap', $input );
			$this->assert_size_prop_type_structure( $result, $expected[0], $expected[1] );
		}
	}

	public function test_gap_shorthand_two_values(): void {
		$result = $this->mapper->map_to_v4_atomic( 'gap', '10px 20px' );
		
		$expected_row = [ 'size' => 10.0, 'unit' => 'px' ];
		$expected_column = [ 'size' => 20.0, 'unit' => 'px' ];
		
		$this->assert_layout_direction_prop_type_structure( $result, $expected_row, $expected_column );
	}

	public function test_gap_shorthand_mixed_units(): void {
		$result = $this->mapper->map_to_v4_atomic( 'gap', '1em 2rem' );
		
		$expected_row = [ 'size' => 1.0, 'unit' => 'em' ];
		$expected_column = [ 'size' => 2.0, 'unit' => 'rem' ];
		
		$this->assert_layout_direction_prop_type_structure( $result, $expected_row, $expected_column );
	}

	public function test_gap_shorthand_decimal_values(): void {
		$result = $this->mapper->map_to_v4_atomic( 'gap', '0.5px 1.5px' );
		
		$expected_row = [ 'size' => 0.5, 'unit' => 'px' ];
		$expected_column = [ 'size' => 1.5, 'unit' => 'px' ];
		
		$this->assert_layout_direction_prop_type_structure( $result, $expected_row, $expected_column );
	}

	public function test_row_gap_individual(): void {
		$test_cases = [
			'15px' => [ 15.0, 'px' ],
			'2em' => [ 2.0, 'em' ],
			'10%' => [ 10.0, '%' ],
		];

		foreach ( $test_cases as $input => $expected ) {
			$result = $this->mapper->map_to_v4_atomic( 'row-gap', $input );
			$this->assert_size_prop_type_structure( $result, $expected[0], $expected[1] );
		}
	}

	public function test_column_gap_individual(): void {
		$test_cases = [
			'25px' => [ 25.0, 'px' ],
			'1.5rem' => [ 1.5, 'rem' ],
			'8%' => [ 8.0, '%' ],
		];

		foreach ( $test_cases as $input => $expected ) {
			$result = $this->mapper->map_to_v4_atomic( 'column-gap', $input );
			$this->assert_size_prop_type_structure( $result, $expected[0], $expected[1] );
		}
	}

	public function test_gap_invalid_values(): void {
		$invalid_values = [
			'',
			'   ',
			'invalid',
			'auto',
			'inherit',
			'initial',
			'unset',
			'normal',
			'px',
			'10',
			'-5px',
		];

		foreach ( $invalid_values as $value ) {
			$result = $this->mapper->map_to_v4_atomic( 'gap', $value );
			$this->assertNull( $result, "Should be null for invalid gap value: '$value'" );
		}
	}

	public function test_gap_shorthand_invalid_values(): void {
		$invalid_shorthand_values = [
			'10px invalid',
			'invalid 20px',
			'10px 20px 30px', // Too many values
			'10px  ', // Empty second value
			'  20px', // Empty first value
		];

		foreach ( $invalid_shorthand_values as $value ) {
			$result = $this->mapper->map_to_v4_atomic( 'gap', $value );
			$this->assertNull( $result, "Should be null for invalid gap shorthand: '$value'" );
		}
	}

	// ===== JUSTIFY-CONTENT TESTS =====

	public function test_justify_content_valid_values(): void {
		$valid_values = [
			'flex-start',
			'flex-end',
			'center',
			'space-between',
			'space-around',
			'space-evenly',
			'start',
			'end',
		];

		foreach ( $valid_values as $value ) {
			$result = $this->mapper->map_to_v4_atomic( 'justify-content', $value );
			$this->assert_string_prop_type_structure( $result, $value );
		}
	}

	public function test_justify_content_invalid_values(): void {
		$invalid_values = [
			'',
			'invalid',
			'left',
			'right',
			'baseline',
			'stretch',
		];

		foreach ( $invalid_values as $value ) {
			$result = $this->mapper->map_to_v4_atomic( 'justify-content', $value );
			$this->assertNull( $result, "Should be null for invalid justify-content value: '$value'" );
		}
	}

	// ===== ALIGN-ITEMS TESTS =====

	public function test_align_items_valid_values(): void {
		$valid_values = [
			'flex-start',
			'flex-end',
			'center',
			'baseline',
			'stretch',
			'start',
			'end',
		];

		foreach ( $valid_values as $value ) {
			$result = $this->mapper->map_to_v4_atomic( 'align-items', $value );
			$this->assert_string_prop_type_structure( $result, $value );
		}
	}

	public function test_align_items_invalid_values(): void {
		$invalid_values = [
			'',
			'invalid',
			'space-between',
			'space-around',
			'left',
			'right',
		];

		foreach ( $invalid_values as $value ) {
			$result = $this->mapper->map_to_v4_atomic( 'align-items', $value );
			$this->assertNull( $result, "Should be null for invalid align-items value: '$value'" );
		}
	}

	// ===== FLEX-WRAP TESTS =====

	public function test_flex_wrap_valid_values(): void {
		$valid_values = [
			'nowrap',
			'wrap',
			'wrap-reverse',
		];

		foreach ( $valid_values as $value ) {
			$result = $this->mapper->map_to_v4_atomic( 'flex-wrap', $value );
			$this->assert_string_prop_type_structure( $result, $value );
		}
	}

	public function test_flex_wrap_invalid_values(): void {
		$invalid_values = [
			'',
			'invalid',
			'no-wrap',
			'reverse',
			'wrap-around',
		];

		foreach ( $invalid_values as $value ) {
			$result = $this->mapper->map_to_v4_atomic( 'flex-wrap', $value );
			$this->assertNull( $result, "Should be null for invalid flex-wrap value: '$value'" );
		}
	}

	// ===== EDGE CASES =====

	public function test_whitespace_trimming(): void {
		$whitespace_values = [
			'  10px  ' => [ 10.0, 'px' ],
			"\t15px\n" => [ 15.0, 'px' ],
			' 1em ' => [ 1.0, 'em' ],
		];

		foreach ( $whitespace_values as $input => $expected ) {
			$result = $this->mapper->map_to_v4_atomic( 'gap', $input );
			$this->assert_size_prop_type_structure( $result, $expected[0], $expected[1] );
		}
	}

	public function test_case_sensitivity(): void {
		// Gap values should be case-insensitive for units
		$result1 = $this->mapper->map_to_v4_atomic( 'gap', '10PX' );
		$this->assert_size_prop_type_structure( $result1, 10.0, 'px' );

		$result2 = $this->mapper->map_to_v4_atomic( 'gap', '1EM' );
		$this->assert_size_prop_type_structure( $result2, 1.0, 'em' );

		// Enum values should be case-sensitive
		$result3 = $this->mapper->map_to_v4_atomic( 'justify-content', 'CENTER' );
		$this->assertNull( $result3 );

		$result4 = $this->mapper->map_to_v4_atomic( 'justify-content', 'center' );
		$this->assert_string_prop_type_structure( $result4, 'center' );
	}

	public function test_non_string_values(): void {
		$invalid_types = [
			'integer' => 123,
			'array' => [],
			'null' => null,
			'boolean' => true,
			'float' => 12.5,
		];

		foreach ( $invalid_types as $type_name => $value ) {
			$result = $this->mapper->map_to_v4_atomic( 'gap', $value );
			$this->assertNull( 
				$result, 
				"Should be null for $type_name type: " . var_export( $value, true )
			);
		}
	}

	public function test_unsupported_properties(): void {
		$unsupported_properties = [
			'flex-direction',
			'display',
			'width',
			'height',
			'margin',
			'padding',
		];

		foreach ( $unsupported_properties as $property ) {
			$result = $this->mapper->map_to_v4_atomic( $property, '10px' );
			$this->assertNull( $result, "Should be null for unsupported property: '$property'" );
		}
	}

	// ===== ATOMIC WIDGET COMPLIANCE TESTS =====

	public function test_gap_atomic_widget_compliance(): void {
		$result = $this->mapper->map_to_v4_atomic( 'gap', '15px' );
		
		// Verify exact atomic widget structure for Size_Prop_Type
		$this->assertEquals( 'size', $result['$$type'] );
		$this->assertIsArray( $result['value'] );
		$this->assertArrayHasKey( 'size', $result['value'] );
		$this->assertArrayHasKey( 'unit', $result['value'] );
		$this->assertIsFloat( $result['value']['size'] );
		$this->assertIsString( $result['value']['unit'] );
		$this->assertEquals( 15.0, $result['value']['size'] );
		$this->assertEquals( 'px', $result['value']['unit'] );
		
		// Verify structure matches Size_Prop_Type expectations
		$this->assertArrayHasKey( '$$type', $result );
		$this->assertArrayHasKey( 'value', $result );
		$this->assertCount( 2, $result );
		$this->assertCount( 2, $result['value'] );
	}

	public function test_gap_shorthand_atomic_widget_compliance(): void {
		$result = $this->mapper->map_to_v4_atomic( 'gap', '10px 20px' );
		
		// Verify exact atomic widget structure for Layout_Direction_Prop_Type
		$this->assertEquals( 'layout-direction', $result['$$type'] );
		$this->assertIsArray( $result['value'] );
		$this->assertArrayHasKey( 'row', $result['value'] );
		$this->assertArrayHasKey( 'column', $result['value'] );
		
		// Verify row structure
		$this->assertIsArray( $result['value']['row'] );
		$this->assertEquals( 10.0, $result['value']['row']['size'] );
		$this->assertEquals( 'px', $result['value']['row']['unit'] );
		
		// Verify column structure
		$this->assertIsArray( $result['value']['column'] );
		$this->assertEquals( 20.0, $result['value']['column']['size'] );
		$this->assertEquals( 'px', $result['value']['column']['unit'] );
		
		// Verify structure matches Layout_Direction_Prop_Type expectations
		$this->assertArrayHasKey( '$$type', $result );
		$this->assertArrayHasKey( 'value', $result );
		$this->assertCount( 2, $result );
		$this->assertCount( 2, $result['value'] );
	}

	public function test_justify_content_atomic_widget_compliance(): void {
		$result = $this->mapper->map_to_v4_atomic( 'justify-content', 'center' );
		
		// Verify exact atomic widget structure for String_Prop_Type
		$this->assertEquals( 'string', $result['$$type'] );
		$this->assertIsString( $result['value'] );
		$this->assertEquals( 'center', $result['value'] );
		
		// Verify structure matches String_Prop_Type expectations
		$this->assertArrayHasKey( '$$type', $result );
		$this->assertArrayHasKey( 'value', $result );
		$this->assertCount( 2, $result );
	}

	// ===== COMPREHENSIVE INTEGRATION TESTS =====

	public function test_all_gap_scenarios(): void {
		$comprehensive_test_cases = [
			// Single values
			'gap_single_px' => [ 'gap', '10px', 'size', [ 'size' => 10.0, 'unit' => 'px' ] ],
			'gap_single_em' => [ 'gap', '1.5em', 'size', [ 'size' => 1.5, 'unit' => 'em' ] ],
			'gap_single_rem' => [ 'gap', '2rem', 'size', [ 'size' => 2.0, 'unit' => 'rem' ] ],
			'gap_single_percent' => [ 'gap', '5%', 'size', [ 'size' => 5.0, 'unit' => '%' ] ],
			'gap_zero' => [ 'gap', '0', 'size', [ 'size' => 0.0, 'unit' => 'px' ] ],
			
			// Individual properties
			'row_gap' => [ 'row-gap', '15px', 'size', [ 'size' => 15.0, 'unit' => 'px' ] ],
			'column_gap' => [ 'column-gap', '25px', 'size', [ 'size' => 25.0, 'unit' => 'px' ] ],
		];

		foreach ( $comprehensive_test_cases as $case_name => $case_data ) {
			[ $property, $value, $expected_type, $expected_value ] = $case_data;
			
			$result = $this->mapper->map_to_v4_atomic( $property, $value );
			
			$this->assertNotNull( $result, "Failed for case: $case_name" );
			$this->assertEquals( $expected_type, $result['$$type'], "Wrong type for case: $case_name" );
			
			if ( 'size' === $expected_type ) {
				$this->assertEquals( $expected_value, $result['value'], "Wrong value for case: $case_name" );
			}
		}
	}

	public function test_gap_shorthand_comprehensive(): void {
		$shorthand_test_cases = [
			'same_values' => [ '10px 10px', [ 'size' => 10.0, 'unit' => 'px' ], [ 'size' => 10.0, 'unit' => 'px' ] ],
			'different_values' => [ '15px 25px', [ 'size' => 15.0, 'unit' => 'px' ], [ 'size' => 25.0, 'unit' => 'px' ] ],
			'mixed_units' => [ '1em 2rem', [ 'size' => 1.0, 'unit' => 'em' ], [ 'size' => 2.0, 'unit' => 'rem' ] ],
			'decimal_values' => [ '0.5px 1.5px', [ 'size' => 0.5, 'unit' => 'px' ], [ 'size' => 1.5, 'unit' => 'px' ] ],
			'zero_values' => [ '0 10px', [ 'size' => 0.0, 'unit' => 'px' ], [ 'size' => 10.0, 'unit' => 'px' ] ],
		];

		foreach ( $shorthand_test_cases as $case_name => $case_data ) {
			[ $value, $expected_row, $expected_column ] = $case_data;
			
			$result = $this->mapper->map_to_v4_atomic( 'gap', $value );
			
			$this->assertNotNull( $result, "Failed for shorthand case: $case_name" );
			$this->assert_layout_direction_prop_type_structure( $result, $expected_row, $expected_column );
		}
	}
}


