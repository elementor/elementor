<?php

namespace Elementor\Modules\AppsOauth;

use Elementor\Core\Base\Module as BaseModule;
use Elementor\Core\Experiments\Manager as Experiments_Manager;
use Elementor\Plugin;
use Elementor\Modules\AppsOauth\Includes\OAuth_Controller;
use Elementor\Modules\AppsOauth\Includes\Token_Store;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Apps OAuth module.
 *
 * Provides a minimal OAuth 2.0 authorization server backed by WordPress
 * Application Passwords. Used to authenticate ChatGPT (via the MCP Apps SDK)
 * on behalf of individual WordPress users.
 *
 * EXPERIMENT: Inactive by default and hidden from the UI. Enable via:
 *   add_filter( 'elementor/experiments/default-state/apps-oauth', fn() => 'active' );
 * or via WP-CLI:
 *   wp option set elementor_experiments '{"apps-oauth":"active"}' --format=json
 *
 * Flow:
 *   1. ChatGPT → GET  wp-admin/admin.php?page=elementor-oauth-authorize  (consent page)
 *   2. User approves → WP creates Application Password → redirects with ?code=
 *   3. ChatGPT → POST /wp-json/elementor/v1/oauth/token                  (get access_token)
 *   4. MCP server → POST /wp-json/elementor/v1/oauth/introspect           (validate token per request)
 *   5. MCP server → WP REST API using the resolved Application Password
 */
class Module extends BaseModule {

	const EXPERIMENT_NAME = 'apps-oauth';

	private OAuth_Controller $controller;

	public function get_name(): string {
		return self::EXPERIMENT_NAME;
	}

	public static function is_active(): bool {
		return Plugin::$instance->experiments->is_feature_active( self::EXPERIMENT_NAME );
	}

	public static function get_experimental_data(): array {
		return [
			'name'           => self::EXPERIMENT_NAME,
			'title'          => esc_html__( 'Apps OAuth (ChatGPT MCP)', 'elementor' ),
			'description'    => esc_html__( 'OAuth 2.0 bridge for connecting ChatGPT to Elementor via the MCP Apps SDK. Developer experiment only.', 'elementor' ),
			'hidden'         => true,
			'default'        => Experiments_Manager::STATE_INACTIVE,
			'release_status' => Experiments_Manager::RELEASE_STATUS_ALPHA,
		];
	}

	public function __construct() {
		parent::__construct();

		$store            = new Token_Store();
		$this->controller = new OAuth_Controller( $store );

		add_action( 'admin_menu', [ $this->controller, 'register_admin_page' ] );
		add_action( 'admin_init', [ $this->controller, 'maybe_intercept_oauth_page' ] );
		add_action( 'rest_api_init', [ $this->controller, 'register_rest_routes' ] );
	}
}
