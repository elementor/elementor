<?php

namespace Elementor\Modules\AtomicWidgets\PropsResolver\Transformers\Styles;

use Elementor\Modules\AtomicWidgets\PropsResolver\Transformer_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Stroke_Transformer extends Transformer_Base {
	public function transform( $value, $key ): string {
		$width = $value['width']['value'];
		$color = $value['color']['value'];

		return $width['size'] . $width['unit'] . ' ' . $color;
	}
}
