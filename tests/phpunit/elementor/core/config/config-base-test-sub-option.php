<?php

namespace Elementor\Tests\Phpunit\Elementor\Core\Config;

use Elementor\Core\Config\Config_Array_Trait;

class Config_Base_Test_Sub_Option extends Config_Base_Test {

	use Config_Array_Trait;

    public static function get_key(): string {
        return 'test_sub_option';
    }

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
