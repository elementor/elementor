<?php

namespace Elementor\Tests\Phpunit\Elementor\Modules\AtomicWidgets\Styles;

use Elementor\Modules\AtomicWidgets\Styles\Style_Variants_To_Css;
use ElementorEditorTesting\Elementor_Test_Base;

/**
 * @group Elementor\Modules\AtomicWidgets\Styles
 */
class Test_Style_Variants_To_Css extends Elementor_Test_Base {

	public function test_to_css__returns_empty_string_for_empty_variants() {
		$this->assertSame( '', Style_Variants_To_Css::to_css( [] ) );
	}

	public function test_to_css__renders_desktop_base_declarations() {
		$variants = [
			$this->desktop_variant( [ 'color' => [ '$$type' => 'color', 'value' => '#fff' ] ] ),
		];

		$this->assertSame( 'color: #fff;', Style_Variants_To_Css::to_css( $variants ) );
	}

	public function test_to_css__wraps_pseudo_state_variants_in_ampersand_blocks() {
		$variants = [
			$this->desktop_variant( [ 'color' => [ '$$type' => 'color', 'value' => '#fff' ] ] ),
			$this->desktop_variant(
				[ 'color' => [ '$$type' => 'color', 'value' => '#f00' ] ],
				'hover'
			),
		];

		$css = Style_Variants_To_Css::to_css( $variants );

		$this->assertStringContainsString( 'color: #fff;', $css );
		$this->assertStringContainsString( '&:hover { color: #f00; }', $css );
	}

	public function test_to_css__wraps_non_desktop_variants_in_media_blocks() {
		$variants = [
			$this->desktop_variant( [ 'color' => [ '$$type' => 'color', 'value' => '#fff' ] ] ),
			$this->variant( 'mobile', null, [ 'color' => [ '$$type' => 'color', 'value' => '#000' ] ] ),
		];

		$css = Style_Variants_To_Css::to_css( $variants );

		$this->assertStringContainsString( 'color: #fff;', $css );
		$this->assertStringContainsString( '@media(--mobile) {', $css );
		$this->assertStringContainsString( 'color: #000;', $css );
	}

	public function test_to_css__inlines_decoded_custom_css_alongside_props() {
		$variants = [
			[
				'meta' => [ 'breakpoint' => 'desktop', 'state' => null ],
				'props' => [ 'color' => [ '$$type' => 'color', 'value' => '#fff' ] ],
				'custom_css' => [ 'raw' => base64_encode( 'outline: none;' ) ], // phpcs:ignore WordPress.PHP.DiscouragedPHPFunctions.obfuscation_base64_encode -- Test fixture.
			],
		];

		$css = Style_Variants_To_Css::to_css( $variants );

		$this->assertStringContainsString( 'color: #fff;', $css );
		$this->assertStringContainsString( 'outline: none;', $css );
	}

	public function test_to_css__combines_desktop_pseudo_and_media_variants() {
		$variants = [
			$this->desktop_variant( [ 'color' => [ '$$type' => 'color', 'value' => '#fff' ] ] ),
			$this->desktop_variant(
				[ 'color' => [ '$$type' => 'color', 'value' => '#0f0' ] ],
				'hover'
			),
			$this->variant( 'mobile', null, [ 'color' => [ '$$type' => 'color', 'value' => '#000' ] ] ),
			$this->variant( 'mobile', 'focus', [ 'color' => [ '$$type' => 'color', 'value' => '#00f' ] ] ),
		];

		$css = Style_Variants_To_Css::to_css( $variants );

		$this->assertStringContainsString( 'color: #fff;', $css );
		$this->assertStringContainsString( '&:hover { color: #0f0; }', $css );
		$this->assertStringContainsString( '@media(--mobile) {', $css );
		$this->assertStringContainsString( '&:focus { color: #00f; }', $css );
	}

	private function desktop_variant( array $props, ?string $state = null ): array {
		return $this->variant( 'desktop', $state, $props );
	}

	private function variant( string $breakpoint, ?string $state, array $props ): array {
		return [
			'meta' => [ 'breakpoint' => $breakpoint, 'state' => $state ],
			'props' => $props,
			'custom_css' => null,
		];
	}
}
