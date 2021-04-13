<?php
namespace Elementor\Core\App\Modules\KitLibrary;

use Elementor\Utils;
use Elementor\Plugin;
use Elementor\TemplateLibrary\Source_Local;
use Elementor\Core\Base\Module as BaseModule;
use Elementor\Core\Common\Modules\Connect\Apps\Library;
use Elementor\Core\App\Modules\KitLibrary\Data\Api_Client;
use Elementor\Core\App\Modules\KitLibrary\Data\Repository;
use Elementor\Core\App\Modules\KitLibrary\Data\Kits_Controller;
use Elementor\Core\App\Modules\KitLibrary\Data\Taxonomies_Controller;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
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

	/**
	 * Register the admin menu.
	 */
	private function register_admin_menu() {
		add_submenu_page(
			Source_Local::ADMIN_MENU_SLUG,
			__( 'Kit Library', 'elementor' ),
			__( 'Kit Library', 'elementor' ),
			'manage_options',
			Plugin::$instance->app->get_base_url() . '#/kit-library'
		);
	}

	private function get_subscription_plans() {
		return [
			Library::ACCESS_LEVEL_CORE => [
				'label' => null,
				'promotion_url' => null,
				'color' => null,
			],
			Library::ACCESS_LEVEL_PRO => [
				'label' => __( 'Pro', 'elementor' ),
				'promotion_url' => Utils::get_pro_link( 'https://elementor.com/pro/?utm_source=kit-library&utm_medium=wp-dash&utm_campaign=gopro' ),
				'color' => '#92003B',
			],
			Library::ACCESS_LEVEL_EXPERT => [
				'label' => __( 'Expert', 'elementor' ),
				'promotion_url' => Utils::get_pro_link( 'https://elementor.com/pro/?utm_source=kit-library&utm_medium=wp-dash&utm_campaign=goexpert' ),
				'color' => '#010051',
			],
		];
	}

	private function set_kit_library_settings() {
		if ( ! Plugin::$instance->common ) {
			return;
		}

		/** @var Library $library */
		$library = Plugin::$instance->common->get_component( 'connect' )->get_app( 'library' );

		Plugin::$instance->app->set_settings( 'kit-library', [
			'subscription_plans' => $this->get_subscription_plans(),
			'is_pro' => false,
			'is_library_connected' => $library->is_connected(),
			'library_connect_url'  => $library->get_admin_url( 'authorize' ),
			'access_level' => Library::ACCESS_LEVEL_CORE,
		] );
	}

	private function initiate_repository() {
		$base_endpoint = defined( 'ELEMENTOR_KIT_LIBRARY_BASE_ENDPOINT' ) ?
			ELEMENTOR_KIT_LIBRARY_BASE_ENDPOINT :
			Api_Client::DEFAULT_BASE_ENDPOINT;

		return new Repository(
			new Api_Client( $base_endpoint )
		);
	}

	/**
	 * Module constructor.
	 */
	public function __construct() {
		$repository = $this->initiate_repository();

		Plugin::$instance->data_manager->register_controller_instance( new Kits_Controller( $repository ) );
		Plugin::$instance->data_manager->register_controller_instance( new Taxonomies_Controller( $repository ) );

		add_action( 'admin_menu', function () {
			$this->register_admin_menu();
		}, 50 /* after Elementor page */ );

		add_action( 'elementor/init', function () {
			$this->set_kit_library_settings();
		}, 12 /** after the initiation of the connect library */ );
	}
}
