<?php

namespace Elementor\Modules\DataFlow;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * Server-rendered counterpart of the runtime's CSS variable writer (`actions/css-vars.js`): state keys become
 * `--e-state-<key>` so styles can read them through `var()` on first paint.
 */
class State_Css_Vars {
	const PREFIX = '--e-state-';
	const SAFE_STRING_PATTERN = '/^[\w#.%\s(),+-]*$/';
	const MAX_STRING_LENGTH = 200;
	const DECIMALS = 4;

	public static function to_value( $value ): ?string {
		if ( is_bool( $value ) ) {
			return $value ? '1' : '0';
		}

		if ( is_int( $value ) || is_float( $value ) ) {
			return is_finite( (float) $value ) ? (string) round( $value, self::DECIMALS ) : null;
		}

		if ( is_string( $value ) && strlen( $value ) <= self::MAX_STRING_LENGTH && preg_match( self::SAFE_STRING_PATTERN, $value ) ) {
			return $value;
		}

		return null;
	}

	public static function to_declarations( array $state ): string {
		$declarations = [];

		foreach ( $state as $key => $value ) {
			$css_value = is_string( $key ) && preg_match( State_Params::KEY_PATTERN, $key ) ? self::to_value( $value ) : null;

			if ( null !== $css_value && '' !== $css_value ) {
				$declarations[] = self::PREFIX . $key . ':' . $css_value;
			}
		}

		return implode( ';', $declarations );
	}
}
