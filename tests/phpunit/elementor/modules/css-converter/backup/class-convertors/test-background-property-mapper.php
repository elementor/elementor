<?php
namespace Elementor\Tests\Phpunit\Modules\CssConverter;

use Elementor\Modules\CssConverter\Convertors\CssProperties\Properties\Background_Property_Mapper;
use PHPUnit\Framework\TestCase;

class Test_Background_Property_Mapper extends TestCase {

	private $mapper;

	public function setUp(): void {
		$this->mapper = new Background_Property_Mapper();
	}

	public function test_supports_valid_background_properties() {
		$this->assertTrue( $this->mapper->supports( 'background', '#ff0000' ) );
		$this->assertTrue( $this->mapper->supports( 'background', 'red' ) );
		$this->assertTrue( $this->mapper->supports( 'background', '#1a1a2e' ) );
		$this->assertTrue( $this->mapper->supports( 'background', 'url("image.jpg") #fff' ) );
		$this->assertTrue( $this->mapper->supports( 'background', 'linear-gradient(to right, red, blue)' ) );
	}

	public function test_does_not_support_invalid_properties() {
		$this->assertFalse( $this->mapper->supports( 'color', '#ff0000' ) );
		$this->assertFalse( $this->mapper->supports( 'background', 123 ) );
		$this->assertFalse( $this->mapper->supports( 'background', '' ) );
		$this->assertFalse( $this->mapper->supports( 'background', null ) );
	}

	public function test_maps_simple_color_background_to_v4_atomic() {
		$result = $this->mapper->map_to_v4_atomic( 'background', '#1a1a2e' );
		$expected = [
			'property' => 'background',
			'value' => [
				'$$type' => 'background',
				'value' => [
					'color' => [
						'$$type' => 'color',
						'value' => '#1a1a2e',
					],
				],
			],
		];
		$this->assertEquals( $expected, $result );
	}

	public function test_maps_named_color_background_to_v4_atomic() {
		$result = $this->mapper->map_to_v4_atomic( 'background', 'red' );
		$expected = [
			'property' => 'background',
			'value' => [
				'$$type' => 'background',
				'value' => [
					'color' => [
						'$$type' => 'color',
						'value' => 'red',
					],
				],
			],
		];
		$this->assertEquals( $expected, $result );
	}

	public function test_maps_rgb_color_background_to_v4_atomic() {
		$result = $this->mapper->map_to_v4_atomic( 'background', 'rgb(26, 26, 46)' );
		$expected = [
			'property' => 'background',
			'value' => [
				'$$type' => 'background',
				'value' => [
					'color' => [
						'$$type' => 'color',
						'value' => 'rgb(26, 26, 46)',
					],
				],
			],
		];
		$this->assertEquals( $expected, $result );
	}

	public function test_maps_complex_background_with_image_to_v4_atomic() {
		$background = 'url("hero.jpg") #1a1a2e center/cover no-repeat';
		$result = $this->mapper->map_to_v4_atomic( 'background', $background );
		$expected = [
			'property' => 'background',
			'value' => [
				'$$type' => 'background',
				'value' => [
					'color' => [
						'$$type' => 'color',
						'value' => '#1a1a2e',
					],
					'image' => [
						'$$type' => 'string',
						'value' => 'url("hero.jpg")',
					],
				],
			],
		];
		$this->assertEquals( $expected, $result );
	}

	public function test_maps_very_complex_background_as_string() {
		$background = 'linear-gradient(45deg, #1a1a2e 25%, transparent 25%), url("pattern.png")';
		$result = $this->mapper->map_to_v4_atomic( 'background', $background );
		$expected = [
			'property' => 'background',
			'value' => [
				'$$type' => 'string',
				'value' => $background,
			],
		];
		$this->assertEquals( $expected, $result );
	}

	public function test_maps_to_schema_simple_color() {
		$result = $this->mapper->map_to_schema( 'background', '#1a1a2e' );
		$expected = [
			'background' => [
				'$$type' => 'string',
				'value' => '#1a1a2e',
			],
		];
		$this->assertEquals( $expected, $result );
	}

	public function test_get_supported_properties() {
		$properties = $this->mapper->get_supported_properties();
		$this->assertContains( 'background', $properties );
		$this->assertCount( 1, $properties );
	}

	public function test_supports_v4_conversion() {
		$this->assertTrue( $this->mapper->supports_v4_conversion( 'background', '#1a1a2e' ) );
		$this->assertFalse( $this->mapper->supports_v4_conversion( 'color', '#1a1a2e' ) );
	}

	public function test_get_v4_property_name() {
		$this->assertEquals( 'background', $this->mapper->get_v4_property_name( 'background' ) );
	}

	public function test_map_to_v4_atomic_unsupported_property() {
		$result = $this->mapper->map_to_v4_atomic( 'color', '#ff0000' );
		$this->assertNull( $result );
	}

	public function test_map_to_v4_atomic_invalid_value() {
		$result = $this->mapper->map_to_v4_atomic( 'background', '' );
		$this->assertNull( $result );
	}
}
