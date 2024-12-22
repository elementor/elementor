<?php

namespace Elementor\Modules\AtomicWidgets\PropsResolver\Transformers\Styles;

use Elementor\Core\Utils\Collection;
use Elementor\Modules\AtomicWidgets\PropsResolver\Transformer_Base;
use Elementor\Modules\AtomicWidgets\PropsResolver\Multi_Props;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Gap_Transformer extends Transformer_Base {
	public function transform( $value, $key ) {
		$dimensions = Collection::make( $value )
			->only( [ 'row', 'column' ] )
			->filter()
			->map_with_keys( fn( $dimension, $side ) => [ $key . '-' . $side => $dimension ] )
			->all();

		return Multi_Props::generate( $dimensions );
	}
}
