<?php
namespace Elementor;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * Group control interface.
 */
interface Group_Control_Interface {

	/**
	 * Retrieve group control type.
	 *
	 * @access public
	 * @static
	 */
	public static function get_type();
}
