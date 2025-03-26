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

		// Allow full URLs with scheme (http, https)
		if ( filter_var( $url, FILTER_VALIDATE_URL ) !== false ) {
			return $url;
		}

		// Allow fragments (e.g., "#", "#my-div")
		if ( preg_match( '/^#([\w\-]*)?$/', $url ) ) {
			return $url;
		}

		// Allow domain names without scheme (e.g., google.com, google)
		if ( preg_match( '/^([a-zA-Z0-9-]+)(\.[a-zA-Z]{2,})?(\/[\w\-\/]*)?(#[\w\-]*)?$/', $url ) ) {
			return $url;
		}

		// Allow valid IP addresses (IPv4 & IPv6)
		if ( filter_var( $url, FILTER_VALIDATE_IP, FILTER_FLAG_IPV4 | FILTER_FLAG_IPV6 ) ) {
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
