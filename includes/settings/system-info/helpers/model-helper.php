<?php
namespace Elementor\System_Info\Helpers;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

final class Model_Helper {

	/**
	 * @access private
	 * @since 1.0.0
	 */
	private function __construct() {}

	/**
	 * @static
	 * @access public
	 * @since 1.0.0
	 */
	public static function filter_possible_properties( $possible_properties, $properties ) {
		$properties_keys = array_flip( $possible_properties );

		return array_intersect_key( $properties, $properties_keys );
	}

	/**
	 * @static
	 * @access public
	 * @since 1.0.0
	 */
	public static function prepare_properties( $possible_properties, $user_properties ) {
		$properties = array_fill_keys( $possible_properties, null );

		$properties = array_merge( $properties, $user_properties );

		return self::filter_possible_properties( $possible_properties, $properties );
	}
}
