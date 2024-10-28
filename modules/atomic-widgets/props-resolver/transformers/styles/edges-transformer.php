<?php

namespace Elementor\Modules\AtomicWidgets\PropsResolver\Transformers\Styles;

use Elementor\Core\Utils\Collection;
use Elementor\Modules\AtomicWidgets\PropsResolver\Multi_Props;
use Elementor\Modules\AtomicWidgets\PropsResolver\Transformer_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Edges_Transformer extends Transformer_Base {

	public function transform( $value, $key ) {
		$dimensions = Collection::make( $value )
			->only( [ 'top', 'right', 'bottom', 'left' ] )
			->filter()
			->map_with_keys( fn( $dimension, $side ) => [
				$this->convertToStyleAttribute( $key, $side ) => $dimension
			] )
			->all();

		return Multi_Props::generate( $dimensions );
	}

	private function convertToStyleAttribute( $key, $side ): string {
		switch( $key ) {
			case 'border-width':
				return 'border-' . $side . '-width';
			default:
				// though currently we use linked-dimensions for margin/padding, there are other CSS attributes that can potentially use edge values such as scroll-padding-top/bottom/...
				return $key . '-' . $side;
		}
	}
}
