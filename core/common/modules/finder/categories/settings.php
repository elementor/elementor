<?php

namespace Elementor\Core\Common\Modules\Finder\Categories;

use Elementor\Core\Common\Modules\Finder\Base_Category;
use Elementor\Modules\ElementManager\Module as ElementManagerModule;
use Elementor\Settings as ElementorSettings;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * Settings Category
 *
 * Provides items related to Elementor's settings.
 */
class Settings extends Base_Category {

	/**
	 * Get title.
	 *
	 * @since 2.3.0
	 * @access public
	 *
	 * @return string
	 */
	public function get_title() {
		return esc_html__( 'Settings', 'elementor' );
	}

	public function get_id() {
		return 'settings';
	}

	/**
	 * Get category items.
	 *
	 * @since 2.3.0
	 * @access public
	 *
	 * @param array $options
	 *
	 * @return array
	 */
	public function get_category_items( array $options = array() ) {
		return array(
			'general-settings' => array(
				'title' => esc_html__( 'General Settings', 'elementor' ),
				'url' => ElementorSettings::get_settings_tab_url( 'general' ),
				'keywords' => array( 'general', 'settings', 'elementor' ),
			),
			'integrations' => array(
				'title' => esc_html__( 'Integrations', 'elementor' ),
				'url' => ElementorSettings::get_settings_tab_url( 'integrations' ),
				'keywords' => array( 'integrations', 'settings', 'elementor' ),
			),
			'advanced' => array(
				'title' => esc_html__( 'Advanced', 'elementor' ),
				'url' => ElementorSettings::get_settings_tab_url( 'advanced' ),
				'keywords' => array( 'advanced', 'settings', 'elementor' ),
			),
			'performance' => array(
				'title' => esc_html__( 'Performance', 'elementor' ),
				'url' => ElementorSettings::get_settings_tab_url( 'performance' ),
				'keywords' => array( 'performance', 'settings', 'elementor' ),
			),
			'experiments' => array(
				'title' => esc_html__( 'Experiments', 'elementor' ),
				'url' => ElementorSettings::get_settings_tab_url( 'experiments' ),
				'keywords' => array( 'settings', 'elementor', 'experiments' ),
			),
			'features' => array(
				'title' => esc_html__( 'Features', 'elementor' ),
				'url' => ElementorSettings::get_settings_tab_url( 'experiments' ),
				'keywords' => array( 'settings', 'elementor', 'features' ),
			),
			'element-manager' => array(
				'title' => esc_html__( 'Element Manager', 'elementor' ),
				'url' => admin_url( 'admin.php?page=' . ElementManagerModule::PAGE_ID ),
				'keywords' => array( 'settings', 'elements', 'widgets', 'manager' ),
			),
		);
	}
}
