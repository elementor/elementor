<?php

namespace Elementor\Modules\AtomicWidgets\Parsers;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class CSS_Sanitizer {
	const DANGEROUS_PATTERNS = [
		'/expression\s*\(/i',
		'/javascript\s*:/i',
		'/behavior\s*:/i',
		'/-moz-binding\s*:/i',
	];

	public static function sanitize( string $css ): string {
		foreach ( self::DANGEROUS_PATTERNS as $pattern ) {
			$css = preg_replace( $pattern, '', $css );
		}

		return $css;
	}
}
