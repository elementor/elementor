<?php
namespace Elementor\Tests\Phpunit\Elementor\Modules\Promotions;

use Elementor\Modules\Promotions\Rendered_Html_Sanitizer;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Test_Rendered_Html_Sanitizer extends Elementor_Test_Base {

	public function test_sanitize_returns_empty_string_for_blank_input() {
		$this->assertSame( '', Rendered_Html_Sanitizer::sanitize( '' ) );
		$this->assertSame( '', Rendered_Html_Sanitizer::sanitize( '   ' ) );
	}

	public function test_sanitize_preserves_simple_section_markup() {
		$html = '<div class="hero"><span>Shop Smart</span></div>';

		$this->assertSame( $html, Rendered_Html_Sanitizer::sanitize( $html ) );
	}

	public function test_sanitize_preserves_style_blocks_while_stripping_scripts_and_document_noise() {
		$html = '<head><style>.head-style{color:red}</style><meta charset="UTF-8"></head>'
			. '<body><style>.body-style{display:inline}</style>'
			. '<script>var wc_order_attribution = {};</script>'
			. '<div class="elementor-widget-animated-headline">Bold Style</div></body>';

		$sanitized = Rendered_Html_Sanitizer::sanitize( $html );

		$this->assertSame(
			'<style>.head-style{color:red}</style><style>.body-style{display:inline}</style><div class="elementor-widget-animated-headline">Bold Style</div>',
			$sanitized
		);
	}

	public function test_sanitize_for_display_allows_style_tags() {
		$html = '<style>.hero{color:red}</style><div class="hero">Content</div>';

		$sanitized = Rendered_Html_Sanitizer::sanitize_for_display( $html );

		$this->assertStringContainsString( '<style>.hero{color:red}</style>', $sanitized );
		$this->assertStringContainsString( 'Content', $sanitized );
	}
}
