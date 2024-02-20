<?php
namespace Elementor\Core\Upgrade;

use Elementor\Tracker;
use Elementor\Icons_Manager;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

class Custom_Tasks {
	public static function opt_in_recalculate_usage( $updater ) {
		return Upgrades::recalc_usage_data( $updater );
	}

	public static function opt_in_send_tracking_data() {
		Tracker::send_tracking_data( true );
	}

	public static function migrate_fa_icon_values( $updater ) {
		Icons_Manager::$migrations::migrate_icon_values( $updater );
	}
}
