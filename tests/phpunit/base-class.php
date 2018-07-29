<?php

namespace Elementor\Testing;

class Elementor_Test_Base extends \WP_UnitTestCase {
    /**
     * @var Local_Factory
     */
    protected static $local_factory;

    public function __construct($name = null, array $data = [], $dataName = '') {
        parent::__construct($name, $data, $dataName);
        self::$local_factory = new Local_Factory();
    }
}