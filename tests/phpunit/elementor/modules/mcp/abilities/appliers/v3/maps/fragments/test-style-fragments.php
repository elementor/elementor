<?php

namespace Elementor\Testing\Modules\Mcp\Abilities\Appliers\V3\Maps\Fragments;

use Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\Fragments\Border_Group;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\Fragments\Box_Shadow_Group;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\Fragments\Typography_Group;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\Style_Target;
use PHPUnit\Framework\TestCase;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Test_Style_Fragments extends TestCase {

	/**
	 * @return array<int, array{prop: string, state: string, setting: string, responsive: bool}>
	 */
	private function describe_bindings( Style_Target $target ): array {
		return array_map( fn( array $binding ) => [
			'prop' => $binding['prop'],
			'state' => $binding['state'],
			'setting' => $binding['control']->get_setting(),
			'responsive' => $binding['control']->is_responsive(),
		], $target->get_bindings() );
	}

	public function test_typography_group__binds_every_typography_field_under_the_prefix() {
		// Arrange.
		$target = Style_Target::make( 'menu' );

		// Act.
		$target->with( Typography_Group::from_prefix( 'menu_typography' ) );

		// Assert.
		$bindings = $this->describe_bindings( $target );
		$this->assertSame(
			[ 'font-family', 'font-size', 'font-weight', 'text-transform', 'font-style', 'text-decoration', 'line-height', 'letter-spacing', 'word-spacing' ],
			array_column( $bindings, 'prop' )
		);
		$this->assertSame( 'menu_typography_font_size', $bindings[1]['setting'] );
		$this->assertTrue( $bindings[1]['responsive'] );
		$this->assertFalse( $bindings[0]['responsive'] );
	}

	public function test_typography_group__skips_excluded_props() {
		// Arrange.
		$target = Style_Target::make( 'dropdown' );

		// Act.
		$target->with( Typography_Group::from_prefix( 'dropdown_typography' )->except( 'line-height', 'word-spacing' ) );

		// Assert.
		$props = array_column( $this->describe_bindings( $target ), 'prop' );
		$this->assertNotContains( 'line-height', $props );
		$this->assertNotContains( 'word-spacing', $props );
		$this->assertContains( 'font-size', $props );
	}

	public function test_border_group__binds_style_width_and_color_in_the_given_state() {
		// Arrange.
		$target = Style_Target::make( 'wrapper' );

		// Act.
		$target->with( Border_Group::from_prefix( '_border_hover', 'hover' ) );

		// Assert.
		$this->assertSame( [
			[
				'prop' => 'border-style',
				'state' => 'hover',
				'setting' => '_border_hover_border',
				'responsive' => false,
			],
			[
				'prop' => 'border-width',
				'state' => 'hover',
				'setting' => '_border_hover_width',
				'responsive' => true,
			],
			[
				'prop' => 'border-color',
				'state' => 'hover',
				'setting' => '_border_hover_color',
				'responsive' => false,
			],
		], $this->describe_bindings( $target ) );
	}

	public function test_box_shadow_group__binds_the_box_shadow_control() {
		// Arrange.
		$target = Style_Target::make( 'dropdown' );

		// Act.
		$target->with( Box_Shadow_Group::from_prefix( 'dropdown_box_shadow' ) );

		// Assert.
		$this->assertSame( [
			[
				'prop' => 'box-shadow',
				'state' => 'default',
				'setting' => 'dropdown_box_shadow_box_shadow',
				'responsive' => false,
			],
		], $this->describe_bindings( $target ) );
	}
}
