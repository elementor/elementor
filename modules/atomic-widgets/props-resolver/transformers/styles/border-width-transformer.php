<?php

namespace Elementor\Modules\AtomicWidgets\PropsResolver\Transformers\Styles;

use Elementor\Core\Utils\Collection;
use Elementor\Modules\AtomicWidgets\PropsResolver\Multi_Props;
use Elementor\Modules\AtomicWidgets\PropsResolver\Transformer_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Border_Width_Transformer extends Transformer_Base {
	public function transform( $value, $key ) {
		$sides = Collection::make( $value )
			->only( [ 'top', 'right', 'bottom', 'left' ] )
			->filter()
			->map_with_keys( fn( $side, $side_key ) => [ 'border-' . $side_key . '-width' => $side ] )
			->all();

		return Multi_Props::generate( $sides );
	}
}
