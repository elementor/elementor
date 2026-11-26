<?php

namespace Elementor\Modules\EditorOne\Classes;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class App_Link_Classifier {
	const APP_PAGE = 'elementor-app';

	const APP_ROUTES = [
		'/site-editor',
		'/kit-library',
	];

	public static function opens_in_app( string $url ): bool {
		parse_str( (string) wp_parse_url( $url, PHP_URL_QUERY ), $query );

		if ( self::APP_PAGE !== ( $query['page'] ?? '' ) ) {
			return false;
		}

		$route = '/' . trim( (string) wp_parse_url( $url, PHP_URL_FRAGMENT ), '/' );

		foreach ( self::APP_ROUTES as $app_route ) {
			if ( 0 === strpos( $route, $app_route ) ) {
				return true;
			}
		}

		return false;
	}
}
