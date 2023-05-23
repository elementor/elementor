<?php

namespace Elementor\Tests\Phpunit\Elementor\Core\Config;

use Elementor\Core\Config\Config_Base;
use Elementor\Core\Config\Config_Boolean_Trait;

class Config_Boolean_Trait_Test extends Config_Base {
    use Config_Boolean_Trait;

    const PREFIX = 'elementor_';

    static $value;
    static $changed;


    public static function should_autoload(): bool {
        return false;
    }

    public static function get_key(): string {
        return 'test';
    }

    public static function get_default() {
        return static::VALUE_FALSE;
    }

    public static function get_value() {
        return static::$value;
    }

    public static function setter($value): bool {
        static::$value = $value;
        return true;
    }

    public static function deleter(): bool {
        static::$value = null;
        return true;
    }

    public static function on_change($new_value, $old_value = null) {
        static::$changed = [
            'new' => $new_value,
            'old' => $old_value,
        ];
    }

    protected static function validate($value): bool {
        return is_bool($value);
    }

    protected static function has_permission($value): bool {
        return true;
    }
}
