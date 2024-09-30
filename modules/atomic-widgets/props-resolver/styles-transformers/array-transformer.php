<?php

namespace Elementor\Modules\AtomicWidgets\PropsResolver\StylesTransformers;

use Elementor\Modules\AtomicWidgets\PropsResolver\Transformer_Base;
use Elementor\Modules\AtomicWidgets\PropTypes\Array_Prop_Type;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Array_Transformer extends Transformer_Base {
	public function get_type(): string {
		return Array_Prop_Type::get_key();
	}

	public function transform( $value ) {
		$array = $value['array'];
		$delimiter = $value['delimiter'] ?? ' ';

		return implode( (string) $delimiter, $array );
	}
}
