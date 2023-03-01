<?php

namespace Elementor\Modules\Announcements\Utils;

use Elementor\Modules\Announcements\Triggers\IsFlexContainerInactive;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Triggers {
	/**
	 * get_trigger_object
	 *
	 * @param $trigger
	 *
	 * @return IsFlexContainerInactive|false
	 */
	public static function get_trigger_object( $trigger ) {
		//@TODO - replace with trigger manager
		switch ( $trigger['action'] ) {
			case 'isFlexContainerInactive':
				return new IsFlexContainerInactive();
			default:
				return false;
		}
	}
}
