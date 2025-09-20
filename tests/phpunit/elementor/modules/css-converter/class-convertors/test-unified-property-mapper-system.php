<?php
namespace Elementor\Testing\Modules\CssConverter;

use ElementorEditorTesting\Elementor_Test_Base;
use Elementor\Modules\CssConverter\Convertors\Classes\Class_Property_Mapper_Factory;
use Elementor\Modules\CssConverter\Convertors\Classes\Color_Property_Mapper;
use Elementor\Modules\CssConverter\Convertors\Classes\Background_Color_Property_Mapper;
use Elementor\Modules\CssConverter\Convertors\Classes\Font_Size_Property_Mapper;
use Elementor\Modules\CssConverter\Convertors\Classes\Margin_Property_Mapper;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * @group css-converter
 * @group css-converter-unified
 */
class Test_Unified_Property_Mapper_System extends Elementor_Test_Base {
	private $registry;

	public function setUp(): void {
		parent::setUp();
		$this->registry = Class_Property_Mapper_Factory::get_registry();
	}

	public function test_registry_resolves_unified_mappers() {
		$color_mapper = $this->registry->resolve( 'color', '#ff0000' );
		$this->assertInstanceOf( Color_Property_Mapper::class, $color_mapper );
		$this->assertTrue( method_exists( $color_mapper, 'map_to_v4_atomic' ) );

		$bg_mapper = $this->registry->resolve( 'background-color', '#ff0000' );
		$this->assertInstanceOf( Background_Color_Property_Mapper::class, $bg_mapper );
		$this->assertTrue( method_exists( $bg_mapper, 'map_to_v4_atomic' ) );
	}

	public function test_unified_mappers_support_both_formats() {
		$color_mapper = new Color_Property_Mapper();

		// Test Class format (existing)
		$class_result = $color_mapper->map_to_schema( 'color', '#ff0000' );
		$this->assertEquals( [ 'color' => [ '$$type' => 'color', 'value' => '#ff0000' ] ], $class_result );

		// Test v4 atomic format (new)
		$v4_result = $color_mapper->map_to_v4_atomic( 'color', '#ff0000' );
		$expected_v4 = [
			'property' => 'color',
			'value' => [
				'$$type' => 'color',
				'value' => '#ff0000',
			],
		];
		$this->assertEquals( $expected_v4, $v4_result );
	}

	public function test_background_color_maps_to_background_in_v4() {
		$bg_mapper = new Background_Color_Property_Mapper();

		// Test Class format maps to background-color
		$class_result = $bg_mapper->map_to_schema( 'background-color', '#ff0000' );
		$this->assertArrayHasKey( 'background-color', $class_result );

		// Test v4 format maps to background
		$v4_result = $bg_mapper->map_to_v4_atomic( 'background-color', '#ff0000' );
		$this->assertEquals( 'background', $v4_result['property'] );
		$this->assertEquals( 'background', $v4_result['value']['$$type'] );
	}

	public function test_size_properties_generate_proper_v4_structure() {
		$font_mapper = new Font_Size_Property_Mapper();

		$v4_result = $font_mapper->map_to_v4_atomic( 'font-size', '16px' );
		$expected = [
			'property' => 'font-size',
			'value' => [
				'$$type' => 'size',
				'value' => [
					'size' => 16,
					'unit' => 'px',
				],
			],
		];
		$this->assertEquals( $expected, $v4_result );
	}

	public function test_shorthand_properties_work_in_v4() {
		$margin_mapper = new Margin_Property_Mapper();

		$v4_result = $margin_mapper->map_to_v4_atomic( 'margin', '10px 20px' );
		$this->assertEquals( 'margin', $v4_result['property'] );
		$this->assertArrayHasKey( 'margin-top', $v4_result['value'] );
		$this->assertArrayHasKey( 'margin-right', $v4_result['value'] );
		$this->assertArrayHasKey( 'margin-bottom', $v4_result['value'] );
		$this->assertArrayHasKey( 'margin-left', $v4_result['value'] );
	}

	public function test_unsupported_properties_return_null() {
		$color_mapper = new Color_Property_Mapper();

		$result = $color_mapper->map_to_v4_atomic( 'background-color', '#ff0000' );
		$this->assertNull( $result );

		$result = $color_mapper->map_to_v4_atomic( 'font-size', '16px' );
		$this->assertNull( $result );
	}

	public function test_v4_conversion_support_detection() {
		$color_mapper = new Color_Property_Mapper();

		$this->assertTrue( $color_mapper->supports_v4_conversion( 'color', '#ff0000' ) );
		$this->assertFalse( $color_mapper->supports_v4_conversion( 'background-color', '#ff0000' ) );
		$this->assertFalse( $color_mapper->supports_v4_conversion( 'color', 'invalid-color' ) );
	}

	public function test_property_name_mapping() {
		$color_mapper = new Color_Property_Mapper();
		$bg_mapper = new Background_Color_Property_Mapper();

		// Most properties map to themselves
		$this->assertEquals( 'color', $color_mapper->get_v4_property_name( 'color' ) );

		// Background-color maps to background in v4
		$this->assertEquals( 'background', $bg_mapper->get_v4_property_name( 'background-color' ) );
	}

	public function test_backward_compatibility_preserved() {
		$mappers = [
			new Color_Property_Mapper(),
			new Background_Color_Property_Mapper(),
			new Font_Size_Property_Mapper(),
			new Margin_Property_Mapper(),
		];

		foreach ( $mappers as $mapper ) {
			// All mappers should still support original interface
			$this->assertTrue( method_exists( $mapper, 'supports' ) );
			$this->assertTrue( method_exists( $mapper, 'map_to_schema' ) );
			$this->assertTrue( method_exists( $mapper, 'get_supported_properties' ) );

			// And new unified interface
			$this->assertTrue( method_exists( $mapper, 'map_to_v4_atomic' ) );
			$this->assertTrue( method_exists( $mapper, 'get_v4_property_name' ) );
			$this->assertTrue( method_exists( $mapper, 'supports_v4_conversion' ) );
		}
	}

	public function test_all_type_wrappers_are_correct() {
		$test_cases = [
			[ new Color_Property_Mapper(), 'color', '#ff0000', 'color' ],
			[ new Background_Color_Property_Mapper(), 'background-color', '#ff0000', 'background' ],
			[ new Font_Size_Property_Mapper(), 'font-size', '16px', 'size' ],
		];

		foreach ( $test_cases as [ $mapper, $property, $value, $expected_type ] ) {
			$result = $mapper->map_to_v4_atomic( $property, $value );
			$this->assertNotNull( $result, "Mapper should support {$property}" );
			$this->assertEquals( $expected_type, $result['value']['$$type'], "Type wrapper should be {$expected_type}" );
		}
	}
}
