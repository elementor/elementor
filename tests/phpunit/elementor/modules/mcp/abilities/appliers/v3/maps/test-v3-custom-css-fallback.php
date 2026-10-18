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

	const TABLET = 'tablet';

	const MOBILE = 'mobile';

	const WIDESCREEN_MEDIA = '(min-width: 2000px)';

	private function fallback(): V3_Custom_Css_Fallback {
		return new V3_Custom_Css_Fallback( self::SELECTORS, self::MEDIA_QUERIES );
	}

	private static function rule( string $target, ?string $state, string $breakpoint, array $declarations, ?string $media = null ): array {
		return [
			'target' => $target,
			'state' => $state,
			'breakpoint' => $breakpoint,
			'media' => $media,
			'declarations' => $declarations,
		];
	}

	public function test_render__scopes_each_rule_to_its_target_state_and_breakpoint() {
		// Arrange.
		$rules = [
			self::rule( 'main-menu', null, self::DESKTOP, [ 'font-weight' => '650' ] ),
			self::rule( 'wrapper', 'hover', self::MOBILE, [ 'box-shadow' => '0 1rem 2rem #000' ] ),
		];

		// Act.
		$css = $this->fallback()->render( $rules );

		// Assert.
		$this->assertSame(
			"selector .elementor-nav-menu--main .elementor-item { font-weight: 650; }\n"
				. '@media (max-width: 767px) { selector:hover { box-shadow: 0 1rem 2rem #000; } }',
			$css
		);
	}

	public function test_render__skips_targets_without_a_selector() {
		// Act.
		$css = $this->fallback()->render( [
			self::rule( 'pointer', 'hover', self::DESKTOP, [ 'font-weight' => '650' ] ),
		] );

		// Assert.
		$this->assertSame( '', $css );
	}

	public function test_render__orders_rules_desktop_first_then_by_the_media_query_cascade_then_custom_media() {
		// Arrange.
		$rules = [
			self::rule( 'wrapper', null, self::MOBILE, [ 'letter-spacing' => '1px' ] ),
			self::rule( 'wrapper', null, self::DESKTOP, [ 'letter-spacing' => '4px' ], self::WIDESCREEN_MEDIA ),
			self::rule( 'wrapper', null, self::DESKTOP, [ 'letter-spacing' => '3px' ] ),
			self::rule( 'wrapper', null, self::TABLET, [ 'letter-spacing' => '2px' ] ),
		];

		// Act.
		$css = $this->fallback()->render( $rules );

		// Assert.
		$this->assertSame(
			implode( "\n", [
				'selector { letter-spacing: 3px; }',
				'@media (max-width: 1024px) { selector { letter-spacing: 2px; } }',
				'@media (max-width: 767px) { selector { letter-spacing: 1px; } }',
				'@media (min-width: 2000px) { selector { letter-spacing: 4px; } }',
			] ),
			$css
		);
	}

	public function test_parse__reads_rendered_rules_back_to_their_targets() {
		// Arrange.
		$rules = [
			self::rule( 'main-menu', null, self::DESKTOP, [ 'font-weight' => '650' ] ),
			self::rule( 'main-menu', 'hover', self::TABLET, [ 'color' => 'rgba(0, 0, 0, 0.5)' ] ),
			self::rule( 'wrapper', null, self::DESKTOP, [ 'letter-spacing' => '4px' ], self::WIDESCREEN_MEDIA ),
		];

		// Act.
		$parsed = $this->fallback()->parse( $this->fallback()->render( $rules ) );

		// Assert.
		$this->assertSame( $rules, $parsed['rules'] );
		$this->assertSame( [], $parsed['unmatched'] );
	}

	public function test_parse__keeps_rules_outside_every_target_as_written() {
		// Arrange.
		$unknown_rule = 'selector .unknown > a { color: red; }';
		$unknown_media_rule = '@media (max-width: 767px) { selector .unknown { color: blue; } }';

		// Act.
		$parsed = $this->fallback()->parse( $unknown_rule . "\n" . $unknown_media_rule . "\nselector { color: green; }" );

		// Assert.
		$this->assertSame( [ self::rule( 'wrapper', null, self::DESKTOP, [ 'color' => 'green' ] ) ], $parsed['rules'] );
		$this->assertSame( [ $unknown_rule, $unknown_media_rule ], $parsed['unmatched'] );
	}

	public function test_merge__overrides_declarations_of_the_same_target_state_and_breakpoint() {
		// Arrange.
		$existing = [
			self::rule( 'main-menu', null, self::DESKTOP, [
				'font-weight' => '600',
				'letter-spacing' => '1px',
			] ),
			self::rule( 'main-menu', 'hover', self::DESKTOP, [ 'font-weight' => '700' ] ),
		];
		$incoming = [
			self::rule( 'main-menu', null, self::DESKTOP, [ 'font-weight' => '650' ] ),
			self::rule( 'wrapper', null, self::MOBILE, [ 'color' => 'red' ] ),
		];

		// Act.
		$merged = V3_Custom_Css_Fallback::merge( $existing, $incoming );

		// Assert.
		$this->assertSame( [
			self::rule( 'main-menu', null, self::DESKTOP, [
				'font-weight' => '650',
				'letter-spacing' => '1px',
			] ),
			self::rule( 'main-menu', 'hover', self::DESKTOP, [ 'font-weight' => '700' ] ),
			self::rule( 'wrapper', null, self::MOBILE, [ 'color' => 'red' ] ),
		], $merged );
	}
}
