<?php
namespace Elementor\App\Modules\KitLibrary;

use Elementor\App\Modules\KitLibrary\Data\Repository;
use Elementor\Core\Admin\Menu\Admin_Menu_Manager;
use Elementor\Core\Admin\Menu\Main as MainMenu;
use Elementor\Plugin;
use Elementor\TemplateLibrary\Source_Local;
use Elementor\Core\Base\Module as BaseModule;
use Elementor\App\Modules\KitLibrary\Connect\Kit_Library;
use Elementor\Core\Common\Modules\Connect\Module as ConnectModule;
use Elementor\App\Modules\KitLibrary\Data\Kits\Controller as Kits_Controller;
use Elementor\App\Modules\KitLibrary\Data\Taxonomies\Controller as Taxonomies_Controller;
use Elementor\Core\Utils\Promotions\Filtered_Promotions_Manager;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Module extends BaseModule {
	/**
	 * Get name.
	 *
	 * @access public
	 *
	 * @return string
	 */
	public function get_name() {
		return 'kit-library';
	}

	private function register_admin_menu( MainMenu $menu ) {
		$menu->add_submenu( [
			'page_title' => esc_html__( 'Kit Library', 'elementor' ),
			'menu_title' => '<span id="e-admin-menu__kit-library">' . esc_html__( 'Kit Library', 'elementor' ) . '</span>',
			'menu_slug' => Plugin::$instance->app->get_base_url() . '#/kit-library',
			'index' => 40,
		] );
	}

	/**
	 * Register the admin menu the old way.
	 */
	private function register_admin_menu_legacy( Admin_Menu_Manager $admin_menu ) {
		$admin_menu->register(
			Plugin::$instance->app->get_base_url() . '#/kit-library',
			new Kit_Library_Menu_Item()
		);
	}

	private function set_kit_library_settings() {
		if ( ! Plugin::$instance->common ) {
			return;
		}

		/** @var ConnectModule $connect */
		$connect = Plugin::$instance->common->get_component( 'connect' );

		/** @var Kit_Library $kit_library */
		$kit_library = $connect->get_app( 'kit-library' );

		Plugin::$instance->app->set_settings( 'kit-library', [
			'has_access_to_module' => current_user_can( 'manage_options' ),
			'subscription_plans' => $this->apply_filter_subscription_plans( $connect->get_subscription_plans( 'kit-library' ) ),
			'is_pro' => false,
			'is_library_connected' => $kit_library->is_connected(),
			'library_connect_url'  => $kit_library->get_admin_url( 'authorize', [
				'utm_source' => 'kit-library',
				'utm_medium' => 'wp-dash',
				'utm_campaign' => 'library-connect',
				'utm_term' => '%%page%%', // Will be replaced in the frontend.
			] ),
			'access_level' => ConnectModule::ACCESS_LEVEL_CORE,
			'access_tier' => ConnectModule::ACCESS_TIER_FREE,
			'app_url' => Plugin::$instance->app->get_base_url() . '#/' . $this->get_name(),
		] );
	}

	private function apply_filter_subscription_plans( array $subscription_plans ): array {
		foreach ( $subscription_plans as $key => $plan ) {
			if ( null === $plan['promotion_url'] ) {
				continue;
			}

			$subscription_plans[ $key ] = Filtered_Promotions_Manager::get_filtered_promotion_data(
				$plan,
				'elementor/kit_library/' . $key . '/promotion',
				'promotion_url'
			);
		}

		return $subscription_plans;
	}

	/**
	 * Module constructor.
	 */
	public function __construct() {
		Plugin::$instance->data_manager_v2->register_controller( new Kits_Controller() );
		Plugin::$instance->data_manager_v2->register_controller( new Taxonomies_Controller() );

		// Assigning this action here since the repository is being loaded by demand.
		add_action( 'elementor/experiments/feature-state-change/container', [ Repository::class, 'clear_cache' ], 10, 0 );

		add_action( 'elementor/admin/menu/register', function( Admin_Menu_Manager $admin_menu ) {
			$this->register_admin_menu_legacy( $admin_menu );
		}, Source_Local::ADMIN_MENU_PRIORITY + 30 );

		add_action( 'elementor/connect/apps/register', function ( ConnectModule $connect_module ) {
			$connect_module->register_app( 'kit-library', Kit_Library::get_class_name() );
		} );

		add_action( 'elementor/init', function () {
			$this->set_kit_library_settings();
		}, 12 /** After the initiation of the connect kit library */ );
	}
}
