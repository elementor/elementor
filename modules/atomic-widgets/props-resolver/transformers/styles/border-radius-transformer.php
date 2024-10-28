<?php

namespace Elementor\Modules\AtomicWidgets\PropsResolver\Transformers\Styles;

use Elementor\Core\Utils\Collection;
use Elementor\Modules\AtomicWidgets\PropsResolver\Multi_Props;
use Elementor\Modules\AtomicWidgets\PropsResolver\Transformer_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Border_Radius_Transformer extends Transformer_Base {
	public function transform( $value, $key ) {
		$dimensions = Collection::make( $value )
			->only( [ 'top-left', 'top-right', 'bottom-right', 'bottom-left' ] )
			->filter()
			->map_with_keys( fn( $dimension, $corner ) => [ 'border-' . $corner . '-radius' => $dimension ] )
			->all();

		return Multi_Props::generate( $dimensions );
	}
}
