<?php

namespace Elementor\Core\Utils;

use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Template_Library_Element_Iterator {
	public static function iterate( array $elements, callable $callback ): array {
		if ( ! self::is_valid_elements_array( $elements ) ) {
			return $elements;
		}

		return Plugin::instance()->db->iterate_data( $elements, $callback );
	}

	private static function is_valid_elements_array( array $elements ): bool {
		if ( empty( $elements ) ) {
			return true;
		}

		if ( isset( $elements['elType'] ) ) {
			return true;
		}

		$first_element = reset( $elements );

		return is_array( $first_element ) && (
			isset( $first_element['elType'] ) ||
			isset( $first_element['id'] ) ||
			empty( $first_element )
		);
	}
}
