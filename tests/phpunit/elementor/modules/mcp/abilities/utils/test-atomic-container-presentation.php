<?php

namespace Elementor\Tests\Phpunit\Elementor\Modules\Mcp\Abilities\Utils;

use Elementor\Modules\Mcp\Abilities\Utils\Atomic_Container_Presentation;
use PHPUnit\Framework\TestCase;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Test_Atomic_Container_Presentation extends TestCase {

	const CONTAINER_SCSS = 'assets/dev/scss/frontend/_container.scss';

	public function test_to_css_string__adds_document_root_rules_only_for_top_level_elements() {
		// Act.
		$nested_css = Atomic_Container_Presentation::to_css_string( false );
		$root_css = Atomic_Container_Presentation::to_css_string( true );

		// Assert.
		$this->assertSame( '.e-con{position:relative;width:100%;min-width:0;}', $nested_css );
		$this->assertSame(
			'.e-con{position:relative;width:100%;min-width:0;margin-inline-start:auto;margin-inline-end:auto;max-width:100%;}',
			$root_css
		);
	}

	public function test_hardcoded_shell_still_matches_the_frontend_container_scss() {
		// Arrange.
		$scss = file_get_contents( ELEMENTOR_PATH . self::CONTAINER_SCSS );
		$mirrored_declarations = [
			'--position: relative;',
			'--width: 100%;',
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
}
