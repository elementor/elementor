<?php

namespace Elementor\Modules\AtomicWidgets\PropsResolver\Transformers\Styles;

use Elementor\Core\Utils\Collection;
use Elementor\Modules\AtomicWidgets\PropsResolver\Props_Resolver_Context;
use Elementor\Modules\AtomicWidgets\PropsResolver\Transformer_Base;
use Elementor\Modules\AtomicWidgets\PropsResolver\Multi_Props;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Dimensions_Transformer extends Transformer_Base {
	public function transform( $value, Props_Resolver_Context $context ) {
		$dimensions = Collection::make( $value )
			->only( [ 'top', 'right', 'bottom', 'left' ] )
			->filter()
			->map_with_keys( fn( $dimension, $side ) => [ $context->get_key() . '-' . $side => $dimension ] )
			->all();

		return Multi_Props::generate( $dimensions );
	}
}
