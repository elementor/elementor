<?php
namespace Elementor\Core\Utils;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

class Arr {

	public static function insert_element_after_key( array $orig_array, string $key, string $new_key, $new_value ) {
		$new_array = [];

		$found = false;
		foreach ( $orig_array as $orig_key => $orig_value ) {
			$new_array[ $orig_key ] = $orig_value;

			if ( $orig_key === $key ) {
				$new_array[ $new_key ] = $new_value;
				$found = true;
			}
		}

		if ( ! $found ) {
			$new_array[ $new_key ] = $new_value;
		}

		return $new_array;
	}
}
