<?php
namespace ElementorCss\Tests\Phpunit\Modules\CssConverter\Convertors\CssProperties\Properties;

use Elementor\Modules\CssConverter\Convertors\CssProperties\Properties\Position_Property_Mapper;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * PHPUnit Tests for Position Property Mapper
 * 
 * Tests atomic widget compliance for String_Prop_Type with enum structure
 * Validates position property with atomic widget enum values
 * 
 * @group css-converter
 * @group position-mapper
 */
class Test_Position_Property_Mapper extends Elementor_Test_Base {

	private Position_Property_Mapper $mapper;

	public function setUp(): void {
		parent::setUp();
		
		$this->mapper = new Position_Property_Mapper();
	}

	private function assert_atomic_structure( array $result, string $expected_value ): void {
		$this->assertNotNull( $result );
		$this->assertEquals( 'string', $result['$$type'] );
		$this->assertEquals( $expected_value, $result['value'] );
	}

	public function test_supports_position_property(): void {
		$this->assertTrue( $this->mapper->is_supported_property( 'position' ) );
		$this->assertFalse( $this->mapper->is_supported_property( 'display' ) );
		$this->assertFalse( $this->mapper->is_supported_property( 'top' ) );
	}

	public function test_get_supported_properties(): void {
		$expected_properties = [
			'position',
		];
		
		$this->assertEquals( $expected_properties, $this->mapper->get_supported_properties() );
	}

	public function test_valid_enum_values(): void {
		$valid_values = [
			'static',
			'relative',
			'absolute',
			'fixed',
			'sticky',
		];

		foreach ( $valid_values as $value ) {
			$result = $this->mapper->map_to_v4_atomic( 'position', $value );
			
			$this->assert_atomic_structure( $result, $value );
		}
	}

	public function test_invalid_enum_values(): void {
		$invalid_values = [
			'inherit',
			'initial',
			'unset',
			'revert',
			'auto',
			'invalid',
		];

		foreach ( $invalid_values as $value ) {
			$result = $this->mapper->map_to_v4_atomic( 'position', $value );
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
			$result = $this->mapper->map_to_v4_atomic( 'position', $value );
			$this->assertNull( 
				$result, 
				"Should be null for case: $case_name with value: '$value'"
			);
		}
	}

	public function test_case_sensitivity(): void {
		$case_variations = [
			'STATIC',
			'Static',
			'sTaTiC',
			'RELATIVE',
			'Relative',
			'ABSOLUTE',
			'Absolute',
		];

		foreach ( $case_variations as $value ) {
			$result = $this->mapper->map_to_v4_atomic( 'position', $value );
			$this->assertNull( 
				$result, 
				"Should be null for case-sensitive value: '$value'"
			);
		}
	}

	public function test_whitespace_trimming(): void {
		$whitespace_values = [
			'  static  ',
			"\trelative\n",
			' absolute ',
			'  fixed  ',
			' sticky ',
		];

		$expected_values = [
			'static',
			'relative',
			'absolute',
			'fixed',
			'sticky',
		];

		foreach ( $whitespace_values as $index => $value ) {
			$result = $this->mapper->map_to_v4_atomic( 'position', $value );
			$this->assert_atomic_structure( $result, $expected_values[$index] );
		}
	}

	public function test_unsupported_property(): void {
		$result = $this->mapper->map_to_v4_atomic( 'display', 'static' );
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
			$result = $this->mapper->map_to_v4_atomic( 'position', $value );
			$this->assertNull( 
				$result, 
				"Should be null for $type_name type: " . var_export( $value, true )
			);
		}
	}

	public function test_atomic_widget_compliance(): void {
		$result = $this->mapper->map_to_v4_atomic( 'position', 'absolute' );
		
		// Verify exact atomic widget structure
		$this->assertEquals( 'string', $result['$$type'] );
		$this->assertIsString( $result['value'] );
		$this->assertEquals( 'absolute', $result['value'] );
		
		// Verify structure matches String_Prop_Type expectations
		$this->assertArrayHasKey( '$$type', $result );
		$this->assertArrayHasKey( 'value', $result );
		$this->assertCount( 2, $result );
	}

	public function test_all_atomic_widget_enum_values(): void {
		// Test all values from atomic widget style-schema.php
		$atomic_enum_values = [
			'static' => 'static',
			'relative' => 'relative',
			'absolute' => 'absolute',
			'fixed' => 'fixed',
			'sticky' => 'sticky',
		];

		foreach ( $atomic_enum_values as $input => $expected_output ) {
			$result = $this->mapper->map_to_v4_atomic( 'position', $input );
			
			$this->assertNotNull( $result, "Failed for atomic enum value: $input" );
			$this->assert_atomic_structure( $result, $expected_output );
		}
	}
}
