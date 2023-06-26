<?php

namespace Elementor\Core\Kits\Config;

use Elementor\Core\Config\Site_Config_Base;

if (!defined('ABSPATH')) {
	exit; // Exit if accessed directly
}

class Site_Previous_Kit_Id extends Site_Config_Base {

	public static function get_key(): string {
		return 'elementor_previous_kit';
	}

	public static function get_default(): int {
		return 0;
	}

	public static function should_autoload(): bool {
		return false;
	}

	public static function get_value(): int {
		return (int) parent::get_value();
	}

	protected static function validate( $value ): bool {
		return is_int( $value ) && $value >= 0;
	}
}
