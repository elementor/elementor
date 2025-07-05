<?php

namespace Elementor\Core\Utils;



/**
 * @class Registry
 * @template T
 */
class Registry
{
    private static $namespaced_regsitries = [];
    private $store = array();

    /**
     * @returns Registry<T>
     */

    private function __construct() {}

    public static function instance(string $ns = 'global'): Registry
    {
        if (!isset(static::$namespaced_regsitries[$ns])) {
            static::$namespaced_regsitries[$ns] = new Registry();
        }
        return static::$namespaced_regsitries[$ns];
    }


    /**
     * @param string $key
     * @param T $value
     */
    public function set(string $key, &$value)
    {
        $this->store[$key] = &$value;
    }

    /**
     * @param string $key
     * @return T | null
     */

    public function get(string $key)
    {
        return $this->store[$key] ?? null;
    }

    public function get_all()
    {
        return array_merge($this->store);
    }
}
