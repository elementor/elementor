<?php

namespace Elementor\Tests\Phpunit\Elementor\Core\Config\Mock;

use Elementor\Core\Config\Config_Boolean_Trait;

class Site_Config_Boolean extends Site_Config {

    use Config_Boolean_Trait;

	/**
	 * @var array
	 */
	public static $changed;

	public static function get_default() {
        return static::VALUE_FALSE;
    }

	public static function on_change( $new_value, $old_value ) {
		static::$changed = [
			'new' => $new_value,
			'old' => $old_value,
		];
	}

	protected static function has_permission($value): bool {
		return true;
	}
}
