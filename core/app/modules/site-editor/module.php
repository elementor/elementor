<?php
namespace Elementor\Core\App\Modules\SiteEditor;

use Elementor\Core\Base\Module as BaseModule;
use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

/**
 * Site Editor Module
 *
 * Responsible for initializing Elementor App functionality
 */
class Module extends BaseModule {
	/**
	 * Get name.
	 *
	 * @access public
	 *
	 * @return string
	 */
	public function get_name() {
		return 'site-editor';
	}

	public function add_menu_in_admin_bar( $admin_bar_config ) {
		$admin_bar_config['elementor_edit_page']['children'][] = [
			'id' => 'elementor_app_site_editor',
			'title' => __( 'Theme Builder', 'elementor' ),
			'sub_title' => __( 'Site', 'elementor' ),
			'href' => Plugin::$instance->app->get_settings( 'menu_url' ),
			'class' => 'elementor-app-link',
			'parent_class' => 'elementor-second-section',
		];

		return $admin_bar_config;
	}

	public function __construct() {
		add_filter( 'elementor/frontend/admin_bar/settings', [ $this, 'add_menu_in_admin_bar' ] ); // After kit (Site settings)
	}
}
