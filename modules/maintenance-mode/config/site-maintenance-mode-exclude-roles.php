<?php
namespace Elementor\Modules\Maintenance_Mode\Config;

use Elementor\Core\Config\Site_Config_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

class Site_Maintenance_Mode_Exclude_Roles extends Site_Config_Base {
	public static function get_key(): string {
		return 'maintenance_mode_exclude_roles';
	}

	public static function get_default(): array {
		return [];
	}

	public static function should_autoload(): bool {
		return true;
	}
}
