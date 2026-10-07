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

	const TOOL_CAPABILITIES = [
		'elementor/build-composition' => 'compositions',
		'elementor/manage-elements' => 'elements',
		'elementor/manage-component' => 'components',
		'elementor/manage-classes' => 'classes',
		'elementor/manage-global-variable' => 'variables',
		'elementor/manage-default-styles' => 'default-styles',
		'elementor/reorder-classes' => 'class-order',
		'elementor/create-page' => 'pages',
		'elementor/publish-document' => 'publish',
		'elementor/update-page-settings' => 'site-settings',
	];

	public static function register(): void {
		add_filter( 'http_request_args', [ self::class, 'filter_notifications_request' ], 10, 2 );
		add_filter( 'elementor/generator_tag/capabilities', [ self::class, 'filter_generator_tag_capabilities' ] );
	}

	public static function capability_for_ability( string $ability_id ): ?string {
		return self::TOOL_CAPABILITIES[ $ability_id ] ?? null;
	}

	public static function mark( string $capability ): void {
		if ( '' === $capability ) {
			return;
		}

		$existing = get_option( self::OPTION_NAME, false );
		$tokens = self::parse_tokens( false === $existing ? '' : $existing );

		if ( in_array( $capability, $tokens, true ) ) {
			return;
		}

		$tokens[] = $capability;
		$value = implode( ',', $tokens );

		if ( false === $existing ) {
			add_option( self::OPTION_NAME, $value, '', true );
			return;
		}

		update_option( self::OPTION_NAME, $value );
	}

	public static function is_set(): bool {
		return ! empty( self::parse_tokens( get_option( self::OPTION_NAME, '' ) ) );
	}

	public static function filter_generator_tag_capabilities( $capabilities ) {
		if ( ! is_array( $capabilities ) ) {
			return $capabilities;
		}

		foreach ( self::get_tokens_from_alloptions() as $token ) {
			if ( ! in_array( $token, $capabilities, true ) ) {
				$capabilities[] = $token;
			}
		}

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

	/**
	 * @param mixed $raw
	 * @return string[]
	 */
	public static function parse_tokens( $raw ): array {
		if ( is_array( $raw ) ) {
			return array_values( array_filter( array_map( 'strval', $raw ) ) );
		}

		if ( ! is_string( $raw ) || '' === $raw ) {
			return [];
		}

		if ( '1' === $raw ) {
			return [ self::TOOL_CAPABILITIES['elementor/build-composition'] ];
		}

		$tokens = array_map( 'trim', explode( ',', $raw ) );

		return array_values( array_filter( $tokens, function ( $token ) {
			return '' !== $token;
		} ) );
	}

	private static function get_tokens_from_alloptions(): array {
		$alloptions = wp_load_alloptions();
		$raw = $alloptions[ self::OPTION_NAME ] ?? '';

		return self::parse_tokens( $raw );
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
