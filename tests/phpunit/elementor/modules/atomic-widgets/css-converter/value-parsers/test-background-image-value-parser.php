<?php

namespace Elementor\Testing\Modules\AtomicWidgets\CssConverter\ValueParsers;

use Elementor\Modules\AtomicWidgets\CssConverter\ValueParsers\Background_Image_Value_Parser;
use PHPUnit\Framework\TestCase;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Test_Background_Image_Value_Parser extends TestCase {
	public function test_parse__single_url_returns_one_image_overlay() {
		// Act.
		$result = Background_Image_Value_Parser::parse( 'url(foo.jpg)' );

		// Assert.
		$this->assertCount( 1, $result );
		$this->assertSame( 'background-image-overlay', $result[0]['$$type'] );
		$this->assertSame( 'foo.jpg', $result[0]['value']['image']['value']['src']['value']['url']['value'] );
	}

	public function test_parse__quoted_url_strips_quotes() {
		// Act.
		$result = Background_Image_Value_Parser::parse( "url('foo.jpg')" );

		// Assert.
		$this->assertSame( 'foo.jpg', $result[0]['value']['image']['value']['src']['value']['url']['value'] );
	}

	public function test_parse__multiple_urls_returns_ordered_overlays() {
		// Act.
		$result = Background_Image_Value_Parser::parse( 'url(a.jpg), url(b.jpg)' );

		// Assert.
		$this->assertCount( 2, $result );
		$this->assertSame( 'a.jpg', $result[0]['value']['image']['value']['src']['value']['url']['value'] );
		$this->assertSame( 'b.jpg', $result[1]['value']['image']['value']['src']['value']['url']['value'] );
	}

	public function test_parse__none_layer_is_skipped() {
		// Act.
		$result = Background_Image_Value_Parser::parse( 'url(a.jpg), none' );

		// Assert: the `none` layer is silently dropped.
		$this->assertCount( 1, $result );
		$this->assertSame( 'background-image-overlay', $result[0]['$$type'] );
	}

	public function test_parse__all_none_returns_empty_array() {
		// Act.
		$result = Background_Image_Value_Parser::parse( 'none' );

		// Assert.
		$this->assertSame( [], $result );
	}

	public function test_parse__linear_gradient_returns_gradient_overlay() {
		// Act.
		$result = Background_Image_Value_Parser::parse( 'linear-gradient(135deg, #ffffff 0%, #00FFD5 50%, #FF3CAC 100%)' );

		// Assert: returns one gradient overlay with type, angle and stops.
		$this->assertCount( 1, $result );

		$overlay = $result[0];
		$this->assertSame( 'background-gradient-overlay', $overlay['$$type'] );
		$this->assertSame( 'linear', $overlay['value']['type']['value'] );
		$this->assertSame( 135.0, $overlay['value']['angle']['value'] );

		$stops = $overlay['value']['stops']['value'];
		$this->assertCount( 3, $stops );
		$this->assertSame( '#ffffff', $stops[0]['value']['color']['value'] );
		$this->assertSame( 0.0, $stops[0]['value']['offset']['value'] );
		$this->assertSame( '#00FFD5', $stops[1]['value']['color']['value'] );
		$this->assertSame( 50.0, $stops[1]['value']['offset']['value'] );
		$this->assertSame( '#FF3CAC', $stops[2]['value']['color']['value'] );
		$this->assertSame( 100.0, $stops[2]['value']['offset']['value'] );
	}

	public function test_parse__linear_gradient_without_angle() {
		// Act.
		$result = Background_Image_Value_Parser::parse( 'linear-gradient(#ffffff 0%, #000000 100%)' );

		// Assert: angle is optional.
		$this->assertCount( 1, $result );
		$this->assertSame( 'background-gradient-overlay', $result[0]['$$type'] );
		$this->assertArrayNotHasKey( 'angle', $result[0]['value'] );
	}

	public function test_parse__radial_gradient_with_position() {
		// Act.
		$result = Background_Image_Value_Parser::parse( 'radial-gradient(circle at center center, #ffffff 0%, #000000 100%)' );

		// Assert.
		$this->assertCount( 1, $result );
		$overlay = $result[0];
		$this->assertSame( 'background-gradient-overlay', $overlay['$$type'] );
		$this->assertSame( 'radial', $overlay['value']['type']['value'] );
		$this->assertSame( 'center center', $overlay['value']['positions']['value'] );
	}

	public function test_parse__linear_gradient_with_direction_keyword_declines() {
		// Act.
		$result = Background_Image_Value_Parser::parse( 'linear-gradient(to right, #ffffff, #000000)' );

		// Assert: `to right` direction keywords are not supported.
		$this->assertNull( $result );
	}

	public function test_parse__mixed_url_and_gradient() {
		// Act.
		$result = Background_Image_Value_Parser::parse( 'url(foo.jpg), linear-gradient(#fff, #000)' );

		// Assert: both layers parsed into their respective overlay types.
		$this->assertCount( 2, $result );
		$this->assertSame( 'background-image-overlay', $result[0]['$$type'] );
		$this->assertSame( 'background-gradient-overlay', $result[1]['$$type'] );
	}

	public function test_parse__unrecognised_keyword_declines() {
		// Act.
		$result = Background_Image_Value_Parser::parse( 'banana' );

		// Assert.
		$this->assertNull( $result );
	}
}
