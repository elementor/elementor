<?php

namespace Elementor\Testing\Modules\Mcp\Abilities\Appliers\V3\Maps;

use Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\Binding_Coverage;
use PHPUnit\Framework\TestCase;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Test_Binding_Coverage extends TestCase {

	public function test_overlaps__whole_value_overlaps_any_coverage() {
		// Arrange.
		$whole = Binding_Coverage::whole();

		// Act.
		$overlaps_whole = $whole->overlaps( Binding_Coverage::whole() );
		$overlaps_sides = $whole->overlaps( Binding_Coverage::sides( [ 'block-start' ] ) );
		$sides_overlap_whole = Binding_Coverage::sides( [ 'block-start' ] )->overlaps( $whole );

		// Assert.
		$this->assertTrue( $overlaps_whole );
		$this->assertTrue( $overlaps_sides );
		$this->assertTrue( $sides_overlap_whole );
	}

	public function test_overlaps__sides_overlap_only_when_they_share_a_side() {
		// Arrange.
		$block = Binding_Coverage::sides( [ 'block-start', 'block-end' ] );

		// Act.
		$overlaps_inline = $block->overlaps( Binding_Coverage::sides( [ 'inline-start', 'inline-end' ] ) );
		$overlaps_block_end = $block->overlaps( Binding_Coverage::sides( [ 'block-end' ] ) );

		// Assert.
		$this->assertFalse( $overlaps_inline );
		$this->assertTrue( $overlaps_block_end );
	}

	public function test_overlaps__parts_overlap_only_the_same_part_or_the_whole_value() {
		// Arrange.
		$grow = Binding_Coverage::part( 'flexGrow' );

		// Act.
		$overlaps_shrink = $grow->overlaps( Binding_Coverage::part( 'flexShrink' ) );
		$overlaps_grow = $grow->overlaps( Binding_Coverage::part( 'flexGrow' ) );
		$overlaps_whole = $grow->overlaps( Binding_Coverage::whole() );

		// Assert.
		$this->assertFalse( $overlaps_shrink );
		$this->assertTrue( $overlaps_grow );
		$this->assertTrue( $overlaps_whole );
	}
}
