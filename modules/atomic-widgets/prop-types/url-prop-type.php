<?php

namespace Elementor\Modules\AtomicWidgets\PropTypes;

use Elementor\Modules\AtomicWidgets\PropTypes\Base\Plain_Prop_Type;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Url_Prop_Type extends Plain_Prop_Type {
	public static function get_key(): string {
		return 'url';
	}

	public static function validate_url( $value ): bool {
		$url = trim( $value );

		// Allow full URLs with scheme
		if ( filter_var( $url, FILTER_VALIDATE_URL ) ) {
			return true;
		}

		// Allow domains, single-word domains, paths, fragments, and "#"
		if ( preg_match( '/^(#|[a-zA-Z0-9-]+(\.[a-zA-Z]{2,})?(\/[\w\-\/#]*)?)$/', $url ) ) {
			return true;
		}

		// Allow valid IP addresses (IPv4 & IPv6)
		if ( filter_var( $url, FILTER_VALIDATE_IP, FILTER_FLAG_IPV4 | FILTER_FLAG_IPV6 ) ) {
			return true;
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
