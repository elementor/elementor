<?php

namespace Elementor\Modules\AtomicWidgets\PropsResolver\Transformers\Styles;

use Elementor\Modules\AtomicWidgets\PropsResolver\Transformer_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Background_Transformer extends Transformer_Base {
	public function transform( $value, $key ) {
		$overlay = $value['background-overlay'] ?? '';
		$color = $value['color'] ?? '';

		return trim( "$overlay $color" );
	}
}
