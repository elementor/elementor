<?php
namespace Elementor\Modules\ElementManager;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Options {

	private static $disabled_elements = null;

	public static function get_disabled_elements() {
		if ( null === self::$disabled_elements ) {
			self::$disabled_elements = (array) get_option( 'elementor_disabled_elements', [] );
		}
		return self::$disabled_elements;
	}

	public static function update_disabled_elements( $elements ) {
		update_option( 'elementor_disabled_elements', (array) $elements );

		self::$disabled_elements = null;
	}

	public static function is_element_disabled( $element_name ) {
		return in_array( $element_name, self::get_disabled_elements() );
	}
}
