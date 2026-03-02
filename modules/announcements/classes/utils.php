<?php

namespace Elementor\Modules\Announcements\Classes;

use Elementor\Modules\Announcements\Triggers\AiStarted;
use Elementor\Modules\Announcements\Triggers\AllyStarted;
use Elementor\Modules\Announcements\Triggers\IsFlexContainerInactive;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Utils {
	/**
	 * Get trigger object.
	 *
	 * @param $trigger
	 *
	 * @return IsFlexContainerInactive|AiStarted|AllyStarted|false
	 */
	public static function get_trigger_object( $trigger ) {
		$object_trigger = apply_filters( 'elementor/announcements/trigger_object', false, $trigger );

		if ( false !== $object_trigger ) {
			return $object_trigger;
		}

		// @TODO - replace with trigger manager
		switch ( $trigger['action'] ) {
			case 'isFlexContainerInactive':
				return new IsFlexContainerInactive();
			case 'aiStarted':
				return new AiStarted();
			case 'allyStarted':
				return new AllyStarted();
			default:
				return false;
		}
	}
}
