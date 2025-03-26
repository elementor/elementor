<?php

namespace Elementor\Modules\AtomicWidgets\PropTypes;

use Elementor\Modules\AtomicWidgets\PropTypes\Base\Plain_Prop_Type;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Link_Control_Url_Prop_Type extends Plain_Prop_Type {
	public static function get_key(): string {
		return 'url';
	}

	public static function validate_url( $value ): bool {
		$url = trim( $value );

		// Single regex to handle full URLs, domains, IPs, paths, and fragments
		if ( preg_match( '/^(https?:\/\/[a-zA-Z0-9\-\.]+(\.[a-zA-Z]{2,})?|#([\w\-]*)?|([a-zA-Z0-9-]+(\.[a-zA-Z]{2,})?|(\d{1,3}\.){3}\d{1,3}|[a-fA-F0-9:]+)?(\/[\w\-\/]*)?(#[\w\-]*)?)$/', $url ) ) {
			return $url;
		}

		return false;
	}

	protected function validate_value( $value ): bool {
		return self::validate_url( $value );
	}

	protected function sanitize_value( $value ) {
		return esc_url_raw( $value );
	}
}
