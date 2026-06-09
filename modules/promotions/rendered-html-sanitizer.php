<?php

namespace Elementor\Modules\Promotions;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Rendered_Html_Sanitizer {

	private const DOCUMENT_NOISE_PATTERNS = [
		'/<head\b[^>]*>.*?<\/head>/is',
		'/<style\b[^>]*>.*?<\/style>/is',
		'/<script\b[^>]*>.*?<\/script>/is',
		'/<link\b[^>]*>/is',
		'/<meta\b[^>]*>/is',
		'/<title\b[^>]*>.*?<\/title>/is',
		'/<noscript\b[^>]*>.*?<\/noscript>/is',
	];

	public static function sanitize( string $html ): string {
		if ( '' === trim( $html ) ) {
			return '';
		}

		$html = self::extract_body_content( $html );

		foreach ( self::DOCUMENT_NOISE_PATTERNS as $pattern ) {
			$html = preg_replace( $pattern, '', $html );
		}

		return trim( $html );
	}

	private static function extract_body_content( string $html ): string {
		if ( preg_match( '/<body\b[^>]*>(.*)<\/body>/is', $html, $matches ) ) {
			return $matches[1];
		}

		return $html;
	}
}
