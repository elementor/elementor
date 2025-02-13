<?php
namespace Elementor\Modules\AtomicWidgets\PropsResolver\Transformers\Styles;

use Elementor\Modules\AtomicWidgets\PropsResolver\Transformer_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Background_Image_Overlay_Size_Scale_Transformer extends Transformer_Base {
	public function transform( $value, $key ): string {
		$default_custom_size = 'auto';
		$width  = $value['width'] ?? $default_custom_size;
		$height = $value['height'] ?? $default_custom_size;

		return $width . ' ' . $height;
	}
}
