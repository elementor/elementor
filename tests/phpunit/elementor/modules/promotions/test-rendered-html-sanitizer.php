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

	public function test_sanitize_strips_document_noise_from_preview_html() {
		$html = '<head><style>.wp-emoji{display:inline}</style><meta charset="UTF-8"></head>'
			. '<body><script>var wc_order_attribution = {};</script>'
			. '<div class="elementor-widget-animated-headline">Bold Style</div></body>';

		$sanitized = Rendered_Html_Sanitizer::sanitize( $html );

		$this->assertSame( '<div class="elementor-widget-animated-headline">Bold Style</div>', $sanitized );
	}
}
