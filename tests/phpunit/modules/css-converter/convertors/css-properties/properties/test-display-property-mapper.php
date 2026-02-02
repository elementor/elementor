<?php
namespace ElementorCss\Tests\Phpunit\Modules\CssConverter\Convertors\CssProperties\Properties;

use Elementor\Modules\CssConverter\Convertors\CssProperties\Properties\Display_Property_Mapper;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * PHPUnit Tests for Display Property Mapper
 * 
 * Tests atomic widget compliance for String_Prop_Type with enum structure
 * Validates display property with atomic widget enum values
 * 
 * @group css-converter
 * @group display-mapper
 */
class Test_Display_Property_Mapper extends Elementor_Test_Base {

	private Display_Property_Mapper $mapper;

	public function setUp(): void {
		parent::setUp();
		
		$this->mapper = new Display_Property_Mapper();
	}

	private function assert_atomic_structure( array $result, string $expected_value ): void {
		$this->assertNotNull( $result );
		$this->assertEquals( 'string', $result['$$type'] );
		$this->assertEquals( $expected_value, $result['value'] );
	}

	public function test_supports_display_property(): void {
		$this->assertTrue( $this->mapper->is_supported_property( 'display' ) );
		$this->assertFalse( $this->mapper->is_supported_property( 'position' ) );
		$this->assertFalse( $this->mapper->is_supported_property( 'visibility' ) );
	}

	public function test_get_supported_properties(): void {
		$expected_properties = [
			'display',
		];
		
		$this->assertEquals( $expected_properties, $this->mapper->get_supported_properties() );
	}

	public function test_valid_enum_values(): void {
		$valid_values = [
			'block',
			'inline',
			'inline-block',
			'flex',
			'inline-flex',
			'grid',
			'inline-grid',
			'flow-root',
			'none',
			'contents',
		];

		foreach ( $valid_values as $value ) {
			$result = $this->mapper->map_to_v4_atomic( 'display', $value );
			
			$this->assert_atomic_structure( $result, $value );
		}
	}

	public function test_invalid_enum_values(): void {
		$invalid_values = [
			'table',
			'table-cell',
			'table-row',
			'list-item',
			'run-in',
			'compact',
			'marker',
			'invalid',
		];

		foreach ( $invalid_values as $value ) {
			$result = $this->mapper->map_to_v4_atomic( 'display', $value );
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
			$result = $this->mapper->map_to_v4_atomic( 'display', $value );
			$this->assertNull( 
				$result, 
				"Should be null for case: $case_name with value: '$value'"
			);
		}
	}

	public function test_case_sensitivity(): void {
		$case_variations = [
			'BLOCK',
			'Block',
			'bLoCk',
			'FLEX',
			'Flex',
		];

		foreach ( $case_variations as $value ) {
			$result = $this->mapper->map_to_v4_atomic( 'display', $value );
			$this->assertNull( 
				$result, 
				"Should be null for case-sensitive value: '$value'"
			);
		}
	}

	public function test_whitespace_trimming(): void {
		$whitespace_values = [
			'  block  ',
			"\tflex\n",
			' inline-block ',
			'  grid  ',
		];

		$expected_values = [
			'block',
			'flex',
			'inline-block',
			'grid',
		];

		foreach ( $whitespace_values as $index => $value ) {
			$result = $this->mapper->map_to_v4_atomic( 'display', $value );
			$this->assert_atomic_structure( $result, $expected_values[$index] );
		}
	}

	public function test_unsupported_property(): void {
		$result = $this->mapper->map_to_v4_atomic( 'position', 'block' );
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
			$result = $this->mapper->map_to_v4_atomic( 'display', $value );
			$this->assertNull( 
				$result, 
				"Should be null for $type_name type: " . var_export( $value, true )
			);
		}
	}

	public function test_atomic_widget_compliance(): void {
		$result = $this->mapper->map_to_v4_atomic( 'display', 'flex' );
		
		// Verify exact atomic widget structure
		$this->assertEquals( 'string', $result['$$type'] );
		$this->assertIsString( $result['value'] );
		$this->assertEquals( 'flex', $result['value'] );
		
		// Verify structure matches String_Prop_Type expectations
		$this->assertArrayHasKey( '$$type', $result );
		$this->assertArrayHasKey( 'value', $result );
		$this->assertCount( 2, $result );
	}

	public function test_all_atomic_widget_enum_values(): void {
		// Test all values from atomic widget style-schema.php
		$atomic_enum_values = [
			'block' => 'block',
			'inline' => 'inline',
			'inline-block' => 'inline-block',
			'flex' => 'flex',
			'inline-flex' => 'inline-flex',
			'grid' => 'grid',
			'inline-grid' => 'inline-grid',
			'flow-root' => 'flow-root',
			'none' => 'none',
			'contents' => 'contents',
		];

		foreach ( $atomic_enum_values as $input => $expected_output ) {
			$result = $this->mapper->map_to_v4_atomic( 'display', $input );
			
			$this->assertNotNull( $result, "Failed for atomic enum value: $input" );
			$this->assert_atomic_structure( $result, $expected_output );
		}
	}
}
