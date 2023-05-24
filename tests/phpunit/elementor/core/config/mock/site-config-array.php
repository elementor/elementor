<?php

namespace Elementor\Tests\Phpunit\Elementor\Core\Config\Mock;

use Elementor\Core\Config\Config_Array_Trait;

class Site_Config_Array extends Site_Config {

	use Config_Array_Trait;

	public static function get_default(): array {
		return [ 'default-value' ];
	}

	protected static function validate( $value ): bool {
		return is_array( $value );
	}

	protected static function has_permission( $value ): bool {
		return true;
	}
}
