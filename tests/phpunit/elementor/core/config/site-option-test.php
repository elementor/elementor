<?php

namespace Elementor\Tests\Phpunit\Elementor\Core\Config;

use Elementor\Core\Config\Site_Config_Base;

class Site_Option_Test extends Site_Config_Base {
    public static function should_autoload(): bool {
        return false;
    }

    public static function get_key(): string {
        return 'test';
    }

    public static function get_default(): string {
        return 'default-value';
    }

    protected static function validate($value): bool {
        return is_string( $value );
    }
}
