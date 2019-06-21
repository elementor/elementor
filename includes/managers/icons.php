<?php
namespace Elementor;

use Elementor\Core\Files\Assets\Svg\Svg_Handler;

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
class Icons_Manager {
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
		self::$tabs = apply_filters( 'elementor/icons_manager/native', [
			'regular' => [
				'name' => 'regular',
				'label' => __( 'Regular', 'elementor' ),
				'url' => self::get_asset_url( 'regular' ),
				'enqueue' => [ self::get_asset_url( 'fontawesome' ) ],
				'prefix' => 'fa-',
				'displayPrefix' => 'far',
				'labelIcon' => 'fa-flag',
				'ver' => '5.9.0',
				'fetchJson' => self::get_asset_url( 'regular', 'json', false ),
			],
			'solid' => [
				'name' => 'solid',
				'label' => __( 'Solid', 'elementor' ),
				'url' => self::get_asset_url( 'solid' ),
				'enqueue' => [ self::get_asset_url( 'fontawesome' ) ],
				'prefix' => 'fa-',
				'displayPrefix' => 'fas',
				'labelIcon' => 'fa-flag',
				'ver' => '5.9.0',
				'fetchJson' => self::get_asset_url( 'solid', 'json', false ),
			],
			'brands' => [
				'name' => 'brands',
				'label' => __( 'Brands', 'elementor' ),
				'url' => self::get_asset_url( 'brands' ),
				'enqueue' => [ self::get_asset_url( 'fontawesome' ) ],
				'prefix' => 'fa-',
				'displayPrefix' => 'fab',
				'labelIcon' => 'fa-font-awesome',
				'ver' => '5.9.0',
				'fetchJson' => self::get_asset_url( 'brands', 'json', false ),
			],
		] );
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

	public static function enqueue_shim() {
		if ( did_action( 'elementor_pro/icons_manager/shim_enqueued' ) ) {
			return;
		}
		do_action( 'elementor_pro/icons_manager/shim_enqueued' );
		wp_enqueue_script(
			'font-awesome-4-shim',
			self::get_asset_url( 'v4-shim', 'js' ),
			[],
			ELEMENTOR_VERSION
		);
		wp_enqueue_style(
			'font-awesome-5-all',
			self::get_asset_url( 'all' ),
			[],
			ELEMENTOR_VERSION
		);
		wp_enqueue_style(
			'font-awesome-4-shim',
			self::get_asset_url( 'v4-shim' ),
			[],
			ELEMENTOR_VERSION
		);
	}

	private static function get_asset_url( $filename, $ext_type = 'css', $add_suffix = true ) {
		static $is_test_mode = null;
		if ( null === $is_test_mode ) {
			$is_test_mode = defined( 'SCRIPT_DEBUG' ) && SCRIPT_DEBUG || defined( 'ELEMENTOR_TESTS' ) && ELEMENTOR_TESTS;
		}
		$url = ELEMENTOR_ASSETS_URL . 'lib/font-awesome/' . $ext_type . '/' . $filename;
		if ( ! $is_test_mode && $add_suffix ) {
			$url .= '.min';
		}
		return $url . '.' . $ext_type;
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

	private static function render_svg_icon( $value ) {
		if ( ! isset( $value['id'] ) ) {
			return '';
		}
		return Svg_Handler::get_inline_svg( $value['id'] );
	}

	private static function render_icon_html( $icon, $attributes = [], $tag = 'i' ) {
		$icon_types = self::get_icon_manager_tabs();
		if ( isset( $icon_types[ $icon['library'] ]['render_callback'] ) && is_callable( $icon_types[ $icon['library'] ]['render_callback'] ) ) {
			return call_user_func_array( $icon_types[ $icon['library'] ]['render_callback'], [ $icon, $attributes, $tag ] );
		}

		if ( empty( $attributes['class'] ) ) {
			$attributes['class'] = $icon['value'];
		} else {
			if ( is_array( $attributes['class'] ) ) {
				$attributes['class'][] = $icon['value'];
			} else {
				$attributes['class'] .= ' ' . $icon['value'];
			}
		}
		return '<' . $tag . ' ' . Utils::render_html_attributes( $attributes ) . '></' . $tag . '>';
	}

	/**
	 * Render Icon
	 *
	 * Used to render Icon for \Elementor\Controls_Manager::ICONS
	 * @param array $icon             Icon Type, Icon value
	 * @param array $attributes       Icon HTML Attributes
	 * @param string $tag             Icon HTML tag, defaults to <i>
	 *
	 * @return mixed|string
	 */
	public static function render_icon( $icon, $attributes = [], $tag = 'i' ) {
		if ( empty( $icon['library'] ) ) {
			return false;
		}
		$output = '';
		// handler SVG Icon
		if ( 'svg' === $icon['library'] ) {
			$output = self::render_svg_icon( $icon['value'] );
		} else {
			$output = self::render_icon_html( $icon, $attributes, $tag );
		}
		echo $output;
		return true;
	}
}
