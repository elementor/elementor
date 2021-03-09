<?php
namespace Elementor\Core\App\Modules\KitLibrary;

use Elementor\Plugin;
use Elementor\TemplateLibrary\Source_Local;
use Elementor\Core\Base\Module as BaseModule;
use Elementor\Core\App\Modules\KitLibrary\Data\Controller;

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

	/**
	 * Module constructor.
	 */
	public function __construct() {
		Plugin::$instance->data_manager->register_controller( Controller::class );

		add_action( 'admin_menu', function () {
			$this->register_admin_menu();
		}, 50 /* after Elementor page */ );
	}
}
