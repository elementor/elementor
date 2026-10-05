<?php

namespace Elementor\Modules\Mcp;

use Elementor\Core\Base\Module as BaseModule;
use Elementor\Core\Utils\Promotions\Filtered_Promotions_Manager;
use Elementor\MCP\Composer\Admin\McpSettingsController;
use Elementor\MCP\Composer\Admin\Page as Mcp_Admin_Page;
use Elementor\MCP\Composer\Mcp\Registry as Shared_Registry;
use Elementor\Modules\EditorOne\Classes\Menu_Data_Provider;
use Elementor\Modules\Mcp\Abilities\Abstract_Ability;
use Elementor\Modules\Mcp\AdminMenuItems\Editor_One_Mcp_Menu;
use Elementor\Modules\Mcp\Preview\Public_Preview_Handler;
use Elementor\Modules\Mcp\Registry\Ability_Registry;
use Elementor\Modules\Mcp\RestApi\Mcp_Proxy_REST_API;
use Elementor\Modules\Mcp\Utils\Editor_Sync_State;
use Elementor\Utils;
use WP\MCP\Core\McpAdapter;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Module extends BaseModule {

	const ANALYTICS_REGISTRAR_HANDLE = 'elementor-mcp-analytics-registrar';
	const PROMOTION_REGISTRAR_HANDLE = 'elementor-mcp-promotion-registrar';
	const MCP_PROMOTION_UPGRADE_URL = 'https://go.elementor.com/go-pro-mcp-connector-page-upgrade/';
	const MCP_PROMOTION_ALLOWED_DOMAIN = 'elementor.com';

	private Ability_Registry $registry;

	public function get_name() {
		return 'mcp';
	}

	public function enqueue_analytics_registrar(): void {
		wp_enqueue_script(
			self::ANALYTICS_REGISTRAR_HANDLE,
			$this->get_js_assets_url( 'mcp-analytics-registrar' ),
			[ 'elementor-common', Mcp_Admin_Page::SCRIPT_HANDLE ],
			ELEMENTOR_VERSION,
			true
		);
	}

	public function enqueue_promotion_registrar(): void {
		if ( ! $this->should_enqueue_mcp_admin_promotion() ) {
			return;
		}

		wp_enqueue_script(
			self::PROMOTION_REGISTRAR_HANDLE,
			$this->get_js_assets_url( 'mcp-promotion-registrar' ),
			[
				'elementor-common',
				Mcp_Admin_Page::SCRIPT_HANDLE,
				'react',
				'react-dom',
				'wp-i18n',
			],
			ELEMENTOR_VERSION,
			true
		);

		wp_localize_script(
			self::PROMOTION_REGISTRAR_HANDLE,
			'elementorMcpPromotionConfig',
			[
				'upgradeUrl' => $this->get_promotion_upgrade_url(),
			]
		);

		wp_set_script_translations( self::PROMOTION_REGISTRAR_HANDLE, 'elementor' );
	}

	private function should_enqueue_mcp_admin_promotion(): bool {
		if ( ! current_user_can( 'manage_options' ) ) {
			return false;
		}

		if ( ! class_exists( Utils::class ) ) {
			return false;
		}

		if ( Utils::has_pro() && Utils::is_license_active() ) {
			return false;
		}

		return true;
	}

	private function get_promotion_upgrade_url(): string {
		$promotion_data = Filtered_Promotions_Manager::get_filtered_promotion_data(
			[ 'upgrade_url' => self::MCP_PROMOTION_UPGRADE_URL ],
			'elementor/mcp/custom_promotion',
			'upgrade_url'
		);

		$upgrade_url = $promotion_data['upgrade_url'] ?? '';

		return $this->is_allowed_promotion_url( $upgrade_url )
			? $upgrade_url
			: self::MCP_PROMOTION_UPGRADE_URL;
	}

	private function is_allowed_promotion_url( $url ): bool {
		if ( ! is_string( $url ) ) {
			return false;
		}

		$host = wp_parse_url( $url, PHP_URL_HOST );

		if ( ! is_string( $host ) ) {
			return false;
		}

		$host = strtolower( $host );

		return self::MCP_PROMOTION_ALLOWED_DOMAIN === $host
			|| str_ends_with( $host, '.' . self::MCP_PROMOTION_ALLOWED_DOMAIN );
	}

	public static function is_active() {
		return class_exists( McpAdapter::class ) &&
			function_exists( 'wp_register_ability' ) &&
			class_exists( Shared_Registry::class );
	}

	public static function is_site_mcp_exposure_enabled(): bool {
		return McpSettingsController::is_enabled();
	}

	public function __construct() {
		parent::__construct();

		$this->registry = self::build_core_registry();

		( new Mcp_Proxy_REST_API( $this->registry ) )->register_hooks();
		( new Public_Preview_Handler() )->register();
		( new Editor_Sync_State() )->register_hooks();

		if ( ! self::is_active() ) {
			return;
		}

		add_action( 'init', [ $this, 'register_shared_registry_slugs' ], 5 );
		add_action( 'elementor/editor-one/menu/register', [ $this, 'register_editor_one_menu' ], Editor_One_Mcp_Menu::REGISTER_PRIORITY_AFTER_SUBMISSIONS );

		add_action( 'wp_abilities_api_categories_init', [ $this, 'register_ability_category' ] );

		if ( self::is_site_mcp_exposure_enabled() ) {
			add_action( 'wp_abilities_api_init', [ $this, 'register_abilities' ] );
		}
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
		$menu_data_provider->register_menu(
			new Editor_One_Mcp_Menu(),
			[ 'preserve_label_casing' => true ]
		);
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
			new Abilities\List_Components_Ability(),
			new Abilities\Manage_Component_Ability(),
			new Abilities\List_Posts_Ability(),
		];

		return $abilities;
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
