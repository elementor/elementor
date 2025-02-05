<?php

namespace Elementor\Modules\AtomicGlobalVariables\Transformers;

use Elementor\Modules\AtomicWidgets\PropsResolver\Transformer_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Global_Variable extends Transformer_Base {
	public function transform( $value, $key ) {
		return "var(--${value})";
	}
}
