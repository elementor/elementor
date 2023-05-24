<?php

namespace Elementor\Tests\Phpunit\Elementor\Core\Config\Mock;

use Elementor\Core\Config\User_Config_Base;

class User_Config extends User_Config_Base {

    public static function get_key(): string {
        return 'test';
    }

    public static function get_default(): string {
        return 'default-value';
    }

    protected static function validate( $value ): bool {
        return is_string( $value );
    }
}
