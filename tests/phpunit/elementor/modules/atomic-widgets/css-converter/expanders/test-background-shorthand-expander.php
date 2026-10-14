<?php

namespace Elementor\Testing\Modules\AtomicWidgets\CssConverter\Expanders;

use Elementor\Modules\AtomicWidgets\CssConverter\Expanders\Background_Shorthand_Expander;
use Elementor\Modules\Variables\PropTypes\Color_Variable_Prop_Type;
use Elementor\Modules\Variables\PropTypes\Size_Variable_Prop_Type;
use Elementor\Modules\Variables\Services\Variables_Service;
use PHPUnit\Framework\TestCase;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Test_Background_Shorthand_Expander extends TestCase {

	private function expand( $value, ?Variables_Service $variables_service = null ): array {
		return ( new Background_Shorthand_Expander( $variables_service ) )->expand( [
			'property' => 'background',
			'value' => $value,
		] );
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

	public function test_expand__unknown_var_only_layer_declines() {
		// Act.
		$rules = $this->expand( 'var(--missing)' );

		// Assert.
		$this->assertSame( [], $rules );
	}

	public function test_expand__var_only_layer_without_service_declines() {
		// Act.
		$rules = $this->expand( 'var(--var-id)' );

		// Assert.
		$this->assertSame( [], $rules );
	}

	public function test_expand__known_color_var_routes_to_background_color() {
		$service = $this->createMock( Variables_Service::class );
		$service->method( 'find_by_label_or_id' )->with( 'var-id' )->willReturn( [
			'id' => 'e-gv-1',
			'type' => Color_Variable_Prop_Type::get_key(),
			'label' => 'var-id',
			'value' => '#112233',
		] );

		// Act.
		$rules = $this->expand( 'var(--var-id)', $service );

		// Assert.
		$this->assertSame( [ 'background-color' ], $this->properties( $rules ) );
		$this->assertSame( [ 'var(--var-id)' ], $this->values( $rules ) );
	}

	public function test_expand__known_size_var_routes_to_position_and_size() {
		$service = $this->createMock( Variables_Service::class );
		$service->method( 'find_by_label_or_id' )->with( 'spacing-md' )->willReturn( [
			'id' => 'e-gv-2',
			'type' => Size_Variable_Prop_Type::get_key(),
			'label' => 'spacing-md',
			'value' => '16px',
		] );

		// Act.
		$rules = $this->expand( 'var(--spacing-md)', $service );

		// Assert.
		$this->assertEqualsCanonicalizing(
			[ 'background-position', 'background-size' ],
			$this->properties( $rules )
		);
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

	public function test_expand__null_value_expands_to_all_longhands_with_null_values() {
		// Arrange & Act: PHP null — parse() normalises the 'null' sentinel before expanders run.
		$rules = $this->expand( null );

		// Assert: all background longhands are emitted with null values so each becomes a prop reset.
		$this->assertSame( Background_Shorthand_Expander::ALL_LONGHANDS, array_column( $rules, 'property' ) );
		$this->assertSame( array_fill( 0, count( Background_Shorthand_Expander::ALL_LONGHANDS ), null ), array_column( $rules, 'value' ) );
	}

	public function test_expand__php_null_value_expands_to_all_longhands_with_null_values() {
		// Arrange & Act.
		$rules = $this->expand( null );

		// Assert.
		$this->assertSame( Background_Shorthand_Expander::ALL_LONGHANDS, array_column( $rules, 'property' ) );
		$this->assertSame( array_fill( 0, count( Background_Shorthand_Expander::ALL_LONGHANDS ), null ), array_column( $rules, 'value' ) );
	}

	public function test_expand__full_value_with_all_slots_emits_every_longhand() {
		// Act: a value that fills all 7 background longhand slots.
		$rules = $this->expand( 'url(bg.jpg) no-repeat scroll center / cover border-box #fff' );

		// Assert: every longhand in ALL_LONGHANDS is present exactly once.
		$this->assertSame( Background_Shorthand_Expander::ALL_LONGHANDS, array_column( $rules, 'property' ) );
	}
}
