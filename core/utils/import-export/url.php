<?php

namespace Elementor\Core\Utils\ImportExport;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

class Url {

	public static function migrate( $url, $base_url = '' ) {
		$full_url = $url;

		if ( ! empty( $base_url ) ) {
			$url = str_replace( $base_url, '', $url );
		}

		$parsed = wp_parse_url( $url );

		if ( ! empty( $parsed['path'] ) ) {
			$page = get_page_by_path( $parsed['path'] );
			if ( ! $page ) {

				// If the page not found return the original full url.
				return $full_url;
			}

			$permalink = get_permalink( $page->ID );
		}

		if ( empty( $permalink ) ) {
			return $full_url;
		}

		if ( ! empty( $parsed['query'] ) ) {
			$permalink_query = wp_parse_url( $permalink, PHP_URL_QUERY );

			// Clean the query from wp queries.
			parse_str( $parsed['query'], $parse_str_query_result );

			if ( is_array( $parse_str_query_result ) ) {
				unset( $parse_str_query_result['p'] );
				unset( $parse_str_query_result['page_id'] );

				$parsed['query'] = http_build_query( $parse_str_query_result );
			}

			if ( empty( $permalink_query ) ) {
				$permalink .= '?' . $parsed['query'];
			} else {
				$permalink .= '&' . $parsed['query'];
			}
		}

		if ( ! empty( $parsed['fragment'] ) ) {
			$permalink .= '#' . $parsed['fragment'];
		}

		return wp_make_link_relative( $permalink );
	}
}
