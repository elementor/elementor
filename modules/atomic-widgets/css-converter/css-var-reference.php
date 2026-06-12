<?php

namespace Elementor\Modules\AtomicWidgets\CssConverter;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Css_Var_Reference {
	public static function parse( string $value ): ?string {
		$value = trim( $value );

		if ( ! preg_match( '/^var\(\s*(--)?([^,\s)]+)/i', $value, $matches ) ) {
			return null;
		}

		$token = trim( $matches[2] );

		return '' === $token ? null : ltrim( $token, '-' );
	}
}
