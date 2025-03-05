<?php

namespace Elementor\Modules\AtomicWidgets\PropsResolver\Transformers;

use Elementor\Modules\AtomicWidgets\PropsResolver\Transformer_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Array_Transformer extends Transformer_Base {
	public function transform( $value, $key ) {
		if ( ! is_array( $value ) ) {
			return null;
		}

		return array_filter( $value );
	}
}
