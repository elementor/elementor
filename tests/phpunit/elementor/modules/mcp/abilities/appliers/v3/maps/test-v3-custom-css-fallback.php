<?php

namespace Elementor\Testing\Modules\Mcp\Abilities\Appliers\V3\Maps;

use Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\V3_Custom_Css_Fallback;
use PHPUnit\Framework\TestCase;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Test_V3_Custom_Css_Fallback extends TestCase {

	const SELECTORS = [
		'main-menu' => '.elementor-nav-menu--main .elementor-item',
		'pointer' => null,
		'wrapper' => '',
	];

	const MEDIA_QUERIES = [
		'tablet' => '(max-width: 1024px)',
		'mobile' => '(max-width: 767px)',
	];

	const DESKTOP = 'desktop';

	const MOBILE = 'mobile';

	const HAND_WRITTEN_CSS = 'selector { outline: 1px solid red; }';

	const CUSTOM_MEDIA_BLOCK = '@media (min-width: 2000px) { selector { color: blue; } }';

	const OTHER_CUSTOM_MEDIA_BLOCK = '@media print { selector { display: none; } }';

	private function fallback(): V3_Custom_Css_Fallback {
		return new V3_Custom_Css_Fallback( self::SELECTORS, self::MEDIA_QUERIES );
	}

	private static function rule( string $target, ?string $state, string $breakpoint, array $declarations, array $replaces = [] ): array {
		return [
			'target' => $target,
			'state' => $state,
			'breakpoint' => $breakpoint,
			'declarations' => $declarations,
			'replaces' => $replaces,
		];
	}

	public function test_merge__appends_target_rules_in_a_delimited_section_after_existing_css() {
		// Arrange.
		$rules = [
			self::rule( 'main-menu', null, self::DESKTOP, [ 'font-weight' => '650' ] ),
			self::rule( 'wrapper', 'hover', self::MOBILE, [ 'box-shadow' => '0 1rem 2rem #000' ] ),
		];

		// Act.
		$css = $this->fallback()->merge( self::HAND_WRITTEN_CSS, $rules );

		// Assert.
		$this->assertSame(
			self::HAND_WRITTEN_CSS . "\n"
				. V3_Custom_Css_Fallback::SECTION_START . "\n"
				. "selector .elementor-nav-menu--main .elementor-item { font-weight: 650; }\n"
				. "@media (max-width: 767px) { selector:hover { box-shadow: 0 1rem 2rem #000; } }\n"
				. V3_Custom_Css_Fallback::SECTION_END,
			$css
		);
	}

	public function test_merge__drops_properties_a_later_block_declares_or_writes_natively() {
		// Arrange.
		$existing = $this->fallback()->merge( self::HAND_WRITTEN_CSS, [
			self::rule( 'main-menu', null, self::DESKTOP, [
				'font-weight' => '650',
				'color' => 'red',
			] ),
		] );

		// Act.
		$css = $this->fallback()->merge( $existing, [
			self::rule( 'main-menu', null, self::DESKTOP, [ 'font-style' => 'oblique 10deg' ], [ 'font-weight' ] ),
		] );

		// Assert.
		$this->assertSame(
			[ self::rule( 'main-menu', null, self::DESKTOP, [
				'color' => 'red',
				'font-style' => 'oblique 10deg',
			] ) ],
			$this->fallback()->read( $css )
		);
		$this->assertStringStartsWith( self::HAND_WRITTEN_CSS, $css );
	}

	public function test_merge__removes_the_section_once_no_rule_is_left() {
		// Arrange.
		$existing = $this->fallback()->merge( self::HAND_WRITTEN_CSS, [
			self::rule( 'main-menu', null, self::DESKTOP, [ 'font-weight' => '650' ] ),
		] );

		// Act.
		$css = $this->fallback()->merge( $existing, [
			self::rule( 'main-menu', null, self::DESKTOP, [], [ 'font-weight' ] ),
		] );

		// Assert.
		$this->assertSame( self::HAND_WRITTEN_CSS, $css );
	}

	public function test_merge__skips_targets_without_a_selector() {
		// Act.
		$css = $this->fallback()->merge( '', [
			self::rule( 'pointer', 'hover', self::DESKTOP, [ 'font-weight' => '650' ] ),
		] );

		// Assert.
		$this->assertSame( '', $css );
	}

	public function test_merge__keeps_verbatim_media_blocks_until_a_write_brings_new_ones() {
		// Arrange.
		$first = $this->fallback()->merge( '', [], self::CUSTOM_MEDIA_BLOCK );

		// Act.
		$kept = $this->fallback()->merge( $first, [ self::rule( 'main-menu', null, self::DESKTOP, [ 'font-weight' => '650' ] ) ] );
		$replaced = $this->fallback()->merge( $kept, [], self::OTHER_CUSTOM_MEDIA_BLOCK );

		// Assert.
		$this->assertSame( self::CUSTOM_MEDIA_BLOCK, $this->fallback()->read_verbatim( $kept ) );
		$this->assertSame( [ self::rule( 'main-menu', null, self::DESKTOP, [ 'font-weight' => '650' ] ) ], $this->fallback()->read( $kept ) );
		$this->assertSame( self::OTHER_CUSTOM_MEDIA_BLOCK, $this->fallback()->read_verbatim( $replaced ) );
	}

	public function test_read__returns_section_rules_and_ignores_hand_written_css() {
		// Arrange.
		$css = $this->fallback()->merge( self::HAND_WRITTEN_CSS, [
			self::rule( 'main-menu', 'hover', self::DESKTOP, [ 'font-weight' => '650' ] ),
			self::rule( 'wrapper', null, self::MOBILE, [ 'box-shadow' => '0 1rem 2rem #000' ] ),
		] );

		// Act.
		$rules = $this->fallback()->read( $css );

		// Assert.
		$this->assertSame(
			[
				self::rule( 'main-menu', 'hover', self::DESKTOP, [ 'font-weight' => '650' ] ),
				self::rule( 'wrapper', null, self::MOBILE, [ 'box-shadow' => '0 1rem 2rem #000' ] ),
			],
			$rules
		);
	}
}
