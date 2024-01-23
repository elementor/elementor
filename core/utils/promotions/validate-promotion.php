<?php

namespace elementor\core\utils\promotions;

class Validate_Promotion {

	public static function domain_is_on_elementor_dot_com( $url ):bool {
		$domain = parse_url( $url, PHP_URL_HOST );
		if ( isset( $domain ) ) {

			$domain_segments = explode( '.', $domain );

			if ( count( $domain_segments ) >= 2 ) {
				$root_domain = $domain_segments[ count( $domain_segments ) - 2 ] . '.' . $domain_segments[ count( $domain_segments ) - 1 ];
				return 'elementor.com' === $root_domain;
			}
		}

		return false;
	}

}
