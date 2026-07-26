<?php

namespace Elementor\Modules\Mcp\Abilities\Utils;

use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Document_Preview_Html {

	public function wrap( int $post_id, string $html, string $css, array $fonts = [] ): string {
		$html = trim( $html );
		$css = trim( $css );

		if ( '' === $html && '' === $css ) {
			return '';
		}

		$head = $this->build_head( $css, $fonts );
		$body = sprintf(
			'<div class="elementor elementor-%1$d">%2$s</div>',
			$post_id,
			$html
		);

		return '<!DOCTYPE html><html><head><meta charset="utf-8">' . $head . '</head><body>' . $body . '</body></html>';
	}

	private function build_head( string $css, array $fonts ): string {
		$output = '';

		if ( ! empty( $fonts ) ) {
			$font_url = Plugin::$instance->frontend->get_stable_google_fonts_url( $fonts );

			$output .= sprintf(
				'<link rel="stylesheet" href="%s">',
				esc_url( $font_url )
			);
		}

		if ( '' !== $css ) {
			$output .= '<style>' . $css . '</style>';
		}

		return $output;
	}
}
