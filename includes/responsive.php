<?php
namespace Elementor;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * Elementor responsive.
 *
 * Elementor responsive handler class is responsible for setting up Elementor
 * responsive break points.
 *
 * @since 1.0.0
 */
class Responsive {

	/**
	 * The Elementor break point prefix.
	 */
	const BREAKPOINT_OPTION_PREFIX = 'elementor_viewport_';

	/**
	 * Default break points.
	 *
	 * Holds the default responsive break points.
	 *
	 * @since 1.0.0
	 * @access private
	 * @static
	 *
	 * @var array Default break points.
	 */
	private static $_default_breakpoints = [
		'xs' => 0,
		'sm' => 480,
		'md' => 768,
		'lg' => 1025,
	];

	/**
	 * Editable break point keys.
	 *
	 * Holds the editable break point keys.
	 *
	 * @since 1.0.0
	 * @access private
	 * @static
	 *
	 * @var array Editable break point keys.
	 */
	private static $_editable_breakpoints_keys = [
		'md',
		'lg',
	];

	/**
	 * Get default break points.
	 *
	 * Retrieve the default responsive break points.
	 *
	 * @since 1.0.0
	 * @access public
	 * @static
	 *
	 * @return array Default break points.
	 */
	public static function get_default_breakpoints() {
		return self::$_default_breakpoints;
	}

	/**
	 * Get editable break points.
	 *
	 * Retrieve the editable break points.
	 *
	 * @since 1.0.0
	 * @access public
	 * @static
	 *
	 * @return array Editable break points.
	 */
	public static function get_editable_breakpoints() {
		return array_intersect_key( self::get_breakpoints(), array_flip( self::$_editable_breakpoints_keys ) );
	}

	/**
	 * Get break points.
	 *
	 * Retrieve the responsive break points.
	 *
	 * @since 1.0.0
	 * @access public
	 * @static
	 *
	 * @return array Responsive break points.
	 */
	public static function get_breakpoints() {
		return array_reduce(
			array_keys( self::$_default_breakpoints ),  function( $new_array, $breakpoint_key ) {
				if ( ! in_array( $breakpoint_key, self::$_editable_breakpoints_keys ) ) {
					$new_array[ $breakpoint_key ] = self::$_default_breakpoints[ $breakpoint_key ];
				} else {
					$saved_option = get_option( self::BREAKPOINT_OPTION_PREFIX . $breakpoint_key );

					$new_array[ $breakpoint_key ] = $saved_option ? (int) $saved_option : self::$_default_breakpoints[ $breakpoint_key ];
				}

				return $new_array;
			}, []
		);
	}
}
