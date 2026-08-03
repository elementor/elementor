<?php

namespace Elementor\Modules\Mcp;

use Elementor\Core\Base\Module as BaseModule;
use Elementor\Modules\Components\Module as Components_Module;
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

		( new Abilities\Get_Structure_Ability() )->register();
		( new Abilities\Update_Settings_Ability() )->register();
		( new Abilities\Create_Page_Ability() )->register();
		( new Abilities\Publish_Document_Ability() )->register();
		( new Abilities\Style_Best_Practices_Ability() )->register();
		( new Abilities\Manage_Variable_Ability() )->register();
		( new Abilities\Manage_Classes_Ability() )->register();
		( new Abilities\Manage_Variable_Guide_Ability() )->register();
		( new Abilities\Get_Widget_Schema_Ability() )->register();
		( new Abilities\List_Widget_Schemas_Ability() )->register();
		( new Abilities\List_Dynamic_Tags_Ability() )->register();
		( new Abilities\Build_Composition_Ability() )->register();
		( new Abilities\Manage_Elements_Ability() )->register();
		( new Abilities\Global_Classes_Resource_Ability() )->register();
		( new Abilities\List_Assets_Ability() )->register();

		if ( $this->is_components_active() ) {
			( new Abilities\List_Components_Ability() )->register();
		}
		( new Abilities\Global_Variables_Resource_Ability() )->register();
		( new Abilities\Interactions_Schema_Resource_Ability() )->register();
		( new Abilities\List_Resources_Ability() )->register();
		( new Abilities\Read_Resource_Ability() )->register();
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
			$this->get_server_tools(),
			$this->get_server_resources(),
			[]
		);

		if ( is_wp_error( $result ) ) {
			// phpcs:ignore WordPress.PHP.DevelopmentFunctions.error_log_error_log
			error_log( sprintf( '[Elementor MCP] Server registration failed: %s', $result->get_error_message() ) );
			return;
		}
	}

	private function is_components_active(): bool {
		return class_exists( Components_Module::class ) && Components_Module::is_experiment_active();
	}

	private function get_server_tools(): array {
		$tools = [
			'elementor/get-page-structure',
			'elementor/update-page-settings',
			'elementor/create-page',
			'elementor/publish-document',
			'elementor/manage-global-variable',
			'elementor/manage-classes',
			'elementor/get-widget-schema',
			'elementor/list-widget-schemas',
			'elementor/build-composition',
			'elementor/manage-elements',
			'elementor/list-assets',
			'elementor/list-resources',
			'elementor/read-resource',
			...( $this->is_components_active() ? [ 'elementor/list-components' ] : [] ),
		];

		/**
		 * Filters additional MCP tool ability slugs to expose on the Elementor MCP server.
		 *
		 * Use this filter to add tool abilities (registered via `wp_register_ability` on the
		 * `wp_abilities_api_init` hook) to the `elementor-mcp-server`. Slugs must match the
		 * ability id returned by the ability's `get_ability_id()`. Core defaults are always
		 * included and cannot be removed via this filter.
		 *
		 * @since 4.3.0
		 *
		 * @param string[] $additional_tools List of tool ability slugs contributed by other modules.
		 */
		$additional_tools = apply_filters( 'elementor/mcp/server/tools', [] );

		return $this->normalize_slugs( $tools, $additional_tools );
	}

	private function get_server_resources(): array {
		$resources = [
			'elementor/style-best-practices',
			'elementor/manage-global-variable-guide',
			'elementor/global-classes-resource',
			'elementor/global-variables-resource',
			'elementor/list-dynamic-tags',
			'elementor/interactions-schema-resource',
		];

		/**
		 * Filters additional MCP resource ability slugs to expose on the Elementor MCP server.
		 *
		 * Use this filter to add resource abilities (registered via `wp_register_ability` on the
		 * `wp_abilities_api_init` hook) to the `elementor-mcp-server`. Slugs must match the
		 * ability id returned by the ability's `get_ability_id()`. Core defaults are always
		 * included and cannot be removed via this filter.
		 *
		 * @since 4.3.0
		 *
		 * @param string[] $additional_resources List of resource ability slugs contributed by other modules.
		 */
		$additional_resources = apply_filters( 'elementor/mcp/server/resources', [] );

		return $this->normalize_slugs( $resources, $additional_resources );
	}

	private function normalize_slugs( array $defaults, $additional ): array {
		$additional = is_array( $additional ) ? array_filter( $additional, 'is_string' ) : [];

		return array_values( array_unique( array_merge( $defaults, $additional ) ) );
	}
}
