<?php

namespace Elementor\Tests\Phpunit\Elementor\Modules\AtomicWidgets\Styles;

use Elementor\Modules\AtomicWidgets\Styles\Local_Style;
use ElementorEditorTesting\Elementor_Test_Base;

/**
 * @group Elementor\Modules\AtomicWidgets\Styles
 */
class Test_Local_Style extends Elementor_Test_Base {

	public function test_from_styles_map__returns_null_for_empty_input() {
		$this->assertNull( Local_Style::from_styles_map( [] ) );
	}

	public function test_from_styles_map__returns_null_when_variants_are_missing() {
		$local_style = Local_Style::from_styles_map( [
			's-xyz' => [ 'id' => 's-xyz', 'variants' => [] ],
		] );

		$this->assertNull( $local_style );
	}

	public function test_to_css__renders_desktop_base_declarations() {
		$local_style = $this->make_local_style( [
			$this->desktop_variant( [ 'color' => [ '$$type' => 'color', 'value' => '#fff' ] ] ),
		] );

		$this->assertSame( 'color: #fff;', $local_style->to_css() );
	}

	public function test_to_css__wraps_pseudo_state_variants_in_ampersand_blocks() {
		$local_style = $this->make_local_style( [
			$this->desktop_variant( [ 'color' => [ '$$type' => 'color', 'value' => '#fff' ] ] ),
			$this->desktop_variant(
				[ 'color' => [ '$$type' => 'color', 'value' => '#f00' ] ],
				'hover'
			),
		] );

		$css = $local_style->to_css();

		$this->assertStringContainsString( 'color: #fff;', $css );
		$this->assertStringContainsString( '&:hover { color: #f00; }', $css );
	}

	public function test_to_css__wraps_non_desktop_variants_in_media_blocks() {
		$local_style = $this->make_local_style( [
			$this->desktop_variant( [ 'color' => [ '$$type' => 'color', 'value' => '#fff' ] ] ),
			$this->variant( 'mobile', null, [ 'color' => [ '$$type' => 'color', 'value' => '#000' ] ] ),
		] );

		$css = $local_style->to_css();

		$this->assertStringContainsString( 'color: #fff;', $css );
		$this->assertStringContainsString( '@media(--mobile) {', $css );
		$this->assertStringContainsString( 'color: #000;', $css );
	}

	public function test_to_css__inlines_decoded_custom_css_alongside_props() {
		$local_style = $this->make_local_style( [
			[
				'meta' => [ 'breakpoint' => 'desktop', 'state' => null ],
				'props' => [ 'color' => [ '$$type' => 'color', 'value' => '#fff' ] ],
				'custom_css' => [ 'raw' => base64_encode( 'outline: none;' ) ], // phpcs:ignore WordPress.PHP.DiscouragedPHPFunctions.obfuscation_base64_encode -- Test fixture.
			],
		] );

		$css = $local_style->to_css();

		$this->assertStringContainsString( 'color: #fff;', $css );
		$this->assertStringContainsString( 'outline: none;', $css );
	}

	public function test_to_css__combines_desktop_pseudo_and_media_variants() {
		$local_style = $this->make_local_style( [
			$this->desktop_variant( [ 'color' => [ '$$type' => 'color', 'value' => '#fff' ] ] ),
			$this->desktop_variant(
				[ 'color' => [ '$$type' => 'color', 'value' => '#0f0' ] ],
				'hover'
			),
			$this->variant( 'mobile', null, [ 'color' => [ '$$type' => 'color', 'value' => '#000' ] ] ),
			$this->variant( 'mobile', 'focus', [ 'color' => [ '$$type' => 'color', 'value' => '#00f' ] ] ),
		] );

		$css = $local_style->to_css();

		$this->assertStringContainsString( 'color: #fff;', $css );
		$this->assertStringContainsString( '&:hover { color: #0f0; }', $css );
		$this->assertStringContainsString( '@media(--mobile) {', $css );
		$this->assertStringContainsString( '&:focus { color: #00f; }', $css );
	}

	public function test_id__returns_first_entry_id() {
		$local_style = $this->make_local_style(
			[ $this->desktop_variant( [ 'color' => [ '$$type' => 'color', 'value' => '#fff' ] ] ) ],
			'e-widget1-abc'
		);

		$this->assertSame( 'e-widget1-abc', $local_style->id() );
	}

	private function make_local_style( array $variants, string $id = 's-xyz' ): Local_Style {
		return Local_Style::from_styles_map( [
			$id => [
				'id' => $id,
				'type' => 'class',
				'label' => 'local',
				'variants' => $variants,
			],
		] );
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
