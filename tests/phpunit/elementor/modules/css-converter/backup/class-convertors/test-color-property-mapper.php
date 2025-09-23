<?php
namespace Elementor\Testing\Modules\CssConverter;

use ElementorEditorTesting\Elementor_Test_Base;
use Elementor\Modules\CssConverter\Convertors\CssProperties\Color_Property_Mapper;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * @group css-converter
 * @group css-converter-mappers
 */
class Test_Color_Property_Mapper extends Elementor_Test_Base {
	private $mapper;

	public function setUp(): void {
		parent::setUp();
		$this->mapper = new Color_Property_Mapper();
	}

	public function test_supports_color_property_only() {
		$this->assertTrue( $this->mapper->supports( 'color', '#ff0000' ) );
		$this->assertFalse( $this->mapper->supports( 'background-color', '#ff0000' ) );
		$this->assertFalse( $this->mapper->supports( 'border-color', '#ff0000' ) );
	}

	public function test_supports_hex_colors() {
		$this->assertTrue( $this->mapper->supports( 'color', '#ff0000' ) );
		$this->assertTrue( $this->mapper->supports( 'color', '#f00' ) );
		$this->assertTrue( $this->mapper->supports( 'color', '#ff0000ff' ) );
		$this->assertFalse( $this->mapper->supports( 'color', '#gg0000' ) );
		$this->assertFalse( $this->mapper->supports( 'color', 'ff0000' ) );
	}

	public function test_supports_rgb_colors() {
		$this->assertTrue( $this->mapper->supports( 'color', 'rgb(255, 0, 0)' ) );
		$this->assertTrue( $this->mapper->supports( 'color', 'rgb(255,0,0)' ) );
		$this->assertFalse( $this->mapper->supports( 'color', 'rgb(256, 0, 0)' ) );
		$this->assertFalse( $this->mapper->supports( 'color', 'rgb(255, 0)' ) );
	}

	public function test_supports_rgba_colors() {
		$this->assertTrue( $this->mapper->supports( 'color', 'rgba(255, 0, 0, 1)' ) );
		$this->assertTrue( $this->mapper->supports( 'color', 'rgba(255, 0, 0, 0.5)' ) );
		$this->assertFalse( $this->mapper->supports( 'color', 'rgba(255, 0, 0)' ) );
	}

	public function test_supports_named_colors() {
		$this->assertTrue( $this->mapper->supports( 'color', 'red' ) );
		$this->assertTrue( $this->mapper->supports( 'color', 'blue' ) );
		$this->assertTrue( $this->mapper->supports( 'color', 'white' ) );
		$this->assertFalse( $this->mapper->supports( 'color', 'invalid-color' ) );
	}

	public function test_normalizes_hex_colors() {
		$result = $this->mapper->map_to_schema( 'color', '#FF0000' );
		$this->assertEquals( [ 'color' => '#ff0000' ], $result );

		$result = $this->mapper->map_to_schema( 'color', '#f00' );
		$this->assertEquals( [ 'color' => '#ff0000' ], $result );
	}

	public function test_converts_rgb_to_hex() {
		$result = $this->mapper->map_to_schema( 'color', 'rgb(255, 0, 0)' );
		$this->assertEquals( [ 'color' => '#ff0000' ], $result );

		$result = $this->mapper->map_to_schema( 'color', 'rgb(0, 123, 255)' );
		$this->assertEquals( [ 'color' => '#007bff' ], $result );
	}

	public function test_converts_rgba_to_hex() {
		$result = $this->mapper->map_to_schema( 'color', 'rgba(255, 0, 0, 1)' );
		$this->assertEquals( [ 'color' => '#ff0000' ], $result );

		$result = $this->mapper->map_to_schema( 'color', 'rgba(255, 0, 0, 0.5)' );
		$this->assertEquals( [ 'color' => '#ff000080' ], $result );
	}

	public function test_normalizes_named_colors() {
		$result = $this->mapper->map_to_schema( 'color', 'RED' );
		$this->assertEquals( [ 'color' => 'red' ], $result );
	}

	public function test_get_supported_properties() {
		$properties = $this->mapper->get_supported_properties();
		$this->assertEquals( [ 'color' ], $properties );
	}

	public function test_supports_v4_conversion() {
		$this->assertTrue( $this->mapper->supports_v4_conversion( 'color', '#ff0000' ) );
		$this->assertFalse( $this->mapper->supports_v4_conversion( 'background-color', '#ff0000' ) );
	}

	public function test_get_v4_property_name() {
		$this->assertEquals( 'color', $this->mapper->get_v4_property_name( 'color' ) );
	}

	public function test_map_to_v4_atomic_hex_color() {
		$result = $this->mapper->map_to_v4_atomic( 'color', '#ff0000' );
		$expected = [
			'property' => 'color',
			'value' => [
				'$$type' => 'color',
				'value' => '#ff0000',
			],
		];
		$this->assertEquals( $expected, $result );
	}

	public function test_map_to_v4_atomic_rgb_color() {
		$result = $this->mapper->map_to_v4_atomic( 'color', 'rgb(255, 0, 0)' );
		$expected = [
			'property' => 'color',
			'value' => [
				'$$type' => 'color',
				'value' => '#ff0000',
			],
		];
		$this->assertEquals( $expected, $result );
	}

	public function test_map_to_v4_atomic_named_color() {
		$result = $this->mapper->map_to_v4_atomic( 'color', 'red' );
		$expected = [
			'property' => 'color',
			'value' => [
				'$$type' => 'color',
				'value' => 'red',
			],
		];
		$this->assertEquals( $expected, $result );
	}

	public function test_map_to_v4_atomic_unsupported_property() {
		$result = $this->mapper->map_to_v4_atomic( 'background-color', '#ff0000' );
		$this->assertNull( $result );
	}
}
