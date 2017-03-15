<?php
namespace Elementor;

if ( ! defined( 'ABSPATH' ) ) exit; // Exit if accessed directly

class Responsive {
	const BREAKPOINT_OPTION_PREFIX = 'elementor_viewport_';

	private static $_default_breakpoints = [
		'xs' => 0,
		'sm' => 480,
		'md' => 768,
		'lg' => 1025,
	];

	private static $_editable_breakpoints_keys = [
		'md',
		'lg',
	];

	/**
	 * @return array
	 */
	public static function get_default_breakpoints() {
		return self::$_default_breakpoints;
	}

	/**
	 * @return array
	 */
	public static function get_editable_breakpoints() {
		return array_intersect_key( self::get_breakpoints(), array_flip( self::$_editable_breakpoints_keys ) );
	}

	/**
	 * @return array
	 */
	public static function get_breakpoints() {
		return array_reduce( array_keys( self::$_default_breakpoints ),  function( $new_array, $breakpoint_key ) {
			if ( ! in_array( $breakpoint_key, self::$_editable_breakpoints_keys ) ) {
				$new_array[ $breakpoint_key ] = self::$_default_breakpoints[ $breakpoint_key ];
			} else {
				$saved_option = get_option( self::BREAKPOINT_OPTION_PREFIX . $breakpoint_key );

				$new_array[ $breakpoint_key ] = $saved_option ? (int) $saved_option : self::$_default_breakpoints[ $breakpoint_key ];
			}

			return $new_array;
		}, [] );
	}
}
