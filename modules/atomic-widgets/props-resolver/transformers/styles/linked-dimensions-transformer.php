<?php

namespace Elementor\Modules\AtomicWidgets\PropsResolver\Transformers\Styles;

use Elementor\Modules\AtomicWidgets\PropsResolver\Transformer_Base;
use Elementor\Modules\AtomicWidgets\PropsResolver\Multi_Props;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Linked_Dimensions_Transformer extends Transformer_Base {
	public function transform( $value, $key ) {
		$top = $value['top'] ?? 'unset';
		$left = $value['left'] ?? 'unset';
		$bottom = $value['bottom'] ?? 'unset';
		$right = $value['right'] ?? 'unset';

		return Multi_Props::generate( [
			$key . '-top' => $top,
			$key . '-right' => $right,
			$key . '-bottom' => $bottom,
			$key . '-left' => $left,
		] );
	}
}
