<?php
namespace Elementor\Core\Upgrade;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Conditions {

	public static function _v_3_15_9_container_updates__should_run() {
		return ( 'yes' === get_option( 'elementor_container_gap_updated' ) ) ? false : true;
	}
}
