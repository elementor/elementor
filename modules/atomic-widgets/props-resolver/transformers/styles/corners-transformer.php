<?php

namespace Elementor\Modules\AtomicWidgets\PropsResolver\Transformers\Styles;

use Elementor\Modules\AtomicWidgets\PropsResolver\Transformer_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Corners_Transformer extends Transformer_Base {
	public function transform( $value ) {
		$top_left = $value['topLeft'] ?? 'unset';
		$top_right = $value['topRight'] ?? 'unset';
		$bottom_right = $value['bottomRight'] ?? 'unset';
		$bottom_left = $value['bottomLeft'] ?? 'unset';

		return $top_left . ' ' . $top_right . ' ' . $bottom_right . ' ' . $bottom_left;
	}
}
