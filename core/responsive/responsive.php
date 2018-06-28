<?php
namespace Elementor\Core\Responsive;

use Elementor\Core\Responsive\Files\Frontend;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * Elementor responsive.
 *
 * Elementor responsive handler class is responsible for setting up Elementor
 * responsive breakpoints.
 *
 * @since 1.0.0
 */
class Responsive {

	/**
	 * The Elementor breakpoint prefix.
	 */
	const BREAKPOINT_OPTION_PREFIX = 'elementor_viewport_';

	/**
	 * 'desktop' device name.
	 */
	const DESKTOP = 'desktop';

	/**
	 * 'laptop' device name.
	 */
	const LAPTOP = 'laptop';

	/**
	 * 'tablet' device name.
	 */
	const TABLET = 'tablet';

	/**
	 * 'mobile' device name.
	 */
	const MOBILE = 'mobile';

	/**
	 * Breakpoints.
	 *
	 * Holds the responsive breakpoints.
	 *
	 * @since 2.1.0
	 * @access private
	 * @static
	 *
	 * @var array Breakpoints.
	 */
	private static $breakpoints;

	/**
	 * Default breakpoints.
	 *
	 * Holds the default responsive breakpoints.
	 *
	 * @since 1.0.0
	 * @access private
	 * @static
	 *
	 * @var array Default breakpoints.
	 */
	private static $default_breakpoints;

	/**
	 * Get default breakpoints.
	 *
	 * Retrieve the default responsive breakpoints.
	 *
	 * @since 1.0.0
	 * @access public
	 * @static
	 *
	 * @return array Default breakpoints.
	 */
	public static function get_default_breakpoints() {
		if ( ! self::$default_breakpoints ) {
			self::$default_breakpoints = [
				'lg' => [
					'value' => 1025,
					'name' => self::DESKTOP,
					'title' => __( 'Desktop', 'elementor' ),
				],
				'lt' => [
					'value' => 900,
					'name' => self::LAPTOP,
					'title' => __( 'Laptop', 'elementor' ),
				],
				'md' => [
					'value' => 768,
					'name' => self::TABLET,
					'title' => __( 'Tablet', 'elementor' ),
				],
				'sm' => [
					'value' => 0,
					'name' => self::MOBILE,
					'title' => __( 'Mobile', 'elementor' ),
					'preview_size' => 360,
				],
			];
		}

		return self::$default_breakpoints;
	}

	/**
	 * Get editable breakpoints.
	 *
	 * Retrieve the editable breakpoints.
	 *
	 * @since 1.0.0
	 * @deprecated 2.1.0
	 * @access public
	 * @static
	 *
	 * @return array Editable breakpoints.
	 */
	public static function get_editable_breakpoints() {
		return [ 'md', 'lt', 'lg' ];
	}

	/**
	 * Get breakpoints.
	 *
	 * Retrieve the responsive breakpoints.
	 *
	 * @since 1.0.0
	 * @access public
	 * @static
	 *
	 * @return array Responsive breakpoints.
	 */
	public static function get_breakpoints() {
		if ( ! self::$breakpoints ) {
			self::$breakpoints = self::get_default_breakpoints();

			foreach ( self::$breakpoints as $breakpoint_key => $breakpoint ) {
				if ( Responsive::MOBILE === $breakpoint['name'] ) {
					continue;
				}

				$saved_option = get_option( self::BREAKPOINT_OPTION_PREFIX . $breakpoint_key );

				if ( $saved_option ) {
					self::$breakpoints[ $breakpoint_key ]['value'] = (int) $saved_option;

					self::$breakpoints[ $breakpoint_key ]['custom'] = true;
				}
			}
		}

		return self::$breakpoints;
	}

	public static function get_next_breakpoint( $breakpoint_key ) {
		return self::get_sibling_breakpoint( $breakpoint_key, -1 );
	}

	public static function get_previous_breakpoint( $breakpoint_key ) {
		return self::get_sibling_breakpoint( $breakpoint_key, 1 );
	}

	public static function has_custom_breakpoints() {
		$default_breakpoints = self::get_default_breakpoints();

		foreach ( self::get_breakpoints() as $breakpoint_key => $breakpoint ) {
			if ( $breakpoint['value'] !== $default_breakpoints[ $breakpoint_key ]['value'] ) {
				return true;
			}
		}

		return false;
	}

	public static function get_stylesheet_templates_path() {
		return ELEMENTOR_ASSETS_PATH . 'css/templates/';
	}

	public static function compile_stylesheet_templates() {
		foreach ( self::get_stylesheet_templates() as $file_name => $template_path ) {
			$file = new Frontend( $file_name, $template_path );

			$file->update();
		}
	}

	private static function get_sibling_breakpoint( $breakpoint_key, $step ) {
		$breakpoints = self::get_breakpoints();

		$breakpoints_keys = array_keys( $breakpoints );

		$breakpoint_index = array_search( $breakpoint_key, $breakpoints_keys );

		if ( false === $breakpoint_index || ! isset( $breakpoints[ $breakpoints_keys[ $breakpoint_index + $step ] ] ) ) {
			return null;
		}

		return $breakpoints[ $breakpoints_keys[ $breakpoint_index + $step ] ];
	}

	private static function get_stylesheet_templates() {
		$templates_paths = glob( self::get_stylesheet_templates_path() . '*.css' );

		$templates = [];

		foreach ( $templates_paths as $template_path ) {
			$file_name = 'custom-' . basename( $template_path );

			$templates[ $file_name ] = $template_path;
		}

		return apply_filters( 'elementor/core/responsive/get_stylesheet_templates', $templates );
	}
}
