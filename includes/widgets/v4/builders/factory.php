<?php

namespace Elementor\V4\Widgets\Builders;

use Elementor\Core\Utils\Registry;

class Factory {

    protected static $instance = null;

    public static function get_instance() {
        if (null === self::$instance) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    protected function __construct() {
    }

    public function register(mixed $widget_descriptor) {
        $ref = new \ReflectionClass($widget_descriptor);
        $descriptor = $ref->newInstance();
        $builder = new Atomic_Widget_Builder($descriptor);
        Registry::instance('widget_builders')->set($descriptor::class, $builder);
    }
}