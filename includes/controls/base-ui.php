<?php
namespace Elementor;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * Base UI control.
 *
 * A base control for creating UI controls.
 *
 * @abstract
 */
abstract class Base_UI_Control extends Base_Control {

	/**
	 * Retrieve features.
	 *
	 * Get the list of all the available features.
	 *
	 * @access public
	 * @static
	 *
	 * @return array Features array.
	 */
	public static function get_features() {
		return [ 'ui' ];
	}
}
