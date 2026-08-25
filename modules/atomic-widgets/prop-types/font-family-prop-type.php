<?php

namespace Elementor\Modules\AtomicWidgets\PropTypes;

use Elementor\Modules\AtomicWidgets\PropTypes\Contracts\Font_Enqueueable;
use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\String_Prop_Type;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Font_Family_Prop_Type extends String_Prop_Type implements Font_Enqueueable {
	public static function get_key(): string {
		return 'font-family';
	}

	public static function normalize_family_name( string $value ): string {
		$trimmed = trim( $value );
		$comma_pos = strpos( $trimmed, ',' );

		if ( false === $comma_pos ) {
			return self::unquote_family_name( $trimmed );
		}

		$before_comma = substr( $trimmed, 0, $comma_pos );

		if ( str_contains( $before_comma, '(' ) ) {
			return $trimmed;
		}

		return self::unquote_family_name( trim( $before_comma ) );
	}

	private static function unquote_family_name( string $value ): string {
		if (
			( str_starts_with( $value, '"' ) && str_ends_with( $value, '"' ) )
			|| ( str_starts_with( $value, "'" ) && str_ends_with( $value, "'" ) )
		) {
			return trim( substr( $value, 1, -1 ) );
		}

		return $value;
	}

	public function get_enqueue_font_family( $stored_value ): ?string {
		if ( ! is_string( $stored_value ) ) {
			return null;
		}

		$normalized = self::normalize_family_name( $stored_value );

		if ( '' === $normalized || str_contains( $normalized, '(' ) ) {
			return null;
		}

		return $normalized;
	}

	protected function sanitize_value( $value ) {
		if ( is_string( $value ) ) {
			$value = self::normalize_family_name( $value );
		}

		return parent::sanitize_value( $value );
	}
}
