<?php

namespace Elementor\Modules\Mcp;

use Elementor\Core\Base\Module as BaseModule;
use Elementor\Modules\Components\Module as Components_Module;
use Elementor\Modules\Mcp\Abilities\Abstract_Ability;
use Elementor\Modules\Mcp\Preview\Public_Preview_Handler;
use Elementor\Modules\Mcp\Registry\Ability_Registry;
use Elementor\Modules\Mcp\RestApi\Mcp_Proxy_REST_API;
use Elementor\Modules\Mcp\Utils\Editor_Sync_State;
use WP\MCP\Core\McpAdapter;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Module extends BaseModule {

	private Ability_Registry $registry;

	public function get_name() {
		return 'mcp';
	}

	public static function is_active() {
		return class_exists( McpAdapter::class ) &&
			function_exists( 'wp_register_ability' );
	}

	public function __construct() {
		parent::__construct();

		$this->registry = self::build_core_registry();

		( new Mcp_Proxy_REST_API( $this->registry ) )->register_hooks();
		( new Public_Preview_Handler() )->register();
		( new Editor_Sync_State() )->register_hooks();

		if ( ! $this->is_active() ) {
			return;
		}

		McpAdapter::instance();

		add_action( 'wp_abilities_api_categories_init', [ $this, 'register_ability_category' ] );
		add_action( 'wp_abilities_api_init', [ $this, 'register_abilities' ] );
		add_action( 'mcp_adapter_init', [ $this, 'register_server' ] );
	}

	public function registry(): Ability_Registry {
		return $this->registry;
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

		foreach ( $this->registry->all() as $ability ) {
			$ability->register();
		}
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

	public static function build_core_registry(): Ability_Registry {
		$registry = new Ability_Registry();

		foreach ( self::get_core_abilities( $registry ) as $ability ) {
			$registry->add( $ability );
		}

		return $registry;
	}

	/** @return Abstract_Ability[] */
	private static function get_core_abilities( Ability_Registry $registry ): array {
		$abilities = [
			new Abilities\Get_Structure_Ability(),
			new Abilities\Update_Settings_Ability(),
			new Abilities\Create_Page_Ability(),
			new Abilities\Create_Preview_Link_Ability(),
			new Abilities\Publish_Document_Ability(),
			new Abilities\Style_Best_Practices_Ability(),
			new Abilities\Wordpress_Best_Practices_Ability(),
			new Abilities\Manage_Variable_Ability(),
			new Abilities\Manage_Classes_Ability(),
			new Abilities\Manage_Default_Styles_Ability(),
			new Abilities\Get_Default_Styles_Ability(),
			new Abilities\Reorder_Classes_Ability(),
			new Abilities\Manage_Variable_Guide_Ability(),
			new Abilities\Get_Widget_Schema_Ability(),
			new Abilities\List_Widget_Schemas_Ability(),
			new Abilities\List_Dynamic_Tags_Ability(),
			new Abilities\Build_Composition_Ability(),
			new Abilities\Manage_Elements_Ability(),
			new Abilities\Global_Classes_Resource_Ability(),
			new Abilities\List_Assets_Ability(),
			new Abilities\Global_Variables_Resource_Ability(),
			new Abilities\Interactions_Schema_Resource_Ability(),
			new Abilities\List_Resources_Ability( $registry ),
			new Abilities\Read_Resource_Ability( $registry ),
		];

		if ( self::is_components_active() ) {
			$abilities[] = new Abilities\List_Components_Ability();
		}

		return $abilities;
	}

	private static function is_components_active(): bool {
		return class_exists( Components_Module::class ) && Components_Module::is_experiment_active();
	}

	private function get_server_tools(): array {
		$tools = $this->collect_server_ids( $this->registry->tools() );

		/**
		 * Filters additional MCP tool ability slugs to expose on the Elementor MCP server.
		 *
		 * Preferred integration path: add abilities directly to the Ability_Registry via
		 * `Plugin::$instance->modules_manager->get_modules( 'mcp' )->registry()->add( ... )`.
		 * This filter is retained for backward compatibility with third-party extensions.
		 *
		 * @since 4.3.0
		 *
		 * @param string[] $additional_tools List of tool ability slugs contributed by other modules.
		 */
		$additional_tools = apply_filters( 'elementor/mcp/server/tools', [] );

		return $this->normalize_slugs( $tools, $additional_tools );
	}

	private function get_server_resources(): array {
		$resources = $this->collect_server_ids( $this->registry->resources() );

		/**
		 * Filters additional MCP resource ability slugs to expose on the Elementor MCP server.
		 *
		 * Preferred integration path: add abilities directly to the Ability_Registry via
		 * `Plugin::$instance->modules_manager->get_modules( 'mcp' )->registry()->add( ... )`.
		 * This filter is retained for backward compatibility with third-party extensions.
		 *
		 * @since 4.3.0
		 *
		 * @param string[] $additional_resources List of resource ability slugs contributed by other modules.
		 */
		$additional_resources = apply_filters( 'elementor/mcp/server/resources', [] );

		return $this->normalize_slugs( $resources, $additional_resources );
	}

	/**
	 * @param Abstract_Ability[] $abilities
	 * @return string[]
	 */
	private function collect_server_ids( array $abilities ): array {
		$ids = [];

		foreach ( $abilities as $ability ) {
			if ( $ability->is_exposed_on_server() ) {
				$ids[] = $ability->get_id();
			}
		}

		return $ids;
	}

	private function normalize_slugs( array $defaults, $additional ): array {
		$additional = is_array( $additional ) ? array_filter( $additional, 'is_string' ) : [];

		return array_values( array_unique( array_merge( $defaults, $additional ) ) );
	}
}
