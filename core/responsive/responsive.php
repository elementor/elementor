<?php
namespace Elementor\Core\Responsive;

use Elementor\Core\Files\Frontend;

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
	private static $default_breakpoints = [
		'xs' => 0,
		'sm' => 480,
		'md' => 768,
		'lg' => 1025,
		'xl' => 1440,
		'xxl' => 1600,
	];

	/**
	 * Editable breakpoint keys.
	 *
	 * Holds the editable breakpoint keys.
	 *
	 * @since 1.0.0
	 * @access private
	 * @static
	 *
	 * @var array Editable breakpoint keys.
	 */
	private static $editable_breakpoints_keys = [
		'md',
		'lg',
	];

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
		return self::$default_breakpoints;
	}

	/**
	 * Get editable breakpoints.
	 *
	 * Retrieve the editable breakpoints.
	 *
	 * @since 1.0.0
	 * @access public
	 * @static
	 *
	 * @return array Editable breakpoints.
	 */
	public static function get_editable_breakpoints() {
		return array_intersect_key( self::get_breakpoints(), array_flip( self::$editable_breakpoints_keys ) );
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
		return array_reduce(
			array_keys( self::$default_breakpoints ),  function( $new_array, $breakpoint_key ) {
				if ( ! in_array( $breakpoint_key, self::$editable_breakpoints_keys ) ) {
					$new_array[ $breakpoint_key ] = self::$default_breakpoints[ $breakpoint_key ];
				} else {
					$saved_option = get_option( self::BREAKPOINT_OPTION_PREFIX . $breakpoint_key );

					$new_array[ $breakpoint_key ] = $saved_option ? (int) $saved_option : self::$default_breakpoints[ $breakpoint_key ];
				}

				return $new_array;
			}, []
		);
	}

	public static function has_custom_breakpoints() {
		return ! ! array_diff( self::$default_breakpoints, self::get_breakpoints() );
	}

	public static function get_templates_path() {
		return ELEMENTOR_ASSETS_PATH . 'css-templates/';
	}

	public static function compile_templates() {
		foreach ( glob( self::get_templates_path() . '*.css' ) as $file ) {
			$file_name = basename( $file );

			$file = new Frontend( 'custom-' . $file_name );

			$file->update();
		}
	}
}
