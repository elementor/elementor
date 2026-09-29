<?php

namespace Elementor\Tests\Phpunit\Elementor\Modules\Mcp\Abilities\Utils;

use Elementor\Modules\Mcp\Abilities\Utils\Atomic_Shell_Styles_Resolver;
use PHPUnit\Framework\TestCase;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Test_Atomic_Shell_Styles_Resolver extends TestCase {

	const FRONTEND_CSS = '.e-con{--width:100%;--position:relative;--padding-left:var(--container-default-padding-left,10px);--margin-left:0px;--z-index:revert;position:var(--position);width:var(--width);min-width:0;height:auto;z-index:var(--z-index);padding-inline-start:var(--padding-left);margin-inline-start:var(--margin-left)}'
		. '.e-con,.e-con>.e-con-inner{display:var(--display)}'
		. '.e-con:where(:not(.e-div-block-base)){transition:background .3s}'
		. ':is(.elementor-section-wrap,[data-elementor-id])>.e-con{--margin-left:auto;max-width:min(100%,var(--width))}'
		. '@media (max-width:767px){.e-con.e-flex{--width:50%}}';

	const KIT_CSS = '.e-con{--container-default-padding-left:24px}@media(max-width:1024px){.e-con{--container-default-padding-left:8px}}';

	public function test_to_map__resolves_variables_and_drops_declarations_without_visible_effect() {
		// Arrange.
		$resolver = new Atomic_Shell_Styles_Resolver( [ self::FRONTEND_CSS ] );

		// Act.
		$map = $resolver->to_map();

		// Assert.
		$this->assertSame( [
			'position' => 'relative',
			'width' => '100%',
			'min-width' => '0',
			'padding-inline-start' => '10px',
		], $map );
	}

	public function test_to_css_string__applies_kit_variables_per_breakpoint() {
		// Arrange.
		$resolver = new Atomic_Shell_Styles_Resolver( [ self::FRONTEND_CSS, self::KIT_CSS ] );

		// Act.
		$css = $resolver->to_css_string();

		// Assert.
		$this->assertSame(
			".e-con{position:relative;width:100%;min-width:0;padding-inline-start:24px;}\n@media (max-width:1024px){.e-con{padding-inline-start:8px;}}",
			$css
		);
	}

	public function test_to_css_string__adds_document_root_rules_for_top_level_elements() {
		// Arrange.
		$resolver = new Atomic_Shell_Styles_Resolver( [ self::FRONTEND_CSS ] );

		// Act.
		$css = $resolver->to_css_string( true );

		// Assert.
		$this->assertSame(
			'.e-con{position:relative;width:100%;min-width:0;padding-inline-start:10px;margin-inline-start:auto;max-width:min(100%,100%);}',
			$css
		);
	}

	public function test_to_css_string__ignores_rules_that_need_classes_atomic_elements_do_not_have() {
		// Arrange.
		$resolver = new Atomic_Shell_Styles_Resolver( [ self::FRONTEND_CSS ] );

		// Act.
		$css = $resolver->to_css_string();

		// Assert.
		$this->assertStringNotContainsString( '@media', $css );
		$this->assertStringNotContainsString( '50%', $css );
		$this->assertStringNotContainsString( 'transition', $css );
	}

	public function test_to_css_string__is_empty_without_stylesheets() {
		// Arrange.
		$resolver = new Atomic_Shell_Styles_Resolver( [] );

		// Act & Assert.
		$this->assertSame( '', $resolver->to_css_string() );
		$this->assertSame( [], $resolver->to_map() );
	}
}
