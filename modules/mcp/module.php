<?php

namespace Elementor\Modules\Mcp;

use Elementor\Core\Base\Module as BaseModule;
use Elementor\Plugin;
use Elementor\Core\Experiments\Manager as ExperimentsManager;
use WP\MCP\Core\McpAdapter;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Module extends BaseModule {
	const EXPERIMENT_NAME = 'e_wp_abilities_api';

	public function get_name() {
		return 'mcp';
	}

	public static function is_active() {
		return class_exists( McpAdapter::class ) &&
			function_exists( 'wp_register_ability' ) &&
			Plugin::instance()->experiments->is_feature_active( self::EXPERIMENT_NAME );
	}

	public static function get_experimental_data() {
		return [
			'name' => self::EXPERIMENT_NAME,
			'title' => __( 'Elementor MCP WP Abilities API', 'elementor' ),
			'description' => __( 'Enable Elementor MCP WP Abilities API. Requirements: 1. WordPress 7.0 or higher. 2. Create an application password for your agent user. 3. Add to your MCP config: {url: "https://<your-site-url>/wp-json/elementor/mcp", headers: {Authorization: "Basic <base64(user:application-password)>"}}', 'elementor' ),
			'hidden' => false,
			'default' => ExperimentsManager::STATE_INACTIVE,
		];
	}

	public function __construct() {
		parent::__construct();

		if ( ! $this->is_active() ) {
			return;
		}

		McpAdapter::instance();

		add_action( 'wp_abilities_api_categories_init', [ $this, 'register_ability_category' ] );
		add_action( 'wp_abilities_api_init', [ $this, 'register_abilities' ] );
		add_action( 'mcp_adapter_init', [ $this, 'register_server' ] );
	}

	public function register_ability_category() {
		if ( ! function_exists( 'wp_register_ability_category' ) ) {
			return;
		}

		wp_register_ability_category(
			'elementor',
			[
				'label' => __( 'Elementor', 'elementor' ),
				'description' => __( 'Elementor page builder data, global classes, and variables.', 'elementor' ),
			]
		);
	}

	public function register_abilities() {
		if ( ! function_exists( 'wp_register_ability' ) ) {
			return;
		}

		( new Abilities\List_Pages_Ability() )->register();
		( new Abilities\Get_Structure_Ability() )->register();
		( new Abilities\Update_Settings_Ability() )->register();
		( new Abilities\Create_Page_Ability() )->register();
		( new Abilities\Get_Globals_Ability() )->register();
	}

	public function register_server( $adapter ) {
		if ( ! $adapter instanceof McpAdapter ) {
			return;
		}

		$result = $adapter->create_server(
			'elementor-mcp-server',
			'elementor',
			'mcp',
			'Elementor MCP',
			'Read and modify Elementor Editor abilities.',
			'v1.0.0',
			[ \WP\MCP\Transport\HttpTransport::class ],
			\WP\MCP\Infrastructure\ErrorHandling\ErrorLogMcpErrorHandler::class,
			\WP\MCP\Infrastructure\Observability\NullMcpObservabilityHandler::class,
			[
				'elementor/list-pages',
				'elementor/get-page-structure',
				'elementor/update-page-settings',
				'elementor/create-page',
				'elementor/get-globals',
			],
			[],
			[]
		);

		if ( is_wp_error( $result ) ) {
			// phpcs:ignore WordPress.PHP.DevelopmentFunctions.error_log_error_log
			error_log( sprintf( '[Elementor MCP] Server registration failed: %s', $result->get_error_message() ) );
			return;
		}
	}
}
