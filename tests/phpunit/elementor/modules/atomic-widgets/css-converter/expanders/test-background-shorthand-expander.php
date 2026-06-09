<?php

namespace Elementor\Testing\Modules\AtomicWidgets\CssConverter\Expanders;

use Elementor\Modules\AtomicWidgets\CssConverter\Expanders\Background_Shorthand_Expander;
use PHPUnit\Framework\TestCase;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Test_Background_Shorthand_Expander extends TestCase {
	private function expand( string $value ): array {
		return ( new Background_Shorthand_Expander() )->expand( [ 'property' => 'background', 'value' => $value ] );
	}

	private function properties( array $rules ): array {
		return array_column( $rules, 'property' );
	}

	private function values( array $rules ): array {
		return array_column( $rules, 'value' );
	}

	public function test_expand__color_only_emits_background_color() {
		// Act.
		$rules = $this->expand( 'red' );

		// Assert.
		$this->assertSame( [ 'background-color' ], $this->properties( $rules ) );
		$this->assertSame( [ 'red' ], $this->values( $rules ) );
	}

	public function test_expand__hex_color_emits_background_color() {
		// Act.
		$rules = $this->expand( '#ff0000' );

		// Assert.
		$this->assertSame( [ 'background-color' ], $this->properties( $rules ) );
		$this->assertSame( [ '#ff0000' ], $this->values( $rules ) );
	}

	public function test_expand__url_only_emits_background_image() {
		// Act.
		$rules = $this->expand( 'url(foo.jpg)' );

		// Assert.
		$this->assertSame( [ 'background-image' ], $this->properties( $rules ) );
		$this->assertSame( [ 'url(foo.jpg)' ], $this->values( $rules ) );
	}

	public function test_expand__url_with_repeat_emits_image_and_repeat() {
		// Act.
		$rules = $this->expand( 'url(foo.jpg) no-repeat' );

		// Assert.
		$this->assertEqualsCanonicalizing( [ 'background-image', 'background-repeat' ], $this->properties( $rules ) );
	}

	public function test_expand__url_with_all_simple_props() {
		// Act.
		$rules = $this->expand( 'url(foo.jpg) no-repeat fixed' );

		// Assert.
		$properties = $this->properties( $rules );
		$this->assertContains( 'background-image', $properties );
		$this->assertContains( 'background-repeat', $properties );
		$this->assertContains( 'background-attachment', $properties );
	}

	public function test_expand__position_keywords_emit_background_position() {
		// Act.
		$rules = $this->expand( 'url(foo.jpg) center center' );

		// Assert.
		$properties = $this->properties( $rules );
		$this->assertContains( 'background-position', $properties );

		$pos_rule = array_values( array_filter( $rules, fn( $r ) => 'background-position' === $r['property'] ) )[0];
		$this->assertSame( 'center center', $pos_rule['value'] );
	}

	public function test_expand__position_with_size_emits_both() {
		// Act.
		$rules = $this->expand( 'url(foo.jpg) center center / cover' );

		// Assert.
		$properties = $this->properties( $rules );
		$this->assertContains( 'background-position', $properties );
		$this->assertContains( 'background-size', $properties );

		$size_rule = array_values( array_filter( $rules, fn( $r ) => 'background-size' === $r['property'] ) )[0];
		$this->assertSame( 'cover', $size_rule['value'] );
	}

	public function test_expand__size_pair_after_slash_emits_both_size_values() {
		// Act.
		$rules = $this->expand( 'url(foo.jpg) center center / 50% 100%' );

		// Assert.
		$size_rule = array_values( array_filter( $rules, fn( $r ) => 'background-size' === $r['property'] ) )[0];
		$this->assertSame( '50% 100%', $size_rule['value'] );
	}

	public function test_expand__clip_keyword_emits_background_clip() {
		// Act.
		$rules = $this->expand( 'url(foo.jpg) text' );

		// Assert.
		$properties = $this->properties( $rules );
		$this->assertContains( 'background-clip', $properties );

		$clip_rule = array_values( array_filter( $rules, fn( $r ) => 'background-clip' === $r['property'] ) )[0];
		$this->assertSame( 'text', $clip_rule['value'] );
	}

	public function test_expand__multi_layer_aggregates_image_and_color() {
		// Act.
		$rules = $this->expand( 'url(a.jpg), url(b.jpg) red' );

		// Assert.
		$img_rule = array_values( array_filter( $rules, fn( $r ) => 'background-image' === $r['property'] ) )[0];
		$this->assertSame( 'url(a.jpg), url(b.jpg)', $img_rule['value'] );

		$color_rule = array_values( array_filter( $rules, fn( $r ) => 'background-color' === $r['property'] ) )[0];
		$this->assertSame( 'red', $color_rule['value'] );
	}

	public function test_expand__layer_without_image_gets_none_in_image_list() {
		// Act.
		$rules = $this->expand( 'url(a.jpg), red' );

		// Assert.
		$img_rule = array_values( array_filter( $rules, fn( $r ) => 'background-image' === $r['property'] ) )[0];
		$this->assertSame( 'url(a.jpg), none', $img_rule['value'] );
	}

	public function test_expand__gradient_token_is_treated_as_image() {
		// Act.
		$rules = $this->expand( 'linear-gradient(red, blue)' );

		// Assert: expander emits background-image; the converter will decline it later (no gradient support).
		$this->assertSame( [ 'background-image' ], $this->properties( $rules ) );
		$this->assertSame( 'linear-gradient(red, blue)', $rules[0]['value'] );
	}

	public function test_expand__size_without_position_declines() {
		// Act.
		$rules = $this->expand( 'url(foo.jpg) / cover' );

		// Assert.
		$this->assertSame( [], $rules );
	}

	public function test_expand__duplicate_slot_declines() {
		// Act.
		$rules = $this->expand( 'url(a.jpg) url(b.jpg)' );

		// Assert: two images in the same layer is a parse error.
		$this->assertSame( [], $rules );
	}

	public function test_expand__each_rule_has_correct_declaration_string() {
		// Act.
		$rules = $this->expand( 'url(foo.jpg) no-repeat' );

		// Assert.
		foreach ( $rules as $rule ) {
			$this->assertSame( $rule['property'] . ': ' . $rule['value'], $rule['declaration'] );
		}
	}
}
