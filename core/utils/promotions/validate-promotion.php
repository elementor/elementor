<?php

namespace Elementor\Core\Utils\Promotions;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Validate_Promotion {

	public static function domain_is_on_elementor_dot_com( $url ): bool {
		$domain = wp_parse_url( $url, PHP_URL_HOST );
		return isset( $domain ) && str_contains( $domain, 'elementor.com' );
	}
}
