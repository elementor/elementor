<?php

namespace Elementor\Modules\AtomicWidgets\PropsResolver\SettingsTransformers;

use Elementor\Modules\AtomicWidgets\PropsResolver\Transformer_Base;
use Elementor\Modules\AtomicWidgets\PropTypes\Size_Prop_Type;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Size_Transformer extends Transformer_Base {
	public function get_type(): string {
		return Size_Prop_Type::get_key();
	}

	public function transform( $value ) {
		$size = (int) $value['size'];
		$unit = $value['unit'];

		return $size . $unit;
	}
}
