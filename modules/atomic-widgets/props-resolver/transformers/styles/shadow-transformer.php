<?php

namespace Elementor\Modules\AtomicWidgets\PropsResolver\Transformers\Styles;

use Elementor\Modules\AtomicWidgets\PropsResolver\Transformer_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Shadow_Transformer extends Transformer_Base {
	public function transform( $value, $key ) {
		$val = array_filter( [
			$value['hOffset'],
			$value['vOffset'],
			$value['blur'],
			$value['spread'],
			$value['color'],
			$value['position'] ?? '',
		] );

		return implode( ' ', $val );
	}
}
