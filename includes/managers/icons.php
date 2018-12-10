<?php
namespace Elementor;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * Elementor icons manager.
 *
 * Elementor icons manager handler class
 *
 * @since 2.4.0
 */
class Icons_Manager extends Element_Base {

	protected function _get_default_child_type( array $element_data ) {
		// TODO: Implement _get_default_child_type() method.
	}

	public function get_name() {
		// TODO: Implement get_name() method.
	}


	/**
	 * Tabs.
	 *
	 * Holds the list of all the tabs.
	 *
	 * @access private
	 * @static
	 * @since 2.4.0
	 * @var array
	 */
	private static $tabs;

	/**
	 * Init Tabs
	 *
	 * Initiate Icon Manager Tabs.
	 *
	 * @access private
	 * @static
	 * @since 2.4.0
	 */
	private static function init_tabs() {
		self::$tabs = [
			'regular' => [
				'label' => __( 'Regular', 'elementor' ),
				'url' => ELEMENTOR_ASSETS_URL . 'lib/font-awesome/css/regular.css',
				'enqueue' => [ ELEMENTOR_ASSETS_URL . 'lib/font-awesome/css/fontawesome.css' ],
				'prefix' => 'fa-',
				'displayPrefix' => 'far',
				'ver' => '5.5.0',
				'fetchJson' => ELEMENTOR_ASSETS_URL . 'lib/font-awesome/json/regular.json',
			],
			'solid' => [
				'label' => __( 'Solid', 'elementor' ),
				'url' => ELEMENTOR_ASSETS_URL . 'lib/font-awesome/css/solid.css',
				'enqueue' => [ ELEMENTOR_ASSETS_URL . 'lib/font-awesome/css/fontawesome.css' ],
				'prefix' => 'fa-',
				'displayPrefix' => 'fas',
				'ver' => '5.5.0',
				'fetchJson' => ELEMENTOR_ASSETS_URL . 'lib/font-awesome/json/solid.json',
			],
			'brands' => [
				'label' => __( 'Brands', 'elementor' ),
				'url' => ELEMENTOR_ASSETS_URL . 'lib/font-awesome/css/brands.css',
				'enqueue' => [ ELEMENTOR_ASSETS_URL . 'lib/font-awesome/css/fontawesome.css' ],
				'prefix' => 'fa-',
				'displayPrefix' => 'fab',
				'ver' => '5.5.0',
				'fetchJson' => ELEMENTOR_ASSETS_URL . 'lib/font-awesome/json/brands.json',
			],
		];
	}

	/**
	 * Get Icon Manager Tabs
	 * @return array
	 */
	public static function get_icon_manager_tabs() {
		if ( ! self::$tabs ) {
			self::init_tabs();
		}
		$additional_tabs = apply_filters( 'elementor/icons_manager/additional_tabs', [] );
		return array_merge( self::$tabs, $additional_tabs );
	}

	public static function render_icon( $type, $value, $attributes = [], $tag = 'i' ) {
//		$icon_types = self::get_icon_manager_tabs();
//		if ( isset( $icon_types[ $type ] ) && isset( $icon_types[ $type ]['render_callback'] ) ) {
//
//		}

	}

	public function __construct() { }
}
