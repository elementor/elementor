<?php

namespace Elementor\core\utils\promotions;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Validate_Promotion {

	public static function domain_is_on_elementor_dot_com( $url ) {
		$domain = parse_url( $url, PHP_URL_HOST );
		if ( ! isset( $domain ) ) {
			return false;
		}

		$domain_segments = explode( '.', $domain );

		if ( ! count( $domain_segments ) >= 2 ) {
			return false;
		}

		$root_domain = $domain_segments[ count( $domain_segments ) - 2 ] . '.' . $domain_segments[ count( $domain_segments ) - 1 ];
		return 'elementor.com' === $root_domain;
	}
}
