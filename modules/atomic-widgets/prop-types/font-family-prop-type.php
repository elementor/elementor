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

	public function get_enqueue_font_family( $stored_value ): ?string {
		return $this->normalize_stored_value( $stored_value );
	}

	public function format_for_css( $stored_value ): ?string {
		return $this->normalize_stored_value( $stored_value );
	}

	private function normalize_stored_value( $stored_value ): ?string {
		if ( ! is_string( $stored_value ) ) {
			return null;
		}

		$normalized = trim( $stored_value );

		return '' === $normalized ? null : $normalized;
	}
}
