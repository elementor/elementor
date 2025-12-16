<?php

namespace Elementor\Modules\AtomicWidgets\PropsResolver\Transformers;

use Elementor\Modules\AtomicWidgets\PropsResolver\Props_Resolver_Context;
use Elementor\Modules\AtomicWidgets\PropsResolver\Transformer_Base;

if ( ! defined( 'ABSPATH' ) ) {
  exit; // Exit if accessed directly.
}

class No_Op_Transformer extends Transformer_Base {
  public function transform( $value, Props_Resolver_Context $context ) {
    return [
      $$type => $content->prop_type->$kind,
      value => $value,
    ];
  }
}