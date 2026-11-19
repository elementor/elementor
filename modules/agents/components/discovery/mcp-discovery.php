<?php

namespace Elementor\Modules\Agents\Components\Discovery;

use Elementor\MCP\Composer\Admin\McpSettingsController;
use Elementor\MCP\Composer\Mcp\Server_Bootstrap;
use Elementor\Modules\Agents\Classes\Feature_Component;
use Elementor\Modules\Agents\Components\Discovery\Well_Known\Ard_Catalog;
use Elementor\Modules\Mcp\Module as Mcp_Module;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Advertises the WordPress MCP Adapter default server to agents while the
 * site-level Elementor MCP setting is on.
 *
 * Drives the `elementor/agents/mcp_server/is_active` and
 * `elementor/agents/link_headers/emit_mcp_card` filters, appends the server
 * to the ARD catalog, and serves the server card at `<server URL>/server-card`
 * in addition to /.well-known/mcp/server-card.json.
 */
class Mcp_Discovery extends Feature_Component {

	const REST_NAMESPACE = 'mcp';

	const REST_SERVER_ROUTE = 'mcp-adapter-default-server';

	const REST_SERVER_CARD_ROUTE = '/' . self::REST_SERVER_ROUTE . '/server-card';

	const SERVER_CARD_PATH = '.well-known/mcp/server-card.json';

	const SERVER_CARD_SCHEMA = 'https://static.modelcontextprotocol.io/schemas/2025-12-11/server.schema.json';

	const SERVER_SLUG = 'elementor-mcp';

	const SERVER_TITLE = 'Elementor MCP';

	const SERVER_DESCRIPTION = 'Read and edit this Elementor site\'s pages, content and design through MCP tools.';

	const TRANSPORT = 'streamable-http';

	const ARD_ENTRY_TYPE = 'application/json';

	const ARD_REPRESENTATIVE_QUERIES = [
		'Edit a page on this site with Elementor',
		'Update the site\'s global colors and fonts',
		'Create a new landing page layout',
	];

	const FALLBACK_HOST = 'localhost';

	public function get_id(): string {
		return 'mcp_discovery';
	}

	public function get_layer(): string {
		return 'mcp';
	}

	public function register(): void {
		add_filter( 'elementor/agents/mcp_server/is_active', [ $this, 'filter_is_active' ] );
		add_filter( 'elementor/agents/link_headers/emit_mcp_card', [ $this, 'filter_is_active' ] );
		add_filter( 'elementor/agents/ard_catalog/entries', [ $this, 'add_ard_catalog_entry' ] );
		add_action( 'rest_api_init', [ $this, 'register_rest_routes' ] );
	}

	public static function is_active(): bool {
		return class_exists( Server_Bootstrap::class )
			&& class_exists( Mcp_Module::class )
			&& Mcp_Module::is_active()
			&& Mcp_Module::is_site_mcp_exposure_enabled();
	}

	public static function get_server_url(): string {
		if ( class_exists( Server_Bootstrap::class ) ) {
			return Server_Bootstrap::get_default_server_rest_url();
		}

		return rest_url( self::REST_NAMESPACE . '/' . self::REST_SERVER_ROUTE );
	}

	public static function get_server_card_url(): string {
		return trailingslashit( home_url() ) . self::SERVER_CARD_PATH;
	}

	/**
	 * Options whose change flips is_active() and must purge cached discovery output.
	 *
	 * @return string[]
	 */
	public static function get_settings_option_names(): array {
		return class_exists( McpSettingsController::class )
			? [ McpSettingsController::OPTION_NAME ]
			: [];
	}

	/**
	 * MCP registry server.json document describing the remote server.
	 */
	public static function build_server_card(): array {
		return [
			'$schema'     => self::SERVER_CARD_SCHEMA,
			'name'        => self::get_server_name(),
			'description' => self::SERVER_DESCRIPTION,
			'version'     => ELEMENTOR_VERSION,
			'remotes'     => [
				[
					'type' => self::TRANSPORT,
					'url'  => self::get_server_url(),
				],
			],
		];
	}

	/**
	 * Reverse-DNS server name, e.g. `com.example.shop/elementor-mcp` for shop.example.com.
	 * IP hosts keep their order since reversing them carries no namespace meaning.
	 */
	public static function get_server_name(): string {
		$host = self::get_site_host();

		if ( ! filter_var( $host, FILTER_VALIDATE_IP ) ) {
			$host = implode( '.', array_reverse( explode( '.', $host ) ) );
		}

		return preg_replace( '/[^a-z0-9.-]/', '-', $host ) . '/' . self::SERVER_SLUG;
	}

	public function filter_is_active(): bool {
		return self::is_active();
	}

	/**
	 * @param mixed $entries ARD catalog entries.
	 * @return array
	 */
	public function add_ard_catalog_entry( $entries ): array {
		$entries = (array) $entries;

		if ( ! self::is_active() ) {
			return $entries;
		}

		$entries[] = [
			'identifier'            => Ard_Catalog::build_identifier( 'server', self::SERVER_SLUG ),
			'displayName'           => self::SERVER_TITLE,
			'type'                  => self::ARD_ENTRY_TYPE,
			'url'                   => self::get_server_card_url(),
			'description'           => self::SERVER_DESCRIPTION,
			'representativeQueries' => self::ARD_REPRESENTATIVE_QUERIES,
		];

		return $entries;
	}

	public function register_rest_routes(): void {
		if ( ! self::is_active() ) {
			return;
		}

		register_rest_route( self::REST_NAMESPACE, self::REST_SERVER_CARD_ROUTE, [
			'methods'             => \WP_REST_Server::READABLE,
			'callback'            => [ $this, 'get_server_card_response' ],
			'permission_callback' => '__return_true',
		] );
	}

	public function get_server_card_response(): \WP_REST_Response {
		return new \WP_REST_Response( self::build_server_card() );
	}

	private static function get_site_host(): string {
		$host = strtolower( trim( (string) wp_parse_url( home_url(), PHP_URL_HOST ), '[]' ) );

		return '' !== $host ? $host : self::FALLBACK_HOST;
	}
}
