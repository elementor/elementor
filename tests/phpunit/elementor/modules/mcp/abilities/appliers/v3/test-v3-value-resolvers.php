<?php

namespace Elementor\Testing\Modules\Mcp\Abilities\Appliers\V3;

use Elementor\Modules\Mcp\Abilities\Appliers\V3\V3_Value_Resolvers;
use PHPUnit\Framework\TestCase;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Test_V3_Value_Resolvers extends TestCase {

	public function test_resolve_dimension__parses_px_and_rem() {
		// Arrange / Act / Assert.
		$this->assertSame( [ 'unit' => 'px', 'size' => 16.0 ], V3_Value_Resolvers::resolve_dimension( '16px' ) );
		$this->assertSame( [ 'unit' => 'rem', 'size' => 1.5 ], V3_Value_Resolvers::resolve_dimension( '1.5rem' ) );
		$this->assertSame( [ 'unit' => 'px', 'size' => 0.0 ], V3_Value_Resolvers::resolve_dimension( '0' ) );
		$this->assertNull( V3_Value_Resolvers::resolve_dimension( 'auto' ) );
	}

	public function test_resolve_sides_shorthand__expands_1_to_4_values() {
		// Arrange / Act.
		$one = V3_Value_Resolvers::resolve_sides_shorthand( '10px' );
		$two = V3_Value_Resolvers::resolve_sides_shorthand( '10px 20px' );
		$four = V3_Value_Resolvers::resolve_sides_shorthand( '1px 2px 3px 4px' );

		// Assert.
		$this->assertSame( '10', $one['top'] );
		$this->assertSame( '10', $one['right'] );
		$this->assertTrue( $one['isLinked'] );

		$this->assertSame( '10', $two['top'] );
		$this->assertSame( '20', $two['right'] );
		$this->assertSame( '10', $two['bottom'] );
		$this->assertFalse( $two['isLinked'] );

		$this->assertSame( '1', $four['top'] );
		$this->assertSame( '4', $four['left'] );
		$this->assertFalse( $four['isLinked'] );
	}

	public function test_resolve_color__passthrough() {
		$this->assertSame( '#ff0000', V3_Value_Resolvers::resolve_color( '  #ff0000  ' ) );
		$this->assertSame( 'rgba(0,0,0,0.5)', V3_Value_Resolvers::resolve_color( 'rgba(0,0,0,0.5)' ) );
	}

	public function test_resolve_color__accepts_all_hex_lengths() {
		$this->assertSame( '#abc', V3_Value_Resolvers::resolve_color( '#abc' ) );
		$this->assertSame( '#abcd', V3_Value_Resolvers::resolve_color( '#abcd' ) );
		$this->assertSame( '#aabbcc', V3_Value_Resolvers::resolve_color( '#aabbcc' ) );
		$this->assertSame( '#aabbccdd', V3_Value_Resolvers::resolve_color( '#aabbccdd' ) );
	}

	public function test_resolve_color__rejects_invalid_hex() {
		// Arrange / Act.
		$result = V3_Value_Resolvers::resolve_color( '#gggggg', 'color' );

		// Assert.
		$this->assertTrue( V3_Value_Resolvers::is_rejected( $result ) );
		$this->assertSame( 'color', $result['property'] );
		$this->assertSame( '#gggggg', $result['value'] );
	}

	public function test_resolve_color__rejects_wrong_length_hex() {
		$this->assertTrue( V3_Value_Resolvers::is_rejected( V3_Value_Resolvers::resolve_color( '#12345', 'color' ) ) );
		$this->assertTrue( V3_Value_Resolvers::is_rejected( V3_Value_Resolvers::resolve_color( '#1234567', 'color' ) ) );
	}

	public function test_resolve_color__passes_through_named_and_functional_colors() {
		$this->assertSame( 'transparent', V3_Value_Resolvers::resolve_color( 'transparent' ) );
		$this->assertSame( 'red', V3_Value_Resolvers::resolve_color( 'red' ) );
		$this->assertSame( 'hsl(0, 100%, 50%)', V3_Value_Resolvers::resolve_color( 'hsl(0, 100%, 50%)' ) );
	}

	public function test_resolve_box_shadow__parses_lengths_and_color() {
		// Arrange / Act.
		$result = V3_Value_Resolvers::resolve_box_shadow( '0 20px 60px rgba(0,0,0,0.15)' );

		// Assert.
		$this->assertSame( 'yes', $result['box_shadow_type'] );
		$this->assertSame( 0.0, $result['box_shadow']['horizontal'] );
		$this->assertSame( 20.0, $result['box_shadow']['vertical'] );
		$this->assertSame( 60.0, $result['box_shadow']['blur'] );
		$this->assertSame( 'rgba(0,0,0,0.15)', $result['box_shadow']['color'] );
		$this->assertSame( 'outline', $result['box_shadow']['position'] );
	}

	public function test_resolve_box_shadow__detects_inset() {
		$result = V3_Value_Resolvers::resolve_box_shadow( 'inset 2px 2px 4px #000' );

		$this->assertSame( 'inset', $result['box_shadow']['position'] );
		$this->assertSame( 2.0, $result['box_shadow']['horizontal'] );
	}

	public function test_resolve_typography_group__sets_toggle_and_keys() {
		// Arrange / Act.
		$patch = V3_Value_Resolvers::resolve_typography_group(
			[
				'font-size' => '2rem',
				'font-weight' => '700',
				'font-family' => 'Georgia',
			],
			'typography'
		);

		// Assert.
		$this->assertSame( 'custom', $patch['typography_typography'] );
		$this->assertSame( [ 'unit' => 'rem', 'size' => 2.0 ], $patch['typography_font_size'] );
		$this->assertSame( '700', $patch['typography_font_weight'] );
		$this->assertSame( 'Georgia', $patch['typography_font_family'] );
	}

	public function test_resolve_line_height__keeps_unitless_values() {
		// Arrange / Act / Assert.
		$this->assertSame( [ 'unit' => '', 'size' => 1.5 ], V3_Value_Resolvers::resolve_line_height( '1.5' ) );
		$this->assertSame( [ 'unit' => 'px', 'size' => 24.0 ], V3_Value_Resolvers::resolve_line_height( '24px' ) );
	}

	public function test_resolve_typography_group__uses_unitless_line_height() {
		// Arrange / Act.
		$patch = V3_Value_Resolvers::resolve_typography_group(
			[
				'line-height' => '1.5',
			],
			'search_field_typography'
		);

		// Assert.
		$this->assertSame( [ 'unit' => '', 'size' => 1.5 ], $patch['search_field_typography_line_height'] );
	}

	public function test_supplement_background_group_toggles__sets_classic_type_for_color_keys() {
		// Arrange.
		$controls = [
			'search_field_background_normal_background' => [ 'type' => 'choose' ],
			'search_field_background_normal_color' => [ 'type' => 'color' ],
			'results_background_background' => [ 'type' => 'choose' ],
			'results_background_color' => [ 'type' => 'color' ],
			'title_color' => [ 'type' => 'color' ],
		];
		$patch = [
			'search_field_background_normal_color' => '#ffffff',
			'results_background_color' => '#f5f5f5',
			'title_color' => '#111111',
		];

		// Act.
		$result = V3_Value_Resolvers::supplement_background_group_toggles( $patch, $controls );

		// Assert.
		$this->assertSame( 'classic', $result['search_field_background_normal_background'] );
		$this->assertSame( 'classic', $result['results_background_background'] );
		$this->assertArrayNotHasKey( 'title_background', $result );
	}

	public function test_resolve_typography_group__skips_toggle_when_nothing_resolves() {
		// Arrange / Act.
		$patch = V3_Value_Resolvers::resolve_typography_group(
			[
				'font-size' => 'potato',
				'line-height' => 'banana',
			],
			'typography'
		);

		// Assert.
		$this->assertSame( [], $patch );
	}

	public function test_resolve_typography_group__takes_first_font_from_stack() {
		// Arrange / Act.
		$patch = V3_Value_Resolvers::resolve_typography_group(
			[
				'font-family' => '"Playfair Display", Georgia, serif',
			],
			'typography'
		);

		// Assert.
		$this->assertSame( 'Playfair Display', $patch['typography_font_family'] );
		$this->assertSame( 'custom', $patch['typography_typography'] );
	}

	public function test_resolve_border_shorthand__parses_width_style_color() {
		// Arrange / Act.
		$patch = V3_Value_Resolvers::resolve_border_shorthand( '2px solid #ccc', 'image_border' );

		// Assert.
		$this->assertSame( 'solid', $patch['image_border_border'] );
		$this->assertSame( '#ccc', $patch['image_border_color'] );
		$this->assertSame( '2', $patch['image_border_width']['top'] );
		$this->assertSame( 'px', $patch['image_border_width']['unit'] );
	}

	public function test_resolve__dispatches_by_name() {
		$this->assertSame( 'red', V3_Value_Resolvers::resolve( 'color', 'red' ) );
		$this->assertSame( [ 'unit' => 'px', 'size' => 10.0 ], V3_Value_Resolvers::resolve( 'dimension', '10px' ) );
		$this->assertNull( V3_Value_Resolvers::resolve( 'unknown', 'x' ) );
	}

	public function test_resolve_dimension__rejects_var_reference_on_unsupported_property() {
		// Arrange / Act.
		$result = V3_Value_Resolvers::resolve_dimension( 'var(--gap)', 'font-size' );

		// Assert.
		$this->assertTrue( V3_Value_Resolvers::is_rejected( $result ) );
		$this->assertSame( 'font-size', $result['property'] );
		$this->assertSame( 'var(--gap)', $result['value'] );
		$this->assertStringContainsString( 'literal value', $result['reason'] );
	}

	public function test_resolve_sides_shorthand__rejects_var_reference() {
		// Arrange / Act.
		$result = V3_Value_Resolvers::resolve_sides_shorthand( 'var(--pad)', 'padding' );

		// Assert.
		$this->assertTrue( V3_Value_Resolvers::is_rejected( $result ) );
		$this->assertSame( 'padding', $result['property'] );
	}

	public function test_resolve_line_height__rejects_var_reference() {
		// Arrange / Act.
		$result = V3_Value_Resolvers::resolve_line_height( 'var(--lh)', 'line-height' );

		// Assert.
		$this->assertTrue( V3_Value_Resolvers::is_rejected( $result ) );
	}

	public function test_resolve_color__passes_through_var_reference() {
		$this->assertSame( 'var(--wc26-gold)', V3_Value_Resolvers::resolve_color( '  var(--wc26-gold)  ' ) );
	}

	public function test_resolve__threads_property_for_dimension_reject() {
		// Arrange / Act.
		$result = V3_Value_Resolvers::resolve( 'dimension', 'var(--x)', [ 'property' => 'width' ] );

		// Assert.
		$this->assertTrue( V3_Value_Resolvers::is_rejected( $result ) );
		$this->assertSame( 'width', $result['property'] );
	}

	public function test_resolve_typography_group_with_rejections__collects_font_size_var() {
		// Arrange / Act.
		$result = V3_Value_Resolvers::resolve_typography_group_with_rejections(
			[
				'font-size' => 'var(--fs)',
				'font-weight' => '700',
			],
			'typography'
		);

		// Assert.
		$this->assertArrayNotHasKey( 'typography_font_size', $result['patch'] );
		$this->assertSame( '700', $result['patch']['typography_font_weight'] );
		$this->assertCount( 1, $result['rejections'] );
		$this->assertSame( 'font-size', $result['rejections'][0]['property'] );
		$this->assertSame( 'var(--fs)', $result['rejections'][0]['value'] );
	}
}
