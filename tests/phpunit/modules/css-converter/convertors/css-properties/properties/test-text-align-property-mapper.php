<?php
namespace ElementorCss\Tests\Phpunit\Modules\CssConverter\Convertors\CssProperties\Properties;

use Elementor\Modules\CssConverter\Convertors\CssProperties\Properties\Text_Align_Property_Mapper;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * PHPUnit Tests for Text Align Property Mapper
 * 
 * Tests atomic widget compliance for String_Prop_Type with enum structure
 * Validates text-align property with atomic widget enum values and CSS value mapping
 * 
 * @group css-converter
 * @group text-align-mapper
 */
class Test_Text_Align_Property_Mapper extends Elementor_Test_Base {

	private Text_Align_Property_Mapper $mapper;

	public function setUp(): void {
		parent::setUp();
		
		$this->mapper = new Text_Align_Property_Mapper();
	}

	private function assert_atomic_structure( array $result, string $expected_value ): void {
		$this->assertNotNull( $result );
		$this->assertEquals( 'string', $result['$$type'] );
		$this->assertEquals( $expected_value, $result['value'] );
	}

	public function test_supports_text_align_property(): void {
		$this->assertTrue( $this->mapper->is_supported_property( 'text-align' ) );
		$this->assertFalse( $this->mapper->is_supported_property( 'text-decoration' ) );
		$this->assertFalse( $this->mapper->is_supported_property( 'vertical-align' ) );
	}

	public function test_get_supported_properties(): void {
		$expected_properties = [
			'text-align',
		];
		
		$this->assertEquals( $expected_properties, $this->mapper->get_supported_properties() );
	}

	public function test_valid_atomic_enum_values(): void {
		$valid_values = [
			'start',
			'center',
			'end',
			'justify',
		];

		foreach ( $valid_values as $value ) {
			$result = $this->mapper->map_to_v4_atomic( 'text-align', $value );
			
			$this->assert_atomic_structure( $result, $value );
		}
	}

	public function test_css_value_mapping(): void {
		$css_mappings = [
			'left' => 'start',
			'right' => 'end',
			'center' => 'center',
			'justify' => 'justify',
		];

		foreach ( $css_mappings as $css_value => $atomic_value ) {
			$result = $this->mapper->map_to_v4_atomic( 'text-align', $css_value );
			
			$this->assert_atomic_structure( $result, $atomic_value );
		}
	}

	public function test_invalid_enum_values(): void {
		$invalid_values = [
			'inherit',
			'initial',
			'unset',
			'revert',
			'auto',
			'middle',
			'top',
			'bottom',
			'invalid',
		];

		foreach ( $invalid_values as $value ) {
			$result = $this->mapper->map_to_v4_atomic( 'text-align', $value );
			$this->assertNull( 
				$result, 
				"Should be null for invalid enum value: '$value'"
			);
		}
	}

	public function test_empty_and_whitespace_values(): void {
		$invalid_values = [
			'empty_string' => '',
			'whitespace_only' => '   ',
			'tabs_and_newlines' => "\t\n",
		];

		foreach ( $invalid_values as $case_name => $value ) {
			$result = $this->mapper->map_to_v4_atomic( 'text-align', $value );
			$this->assertNull( 
				$result, 
				"Should be null for case: $case_name with value: '$value'"
			);
		}
	}

	public function test_case_sensitivity(): void {
		$case_variations = [
			'LEFT',
			'Left',
			'lEfT',
			'CENTER',
			'Center',
			'RIGHT',
			'Right',
		];

		foreach ( $case_variations as $value ) {
			$result = $this->mapper->map_to_v4_atomic( 'text-align', $value );
			$this->assertNull( 
				$result, 
				"Should be null for case-sensitive value: '$value'"
			);
		}
	}

	public function test_whitespace_trimming(): void {
		$whitespace_values = [
			'  left  ',
			"\tright\n",
			' center ',
			'  justify  ',
			' start ',
			'  end  ',
		];

		$expected_values = [
			'start',  // left maps to start
			'end',    // right maps to end
			'center',
			'justify',
			'start',
			'end',
		];

		foreach ( $whitespace_values as $index => $value ) {
			$result = $this->mapper->map_to_v4_atomic( 'text-align', $value );
			$this->assert_atomic_structure( $result, $expected_values[$index] );
		}
	}

	public function test_unsupported_property(): void {
		$result = $this->mapper->map_to_v4_atomic( 'text-decoration', 'center' );
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
			$result = $this->mapper->map_to_v4_atomic( 'text-align', $value );
			$this->assertNull( 
				$result, 
				"Should be null for $type_name type: " . var_export( $value, true )
			);
		}
	}

	public function test_atomic_widget_compliance(): void {
		$result = $this->mapper->map_to_v4_atomic( 'text-align', 'center' );
		
		// Verify exact atomic widget structure
		$this->assertEquals( 'string', $result['$$type'] );
		$this->assertIsString( $result['value'] );
		$this->assertEquals( 'center', $result['value'] );
		
		// Verify structure matches String_Prop_Type expectations
		$this->assertArrayHasKey( '$$type', $result );
		$this->assertArrayHasKey( 'value', $result );
		$this->assertCount( 2, $result );
	}

	public function test_all_atomic_widget_enum_values(): void {
		// Test all values from atomic widget style-schema.php
		$atomic_enum_values = [
			'start' => 'start',
			'center' => 'center',
			'end' => 'end',
			'justify' => 'justify',
		];

		foreach ( $atomic_enum_values as $input => $expected_output ) {
			$result = $this->mapper->map_to_v4_atomic( 'text-align', $input );
			
			$this->assertNotNull( $result, "Failed for atomic enum value: $input" );
			$this->assert_atomic_structure( $result, $expected_output );
		}
	}

	public function test_css_to_atomic_mapping_comprehensive(): void {
		// Test comprehensive mapping from CSS values to atomic values
		$comprehensive_mappings = [
			// Direct atomic values
			'start' => 'start',
			'center' => 'center',
			'end' => 'end',
			'justify' => 'justify',
			
			// CSS mapped values
			'left' => 'start',
			'right' => 'end',
		];

		foreach ( $comprehensive_mappings as $css_input => $atomic_output ) {
			$result = $this->mapper->map_to_v4_atomic( 'text-align', $css_input );
			
			$this->assertNotNull( $result, "Failed for CSS input: $css_input" );
			$this->assert_atomic_structure( $result, $atomic_output );
		}
	}
}
