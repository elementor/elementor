<?php
namespace Elementor\Tests\Phpunit\Modules\CssConverter;

use Elementor\Modules\CssConverter\Convertors\CssProperties\Background_Image_Property_Mapper;
use PHPUnit\Framework\TestCase;

class Test_Background_Image_Property_Mapper extends TestCase {

	private $mapper;

	public function setUp(): void {
		$this->mapper = new Background_Image_Property_Mapper();
	}

	public function test_supports_valid_background_image_properties() {
		$this->assertTrue( $this->mapper->supports( 'background-image', 'url("image.jpg")' ) );
		$this->assertTrue( $this->mapper->supports( 'background-image', "url('image.png')" ) );
		$this->assertTrue( $this->mapper->supports( 'background-image', 'url(image.gif)' ) );
		$this->assertTrue( $this->mapper->supports( 'background-image', 'linear-gradient(to right, red, blue)' ) );
		$this->assertTrue( $this->mapper->supports( 'background-image', 'none' ) );
	}

	public function test_does_not_support_invalid_properties() {
		$this->assertFalse( $this->mapper->supports( 'background-color', 'url("image.jpg")' ) );
		$this->assertFalse( $this->mapper->supports( 'background-image', 'invalid-value' ) );
		$this->assertFalse( $this->mapper->supports( 'background-image', 123 ) );
	}

	public function test_maps_url_values_correctly() {
		$result = $this->mapper->map_to_schema( 'background-image', 'url("image.jpg")' );
		$expected = [
			'background-image' => [
				'$$type' => 'string',
				'value' => "url('image.jpg')"
			]
		];
		$this->assertEquals( $expected, $result );
	}

	public function test_maps_gradient_values_correctly() {
		$gradient = 'linear-gradient(to right, red, blue)';
		$result = $this->mapper->map_to_schema( 'background-image', $gradient );
		$expected = [
			'background-image' => [
				'$$type' => 'string',
				'value' => $gradient
			]
		];
		$this->assertEquals( $expected, $result );
	}

	public function test_maps_none_value() {
		$result = $this->mapper->map_to_schema( 'background-image', 'none' );
		$expected = [
			'background-image' => [
				'$$type' => 'string',
				'value' => 'none'
			]
		];
		$this->assertEquals( $expected, $result );
	}

	public function test_get_supported_properties() {
		$properties = $this->mapper->get_supported_properties();
		$this->assertContains( 'background-image', $properties );
		$this->assertCount( 1, $properties );
	}
}
