<?php

namespace Elementor\Modules\AtomicWidgets\PropsResolver\Transformers\Styles;

use Elementor\Modules\AtomicWidgets\PropsResolver\Transformer_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Background_Image_Overlay_Transformer extends Transformer_Base {
	public function transform( $value, $key ) {
		$url = $value['url'] ?? '';
		$repeat = $value['repeat'] ?? '';
		$pos_x = $value['position_x'] ?? '';
		$pos_y = $value['position_y'] ?? '';
		$attachment = $value['attachment'] ?? '';

		return trim( "url(\"$url\") $repeat $pos_x $pos_y $attachment" );
	}
}
