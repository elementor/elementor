<?php

namespace Elementor\Modules\AtomicWidgets\PropsResolver\Transformers\Styles;

use Elementor\Core\Utils\Collection;
use Elementor\Modules\AtomicWidgets\PropsResolver\Multi_Props;
use Elementor\Modules\AtomicWidgets\PropsResolver\Transformer_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Background_Overlay_Transformer extends Transformer_Base {
	public function transform( $value, $key ) {
		$color = $value['color'];

		return "linear-gradient($color, $color)";

//		$bgimages = Collection::make( $value )
//			->only( [ 'color' ] )
//			->filter()
//			->map_with_keys( fn( $bgimage ) => [ 'background-image' => "linear-gradient($bgimage, $bgimage)" ] )
//			->all();
//
//		var_dump(Multi_Props::generate( $bgimages ));
//
//		return Multi_Props::generate( $bgimages );
	}
}
