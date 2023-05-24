<?php

namespace Elementor\Tests\Phpunit\Elementor\Core\Config\Mock;

use Elementor\Core\Config\Config_Base;
use Elementor\Core\Config\Site_Config_Base;

class Site_Config extends Site_Config_Base {

	public static $changed;

	public static function should_autoload(): bool {
		return false;
	}

	public static function get_key(): string {
		return 'test';
	}

	public static function get_default() {
		return 'default-value';
	}

	public static function on_change( $new_value, $old_value ) {
		static::$changed = [
			'new' => $new_value,
			'old' => $old_value,
		];
	}

	protected static function validate( $value ): bool {
		return is_string( $value );
	}
}
