<?php

namespace Elementor\Modules\AtomicWidgets\PropsResolver\Transformers\Styles;

use Elementor\Modules\AtomicWidgets\PropsResolver\Transformer_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Stroke_Transformer extends Transformer_Base {
	public function transform( $value, $key ) {
		$color = $value['color'];
		$stroke = [
			'color' => $value['color'],
			'width' => $value['width'],
		];

		return $value['width']['value']['size'] . $value['width']['value']['unit'] . ' ' . $value['color'];
	}
}
