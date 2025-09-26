<?php
namespace ElementorCss\Tests\Phpunit\Modules\CssConverter\Convertors\CssProperties\Properties;

use Elementor\Modules\CssConverter\Convertors\CssProperties\Properties\Box_Shadow_Property_Mapper;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * PHPUnit Tests for Box Shadow Property Mapper
 * 
 * Tests atomic widget compliance for Box_Shadow_Prop_Type structure
 * Validates box-shadow property with various shadow formats
 * 
 * @group css-converter
 * @group box-shadow-mapper
 */
class Test_Box_Shadow_Property_Mapper extends Elementor_Test_Base {

	private Box_Shadow_Property_Mapper $mapper;

	public function setUp(): void {
		parent::setUp();
		
		$this->mapper = new Box_Shadow_Property_Mapper();
	}

	private function create_expected_shadow_value( array $shadow_data ): array {
		return [
			'$$type' => 'shadow',
			'value' => [
				'hOffset' => [
					'$$type' => 'size',
					'value' => [
						'size' => $shadow_data['hOffset']['size'],
						'unit' => $shadow_data['hOffset']['unit'],
					],
				],
				'vOffset' => [
					'$$type' => 'size',
					'value' => [
						'size' => $shadow_data['vOffset']['size'],
						'unit' => $shadow_data['vOffset']['unit'],
					],
				],
				'blur' => [
					'$$type' => 'size',
					'value' => [
						'size' => $shadow_data['blur']['size'],
						'unit' => $shadow_data['blur']['unit'],
					],
				],
				'spread' => [
					'$$type' => 'size',
					'value' => [
						'size' => $shadow_data['spread']['size'],
						'unit' => $shadow_data['spread']['unit'],
					],
				],
				'color' => [
					'$$type' => 'color',
					'value' => $shadow_data['color'],
				],
				'position' => $shadow_data['position'],
			],
		];
	}

	private function assert_atomic_structure( array $result ): void {
		$this->assertNotNull( $result );
		$this->assertEquals( 'box-shadow', $result['$$type'] );
		$this->assertArrayHasKey( 'value', $result );
		$this->assertIsArray( $result['value'] );
	}

	private function assert_shadow_structure( array $shadow ): void {
		$this->assertEquals( 'shadow', $shadow['$$type'] );
		$this->assertArrayHasKey( 'value', $shadow );
		
		$shadow_value = $shadow['value'];
		$required_properties = ['hOffset', 'vOffset', 'blur', 'spread', 'color', 'position'];
		
		foreach ( $required_properties as $property ) {
			$this->assertArrayHasKey( $property, $shadow_value );
		}
		
		// Check size properties structure
		$size_properties = ['hOffset', 'vOffset', 'blur', 'spread'];
		foreach ( $size_properties as $property ) {
			$this->assertEquals( 'size', $shadow_value[$property]['$$type'] );
			$this->assertArrayHasKey( 'value', $shadow_value[$property] );
			$this->assertArrayHasKey( 'size', $shadow_value[$property]['value'] );
			$this->assertArrayHasKey( 'unit', $shadow_value[$property]['value'] );
		}
		
		// Check color property structure
		$this->assertEquals( 'color', $shadow_value['color']['$$type'] );
		$this->assertArrayHasKey( 'value', $shadow_value['color'] );
	}

	public function test_supports_box_shadow_property(): void {
		$this->assertTrue( $this->mapper->is_supported_property( 'box-shadow' ) );
		$this->assertFalse( $this->mapper->is_supported_property( 'text-shadow' ) );
		$this->assertFalse( $this->mapper->is_supported_property( 'filter' ) );
	}

	public function test_get_supported_properties(): void {
		$expected_properties = [
			'box-shadow',
		];
		
		$this->assertEquals( $expected_properties, $this->mapper->get_supported_properties() );
	}

	public function test_simple_box_shadow(): void {
		$result = $this->mapper->map_to_v4_atomic( 'box-shadow', '10px 5px 5px #888888' );
		
		$this->assert_atomic_structure( $result );
		$this->assertCount( 1, $result['value'] );
		
		$shadow = $result['value'][0];
		$this->assert_shadow_structure( $shadow );
		
		$shadow_value = $shadow['value'];
		$this->assertEquals( 10.0, $shadow_value['hOffset']['value']['size'] );
		$this->assertEquals( 'px', $shadow_value['hOffset']['value']['unit'] );
		$this->assertEquals( 5.0, $shadow_value['vOffset']['value']['size'] );
		$this->assertEquals( 'px', $shadow_value['vOffset']['value']['unit'] );
		$this->assertEquals( 5.0, $shadow_value['blur']['value']['size'] );
		$this->assertEquals( 'px', $shadow_value['blur']['value']['unit'] );
		$this->assertEquals( 0.0, $shadow_value['spread']['value']['size'] );
		$this->assertEquals( 'px', $shadow_value['spread']['value']['unit'] );
		$this->assertEquals( '#888888', $shadow_value['color']['value'] );
		$this->assertNull( $shadow_value['position'] );
	}

	public function test_box_shadow_with_spread(): void {
		$result = $this->mapper->map_to_v4_atomic( 'box-shadow', '10px 5px 5px 2px #888888' );
		
		$this->assert_atomic_structure( $result );
		$this->assertCount( 1, $result['value'] );
		
		$shadow = $result['value'][0];
		$this->assert_shadow_structure( $shadow );
		
		$shadow_value = $shadow['value'];
		$this->assertEquals( 10.0, $shadow_value['hOffset']['value']['size'] );
		$this->assertEquals( 5.0, $shadow_value['vOffset']['value']['size'] );
		$this->assertEquals( 5.0, $shadow_value['blur']['value']['size'] );
		$this->assertEquals( 2.0, $shadow_value['spread']['value']['size'] );
		$this->assertEquals( '#888888', $shadow_value['color']['value'] );
		$this->assertNull( $shadow_value['position'] );
	}

	public function test_inset_box_shadow(): void {
		$result = $this->mapper->map_to_v4_atomic( 'box-shadow', 'inset 10px 5px 5px #888888' );
		
		$this->assert_atomic_structure( $result );
		$this->assertCount( 1, $result['value'] );
		
		$shadow = $result['value'][0];
		$this->assert_shadow_structure( $shadow );
		
		$shadow_value = $shadow['value'];
		$this->assertEquals( 10.0, $shadow_value['hOffset']['value']['size'] );
		$this->assertEquals( 5.0, $shadow_value['vOffset']['value']['size'] );
		$this->assertEquals( 5.0, $shadow_value['blur']['value']['size'] );
		$this->assertEquals( '#888888', $shadow_value['color']['value'] );
		$this->assertEquals( 'inset', $shadow_value['position'] );
	}

	public function test_multiple_box_shadows(): void {
		$result = $this->mapper->map_to_v4_atomic( 'box-shadow', '10px 5px 5px #888888, inset 2px 2px 2px #cccccc' );
		
		$this->assert_atomic_structure( $result );
		$this->assertCount( 2, $result['value'] );
		
		// First shadow
		$shadow1 = $result['value'][0];
		$this->assert_shadow_structure( $shadow1 );
		$this->assertEquals( 10.0, $shadow1['value']['hOffset']['value']['size'] );
		$this->assertEquals( '#888888', $shadow1['value']['color']['value'] );
		$this->assertNull( $shadow1['value']['position'] );
		
		// Second shadow
		$shadow2 = $result['value'][1];
		$this->assert_shadow_structure( $shadow2 );
		$this->assertEquals( 2.0, $shadow2['value']['hOffset']['value']['size'] );
		$this->assertEquals( '#cccccc', $shadow2['value']['color']['value'] );
		$this->assertEquals( 'inset', $shadow2['value']['position'] );
	}

	public function test_different_units(): void {
		$result = $this->mapper->map_to_v4_atomic( 'box-shadow', '1em 0.5rem 10px 2px #ff0000' );
		
		$this->assert_atomic_structure( $result );
		$this->assertCount( 1, $result['value'] );
		
		$shadow = $result['value'][0];
		$shadow_value = $shadow['value'];
		
		$this->assertEquals( 1.0, $shadow_value['hOffset']['value']['size'] );
		$this->assertEquals( 'em', $shadow_value['hOffset']['value']['unit'] );
		$this->assertEquals( 0.5, $shadow_value['vOffset']['value']['size'] );
		$this->assertEquals( 'rem', $shadow_value['vOffset']['value']['unit'] );
		$this->assertEquals( 10.0, $shadow_value['blur']['value']['size'] );
		$this->assertEquals( 'px', $shadow_value['blur']['value']['unit'] );
		$this->assertEquals( 2.0, $shadow_value['spread']['value']['size'] );
		$this->assertEquals( 'px', $shadow_value['spread']['value']['unit'] );
	}

	public function test_rgba_color(): void {
		$result = $this->mapper->map_to_v4_atomic( 'box-shadow', '10px 5px 5px rgba(255, 0, 0, 0.5)' );
		
		$this->assert_atomic_structure( $result );
		$this->assertCount( 1, $result['value'] );
		
		$shadow = $result['value'][0];
		$shadow_value = $shadow['value'];
		
		$this->assertEquals( '#ff000080', $shadow_value['color']['value'] );
	}

	public function test_none_value(): void {
		$result = $this->mapper->map_to_v4_atomic( 'box-shadow', 'none' );
		
		$this->assert_atomic_structure( $result );
		$this->assertCount( 0, $result['value'] );
	}

	public function test_invalid_values(): void {
		$invalid_values = [
			'empty_string' => '',
			'whitespace_only' => '   ',
			'invalid_format' => '10px',
			'missing_color' => '10px 5px 5px',
			'invalid_color' => '10px 5px 5px invalidcolor',
			'invalid_unit' => '10xyz 5px 5px #888888',
		];

		foreach ( $invalid_values as $case_name => $value ) {
			$result = $this->mapper->map_to_v4_atomic( 'box-shadow', $value );
			$this->assertNull( 
				$result, 
				"Should be null for case: $case_name with invalid value: '$value'"
			);
		}
	}

	public function test_unsupported_property(): void {
		$result = $this->mapper->map_to_v4_atomic( 'text-shadow', '10px 5px 5px #888888' );
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
			$result = $this->mapper->map_to_v4_atomic( 'box-shadow', $value );
			$this->assertNull( 
				$result, 
				"Should be null for $type_name type: " . var_export( $value, true )
			);
		}
	}

	public function test_atomic_widget_compliance(): void {
		$result = $this->mapper->map_to_v4_atomic( 'box-shadow', '5px 5px 10px #000000' );
		
		$this->assert_atomic_structure( $result );
		
		// Verify exact atomic widget structure
		$this->assertEquals( 'box-shadow', $result['$$type'] );
		$this->assertIsArray( $result['value'] );
		$this->assertCount( 1, $result['value'] );
		
		$shadow = $result['value'][0];
		$this->assert_shadow_structure( $shadow );
		
		// Verify all required properties are present and correctly typed
		$shadow_value = $shadow['value'];
		$this->assertIsNumeric( $shadow_value['hOffset']['value']['size'] );
		$this->assertIsString( $shadow_value['hOffset']['value']['unit'] );
		$this->assertIsNumeric( $shadow_value['vOffset']['value']['size'] );
		$this->assertIsString( $shadow_value['vOffset']['value']['unit'] );
		$this->assertIsNumeric( $shadow_value['blur']['value']['size'] );
		$this->assertIsString( $shadow_value['blur']['value']['unit'] );
		$this->assertIsNumeric( $shadow_value['spread']['value']['size'] );
		$this->assertIsString( $shadow_value['spread']['value']['unit'] );
		$this->assertIsString( $shadow_value['color']['value'] );
		$this->assertTrue( is_null( $shadow_value['position'] ) || is_string( $shadow_value['position'] ) );
	}
}
