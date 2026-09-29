<?php

namespace Elementor\Tests\Phpunit\Elementor\Modules\Mcp\Abilities\Utils;

use Elementor\Modules\Mcp\Abilities\Utils\Atomic_Shell_Styles;
use PHPUnit\Framework\TestCase;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Test_Atomic_Shell_Styles extends TestCase {

	const CONTAINER_SCSS = 'assets/dev/scss/frontend/_container.scss';

	const BREAKPOINTS = [
		'mobile' => [
			'value' => 767,
			'direction' => 'max',
			'is_enabled' => true,
		],
		'tablet' => [
			'value' => 1024,
			'direction' => 'max',
			'is_enabled' => true,
		],
		'widescreen' => [
			'value' => 2400,
			'direction' => 'min',
			'is_enabled' => false,
		],
	];

	const FIXED_DECLARATIONS = 'position:relative;width:100%;min-width:0;';

	public function test_to_map__uses_the_default_container_padding_when_the_kit_has_none() {
		// Arrange.
		$shell = new Atomic_Shell_Styles( [], self::BREAKPOINTS );

		// Act.
		$map = $shell->to_map();

		// Assert.
		$this->assertSame( [
			'position' => 'relative',
			'width' => '100%',
			'min-width' => '0',
			'padding-inline-start' => '10px',
			'padding-inline-end' => '10px',
		], $map );
	}

	public function test_to_css_string__emits_kit_padding_per_breakpoint_and_inherits_unset_ones() {
		// Arrange.
		$shell = new Atomic_Shell_Styles( [
			'desktop' => $this->padding( '24' ),
			'tablet' => $this->padding( '8' ),
			'mobile' => $this->padding( '' ),
		], self::BREAKPOINTS );

		// Act.
		$css = $shell->to_css_string();

		// Assert.
		$this->assertSame(
			'.e-con{' . self::FIXED_DECLARATIONS . "padding-inline-start:24px;padding-inline-end:24px;}\n"
			. '@media(max-width:1024px){.e-con{padding-inline-start:8px;padding-inline-end:8px;}}',
			$css
		);
	}

	public function test_to_css_string__omits_zero_desktop_padding_but_keeps_a_zero_breakpoint_override() {
		// Arrange.
		$shell = new Atomic_Shell_Styles( [
			'desktop' => $this->padding( '0' ),
			'tablet' => $this->padding( '16' ),
			'mobile' => $this->padding( '0' ),
		], self::BREAKPOINTS );

		// Act.
		$css = $shell->to_css_string();

		// Assert.
		$this->assertSame(
			'.e-con{' . self::FIXED_DECLARATIONS . "}\n"
			. "@media(max-width:1024px){.e-con{padding-inline-start:16px;padding-inline-end:16px;}}\n"
			. '@media(max-width:767px){.e-con{padding-inline-start:0px;padding-inline-end:0px;}}',
			$css
		);
	}

	public function test_to_css_string__ignores_disabled_breakpoints() {
		// Arrange.
		$shell = new Atomic_Shell_Styles( [
			'desktop' => $this->padding( '0' ),
			'widescreen' => $this->padding( '40' ),
		], self::BREAKPOINTS );

		// Act.
		$css = $shell->to_css_string();

		// Assert.
		$this->assertSame( '.e-con{' . self::FIXED_DECLARATIONS . '}', $css );
	}

	public function test_to_css_string__adds_document_root_rules_for_top_level_elements() {
		// Arrange.
		$shell = new Atomic_Shell_Styles( [ 'desktop' => $this->padding( '0' ) ], self::BREAKPOINTS );

		// Act.
		$css = $shell->to_css_string( true );

		// Assert.
		$this->assertSame(
			'.e-con{' . self::FIXED_DECLARATIONS . 'margin-inline-start:auto;margin-inline-end:auto;max-width:100%;}',
			$css
		);
	}

	public function test_declared_shell_still_matches_the_frontend_container_scss() {
		// Arrange.
		$scss = file_get_contents( ELEMENTOR_PATH . self::CONTAINER_SCSS );
		$mirrored_declarations = [
			'--width: 100%;',
			'width: var(--width);',
			'--position: relative;',
			'position: var(--position);',
			'min-width: 0;',
			'--padding-left: var(--container-default-padding-left, 10px);',
			'--padding-right: var(--container-default-padding-right, 10px);',
			'--padding-inline-start: var(--padding-left);',
			'--padding-inline-end: var(--padding-right);',
			'padding-inline-start: var(--padding-inline-start);',
			'padding-inline-end: var(--padding-inline-end);',
			':is( .elementor-section-wrap, [data-elementor-id] ) > & {',
			'--margin-left: auto;',
			'--margin-right: auto;',
			'max-width: min(100%, var(--width));',
		];

		// Act.
		$missing = array_values( array_filter( $mirrored_declarations, fn( $declaration ) => ! str_contains( $scss, $declaration ) ) );

		// Assert.
		$this->assertSame( [], $missing, self::CONTAINER_SCSS . ' changed; update Atomic_Shell_Styles to match.' );
	}

	private function padding( string $inline_value ): array {
		return [
			'unit' => 'px',
			'top' => $inline_value,
			'right' => $inline_value,
			'bottom' => $inline_value,
			'left' => $inline_value,
			'isLinked' => true,
		];
	}
}
