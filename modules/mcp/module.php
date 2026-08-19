<?php

namespace Elementor\Modules\Mcp;

use Elementor\Core\Base\Module as BaseModule;
use Elementor\Core\Experiments\Manager as Experiments_Manager;
use Elementor\MCP\Composer\Mcp\Registry as Shared_Registry;
use Elementor\Plugin;
use Elementor\Modules\Components\Module as Components_Module;
use Elementor\Modules\EditorOne\Classes\Menu_Data_Provider;
use Elementor\Modules\Mcp\Abilities\Abstract_Ability;
use Elementor\Modules\Mcp\AdminMenuItems\Editor_One_Mcp_Menu;
use Elementor\Modules\Mcp\Preview\Public_Preview_Handler;
use Elementor\Modules\Mcp\Registry\Ability_Registry;
use Elementor\Modules\Mcp\RestApi\Mcp_Proxy_REST_API;
use Elementor\Modules\Mcp\Utils\Editor_Sync_State;
use WP\MCP\Core\McpAdapter;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Module extends BaseModule {

	const CONNECTOR_EXPERIMENT_NAME = 'mcp_connector';

	private Ability_Registry $registry;

	public function get_name() {
		return 'mcp';
	}

	public static function is_active() {
		return class_exists( McpAdapter::class ) &&
			function_exists( 'wp_register_ability' ) &&
			class_exists( Shared_Registry::class );
	}

	public function __construct() {
		parent::__construct();

		$this->register_connector_experiment();

		$this->registry = self::build_core_registry();

		( new Mcp_Proxy_REST_API( $this->registry ) )->register_hooks();
		( new Public_Preview_Handler() )->register();
		( new Editor_Sync_State() )->register_hooks();

		if ( ! $this->is_active() ) {
			return;
		}

		add_action( 'wp_abilities_api_categories_init', [ $this, 'register_ability_category' ] );
		add_action( 'wp_abilities_api_init', [ $this, 'register_abilities' ] );
		add_action( 'init', [ $this, 'register_shared_registry_slugs' ], 5 );
		add_action( 'elementor/editor-one/menu/register', [ $this, 'register_editor_one_menu' ], Editor_One_Mcp_Menu::REGISTER_PRIORITY_AFTER_SUBMISSIONS );
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

	public function register_shared_registry_slugs(): void {
		$shared = Shared_Registry::instance();

		$shared->register_tools( $this->collect_server_ids( $this->registry->tools() ) );
		$shared->register_resources( $this->collect_server_ids( $this->registry->resources() ) );
	}

	public function register_editor_one_menu( Menu_Data_Provider $menu_data_provider ): void {
		if ( ! self::is_connector_page_active() ) {
			return;
		}

		$menu_data_provider->register_menu( new Editor_One_Mcp_Menu() );
	}

	public static function is_connector_page_active(): bool {
		return Plugin::$instance->experiments->is_feature_active( self::CONNECTOR_EXPERIMENT_NAME );
	}

	private function register_connector_experiment(): void {
		Plugin::$instance->experiments->add_feature( [
			'name' => self::CONNECTOR_EXPERIMENT_NAME,
			'title' => esc_html__( 'MCP Connector', 'elementor' ),
			'description' => esc_html__( 'Enable the MCP connector admin page.', 'elementor' ),
			'hidden' => true,
			'default' => Experiments_Manager::STATE_INACTIVE,
			'release_status' => Experiments_Manager::RELEASE_STATUS_BETA,
		] );
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
}
