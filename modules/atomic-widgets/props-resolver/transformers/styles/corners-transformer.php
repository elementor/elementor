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
			->map_with_keys( fn( $dimension, $corner ) => [
				$this->convertToStyleAttribute( $key, $corner ) => $dimension
			] )
			->all();

		return Multi_Props::generate( $dimensions );
	}

	private function convertToStyleAttribute( $key, $corner ): string {
		$corner_dash_case = strtolower( preg_replace( '/([a-z])([A-Z])/', '$1-$2', $corner ) );
		switch( $key ) {
			case 'border-radius':
				return 'border-' . $corner_dash_case . '-radius';
			default:
				// currently no known CSS attributes that use corner values - so this is just a future-proof fallback
				return $key . '-' . $corner_dash_case;
		}
	}
}
