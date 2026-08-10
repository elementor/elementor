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
}
