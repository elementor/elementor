<?php

namespace Elementor\Modules\AtomicWidgets\PropsResolver\Transformers\Styles;

use Elementor\Modules\AtomicWidgets\PropsResolver\Props_Resolver_Context;
use Elementor\Modules\AtomicWidgets\PropsResolver\Transformer_Base;
use Elementor\Modules\AtomicWidgets\Styles\Grid_Track_Renderer;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Grid_Track_Size_Transformer extends Transformer_Base {
	public function transform( $value, Props_Resolver_Context $context ) {
		$size = $value['size'];
		$unit = $value['unit'];

		if ( 'custom' === $unit ) {
			return $size;
		}

		if ( 'fr' === $unit ) {
			return Grid_Track_Renderer::format_repeat( (int) $size );
		}

		return +$size . $unit;
	}
}
