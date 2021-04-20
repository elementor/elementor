<?php
namespace Elementor\Core\App\Modules\KitLibrary;

use Elementor\Plugin;
use Elementor\TemplateLibrary\Source_Local;
use Elementor\Core\Base\Module as BaseModule;
use Elementor\Core\Common\Modules\Connect\Module as ConnectModule;
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

	private function set_kit_library_settings() {
		if ( ! Plugin::$instance->common ) {
			return;
		}

		/** @var ConnectModule $connect */
		$connect = Plugin::$instance->common->get_component( 'connect' );

		/** @var Library $library */
		$library = Plugin::$instance->common->get_component( 'connect' )->get_app( 'library' );

		Plugin::$instance->app->set_settings( 'kit-library', [
			'subscription_plans' => $connect->get_subscription_plans( 'kit-library' ),
			'is_pro' => false,
			'is_library_connected' => $library->is_connected(),
			'library_connect_url'  => $library->get_admin_url( 'authorize' ),
			'access_level' => ConnectModule::ACCESS_LEVEL_CORE,
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
