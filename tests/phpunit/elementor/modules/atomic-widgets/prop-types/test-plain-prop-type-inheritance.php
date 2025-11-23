<?php

namespace Elementor\Testing\Modules\AtomicWidgets\PropTypes;

use Elementor\Modules\AtomicWidgets\PropTypes\Base\Plain_Prop_Type;
use PHPUnit\Framework\TestCase;

if ( ! defined( 'ABSPATH' ) ) {
  exit; // Exit if accessed directly.
}

class Test_Plain_Prop_Type_Inheritance extends TestCase {

  public function test_component_id_prop_type_inherits_number_prop_type() {

    $prop_types = Plain_Prop_Type::get_subclasses();
    $keys = [];
    $kinds = [];
    foreach ( $classes as $class ) {
      $keys []= $class::get_key();
      $kinds []= $class::KIND;
    }
    static::assertNotContains( 'plain', $keys );
    static::assertNotContains( 'plain', $kinds );
  }
}