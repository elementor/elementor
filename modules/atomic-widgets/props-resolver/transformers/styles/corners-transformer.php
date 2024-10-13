<?php

namespace Elementor\Modules\AtomicWidgets\PropsResolver\Transformers\Styles;

use Elementor\Modules\AtomicWidgets\PropsResolver\Transformer_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Corners_Transformer extends Transformer_Base {
	public function transform( $value ) {
		$topLeft = $value['topLeft'] ?? 'unset';
		$topRight = $value['topRight'] ?? 'unset';
		$bottomRight = $value['bottomRight'] ?? 'unset';
		$bottomLeft = $value['bottomLeft'] ?? 'unset';

		return $topLeft . ' ' . $topRight . ' ' . $bottomRight . ' ' . $bottomLeft;
	}
}
