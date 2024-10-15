<?php

namespace Elementor\Modules\AtomicWidgets\PropsResolver\Transformers\Styles;

use Elementor\Modules\AtomicWidgets\PropsResolver\Transformer_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Edges_Transformer extends Transformer_Base {
	public function transform( $value ) {
		$top = $value['top'] ?? 'unset';
		$right = $value['right'] ?? 'unset';
		$bottom = $value['bottom'] ?? 'unset';
		$left = $value['left'] ?? 'unset';

		return $top . ' ' . $right . ' ' . $bottom . ' ' . $left;
	}
}
