<?php

namespace Elementor\Modules\AtomicWidgets\PropsResolver\Transformers\Styles;

use Elementor\Modules\AtomicWidgets\PropsResolver\Props_Resolver_Context;
use Elementor\Modules\AtomicWidgets\PropsResolver\Transformer_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Transform_Rotate_Transformer extends Transformer_Base {
	public function transform( $value, Props_Resolver_Context $context ): string {
		$default_Rotate = '0deg';
		return sprintf(
			'rotateX(%sdeg) rotateY(%sdeg) rotateZ(%sdeg)',
			$value['x'] ?? $default_Rotate,
			$value['y'] ?? $default_Rotate,
			$value['z'] ??$default_Rotate
		);
	}
}
