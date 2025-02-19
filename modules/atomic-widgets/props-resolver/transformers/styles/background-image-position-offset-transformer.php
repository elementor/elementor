<?php
namespace Elementor\Modules\AtomicWidgets\PropsResolver\Transformers\Styles;

use Elementor\Modules\AtomicWidgets\PropsResolver\Transformer_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}


class Background_Image_Position_Offset_Transformer extends Transformer_Base {
	public function transform( $value, $key ): string {
		return ( $value['x'] ?? '0px' ) . ' ' . ( $value['y'] ?? '0px' );
	}
}
