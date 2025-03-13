<?php

namespace Elementor\Modules\AtomicWidgets\PropsResolver\Transformers\Styles;

use Elementor\Modules\AtomicWidgets\PropsResolver\Props_Resolver_Context;
use Elementor\Modules\AtomicWidgets\PropsResolver\Transformer_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Background_Gradient_Overlay_Transformer extends Transformer_Base {
	public function transform( $value, Props_Resolver_Context $context ): string {
		$type = $value['type'];
		$angle = $value['angle'];
		$positions = $value['positions'];
		$stops = $value['stops'];

		if ( 'radial' === $type ) {
			return "radial-gradient(circle at $positions, $stops)";
		}

		return 'linear-gradient(' . $angle . 'deg, $stops)';
	}
}
