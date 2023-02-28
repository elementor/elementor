<?php
namespace Elementor\Core\Kits\Controls;

use Elementor\Control_Switcher;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

class Switcher extends Control_Switcher {

	const CONTROL_TYPE = 'global-style-switcher';

	/**
	 * Get control type.
	 *
	 * Retrieve the control type, in this case `global-style-switcher`.
	 *
	 * @since 3.12.0
	 * @access public
	 *
	 * @return string Control type.
	 */
	public function get_type() {
		return self::CONTROL_TYPE;
	}
}
