<?php

namespace Elementor\Testing\Modules\Mcp\Abilities\Appliers\V3;

use Elementor\Modules\Mcp\Abilities\Appliers\V3\V3_Patch_Bisector;
use PHPUnit\Framework\TestCase;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Test_V3_Patch_Bisector extends TestCase {

	public function test_find_offending__returns_empty_when_patch_is_empty() {
		// Arrange.
		$probe = static fn() => true;

		// Act.
		$result = V3_Patch_Bisector::find_offending( [], [], $probe );

		// Assert.
		$this->assertSame( [], $result );
	}

	public function test_find_offending__isolates_single_bad_key() {
		// Arrange.
		$patch = [ 'a' => 1, 'b' => 2, 'c' => 3, 'd' => 4 ];
		$probe = static fn( array $settings ) => ! array_key_exists( 'c', $settings );

		// Act.
		$result = V3_Patch_Bisector::find_offending( [], $patch, $probe );

		// Assert.
		$this->assertSame( [ 'c' ], $result );
	}

	public function test_find_offending__isolates_multiple_bad_keys_on_both_sides() {
		// Arrange.
		$patch = [ 'a' => 1, 'b' => 2, 'c' => 3, 'd' => 4 ];
		$probe = static function ( array $settings ) {
			return ! ( array_key_exists( 'a', $settings ) || array_key_exists( 'd', $settings ) );
		};

		// Act.
		$result = V3_Patch_Bisector::find_offending( [], $patch, $probe );

		// Assert.
		sort( $result );
		$this->assertSame( [ 'a', 'd' ], $result );
	}

	public function test_find_offending__returns_empty_when_no_key_is_bad() {
		// Arrange.
		$patch = [ 'a' => 1, 'b' => 2 ];
		$probe = static fn() => true;

		// Act.
		$result = V3_Patch_Bisector::find_offending( [], $patch, $probe );

		// Assert.
		$this->assertSame( [], $result );
	}

	public function test_find_offending__returns_all_keys_when_all_bad() {
		// Arrange.
		$patch = [ 'a' => 1, 'b' => 2, 'c' => 3 ];
		$probe = static fn() => false;

		// Act.
		$result = V3_Patch_Bisector::find_offending( [], $patch, $probe );

		// Assert.
		sort( $result );
		$this->assertSame( [ 'a', 'b', 'c' ], $result );
	}

	public function test_find_offending__treats_group_members_as_atomic_unit() {
		// Arrange.
		$patch = [
			'typography_typography' => 'custom',
			'typography_font_size' => [ 'unit' => 'px', 'size' => 42 ],
			'color' => '#ff0000',
		];
		$groups = [
			'typography' => [ 'typography_typography', 'typography_font_size' ],
		];
		$probe = static function ( array $settings ) {
			$has_typography = array_key_exists( 'typography_typography', $settings );
			$has_size = array_key_exists( 'typography_font_size', $settings );
			return $has_typography === $has_size;
		};

		// Act.
		$result = V3_Patch_Bisector::find_offending( [], $patch, $probe, $groups );

		// Assert.
		$this->assertSame( [], $result, 'Group applied atomically should never appear split during bisection.' );
	}

	public function test_find_offending__returns_group_members_together_when_group_is_bad() {
		// Arrange.
		$patch = [
			'typography_typography' => 'custom',
			'typography_font_size' => [ 'unit' => 'px', 'size' => 42 ],
			'color' => '#ff0000',
		];
		$groups = [
			'typography' => [ 'typography_typography', 'typography_font_size' ],
		];
		$probe = static function ( array $settings ) {
			return ! array_key_exists( 'typography_font_size', $settings );
		};

		// Act.
		$result = V3_Patch_Bisector::find_offending( [], $patch, $probe, $groups );

		// Assert.
		sort( $result );
		$this->assertSame( [ 'typography_font_size', 'typography_typography' ], $result );
	}

	public function test_find_offending__does_not_mutate_inputs() {
		// Arrange.
		$base = [ 'existing' => 'v' ];
		$patch = [ 'a' => 1, 'b' => 2 ];
		$base_snapshot = $base;
		$patch_snapshot = $patch;

		// Act.
		V3_Patch_Bisector::find_offending( $base, $patch, static fn() => false );

		// Assert.
		$this->assertSame( $base_snapshot, $base );
		$this->assertSame( $patch_snapshot, $patch );
	}

	public function test_find_offending__falls_back_to_full_patch_when_budget_exhausted() {
		// Arrange: 16-key all-fail patch exceeds the 2*log2(n)+n = 24 probe budget when
		// every recursion probes both halves; bisector must fail-closed with the full patch.
		$patch = array_fill_keys( range( 'a', 'p' ), 1 );
		$probe = static fn() => false;

		// Act.
		$result = V3_Patch_Bisector::find_offending( [], $patch, $probe );

		// Assert.
		sort( $result );
		$this->assertSame( array_keys( $patch ), $result );
	}
}
