<?php

namespace Elementor\Modules\AtomicWidgets\PropsResolver\SettingsTransformers;

use Elementor\Modules\AtomicWidgets\PropsResolver\Transformer_Base;
use Elementor\Modules\AtomicWidgets\PropTypes\Array_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Linked_Dimensions_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Size_Prop_Type;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Linked_Dimensions_Transformer extends Transformer_Base {
	public function get_type(): string {
		return Linked_Dimensions_Prop_Type::get_key();
	}

	public function transform( $value ) {
		$top = $value['top'] ?? 'unset';
		$left = $value['left'] ?? 'unset';
		$bottom = $value['bottom'] ?? 'unset';
		$right = $value['right'] ?? 'unset';

		return $top . ' ' . $left . ' ' . $bottom . ' ' . $right;
	}
}
