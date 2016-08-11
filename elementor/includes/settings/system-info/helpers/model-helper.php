<?php
namespace Elementor\System_Info\Helpers;

if ( ! defined( 'ABSPATH' ) ) exit; // Exit if accessed directly

final class Model_Helper {

	private function __construct() {}

	public static function filter_possible_properties( $possible_properties, $properties ) {
		$properties_keys = array_flip( $possible_properties );

		return array_intersect_key( $properties, $properties_keys );
	}

	public static function prepare_properties( $possible_properties, $user_properties ) {
		$properties = array_fill_keys( $possible_properties, null );

		$properties = array_merge( $properties, $user_properties );

		return self::filter_possible_properties( $possible_properties, $properties );
	}
}
