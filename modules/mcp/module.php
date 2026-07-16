<?php

namespace Elementor\Modules\Mcp;

use Elementor\Core\Base\Module as BaseModule;
use Elementor\Modules\Mcp\RestApi\Mcp_Proxy_REST_API;
use WP\MCP\Core\McpAdapter;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Module extends BaseModule {

	public function get_name() {
		return 'mcp';
	}

	public static function is_active() {
		return class_exists( McpAdapter::class ) &&
			function_exists( 'wp_register_ability' );
	}

	public function __construct() {
		parent::__construct();

		( new Mcp_Proxy_REST_API() )->register_hooks();

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
		( new Abilities\Create_Element_Ability() )->register();
		( new Abilities\Style_Best_Practices_Ability() )->register();
		( new Abilities\List_Variables_Ability() )->register();
		( new Abilities\Manage_Variable_Ability() )->register();
		( new Abilities\Manage_Classes_Ability() )->register();
		( new Abilities\Manage_Variable_Guide_Ability() )->register();
		( new Abilities\List_Widgets_Ability() )->register();
		( new Abilities\Get_Widget_Schema_Ability() )->register();
		( new Abilities\List_Widget_Schemas_Ability() )->register();
		( new Abilities\List_Dynamic_Tags_Ability() )->register();
		( new Abilities\Build_Composition_Ability() )->register();
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
				'elementor/create-element',
				'elementor/manage-global-variable',
				'elementor/manage-classes',
				'elementor/list-widgets',
				'elementor/get-widget-schema',
				'elementor/list-widget-schemas',
				'elementor/list-dynamic-tags',
				'elementor/build-composition',
			],
			[
				'elementor/style-best-practices',
				'elementor/list-variables',
				'elementor/manage-global-variable-guide',
			],
			[]
		);

		if ( is_wp_error( $result ) ) {
			// phpcs:ignore WordPress.PHP.DevelopmentFunctions.error_log_error_log
			error_log( sprintf( '[Elementor MCP] Server registration failed: %s', $result->get_error_message() ) );
			return;
		}
	}
}
