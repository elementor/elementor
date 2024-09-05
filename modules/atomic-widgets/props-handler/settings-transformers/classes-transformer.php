<?php

namespace Elementor\Modules\AtomicWidgets\PropsResolver\SettingsTransformers;

use Elementor\Modules\AtomicWidgets\PropsResolver\Transformer_Base;
use Elementor\Modules\AtomicWidgets\PropTypes\Classes_Prop_Type;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Classes_Transformer extends Transformer_Base {
	public function get_type(): string {
		return Classes_Prop_Type::get_key();
	}

	public function transform( $value ) {
		if ( ! is_array( $value ) ) {
			return '';
		}

		return implode( ' ', array_filter( $value ) );
	}
}
