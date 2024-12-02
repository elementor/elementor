<?php

namespace Elementor\Modules\AtomicWidgets\PropsResolver\Transformers\Styles;

use Elementor\Modules\AtomicWidgets\PropsResolver\Transformer_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Background_Overlay_Transformer extends Transformer_Base {
	public function transform( $value, $key ) {
		$color = $value['color'];

		return "linear-gradient($color, $color)";
	}
}
