<?php

namespace Elementor\Tests\Phpunit\Elementor\Modules\Mcp\Abilities\Utils;

use Elementor\Modules\Mcp\Abilities\Utils\Atomic_Container_Presentation;
use PHPUnit\Framework\TestCase;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Test_Atomic_Container_Presentation extends TestCase {

	const CONTAINER_SCSS = 'assets/dev/scss/frontend/_container.scss';

	const SIZE_VALUE = [
		'$$type' => 'size',
		'value' => [
			'size' => 10,
			'unit' => 'px',
		],
	];

	public function test_to_map__returns_the_shell_declarations() {
		// Act.
		$map = Atomic_Container_Presentation::to_map();

		// Assert.
		$this->assertSame( [
			'position' => 'relative',
			'width' => '100%',
			'min-width' => '0',
		], $map );
	}

	public function test_to_css_string__returns_the_shell_rule_when_base_styles_set_nothing() {
		// Act.
		$css = Atomic_Container_Presentation::to_css_string();

		// Assert.
		$this->assertSame( '.e-con{position:relative;width:100%;min-width:0;}', $css );
	}

	public function test_to_css_string__omits_declarations_the_desktop_base_styles_set() {
		// Arrange.
		$base_styles = $this->base_styles( [
			$this->variant( [ 'width', 'min-width' ] ),
			$this->variant( [ 'position' ], 'mobile' ),
			$this->variant( [ 'position' ], null, 'hover' ),
		] );

		// Act.
		$css = Atomic_Container_Presentation::to_css_string( $base_styles );

		// Assert.
		$this->assertSame( '.e-con{position:relative;}', $css );
	}

	public function test_to_css_string__returns_empty_when_base_styles_set_every_declaration() {
		// Arrange.
		$base_styles = $this->base_styles( [ $this->variant( [ 'position', 'width', 'min-width' ] ) ] );

		// Act.
		$css = Atomic_Container_Presentation::to_css_string( $base_styles );

		// Assert.
		$this->assertSame( '', $css );
	}

	public function test_to_css_string__adds_document_root_rules_unless_base_margin_overrides_them() {
		// Arrange.
		$base_styles = $this->base_styles( [ $this->variant( [ 'margin' ] ) ] );

		// Act.
		$root_css = Atomic_Container_Presentation::to_css_string( [], true );
		$root_css_with_base_margin = Atomic_Container_Presentation::to_css_string( $base_styles, true );

		// Assert.
		$this->assertSame(
			'.e-con{position:relative;width:100%;min-width:0;margin-inline-start:auto;margin-inline-end:auto;max-width:100%;}',
			$root_css
		);
		$this->assertSame( '.e-con{position:relative;width:100%;min-width:0;max-width:100%;}', $root_css_with_base_margin );
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
			':is( .elementor-section-wrap, [data-elementor-id] ) > & {',
			'--margin-left: auto;',
			'--margin-right: auto;',
			'max-width: min(100%, var(--width));',
		];

		// Act.
		$missing = array_values( array_filter( $mirrored_declarations, fn( $declaration ) => ! str_contains( $scss, $declaration ) ) );

		// Assert.
		$this->assertSame( [], $missing, self::CONTAINER_SCSS . ' changed; update Atomic_Container_Presentation to match.' );
	}

	private function base_styles( array $variants ): array {
		return [
			'e-test-base' => [
				'id' => 'e-test-base',
				'variants' => $variants,
			],
		];
	}

	private function variant( array $properties, ?string $breakpoint = 'desktop', ?string $state = null ): array {
		return [
			'meta' => [
				'breakpoint' => $breakpoint,
				'state' => $state,
			],
			'props' => array_fill_keys( $properties, self::SIZE_VALUE ),
		];
	}
}
