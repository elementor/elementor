<?php

namespace Elementor\Modules\EditorOne\Classes;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Url_Matcher {

	public function get_match_score( string $menu_url, string $current_uri ): int {
		$menu_parsed = wp_parse_url( $menu_url );

		if ( empty( $menu_parsed['path'] ) ) {
			return -1;
		}

		$current_parsed = wp_parse_url( $current_uri );

		if ( empty( $current_parsed['path'] ) ) {
			return -1;
		}

		if ( basename( $menu_parsed['path'] ) !== basename( $current_parsed['path'] ) ) {
			return -1;
		}

		$menu_query = $this->parse_query_string( $menu_parsed['query'] ?? '' );
		$current_query = $this->parse_query_string( $current_parsed['query'] ?? '' );

		if ( ! $this->query_params_match( $menu_query, $current_query ) ) {
			return -1;
		}

		return count( $menu_query );
	}

	public function parse_query_string( string $query ): array {
		$params = [];

		if ( '' !== $query ) {
			parse_str( $query, $params );
		}

		return $params;
	}

	public function query_params_match( array $required, array $actual ): bool {
		foreach ( $required as $key => $value ) {
			if ( ! isset( $actual[ $key ] ) || $actual[ $key ] !== $value ) {
				return false;
			}
		}

		return true;
	}
}
