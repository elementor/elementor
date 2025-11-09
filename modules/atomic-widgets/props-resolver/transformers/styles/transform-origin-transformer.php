<?php

namespace Elementor\Modules\AtomicWidgets\PropsResolver\Transformers\Styles;

use Elementor\Modules\AtomicWidgets\PropsResolver\Props_Resolver_Context;
use Elementor\Modules\AtomicWidgets\PropsResolver\Transformer_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Transform_Origin_Transformer extends Transformer_Base {


	private string $default_origin = '0px';
	private string $default_xy = '50%';

	private function get_val( ?string $val ): string {
		return $val ?? $this->default_origin;
	}

	public function transform( $value, Props_Resolver_Context $context ) {
		$x = $this->get_val( $value['x'] );
		$y = $this->get_val( $value['y'] );
		$z = $this->get_val( $value['z'] );

		if ( $x === $this->default_xy && $y === $this->default_xy && $z === $this->default_origin ) {
			return null;
		}

		return sprintf( '%s %s %s', $x, $y, $z );
	}
}
