<?php

namespace Elementor\Testing\Modules\AtomicWidgets\CssConverter\Converters;

use Elementor\Modules\AtomicWidgets\CssConverter\Conversion_Context;
use Elementor\Modules\AtomicWidgets\CssConverter\Converters\Background_Image_Converter;
use Elementor\Modules\AtomicWidgets\PropTypes\Color_Prop_Type;
use PHPUnit\Framework\TestCase;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * DB-less: asserts raw PropValue structure only. generate() calls are safe; validate() is not (needs WP
 * for Image_Sizes / Url_Prop_Type), so schema validation lives in the REST test suite.
 */
class Test_Background_Image_Converter extends TestCase {
	public function test_convert__single_url_creates_one_image_layer() {
		// Arrange.
		$context = new Conversion_Context();

		// Act.
		$converted = ( new Background_Image_Converter() )->convert(
			$context,
			[ 'property' => 'background-image', 'value' => 'url(foo.jpg)' ]
		);

		// Assert.
		$this->assertTrue( $converted );

		$background = $context->get_prop( 'background' );
		$this->assertSame( 'background', $background['$$type'] );

		$overlay = $background['value']['background-overlay'];
		$this->assertSame( 'background-overlay', $overlay['$$type'] );
		$this->assertCount( 1, $overlay['value'] );

		$layer = $overlay['value'][0];
		$this->assertSame( 'background-image-overlay', $layer['$$type'] );
		$this->assertSame( 'foo.jpg', $layer['value']['image']['value']['src']['value']['url']['value'] );
	}

	public function test_convert__multiple_urls_create_ordered_layers() {
		// Arrange.
		$context = new Conversion_Context();

		// Act.
		( new Background_Image_Converter() )->convert(
			$context,
			[ 'property' => 'background-image', 'value' => 'url(a.jpg), url(b.jpg)' ]
		);

		// Assert.
		$layers = $context->get_prop( 'background' )['value']['background-overlay']['value'];

		$this->assertCount( 2, $layers );
		$this->assertSame( 'a.jpg', $layers[0]['value']['image']['value']['src']['value']['url']['value'] );
		$this->assertSame( 'b.jpg', $layers[1]['value']['image']['value']['src']['value']['url']['value'] );
	}

	public function test_convert__preserves_existing_background_color_field() {
		// Arrange: a prior background-color declaration already set the background aggregate.
		$context = new Conversion_Context();
		$context->set_prop( 'background', [
			'$$type' => 'background',
			'value' => [ 'color' => Color_Prop_Type::generate( 'red' ) ],
		] );

		// Act.
		( new Background_Image_Converter() )->convert(
			$context,
			[ 'property' => 'background-image', 'value' => 'url(foo.jpg)' ]
		);

		// Assert: image layer is added; existing color field is preserved.
		$bg_value = $context->get_prop( 'background' )['value'];

		$this->assertSame( Color_Prop_Type::generate( 'red' ), $bg_value['color'] );
		$this->assertArrayHasKey( 'background-overlay', $bg_value );
		$this->assertCount( 1, $bg_value['background-overlay']['value'] );
	}

	public function test_convert__none_layer_produces_no_overlay_items() {
		// Arrange.
		$context = new Conversion_Context();

		// Act.
		$converted = ( new Background_Image_Converter() )->convert(
			$context,
			[ 'property' => 'background-image', 'value' => 'none' ]
		);

		// Assert: converted successfully but overlay array is empty.
		$this->assertTrue( $converted );
		$overlay = $context->get_prop( 'background' )['value']['background-overlay'];
		$this->assertCount( 0, $overlay['value'] );
	}

	public function test_convert__linear_gradient_creates_gradient_overlay_layer() {
		// Arrange.
		$context = new Conversion_Context();

		// Act.
		$converted = ( new Background_Image_Converter() )->convert(
			$context,
			[ 'property' => 'background-image', 'value' => 'linear-gradient(135deg, #ffffff 0%, #000000 100%)' ]
		);

		// Assert.
		$this->assertTrue( $converted );

		$overlay = $context->get_prop( 'background' )['value']['background-overlay'];
		$this->assertCount( 1, $overlay['value'] );
		$this->assertSame( 'background-gradient-overlay', $overlay['value'][0]['$$type'] );
		$this->assertSame( 'linear', $overlay['value'][0]['value']['type']['value'] );
	}

	public function test_convert__mixed_url_and_gradient_creates_two_layers() {
		// Arrange.
		$context = new Conversion_Context();

		// Act.
		$converted = ( new Background_Image_Converter() )->convert(
			$context,
			[ 'property' => 'background-image', 'value' => 'url(foo.jpg), linear-gradient(#fff, #000)' ]
		);

		// Assert.
		$this->assertTrue( $converted );

		$layers = $context->get_prop( 'background' )['value']['background-overlay']['value'];
		$this->assertCount( 2, $layers );
		$this->assertSame( 'background-image-overlay', $layers[0]['$$type'] );
		$this->assertSame( 'background-gradient-overlay', $layers[1]['$$type'] );
	}

	public function test_convert__unsupported_token_declines() {
		// Arrange.
		$context = new Conversion_Context();

		// Act.
		$converted = ( new Background_Image_Converter() )->convert(
			$context,
			[ 'property' => 'background-image', 'value' => 'banana' ]
		);

		// Assert.
		$this->assertFalse( $converted );
		$this->assertNull( $context->get_prop( 'background' ) );
	}
}
