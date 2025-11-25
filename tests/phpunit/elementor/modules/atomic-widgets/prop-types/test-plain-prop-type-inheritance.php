<?php

namespace Elementor\Testing\Modules\AtomicWidgets\PropTypes;

use Elementor\Modules\AtomicWidgets\PropTypes\Base\Plain_Prop_Type;
use PHPUnit\Framework\TestCase;

if ( ! defined( 'ABSPATH' ) ) {
  exit; // Exit if accessed directly.
}

class Test_Plain_Prop_Type_Inheritance extends TestCase {
    const WHITE_LIST = [
      'Elementor\Modules\AtomicWidgets\PropTypes\Classes_Prop_Type',
    ];

  public function test_plain_inheritance_has_kind_and_key() {


    $prop_types = Plain_Prop_Type::get_subclasses();
    $kinds = [];
    foreach ( $prop_types as $class ) {
      if ( in_array( $class, self::WHITE_LIST, true ) ) {
        $kinds []= 'plain::whitelisted-' . $class;
      } else {
        $reflection_class = new \ReflectionClass($class);
        $kinds []= $reflection_class->getStaticPropertyValue('KIND');
      }
    }
    static::assertNotContains( 'plain', $kinds );
  }
}