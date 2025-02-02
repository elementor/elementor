<?php

namespace Elementor\Modules\AtomicWidgets\PropsResolver\Transformers\Styles;

use Elementor\Core\Utils\Collection;
use Elementor\Modules\AtomicWidgets\PropsResolver\Transformer_Base;
use Elementor\Modules\AtomicWidgets\PropsResolver\Multi_Props;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Layout_Direction_Transformer extends Transformer_Base {
	public function transform( $value, $key ): array {
		$gap = Collection::make( $value )
			->only( [ 'row', 'column' ] )
			->filter()
			->map_with_keys( fn( $gap, $gap_direction ) => [ $gap_direction . '-' . $key => $gap ] )
			->all();

		return Multi_Props::generate( $gap );
	}
}
