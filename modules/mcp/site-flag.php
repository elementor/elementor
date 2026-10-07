<?php

namespace Elementor\Modules\Mcp;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Site_Flag {

	const OPTION_NAME = 'elementor_mcp_used';
	const NOTIFICATIONS_QUERY_KEY = 'mcp';
	const NOTIFICATIONS_HOST = 'my.elementor.com';
	const NOTIFICATIONS_PATH = '/api/v1/notifications';
	const CAPABILITY_TOKEN = 'compositions';

	public static function register(): void {
		add_filter( 'http_request_args', [ self::class, 'filter_notifications_request' ], 10, 2 );
		add_filter( 'elementor/generator_tag/capabilities', [ self::class, 'filter_generator_tag_capabilities' ] );
	}

	public static function mark(): void {
		if ( self::is_set() ) {
			return;
		}

		add_option( self::OPTION_NAME, '1', '', true );
	}

	public static function is_set(): bool {
		return ! empty( get_option( self::OPTION_NAME ) );
	}

	public static function filter_generator_tag_capabilities( $capabilities ) {
		if ( ! is_array( $capabilities ) || ! self::is_set_in_alloptions() ) {
			return $capabilities;
		}

		$capabilities[] = self::CAPABILITY_TOKEN;

		return $capabilities;
	}

	public static function filter_notifications_request( $args, $url ) {
		if ( ! is_array( $args ) || ! is_string( $url ) || ! self::is_notifications_endpoint( $url ) || ! self::is_set() ) {
			return $args;
		}

		$body = $args['body'] ?? [];

		if ( is_string( $body ) ) {
			$parsed = [];
			parse_str( $body, $parsed );
			$body = $parsed;
		}

		if ( ! is_array( $body ) ) {
			$body = [];
		}

		$body[ self::NOTIFICATIONS_QUERY_KEY ] = '1';
		$args['body'] = $body;

		return $args;
	}

	private static function is_set_in_alloptions(): bool {
		$alloptions = wp_load_alloptions();

		return ! empty( $alloptions[ self::OPTION_NAME ] );
	}

	private static function is_notifications_endpoint( string $url ): bool {
		$parts = wp_parse_url( $url );

		if ( ! is_array( $parts ) ) {
			return false;
		}

		$host = $parts['host'] ?? '';
		$path = isset( $parts['path'] ) ? untrailingslashit( $parts['path'] ) : '';

		return self::NOTIFICATIONS_HOST === $host && self::NOTIFICATIONS_PATH === $path;
	}
}
