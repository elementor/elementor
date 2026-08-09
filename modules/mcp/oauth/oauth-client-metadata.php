<?php

namespace Elementor\Modules\Mcp\Oauth;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Oauth_Client_Metadata {

	const CLIENT_PATH = '/oauth/elementor-mcp-client';

	const QUERY_VAR = 'elementor_mcp_oauth_cimd';

	const PUBLISHER_SLUG = 'elementor-mcp-remote';

	const CLIENT_NAME = 'Elementor MCP Remote';

	public static function get_client_id(): string {
		return set_url_scheme( home_url( self::CLIENT_PATH ), 'https' );
	}

	public static function get_loopback_redirect_uris(): array {
		return [
			'http://127.0.0.1/oauth/callback',
			'http://localhost/oauth/callback',
			'http://[::1]/oauth/callback',
		];
	}

	public static function get_metadata_document(): array {
		return [
			'client_id' => self::get_client_id(),
			'client_name' => self::CLIENT_NAME,
			'client_uri' => home_url(),
			'redirect_uris' => self::get_loopback_redirect_uris(),
			'grant_types' => [ 'authorization_code', 'refresh_token' ],
			'response_types' => [ 'code' ],
			'token_endpoint_auth_method' => 'none',
		];
	}

	public static function append_trusted_publisher( array $publishers ): array {
		$client_id = self::get_client_id();
		$host = (string) wp_parse_url( $client_id, PHP_URL_HOST );

		if ( '' === $host ) {
			return $publishers;
		}

		$publishers[ self::PUBLISHER_SLUG ] = [
			'client_ids' => [ $client_id ],
			'host' => $host,
		];

		return $publishers;
	}

	public static function preseed_cimd_cache( array $extra_redirect_uris = [] ): void {
		$client_id = self::get_client_id();
		$redirect_uris = self::normalize_redirect_uris(
			array_merge( self::get_loopback_redirect_uris(), $extra_redirect_uris )
		);
		$metadata = self::get_metadata_document();

		$record = [
			'client_id' => $client_id,
			'client_name' => $metadata['client_name'],
			'client_uri' => $metadata['client_uri'],
			'redirect_uris' => $redirect_uris,
			'grant_types' => $metadata['grant_types'],
			'token_endpoint_auth_method' => 'none',
			'source' => 'cimd',
			'verified' => true,
			'publisher' => self::PUBLISHER_SLUG,
		];

		set_transient( 'mcp_cimd_' . md5( $client_id ), $record, DAY_IN_SECONDS );
	}

	public function register(): void {
		if ( ! Oauth_Integration::is_enabled() ) {
			return;
		}

		add_filter( 'wpmedia_mcp_oauth_trusted_publishers', [ self::class, 'append_trusted_publisher' ] );
		add_action( 'init', [ $this, 'register_rewrite_rules' ], 1 );
		add_filter( 'query_vars', [ $this, 'add_query_vars' ] );
		add_action( 'init', [ $this, 'preseed_cimd_cache_on_init' ], 30 );
		add_action( 'template_redirect', [ $this, 'serve_metadata_document' ] );
	}

	public function register_rewrite_rules(): void {
		$path = ltrim( self::CLIENT_PATH, '/' );

		add_rewrite_rule(
			'^' . preg_quote( $path, '/' ) . '/?$',
			'index.php?' . self::QUERY_VAR . '=1',
			'top'
		);
	}

	public function add_query_vars( array $vars ): array {
		$vars[] = self::QUERY_VAR;

		return $vars;
	}

	public function preseed_cimd_cache_on_init(): void {
		self::preseed_cimd_cache();
	}

	public function serve_metadata_document(): void {
		if ( '1' !== (string) get_query_var( self::QUERY_VAR, '' ) ) {
			return;
		}

		if ( ! Oauth_Integration::is_enabled() ) {
			status_header( 404 );
			exit;
		}

		wp_send_json( self::get_metadata_document() );
	}

	private static function normalize_redirect_uris( array $redirect_uris ): array {
		return array_values(
			array_unique(
				array_filter(
					array_map( 'esc_url_raw', array_map( 'strval', $redirect_uris ) )
				)
			)
		);
	}
}
