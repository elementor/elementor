<?php

namespace Elementor\Modules\AtomicWidgets\PropsResolver\Transformers\Styles;

use Elementor\Modules\AtomicWidgets\PropsResolver\Props_Resolver_Context;
use Elementor\Modules\AtomicWidgets\PropsResolver\Transformer_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Transform_Origin_Transformer extends Transformer_Base {
	public function transform( $value, Props_Resolver_Context $context ): string {
		$default_origin = '0px';

		return sprintf( '%s %s %s', $value['x'] ?? $default_origin, $value['y'] ?? $default_origin, $value['z'] ?? $default_origin );
	}
}
