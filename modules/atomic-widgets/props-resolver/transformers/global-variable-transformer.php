<?php

namespace Elementor\Modules\AtomicWidgets\PropsResolver\Transformers;

use Elementor\Modules\AtomicWidgets\PropsResolver\Transformer_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Global_Variable_Transformer extends Transformer_Base {
	public function transform( $value, $key ) {
		return "var( --${value} )";
	}
}
