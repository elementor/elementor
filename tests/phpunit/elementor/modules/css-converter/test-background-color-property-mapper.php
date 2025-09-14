<?php
namespace Elementor\Tests\Phpunit\Modules\CssConverter;

use Elementor\Modules\CssConverter\ClassConvertors\Background_Color_Property_Mapper;
use PHPUnit\Framework\TestCase;

class Test_Background_Color_Property_Mapper extends TestCase {

	private $mapper;

	public function setUp(): void {
		$this->mapper = new Background_Color_Property_Mapper();
	}

	public function test_supports_valid_background_color_properties() {
		$this->assertTrue( $this->mapper->supports( 'background-color', '#ff0000' ) );
		$this->assertTrue( $this->mapper->supports( 'background-color', 'red' ) );
		$this->assertTrue( $this->mapper->supports( 'background-color', 'rgb(255, 0, 0)' ) );
		$this->assertTrue( $this->mapper->supports( 'background-color', 'rgba(255, 0, 0, 0.5)' ) );
		$this->assertTrue( $this->mapper->supports( 'background-color', 'transparent' ) );
	}

	public function test_does_not_support_invalid_properties() {
		$this->assertFalse( $this->mapper->supports( 'color', '#ff0000' ) );
		$this->assertFalse( $this->mapper->supports( 'background-color', 'invalid-color' ) );
		$this->assertFalse( $this->mapper->supports( 'background-color', 123 ) );
	}

	public function test_maps_hex_colors_correctly() {
		$result = $this->mapper->map_to_schema( 'background-color', '#ff0000' );
		$expected = [
			'background-color' => [
				'$$type' => 'color',
				'value' => '#ff0000'
			]
		];
		$this->assertEquals( $expected, $result );
	}

	public function test_maps_rgb_colors_correctly() {
		$result = $this->mapper->map_to_schema( 'background-color', 'rgb(255, 0, 0)' );
		$expected = [
			'background-color' => [
				'$$type' => 'color',
				'value' => '#ff0000'
			]
		];
		$this->assertEquals( $expected, $result );
	}

	public function test_maps_named_colors_correctly() {
		$result = $this->mapper->map_to_schema( 'background-color', 'red' );
		$expected = [
			'background-color' => [
				'$$type' => 'color',
				'value' => 'red'
			]
		];
		$this->assertEquals( $expected, $result );
	}

	public function test_expands_3_digit_hex() {
		$result = $this->mapper->map_to_schema( 'background-color', '#f00' );
		$expected = [
			'background-color' => [
				'$$type' => 'color',
				'value' => '#ff0000'
			]
		];
		$this->assertEquals( $expected, $result );
	}

	public function test_get_supported_properties() {
		$properties = $this->mapper->get_supported_properties();
		$this->assertContains( 'background-color', $properties );
		$this->assertCount( 1, $properties );
	}
}
