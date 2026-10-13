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

	const CUSTOM_MEDIA_BLOCK = '@media (min-width: 2000px) { selector { color: blue; } }';

	private function fallback(): V3_Custom_Css_Fallback {
		return new V3_Custom_Css_Fallback( self::SELECTORS, self::MEDIA_QUERIES );
	}

	private static function rule( string $target, ?string $state, string $breakpoint, array $declarations ): array {
		return [
			'target' => $target,
			'state' => $state,
			'breakpoint' => $breakpoint,
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

	public function test_render__appends_the_verbatim_css_after_the_rules() {
		// Act.
		$css = $this->fallback()->render(
			[ self::rule( 'main-menu', null, self::DESKTOP, [ 'font-weight' => '650' ] ) ],
			self::CUSTOM_MEDIA_BLOCK
		);

		// Assert.
		$this->assertSame(
			"selector .elementor-nav-menu--main .elementor-item { font-weight: 650; }\n" . self::CUSTOM_MEDIA_BLOCK,
			$css
		);
	}
}
