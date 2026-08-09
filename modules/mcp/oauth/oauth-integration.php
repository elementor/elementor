<?php

namespace Elementor\Modules\Mcp\Oauth;

use WPMedia\MCP\OAuth\Auth\JWT;
use WPMedia\MCP\OAuth\Auth\SecretManager;
use WPMedia\MCP\OAuth\Bootstrap;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Oauth_Integration {

	const OAUTH_SERVER_REST_PATH = 'mcp/mcp-oauth-server';

	const REWRITE_VERSION = '1';

	const REWRITE_OPTION = 'elementor_mcp_oauth_rewrite_version';

	public static function is_available(): bool {
		return class_exists( Bootstrap::class );
	}

	public static function is_oauth_transport_available(): bool {
		return class_exists( Bootstrap::class )
			&& class_exists( JWT::class )
			&& class_exists( SecretManager::class );
	}

	public static function is_enabled(): bool {
		if ( ! self::is_available() ) {
			return false;
		}

		/**
		 * Filters whether Elementor boots the MCP OAuth authorization server.
		 *
		 * Requires `wp-media/mcp-oauth`. When enabled, clients can authenticate via
		 * OAuth 2.1 against `/wp-json/elementor/mcp` (discovery at `/.well-known/oauth-*`).
		 * Application Password auth on the same endpoint remains available.
		 *
		 * @since 4.3.0
		 *
		 * @param bool $enabled Whether MCP OAuth is enabled. Default true when the package is present.
		 */
		return (bool) apply_filters( 'elementor/mcp/oauth/enabled', true );
	}

	public static function get_elementor_mcp_rest_url(): string {
		return get_rest_url( null, 'elementor/mcp' );
	}

	public static function remap_oauth_resource_url( $url, $path ) {
		$oauth_paths = [
			self::OAUTH_SERVER_REST_PATH,
			'/' . self::OAUTH_SERVER_REST_PATH,
		];

		if ( in_array( $path, $oauth_paths, true ) ) {
			return self::get_elementor_mcp_rest_url();
		}

		return $url;
	}

	public function register(): void {
		if ( ! self::is_enabled() ) {
			return;
		}

		Bootstrap::instance();

		( new Oauth_Client_Metadata() )->register();
		( new Oauth_Dynamic_Registration() )->register();
		( new Oauth_Discovery_Augmentation() )->register();

		add_filter( 'rest_url', [ self::class, 'remap_oauth_resource_url' ], 10, 2 );
		add_action( 'init', [ $this, 'maybe_flush_rewrite_rules' ], 20 );
	}

	public function maybe_flush_rewrite_rules(): void {
		if ( ! self::is_enabled() ) {
			return;
		}

		if ( ! $this->needs_rewrite_flush() ) {
			return;
		}

		flush_rewrite_rules( false );
		update_option( self::REWRITE_OPTION, self::REWRITE_VERSION, false );
	}

	private function needs_rewrite_flush(): bool {
		if ( get_option( self::REWRITE_OPTION ) !== self::REWRITE_VERSION ) {
			return true;
		}

		if ( '' === (string) get_option( 'permalink_structure' ) ) {
			return false;
		}

		$rules = get_option( 'rewrite_rules' );

		return ! is_array( $rules ) || ! array_key_exists( Oauth_Dynamic_Registration::REWRITE_RULE, $rules );
	}
}
