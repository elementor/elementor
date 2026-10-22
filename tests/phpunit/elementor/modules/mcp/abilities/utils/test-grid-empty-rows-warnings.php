<?php

namespace Elementor\Tests\Phpunit\Modules\Mcp\Abilities\Utils;

use Elementor\Modules\Mcp\Abilities\Utils\Grid_Empty_Rows_Warnings;
use Elementor\Modules\Mcp\Abilities\Utils\Warnings_Bag;
use PHPUnit\Framework\TestCase;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * @group Elementor\Modules\Mcp
 */
class Test_Grid_Empty_Rows_Warnings extends TestCase {

	public function test_report__warns_when_default_rows_exceed_the_rows_children_fill() {
		// Arrange.
		$index = [ 'menu-grid' => $this->grid( 3 ) ];
		$warnings = Warnings_Bag::make();

		// Act.
		Grid_Empty_Rows_Warnings::report( $index, $warnings );

		// Assert.
		$this->assertSame( [ 'grid_empty_rows' ], $warnings->codes() );
		$this->assertStringContainsString( '[menu-grid]', $warnings->messages()[0] );
		$this->assertStringContainsString( 'grid-template-rows: repeat(1, 1fr)', $warnings->messages()[0] );
	}

	public function test_report__uses_the_local_style_tracks() {
		// Arrange.
		$index = [ 'menu-grid' => $this->grid( 4, [ 'grid-template-columns' => 2, 'grid-template-rows' => 3 ] ) ];
		$warnings = Warnings_Bag::make();

		// Act.
		Grid_Empty_Rows_Warnings::report( $index, $warnings );

		// Assert.
		$this->assertSame( [ 'grid_empty_rows' ], $warnings->codes() );
		$this->assertStringContainsString( 'repeat(2, 1fr)', $warnings->messages()[0] );
	}

	public function test_report__stays_silent_when_rows_match_the_children() {
		// Arrange.
		$index = [ 'menu-grid' => $this->grid( 6 ) ];
		$warnings = Warnings_Bag::make();

		// Act.
		Grid_Empty_Rows_Warnings::report( $index, $warnings );

		// Assert.
		$this->assertTrue( $warnings->is_empty() );
	}

	public function test_report__skips_tracks_it_cannot_count() {
		// Arrange.
		$grid = $this->grid( 1 );
		$grid['styles']['e-local']['variants'][0]['props']['grid-template-rows'] = [
			'$$type' => 'grid-track-size',
			'value' => [ 'size' => 'auto auto', 'unit' => 'custom' ],
		];
		$warnings = Warnings_Bag::make();

		// Act.
		Grid_Empty_Rows_Warnings::report( [ 'menu-grid' => $grid ], $warnings );

		// Assert.
		$this->assertTrue( $warnings->is_empty() );
	}

	public function test_report__skips_grids_with_global_classes() {
		// Arrange.
		$grid = $this->grid( 1 );
		$grid['settings']['classes']['value'][] = 'g-123';
		$warnings = Warnings_Bag::make();

		// Act.
		Grid_Empty_Rows_Warnings::report( [ 'menu-grid' => $grid ], $warnings );

		// Assert.
		$this->assertTrue( $warnings->is_empty() );
	}

	public function test_report__ignores_other_elements() {
		// Arrange.
		$flexbox = $this->grid( 1 );
		$flexbox['elType'] = 'e-flexbox';
		$warnings = Warnings_Bag::make();

		// Act.
		Grid_Empty_Rows_Warnings::report( [ 'row' => $flexbox ], $warnings );

		// Assert.
		$this->assertTrue( $warnings->is_empty() );
	}

	private function grid( int $children, array $fr_tracks = [] ): array {
		$props = [];

		foreach ( $fr_tracks as $prop => $count ) {
			$props[ $prop ] = [
				'$$type' => 'grid-track-size',
				'value' => [ 'size' => $count, 'unit' => 'fr' ],
			];
		}

		return [
			'elType' => 'e-grid',
			'settings' => [
				'classes' => [ '$$type' => 'classes', 'value' => [ 'e-local' ] ],
			],
			'styles' => [
				'e-local' => [
					'variants' => [
						[
							'meta' => [ 'breakpoint' => 'desktop', 'state' => null ],
							'props' => $props,
						],
					],
				],
			],
			'elements' => array_fill( 0, $children, [ 'elType' => 'widget', 'widgetType' => 'e-heading' ] ),
		];
	}
}
