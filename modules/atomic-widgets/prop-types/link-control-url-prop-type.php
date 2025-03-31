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

		$url = filter_var( $url, FILTER_SANITIZE_URL );

		if ( self::is_valid_url( $url ) ) {
			return true;
		}

		if ( self::is_valid_fragment( $url ) ) {
			return true;
		}

		if ( self::is_valid_domain( $url ) ) {
			return true;
		}

		if ( self::is_valid_ip( $url ) ) {
			return true;
		}

		return false;
	}

	private static function is_valid_url( $url ): bool {
		return filter_var( $url, FILTER_VALIDATE_URL );
	}

	private static function is_valid_fragment( $url ): bool {
		$fragment_hash_only_pattern = '/^#([\w\-]*)?$/';

		return preg_match( $fragment_hash_only_pattern, $url );
	}

	private static function is_valid_domain( $url ): bool {
		$domain_without_scheme_pattern = '/^([a-zA-Z0-9-]+)(\.[a-zA-Z]{2,})?(\/[\w\-\/]*)?(#[\w\-]*)?$/';

		return preg_match( $domain_without_scheme_pattern, $url );
	}

	private static function is_valid_ip( $url ): bool {
		return filter_var( $url, FILTER_VALIDATE_IP, FILTER_FLAG_IPV4 | FILTER_FLAG_IPV6 );
	}

	protected function validate_value( $value ): bool {
		return self::validate_url( $value );
	}

	protected function sanitize_value( $value ) {
		return esc_url_raw( $value );
	}
}
