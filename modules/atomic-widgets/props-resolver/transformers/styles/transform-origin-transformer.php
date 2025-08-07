<?php

namespace Elementor\Modules\AtomicWidgets\PropsResolver\Transformers\Styles;

use Elementor\Modules\AtomicWidgets\PropsResolver\Props_Resolver_Context;
use Elementor\Modules\AtomicWidgets\PropsResolver\Transformer_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Transform_Origin_Transformer extends Transformer_Base {
	private function get_val( $val ) {
		$default_origin = '0px';
		return $val ?? $default_origin;
	}

	public function transform( $value, Props_Resolver_Context $context ): string {
		return sprintf( '%s %s %s', $this->get_val( $value['x'] ), $this->get_val( $value['y'] ), $this->get_val( $value['z'] ) );
	}
}
