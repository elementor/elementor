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
class Icons_Manager { // extends Element_Base {
//
//	protected function _get_default_child_type( array $element_data ) {
//		// TODO: Implement _get_default_child_type() method.
//	}
//
//	public function get_name() {
//		// TODO: Implement get_name() method.
//	}


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
				'name' => 'regular',
				'label' => __( 'Regular', 'elementor' ),
				'url' => ELEMENTOR_ASSETS_URL . 'lib/font-awesome/css/regular.css',
				'enqueue' => [ ELEMENTOR_ASSETS_URL . 'lib/font-awesome/css/fontawesome.css' ],
				'prefix' => 'fa-',
				'displayPrefix' => 'far',
				'labelIcon' => 'fa-flag',
				'ver' => '5.7.2',
				'fetchJson' => ELEMENTOR_ASSETS_URL . 'lib/font-awesome/json/regular.json',
			],
			'solid' => [
				'name' => 'solid',
				'label' => __( 'Solid', 'elementor' ),
				'url' => ELEMENTOR_ASSETS_URL . 'lib/font-awesome/css/solid.css',
				'enqueue' => [ ELEMENTOR_ASSETS_URL . 'lib/font-awesome/css/fontawesome.css' ],
				'prefix' => 'fa-',
				'displayPrefix' => 'fas',
				'labelIcon' => 'fa-flag',
				'ver' => '5.7.2',
				'fetchJson' => ELEMENTOR_ASSETS_URL . 'lib/font-awesome/json/solid.json',
			],
			'brands' => [
				'name' => 'brands',
				'label' => __( 'Brands', 'elementor' ),
				'url' => ELEMENTOR_ASSETS_URL . 'lib/font-awesome/css/brands.css',
				'enqueue' => [ ELEMENTOR_ASSETS_URL . 'lib/font-awesome/css/fontawesome.css' ],
				'prefix' => 'fa-',
				'displayPrefix' => 'fab',
				'labelIcon' => 'fa-font-awesome',
				'ver' => '5.7.2',
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

	public static function get_icon_manager_tabs_config() {
		$tabs = [
			'all' => [
				'name' => 'all',
				'label' => __( 'All Icons', 'elementor' ),
			],
		];
		return array_values( array_merge( $tabs, self::get_icon_manager_tabs() ) );
	}

	/**
	 * Render Icon
	 *
	 * Used to render Icon for \Elementor\Controls_Manager::ICONS
	 * @param string $type      Icon Type
	 * @param string $value     Icon value
	 * @param array $attributes Icon HTML Attributes
	 * @param string $tag       Icon HTML tag, defaults to <i>
	 *
	 * @return mixed|string
	 */
//	public function render_icon( $type = '', $value = '', $attributes = [], $tag = 'i' ) {
//		$icon_types = self::get_icon_manager_tabs();
//		if ( isset( $icon_types[ $type ] ) && isset( $icon_types[ $type ]['render_callback'] ) && is_callable( $icon_types[ $type ]['render_callback'] ) ) {
//			return call_user_func_array( $icon_types[ $type ]['render_callback'], [ $type, $value, $attributes, $tag ] );
//		}
//		$this->add_render_attribute( $tag, $attributes );
//		$this->add_render_attribute( $tag, 'class', $value );
//		return '<' . $tag . ' ' . $this->get_render_attribute_string( $tag ) . '></i>';
//	}
}
