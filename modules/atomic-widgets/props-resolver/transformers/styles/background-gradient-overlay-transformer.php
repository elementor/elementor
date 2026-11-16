<?php

namespace Elementor\Modules\AtomicWidgets\PropsResolver\Transformers\Styles;

use Elementor\Modules\AtomicWidgets\PropsResolver\Props_Resolver_Context;
use Elementor\Modules\AtomicWidgets\PropsResolver\Transformer_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Background_Gradient_Overlay_Transformer extends Transformer_Base {
	public function transform( $value, Props_Resolver_Context $context ): string {
		$type = $value['type'] ?? null;
		$angle = $value['angle'] ?? null;
		$positions = $value['positions'] ?? null;
		$stops = $value['stops'] ?? '';

		if ( 'radial' === $type ) {
			return sprintf( 'radial-gradient(circle at %s, %s)', $positions, $stops );
		}

		if ( ! is_numeric( $angle ) ) {
			return sprintf( 'linear-gradient(%s)', $stops );
		}

		return sprintf( 'linear-gradient(%ddeg, %s)', $angle, $stops );
	}
}
