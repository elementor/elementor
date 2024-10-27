<?php

namespace Elementor\Modules\AtomicWidgets\PropsResolver\Transformers\Styles;

use Elementor\Core\Utils\Collection;
use Elementor\Modules\AtomicWidgets\PropsResolver\Multi_Props;
use Elementor\Modules\AtomicWidgets\PropsResolver\Transformer_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Corners_Transformer extends Transformer_Base {
	public function transform( $value, $key ) {
		$dimensions = Collection::make( $value )
			->only( [ 'topLeft', 'topRight', 'bottomRight', 'bottomLeft' ] )
			->filter()
			->map_with_keys( fn( $dimension, $side ) => [ $key . '-' . $side => $dimension ] )
			->all();

		return Multi_Props::generate( $dimensions );
	}
}
